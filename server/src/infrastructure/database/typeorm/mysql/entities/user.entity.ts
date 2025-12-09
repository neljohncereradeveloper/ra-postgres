import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Unique,
  Index,
} from 'typeorm';
import { lowercaseTransformer } from '../../../../../shared/utils/typeorm-transformers.util';

@Entity('users')
@Unique(['username'])
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, transformer: lowercaseTransformer })
  precinct: string;

  @Column({ length: 100, transformer: lowercaseTransformer })
  watcher: string;

  @Column({ type: 'json' })
  applicationaccess: string[];

  @Column({ type: 'json' })
  userroles: string[];

  @Column({ length: 100, transformer: lowercaseTransformer })
  username: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({
    comment: 'username of the user who deleted the user',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  deletedby?: string;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deletedat?: Date | null;

  @Column({
    comment: 'username of the user who created the user',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  createdby?: string;

  @CreateDateColumn()
  createdat: Date;

  @Column({
    comment: 'username of the user who updated the user',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  updatedby?: string;

  @UpdateDateColumn()
  updatedat: Date;
}
