import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { COMMON_RESPONSE_CODES } from '../core/constants/response-codes';
import { MemberExerciseGoal } from '../entities/member-exercise-goal.entity';
import { InsertMemberExerciseGoalDto, UpdateMemberExerciseGoalDto, GetMemberExerciseGoalDto, MemberExerciseGoalResponse } from './dto/member-exercise-goal.dto';
import { getCurrentDateYYYYMMDDHHIISS } from '../core/utils/date.utils';

@Injectable()
export class MemberExerciseGoalService {
  constructor(
    @InjectRepository(MemberExerciseGoal)
    private memberExerciseGoalRepository: Repository<MemberExerciseGoal>,
    private dataSource: DataSource
  ) {}

  async insertMemberExerciseGoal(insertMemberExerciseGoalDto: InsertMemberExerciseGoalDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { account_app_id, goal_calory, goal_period } = insertMemberExerciseGoalDto;
      
      // 현재 시간 (YYYYMMDDHHIISS 형식)
      const currentDate = getCurrentDateYYYYMMDDHHIISS();
      
      // TypeORM QueryBuilder 사용하여 데이터 삽입
      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into('member_exercise_goal')
        .values({
          account_app_id: account_app_id,
          goal_calory: goal_calory,
          goal_period: goal_period,
          reg_dt: currentDate,
          reg_id: account_app_id,
          mod_dt: currentDate,
          mod_id: account_app_id
        })
        .execute();
      
      return {
        success: true,
        message: '운동 목표가 성공적으로 등록되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error creating exercise goal:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message,
          code: COMMON_RESPONSE_CODES.FAIL
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateMemberExerciseGoal(updateMemberExerciseGoalDto: UpdateMemberExerciseGoalDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { exercise_goal_id, account_app_id, goal_calory } = updateMemberExerciseGoalDto;
      // 현재 시간 (YYYYMMDDHHIISS 형식)
      const currentDate = getCurrentDateYYYYMMDDHHIISS();
      
      // TypeORM QueryBuilder 사용하여 데이터 업데이트
      const result = await this.dataSource
        .createQueryBuilder()
        .update('member_exercise_goal')
        .set({
          goal_calory: goal_calory,
          mod_dt: currentDate,
          mod_id: account_app_id
        })
        .where('exercise_goal_id = :exercise_goal_id', { exercise_goal_id })
        .execute();
      
      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 운동 목표를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }
      
      return {
        success: true,
        message: '운동 목표가 성공적으로 업데이트되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error updating exercise goal:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message,
          code: COMMON_RESPONSE_CODES.FAIL
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getMemberExerciseGoal(getMemberExerciseGoalDto: GetMemberExerciseGoalDto): Promise<{ success: boolean; data: MemberExerciseGoalResponse | null; code: string }> {
    try {
      const { account_app_id, goal_period } = getMemberExerciseGoalDto;

      // TypeORM QueryBuilder 사용하여 데이터 조회
      const goal = await this.dataSource
        .createQueryBuilder()
        .select(['goal_calory', 'exercise_goal_id'])
        .from('member_exercise_goal', 'meg')
        .where('account_app_id = :account_app_id', { account_app_id })
        .andWhere('goal_period = :goal_period', { goal_period })
        .getRawOne();
      
      if (!goal) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }
      
      return {
        success: true,
        data: {
          goal_calory: goal.goal_calory,
          exercise_goal_id: goal.exercise_goal_id
        },
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error getting exercise goal:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message,
          code: COMMON_RESPONSE_CODES.FAIL
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 