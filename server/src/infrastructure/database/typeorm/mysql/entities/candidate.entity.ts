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
  OneToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { ElectionEntity } from './election.entity';
import { PositionEntity } from './position.entity';
import { DistrictEntity } from './district.entity';
import { DelegateEntity } from './delegate.entity';
import { CastVoteEntity } from './cast-vote.entity';

@Entity('candidates')
@Unique(['election_id', 'delegate_id'])
@Unique(['election_id', 'display_name'])
export class CandidateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'election_id' })
  @Index()
  electionId: number;

  @Column({ name: 'delegate_id' })
  @Index()
  delegateId: number;

  @Column({ name: 'position_id' })
  @Index()
  positionId: number;

  @Column({ name: 'district_id' })
  @Index()
  districtId: number;

  @Column({ name: 'display_name', length: 255 })
  displayName: string;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null; // For soft delete

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ElectionEntity, (election) => election.candidates, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'election_id' })
  election: ElectionEntity;

  @ManyToOne(() => PositionEntity, (position) => position.candidates, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'position_id' })
  position: PositionEntity;

  @ManyToOne(() => DistrictEntity, (district) => district.candidates, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'district_id' })
  district: DistrictEntity;

  @OneToOne(() => DelegateEntity, (delegate) => delegate.candidate, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'delegate_id' })
  delegate: DelegateEntity;

  @OneToMany(() => CastVoteEntity, (castVote) => castVote.candidate)
  castVotes: CastVoteEntity[];
}
