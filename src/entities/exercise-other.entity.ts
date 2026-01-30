import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('exercise_other')
export class ExerciseOther {
  @PrimaryGeneratedColumn()
  exercise_other_id: number;

  // 스키마에서 VARCHAR(45)로 되어있어 string으로 매핑
  @Column({ name: 'exercise_app_id', type: 'int' })
  exercise_app_id: number;

  @Column({ name: 'other_exercise_type', type: 'varchar', length: 45, nullable: true })
  other_exercise_type: string | null;

  @Column({ name: 'other_exercise_time', type: 'varchar', length: 4, nullable: true })
  other_exercise_time: string | null;

  @Column({ name: 'other_exercise_calory', type: 'int', nullable: true })
  other_exercise_calory: number | null;

  // 신규 컬럼 (VARCHAR(1) NULL)
  @Column({ name: 'del_yn', type: 'varchar', length: 1, nullable: true })
  del_yn: string | null;

  @Column({ name: 'reg_dt', type: 'varchar', length: 14, nullable: true })
  reg_dt: string | null;

  @Column({ name: 'reg_id', type: 'int', nullable: true })
  reg_id: number | null;

  @Column({ name: 'mod_dt', type: 'varchar', length: 14, nullable: true })
  mod_dt: string | null;

  @Column({ name: 'mod_id', type: 'int', nullable: true })
  mod_id: number | null;
}


