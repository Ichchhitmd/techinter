import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateAuthorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
