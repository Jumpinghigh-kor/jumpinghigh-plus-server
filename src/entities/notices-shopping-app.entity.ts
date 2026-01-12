import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('notices_shopping_app')
export class NoticesShoppingApp {
  @PrimaryGeneratedColumn()
  notices_shopping_app_id: number;

  @Column({ name: 'notices_type' })
  notices_type: string;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'content' })
  content: string;

  @Column({ name: 'start_dt' })
  start_dt: string;

  @Column({ name: 'end_dt' })
  end_dt: string;

  @Column({ name: 'view_yn', default: 'Y' })
  view_yn: string;

  @Column({ name: 'del_yn', default: 'N' })
  del_yn: string;

  @Column({ name: 'reg_dt' })
  reg_dt: string;

  @Column({ name: 'reg_id' })
  reg_id: number;

  @Column({ name: 'mod_dt' })
  mod_dt: string;

  @Column({ name: 'mod_id' })
  mod_id: number;
} 