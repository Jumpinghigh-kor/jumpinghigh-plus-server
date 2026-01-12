import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SelectMemberImgFileDto {
  @IsNotEmpty()
  @IsNumber()
  account_app_id: number;
}

export class MemberImgFileCntDto {
  @IsNotEmpty()
  @IsNumber()
  account_app_id: number;
}

export class InsertMemberImgFileDto {
  @IsNotEmpty()
  @IsNumber()
  account_app_id: number;

  @IsNotEmpty()
  @IsNumber()
  file_id: number;

  @IsOptional()
  @IsString()
  use_yn: string;

  @IsOptional()
  @IsString()
  del_yn: string;

  @IsOptional()
  reg_dt: string;

  @IsOptional()
  @IsNumber()
  reg_id: number;

  @IsOptional()
  mod_dt: string;

  @IsOptional()
  @IsNumber()
  mod_id: number;
}

export class UpdateMemberImgFileDto {
  @IsNotEmpty()
  @IsNumber()
  member_img_id: number;

  @IsOptional()
  @IsNumber()
  account_app_id: number;
}

export class DeleteMemberImgFileDto {
  @IsNotEmpty()
  @IsNumber()
  member_img_id: number;

  @IsOptional()
  @IsNumber()
  account_app_id: number;
}

export class MemberImgFileDto {} 