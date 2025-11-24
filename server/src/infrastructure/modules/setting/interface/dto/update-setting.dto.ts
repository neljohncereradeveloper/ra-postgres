import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSettingDto {
  @IsNotEmpty()
  @IsString()
  electionName: string;
}
