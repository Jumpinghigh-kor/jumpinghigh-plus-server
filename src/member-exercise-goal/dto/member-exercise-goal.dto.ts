import { IsNumber, IsOptional, IsString, IsIn, IsDate, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class InsertMemberExerciseGoalDto {
  @IsNumber()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  account_app_id: number;

  @IsString()
  goal_calory: string;

  @IsString()
  goal_period: string;
}

export class UpdateMemberExerciseGoalDto {
  @IsNumber()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  exercise_goal_id: number;

  @IsNumber()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  account_app_id: number;

  @IsString()
  goal_calory: string;
}

export class GetMemberExerciseGoalDto {
  @IsNumber()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  account_app_id: number;
  
  @IsString()
  goal_period: string;
}

export interface MemberExerciseGoalResponse {
  goal_calory: string;
  exercise_goal_id: number;
}

// DTOs will be implemented later 