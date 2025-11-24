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

  @Column({ length: 100, nullable: true })
  setupCode: string;

  @Column({ nullable: true })
  @Index()
  electionId: number;

  @OneToOne(() => ElectionEntity, (election) => election.setting, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'electionId' }) // Specifies the foreign key column
  election: ElectionEntity; // This defines the OneToOne relationship
}
