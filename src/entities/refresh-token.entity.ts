import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('refresh_token')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  refresh_token_id: number;

  @Column()
  account_app_id: number;

  @Column()
  token: string;

  @Column()
  expires_dt: string;

  @Column({ default: 'N' })
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