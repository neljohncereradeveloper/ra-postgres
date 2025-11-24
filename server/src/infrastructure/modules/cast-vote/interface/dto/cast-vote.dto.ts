import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CandidateDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
export class CastVoteDto {
  @IsNotEmpty()
  @IsString()
  controlNumber: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CandidateDto)
  candidates: CandidateDto[];
}
