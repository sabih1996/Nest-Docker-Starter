import { Trim } from 'class-sanitizer';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  public readonly password: string;

  @Trim()
  @IsEmail()
  public readonly email: string;

  @IsNumber()
  @IsNotEmpty()
  public readonly otp: number;
}
