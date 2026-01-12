import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('member_payment_app')
export class MemberPaymentApp {
  @PrimaryGeneratedColumn()
  payment_app_id: number;
  
  @Column()
  order_app_id: number;

  @Column()
  account_app_id: number;
  
  @Column()
  payment_status: string;

  @Column()
  payment_type: number;
  
  @Column({ nullable: true })
  payment_method: string;

  @Column()
  payment_amount: number;
  
  @Column({ length: 14 })
  payment_dt: string;

  @Column({ nullable: true })
  portone_imp_uid: string;

  @Column({ nullable: true })
  portone_merchant_uid: string;

  @Column()
  portone_status: string;

  @Column()
  card_name: string;

  @Column({ length: 14 })
  reg_dt: string;

  @Column()
  reg_id: number;

  @Column({ length: 14, nullable: true })
  mod_dt: string;

  @Column({ nullable: true })
  mod_id: number;
} 