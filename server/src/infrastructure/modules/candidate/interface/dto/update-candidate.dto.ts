import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { toLowerCase } from '../../../../../shared/utils/dto-transformers.util';

export class UpdateCandidateDto {
  @IsNotEmpty()
  @IsNumber()
  delegate_id: number;

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
  display_name: string;
}
