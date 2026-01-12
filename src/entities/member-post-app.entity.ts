import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('member_post_app')
export class MemberPostApp {
  @PrimaryGeneratedColumn()
  member_post_app_id: number;
  
  @Column()
  post_app_id: number;

  @Column()
  account_app_id: number;

  @Column({ nullable: true })
  read_yn: string;

  @Column({ nullable: true })
  read_dt: string;

  @Column({ nullable: true })
  del_yn: string;

  @Column()
  reg_dt: string;

  @Column()
  reg_id: number;

  @Column({ nullable: true })
  mod_dt: string;

  @Column({ nullable: true })
  mod_id: number;
} 