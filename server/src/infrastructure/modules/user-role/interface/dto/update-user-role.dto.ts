import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @IsNotEmpty()
  @IsString()
  desc1: string;
}
