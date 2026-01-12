import { IsNumber, IsOptional, IsString, IsIn, IsArray, ValidateNested, Min, Max, ArrayMaxSize } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetMemberReviewAppListDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  product_app_id?: number;

  @IsOptional()
  @IsString()
  filter?: string;

  @IsOptional()
  @IsString()
  review_img_yn?: string;
}

export class ReviewImageDto {
  @IsString()
  file_name: string;
}

export class InsertMemberReviewAppDto {
  @IsNumber()
  account_app_id: number;

  @IsNumber()
  order_app_id: number;

  @IsNumber()
  product_app_id: number;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => typeof value === 'string' ? parseInt(value) : value)
  star_point: number;

  @IsNumber()
  reg_id: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMaxSize(3)
  @Type(() => ReviewImageDto)
  images?: ReviewImageDto[];
}

export class UpdateMemberReviewAppDto {
  @IsNumber()
  review_app_id: number;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  star_point: number;

  @IsNumber()
  account_app_id: number;
}

export class DeleteMemberReviewAppDto {
  @IsNumber()
  review_app_id: number;

  @IsNumber()
  account_app_id: number;
}

export class GetMemberReviewAppImgDto {
  @IsOptional()
  @IsNumber()
  review_app_id?: number;
}