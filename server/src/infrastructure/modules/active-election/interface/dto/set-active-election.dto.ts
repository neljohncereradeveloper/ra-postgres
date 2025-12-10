import { IsNotEmpty, IsString } from 'class-validator';
import { toLowerCase } from '../../../../../shared/utils/dto-transformers.util';

export class SetActiveElectionDto {
  @toLowerCase
  @IsNotEmpty()
  @IsString()
  election_name: string;
}
