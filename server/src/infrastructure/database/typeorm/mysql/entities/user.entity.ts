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
@Unique(['username'])
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  precinct: string;

  @Column({ length: 100 })
  watcher: string;

  @Column({ type: 'json' })
  applicationaccess: string[];

  @Column({ type: 'json' })
  userroles: string[];

  @Column({ length: 100 })
  username: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({
    comment: 'username of the user who deleted the user',
    nullable: true,
  })
  deletedby?: string;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deletedat?: Date | null;

  @Column({
    comment: 'username of the user who created the user',
    nullable: true,
  })
  createdby?: string;

  @CreateDateColumn()
  createdat: Date;

  @Column({
    comment: 'username of the user who updated the user',
    nullable: true,
  })
  updatedby?: string;

  @UpdateDateColumn()
  updatedat: Date;
}
