import { IsNotEmpty, IsString } from 'class-validator';

export class SetActiveElectionDto {
  @IsNotEmpty()
  @IsString()
  electionName: string;
}

