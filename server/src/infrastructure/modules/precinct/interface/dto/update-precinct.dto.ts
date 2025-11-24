import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePrecinctDto {
  @IsNotEmpty()
  @IsString()
  desc1: string;
}
