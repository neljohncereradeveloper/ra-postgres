import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Unique,
  OneToOne,
  Index,
  OneToMany,
} from 'typeorm';
import { ElectionEntity } from './election.entity';
import { CandidateEntity } from './candidate.entity';
import { BallotEntity } from './ballot.entity';

@Entity('delegates')
@Unique(['account_id', 'election_id'])
@Unique(['election_id', 'control_number'])
export class DelegateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'election_id' })
  @Index()
  electionId: number;

  @Column({ length: 100 })
  branch: string;

  @Column({ name: 'account_id', length: 100 })
  accountId: string;

  @Column({ name: 'account_name', length: 255 })
  accountName: string;

  @Column({ nullable: true })
  age: number; // Note: Add CHECK constraint in migration: age >= 0 OR age IS NULL

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate?: Date;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ length: 50, nullable: true })
  tell?: string;

  @Column({ length: 50, nullable: true })
  cell?: string;

  @Column({ name: 'date_opened', type: 'date', nullable: true })
  dateOpened?: Date;

  @Column({ name: 'client_type', length: 100, nullable: true })
  clientType?: string;

  @Column({ name: 'loan_status', length: 100, nullable: true })
  loanStatus: string;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  balance: number;

  @Column({ name: 'mev_status', length: 100 })
  mevStatus: string;

  @Column({ name: 'has_voted', type: 'boolean', default: false })
  hasVoted: boolean;

  @Column({ name: 'control_number' })
  controlNumber: string;

  @Column({
    name: 'deleted_by',
    comment: 'username of the user who deleted the delegate',
    nullable: true,
  })
  deletedBy?: string;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;

  @Column({
    name: 'created_by',
    comment: 'username of the user who created the delegate',
    nullable: true,
  })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({
    name: 'updated_by',
    comment: 'username of the user who updated the delegate',
    nullable: true,
  })
  updatedBy?: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * Relationships
   *
   */
  @ManyToOne(() => ElectionEntity, (election) => election.members, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'election_id' })
  election: ElectionEntity;

  @OneToMany(() => BallotEntity, (ballot) => ballot.delegate)
  ballots: BallotEntity[];

  @OneToOne(() => CandidateEntity, (candidate) => candidate.delegate)
  candidate: CandidateEntity;
}
