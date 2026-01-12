import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDate } from 'class-validator';

export class MemberPointAppDto {
  @IsNumber()
  @IsNotEmpty()
  point_app_id: number;

  @IsNumber()
  @IsNotEmpty()
  account_app_id: number;

  @IsNumber()
  @IsNotEmpty()
  order_detail_app_id: number;

  @IsString()
  @IsNotEmpty()
  point_type: string;

  @IsString()
  @IsNotEmpty()
  point_status: string;

  @IsNumber()
  @IsOptional()
  point_amount: number;

  @IsString()
  @IsOptional()
  reg_dt: string;

  @IsString()
  @IsOptional()
  reg_id: string;
}

export class ProductPointDataDto {
  @IsNumber()
  product_app_id: number;

  @IsString()
  product_name: string;

  @IsString()
  brand_name: string;

  @IsString()
  option_type: string;

  @IsNumber()
  option_amount: number;

  @IsString()
  option_unit: string;

  @IsString()
  option_gender: string;

  @IsNumber()
  point_app_id: number;

  @IsNumber()
  order_app_id: number;

  @IsString()
  point_status: string;

  @IsNumber()
  point_amount: number;

  @IsString()
  reg_dt: string;

  @IsString()
  reg_id: string;
}

export class GetMemberPointAppListDto {
  @IsString()
  @IsNotEmpty()
  account_app_id: string;

  @IsString()
  @IsNotEmpty()
  reg_ym: string;
} 

export class InsertMemberPointAppDto {
  @IsNumber()
  @IsNotEmpty()
  order_detail_app_id: number;

  @IsNumber()
  @IsNotEmpty()
  account_app_id: number;

  @IsString()
  @IsNotEmpty()
  point_status: string;

  @IsNumber()
  @IsNotEmpty()
  point_amount: number;
}