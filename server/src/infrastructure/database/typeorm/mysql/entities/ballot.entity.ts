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

@Entity('ballots')
@Unique(['ballot_number', 'election_id'])
export class BallotEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  @Index()
  ballot_number: string;

  @Column({ nullable: true })
  @Index()
  delegate_id: number;

  @Column()
  @Index()
  election_id: number;

  @Column({
    type: 'enum',
    enum: BallotStatus,
    default: BallotStatus.PENDING,
  })
  @Index()
  ballot_status: BallotStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

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
