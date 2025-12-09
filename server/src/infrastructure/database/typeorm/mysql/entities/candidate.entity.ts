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
@Unique(['electionid', 'delegateid'])
@Unique(['electionid', 'displayname'])
export class CandidateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  electionid: number;

  @Column()
  @Index()
  delegateid: number;

  @Column()
  @Index()
  positionid: number;

  @Column()
  @Index()
  districtid: number;

  @Column({ length: 255 })
  displayname: string;

  @Column({
    comment: 'username of the user who deleted the candidate',
    nullable: true,
  })
  deletedby?: string;

  @DeleteDateColumn({ nullable: true })
  deletedat: Date | null; // For soft delete

  @Column({
    comment: 'username of the user who created the candidate',
    nullable: true,
  })
  createdby?: string;

  @CreateDateColumn()
  createdat: Date;

  @Column({
    comment: 'username of the user who updated the candidate',
    nullable: true,
  })
  updatedby?: string;

  @UpdateDateColumn()
  updatedat: Date;

  @ManyToOne(() => ElectionEntity, (election) => election.candidates, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'electionid' })
  election: ElectionEntity;

  @ManyToOne(() => PositionEntity, (position) => position.candidates, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'positionid' })
  position: PositionEntity;

  @ManyToOne(() => DistrictEntity, (district) => district.candidates, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'districtid' })
  district: DistrictEntity;

  @OneToOne(() => DelegateEntity, (delegate) => delegate.candidate, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'delegateid' })
  delegate: DelegateEntity;

  @OneToMany(() => CastVoteEntity, (castVote) => castVote.candidate)
  castVotes: CastVoteEntity[];
}
