import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDistrictDto {
  @IsNotEmpty()
  @IsString()
  desc1: string;
}
