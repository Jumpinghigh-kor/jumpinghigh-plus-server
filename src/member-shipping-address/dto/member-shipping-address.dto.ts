import { IsNotEmpty, IsNumber, IsString, IsOptional, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetMemberShippingAddressListDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  shipping_address_id?: number;
}

export class InsertMemberShippingAddressDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsNotEmpty()
  @IsString()
  shipping_address_name: string;

  @IsNotEmpty()
  @IsString()
  receiver_name: string;

  @IsNotEmpty()
  @IsString()
  receiver_phone: string;

  @IsString()
  default_yn: string;

  @IsOptional()
  @IsString()
  select_yn?: string;

  @IsOptional()
  @IsString()
  del_yn?: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  address_detail: string;

  @IsNotEmpty()
  @IsString()
  zip_code: string;

  @IsOptional()
  @IsString()
  enter_way?: string;

  @IsOptional()
  @IsString()
  enter_memo?: string;
  
  @IsOptional()
  @IsString()
  delivery_request?: string;
}

export class UpdateMemberShippingAddressDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  shipping_address_id: number;

  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsString()
  shipping_address_name: string;

  @IsString()
  receiver_name: string;

  @IsString()
  receiver_phone: string;

  @IsString()
  @IsOptional()
  default_yn?: string;

  @IsOptional()
  @IsString()
  select_yn?: string;

  @IsOptional()
  @IsString()
  del_yn?: string;

  @IsString()
  address: string;

  @IsString()
  address_detail: string;

  @IsString()
  zip_code: string;

  @IsOptional()
  @IsString()
  enter_way?: string;

  @IsOptional()
  @IsString()
  enter_memo?: string;
  
  @IsOptional()
  @IsString()
  delivery_request?: string;
}

export class DeleteMemberShippingAddressDto {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  shipping_address_id: number;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  account_app_id: number;
}

export class UpdateDeliveryRequestDto {
  @IsNumber()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  shipping_address_id: number;

  @IsNumber()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  account_app_id: number;

  @IsString()
  delivery_request: string;
}

export class UpdateSelectYnDto {
  @IsNumber()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  @IsOptional()
  shipping_address_id: number;

  @IsNumber()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  account_app_id: number;

  @IsString()
  select_yn: string;
}

export interface MemberShippingAddressResponse {
  // 응답 데이터 인터페이스 정의 예정
} 