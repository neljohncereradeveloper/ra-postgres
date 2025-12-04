import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from 'typeorm';

@Entity('userroles')
@Unique(['desc1'])
export class UserRoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  desc1: string;

  @Column({
    name: 'deleted_by',
    comment: 'username of the user who deleted the user role',
    nullable: true,
  })
  deletedBy?: string;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  @Index()
  deletedAt?: Date | null;

  @Column({
    name: 'created_by',
    comment: 'username of the user who created the user role',
    nullable: true,
  })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({
    name: 'updated_by',
    comment: 'username of the user who updated the user role',
    nullable: true,
  })
  updatedBy?: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
