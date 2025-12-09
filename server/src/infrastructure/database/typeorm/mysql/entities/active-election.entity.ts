import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToOne,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ElectionEntity } from './election.entity';
import { lowercaseTransformer } from '../../../../../shared/utils/typeorm-transformers.util';

@Entity('active_election')
export class ActiveElectionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  @Index()
  electionid: number;

  @Column({
    comment: 'username of the user who created the active election record',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  createdby: string;

  @CreateDateColumn()
  createdat: Date;

  @Column({
    comment: 'username of the user who last updated the active election',
    nullable: true,
    transformer: lowercaseTransformer,
  })
  updatedby: string;

  @UpdateDateColumn()
  updatedat: Date;

  @OneToOne(() => ElectionEntity, (election) => election.activeElection, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'electionid' }) // Specifies the foreign key column
  election: ElectionEntity; // This defines the OneToOne relationship
}
