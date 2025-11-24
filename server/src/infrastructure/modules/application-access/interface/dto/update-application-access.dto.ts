import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateApplicationAccessDto {
  @IsNotEmpty()
  @IsString()
  desc1: string;
}
