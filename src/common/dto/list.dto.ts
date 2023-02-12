import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { toNumber } from 'lodash';

export class ListDto {
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  public page = 1;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  public limit = 10;
}
