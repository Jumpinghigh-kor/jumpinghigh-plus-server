import { IsNotEmpty, IsNumber, IsString, IsOptional, IsArray, ArrayNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetPostAppListDto {
  @IsNotEmpty()
  @IsNumber()
  account_app_id: number;

  @IsNotEmpty()
  @IsString()
  post_type: string;
}

export interface PostAppListResponse {
  title: string;
  content: string;
  post_app_id: number;
  reg_dt: string;
}

export class InsertMemberPostAppDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  post_app_id: number;
}

export class UpdateMemberPostAppDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  member_post_app_id: number;

  @IsNotEmpty()
  @IsString()
  read_yn: string;
}

export class DeleteMemberPostAppDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((v: any) => Number(v));
    }
    if (typeof value === 'string') {
      // "1,2,3" 또는 "1" 같은 문자열도 허용
      return value.split(',').map((v: string) => Number(v.trim()));
    }
    return [Number(value)];
  })
  @IsNumber({}, { each: true })
  post_app_id: number[];
}