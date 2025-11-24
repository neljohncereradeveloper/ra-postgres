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
@Unique(['electionId', 'desc1'])
export class DistrictEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  electionId: number;

  @Column({ length: 255 })
  desc1: string;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deletedAt: Date | null; // For soft delete

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ElectionEntity, (election) => election.districts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'electionId' })
  election: ElectionEntity;

  @OneToMany(() => CandidateEntity, (candidate) => candidate.district)
  candidates: CandidateEntity[];

  @OneToMany(() => CastVoteEntity, (castVote) => castVote.district)
  castVotes: CastVoteEntity[];
}
