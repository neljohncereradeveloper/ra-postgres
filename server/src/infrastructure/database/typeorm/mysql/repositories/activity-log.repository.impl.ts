import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ActivityLogEntity } from '../entities/activity-log.entity';
import { ActivityLog } from '@domain/models/activitylog,model';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';

@Injectable()
export class ActivityLogRepositoryImpl
  implements ActivityLogRepository<EntityManager>
{
  constructor(
    @InjectRepository(ActivityLogEntity)
    private readonly repository: Repository<ActivityLogEntity>,
  ) {}

  async create(log: ActivityLog, manager: EntityManager): Promise<ActivityLog> {
    const logEntity = this.toEntity(log);
    const savedEntity = await manager.save(ActivityLogEntity, logEntity);
    return this.toModel(savedEntity);
  }

  async findAll(): Promise<ActivityLog[]> {
    const entities = await this.repository.find();
    return entities.map(this.toModel);
  }

  async findByEntity(entity: string): Promise<ActivityLog[]> {
    const entities = await this.repository.find({ where: { entity } });
    return entities.map(this.toModel);
  }

  async findByAction(action: string): Promise<ActivityLog[]> {
    const entities = await this.repository.find({ where: { action } });
    return entities.map(this.toModel);
  }

  private toEntity(log: ActivityLog): ActivityLogEntity {
    const entity = new ActivityLogEntity();
    entity.id = log.id;
    entity.action = log.action;
    entity.entity = log.entity;
    entity.details = log.details;
    entity.timestamp = log.timestamp;
    entity.userId = log.userId;
    return entity;
  }

  private toModel(entity: ActivityLogEntity): ActivityLog {
    return new ActivityLog(
      entity.action,
      entity.entity,
      entity.details,
      entity.timestamp,
      entity.userId,
    );
  }
}
