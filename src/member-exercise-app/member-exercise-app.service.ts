import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MemberExerciseApp } from '../entities/member-exercise-app.entity';
import { ExerciseJumping } from '../entities/exercise-jumping.entity';
import { ExerciseOther } from '../entities/exercise-other.entity';
import { InsertMemberExerciseAppDto, UpdateMemberExerciseAppDto, GetMemberExerciseAppListDto, MemberExerciseAppListResponse, GetExerciseJumpingDetailDto, GetExerciseOtherDetailDto, ExerciseJumpingDetailResponse, ExerciseOtherDetailResponse } from './dto/member-exercise-app.dto';
import { COMMON_RESPONSE_CODES } from '../core/constants/response-codes';
import { getCurrentDateYYYYMMDDHHIISS } from '../core/utils/date.utils';

@Injectable()
export class MemberExerciseAppService {
  constructor(
    @InjectRepository(MemberExerciseApp)
    private memberExerciseAppRepository: Repository<MemberExerciseApp>,
    @InjectRepository(ExerciseJumping)
    private exerciseJumpingRepository: Repository<ExerciseJumping>,
    @InjectRepository(ExerciseOther)
    private exerciseOtherRepository: Repository<ExerciseOther>,
    private dataSource: DataSource
  ) {}

  async getExerciseJumpingDetail(getExerciseJumpingDetailDto: GetExerciseJumpingDetailDto): Promise<{ success: boolean; data: ExerciseJumpingDetailResponse[] | null; code: string }> {
    try {
      const { account_app_id, exercise_dt } = getExerciseJumpingDetailDto;
      
      const exerciseJumpingDetail = await this.dataSource
        .createQueryBuilder()
        .select([
          'mea.exercise_app_id AS exercise_app_id',
          'mea.account_app_id AS account_app_id',
          'mea.exercise_dt AS exercise_dt',
          'mea.member_type AS member_type',
          'ej.exercise_jumping_id AS exercise_jumping_id',
          'ej.session AS session',
          'ej.intensity_level AS intensity_level',
          'ej.skill_level AS skill_level',
          'ej.average_heart_rate AS average_heart_rate',
          'ej.max_heart_rate AS max_heart_rate',
          'ej.jumping_calory AS jumping_calory',
          'ej.jumping_minute AS jumping_minute',
          'ej.lesson AS lesson',
          'ej.lesson_type AS lesson_type',
        ])
        .from('member_exercise_app', 'mea')
        .leftJoin('exercise_jumping', 'ej', 'ej.exercise_app_id = mea.exercise_app_id')
        .where('mea.account_app_id = :account_app_id', { account_app_id })
        .andWhere('mea.exercise_dt = :exercise_dt', { exercise_dt })
        .andWhere('mea.del_yn = "N"')
        .andWhere('ej.del_yn = "N"')
        .orderBy('mea.exercise_app_id', 'DESC')
        .getRawMany();

      if (!exerciseJumpingDetail || exerciseJumpingDetail.length === 0) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: exerciseJumpingDetail,
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

  async getExerciseOtherDetail(getExerciseOtherDetailDto: GetExerciseOtherDetailDto): Promise<{ success: boolean; data: ExerciseOtherDetailResponse[] | null; code: string }> {
    try {
      const { account_app_id, exercise_dt } = getExerciseOtherDetailDto;
      
      const exerciseOtherDetail = await this.dataSource
        .createQueryBuilder()
        .select([
          'mea.exercise_app_id AS exercise_app_id',
          'mea.account_app_id AS account_app_id',
          'mea.exercise_dt AS exercise_dt',
          'mea.member_type AS member_type',
          'eo.exercise_other_id AS exercise_other_id',
          'eo.other_exercise_type AS other_exercise_type',
          'eo.other_exercise_time AS other_exercise_time',
          'eo.other_exercise_calory AS other_exercise_calory',
        ])
        .from('member_exercise_app', 'mea')
        .leftJoin('exercise_other', 'eo', 'eo.exercise_app_id = mea.exercise_app_id')
        .where('mea.account_app_id = :account_app_id', { account_app_id })
        .andWhere('mea.exercise_dt = :exercise_dt', { exercise_dt })
        .andWhere('mea.del_yn = "N"')
        .andWhere('eo.del_yn = "N"')
        .orderBy('mea.exercise_app_id', 'DESC')
        .getRawMany();

      if (!exerciseOtherDetail || exerciseOtherDetail.length === 0) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: exerciseOtherDetail as ExerciseOtherDetailResponse[],
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
      const queryBuilder = this.dataSource
        .createQueryBuilder()
        .select([
          'mea.exercise_app_id AS exercise_app_id'
          , 'mea.account_app_id AS account_app_id'
          , 'mea.exercise_dt AS exercise_dt'
          , 'mea.member_type AS member_type'
          , `(
              SELECT
                CASE
                  WHEN SUM(CASE WHEN sej.average_heart_rate > 0 THEN sej.jumping_minute ELSE 0 END) > 0
                  THEN
                    SUM(CASE WHEN sej.average_heart_rate > 0 THEN sej.average_heart_rate * sej.jumping_minute ELSE 0 END)
                    / SUM(CASE WHEN sej.average_heart_rate > 0 THEN sej.jumping_minute ELSE 0 END)
                  ELSE NULL
                END AS average_heart_rate
              FROM  exercise_jumping sej
              WHERE mea.exercise_app_id = sej.exercise_app_id
              AND   sej.del_yn = 'N'
            ) AS average_heart_rate`
          , `(
              SELECT
                sej.max_heart_rate
              FROM	exercise_jumping sej
              WHERE	mea.exercise_app_id = sej.exercise_app_id
              AND		sej.del_yn = 'N'
              ORDER BY max_heart_rate DESC
              LIMIT 1
          ) AS max_heart_rate`
          , `(
              SELECT
                SUM(sej.jumping_calory)
              FROM	exercise_jumping sej
              WHERE	mea.exercise_app_id = sej.exercise_app_id
              AND		sej.del_yn = 'N'
          ) AS jumping_calory`
          , `(
              SELECT
                SUM(seo.other_exercise_calory)
              FROM	exercise_other seo
              WHERE	mea.exercise_app_id = seo.exercise_app_id
              AND		seo.del_yn = 'N'
          ) AS other_exercise_calory`
        ])
        .from('member_exercise_app', 'mea')
        .where('mea.account_app_id = :account_app_id', { account_app_id })
        .andWhere('mea.del_yn = "N"');
      
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
              queryBuilder.andWhere("mea.exercise_dt like :exerciseDt", { exerciseDt: `%${year_month}%` });
            }
            break;
            
          case 'week':
            // 현재 달 기준으로 주 단위로 분리
            // MySQL DATE_FORMAT과 WEEK 함수를 사용하여 같은 주에 속하는 날짜 가져오기
            queryBuilder.andWhere(`
              YEAR(STR_TO_DATE(mea.exercise_dt, '%Y%m%d')) = :year AND 
              MONTH(STR_TO_DATE(mea.exercise_dt, '%Y%m%d')) = :month
            `, { 
              year: currentYear, 
              month: currentMonth
            });
            break;
            
          case 'month':
            // 12개월 모두 가져오기 (현재 연도)
            queryBuilder.andWhere(`
              YEAR(STR_TO_DATE(mea.exercise_dt, '%Y%m%d')) = :year
            `, { 
              year: currentYear
            });
            break;
            
          case 'year':
            // 현재 연도부터 5년 전까지 (총 6년)
            const startYear = currentYear - 5; // 5년 전
            const endYear = currentYear; // 현재 연도
            
            queryBuilder.andWhere(`
              SUBSTRING(mea.exercise_dt, 1, 4) >= :startYear AND
              SUBSTRING(mea.exercise_dt, 1, 4) <= :endYear
            `, { 
              startYear: startYear.toString(),
              endYear: endYear.toString()
            });
            break;
        }
      } else if (year_month) {
        // category_dt가 없고 year_month만 있는 경우 기존 로직 사용
        queryBuilder.andWhere("mea.exercise_dt like :exerciseDt", { exerciseDt: `%${year_month}%` });
      }
      
      const exerciseList = await queryBuilder
        .orderBy('mea.exercise_dt', 'DESC')
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

  async insertMemberExerciseApp(insertMemberExerciseAppDto: InsertMemberExerciseAppDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { 
        account_app_id, 
        exercise_dt, 
        session,
        member_type,
        intensity_level,
        skill_level,
        average_heart_rate,
        max_heart_rate,
        jumping_calory,
        jumping_sessions,
        other_exercise_type,
        other_exercise_time,
        other_exercise_calory,
        otherExerciseType,
        otherExerciseTime,
        otherExerciseCalory,
        exercise_other,
        exerciseOther,
        reg_id, 
      } = insertMemberExerciseAppDto;
      const nowDt = getCurrentDateYYYYMMDDHHIISS();
      
      await this.dataSource.transaction(async (manager) => {
        // NOTE: 일부 환경에서 TypeORM QueryBuilder insert가 `this.subQuery is not a function`로 터지는 케이스가 있어
        // insert 경로만 raw query로 처리합니다.
        // 1) member_exercise_app (헤더)
        const insertBase: any = await manager.query(
          `INSERT INTO member_exercise_app (
            account_app_id
            , exercise_dt
            , member_type
            , del_yn
            , reg_dt
            , reg_id
            , mod_dt
            , mod_id
          ) VALUES (
            ?
            , ?
            , ?
            , 'N'
            , ?
            , ?
            , ?
            , ?
          )`,
          [account_app_id, exercise_dt, member_type ?? null, nowDt, reg_id, null, null],
        );

        const exercise_app_id: number =
          insertBase?.insertId ?? insertBase?.raw?.insertId ?? insertBase?.[0]?.insertId;

        // 2) exercise_jumping (점핑 상세)
        if (Array.isArray(jumping_sessions) && jumping_sessions.length > 0) {
          for (const jumpingSession of jumping_sessions) {
            await manager.query(
              `INSERT INTO exercise_jumping (
                exercise_app_id
                , session
                , intensity_level
                , skill_level
                , average_heart_rate
                , max_heart_rate
                , jumping_minute
                , jumping_calory
                , lesson
                , lesson_type
                , del_yn
                , reg_dt
                , reg_id
                , mod_dt
                , mod_id
              ) VALUES (
                ?
                , ?
                , ?
                , ?
                , ?
                , ?
                , ?
                , ?
                , ?
                , ?
                , ? 
                , ?
                , ?
                , ?
                , ?
              )`,
              [
                exercise_app_id,
                jumpingSession.session,
                jumpingSession.intensity_level ?? null,
                jumpingSession.skill_level ?? null,
                jumpingSession.average_heart_rate ?? null,
                jumpingSession.max_heart_rate ?? null,
                jumpingSession.jumping_minute ?? null,
                jumpingSession.jumping_calory ?? 0,
                jumpingSession.lesson ?? null,
                jumpingSession.lesson_type ?? null,
                jumpingSession.del_yn ?? 'N',
                nowDt,
                reg_id,
                null,
                null
              ],
            );
          }
        }

        // 3) exercise_other (기타 운동 상세)
        const resolvedExerciseOther = exercise_other ?? exerciseOther ?? null;
        const otherRows =
          resolvedExerciseOther && Array.isArray(resolvedExerciseOther)
            ? resolvedExerciseOther
            : resolvedExerciseOther
              ? [resolvedExerciseOther]
              : [];

        if (otherRows.length > 0) {
          for (const otherExercise of otherRows) {
            await manager.query(
              `INSERT INTO exercise_other (
                exercise_app_id
                , other_exercise_type
                , other_exercise_time
                , other_exercise_calory
                , del_yn
                , reg_dt
                , reg_id
                , mod_dt
                , mod_id
              ) VALUES (
                ?
                , ?
                , ?
                , ?
                , ?
                , ?
                , ?
                , ?
                , ?
              )`,
              [
                exercise_app_id,
                (otherExercise as any).other_exercise_type ?? (otherExercise as any).otherExerciseType ?? null,
                (otherExercise as any).other_exercise_time ?? (otherExercise as any).otherExerciseTime ?? null,
                (otherExercise as any).other_exercise_calory ?? (otherExercise as any).otherExerciseCalory ?? null,
                (otherExercise as any).del_yn ?? 'N',
                nowDt,
                reg_id,
                null,
                null,
              ],
            );
          }
        } else {
          const hasOther =
            other_exercise_type !== undefined ||
            other_exercise_time !== undefined ||
            other_exercise_calory !== undefined ||
            otherExerciseType !== undefined ||
            otherExerciseTime !== undefined ||
            otherExerciseCalory !== undefined;

          if (hasOther) {
            await manager.query(
              `INSERT INTO exercise_other (
                exercise_app_id
                , other_exercise_type
                , other_exercise_time
                , other_exercise_calory
                , del_yn
                , reg_dt
                , reg_id
                , mod_dt
                , mod_id
              ) VALUES (
                ?
                , ?
                , ?
                , ?
                , 'N'
                , ?
                , ?
                , ?
                , ?
              )`,
              [
                exercise_app_id,
                (other_exercise_type ?? otherExerciseType) ?? null,
                (other_exercise_time ?? otherExerciseTime) ?? null,
                (other_exercise_calory ?? otherExerciseCalory) ?? null,
                nowDt,
                reg_id,
                null,
                null,
              ],
            );
          }
        }
      });

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
        account_app_id,
        member_type,
        exercise_app_id,
        session,
        intensity_level,
        skill_level,
        lesson,
        lesson_type,
        jumping_minute,
        average_heart_rate,
        max_heart_rate,
        jumping_calory,
        jumping_sessions,
        other_exercise_type,
        other_exercise_time,
        other_exercise_calory,
        exercise_other,
      } = updateMemberExerciseAppDto;
      const nowDt = getCurrentDateYYYYMMDDHHIISS();
      
      const result = await this.dataSource.transaction(async (manager) => {
        // 1) member_exercise_app 업데이트 (헤더)
        const baseUpdate: any = {
          mod_dt: nowDt,
          mod_id: account_app_id,
        };
        if (member_type !== undefined) baseUpdate.member_type = member_type;

        const baseResult = await manager
          .createQueryBuilder()
          .update(MemberExerciseApp)
          .set(baseUpdate)
          .where('exercise_app_id = :exercise_app_id', { exercise_app_id })
          .execute();

        // 2) exercise_jumping upsert
        // - 신규 구조: jumping_sessions 배열이 오면 session별로 update 후 없으면 insert
        // - 구 구조(호환): 단일 필드 기반 upsert
        if (Array.isArray(jumping_sessions) && jumping_sessions.length > 0) {
          for (const jumpingSession of jumping_sessions) {
            const jumpingUpdate: any = {
              mod_dt: nowDt,
              mod_id: account_app_id,
              ...(jumpingSession.intensity_level !== undefined ? { intensity_level: jumpingSession.intensity_level ?? null } : {}),
              ...(jumpingSession.skill_level !== undefined ? { skill_level: jumpingSession.skill_level ?? null } : {}),
              ...(jumpingSession.average_heart_rate !== undefined ? { average_heart_rate: jumpingSession.average_heart_rate ?? null } : {}),
              ...(jumpingSession.max_heart_rate !== undefined ? { max_heart_rate: jumpingSession.max_heart_rate ?? null } : {}),
              ...(jumpingSession.lesson !== undefined ? { lesson: jumpingSession.lesson ?? null } : {}),
              ...(jumpingSession.lesson_type !== undefined ? { lesson_type: jumpingSession.lesson_type ?? null } : {}),
              ...(jumpingSession.jumping_minute !== undefined ? { jumping_minute: jumpingSession.jumping_minute ?? null } : {}),
              ...(jumpingSession.jumping_calory !== undefined ? { jumping_calory: jumpingSession.jumping_calory ?? 0 } : {}),
              ...(jumpingSession.del_yn !== undefined ? { del_yn: jumpingSession.del_yn } : {}),
            };

            const jumpingResult = await manager
              .createQueryBuilder()
              .update('exercise_jumping')
              .set(jumpingUpdate)
              .where('exercise_app_id = :exercise_app_id', { exercise_app_id })
              .andWhere('session = :session', { session: jumpingSession.session })
              .andWhere('(del_yn IS NULL OR del_yn = :del_yn)', { del_yn: 'N' })
              .execute();

            if (!jumpingResult.affected) {
              // soft delete 된 row가 있으면 revive (insert 전에 먼저 시도)
              const reviveUpdate: any = {
                ...jumpingUpdate,
                del_yn: jumpingSession.del_yn ?? 'N',
              };
              const reviveResult = await manager
                .createQueryBuilder()
                .update('exercise_jumping')
                .set(reviveUpdate)
                .where('exercise_app_id = :exercise_app_id', { exercise_app_id })
                .andWhere('session = :session', { session: jumpingSession.session })
                .execute();

              if (reviveResult.affected) continue;

              await manager
                .createQueryBuilder()
                .insert()
                .into('exercise_jumping')
                .values({
                  exercise_app_id,
                  session: jumpingSession.session,
                  intensity_level: jumpingSession.intensity_level ?? null,
                  skill_level: jumpingSession.skill_level ?? null,
                  lesson: jumpingSession.lesson ?? null,
                  lesson_type: jumpingSession.lesson_type ?? null,
                  jumping_minute: jumpingSession.jumping_minute ?? null,
                  average_heart_rate: jumpingSession.average_heart_rate ?? null,
                  max_heart_rate: jumpingSession.max_heart_rate ?? null,
                  jumping_calory: jumpingSession.jumping_calory ?? 0,
                  del_yn: jumpingSession.del_yn ?? 'N',
                  reg_dt: nowDt,
                  reg_id: account_app_id,
                })
                .execute();
            }
          }
        } else {
          const hasJumping =
            intensity_level !== undefined ||
            skill_level !== undefined ||
            lesson !== undefined ||
            lesson_type !== undefined ||
            jumping_minute !== undefined ||
            average_heart_rate !== undefined ||
            max_heart_rate !== undefined ||
            jumping_calory !== undefined;

          if (hasJumping) {
            // session 타겟 결정: DTO.session 우선, 없으면 exercise_jumping에서 조회(구 구조 호환)
            let resolvedSession = session;
            if (!resolvedSession) {
              const jumpingRow = await manager
                .createQueryBuilder()
                .select(['ej.session AS session'])
                .from('exercise_jumping', 'ej')
                .where('ej.exercise_app_id = :exercise_app_id', { exercise_app_id })
                .andWhere('(ej.del_yn IS NULL OR ej.del_yn = :del_yn)', { del_yn: 'N' })
                .orderBy('ej.session', 'DESC')
                .getRawOne();
              resolvedSession = jumpingRow?.session ?? null;
            }

            if (!resolvedSession) {
              throw new Error('session is required for exercise_jumping');
            }

            const jumpingUpdate: any = {
              ...(intensity_level !== undefined ? { intensity_level: intensity_level ?? null } : {}),
              ...(skill_level !== undefined ? { skill_level: skill_level ?? null } : {}),
              ...(lesson !== undefined ? { lesson: lesson ?? null } : {}),
              ...(lesson_type !== undefined ? { lesson_type: lesson_type ?? null } : {}),
              ...(jumping_minute !== undefined ? { jumping_minute: jumping_minute ?? null } : {}),
              ...(average_heart_rate !== undefined ? { average_heart_rate: average_heart_rate ?? null } : {}),
              ...(max_heart_rate !== undefined ? { max_heart_rate: max_heart_rate ?? null } : {}),
              ...(jumping_calory !== undefined ? { jumping_calory } : {}),
              mod_dt: nowDt,
              mod_id: account_app_id,
            };

            const jumpingResult = await manager
              .createQueryBuilder()
              .update('exercise_jumping')
              .set(jumpingUpdate)
              .where('exercise_app_id = :exercise_app_id', { exercise_app_id })
              .andWhere('session = :session', { session: resolvedSession })
              .andWhere('(del_yn IS NULL OR del_yn = :del_yn)', { del_yn: 'N' })
              .execute();

            if (!jumpingResult.affected) {
              await manager
                .createQueryBuilder()
                .insert()
                .into('exercise_jumping')
                .values({
                  exercise_app_id,
                  session: resolvedSession,
                  intensity_level: intensity_level ?? null,
                  skill_level: skill_level ?? null,
                  lesson: lesson ?? null,
                  lesson_type: lesson_type ?? null,
                  jumping_minute: jumping_minute ?? null,
                  average_heart_rate: average_heart_rate ?? null,
                  max_heart_rate: max_heart_rate ?? null,
                  jumping_calory: jumping_calory ?? 0,
                  del_yn: 'N',
                  reg_dt: nowDt,
                  reg_id: account_app_id,
                })
                .execute();
            }
          }
        }

        // 3) exercise_other upsert
        // - 신규 구조: exercise_other가 배열이면 요소별로 update 후 없으면 insert (delete 없음)
        // - 구 구조(호환): 단일 필드(other_exercise_*) 기반 upsert
        if (exercise_other) {
          const otherRows = Array.isArray(exercise_other) ? exercise_other : [exercise_other];

          for (const otherExercise of otherRows) {
            const otherExerciseId =
              (otherExercise as any)?.exercise_other_id === undefined || (otherExercise as any)?.exercise_other_id === null
                ? null
                : Number((otherExercise as any).exercise_other_id);

            // other_exercise_type이 식별자 역할을 하도록 사용 (동일 타입이 여러개면 구분 불가)
            const otherType = otherExercise?.other_exercise_type;
            if (!otherExerciseId && !otherType) continue;

            const otherUpdate: any = {
              other_exercise_time: otherExercise.other_exercise_time ?? null,
              other_exercise_calory: otherExercise.other_exercise_calory ?? null,
              mod_dt: nowDt,
              mod_id: account_app_id,
            };
            if (otherExercise.del_yn !== undefined) otherUpdate.del_yn = otherExercise.del_yn;

            // id가 있으면 id로 우선 업데이트 (프론트가 row id를 보낸다고 했으니 이게 정답)
            let otherResult:
              | { affected?: number | null }
              | undefined;

            if (otherExerciseId) {
              otherResult = await manager
                .createQueryBuilder()
                .update('exercise_other')
                .set(otherUpdate)
                .where('exercise_other_id = :exercise_other_id', { exercise_other_id: otherExerciseId })
                .andWhere('exercise_app_id = :exercise_app_id', { exercise_app_id: String(exercise_app_id) })
                .andWhere('(del_yn IS NULL OR del_yn = :del_yn)', { del_yn: 'N' })
                .execute();
            } else {
              // id가 없으면 기존 방식(type(+time))으로 upsert
              let qb = manager
                .createQueryBuilder()
                .update('exercise_other')
                .set(otherUpdate)
                .where('exercise_app_id = :exercise_app_id', { exercise_app_id: String(exercise_app_id) })
                .andWhere('other_exercise_type = :other_exercise_type', { other_exercise_type: otherType })
                .andWhere('(del_yn IS NULL OR del_yn = :del_yn)', { del_yn: 'N' });

              // time까지 같이 보내는 경우 더 좁혀서 같은 항목을 업데이트하도록 함
              if (otherExercise.other_exercise_time !== undefined && otherExercise.other_exercise_time !== null) {
                qb = qb.andWhere('other_exercise_time = :other_exercise_time', { other_exercise_time: otherExercise.other_exercise_time });
              }

              otherResult = await qb.execute();
            }

            if (!otherResult.affected) {
              // soft delete 된 row가 있으면 revive (insert 전에 먼저 시도)
              const reviveOtherUpdate: any = {
                ...otherUpdate,
                del_yn: otherExercise.del_yn ?? 'N',
              };

              let reviveOtherResult: { affected?: number | null };

              if (otherExerciseId) {
                reviveOtherResult = await manager
                  .createQueryBuilder()
                  .update('exercise_other')
                  .set(reviveOtherUpdate)
                  .where('exercise_other_id = :exercise_other_id', { exercise_other_id: otherExerciseId })
                  .andWhere('exercise_app_id = :exercise_app_id', { exercise_app_id: String(exercise_app_id) })
                  .execute();
              } else {
                let reviveQb = manager
                  .createQueryBuilder()
                  .update('exercise_other')
                  .set(reviveOtherUpdate)
                  .where('exercise_app_id = :exercise_app_id', { exercise_app_id: String(exercise_app_id) })
                  .andWhere('other_exercise_type = :other_exercise_type', { other_exercise_type: otherType });

                if (otherExercise.other_exercise_time !== undefined && otherExercise.other_exercise_time !== null) {
                  reviveQb = reviveQb.andWhere('other_exercise_time = :other_exercise_time', { other_exercise_time: otherExercise.other_exercise_time });
                }

                reviveOtherResult = await reviveQb.execute();
              }
              if (reviveOtherResult.affected) continue;

              await manager
                .createQueryBuilder()
                .insert()
                .into('exercise_other')
                .values({
                  exercise_app_id,
                  other_exercise_type: otherType,
                  other_exercise_time: otherExercise.other_exercise_time ?? null,
                  other_exercise_calory: otherExercise.other_exercise_calory ?? null,
                  del_yn: otherExercise.del_yn ?? 'N',
                  reg_dt: nowDt,
                  reg_id: account_app_id,
                })
                .execute();
            }
          }
        } else {
          const hasOther =
            other_exercise_type !== undefined ||
            other_exercise_time !== undefined ||
            other_exercise_calory !== undefined;

          if (hasOther) {
            const otherUpdate: any = {
              other_exercise_type: other_exercise_type ?? null,
              other_exercise_time: other_exercise_time ?? null,
              other_exercise_calory: other_exercise_calory ?? null,
              mod_dt: nowDt,
              mod_id: account_app_id,
            };

            const otherResult = await manager
              .createQueryBuilder()
              .update('exercise_other')
              .set(otherUpdate)
              .where('exercise_app_id = :exercise_app_id', { exercise_app_id: String(exercise_app_id) })
              .andWhere('(del_yn IS NULL OR del_yn = :del_yn)', { del_yn: 'N' })
              .execute();

            if (!otherResult.affected) {
              await manager
                .createQueryBuilder()
                .insert()
                .into('exercise_other')
                .values({
                  exercise_app_id,
                  other_exercise_type: other_exercise_type ?? null,
                  other_exercise_time: other_exercise_time ?? null,
                  other_exercise_calory: other_exercise_calory ?? null,
                  del_yn: 'N',
                  reg_dt: nowDt,
                  reg_id: account_app_id,
                })
                .execute();
            }
          }
        }

        return baseResult;
      });

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

  async deleteMemberExerciseApp(payload: { exercise_app_id?: number; exercise_app_id_list?: number[]; account_app_id: number }): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { exercise_app_id, exercise_app_id_list, account_app_id } = payload;
      const nowDt = getCurrentDateYYYYMMDDHHIISS();

      const exerciseAppIds: number[] =
        Array.isArray(exercise_app_id_list) && exercise_app_id_list.length > 0
          ? exercise_app_id_list.map(Number)
          : exercise_app_id !== undefined && exercise_app_id !== null
            ? [Number(exercise_app_id)]
            : [];

      if (exerciseAppIds.length === 0) {
        return {
          success: false,
          message: '삭제할 exercise_app_id가 없습니다.',
          code: COMMON_RESPONSE_CODES.FAIL,
        };
      }

      const result = await this.dataSource.transaction(async (manager) => {
        const baseResult = await manager
          .createQueryBuilder()
          .update('member_exercise_app')
          .set({
            del_yn: 'Y',
            mod_dt: nowDt,
            mod_id: account_app_id,
          })
          .where('exercise_app_id IN (:...ids)', { ids: exerciseAppIds })
          .execute();

        // 관련 상세도 함께 soft delete 처리
        await manager
          .createQueryBuilder()
          .update('exercise_jumping')
          .set({
            del_yn: 'Y',
            mod_dt: nowDt,
            mod_id: account_app_id,
          })
          .where('exercise_app_id IN (:...ids)', { ids: exerciseAppIds })
          .execute();

        await manager
          .createQueryBuilder()
          .update('exercise_other')
          .set({
            del_yn: 'Y',
            mod_dt: nowDt,
            mod_id: account_app_id,
          })
          .where('exercise_app_id IN (:...ids)', { ids: exerciseAppIds })
          .execute();

        return baseResult;
      });

      if (!result.affected) {
        return {
          success: false,
          message: '삭제할 운동 정보를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA,
        };
      }

      return {
        success: true,
        message: '삭제되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          code: COMMON_RESPONSE_CODES.FAIL,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteExerciseJumping(payload: { exercise_jumping_ids: number[]; account_app_id?: number }): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { exercise_jumping_ids, account_app_id } = payload;
      const nowDt = getCurrentDateYYYYMMDDHHIISS();
      
      if (!exercise_jumping_ids || exercise_jumping_ids.length === 0) {
        return {
          success: false,
          message: '삭제할 exercise_jumping_id가 없습니다.',
          code: COMMON_RESPONSE_CODES.FAIL,
        };
      }

      const result = await this.dataSource
        .createQueryBuilder()
        .update('exercise_jumping')
        .set({
          del_yn: 'Y',
          mod_dt: nowDt,
          mod_id: account_app_id ?? null,
        })
        .where('exercise_jumping_id IN (:...ids)', { ids: exercise_jumping_ids })
        .execute();

      if (!result.affected) {
        return {
          success: false,
          message: '삭제할 점핑 운동 정보를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA,
        };
      }

      return {
        success: true,
        message: '삭제되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          code: COMMON_RESPONSE_CODES.FAIL,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteExerciseOther(payload: { exercise_other_ids: number[]; account_app_id?: number }): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { exercise_other_ids, account_app_id } = payload;
      const nowDt = getCurrentDateYYYYMMDDHHIISS();

      if (!exercise_other_ids || exercise_other_ids.length === 0) {
        return {
          success: false,
          message: '삭제할 exercise_other_id가 없습니다.',
          code: COMMON_RESPONSE_CODES.FAIL,
        };
      }

      const result = await this.dataSource
        .createQueryBuilder()
        .update('exercise_other')
        .set({
          del_yn: 'Y',
          mod_dt: nowDt,
          mod_id: account_app_id ?? null,
        })
        .where('exercise_other_id IN (:...ids)', { ids: exercise_other_ids })
        .execute();

      if (!result.affected) {
        return {
          success: false,
          message: '삭제할 기타 운동 정보를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA,
        };
      }

      return {
        success: true,
        message: '삭제되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          code: COMMON_RESPONSE_CODES.FAIL,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 