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

@Entity('users')
@Unique(['user_name'])
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  precinct: string;

  @Column({ length: 100 })
  watcher: string;

  @Column({ type: 'json' })
  application_access: string[];

  @Column({ type: 'json' })
  user_roles: string[];

  @Column({ length: 100 })
  user_name: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({
    comment: 'username of the user who deleted the user',
    nullable: true,
  })
  deleted_by?: string;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deleted_at?: Date | null;

  @Column({
    comment: 'username of the user who created the user',
    nullable: true,
  })
  created_by?: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({
    comment: 'username of the user who updated the user',
    nullable: true,
  })
  updated_by?: string;

  @UpdateDateColumn()
  updated_at: Date;
}
