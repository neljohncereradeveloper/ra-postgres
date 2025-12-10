import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { toLowerCase } from '../../../../../shared/utils/dto-transformers.util';

export class CreatePositionDto {
  @toLowerCase
  @IsNotEmpty()
  @IsString()
  desc1: string;

  @IsNotEmpty()
  @IsNumber()
  max_candidates: number;

  @toLowerCase
  @IsNotEmpty()
  @IsString()
  term_limit: string;
}
