import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDate, IsArray } from 'class-validator';

export class MemberReturnAppDto {
  @IsNumber()
  @IsNotEmpty()
  return_app_id: number;

  @IsNumber()
  @IsNotEmpty()
  order_detail_app_id: number;

  @IsNumber()
  @IsOptional()
  order_address_id: number;

  @IsString()
  @IsNotEmpty()
  account_app_id: number;

  @IsString()
  @IsNotEmpty()
  return_applicator: string;

  @IsString()
  @IsOptional()
  return_reason_type: string;

  @IsString()
  @IsOptional()
  reason: string;

  @IsString()
  @IsOptional()
  customer_tracking_number: string;

  @IsString()
  @IsOptional()
  company_tracking_number: string;

  @IsString()
  @IsOptional()
  customer_courier_code: string;

  @IsString()
  @IsOptional()
  company_courier_code: string;

  @IsNumber()
  @IsOptional()
  quantity: number;

  @IsString()
  @IsOptional()
  return_goodsflow_id: number;

  @IsString()
  @IsOptional()
  approval_yn: string;

  @IsString()
  @IsOptional()
  cancel_yn: string;

  @IsString()
  @IsNotEmpty()
  reg_dt: string;

  @IsString()
  @IsNotEmpty()
  reg_id: number;

  @IsString()
  @IsOptional()
  mod_dt: string;

  @IsString()
  @IsOptional()
  mod_id: number;
}

export class GetMemberReturnAppDto {
  @IsString()
  @IsNotEmpty()
  account_app_id: string;

  @IsNumber()
  @IsOptional()
  order_detail_app_id: number;

  @IsString()
  @IsOptional()
  type: string;

  @IsString()
  @IsOptional()
  search_content: string;

  @IsString()
  @IsOptional()
  year: string;
}

export class GetMemberReturnAppDetailDto {
  @IsNumber()
  @IsNotEmpty()
  return_app_id: number;
}

export class InsertMemberReturnAppDto {
  @IsNumber()
  @IsNotEmpty()
  order_detail_app_id: number;

  @IsNumber()
  @IsNotEmpty()
  order_address_id: number;

  @IsString()
  @IsNotEmpty()
  account_app_id: string;

  @IsString()
  @IsOptional()
  return_reason_type: string;

  @IsString()
  @IsOptional()
  reason: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class CancelMemberReturnAppDto {
  @IsString()
  @IsNotEmpty()
  account_app_id: string;

  @IsArray()
  @IsNotEmpty()
  order_detail_app_ids: number[];
}

export class UpdateMemberReturnAppDto {
  @IsString()
  @IsNotEmpty()
  account_app_id: string;

  @IsArray()
  @IsNotEmpty()
  order_detail_app_ids: number[];

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  cancel_yn: string;

  @IsString()
  @IsOptional()
  return_reason_type: string;

  @IsString()
  @IsOptional()
  reason: string;
}

export class UpdateMemberReturnAppOrderAddressIdDto {
  @IsNumber()
  @IsNotEmpty()
  order_detail_app_id: number;

  @IsNumber()
  @IsNotEmpty()
  order_address_id: number;

  @IsString()
  @IsNotEmpty()
  account_app_id: string;
}

export class UpdateMemberReturnAppCancelYnDto {
  @IsString()
  @IsNotEmpty()
  account_app_id: string;

  @IsArray()
  @IsNotEmpty()
  order_detail_app_ids: number[];

  @IsString()
  @IsNotEmpty()
  cancel_yn: string;
}

export class UpdateMemberReturnAppApprovalYnDto {
  @IsString()
  @IsNotEmpty()
  account_app_id: string;

  @IsArray()
  @IsNotEmpty()
  order_detail_app_ids: number[];

  @IsString()
  @IsNotEmpty()
  approval_yn: string;
}