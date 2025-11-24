import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateCandidateDto {
  @IsNotEmpty()
  @IsNumber()
  delegateId: number;

  @IsNotEmpty()
  @IsString()
  position: string;

  @IsNotEmpty()
  @IsString()
  district: string;

  @IsNotEmpty()
  @IsString()
  displayName: string;
}
