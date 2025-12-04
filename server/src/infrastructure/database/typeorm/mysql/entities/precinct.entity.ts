import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('precincts')
@Unique(['desc1'])
export class PrecinctEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  desc1: string;

  @Column({
    name: 'deleted_by',
    comment: 'username of the user who deleted the precinct',
    nullable: true,
  })
  deletedBy?: string;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  @Index()
  deletedAt: Date | null; // For soft delete

  @Column({
    name: 'created_by',
    comment: 'username of the user who created the precinct',
    nullable: true,
  })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({
    name: 'updated_by',
    comment: 'username of the user who updated the precinct',
    nullable: true,
  })
  updatedBy?: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => UserEntity, (user) => user.precinct)
  users: UserEntity[];
}
