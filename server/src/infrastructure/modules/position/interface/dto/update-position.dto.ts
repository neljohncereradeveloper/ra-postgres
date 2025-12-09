import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { toLowerCase } from '../../../../../shared/utils/dto-transformers.util';

export class UpdatePositionDto {
  @toLowerCase
  @IsNotEmpty()
  @IsString()
  desc1: string;

  @IsNotEmpty()
  @IsNumber()
  maxCandidates: number;

  @toLowerCase
  @IsNotEmpty()
  @IsString()
  termLimit: string;
}
