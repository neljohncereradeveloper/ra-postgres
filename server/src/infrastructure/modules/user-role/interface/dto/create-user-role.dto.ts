import { IsNotEmpty, IsString } from 'class-validator';
import { toLowerCase } from '../../../../../shared/utils/dto-transformers.util';

export class CreateUserRoleDto {
  @toLowerCase
  @IsNotEmpty()
  @IsString()
  desc1: string;
}
