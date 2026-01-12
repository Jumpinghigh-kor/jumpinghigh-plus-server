import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('member_exercise_app')
export class MemberExerciseApp {
  @PrimaryGeneratedColumn()
  exercise_app_id: number;

  @Column({ name: 'account_app_id' })
  account_app_id: number;

  @Column({ name: 'exercise_dt' })
  exercise_dt: string;

  @Column({ name: 'jumping_exercise_time' })
  jumping_exercise_time: string;

  @Column({ name: 'jumping_intensity_level' })
  jumping_intensity_level: string;

  @Column({ name: 'jumping_heart_rate', nullable: true })
  jumping_heart_rate: string; 

  @Column({ name: 'other_exercise_type' })
  other_exercise_type: string;

  @Column({ name: 'other_exercise_time' })
  other_exercise_time: string;

  @Column({ name: 'other_exercise_calory' })
  other_exercise_calory: number;

  @Column({ name: 'reg_dt' })
  reg_dt: string;

  @Column({ name: 'reg_id' })
  reg_id: number;

  @Column({ name: 'mod_dt' })
  mod_dt: string;

  @Column({ name: 'mod_id', nullable: true })
  mod_id: number;
} 