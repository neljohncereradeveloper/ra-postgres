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
@Unique(['electionId', 'delegateId'])
@Unique(['electionId', 'displayName'])
export class CandidateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  electionId: number;

  @Column()
  @Index()
  delegateId: number;

  @Column()
  @Index()
  positionId: number;

  @Column()
  @Index()
  districtId: number;

  @Column({ length: 255 })
  displayName: string;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null; // For soft delete

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ElectionEntity, (election) => election.candidates, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'electionId' })
  election: ElectionEntity;

  @ManyToOne(() => PositionEntity, (position) => position.candidates, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'positionId' })
  position: PositionEntity;

  @ManyToOne(() => DistrictEntity, (district) => district.candidates, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'districtId' })
  district: DistrictEntity;

  @OneToOne(() => DelegateEntity, (delegate) => delegate.candidate, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'delegateId' })
  delegate: DelegateEntity;

  @OneToMany(() => CastVoteEntity, (castVote) => castVote.candidate)
  castVotes: CastVoteEntity[];
}
