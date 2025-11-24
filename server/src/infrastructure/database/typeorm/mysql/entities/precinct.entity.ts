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

  @DeleteDateColumn({ nullable: true })
  @Index()
  deletedAt: Date | null; // For soft delete

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserEntity, (user) => user.precinct)
  users: UserEntity[];
}
