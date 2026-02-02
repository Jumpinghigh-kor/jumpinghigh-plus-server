import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { COMMON_RESPONSE_CODES } from '../core/constants/response-codes';
import {
  GetMemberBodyAppDto,
  InsertMemberBodyAppDto,
  UpdateMemberBodyAppDto,
} from './dto/member-body-app.dto';

@Injectable()
export class MemberBodyAppService {
  constructor(private dataSource: DataSource) {}

  async getMemberBodyApp(
    dto: GetMemberBodyAppDto,
  ): Promise<{ success: boolean; data: any[] | null; code: string }> {
    try {
      const { account_app_id } = dto;

      const list = await this.dataSource
        .createQueryBuilder()
        .select([
          'mba.body_app_id AS body_app_id',
          'mba.height AS height',
          'mba.weight AS weight',
          'mba.reg_dt AS reg_dt',
        ])
        .from('member_body_app', 'mba')
        .where('mba.account_app_id = :account_app_id', { account_app_id: account_app_id })
        .andWhere('mba.del_yn = "N"')
        .orderBy('mba.body_app_id', 'DESC')
        .getRawMany();

      if (!list || list.length === 0) {
        return { success: true, data: null, code: COMMON_RESPONSE_CODES.NO_DATA };
      }

      return { success: true, data: list, code: COMMON_RESPONSE_CODES.SUCCESS };
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

  async insertMemberBodyApp(
    dto: InsertMemberBodyAppDto,
  ): Promise<{ success: boolean; data: { body_app_id: number } | null; code: string }> {
    try {
      const { account_app_id, height, weight } = dto;

      const result = await this.dataSource
        .createQueryBuilder()
        .insert()
        .into('member_body_app')
        .values({
          account_app_id: account_app_id,
          height: height ?? null,
          weight: weight ?? null,
          del_yn: 'N',
          reg_dt: () => "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')",
          reg_id: account_app_id,
          mod_dt: null,
          mod_id: null,
        })
        .execute();

      const body_app_id =
        (result as any)?.identifiers?.[0]?.body_app_id ?? (result as any)?.raw?.insertId;

      return { success: true, data: { body_app_id }, code: COMMON_RESPONSE_CODES.SUCCESS };
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

  async updateMemberBodyApp(
    dto: UpdateMemberBodyAppDto,
  ): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { account_app_id, body_app_id, height, weight } = dto;

      const result = await this.dataSource
        .createQueryBuilder()
        .update('member_body_app')
        .set({
          height: height ?? null,
          weight: weight ?? null,
          mod_dt: () => "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')",
          mod_id: account_app_id,
        })
        .where('body_app_id = :body_app_id', { body_app_id })
        .execute();

      if (!result.affected) {
        return {
          success: false,
          message: '수정할 데이터를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA,
        };
      }

      return { success: true, message: '수정되었습니다.', code: COMMON_RESPONSE_CODES.SUCCESS };
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


