import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('member_order_app')
export class MemberOrderApp {
  @PrimaryGeneratedColumn()
  order_app_id: number;

  @Column()
  account_app_id: number;

  @Column({ length: 14 })
  order_dt: string;

  @Column({ nullable: true })
  order_memo: string;

  @Column({ length: 14, nullable: true })
  order_memo_dt: string;

  @Column({ nullable: true })
  memo_check_yn: string;

  @Column({ nullable: true })
  memo_del_yn: string;

  @Column()
  del_yn: string;

  @Column({ length: 14 })
  reg_dt: string;

  @Column()
  reg_id: number;

  @Column({ length: 14, nullable: true })
  mod_dt: string;

  @Column({ nullable: true })
  mod_id: number;
} 