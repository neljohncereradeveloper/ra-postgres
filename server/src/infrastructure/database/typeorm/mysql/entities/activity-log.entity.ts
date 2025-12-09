import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { lowercaseTransformer } from '../../../../../shared/utils/typeorm-transformers.util';

@Entity('activitylogs')
export class ActivityLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, transformer: lowercaseTransformer })
  action: string; // e.g., 'CREATE_CLIENT', 'UPDATE_CLIENT'

  @Column({ length: 100, transformer: lowercaseTransformer })
  entity: string; // e.g., 'Client'

  @Column({ type: 'json', nullable: true })
  details: Record<string, any>; // JSON type for cross-database compatibility

  @CreateDateColumn()
  @Index()
  timestamp: Date; // Automatically sets the current date and time

  @Column({ transformer: lowercaseTransformer })
  @Index()
  username: string;
}
