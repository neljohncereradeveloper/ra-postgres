import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('activitylogs')
export class ActivityLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  action: string; // e.g., 'CREATE_CLIENT', 'UPDATE_CLIENT'

  @Column({ length: 100 })
  entity: string; // e.g., 'Client'

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>; // PostgreSQL native JSON type

  @CreateDateColumn()
  @Index()
  timestamp: Date; // Automatically sets the current date and time

  @Column()
  @Index()
  username: string;
}
