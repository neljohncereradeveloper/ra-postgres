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
@Unique(['accountId', 'electionId'])
@Unique(['electionId', 'controlNumber'])
export class DelegateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  electionId: number;

  @Column({ length: 100 })
  branch: string;

  @Column({ length: 100 })
  accountId: string;

  @Column({ length: 255 })
  accountName: string;

  @Column({ nullable: true })
  age: number; // Note: Add CHECK constraint in migration: age >= 0 OR age IS NULL

  @Column({ type: 'date', nullable: true })
  birthDate?: Date;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ length: 50, nullable: true })
  tell?: string;

  @Column({ length: 50, nullable: true })
  cell?: string;

  @Column({ type: 'date', nullable: true })
  dateOpened?: Date;

  @Column({ length: 100, nullable: true })
  clientType?: string;

  @Column({ length: 100, nullable: true })
  loanStatus: string;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  balance: number;

  @Column({ length: 100 })
  mevStatus: string;

  @Column({ type: 'boolean', default: false })
  hasVoted: boolean;

  @Column()
  controlNumber: string;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ElectionEntity, (election) => election.members, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'electionId' })
  election: ElectionEntity;

  @OneToMany(() => BallotEntity, (ballot) => ballot.delegate)
  ballots: BallotEntity[];

  @OneToOne(() => CandidateEntity, (candidate) => candidate.delegate)
  candidate: CandidateEntity;
}
