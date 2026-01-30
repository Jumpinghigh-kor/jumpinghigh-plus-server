import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// NOTE: 다른 모듈들과 동일하게 dto 폴더/파일 구성을 맞추기 위한 스캐폴딩입니다.

@Entity('member_body_app')
export class MemberBodyApp {
  @PrimaryGeneratedColumn()
  body_app_id: number;

  @Column({ type: 'int', nullable: true })
  account_app_id: number;

  @Column({ type: 'int', nullable: true })
  height: number;

  @Column({ type: 'int', nullable: true })
  weight: number;

  @Column({ type: 'varchar', nullable: true })
  birthday: string;

  @Column({ type: 'varchar', length: 1, default: 'N' })
  del_yn: string;

  @Column({ type: 'varchar', length: 14, nullable: true })
  reg_dt: string;

  @Column({ type: 'int', nullable: true })
  reg_id: number;

  @Column({ type: 'varchar', length: 14, nullable: true })
  mod_dt: string;

  @Column({ type: 'int', nullable: true })
  mod_id: number;
}

export class GetMemberBodyAppDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  // 프론트에서 reg_id로 보내는 경우 대응
  @IsOptional()
  @Transform(({ value }) => Number(value))
  reg_id?: number;

  @IsOptional()
  reg_ym?: string;
}

export class InsertMemberBodyAppDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;
  
  @IsOptional()
  @Transform(({ value }) => Number(value))
  height?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  weight?: number;

  @IsOptional()
  @Transform(({ value }) => String(value))
  birthday?: string;

  // 프론트에서 같이 보내는 경우가 있어 validation 통과용으로 허용
  @IsOptional()
  @IsIn(['N', 'Y'])
  del_yn?: 'N' | 'Y';

  @IsOptional()
  @IsString()
  reg_dt?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  reg_id?: number;

  @IsOptional()
  @IsString()
  mod_dt?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  mod_id?: number;
}

export class UpdateMemberBodyAppDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  body_app_id: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  height?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  weight?: number;

  @IsOptional()
  @Transform(({ value }) => String(value))
  birthday?: string;
}


