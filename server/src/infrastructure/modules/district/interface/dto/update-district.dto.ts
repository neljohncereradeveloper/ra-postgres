import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDistrictDto {
  @IsNotEmpty()
  @IsString()
  desc1: string;
}
