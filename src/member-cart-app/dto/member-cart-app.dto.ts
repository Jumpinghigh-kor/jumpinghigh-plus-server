import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('member_cart_app')
export class MemberCartApp {
  @PrimaryGeneratedColumn()
  cart_app_id: number;

  @Column()
  account_app_id: number;

  @Column()
  product_detail_app_id: number;
  
  @Column({ default: 1 })
  quantity: number;

  @Column()
  cart_yn: string;
  
  @Column({ nullable: true })
  reg_dt: string;
  
  @Column({ nullable: true })
  reg_id: number;
  
  @Column({ nullable: true })
  mod_dt: string;
  
  @Column({ nullable: true })
  mod_id: number;
}

export class GetMemberCartAppListDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;
} 

export class MemberCartAppListResponse {
  cart_app_id: number;
  account_app_id: number;
  product_detail_app_id: number;
  quantity: number;
  cart_yn: string;
} 

export class DeleteMemberCartAppDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  cart_app_id: number;
} 

export class UpdateMemberCartAppDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  cart_app_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  product_detail_app_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  quantity: number;
} 