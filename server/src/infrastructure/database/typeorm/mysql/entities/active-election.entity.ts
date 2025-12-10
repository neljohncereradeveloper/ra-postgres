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

  @Column({ nullable: true })
  @Index()
  election_id: number;

  @Column({
    comment: 'username of the user who created the active election record',
    nullable: true,
  })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({
    comment: 'username of the user who last updated the active election',
    nullable: true,
  })
  updated_by: string;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => ElectionEntity, (election) => election.active_election, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'election_id' }) // Specifies the foreign key column
  election: ElectionEntity; // This defines the OneToOne relationship
}
