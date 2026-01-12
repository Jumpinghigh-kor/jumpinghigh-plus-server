import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchProductDto {
  @IsNotEmpty()
  @IsString()
  keyword: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  account_app_id?: number;

  @IsOptional()
  @IsString()
  search_type?: string;
}

export class GetMemberSearchAppListDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;
}

export class DeleteMemberSearchAppDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  search_app_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;
}

export class InsertMemberSearchAppDto {
  @IsNotEmpty()
  @IsString()
  keyword: string;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;
}

export interface MemberSearchResponse {
  // 응답 데이터 인터페이스 정의 예정
} 