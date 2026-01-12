import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetMemberPaymentsDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsOptional()
  @Transform(({ value }) => String(value))
  payment_status: string;
}

export interface MemberPaymentAppResponse {
  payment_app_id: number;
  payment_status: string;
  payment_method: string;
  payment_amount: number;
  payment_dt: string;
  portone_imp_uid: string;
  portone_merchant_uid: string;
  portone_status: string;
  card_name: string;
}

export class InsertMemberPaymentAppDto {
  @IsNumber()
  @IsNotEmpty()
  order_app_id: number;

  @IsNumber()
  @IsNotEmpty()
  account_app_id: number;

  @IsNumber()
  @IsOptional()
  return_app_id: number;

  @IsString()
  @IsNotEmpty()
  payment_status: string;

  @IsString()
  @IsNotEmpty()
  payment_type: string;

  @IsString()
  @IsNotEmpty()
  payment_method: string;

  @IsNumber()
  @IsNotEmpty()
  payment_amount: number;

  @IsString()
  @IsNotEmpty()
  portone_imp_uid: string;

  @IsString()
  @IsNotEmpty()
  portone_merchant_uid: string;

  @IsString()
  @IsNotEmpty()
  portone_status: string;

  @IsString()
  @IsNotEmpty()
  card_name: string;
} 