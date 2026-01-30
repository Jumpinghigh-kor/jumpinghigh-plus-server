import { ArrayNotEmpty, IsIn, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class InsertMemberExerciseAppDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsNotEmpty()
  exercise_dt: string;

  @IsOptional()
  session?: string;

  @IsOptional()
  member_type?: string;

  @IsOptional()
  intensity_level?: string;

  @IsOptional()
  skill_level?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' ? null : Number(value),
  )
  average_heart_rate?: number | null;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' ? null : Number(value),
  )
  max_heart_rate?: number | null;

  // exercise_jumping 신규 컬럼 (INT NOT NULL)
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' ? null : Number(value),
  )
  jumping_calory?: number | null;

  // 신규 구조: 점핑 세션 여러 row
  @IsOptional()
  jumping_sessions?: Array<{
    session: string;
    intensity_level?: string;
    skill_level?: string;
    lesson?: string;
    lesson_type?: string;
    jumping_minute?: string;
    average_heart_rate?: number | null;
    max_heart_rate?: number | null;
    jumping_calory?: number | null;
    del_yn?: string;
  }>;

  @IsOptional()
  other_exercise_type?: string;

  @IsOptional()
  other_exercise_time?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' ? null : Number(value),
  )
  other_exercise_calory?: number | null;

  // 프론트 호환: camelCase 지원 (ValidationPipe forbidNonWhitelisted 대응)
  @IsOptional()
  otherExerciseType?: string;

  @IsOptional()
  otherExerciseTime?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' ? null : Number(value),
  )
  otherExerciseCalory?: number | null;

  // 신규 구조: 기타 운동 별도 row
  @IsOptional()
  exercise_other?:
    | {
        other_exercise_type?: string;
        other_exercise_time?: string;
        other_exercise_calory?: number | null;
      del_yn?: string;
      }
    | Array<{
        other_exercise_type?: string;
        other_exercise_time?: string;
        other_exercise_calory?: number | null;
      del_yn?: string;
      }>
    | null;

  // 프론트 호환: camelCase 지원 (exerciseOther)
  @IsOptional()
  exerciseOther?:
    | {
        other_exercise_type?: string;
        other_exercise_time?: string;
        other_exercise_calory?: number | null;
        del_yn?: string;
      }
    | Array<{
        other_exercise_type?: string;
        other_exercise_time?: string;
        other_exercise_calory?: number | null;
        del_yn?: string;
      }>
    | null;

  @IsOptional()
  del_yn?: string;

  @IsNotEmpty()
  reg_dt: string;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  reg_id: number;

  @IsOptional()
  mod_dt?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' ? null : Number(value),
  )
  mod_id?: number | null;
}

export class UpdateMemberExerciseAppDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  exercise_app_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsOptional()
  session?: string;

  @IsOptional()
  member_type?: string;

  @IsOptional()
  intensity_level?: string;

  @IsOptional()
  skill_level?: string;

  // 구 구조(호환): exercise_jumping 추가 컬럼
  @IsOptional()
  lesson?: string;

  @IsOptional()
  lesson_type?: string;

  @IsOptional()
  jumping_minute?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' ? null : Number(value),
  )
  average_heart_rate?: number | null;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' ? null : Number(value),
  )
  max_heart_rate?: number | null;

  // exercise_jumping 신규 컬럼 (INT NOT NULL)
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' ? null : Number(value),
  )
  jumping_calory?: number | null;

  // 신규 구조: 점핑 세션 여러 row
  @IsOptional()
  jumping_sessions?: Array<{
    session: string;
    intensity_level?: string;
    skill_level?: string;
    lesson?: string;
    lesson_type?: string;
    jumping_minute?: string;
    average_heart_rate?: number | null;
    max_heart_rate?: number | null;
    jumping_calory?: number | null;
    del_yn?: string;
  }>;

  @IsOptional()
  other_exercise_type?: string;

  @IsOptional()
  other_exercise_time?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' ? null : Number(value),
  )
  other_exercise_calory?: number | null;

  // 신규 구조: 기타 운동 별도 row
  @IsOptional()
  exercise_other?:
    | {
        exercise_other_id?: number | null;
        other_exercise_type?: string;
        other_exercise_time?: string;
        other_exercise_calory?: number | null;
      del_yn?: string;
      }
    | Array<{
        exercise_other_id?: number | null;
        other_exercise_type?: string;
        other_exercise_time?: string;
        other_exercise_calory?: number | null;
      del_yn?: string;
      }>
    | null;
}

export class GetExerciseJumpingDetailDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsNotEmpty()
  exercise_dt: string;
}

export class GetExerciseOtherDetailDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsNotEmpty()
  exercise_dt: string;
}

export class DeleteMemberExerciseAppDto {
  // 단건 삭제(기존 호환)
  @IsOptional()
  @Transform(({ value }) => Number(value))
  exercise_app_id?: number;

  // 다건 삭제(프론트 "전체 삭제" 용)
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => (Array.isArray(value) ? value.map(Number) : value))
  exercise_app_id_list?: number[];

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;
}

export class DeleteExerciseJumpingDto {
  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => (Array.isArray(value) ? value.map(Number) : value))
  exercise_jumping_ids: number[];

  @IsOptional()
  @Transform(({ value }) => Number(value))
  account_app_id?: number;
}

export class DeleteExerciseOtherDto {
  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => (Array.isArray(value) ? value.map(Number) : value))
  exercise_other_ids: number[];

  @IsOptional()
  @Transform(({ value }) => Number(value))
  account_app_id?: number;
}
export class GetMemberExerciseAppListDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsOptional()
  year_month?: string;

  @IsOptional()
  period?: string;
}

export interface ExerciseJumpingDetailResponse {
  exercise_app_id: number;
  account_app_id: number;
  exercise_dt: string;
  member_type: string;
  session: string;
  intensity_level: string;
  skill_level: string;
  average_heart_rate?: number;
  max_heart_rate?: number;
  jumping_calory?: number;
}

export interface ExerciseOtherDetailResponse {
  exercise_app_id: number;
  account_app_id: number;
  exercise_dt: string;
  member_type: string;
  other_exercise_type: string;
  other_exercise_time: string;
  other_exercise_calory: number;
}

export interface MemberExerciseAppListResponse {
  exercise_app_id: number;
  account_app_id: number;
  exercise_dt: string;
  session: string;
  member_type: string;
  intensity_level: string;
  skill_level: string;
  average_heart_rate: number;
  max_heart_rate: number;
  jumping_calory: number;
  other_exercise_type: string;
  other_exercise_time: string;
  other_exercise_calory: number;
} 