import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('member_review_app')
export class MemberReviewApp {
  @PrimaryGeneratedColumn()
  review_app_id: number;
  
  @Column()
  order_app_id: number;
  
  @Column()
  product_app_id: number;

  @Column()
  account_app_id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  star_point: number;

  @Column({ length: 1, default: 'N' })
  del_yn: string;

  @Column({ length: 1, default: 'N' })
  admin_del_yn: string;

  @Column()
  reg_dt: string;

  @Column()
  reg_id: number;

  @Column({ nullable: true })
  mod_dt: string;

  @Column({ nullable: true })
  mod_id: number;
} 