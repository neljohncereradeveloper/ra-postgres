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
import { lowercaseTransformer } from '../../../../../shared/utils/typeorm-transformers.util';

@Entity('precincts')
@Unique(['desc1'])
export class PrecinctEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, transformer: lowercaseTransformer })
  desc1: string;

  @Column({
    comment: 'username of the user who deleted the precinct',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  deletedby?: string;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deletedat: Date | null; // For soft delete

  @Column({
    comment: 'username of the user who created the precinct',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  createdby?: string;

  @CreateDateColumn()
  createdat: Date;

  @Column({
    comment: 'username of the user who updated the precinct',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  updatedby?: string;

  @UpdateDateColumn()
  updatedat: Date;

  @OneToMany(() => UserEntity, (user) => user.precinct)
  users: UserEntity[];
}
