import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('inquiry_app')
export class InquiryApp {
  @PrimaryGeneratedColumn()
  inquiry_app_id: number;

  @Column({ name: 'account_app_id' })
  account_app_id: number;

  @Column({ name: 'inquiry_type' })
  inquiry_type: string;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'content' })
  content: string;

  @Column({ name: 'answer', nullable: true })
  answer: string;

  @Column({ name: 'answer_dt', nullable: true })
  answer_dt: string;

  @Column({ name: 'reg_dt' })
  reg_dt: string;

  @Column({ name: 'reg_id' })
  reg_id: number;

  @Column({ name: 'mod_dt', nullable: true })
  mod_dt: string;

  @Column({ name: 'mod_id', nullable: true })
  mod_id: number;

  @Column({ name: 'del_yn', default: 'N', nullable: true })
  del_yn: string;
} 