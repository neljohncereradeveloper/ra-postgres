import { IsNotEmpty, IsString } from 'class-validator';

export class CreateApplicationAccessDto {
  @IsNotEmpty()
  @IsString()
  desc1: string;
}
