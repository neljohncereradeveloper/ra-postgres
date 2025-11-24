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
  'electionId',
  'ballotNumber',
  'candidateId',
  'positionId',
  'districtId',
])
@Index(['electionId', 'deletedAt'])
@Index(['ballotNumber', 'electionId'])
export class CastVoteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  electionId: number;

  @Column({ length: 100 })
  @Index()
  ballotNumber: string;

  @Column({ length: 100 })
  precinct: string;

  @Column()
  @Index()
  candidateId: number;

  @Column()
  @Index()
  positionId: number;

  @Column()
  @Index()
  districtId: number;

  @Column({ type: 'timestamp' })
  @Index()
  dateTimeCast: Date;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deletedAt: Date | null; // For soft delete

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ElectionEntity, (election) => election.castVotes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'electionId' })
  election: ElectionEntity;

  @ManyToOne(() => CandidateEntity, (candidate) => candidate.castVotes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'candidateId' })
  candidate: CandidateEntity;

  @ManyToOne(() => PositionEntity, (position) => position.castVotes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'positionId' })
  position: PositionEntity;

  @ManyToOne(() => DistrictEntity, (district) => district.castVotes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'districtId' })
  district: DistrictEntity;
}
