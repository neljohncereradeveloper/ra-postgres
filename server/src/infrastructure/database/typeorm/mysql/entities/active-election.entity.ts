import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToOne,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ElectionEntity } from './election.entity';

@Entity('active_election')
export class ActiveElectionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'setup_code', length: 100, nullable: true })
  setupCode: string;

  @Column({ name: 'election_id', nullable: true })
  @Index()
  electionId: number;

  @Column({
    name: 'created_by',
    comment: 'username of the user who created the active election record',
    nullable: true,
  })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({
    name: 'updated_by',
    comment: 'username of the user who last updated the active election',
    nullable: true,
  })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => ElectionEntity, (election) => election.activeElection, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'election_id' }) // Specifies the foreign key column
  election: ElectionEntity; // This defines the OneToOne relationship
}

