import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('member_coupon_app')
export class MemberCouponApp {
  @PrimaryGeneratedColumn()
  member_coupon_app_id: number;

  @Column()
  account_app_id: number;

  @Column()
  coupon_app_id: number;
  
  @Column()
  use_yn: string;

  @Column({ nullable: true })
  use_dt: string;
  
  @Column()
  reg_dt: string;
  
  @Column()
  reg_id: number;
  
  @Column({ nullable: true })
  mod_dt: string;
  
  @Column({ nullable: true })
  mod_id: number;
}

export class GetMemberCouponAppListDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsOptional()
  use_yn?: string;

  @IsOptional()
  date?: string;
} 

export class GetCouponAppDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  product_app_id: number;
}

export class MemberCouponAppListResponse {
  coupon_app_id: number;
  product_app_id: number;
  discount_type: string;
  discount_amount: number;
  min_order_amount: number;
  description: string;
  start_dt: string;
  end_dt: string;
  coupon_notice: string;
  use_yn: string;
  badge_text: string;
  full_end_dt: string;
} 

export class DeleteMemberCouponAppDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  member_coupon_app_id: number;
} 

export class UpdateMemberCouponAppDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  member_coupon_app_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  order_app_id: number;

  @IsNotEmpty()
  use_yn: string;
} 