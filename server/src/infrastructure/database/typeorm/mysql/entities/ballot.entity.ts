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
import { BallotStatus } from '@domain/enums/index';

@Entity('ballots')
@Unique(['ballot_number', 'election_id'])
export class BallotEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ballot_number', length: 100 })
  @Index()
  ballotNumber: string;

  @Column({ name: 'delegate_id', nullable: true })
  @Index()
  delegateId: number;

  @Column({ name: 'election_id' })
  @Index()
  electionId: number;

  @Column({
    type: 'enum',
    enum: BallotStatus,
    default: BallotStatus.PENDING,
    name: 'ballot_status',
  })
  @Index()
  ballotStatus: BallotStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ElectionEntity, (election) => election.ballots, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'election_id' })
  election: ElectionEntity;

  @ManyToOne(() => DelegateEntity, (delegate) => delegate.ballots, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'delegate_id' })
  delegate: DelegateEntity;
}
