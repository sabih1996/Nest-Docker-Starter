import { Trim } from 'class-sanitizer';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @Trim()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  public readonly email: string;

  @IsString()
  @MinLength(8)
  public readonly password: string;

  @IsString()
  public readonly firstName: string;

  @IsString()
  public readonly role: string;

  @IsString()
  public readonly city: string;

  @IsString()
  public readonly street: string;

  @IsString()
  public readonly lastName: string;

  @IsOptional()
  @IsNumber()
  public readonly countryId: number;

  @IsOptional()
  @IsArray()
  public readonly naylamDispatcherCountries: number[];

  @IsOptional()
  @IsArray()
  public readonly naylamDispatcherContractors: number[];

  @IsOptional()
  @IsNumber()
  public readonly contractorId: number;

  @IsPhoneNumber()
  public readonly mobileNumber: string;
}

export class UserDto {
  @Trim()
  @IsEmail()
  public readonly email: string;

  @IsString()
  public readonly firstName: string;

  @IsString()
  public readonly avatar: string;

  @IsString()
  public readonly roles: {};

  @IsNumber()
  public readonly rolesId: number;

  @IsString()
  public readonly lastName: string;

  @IsString()
  public readonly city: string;

  @IsString()
  public readonly street: string;

  @IsPhoneNumber()
  public readonly mobileNumber: string;
}

export class ProfileDto {
  @Trim()
  @IsEmail()
  @IsOptional()
  public readonly email: string;

  @IsString()
  public readonly firstName: string;

  @IsString()
  @IsOptional()
  public readonly avatar: string;

  @IsString()
  @IsOptional()
  public readonly roles: {};

  @IsOptional()
  @IsNumber()
  public readonly countryId: number;

  @IsNumber()
  @IsOptional()
  public readonly contractorId: number;

  @IsOptional()
  @IsArray()
  public readonly naylamDispatcherCountries: number[];

  @IsOptional()
  @IsArray()
  public readonly naylamDispatcherContractors: number[];

  @IsString()
  public readonly city: string;

  @IsString()
  public readonly street: string;

  @IsString()
  public readonly lastName: string;

  @IsBoolean()
  @IsOptional()
  public readonly status: boolean;

  @IsPhoneNumber()
  public readonly mobileNumber: string;

  @IsNumber()
  @IsOptional()
  public userId?: number;

  @IsNumber()
  @IsOptional()
  public roleId?: number;
}

export class LoginDto {
  @Trim()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  public readonly email: string;

  @IsString()
  public readonly password: string;
}

export class ActiveCountryPostDto {
  @IsNumber()
  public readonly userId: number;

  @IsNumber()
  public readonly countryId: number;
}
// export class ProfilrDto {
//   public readonly email: string;
//   public readonly password: string;
//   public readonly name?: string;
//   public readonly gender?: string;
// }
