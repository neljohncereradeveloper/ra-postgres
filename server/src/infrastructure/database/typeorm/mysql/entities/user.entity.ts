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

  @Column({ name: 'application_access', length: 100 })
  applicationAccess: string;

  @Column({ name: 'user_roles', length: 100 })
  userRoles: string;

  @Column({ name: 'user_name', length: 100 })
  userName: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  @Index()
  deletedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
