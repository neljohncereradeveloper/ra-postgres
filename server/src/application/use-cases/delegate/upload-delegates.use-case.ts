import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@domain/ports/transaction-port';
import { DelegateRepository } from '@domains/repositories/delegate.repository';
import { Delegate } from '@domain/models/delegate.model';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { ActivityLog } from '@domain/models/activitylog.model';
import { UploadedFileInput } from '@domains/repositories/file.repository';
import { ExcelParserPort } from '@domain/ports/excel-parser.port';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { BallotRepository } from '@domains/repositories/ballot.repository';
import { UUIDGeneratorPort } from '@domain/ports/uuid-generator.port';
import { DELEGATE_ACTIONS } from '@domain/constants/delegate/delegate-actions.constants';
import { getPHDateTime } from '@domain/utils/format-ph-time';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@domains/exceptions/index';

const schema = {
  branch: { prop: 'branch', type: String },
  accountid: { prop: 'accountid', type: String },
  name: { prop: 'name', type: String },
  dateopened: { prop: 'dateopened', type: Date },
  clienttype: { prop: 'clienttype', type: String },
  balance: { prop: 'balance', type: String },
  address: { prop: 'address', type: String },
  tell: { prop: 'tell', type: String },
  cell: { prop: 'cell', type: String },
  mevstatus: { prop: 'mevstatus', type: String },
  age: { prop: 'age', type: Number },
  loanstatus: { prop: 'loanstatus', type: String },
  birthdate: { prop: 'birthdate', type: Date },
  controlnumber: { prop: 'controlnumber', type: String },
};

@Injectable()
export class UploadDelegatesUseCase {
  private readonly logger = new Logger('UploadDelegatesFileUseCase');

  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.EXCELPARSEPORT)
    private readonly excelParserPort: ExcelParserPort,
    @Inject(REPOSITORY_TOKENS.DELEGATE)
    private readonly delegateRepository: DelegateRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.BALLOT)
    private readonly ballotRepository: BallotRepository,
    @Inject(REPOSITORY_TOKENS.UUIDGENERATORPORT)
    private readonly uuidGeneratorPort: UUIDGeneratorPort,
  ) {}

  /**
   * Processes the uploaded Excel file and inserts delegates into the database.
   *
   * @param file - The uploaded file
   * @param username - The username of the authenticated user performing the upload
   */
  async execute(file: UploadedFileInput, username: string) {
    return this.transactionHelper.executeTransaction(
      DELEGATE_ACTIONS.UPLOAD_DELEGATES,
      async (manager) => {
        // Validate the file type, extension, and size
        this.validateFile(file);
        const rows: any = await this.excelParserPort.parse(file.buffer, schema);

        const activeElection =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new BadRequestException('No Active election');
        }
        const election = await this.electionRepository.findById(
          activeElection.electionid,
          manager,
        );
        if (!election) {
          throw new NotFoundException(
            `Election with ID ${activeElection.electionid} not found.`,
          );
        }

        // Can only upload delegates if election is scheduled
        election.validateForUpdate();

        if (rows.rows.length === 0 || rows.rows.length < 0) {
          throw new BadRequestException('Empty sheet.');
        }

        this.logger.debug(
          `Processing ${rows.rows.length} rows from uploaded file.`,
        );

        // Log the processing
        const logProcessing = ActivityLog.create({
          action: DELEGATE_ACTIONS.UPLOAD_DELEGATES,
          entity: DATABASE_CONSTANTS.MODELNAME_DELEGATE,
          details: JSON.stringify({
            message: `Processing ${rows.rows.length} rows from uploaded file.`,
            election: election.name,
            uploadProcessAt: getPHDateTime(),
            uploadedBy: username,
          }),
          username,
        });
        await this.activityLogRepository.create(logProcessing, manager);

        for (let index = 0; index < rows.rows.length; index++) {
          const row = rows.rows[index];
          // Create the delegate
          const delegate = new Delegate({
            branch: row.branch,
            electionid: election?.id,
            accountid: row.accountid,
            accountname: row.name,
            age: row.age,
            balance: row.balance,
            loanstatus: row.loanstatus,
            mevstatus: row.mevstatus,
            clienttype: row.clienttype,
            address: row.address,
            tell: row.tell,
            cell: row.cell,
            dateopened: row.dateopened,
            birthdate: row.birthdate,
            controlnumber: row.controlnumber,
          });

          const delegateResult = await this.delegateRepository.create(
            delegate,
            manager,
          );

          if (!delegateResult) {
            throw new SomethinWentWrongException('Delegate creation failed');
          }

          const ballot = await this.ballotRepository.issueBallot(
            this.uuidGeneratorPort.generateUUID(),
            delegateResult.id,
            election.id,
            manager,
          );

          if (!ballot) {
            throw new SomethinWentWrongException('Ballot creation failed');
          }
        }

        // Log the finished
        const logFinished = ActivityLog.create({
          action: DELEGATE_ACTIONS.UPLOAD_DELEGATES,
          entity: DATABASE_CONSTANTS.MODELNAME_DELEGATE,
          details: JSON.stringify({
            message: `Uploading ${rows.rows.length} delegates finished.`,
            election: election.name,
            uploadFinishedAt: getPHDateTime(),
            uploadedBy: username,
          }),
          username,
        });
        await this.activityLogRepository.create(logFinished, manager);

        return {
          message: `Successfully uploaded ${rows.rows.length} delegates.`,
          success: true,
        };
      },
    );
  }

  private validateFile(file: UploadedFileInput): void {
    if (!file) {
      throw new BadRequestException('No file provided.');
    }

    // Validate file type
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only Excel files are allowed.',
      );
    }

    // Validate file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        'File is too large. Maximum allowed size is 5MB.',
      );
    }

    // Validate file extension (optional but recommended)
    const allowedExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.originalname.slice(
      file.originalname.lastIndexOf('.'),
    );
    if (!allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        'Invalid file extension. Only .xlsx and .xls are allowed.',
      );
    }
  }
}
