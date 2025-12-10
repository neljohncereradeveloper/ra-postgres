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
import { ActiveElectionEntity } from './active-election.entity';
import { PositionEntity } from './position.entity';
import { CastVoteEntity } from './cast-vote.entity';
import { BallotEntity } from './ballot.entity';
import { CandidateEntity } from './candidate.entity';
import { ElectionStatus } from '../../../../../domain/enums/election/election-status.enum';

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

  @Column({ type: 'timestamp', nullable: true })
  start_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_time: Date;

  @Column({ nullable: true })
  max_attendees: number; // Note: Add CHECK constraint in migration: max_attendees > 0 OR max_attendees IS NULL

  @Column({
    type: 'enum',
    enum: ElectionStatus,
    default: ElectionStatus.SCHEDULED,
  })
  @Index()
  election_status: ElectionStatus;

  @Column({
    comment: 'username of the user who deleted the election',
    nullable: true,
  })
  deleted_by?: string;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deleted_at: Date | null; // For soft delete

  @Column({
    comment: 'username of the user who created the election',
    nullable: true,
  })
  created_by?: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({
    comment: 'username of the user who updated the election',
    nullable: true,
  })
  updated_by?: string;

  @UpdateDateColumn()
  updated_at: Date;

  /** One to many */
  @OneToMany(() => DelegateEntity, (member) => member.election)
  members: DelegateEntity[];

  @OneToOne(
    () => ActiveElectionEntity,
    (activeElection) => activeElection.election,
    {
      nullable: true,
    },
  )
  active_election: ActiveElectionEntity; // Reverse relationship (optional)

  @OneToMany(() => PositionEntity, (position) => position.election)
  positions: PositionEntity[];

  @OneToMany(() => CastVoteEntity, (cast_vote) => cast_vote.election)
  cast_votes: CastVoteEntity[];

  @OneToMany(() => DistrictEntity, (district) => district.election)
  districts: DistrictEntity[];

  @OneToMany(() => BallotEntity, (ballot) => ballot.election)
  ballots: BallotEntity[];

  @OneToMany(() => CandidateEntity, (candidate) => candidate.election)
  candidates: CandidateEntity[];
}
