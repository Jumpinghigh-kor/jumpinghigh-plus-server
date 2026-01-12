import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { COMMON_RESPONSE_CODES } from '../core/constants/response-codes';
import { MemberSchedule } from '../entities/member-schedule-app.entity';
import { InsertMemberScheduleAppDto, DeleteMemberScheduleAppDto, UpdateMemberScheduleAppDto } from './dto/member-schedule-app.dto';
import { getCurrentDateYYYYMMDDHHIISS } from '../core/utils/date.utils';

@Injectable()
export class MemberScheduleAppService {
  constructor(
    @InjectRepository(MemberSchedule)
    private memberScheduleRepository: Repository<MemberSchedule>,
    private dataSource: DataSource
  ) {}

  async getCenterScheduleList(center_id: number, mem_id: number, sch_dt: number): Promise<{ success: boolean; data: any[] | null; code: string }> {
    try {
      // NestJS TypeORM QueryBuilder 사용
      const schedules = await this.dataSource
        .createQueryBuilder()
        .select([
          'sch_id'
          , 'sch_time'
          , 'sch_max_cap'
          , 'sch_info'
          , `(
              SELECT
                COUNT(*)
              FROM      members sm
              LEFT JOIN member_account_app smaa ON sm.mem_id = smaa.mem_id
              WHERE     sm.mem_sch_id = s.sch_id
              AND       smaa.status = 'ACTIVE'
              AND       sm.center_id = :center_id
          ) AS mem_total_sch_cnt`
          , `(
              SELECT
                sm.mem_sch_id
              FROM  members sm
              WHERE sm.mem_sch_id = s.sch_id
              AND   sm.mem_id = :mem_id
            ) AS mem_sch_id`
          , `(
              SELECT
                COUNT(*)
              FROM      members sm
              LEFT JOIN member_account_app smaa ON sm.mem_id = smaa.mem_id
              WHERE     sm.mem_sch_id = s.sch_id
              AND       smaa.status = 'ACTIVE'
              AND       sm.center_id = :center_id
            ) AS mem_total_sch_cnt`
          , `(
              SELECT
                COUNT(*)
              FROM  member_schedule_app smsa
              WHERE smsa.original_sch_id = s.sch_id
              AND   smsa.sch_dt = :sch_dt
              AND   smsa.del_yn = 'N'
            ) AS mem_basic_sch_cnt`
          , `(
              SELECT
                COUNT(*)
              FROM  member_schedule_app smsa
              WHERE smsa.reservation_sch_id = s.sch_id
              AND   smsa.sch_dt = :sch_dt
              AND   smsa.del_yn = 'N'
            ) AS mem_change_sch_cnt`
        ])
        .from('schedule', 's')
        .where('s.center_id = :center_id', { center_id, mem_id, sch_dt })
        .andWhere('s.sch_status = :status', { status: 1 })
        .getRawMany();

      if (!schedules || schedules.length === 0) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: schedules,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error fetching schedules:', error);
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

  async getMemberScheduleAppList(account_app_id: number): Promise<{ success: boolean; data: any[] | null; code: string }> {
    try {
      const schedules = await this.dataSource
        .createQueryBuilder()
        .select([
          'sch_app_id'
          , 'account_app_id'
          , 'original_sch_id'
          , 'reservation_sch_id'
          , 'sch_dt'
          , 'agree_yn'
          , 'del_yn'
          , 'reg_dt'
          , 'reg_id'
          , 'mod_dt'
          , 'mod_id'
          , `(
              SELECT
                ss.sch_time
              FROM  schedule ss
              WHERE ss.sch_id = msa.reservation_sch_id
          ) AS sch_time`
        ])
        .from('member_schedule_app', 'msa')
        .where('msa.account_app_id = :account_app_id', { account_app_id })
        .andWhere('msa.del_yn = :del_yn', { del_yn: 'N' })
        .orderBy(`
                  CASE
                    WHEN msa.sch_dt = DATE_FORMAT(NOW(), '%Y%m%d') THEN 1
                    WHEN msa.sch_dt > DATE_FORMAT(NOW(), '%Y%m%d') THEN 2
                    ELSE 3
                  END`, 'ASC')
        .getRawMany();

      if (!schedules || schedules.length === 0) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: schedules,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error fetching member schedules:', error);
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

  async insertMemberScheduleApp(insertMemberScheduleDto: InsertMemberScheduleAppDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { account_app_id, reservation_sch_id, sch_dt, original_sch_id, center_id, mem_name, agree_yn } = insertMemberScheduleDto;
      
      // 현재 시간 (YYYYMMDDHHIISS 형식)
      const currentDate = getCurrentDateYYYYMMDDHHIISS();
      
      // TypeORM QueryBuilder 사용하여 데이터 삽입
      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into('member_schedule_app')
        .values({
          account_app_id: account_app_id,
          original_sch_id: original_sch_id,
          reservation_sch_id: reservation_sch_id,
          sch_dt: sch_dt,
          agree_yn: agree_yn ?? null,
          del_yn: 'N',
          admin_memo: null,
          reg_dt: currentDate,
          reg_id: account_app_id
        })
        .execute();
      
      // sch_dt를 yyyy년 mm월 dd일 형식으로 변환하는 함수
      const formatDate = (dateStr: string) => {
        if (dateStr && dateStr.length === 8) {
          const year = dateStr.substring(0, 4);
          const month = dateStr.substring(4, 6);
          const day = dateStr.substring(6, 8);
          return `${year}년 ${month}월 ${day}일`;
        }
        return dateStr;
      };

      // 알림 테이블에 insert
      if (reservation_sch_id !== original_sch_id) {
        await this.dataSource
          .createQueryBuilder()
          .insert()
          .into('notifications')
          .values({
            not_user_id: center_id,
            not_type: '예약 시간 등록 알림',
            not_title: '예약 시간 등록 알림',
            not_message: mem_name + '님이 ' + formatDate(sch_dt) + '에 예약을 하였습니다. 수락할지 거절할지 결정해주세요.',
            not_is_read: '0',
            not_created_at: () => "NOW()",
            not_read_at: null
          })
          .execute();
      }
      
      return {
        success: true,
        message: '스케줄이 성공적으로 등록되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error creating member schedule:', error);
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

  async deleteMemberScheduleApp(deleteMemberScheduleAppDto: DeleteMemberScheduleAppDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { sch_app_id, account_app_id } = deleteMemberScheduleAppDto;
      // 현재 시간 (YYYYMMDDHHIISS 형식)
      const currentDate = getCurrentDateYYYYMMDDHHIISS();
      
      // sch_dt를 yyyy년 mm월 dd일 형식으로 변환하는 함수
      const formatDate = (dateInput: string | number | null | undefined) => {
        const dateStr = String(dateInput ?? '');
        if (dateStr.length === 8) {
          const year = dateStr.substring(0, 4);
          const month = dateStr.substring(4, 6);
          const day = dateStr.substring(6, 8);
          return `${year}년 ${month}월 ${day}일`;
        }
        return dateStr;
      };

      // 삭제 전에 스케줄 정보를 조회 (알림 생성용)
      let scheduleIds: number[] = Array.isArray(sch_app_id) ? sch_app_id : [sch_app_id];
      
      const scheduleInfos = await this.dataSource
        .createQueryBuilder()
        .select([
          'msa.sch_app_id AS sch_app_id'
          , 'msa.sch_dt AS sch_dt'
          , 'm.mem_name AS mem_name'
          , 'm.center_id AS center_id'
        ])
        .from('member_schedule_app', 'msa')
        .leftJoin('member_account_app', 'maa', 'maa.account_app_id = msa.account_app_id')
        .leftJoin('members', 'm', 'm.mem_id = maa.mem_id')
        .where('msa.sch_app_id IN (:...scheduleIds)', { scheduleIds })
        .andWhere('msa.del_yn = :del_yn', { del_yn: 'N' })
        .getRawMany();
      
      let result;
      
      // sch_app_id가 배열인 경우와 단일 값인 경우 처리
      if (Array.isArray(sch_app_id)) {
        // 배열인 경우, IN 연산자 사용
        result = await this.dataSource
          .createQueryBuilder()
          .update('member_schedule_app')
          .set({
            del_yn: 'Y',
            mod_dt: currentDate,
            mod_id: account_app_id
          })
          .where('sch_app_id IN (:...sch_app_ids)', { sch_app_ids: sch_app_id })
          .execute();
      } else {
        // 단일 값인 경우, 기존 로직 유지
        result = await this.dataSource
          .createQueryBuilder()
          .update('member_schedule_app')
          .set({
            del_yn: 'Y',
            mod_dt: currentDate,
            mod_id: account_app_id
          })
          .where('sch_app_id = :sch_app_id', { sch_app_id })
          .execute();
      }
      
      if (result.affected === 0) {
        return {
          success: false,
          message: '삭제할 스케줄을 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      // 각 삭제된 스케줄에 대해 알림 생성
      for (const scheduleInfo of scheduleInfos) {
        // 예약 마감(현재 날짜 YYYYMMDD > sch_dt)이면 취소 알림을 보내지 않음
        const todayYYYYMMDD = Number(String(currentDate).slice(0, 8));
        const schDtYYYYMMDD = Number(String((scheduleInfo as any).sch_dt).slice(0, 8));
        if (Number.isFinite(todayYYYYMMDD) && Number.isFinite(schDtYYYYMMDD) && todayYYYYMMDD > schDtYYYYMMDD) {
          continue;
        }

        await this.dataSource
          .createQueryBuilder()
          .insert()
          .into('notifications')
          .values({
            not_user_id: scheduleInfo.center_id,
            not_type: '예약 시간 취소 알림',
            not_title: '예약 시간 취소 알림',
            not_message: scheduleInfo.mem_name + '님이 ' + formatDate(scheduleInfo.sch_dt) + '에 예약을 취소하였습니다. 자동으로 달력에서 삭제되었습니다.',
            not_is_read: '0',
            not_created_at: () => "NOW()",
            not_read_at: null
          })
          .execute();
      }
      
      return {
        success: true,
        message: '스케줄이 성공적으로 삭제되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error deleting member schedule:', error);
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

  async updateMemberScheduleApp(updateMemberScheduleAppDto: UpdateMemberScheduleAppDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { sch_app_id, reservation_sch_id, account_app_id, center_id, mem_name, sch_dt, agree_yn } = updateMemberScheduleAppDto;
      
      // 현재 시간 (YYYYMMDDHHIISS 형식)
      const currentDate = getCurrentDateYYYYMMDDHHIISS();
      
      // TypeORM QueryBuilder 사용하여 데이터 업데이트
      const result = await this.dataSource
        .createQueryBuilder()
        .update('member_schedule_app')
        .set({
          reservation_sch_id: reservation_sch_id,
          agree_yn: agree_yn ?? null,
          mod_dt: currentDate,
          mod_id: account_app_id
        })
        .where('sch_app_id = :sch_app_id', { sch_app_id })
        .execute();
      
      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 스케줄을 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      // sch_dt를 yyyy년 mm월 dd일 형식으로 변환하는 함수
      const formatDate = (dateStr: string) => {
        if (dateStr && dateStr.length === 8) {
          const year = dateStr.substring(0, 4);
          const month = dateStr.substring(4, 6);
          const day = dateStr.substring(6, 8);
          return `${year}년 ${month}월 ${day}일`;
        }
        return dateStr;
      };

      // 알림 테이블에 insert
      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into('notifications')
        .values({
          not_user_id: center_id,
          not_type: '예약 시간 변경 알림',
          not_title: '예약 시간 변경 알림',
          not_message: mem_name + '님이 ' + formatDate(sch_dt) + '에 예약을 변경하였습니다. 수락할지 거절할지 결정해주세요.',
          not_is_read: '0',
          not_created_at: () => "NOW()",
          not_read_at: null
        })
        .execute();
      
      return {
        success: true,
        message: '스케줄이 성공적으로 업데이트되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error updating member schedule:', error);
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