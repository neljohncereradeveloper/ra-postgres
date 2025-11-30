import { Injectable } from '@nestjs/common';
import { UUIDGeneratorPort } from '@domain/ports/uuid-generator.port';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UUIDGeneratorAdapter implements UUIDGeneratorPort {
  generateUUID(): string {
    return uuidv4();
  }
}
