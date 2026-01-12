import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetMemberInfoDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;
}

export class UpdateMemberAppPasswordDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsNotEmpty()
  @IsString()
  current_password: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class FindPasswordDto {
  @IsNotEmpty()
  @IsString()
  mem_name: string;

  @IsNotEmpty()
  @IsString()
  mem_phone: string;

  @IsNotEmpty()
  @IsString()
  login_id: string;
}

export class UpdatePushTokenDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsNotEmpty()
  @IsString()
  push_token: string;
}

export class UpdatePushYnDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsNotEmpty()
  @IsString()
  push_yn: string;
}

export interface MemberInfoResponse {
  mem_id: number;
  mem_name: string;
  mem_phone: string;
  mem_birth: string;
  mem_gender: string;
  mem_checkin_number: string;
  mem_manager: string;
  mem_sch_id: number;
  account_app_id: number;
  login_id: string;
  password: string;
  nickname: string;
  status: number;
  center_id: number;
  total_point: number;
  coupon_cnt: number;
  cart_cnt: number;
  push_yn: string;
  push_token: string;
} 