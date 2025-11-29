import { Transform } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsString,
  Length,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateElectionDto {
  @IsString()
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  name: string;

  @IsString()
  @MaxLength(255, { message: 'Description must not exceed 255 characters' })
  desc1: string;

  @IsString()
  @MaxLength(200, { message: 'Address must not exceed 200 characters' })
  address: string;

  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'Date must be a valid date' })
  date: Date;

  @IsNumber({}, { message: 'Maximum attendees must be a number' })
  @Min(1, { message: 'Maximum attendees must be greater than zero' })
  maxAttendees: number;

  @ValidateIf((o) => o.startTime !== null)
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsDate({ message: 'Start time must be a valid date' })
  startTime: Date | null;

  @ValidateIf((o) => o.endTime !== null)
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsDate({ message: 'End time must be a valid date' })
  endTime: Date | null;
}
