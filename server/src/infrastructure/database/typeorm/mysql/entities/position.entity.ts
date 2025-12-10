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

  @Column()
  @Index()
  election_id: number;

  @Column({ length: 255 })
  desc1: string;

  @Column({ nullable: true })
  max_candidates: number; // Note: Add CHECK constraint in migration: max_candidates > 0 OR max_candidates IS NULL

  @Column({ length: 100, nullable: true })
  term_limit: string;

  @Column({
    comment: 'username of the user who deleted the position',
    nullable: true,
  })
  deleted_by?: string;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deleted_at: Date | null; // For soft delete

  @Column({
    comment: 'username of the user who created the position',
    nullable: true,
  })
  created_by?: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({
    comment: 'username of the user who updated the position',
    nullable: true,
  })
  updated_by?: string;

  @UpdateDateColumn()
  updated_at: Date;

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

  @OneToMany(() => CastVoteEntity, (cast_vote) => cast_vote.position)
  cast_votes: CastVoteEntity[];
}
