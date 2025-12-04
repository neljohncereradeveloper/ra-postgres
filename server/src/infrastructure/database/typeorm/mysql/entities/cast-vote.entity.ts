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

  @Column({ name: 'election_id' })
  @Index()
  electionId: number;

  @Column({ name: 'ballot_number', length: 100 })
  @Index()
  ballotNumber: string;

  @Column({ length: 100 })
  precinct: string;

  @Column({ name: 'candidate_id' })
  @Index()
  candidateId: number;

  @Column({ name: 'position_id' })
  @Index()
  positionId: number;

  @Column({ name: 'district_id' })
  @Index()
  districtId: number;

  @Column({ name: 'date_time_cast', type: 'timestamp' })
  @Index()
  dateTimeCast: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  @Index()
  deletedAt: Date | null; // For soft delete

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * Relationships
   *
   */
  @ManyToOne(() => ElectionEntity, (election) => election.castVotes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'election_id' })
  election: ElectionEntity;

  @ManyToOne(() => CandidateEntity, (candidate) => candidate.castVotes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'candidate_id' })
  candidate: CandidateEntity;

  @ManyToOne(() => PositionEntity, (position) => position.castVotes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'position_id' })
  position: PositionEntity;

  @ManyToOne(() => DistrictEntity, (district) => district.castVotes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'district_id' })
  district: DistrictEntity;
}
