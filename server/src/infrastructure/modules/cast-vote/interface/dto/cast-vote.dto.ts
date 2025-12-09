import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { toLowerCase } from '../../../../../shared/utils/dto-transformers.util';

export class CandidateDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
export class CastVoteDto {
  @toLowerCase
  @IsNotEmpty()
  @IsString()
  controlNumber: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CandidateDto)
  candidates: CandidateDto[];
}
