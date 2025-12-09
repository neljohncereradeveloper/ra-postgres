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
import { lowercaseTransformer } from '../../../../../shared/utils/typeorm-transformers.util';

@Entity('positions')
@Unique(['electionid', 'desc1'])
export class PositionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  electionid: number;

  @Column({ length: 255, transformer: lowercaseTransformer })
  desc1: string;

  @Column({ nullable: true })
  maxcandidates: number; // Note: Add CHECK constraint in migration: max_candidates > 0 OR max_candidates IS NULL

  @Column({ length: 100, nullable: true, transformer: lowercaseTransformer })
  termlimit: string;

  @Column({
    comment: 'username of the user who deleted the position',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  deletedby?: string;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deletedat: Date | null; // For soft delete

  @Column({
    comment: 'username of the user who created the position',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  createdby?: string;

  @CreateDateColumn()
  createdat: Date;

  @Column({
    comment: 'username of the user who updated the position',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  updatedby?: string;

  @UpdateDateColumn()
  updatedat: Date;

  /**
   * Relationships
   */
  @ManyToOne(() => ElectionEntity, (election) => election.positions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'electionid' })
  election: ElectionEntity;

  @OneToMany(() => CandidateEntity, (candidate) => candidate.position)
  candidates: CandidateEntity[];

  @OneToMany(() => CastVoteEntity, (castVote) => castVote.position)
  castVotes: CastVoteEntity[];
}
