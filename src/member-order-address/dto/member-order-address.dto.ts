import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export interface MemberOrderAddressResponse {
  account_app_id: number;
  order_address_id: number;
  receiver_name: string;
  receiver_phone: string;
  address: string;
  address_detail: string;
  zip_code: string;
  enter_way: string;
  enter_memo: string;
  delivery_request: string;
}

export class InsertMemberOrderAddressDto {
  @IsNumber()
  @IsNotEmpty()
  order_detail_app_id: number;

  @IsNumber()
  @IsNotEmpty()
  account_app_id: number;

  @IsString()
  @IsOptional()
  order_address_type: string;

  @IsString()
  @IsNotEmpty()
  receiver_name: string;

  @IsString()
  @IsNotEmpty()
  receiver_phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  address_detail: string;

  @IsString()
  @IsNotEmpty()
  zip_code: string;

  @IsOptional()
  @IsString()
  enter_way: string;

  @IsOptional()
  @IsString()
  enter_memo: string;

  @IsOptional()
  @IsString()
  delivery_request: string;
}

export class UpdateMemberOrderAddressDto {
  @IsNumber()
  @IsNotEmpty()
  order_address_id: number;

  @IsNumber()
  @IsNotEmpty()
  account_app_id: number;

  @IsString()
  @IsNotEmpty()
  receiver_name: string;

  @IsString()
  @IsNotEmpty()
  receiver_phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  address_detail: string;

  @IsString()
  @IsNotEmpty()
  zip_code: string;

  @IsOptional()
  @IsString()
  enter_way: string;

  @IsOptional()
  @IsString()
  enter_memo: string;

  @IsOptional()
  @IsString()
  delivery_request: string;

  @IsString()
  @IsNotEmpty()
  use_yn: string;
}

export class UpdateMemberOrderAddressTypeDto {  
  @IsNumber()
  @IsNotEmpty()
  order_address_id: number;

  @IsNumber()
  @IsNotEmpty()
  account_app_id: number;

  @IsString()
  @IsNotEmpty()
  order_address_type: string;
}

export class DeleteMemberOrderAddressDto {
  @IsNumber()
  @IsNotEmpty()
  order_detail_app_id: number;

  @IsNumber()
  @IsNotEmpty()
  account_app_id: number;
}

export class UpdateMemberOrderAddressUseYnDto {
  @IsNumber()
  @IsNotEmpty()
  order_address_id: number;

  @IsNumber()
  @IsNotEmpty()
  account_app_id: number;

  @IsString()
  @IsNotEmpty()
  use_yn: string;
}

export class UpdateOrderDetailAppIdDto {
  @IsNumber()
  @IsNotEmpty()
  account_app_id: number;

  @IsNumber()
  @IsNotEmpty()
  order_address_id: number;

  @IsNumber()
  @IsNotEmpty()
  order_detail_app_id: number;
}