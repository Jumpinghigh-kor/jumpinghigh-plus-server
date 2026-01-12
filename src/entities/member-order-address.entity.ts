import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('member_order_address')
export class MemberOrderAddress {
  @PrimaryGeneratedColumn()
  order_address_id: number;
  
  @Column()
  order_detail_app_id: number;
  
  @Column()
  account_app_id: number;

  @Column()
  order_address_type: string;

  @Column()
  receiver_name: string;

  @Column()
  receiver_phone: string;

  @Column()
  address: string;

  @Column()
  address_detail: string;

  @Column()
  zip_code: string;

  @Column({ nullable: true })
  enter_way: string;

  @Column({ nullable: true })
  enter_memo: string;

  @Column({ nullable: true })
  delivery_request: string;

  @Column()
  use_yn: string;

  @Column()
  reg_dt: string;

  @Column()
  reg_id: number;

  @Column({ nullable: true })
  mod_dt: string;

  @Column({ nullable: true })
  mod_id: number;
} 