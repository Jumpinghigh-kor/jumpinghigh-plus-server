import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('inquiry_shopping_app')
export class InquiryShoppingApp {
  @PrimaryGeneratedColumn()
  inquiry_shopping_app_id: number;

  @Column({ name: 'account_app_id' })
  account_app_id: number;

  @Column({ name: 'product_app_id' })
  product_app_id: number;

  @Column({ name: 'content' })
  content: string;
  
  @Column({ name: 'del_yn', default: 'N', nullable: true })
  del_yn: string;

  @Column({ name: 'reg_dt' })
  reg_dt: string;

  @Column({ name: 'reg_id' })
  reg_id: number;

  @Column({ name: 'mod_dt', nullable: true })
  mod_dt: string;

  @Column({ name: 'mod_id', nullable: true })
  mod_id: number;
} 