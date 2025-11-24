import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserRoleDto {
  @IsNotEmpty()
  @IsString()
  desc1: string;
}
