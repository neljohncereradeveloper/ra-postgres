import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePrecinctDto {
  @IsNotEmpty()
  @IsString()
  desc1: string;
}
