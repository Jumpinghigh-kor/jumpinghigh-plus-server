import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetProductAppListDto {
  @IsOptional()
  @IsString()
  big_category?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  account_app_id?: number;
}

export interface ProductAppListResponse {
  product_app_id: number;
  big_category: string;
  small_category: string;
  brand_name: string;
  product_name: string;
  title: string;
  price: string;
  original_price: string;
  discount: number;
  give_point: number;
  sell_start_dt: string;
  sell_end_dt: string;
  delivery_fee: number;
  remote_delivery_fee: number;
  free_shipping_amount: number;
  inquiry_phone_number: string;
  today_send_yn: string;
  today_send_time: string;
  not_today_send_day: string;
  courier_code: string;
  view_yn: string;
  del_yn: string;
  reg_dt: string;
  reg_id: number;
  mod_dt: string;
  mod_id: number;
}

export class GetProductAppImgDetailDto {
  @IsNumber()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  product_app_id: number;
}

export interface ProductAppImgDetailResponse {
  file_name: string;
  file_division: string;
  file_path: string;
  img_form: string;
  order_seq: number;
}

export class SelectProductAppThumbnailImgDto {
  // No specific parameters needed
}

export interface ProductAppThumbnailImgResponse {
  file_name: string;
  file_division: string;
  file_path: string;
  product_app_id: number;
  img_form: string;
  order_seq: number;
}

export class GetProductDetailAppListDto {
  @IsNumber()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  product_app_id: number;
}

export interface ProductDetailAppResponse {
  brand_name: string;
  product_name: string;
  price: string;
  original_price: string;
  discount: number;
  give_point: number;
  sell_start_dt: string;
  sell_end_dt: string;
  product_app_id: number;
  product_detail_app_id: number;
  option_type: string;
  option_amount: number;
  option_unit: string;
  option_gender: string;
  quantity: number;
  delivery_fee: number;
  remote_delivery_fee: number;
  free_shipping_amount: number;
  inquiry_phone_number: string;
  today_send_yn: string;
  today_send_time: string;
  not_today_send_day: string;
  courier_code: string;
}