import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('member_return_app')
export class MemberReturnApp {
  @PrimaryGeneratedColumn()
  return_app_id: number;
  
  @Column()
  order_detail_app_id: number;

  @Column()
  order_address_id: number;

  @Column()
  account_app_id: number;

  @Column()
  return_applicator: string;

  @Column()
  return_reason_type: string;

  @Column({ type: 'text' })
  reason: string;

  @Column()
  customer_tracking_number: string;

  @Column()
  company_tracking_number: string;

  @Column()
  customer_courier_code: string;

  @Column()
  company_courier_code: string;

  @Column()
  quantity: number;

  @Column()
  return_goodsflow_id: number;

  @Column()
  approval_yn: string;

  @Column()
  cancel_yn: string;

  @Column()
  reg_dt: string;

  @Column()
  reg_id: number;

  @Column({ nullable: true })
  mod_dt: string;

  @Column({ nullable: true })
  mod_id: number;
} 