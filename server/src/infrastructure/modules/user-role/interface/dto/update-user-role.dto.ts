import { IsNotEmpty, IsString } from 'class-validator';
import { toLowerCase } from '../../../../../shared/utils/dto-transformers.util';

export class UpdateUserRoleDto {
  @toLowerCase
  @IsNotEmpty()
  @IsString()
  desc1: string;
}
