import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
  JoinColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { ElectionEntity } from './election.entity';
import { CandidateEntity } from './candidate.entity';
import { CastVoteEntity } from './cast-vote.entity';

@Entity('districts')
@Unique(['election_id', 'desc1'])
export class DistrictEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'election_id' })
  @Index()
  electionId: number;

  @Column({ length: 255 })
  desc1: string;

  @Column({
    name: 'deleted_by',
    comment: 'username of the user who deleted the district',
    nullable: true,
  })
  deletedBy: string;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  @Index()
  deletedAt: Date | null; // For soft delete

  @Column({
    name: 'created_by',
    comment: 'username of the user who created the district',
    nullable: true,
  })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({
    name: 'updated_by',
    comment: 'username of the user who updated the district',
    nullable: true,
  })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * Relationships
   */
  @ManyToOne(() => ElectionEntity, (election) => election.districts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'election_id' })
  election: ElectionEntity;

  @OneToMany(() => CandidateEntity, (candidate) => candidate.district)
  candidates: CandidateEntity[];

  @OneToMany(() => CastVoteEntity, (castVote) => castVote.district)
  castVotes: CastVoteEntity[];
}
