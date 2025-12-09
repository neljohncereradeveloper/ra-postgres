import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { toLowerCase } from '../../../../../shared/utils/dto-transformers.util';

export class UpdateCandidateDto {
  @IsNotEmpty()
  @IsNumber()
  delegateId: number;

  @toLowerCase
  @IsNotEmpty()
  @IsString()
  position: string;

  @toLowerCase
  @IsNotEmpty()
  @IsString()
  district: string;

  @toLowerCase
  @IsNotEmpty()
  @IsString()
  displayName: string;
}
