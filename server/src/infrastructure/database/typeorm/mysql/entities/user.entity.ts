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

  @Column({ name: 'application_access', length: 500 })
  applicationAccess: string;

  @Column({ name: 'user_roles', length: 500 })
  userRoles: string;

  @Column({ name: 'user_name', length: 100 })
  userName: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({
    name: 'deleted_by',
    comment: 'username of the user who deleted the user',
    nullable: true,
  })
  deletedBy?: string;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  @Index()
  deletedAt?: Date | null;

  @Column({
    name: 'created_by',
    comment: 'username of the user who created the user',
    nullable: true,
  })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({
    name: 'updated_by',
    comment: 'username of the user who updated the user',
    nullable: true,
  })
  updatedBy?: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
