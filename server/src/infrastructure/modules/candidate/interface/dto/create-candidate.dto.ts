import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCandidateDto {
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
