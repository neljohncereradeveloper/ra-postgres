import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ElectionEntity } from './election.entity';
import { CandidateEntity } from './candidate.entity';
import { CastVoteEntity } from './cast-vote.entity';

@Entity('positions')
@Unique(['electionId', 'desc1'])
export class PositionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  electionId: number;

  @Column({ length: 255 })
  desc1: string;

  @Column({ nullable: true })
  maxCandidates: number; // Note: Add CHECK constraint in migration: maxCandidates > 0 OR maxCandidates IS NULL

  @Column({ length: 100, nullable: true })
  termLimit: string;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deletedAt: Date | null; // For soft delete

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ElectionEntity, (election) => election.positions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'electionId' })
  election: ElectionEntity;

  @OneToMany(() => CandidateEntity, (candidate) => candidate.position)
  candidates: CandidateEntity[];

  @OneToMany(() => CastVoteEntity, (castVote) => castVote.position)
  castVotes: CastVoteEntity[];
}
