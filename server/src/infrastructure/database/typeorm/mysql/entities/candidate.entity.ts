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

  @Column()
  @Index()
  election_id: number;

  @Column()
  @Index()
  delegate_id: number;

  @Column()
  @Index()
  position_id: number;

  @Column()
  @Index()
  district_id: number;

  @Column({ length: 255 })
  display_name: string;

  @Column({
    comment: 'username of the user who deleted the candidate',
    nullable: true,
  })
  deleted_by?: string;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date | null; // For soft delete

  @Column({
    comment: 'username of the user who created the candidate',
    nullable: true,
  })
  created_by?: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({
    comment: 'username of the user who updated the candidate',
    nullable: true,
  })
  updated_by?: string;

  @UpdateDateColumn()
  updated_at: Date;

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
  cast_votes: CastVoteEntity[];
}
