import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  JoinColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { ElectionEntity } from './election.entity';
import { DelegateEntity } from './delegate.entity';
import { BallotStatus } from '../../../../../domain/enums/ballot/ballot-status.enum';
import { lowercaseTransformer } from '../../../../../shared/utils/typeorm-transformers.util';

@Entity('ballots')
@Unique(['ballotnumber', 'electionid'])
export class BallotEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, transformer: lowercaseTransformer })
  @Index()
  ballotnumber: string;

  @Column({ nullable: true })
  @Index()
  delegateid: number;

  @Column()
  @Index()
  electionid: number;

  @Column({
    type: 'enum',
    enum: BallotStatus,
    default: BallotStatus.PENDING,
  })
  @Index()
  ballotstatus: BallotStatus;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;

  @ManyToOne(() => ElectionEntity, (election) => election.ballots, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'electionid' })
  election: ElectionEntity;

  @ManyToOne(() => DelegateEntity, (delegate) => delegate.ballots, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'delegateid' })
  delegate: DelegateEntity;
}
