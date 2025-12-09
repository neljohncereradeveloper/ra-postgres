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
import { lowercaseTransformer } from '../../../../../shared/utils/typeorm-transformers.util';

@Entity('applicationaccess')
@Unique(['desc1'])
export class ApplicationAccessEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, transformer: lowercaseTransformer })
  desc1: string;

  @Column({
    comment: 'username of the user who deleted the application access',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  deletedby?: string;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deletedat?: Date | null;

  @Column({
    comment: 'username of the user who created the application access',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  createdby?: string;

  @CreateDateColumn()
  createdat: Date;

  @Column({
    comment: 'username of the user who updated the application access',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  updatedby?: string;

  @UpdateDateColumn()
  updatedat: Date;
}
