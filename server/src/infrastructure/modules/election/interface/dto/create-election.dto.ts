import { Transform } from 'class-transformer';
import { IsDate, IsString, Length, MaxLength } from 'class-validator';

export class CreateElectionDto {
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
}
