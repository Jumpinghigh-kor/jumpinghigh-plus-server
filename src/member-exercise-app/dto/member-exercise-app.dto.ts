import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class InsertMemberExerciseAppDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsNotEmpty()
  exercise_dt: string;

  @IsOptional()
  jumping_exercise_time?: string;

  @IsOptional()
  jumping_intensity_level?: string;

  @IsOptional()
  @Transform(({ value }) => value === undefined || value === null || value === '' ? null : String(value))
  jumping_heart_rate?: string | null;

  @IsOptional()
  other_exercise_type?: string;

  @IsOptional()
  other_exercise_time?: string;

  @IsOptional()
  other_exercise_calory?: number;

  @IsNotEmpty()
  reg_dt: string;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  reg_id: number;

  @IsOptional()
  mod_dt?: string;

  @IsOptional()
  @Transform(({ value }) => value === undefined || value === null || value === '' ? null : Number(value))
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
  jumping_exercise_time?: string;

  @IsOptional()
  jumping_intensity_level?: string;

  @IsOptional()
  @Transform(({ value }) => value === undefined || value === null || value === '' ? null : String(value))
  jumping_heart_rate?: string | null;

  @IsOptional()
  other_exercise_type?: string;

  @IsOptional()
  other_exercise_time?: string;

  @IsOptional()
  other_exercise_calory?: number;
}

export class GetMemberExerciseAppInfoDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  account_app_id: number;

  @IsNotEmpty()
  exercise_dt: string;
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

export interface MemberExerciseAppInfoResponse {
  exercise_app_id: number;
  account_app_id: number;
  exercise_dt: string;
  jumping_exercise_time: string;
  jumping_intensity_level: string;
  jumping_heart_rate: string;
  other_exercise_type: string;
  other_exercise_time: string;
  other_exercise_calory: number;
}

export interface MemberExerciseAppListResponse {
  exercise_app_id: number;
  account_app_id: number;
  exercise_dt: string;
  jumping_exercise_time: string;
  jumping_intensity_level: string;
  jumping_heart_rate: string;
  other_exercise_type: string;
  other_exercise_time: string;
  other_exercise_calory: number;
} 