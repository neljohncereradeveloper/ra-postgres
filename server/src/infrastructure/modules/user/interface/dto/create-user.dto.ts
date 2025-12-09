import {
  IsArray,
  IsNotEmpty,
  IsString,
  Length,
  ArrayMinSize,
} from 'class-validator';
import {
  toLowerCase,
  toLowerCaseArray,
} from '../../../../../shared/utils/dto-transformers.util';

export class CreateUserDto {
  @toLowerCase
  @IsString()
  @Length(3, 100, {
    message:
      'Watcher should be at least 3 characters and maximum of 100 characters',
  })
  @IsNotEmpty({ message: 'Watcher should not be empty' })
  watcher: string;

  @toLowerCase
  @Length(3, 50, {
    message:
      'Precinct should be at least 3 characters and maximum of 50 characters',
  })
  @IsNotEmpty({ message: 'Precinct should not be empty' })
  precinct: string;

  @toLowerCase
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

  @toLowerCaseArray
  @IsArray({ message: 'User roles must be an array' })
  @ArrayMinSize(1, { message: 'User roles must contain at least one role' })
  @IsString({ each: true, message: 'Each user role must be a string' })
  @IsNotEmpty({ each: true, message: 'User roles should not be empty' })
  userRoles: string[];

  @toLowerCaseArray
  @IsArray({ message: 'Application Access must be an array' })
  @ArrayMinSize(1, {
    message: 'Application Access must contain at least one access',
  })
  @IsString({ each: true, message: 'Each application access must be a string' })
  @IsNotEmpty({ each: true, message: 'Application Access should not be empty' })
  applicationAccess: string[];
}
