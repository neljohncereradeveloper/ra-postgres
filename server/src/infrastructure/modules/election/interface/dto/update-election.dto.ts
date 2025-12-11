import { Transform } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsString,
  Length,
  MaxLength,
  Min,
  ValidateIf,
  Matches,
} from 'class-validator';
import { toLowerCase } from '../../../../../shared/utils/dto-transformers.util';

export class UpdateElectionDto {
  @toLowerCase
  @IsString()
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  name: string;

  @toLowerCase
  @IsString()
  @MaxLength(255, { message: 'Description must not exceed 255 characters' })
  desc1: string;

  @toLowerCase
  @IsString()
  @MaxLength(200, { message: 'Address must not exceed 200 characters' })
  address: string;

  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'Date must be a valid date' })
  date: Date;

  @IsNumber({}, { message: 'Maximum attendees must be a number' })
  @Min(1, { message: 'Maximum attendees must be greater than zero' })
  max_attendees: number;

  // @ValidateIf((o) => o.start_time !== null && o.start_time !== '')
  // @IsString({ message: 'Start time must be a string' })
  // @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
  //   message: 'Start time must be in HH:MM:SS format',
  // })
  // start_time: string | null;

  // @ValidateIf((o) => o.end_time !== null && o.end_time !== '')
  // @IsString({ message: 'End time must be a string' })
  // @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
  //   message: 'End time must be in HH:MM:SS format',
  // })
  // end_time: string | null;
}
