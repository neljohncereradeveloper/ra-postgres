import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
  OneToOne,
  Index,
} from 'typeorm';
import { DelegateEntity } from './delegate.entity';
import { DistrictEntity } from './district.entity';
import { ActiveElectionEntity } from './active-election.entity';
import { PositionEntity } from './position.entity';
import { CastVoteEntity } from './cast-vote.entity';
import { BallotEntity } from './ballot.entity';
import { CandidateEntity } from './candidate.entity';
import { ElectionStatus } from '../../../../../domain/enums/election/election-status.enum';
import { lowercaseTransformer } from '../../../../../shared/utils/typeorm-transformers.util';

@Entity('elections')
@Unique(['name'])
export class ElectionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, transformer: lowercaseTransformer })
  name: string;

  @Column({ type: 'text', nullable: true, transformer: lowercaseTransformer })
  desc1: string;

  @Column({ type: 'text', transformer: lowercaseTransformer })
  address: string;

  @Column({ type: 'date', nullable: true })
  date: Date;

  @Column({ type: 'timestamp', nullable: true })
  starttime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endtime: Date;

  @Column({ nullable: true })
  maxattendees: number; // Note: Add CHECK constraint in migration: max_attendees > 0 OR max_attendees IS NULL

  @Column({
    type: 'enum',
    enum: ElectionStatus,
    default: ElectionStatus.SCHEDULED,
  })
  @Index()
  electionstatus: ElectionStatus;

  @Column({
    comment: 'username of the user who deleted the election',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  deletedby?: string;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deletedat: Date | null; // For soft delete

  @Column({
    comment: 'username of the user who created the election',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  createdby?: string;

  @CreateDateColumn()
  createdat: Date;

  @Column({
    comment: 'username of the user who updated the election',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  updatedby?: string;

  @UpdateDateColumn()
  updatedat: Date;

  /** One to many */
  @OneToMany(() => DelegateEntity, (member) => member.election)
  members: DelegateEntity[];

  @OneToOne(
    () => ActiveElectionEntity,
    (activeElection) => activeElection.election,
    {
      nullable: true,
    },
  )
  activeElection: ActiveElectionEntity; // Reverse relationship (optional)

  @OneToMany(() => PositionEntity, (position) => position.election)
  positions: PositionEntity[];

  @OneToMany(() => CastVoteEntity, (castVote) => castVote.election)
  castVotes: CastVoteEntity[];

  @OneToMany(() => DistrictEntity, (district) => district.election)
  districts: DistrictEntity[];

  @OneToMany(() => BallotEntity, (ballot) => ballot.election)
  ballots: BallotEntity[];

  @OneToMany(() => CandidateEntity, (candidate) => candidate.election)
  candidates: CandidateEntity[];
}
