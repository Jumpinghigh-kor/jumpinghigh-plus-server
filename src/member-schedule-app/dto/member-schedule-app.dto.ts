import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetMemberScheduleAppDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;
}

export class GetCenterScheduleAppDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  center_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  mem_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  sch_dt: number;
}

export class InsertMemberScheduleAppDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  reservation_sch_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  original_sch_id: number;

  @IsOptional()
  @IsString()
  agree_yn: string;

  @IsNotEmpty()
  @IsString()
  sch_dt: string;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  center_id: number;

  @IsOptional()
  @IsString()
  mem_name: string;
}

export class DeleteMemberScheduleAppDto {
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map(v => Number(v));
    }
    return Number(value);
  })
  sch_app_id: number | number[];

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;
}

export class UpdateMemberScheduleAppDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  sch_app_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  reservation_sch_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  center_id: number;

  @IsOptional()
  @IsString()
  mem_name: string;

  @IsNotEmpty()
  @IsString()
  sch_dt: string;

  @IsOptional()
  @IsString()
  agree_yn: string;
}

export interface MemberScheduleResponse {
  // 응답 데이터 인터페이스 정의 예정
} 