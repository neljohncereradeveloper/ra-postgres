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
import { lowercaseTransformer } from '../../../../../shared/utils/typeorm-transformers.util';

@Entity('delegates')
@Unique(['accountid', 'electionid'])
@Unique(['electionid', 'controlnumber'])
export class DelegateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  electionid: number;

  @Column({ length: 100, transformer: lowercaseTransformer })
  branch: string;

  @Column({ length: 100, transformer: lowercaseTransformer })
  accountid: string;

  @Column({ length: 255, transformer: lowercaseTransformer })
  accountname: string;

  @Column({ nullable: true })
  age: number; // Note: Add CHECK constraint in migration: age >= 0 OR age IS NULL

  @Column({ type: 'date', nullable: true })
  birthdate?: Date;

  @Column({ type: 'text', nullable: true, transformer: lowercaseTransformer })
  address?: string;

  @Column({ length: 50, nullable: true, transformer: lowercaseTransformer })
  tell?: string;

  @Column({ length: 50, nullable: true, transformer: lowercaseTransformer })
  cell?: string;

  @Column({ type: 'date', nullable: true })
  dateopened?: Date;

  @Column({ length: 100, nullable: true, transformer: lowercaseTransformer })
  clienttype?: string;

  @Column({ length: 100, nullable: true, transformer: lowercaseTransformer })
  loanstatus: string;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  balance: number;

  @Column({ length: 100, transformer: lowercaseTransformer })
  mevstatus: string;

  @Column({ type: 'boolean', default: false })
  hasvoted: boolean;

  @Column({ transformer: lowercaseTransformer })
  controlnumber: string;

  @Column({
    comment: 'username of the user who deleted the delegate',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  deletedby?: string;

  @DeleteDateColumn({ nullable: true })
  deletedat?: Date | null;

  @Column({
    comment: 'username of the user who created the delegate',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  createdby?: string;

  @CreateDateColumn()
  createdat: Date;

  @Column({
    comment: 'username of the user who updated the delegate',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  updatedby?: string;

  @UpdateDateColumn()
  updatedat: Date;

  /**
   * Relationships
   *
   */
  @ManyToOne(() => ElectionEntity, (election) => election.members, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'electionid' })
  election: ElectionEntity;

  @OneToMany(() => BallotEntity, (ballot) => ballot.delegate)
  ballots: BallotEntity[];

  @OneToOne(() => CandidateEntity, (candidate) => candidate.delegate)
  candidate: CandidateEntity;
}
