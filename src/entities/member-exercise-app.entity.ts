import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('member_exercise_app')
export class MemberExerciseApp {
  @PrimaryGeneratedColumn()
  exercise_app_id: number;

  @Column({ name: 'account_app_id' })
  account_app_id: number;

  @Column({ name: 'exercise_dt' })
  exercise_dt: string;

  @Column({ name: 'member_type', nullable: true })
  member_type: string;

  @Column({ name: 'del_yn', type: 'varchar', length: 1, nullable: true, default: 'N' })
  del_yn: string;

  @Column({ name: 'reg_dt' })
  reg_dt: string;

  @Column({ name: 'reg_id' })
  reg_id: number;

  @Column({ name: 'mod_dt' })
  mod_dt: string;

  @Column({ name: 'mod_id', nullable: true })
  mod_id: number;
} 