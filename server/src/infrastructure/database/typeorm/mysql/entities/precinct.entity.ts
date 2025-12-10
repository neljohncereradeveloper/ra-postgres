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
    comment: 'username of the user who deleted the precinct',
    nullable: true,
  })
  deleted_by?: string;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deleted_at: Date | null; // For soft delete

  @Column({
    comment: 'username of the user who created the precinct',
    nullable: true,
  })
  created_by?: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({
    comment: 'username of the user who updated the precinct',
    nullable: true,
  })
  updated_by?: string;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => UserEntity, (user) => user.precinct)
  users: UserEntity[];
}
