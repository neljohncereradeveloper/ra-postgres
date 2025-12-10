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
  Index,
} from 'typeorm';
import { ElectionEntity } from './election.entity';
import { CandidateEntity } from './candidate.entity';
import { PositionEntity } from './position.entity';
import { DistrictEntity } from './district.entity';

@Entity('cast_votes')
@Unique([
  'election_id',
  'ballot_number',
  'candidate_id',
  'position_id',
  'district_id',
])
@Index(['election_id', 'deleted_at'])
@Index(['ballot_number', 'election_id'])
export class CastVoteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  election_id: number;

  @Column({ length: 100 })
  @Index()
  ballot_number: string;

  @Column({ length: 100 })
  precinct: string;

  @Column()
  @Index()
  candidate_id: number;

  @Column()
  @Index()
  position_id: number;

  @Column()
  @Index()
  district_id: number;

  @Column({ type: 'timestamp' })
  @Index()
  datetime_cast: string;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deleted_at: string | null; // For soft delete

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  /**
   * Relationships
   *
   */
  @ManyToOne(() => ElectionEntity, (election) => election.cast_votes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'election_id' })
  election: ElectionEntity;

  @ManyToOne(() => CandidateEntity, (candidate) => candidate.cast_votes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'candidate_id' })
  candidate: CandidateEntity;

  @ManyToOne(() => PositionEntity, (position) => position.cast_votes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'position_id' })
  position: PositionEntity;

  @ManyToOne(() => DistrictEntity, (district) => district.cast_votes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'district_id' })
  district: DistrictEntity;
}
