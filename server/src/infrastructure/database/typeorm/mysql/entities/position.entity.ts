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
@Unique(['election_id', 'desc1'])
export class PositionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'election_id' })
  @Index()
  electionId: number;

  @Column({ length: 255 })
  desc1: string;

  @Column({ name: 'max_candidates', nullable: true })
  maxCandidates: number; // Note: Add CHECK constraint in migration: max_candidates > 0 OR max_candidates IS NULL

  @Column({ name: 'term_limit', length: 100, nullable: true })
  termLimit: string;

  @Column({
    name: 'deleted_by',
    comment: 'username of the user who deleted the position',
    nullable: true,
  })
  deletedBy?: string;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  @Index()
  deletedAt: Date | null; // For soft delete

  @Column({
    name: 'created_by',
    comment: 'username of the user who created the position',
    nullable: true,
  })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({
    name: 'updated_by',
    comment: 'username of the user who updated the position',
    nullable: true,
  })
  updatedBy?: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * Relationships
   */
  @ManyToOne(() => ElectionEntity, (election) => election.positions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'election_id' })
  election: ElectionEntity;

  @OneToMany(() => CandidateEntity, (candidate) => candidate.position)
  candidates: CandidateEntity[];

  @OneToMany(() => CastVoteEntity, (castVote) => castVote.position)
  castVotes: CastVoteEntity[];
}
