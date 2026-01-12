import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MemberExerciseApp } from '../entities/member-exercise-app.entity';
import { InsertMemberExerciseAppDto, GetMemberExerciseAppInfoDto, MemberExerciseAppInfoResponse, UpdateMemberExerciseAppDto, GetMemberExerciseAppListDto, MemberExerciseAppListResponse } from './dto/member-exercise-app.dto';
import { COMMON_RESPONSE_CODES } from '../core/constants/response-codes';

@Injectable()
export class MemberExerciseAppService {
  constructor(
    @InjectRepository(MemberExerciseApp)
    private memberExerciseAppRepository: Repository<MemberExerciseApp>,
    private dataSource: DataSource
  ) {}

  async insertMemberExerciseApp(insertMemberExerciseAppDto: InsertMemberExerciseAppDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { 
        account_app_id, 
        exercise_dt, 
        jumping_exercise_time, 
        jumping_intensity_level, 
        jumping_heart_rate,
        other_exercise_type,
        other_exercise_time,
        other_exercise_calory,
        reg_dt, 
        reg_id, 
        mod_dt, 
        mod_id 
      } = insertMemberExerciseAppDto;
      // Using the provided SQL query with QueryBuilder
      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into(MemberExerciseApp)
        .values({
          account_app_id,
          exercise_dt,
          jumping_exercise_time,
          jumping_intensity_level,
          jumping_heart_rate: jumping_heart_rate === null || jumping_heart_rate === undefined ? undefined : jumping_heart_rate,
          other_exercise_type,
          other_exercise_time,
          other_exercise_calory,
          reg_dt: () => "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')",
          reg_id,
          mod_dt,
          mod_id: mod_id === 0 || mod_id === null || mod_id === undefined ? undefined : mod_id
        })
        .execute();

      return {
        success: true,
        message: '운동 정보가 성공적으로 저장되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
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

  async updateMemberExerciseApp(updateMemberExerciseAppDto: UpdateMemberExerciseAppDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { 
        exercise_app_id,
        account_app_id,
        jumping_exercise_time, 
        jumping_intensity_level,
        jumping_heart_rate,
        other_exercise_type,
        other_exercise_time,
        other_exercise_calory
      } = updateMemberExerciseAppDto;

      // 필드 값 설정
      const updateFields = {
        jumping_exercise_time,
        jumping_intensity_level,
        other_exercise_type,
        other_exercise_time,
        other_exercise_calory,
        mod_dt: () => "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')",
        mod_id: account_app_id
      };

      if(jumping_heart_rate !== null && jumping_heart_rate !== undefined) {
        updateFields['jumping_heart_rate'] = jumping_heart_rate;
      } else {
        updateFields['jumping_heart_rate'] = null;
      }
      
      // Using the provided SQL query with QueryBuilder
      const result = await this.memberExerciseAppRepository
        .createQueryBuilder()
        .update(MemberExerciseApp)
        .set(updateFields)
        .where("exercise_app_id = :exercise_app_id", { exercise_app_id })
        .execute();

      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 운동 정보를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        message: '운동 정보가 성공적으로 업데이트되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
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

  async getMemberExerciseAppInfo(getMemberExerciseAppInfoDto: GetMemberExerciseAppInfoDto): Promise<{ success: boolean; data: MemberExerciseAppInfoResponse | null; code: string }> {
    try {
      const { account_app_id, exercise_dt } = getMemberExerciseAppInfoDto;
      // Using the provided SQL query
      const exerciseInfo = await this.memberExerciseAppRepository
        .createQueryBuilder('me')
        .select([
          'exercise_app_id',
          'account_app_id',
          'exercise_dt',
          'jumping_exercise_time',
          'jumping_intensity_level',
          'jumping_heart_rate',
          'other_exercise_type',
          'other_exercise_time',
          'other_exercise_calory'
        ])
        .where('me.account_app_id = :account_app_id', { account_app_id })
        .andWhere('me.exercise_dt = :exercise_dt', { exercise_dt })
        .getRawOne();

      if (!exerciseInfo) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: exerciseInfo,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
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

  async getMemberExerciseAppList(getMemberExerciseAppListDto: GetMemberExerciseAppListDto): Promise<{ success: boolean; data: MemberExerciseAppListResponse[] | null; code: string }> {
    try {
      const { account_app_id, year_month, period } = getMemberExerciseAppListDto;
      
      // 기본 쿼리 빌더
      const queryBuilder = this.memberExerciseAppRepository
        .createQueryBuilder('me')
        .select([
          'exercise_app_id',
          'account_app_id',
          'exercise_dt',
          'jumping_exercise_time',
          'jumping_intensity_level',
          'jumping_heart_rate',
          'other_exercise_type',
          'other_exercise_time',
          'other_exercise_calory'
        ])
        .where('me.account_app_id = :account_app_id', { account_app_id });
      
      // all_date가 true이면 모든 날짜 데이터 조회 (추가 조건 없음)
      if (year_month === 'all_date') {
        // 모든 날짜 데이터를 조회하므로 추가 조건 없음
      } else if (period) {
        // 현재 날짜 자동으로 구하기
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // 0-11이므로 +1
        const currentDay = now.getDate();
        
        switch(period) {
          case 'day':
            // day는 기본 조건 (year_month로 필터링)
            if (year_month) {
              queryBuilder.andWhere("me.exercise_dt like :exerciseDt", { exerciseDt: `%${year_month}%` });
            }
            break;
            
          case 'week':
            // 현재 달 기준으로 주 단위로 분리
            // MySQL DATE_FORMAT과 WEEK 함수를 사용하여 같은 주에 속하는 날짜 가져오기
            queryBuilder.andWhere(`
              YEAR(STR_TO_DATE(me.exercise_dt, '%Y%m%d')) = :year AND 
              MONTH(STR_TO_DATE(me.exercise_dt, '%Y%m%d')) = :month
            `, { 
              year: currentYear, 
              month: currentMonth
            });
            break;
            
          case 'month':
            // 12개월 모두 가져오기 (현재 연도)
            queryBuilder.andWhere(`
              YEAR(STR_TO_DATE(me.exercise_dt, '%Y%m%d')) = :year
            `, { 
              year: currentYear
            });
            break;
            
          case 'year':
            // 현재 연도부터 5년 전까지 (총 6년)
            const startYear = currentYear - 5; // 5년 전
            const endYear = currentYear; // 현재 연도
            
            queryBuilder.andWhere(`
              SUBSTRING(me.exercise_dt, 1, 4) >= :startYear AND
              SUBSTRING(me.exercise_dt, 1, 4) <= :endYear
            `, { 
              startYear: startYear.toString(),
              endYear: endYear.toString()
            });
            break;
        }
      } else if (year_month) {
        // category_dt가 없고 year_month만 있는 경우 기존 로직 사용
        queryBuilder.andWhere("me.exercise_dt like :exerciseDt", { exerciseDt: `%${year_month}%` });
      }
      
      const exerciseList = await queryBuilder
        .orderBy('me.exercise_dt', 'DESC')
        .getRawMany();

      if (!exerciseList || exerciseList.length === 0) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      // 결과를 category_dt에 맞게 추가 가공
      let processedData = exerciseList;
      
      if (period === 'week' || period === 'month' || period === 'year') {
        // 데이터 그룹화 및 요약 로직을 여기에 추가할 수 있음
        // 예: 주별/월별/연별 합계 또는 평균을 계산
      }

      return {
        success: true,
        data: processedData,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
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