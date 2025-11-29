import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
  OneToOne,
  Index,
} from 'typeorm';
import { DelegateEntity } from './delegate.entity';
import { DistrictEntity } from './district.entity';
import { SettingEntity } from './setting.entity';
import { PositionEntity } from './position.entity';
import { CastVoteEntity } from './cast-vote.entity';
import { BallotEntity } from './ballot.entity';
import { CandidateEntity } from './candidate.entity';
import { ElectionStatus } from '@domain/enums/index';

@Entity('elections')
@Unique(['name'])
export class ElectionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  desc1: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'date', nullable: true })
  date: Date;

  @Column({ name: 'start_time', type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ name: 'max_attendees', nullable: true })
  maxAttendees: number; // Note: Add CHECK constraint in migration: max_attendees > 0 OR max_attendees IS NULL

  @Column({
    type: 'enum',
    enum: ElectionStatus,
    default: ElectionStatus.SCHEDULED,
    name: 'election_status',
  })
  @Index()
  electionStatus: ElectionStatus;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  @Index()
  deletedAt: Date | null; // For soft delete

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /** One to many */
  @OneToMany(() => DelegateEntity, (member) => member.election)
  members: DelegateEntity[];

  @OneToOne(() => SettingEntity, (setting) => setting.election, {
    nullable: true,
  })
  setting: SettingEntity; // Reverse relationship (optional)

  @OneToMany(() => PositionEntity, (position) => position.election)
  positions: PositionEntity[];

  @OneToMany(() => CastVoteEntity, (castVote) => castVote.election)
  castVotes: CastVoteEntity[];

  @OneToMany(() => DistrictEntity, (district) => district.election)
  districts: DistrictEntity[];

  @OneToMany(() => BallotEntity, (ballot) => ballot.election)
  ballots: BallotEntity[];

  @OneToMany(() => CandidateEntity, (candidate) => candidate.election)
  candidates: CandidateEntity[];
}
