import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export enum UserProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEnum(UserProvider)
  @IsNotEmpty()
  provider: UserProvider;

  @ValidateIf((c) => c.provider == UserProvider.LOCAL)
  @IsNotEmpty()
  password: string;

  @ValidateIf((c) => c.provider == UserProvider.LOCAL)
  @IsNotEmpty()
  email: string;

  @IsOptional()
  photo: string;

  @IsOptional()
  phoneNumber: string;

  @IsOptional()
  firstName: string;

  @IsOptional()
  middleName: string;

  @IsOptional()
  lastName: string;
}
