import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdatePositionDto {
  @IsNotEmpty()
  @IsString()
  desc1: string;

  @IsNotEmpty()
  @IsNumber()
  maxCandidates: number;

  @IsNotEmpty()
  @IsString()
  termLimit: string;
}
