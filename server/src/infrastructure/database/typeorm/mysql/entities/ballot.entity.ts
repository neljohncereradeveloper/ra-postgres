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

export enum BallotStatus {
  PENDING = 'pending',
  ISSUED = 'issued',
  CAST = 'cast',
  VOID = 'void',
}

@Entity('ballots')
@Unique(['ballotNumber', 'electionId'])
export class BallotEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  @Index()
  ballotNumber: string;

  @Column({ nullable: true })
  @Index()
  delegateId: number;

  @Column()
  @Index()
  electionId: number;

  @Column({
    type: 'enum',
    enum: BallotStatus,
    default: BallotStatus.PENDING,
  })
  @Index()
  status: BallotStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ElectionEntity, (election) => election.ballots, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'electionId' })
  election: ElectionEntity;

  @ManyToOne(() => DelegateEntity, (delegate) => delegate.ballots, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'delegateId' })
  delegate: DelegateEntity;
}
