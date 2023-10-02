import { IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  fullName: string;

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
