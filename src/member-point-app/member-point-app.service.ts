import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import { COMMON_RESPONSE_CODES } from '../core/constants/response-codes';
import { getCurrentDateYYYYMMDDHHIISS } from '../core/utils/date.utils';
import { InsertMemberPointAppDto } from './dto/member-point-app.dto';

@Injectable()
export class MemberPointAppService {
  constructor(
    private dataSource: DataSource,
  ) {}

  async getMemberPointAppList(account_app_id: string, reg_ym: string): Promise<{ success: boolean; data: any[] | null; code: string }> {
    try {
      const memberPointAppList = await this.dataSource
        .createQueryBuilder()
        .select([
          'mpa.point_status'
          , 'DATE_FORMAT(STR_TO_DATE(mpa.reg_dt, "%Y%m%d%H%i%s"), "%m.%d") AS reg_dt'
          , 'pa.product_name'
          , 'pa.brand_name'
          , 'mpa.point_amount'
          , 'pda.option_unit'
          , 'pda.option_amount'
          , 'pda.option_gender'
          , 'moda.order_quantity'
        ])
        .from('member_account_app', 'mca')
        .innerJoin('member_point_app', 'mpa', 'mca.account_app_id = mpa.account_app_id')
        .leftJoin('member_order_detail_app', 'moda', 'mpa.order_detail_app_id = moda.order_detail_app_id')
        .leftJoin('product_detail_app', 'pda', 'moda.product_detail_app_id = pda.product_detail_app_id')
        .leftJoin('product_app', 'pa', 'pda.product_app_id = pa.product_app_id')
        .where('mca.account_app_id = :account_app_id')
        .andWhere('mpa.del_yn = "N"')
        .andWhere('DATE_FORMAT(STR_TO_DATE(mpa.reg_dt, "%Y%m%d%H%i%s"), "%Y%m") = :regYm')
        .orderBy('mpa.point_app_id', 'DESC')
        .setParameters({account_app_id: account_app_id, regYm: reg_ym})
        .getRawMany();
        
      if (!memberPointAppList || memberPointAppList.length === 0) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: memberPointAppList,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error fetching member point app list:', error);
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

  async getMemberPointAppTargetCnt(order_detail_app_id: string): Promise<{ success: boolean; data: any[] | null; code: string }> {
    try {
      const memberPointAppTargetCnt = await this.dataSource
        .createQueryBuilder()
        .select([
          'COUNT(*) AS point_cnt'
        ])
        .from('member_point_app', 'mpa')
        .where('mpa.order_detail_app_id = :order_detail_app_id')
        .andWhere('mpa.del_yn = "N"')
        .setParameters({order_detail_app_id: order_detail_app_id})
        .getRawOne();
        
      if (!memberPointAppTargetCnt) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: memberPointAppTargetCnt,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error fetching member point app target cnt:', error);
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

  async insertMemberPointApp(insertMemberPointAppDto: InsertMemberPointAppDto): Promise<{ success: boolean; data: { point_app_id: number } | null; code: string }> {
    try {
      const { order_detail_app_id, account_app_id, point_status, point_amount } = insertMemberPointAppDto;
      const reg_dt = getCurrentDateYYYYMMDDHHIISS();
      
      const result = await this.dataSource
        .createQueryBuilder()
        .insert()
        .into('member_point_app')
        .values({
          account_app_id: account_app_id
          , order_detail_app_id: order_detail_app_id
          , point_type: 'BUY_PRODUCT'
          , point_status: point_status
          , point_amount: point_amount
          , del_yn: 'N'
          , reg_dt: reg_dt
          , reg_id: account_app_id
          , mod_dt: null
          , mod_id: null
        })
        .execute();
      
      const point_app_id = (result as any)?.identifiers?.[0]?.point_app_id ?? (result as any)?.raw?.insertId;
      
      return {
        success: true,
        data: { point_app_id },
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error creating point:', error);
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