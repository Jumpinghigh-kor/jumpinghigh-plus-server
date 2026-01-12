import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class InsertMemberZzimAppDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  product_app_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;
}

export class UpdateMemberZzimAppDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  zzim_app_id: number;

  @IsNotEmpty()
  @IsString()
  zzim_yn: string;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;
}

export class GetMemberZzimAppListDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;
}

export class GetMemberZzimAppDetailDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  product_app_id: number;
}

export interface MemberZzimResponse {
  // 응답 데이터 인터페이스 정의 예정
} 