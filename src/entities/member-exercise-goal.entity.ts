import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('member_exercise_goal')
export class MemberExerciseGoal {
  @PrimaryGeneratedColumn()
  goal_id: number;

  @Column()
  account_app_id: number;

  @Column()
  goal_calory: number;

  @Column({ length: 14 })
  reg_dt: string;

  @Column()
  reg_id: number;

  @Column({ length: 14, nullable: true })
  mod_dt: string;

  @Column({ nullable: true })
  mod_id: number;

  // Additional fields will be added later
} 