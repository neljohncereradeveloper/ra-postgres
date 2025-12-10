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
    comment: 'username of the user who deleted the application access',
    nullable: true,
  })
  deleted_by?: string;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deleted_at?: Date | null;

  @Column({
    comment: 'username of the user who created the application access',
    nullable: true,
  })
  created_by?: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({
    comment: 'username of the user who updated the application access',
    nullable: true,
  })
  updated_by?: string;

  @UpdateDateColumn()
  updated_at: Date;
}
