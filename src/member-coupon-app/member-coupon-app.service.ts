import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Brackets } from 'typeorm';
import { MemberCouponApp } from './dto/member-coupon-app.dto';
import { GetMemberCouponAppListDto, MemberCouponAppListResponse, UpdateMemberCouponAppDto } from './dto/member-coupon-app.dto';
import { COMMON_RESPONSE_CODES } from '../core/constants/response-codes';
import { getCurrentDateYYYYMMDDHHIISS } from '../core/utils/date.utils';

@Injectable()
export class MemberCouponAppService {
  constructor(
    @InjectRepository(MemberCouponApp)
    private memberCouponAppRepository: Repository<MemberCouponApp>,
    private dataSource: DataSource
  ) {}

  async insertMemberCouponApp(couponData: any): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { account_app_id, coupon_app_id } = couponData;

      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into('member_coupon_app')
        .values({
          account_app_id: account_app_id,
          coupon_app_id: coupon_app_id,
          use_yn:  'N',
          use_dt: null,
          reg_dt: () => "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')",
          reg_id: account_app_id,
          mod_dt: null,
          mod_id: null
        })
        .execute();
  
      return {
        success: true,
        message: '쿠폰이 지급되었습니다.',
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

  async getMemberCouponAppList(getMemberCouponAppListDto: any): Promise<{ success: boolean; data: MemberCouponAppListResponse[] | null; code: string }> {
    try {
      const { account_app_id, use_yn, date } = getMemberCouponAppListDto;
      
      let queryBuilder = this.dataSource
        .createQueryBuilder()
        .select([
          'ca.coupon_app_id'
          , 'ca.product_app_id'
          , 'ca.discount_type'
          , 'ca.discount_amount'
          , 'ca.min_order_amount'
          , 'ca.description'
          , 'DATE_FORMAT(ca.start_dt, \'%Y.%m.%d\') AS start_dt'
          , 'DATE_FORMAT(ca.end_dt, \'%Y.%m.%d\') AS end_dt'
          , 'ca.coupon_notice'
          , 'ca.badge_text'
          , 'ca.end_dt AS full_end_dt'
          , 'mca.member_coupon_app_id'
          , 'mca.order_app_id'
          , 'mca.use_yn'
        ])
        .from('member_coupon_app', 'mca')
        .leftJoin('coupon_app', 'ca', 'mca.coupon_app_id = ca.coupon_app_id')
        .where('ca.del_yn = :del_yn', { del_yn: 'N' })
        .andWhere('mca.account_app_id = :account_app_id', { account_app_id })

      if (use_yn !== undefined && use_yn !== null && use_yn !== '') {
        queryBuilder = queryBuilder.andWhere('mca.use_yn = :use_yn', { use_yn });
      }

      if (date) {
        queryBuilder = queryBuilder
          .andWhere('ca.start_dt <= DATE_FORMAT(NOW(), \'%Y%m%d%H%i%s\')')
          .andWhere('ca.end_dt >= DATE_FORMAT(NOW(), \'%Y%m%d%H%i%s\')');
      }

      const couponList = await queryBuilder.getRawMany();

      if (!couponList || couponList.length === 0) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: couponList,
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

  async getCouponAppList(product_app_id: number): Promise<{ success: boolean; data: any[] | null; code: string }> {
    try {
      const couponList = await this.dataSource
        .createQueryBuilder()
        .select([
          'ca.coupon_app_id'
          , 'ca.product_app_id'
          , 'ca.discount_type'
          , `
              CASE
                WHEN ca.discount_type = 'PERCENT' THEN ca.discount_amount
                WHEN ca.discount_type = 'FIXED' THEN FORMAT(ca.discount_amount, 0)
              END AS discount_amount
            `
          , 'ca.min_order_amount'
          , 'ca.description'
          , 'ca.badge_text'
          , 'DATE_FORMAT(ca.start_dt, \'%Y.%m.%d\') AS start_dt'
          , 'DATE_FORMAT(ca.end_dt, \'%Y.%m.%d\') AS end_dt'
          , 'ca.coupon_notice'
        ])
        .from('coupon_app', 'ca')
        .where('ca.del_yn = :del_yn', { del_yn: 'N' })
        .andWhere('(ca.start_dt <= DATE_FORMAT(NOW(), \'%Y%m%d%H%i%s\') AND DATE_FORMAT(NOW(), \'%Y%m%d%H%i%s\') <= ca.end_dt)')
        .andWhere(new Brackets(qb => {
          qb.where('ca.product_app_id = :product_app_id', { product_app_id })
            .orWhere('ca.product_app_id IS NULL');
        }))
        .orderBy('coupon_app_id', 'DESC')
        .getRawMany();

      if (!couponList || couponList.length === 0) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: couponList,
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

  async updateMemberCouponApp(updateMemberCouponAppDto: UpdateMemberCouponAppDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { member_coupon_app_id, order_app_id, account_app_id, use_yn} = updateMemberCouponAppDto;
      // 현재 시간 (YYYYMMDDHHIISS 형식)
      const currentDate = getCurrentDateYYYYMMDDHHIISS();
      
      // TypeORM QueryBuilder 사용하여 데이터 업데이트
      const result = await this.dataSource
        .createQueryBuilder()
        .update('member_coupon_app')
        .set({
          order_app_id: order_app_id,
          use_yn: use_yn,
          use_dt: currentDate,
          mod_dt: currentDate,
          mod_id: account_app_id
        })
        .where('member_coupon_app_id = :member_coupon_app_id', { member_coupon_app_id })
        .execute();
      
      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 쿠폰 사용 여부를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }
      
      return {
        success: true,
        message: '쿠폰 사용 여부가 성공적으로 업데이트되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error updating coupon use yn:', error);
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