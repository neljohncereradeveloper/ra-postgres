import { Election } from '@domain/models/election.model';
import { ElectionEntity } from '../entities/election.entity';

export class ElectionMapper {
  static toDomain(entity: ElectionEntity): Election {
    return new Election({
      id: entity.id,
      name: entity.name,
      desc1: entity.desc1,
      address: entity.address,
      date: entity.date,
      startTime: entity.startTime,
      endTime: entity.endTime,
      maxAttendees: entity.maxAttendees,
      status: entity.status,
      deletedAt: entity.deletedAt,
    });
  }

  static toDomainList(entities: ElectionEntity[]): Election[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}
