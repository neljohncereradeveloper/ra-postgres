import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(3, 100, {
    message:
      'Watcher should be at least 3 characters and maximum of 100 characters',
  })
  @IsNotEmpty({ message: 'Watcher should not be empty' })
  watcher: string;

  @Length(3, 50, {
    message:
      'Precinct should be at least 3 characters and maximum of 50 characters',
  })
  @IsNotEmpty({ message: 'Precinct should not be empty' })
  precinct: string;

  @IsString()
  @Length(3, 30, {
    message:
      'Username should be at least 3 characters and maximum of 30 characters',
  })
  @IsNotEmpty({ message: 'Username should not be empty' })
  userName: string;

  @IsString()
  @Length(3, 50, {
    message:
      'Password should be at least 3 characters and maximum of 50 characters',
  })
  @IsNotEmpty({ message: 'Password should not be empty' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'User roles should not be empty' })
  userRoles: string;

  @IsString()
  @IsNotEmpty({ message: 'Application Access should not be empty' })
  applicationAccess: string;
}
