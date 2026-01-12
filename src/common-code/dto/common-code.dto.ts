import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class InsertCommonFileDto {
  @IsNotEmpty()
  @IsString()
  file_name: string;

  @IsNotEmpty()
  @IsString()
  file_path: string;

  @IsNotEmpty()
  @IsString()
  file_division: string;

  @IsNotEmpty()
  @IsNumber()
  account_app_id: number;

  @IsOptional()
  @IsString()
  del_yn: string;

  @IsOptional()
  reg_dt: string;

  @IsOptional()
  @IsNumber()
  reg_id: number;

  @IsOptional()
  mod_dt: string;

  @IsOptional()
  @IsNumber()
  mod_id: number;
}

export class DeleteCommonFileDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  file_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;
}

export class CommonDto {
  @IsNotEmpty()
  @IsString()
  group_code: string;
} 