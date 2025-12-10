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

  @Column()
  @Index()
  election_id: number;

  @Column({ length: 100 })
  branch: string;

  @Column({ length: 100 })
  account_id: string;

  @Column({ length: 255 })
  account_name: string;

  @Column({ nullable: true })
  age: number; // Note: Add CHECK constraint in migration: age >= 0 OR age IS NULL

  @Column({ type: 'date', nullable: true })
  birth_date?: Date;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ length: 50, nullable: true })
  tell?: string;

  @Column({ length: 50, nullable: true })
  cell?: string;

  @Column({ type: 'date', nullable: true })
  date_opened?: Date;

  @Column({ length: 100, nullable: true })
  client_type?: string;

  @Column({ length: 100, nullable: true })
  loan_status: string;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  balance: number;

  @Column({ length: 100 })
  mev_status: string;

  @Column({ type: 'boolean', default: false })
  has_voted: boolean;

  @Column()
  control_number: string;

  @Column({
    comment: 'username of the user who deleted the delegate',
    nullable: true,
  })
  deleted_by?: string;

  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date | null;

  @Column({
    comment: 'username of the user who created the delegate',
    nullable: true,
  })
  created_by?: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({
    comment: 'username of the user who updated the delegate',
    nullable: true,
  })
  updated_by?: string;

  @UpdateDateColumn()
  updated_at: Date;

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
