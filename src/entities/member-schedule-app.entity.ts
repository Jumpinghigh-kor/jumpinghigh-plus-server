import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('member_schedule_app')
export class MemberSchedule {
  @PrimaryGeneratedColumn()
  sch_app_id: number;

  @Column()
  account_app_id: number;

  @Column()
  original_sch_id: number;

  @Column()
  reservation_sch_id: number;

  @Column()
  sch_dt: number;

  @Column({ type: 'varchar', length: 1, nullable: true })
  agree_yn: string;

  @Column({ type: 'varchar', length: 1, default: 'N' })
  del_yn: string;

  @Column()
  admin_memo: string;

  @Column({ type: 'varchar', length: 14 })
  reg_dt: string;

  @Column()
  reg_id: number;

  @Column({ type: 'varchar', length: 14, nullable: true })
  mod_dt: string;

  @Column({ nullable: true })
  mod_id: number;
} 