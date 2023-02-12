import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  public readonly role?: string;
}

export class ResetPasswordDto {
  @IsEmail()
  @IsOptional()
  public readonly email: string;

  @IsString()
  @MinLength(8)
  public readonly newPassword: string;

  @IsString()
  @IsOptional()
  public readonly newPasswordToken: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  public readonly password: string;
}
export class CountryDto {
  @IsString()
  public readonly country_name: string;

  @IsString()
  @IsOptional()
  public readonly countryCode: string;

  @IsString()
  @IsOptional()
  public readonly imageUrl: string;
}

export class CountryUpdateDto {
  @IsNumber()
  public readonly id: number;

  @IsBoolean()
  public readonly status: boolean;

  @IsString()
  @IsOptional()
  public readonly countryCode: string;

  @IsString()
  @IsOptional()
  public readonly countryName: string;

  @IsString()
  @IsOptional()
  public readonly currency: string;

  @IsString()
  @IsOptional()
  public readonly imageUrl: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  public firstName: string;

  @IsString()
  @IsOptional()
  public lastName: string;

  @IsEmail()
  @IsOptional()
  public email: string;

  @IsPhoneNumber()
  @IsOptional()
  public mobileNumber: string;

  @IsString()
  @IsOptional()
  public city: string;

  @IsString()
  @IsOptional()
  public street: string;

  @IsBoolean()
  @IsOptional()
  public status: boolean;

  @IsNumber()
  @IsOptional()
  public role: number;
}
