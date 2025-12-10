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

  @Column()
  @Index()
  election_id: number;

  @Column({ length: 255 })
  desc1: string;

  @Column({
    comment: 'username of the user who deleted the district',
    nullable: true,
  })
  deleted_by: string;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deleted_at: Date | null; // For soft delete

  @Column({
    comment: 'username of the user who created the district',
    nullable: true,
  })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({
    comment: 'username of the user who updated the district',
    nullable: true,
  })
  updated_by: string;

  @UpdateDateColumn()
  updated_at: Date;

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
  cast_votes: CastVoteEntity[];
}
