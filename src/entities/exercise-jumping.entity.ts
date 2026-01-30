import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('exercise_jumping')
export class ExerciseJumping {
  @PrimaryGeneratedColumn()
  exercise_jumping_id: number;

  @Column({ name: 'exercise_app_id' })
  exercise_app_id: number;

  @Column({ name: 'session', type: 'varchar', length: 1 })
  session: string;

  @Column({ name: 'intensity_level', type: 'varchar', length: 50, nullable: true })
  intensity_level: string | null;

  @Column({ name: 'skill_level', type: 'varchar', length: 45, nullable: true })
  skill_level: string | null;

  @Column({ name: 'average_heart_rate', type: 'int', nullable: true })
  average_heart_rate: number | null;

  @Column({ name: 'max_heart_rate', type: 'int', nullable: true })
  max_heart_rate: number | null;

  // 신규 컬럼 (INT NOT NULL)
  @Column({ name: 'jumping_calory', type: 'int' })
  jumping_calory: number;

  // 신규 컬럼 (VARCHAR(45) NULL)
  @Column({ name: 'lesson', type: 'varchar', length: 45, nullable: true })
  lesson: string | null;

  // 신규 컬럼 (VARCHAR(45) NULL)
  @Column({ name: 'lesson_type', type: 'varchar', length: 45, nullable: true })
  lesson_type: string | null;

  // 신규 컬럼 (VARCHAR(2) NULL)
  @Column({ name: 'jumping_minute', type: 'varchar', length: 2, nullable: true })
  jumping_minute: string | null;

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


