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

@Entity('applicationaccess')
@Unique(['desc1'])
export class ApplicationAccessEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  desc1: string;

  @Column({
    name: 'deleted_by',
    comment: 'username of the user who deleted the application access',
    nullable: true,
  })
  deletedBy?: string;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  @Index()
  deletedAt?: Date | null;

  @Column({
    name: 'created_by',
    comment: 'username of the user who created the application access',
    nullable: true,
  })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({
    name: 'updated_by',
    comment: 'username of the user who updated the application access',
    nullable: true,
  })
  updatedBy?: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
