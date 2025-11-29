import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToOne,
  Index,
} from 'typeorm';
import { ElectionEntity } from './election.entity';

@Entity('settings')
export class SettingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'setup_code', length: 100, nullable: true })
  setupCode: string;

  @Column({ name: 'election_id', nullable: true })
  @Index()
  electionId: number;

  @OneToOne(() => ElectionEntity, (election) => election.setting, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'election_id' }) // Specifies the foreign key column
  election: ElectionEntity; // This defines the OneToOne relationship
}
