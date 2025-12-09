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
import { lowercaseTransformer } from '../../../../../shared/utils/typeorm-transformers.util';

@Entity('districts')
@Unique(['electionid', 'desc1'])
export class DistrictEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  electionid: number;

  @Column({ length: 255, transformer: lowercaseTransformer })
  desc1: string;

  @Column({
    comment: 'username of the user who deleted the district',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  deletedby: string;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deletedat: Date | null; // For soft delete

  @Column({
    comment: 'username of the user who created the district',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  createdby: string;

  @CreateDateColumn()
  createdat: Date;

  @Column({
    comment: 'username of the user who updated the district',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  updatedby: string;

  @UpdateDateColumn()
  updatedat: Date;

  /**
   * Relationships
   */
  @ManyToOne(() => ElectionEntity, (election) => election.districts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'electionid' })
  election: ElectionEntity;

  @OneToMany(() => CandidateEntity, (candidate) => candidate.district)
  candidates: CandidateEntity[];

  @OneToMany(() => CastVoteEntity, (castVote) => castVote.district)
  castVotes: CastVoteEntity[];
}
