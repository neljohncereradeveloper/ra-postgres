import { IsNotEmpty, IsString } from 'class-validator';
import { toLowerCase } from '../../../../../shared/utils/dto-transformers.util';

export class SetActiveElectionDto {
  @toLowerCase
  @IsNotEmpty()
  @IsString()
  electionName: string;
}

