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
  'electionid',
  'ballotnumber',
  'candidateid',
  'positionid',
  'districtid',
])
@Index(['electionid', 'deletedat'])
@Index(['ballotnumber', 'electionid'])
export class CastVoteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  electionid: number;

  @Column({ length: 100 })
  @Index()
  ballotnumber: string;

  @Column({ length: 100 })
  precinct: string;

  @Column()
  @Index()
  candidateid: number;

  @Column()
  @Index()
  positionid: number;

  @Column()
  @Index()
  districtid: number;

  @Column({ type: 'timestamp' })
  @Index()
  datetimecast: string;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deletedat: string | null; // For soft delete

  @CreateDateColumn()
  createdat: string;

  @UpdateDateColumn()
  updatedat: string;

  /**
   * Relationships
   *
   */
  @ManyToOne(() => ElectionEntity, (election) => election.castVotes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'electionid' })
  election: ElectionEntity;

  @ManyToOne(() => CandidateEntity, (candidate) => candidate.castVotes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'candidateid' })
  candidate: CandidateEntity;

  @ManyToOne(() => PositionEntity, (position) => position.castVotes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'positionid' })
  position: PositionEntity;

  @ManyToOne(() => DistrictEntity, (district) => district.castVotes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'districtid' })
  district: DistrictEntity;
}
