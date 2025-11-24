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
@Unique(['userName'])
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  precinct: string;

  @Column({ length: 100 })
  watcher: string;

  @Column({ length: 100 })
  applicationAccess: string;

  @Column({ length: 100 })
  userRoles: string;

  @Column({ length: 100 })
  userName: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deletedAt?: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
