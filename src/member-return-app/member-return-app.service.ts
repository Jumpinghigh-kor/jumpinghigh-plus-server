import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import { COMMON_RESPONSE_CODES } from '../core/constants/response-codes';
import { MemberReturnApp } from '../entities/member-return-app.entity';
import { getCurrentDateYYYYMMDDHHIISS } from '../core/utils/date.utils';
import { InsertMemberReturnAppDto, UpdateMemberReturnAppOrderAddressIdDto, UpdateMemberReturnAppCancelYnDto, GetMemberReturnAppDetailDto, UpdateMemberReturnAppApprovalYnDto } from './dto/member-return-app.dto';

@Injectable()
export class MemberReturnAppService {
  constructor(
    @InjectRepository(MemberReturnApp)
    private memberReturnAppRepository: Repository<MemberReturnApp>,
    private dataSource: DataSource,
  ) {}

  async getMemberReturnAppList(account_app_id: string, order_detail_app_id: number, type: string, search_content: string, year: string): Promise<{ success: boolean; data: any | null; code: string }> {
    try {
      const where: string[] = [];
      const params: any = { account_app_id };
      if(order_detail_app_id) {
        where.push(`mra.order_detail_app_id = ${order_detail_app_id}`);
      } else {
        where.push(`mra.del_yn = 'N'`);
        where.push(`mra.approval_yn = 'Y'`);
      }

      if(type == 'cancel') {
        where.push(`moda.order_status = 'CANCEL_COMPLETE'`);
      } else if(type == 'return') {
        where.push(`moda.order_status = 'RETURN_COMPLETE'`);
      } else if(type == 'exchange') {
        where.push(`moda.order_status = 'EXCHANGE_COMPLETE'`);
      }

      if(search_content) {
        where.push('LOWER(pa.product_name) LIKE :search_content');
        params.search_content = `%${search_content.toLowerCase()}%`;
      }

      if(year) {
        where.push(`DATE_FORMAT(mra.reg_dt, "%Y") = :year`);
        params.year = year;
      }
      
      const result = await this.dataSource
        .createQueryBuilder()
        .select([
          'mra.return_app_id AS return_app_id'
          , 'mra.order_detail_app_id AS order_detail_app_id'
          , 'mra.return_applicator AS return_applicator'
          , 'mra.return_reason_type AS return_reason_type'
          , 'mra.reason AS reason'
          , 'mra.cancel_yn AS cancel_yn'
          , 'mra.customer_tracking_number AS customer_tracking_number'
          , 'mra.company_tracking_number AS company_tracking_number'
          , 'mra.customer_courier_code AS customer_courier_code'
          , 'mra.company_courier_code AS company_courier_code'
          , 'mra.quantity AS quantity'
          , 'DATE_FORMAT(mra.reg_dt, "%y.%m.%d") AS reg_dt'
          , 'pa.product_app_id AS product_app_id'
          , 'pa.brand_name AS brand_name'
          , 'pa.product_name AS product_name'
          , 'pa.price AS price'
          , 'pa.original_price AS original_price'
          , 'pda.option_gender AS option_gender'
          , 'pda.option_unit AS option_unit'
          , 'pda.option_amount AS option_amount'
          , 'moda.order_status AS order_status'
          , 'moda.order_quantity AS order_quantity'
          , `
            (
              SELECT
                smpa.payment_amount
              FROM  member_payment_app smpa
              WHERE smpa.order_app_id = moa.order_app_id
              AND   smpa.payment_type = 'PRODUCT_BUY'
            ) AS payment_amount
          `
          , `
            (
              SELECT
                smoa.order_address_id
              FROM  member_order_address smoa
              WHERE smoa.order_detail_app_id = mra.order_detail_app_id
              AND   smoa.order_address_type = 'RETURN'
              AND   smoa.use_yn = 'Y'
              ORDER BY smoa.order_address_id DESC
              LIMIT 1
            ) AS return_order_address_id
          `
        ])
        .from('member_account_app', 'mca')
        .leftJoin('member_order_app', 'moa', 'mca.account_app_id = moa.account_app_id')
        .leftJoin('member_order_detail_app', 'moda', 'moa.order_app_id = moda.order_app_id')
        .leftJoin('product_detail_app', 'pda', 'moda.product_detail_app_id = pda.product_detail_app_id')
        .leftJoin('product_app', 'pa', 'pda.product_app_id = pa.product_app_id')
        .leftJoin('member_return_app', 'mra', 'moda.order_detail_app_id = mra.order_detail_app_id')
        .where('mca.account_app_id = :account_app_id', params)
        .andWhere('moda.order_status IN ("RETURN_COMPLETE", "EXCHANGE_COMPLETE", "CANCEL_COMPLETE")')
        .andWhere(where.join(' AND '), params)
        .getRawMany();
        
      if (!result) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: result,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Query Error:', error);
      return {
        success: false,
        data: null,
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }

  async getMemberReturnAppDetail(getMemberReturnAppDetailDto: GetMemberReturnAppDetailDto): Promise<{ success: boolean; data: any | null; code: string }> {
    try {
      const { return_app_id } = getMemberReturnAppDetailDto;
      
      const result = await this.dataSource
        .createQueryBuilder()
        .select([
          'mra.return_app_id AS return_app_id'
          , 'mra.order_detail_app_id AS order_detail_app_id'
          , 'mra.return_applicator AS return_applicator'
          , 'mra.return_reason_type AS return_reason_type'
          , 'mra.reason AS reason'
          , 'mra.cancel_yn AS cancel_yn'
          , 'mra.customer_tracking_number AS customer_tracking_number'
          , 'mra.company_tracking_number AS company_tracking_number'
          , 'mra.customer_courier_code AS customer_courier_code'
          , 'mra.company_courier_code AS company_courier_code'
          , 'mra.quantity AS quantity'
          , 'DATE_FORMAT(mra.reg_dt, "%y.%m.%d") AS reg_dt'
          , 'pa.product_app_id AS product_app_id'
          , 'pa.brand_name AS brand_name'
          , 'pa.product_name AS product_name'
          , 'pa.price AS price'
          , 'pa.original_price AS original_price'
          , 'pa.remote_delivery_fee AS remote_delivery_fee'
          , 'pda.option_gender AS option_gender'
          , 'pda.option_unit AS option_unit'
          , 'pda.option_amount AS option_amount'
          , 'moda.order_status AS order_status'
          , 'moda.order_quantity AS order_quantity'
          , `
            (
              SELECT
                smpa.payment_amount
              FROM  member_payment_app smpa
              WHERE smpa.order_app_id = moa.order_app_id
              AND   smpa.payment_type = 'PRODUCT_BUY'
            ) AS payment_amount
          `
          , `
            (
              SELECT
                smpa.refund_amount
              FROM  member_payment_app smpa
              WHERE smpa.order_app_id = moa.order_app_id
              AND   smpa.payment_type = 'PRODUCT_BUY'
              AND   smpa.payment_status = 'PAYMENT_REFUND'
            ) AS refund_amount
          `
          , `
            (
              SELECT
                smpa.payment_amount
              FROM  member_payment_app smpa
              WHERE smpa.order_app_id = moa.order_app_id
              AND   smpa.payment_type = 'DELIVERY_FEE'
            ) AS return_delivery_fee
          `
          , `
            (
              SELECT
                CASE
                  WHEN COUNT(*) > 0 THEN 'N'
                  ELSE 'Y'
                END
              FROM  member_payment_app smpa
              WHERE smpa.order_app_id = moa.order_app_id
              AND   smpa.payment_type = 'DELIVERY_FEE'
              AND   smpa.payment_status = 'PAYMENT_COMPLETE'
            ) AS is_admin_fault
          `
          , `
            (
              SELECT
                SUM(smpa.refund_amount)
              FROM  member_payment_app smpa
              WHERE smpa.order_app_id = moa.order_app_id
              AND   smpa.payment_status = 'PAYMENT_REFUND'
            ) AS total_refund_amount
          `
          , `
            (
              SELECT
                smoa.order_address_id
              FROM  member_order_address smoa
              WHERE smoa.order_detail_app_id = mra.order_detail_app_id
              AND   smoa.order_address_type = 'RETURN'
              AND   smoa.use_yn = 'Y'
              ORDER BY smoa.order_address_id DESC
              LIMIT 1
            ) AS return_order_address_id
          `
          , `
            (
              SELECT
                smoa.address
              FROM  member_order_address smoa
              WHERE smoa.order_detail_app_id = mra.order_detail_app_id
              AND   smoa.order_address_type = 'RETURN'
              AND   smoa.use_yn = 'Y'
              ORDER BY smoa.order_address_id DESC
              LIMIT 1
            ) AS address
          `
          , `
            (
              SELECT
                smoa.address_detail
              FROM  member_order_address smoa
              WHERE smoa.order_detail_app_id = mra.order_detail_app_id
              AND   smoa.order_address_type = 'RETURN'
              AND   smoa.use_yn = 'Y'
              ORDER BY smoa.order_address_id DESC
              LIMIT 1
            ) AS address_detail
          `
          , `
            (
              SELECT
                smoa.zip_code
              FROM  member_order_address smoa
              WHERE smoa.order_detail_app_id = mra.order_detail_app_id
              AND   smoa.order_address_type = 'RETURN'
              AND   smoa.use_yn = 'Y'
              ORDER BY smoa.order_address_id DESC
              LIMIT 1
            ) AS zip_code
          `
          , `
            (
              SELECT
                smoa.delivery_request
              FROM  member_order_address smoa
              WHERE smoa.order_detail_app_id = mra.order_detail_app_id
              AND   smoa.order_address_type = 'RETURN'
              AND   smoa.use_yn = 'Y'
              ORDER BY smoa.order_address_id DESC
              LIMIT 1
            ) AS delivery_request
          `
          , `
            (
              SELECT
                smoa.receiver_name
              FROM  member_order_address smoa
              WHERE smoa.order_detail_app_id = mra.order_detail_app_id
              AND   smoa.order_address_type = 'RETURN'
              AND   smoa.use_yn = 'Y'
              ORDER BY smoa.order_address_id DESC
              LIMIT 1
            ) AS receiver_name
          `
          , `
            (
              SELECT
                COUNT(*)
              FROM        member_order_address smoa
              INNER JOIN  extra_shipping_area sesa ON smoa.zip_code = sesa.zip_code
              WHERE       smoa.order_detail_app_id = mra.order_detail_app_id
              AND         smoa.order_address_type = 'RETURN'
              AND         smoa.use_yn = 'Y'
            ) AS extra_shipping_area_cnt
          `
          , `
            (
              SELECT
                CONCAT(
                  SUBSTRING(smoa.receiver_phone, 1, 3), '-', 
                  SUBSTRING(smoa.receiver_phone, 4, 4), '-', 
                  SUBSTRING(smoa.receiver_phone, 8)
                ) AS receiver_phone
              FROM  member_order_address smoa
              WHERE smoa.order_detail_app_id = mra.order_detail_app_id
              AND   smoa.order_address_type = 'RETURN'
              AND   smoa.use_yn = 'Y'
              ORDER BY smoa.order_address_id DESC
              LIMIT 1
            ) AS receiver_phone
          `
          , `
            (
              SELECT
                IFNULL(SUM(smpa.point_amount), 0)
              FROM  member_point_app smpa
              WHERE smpa.order_detail_app_id = moda.order_detail_app_id
              AND   smpa.del_yn = 'N'
              AND   smpa.point_status = 'POINT_MINUS'
            ) AS point_use_amount
          `
          , `
            (
              SELECT
                discount_amount
              FROM      coupon_app sca
              LEFT JOIN member_coupon_app smca ON sca.coupon_app_id = smca.coupon_app_id
              WHERE     smca.order_app_id = moa.order_app_id
              AND       smca.use_yn = 'Y'
            ) AS coupon_discount_amount
          `
          , `
            (
              SELECT
                discount_type
              FROM      coupon_app sca
              LEFT JOIN member_coupon_app smca ON sca.coupon_app_id = smca.coupon_app_id
              WHERE     smca.order_app_id = moa.order_app_id
              AND       smca.use_yn = 'Y'
            ) AS coupon_discount_type
          `
        ])
        .from('member_account_app', 'mca')
        .leftJoin('member_order_app', 'moa', 'mca.account_app_id = moa.account_app_id')
        .leftJoin('member_order_detail_app', 'moda', 'moa.order_app_id = moda.order_app_id')
        .leftJoin('product_detail_app', 'pda', 'moda.product_detail_app_id = pda.product_detail_app_id')
        .leftJoin('product_app', 'pa', 'pda.product_app_id = pa.product_app_id')
        .leftJoin('member_return_app', 'mra', 'moda.order_detail_app_id = mra.order_detail_app_id')
        .where('mra.return_app_id = :return_app_id', { return_app_id })
        .andWhere('mra.del_yn = :del_yn', { del_yn: 'N' })
        .getRawOne();
        
      if (!result) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: result,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Query Error:', error);
      return {
        success: false,
        data: null,
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }

  async insertMemberReturnApp(returnData: any): Promise<{ success: boolean; message: string; code: string }> {

    try {
      const formattedDate = getCurrentDateYYYYMMDDHHIISS();
      
      await this.dataSource.manager
        .createQueryBuilder()
        .insert()
        .into('member_return_app')
        .values({
          order_detail_app_id: returnData.order_detail_app_id,
          order_address_id: returnData.order_address_id,
          account_app_id: returnData.account_app_id,
          return_applicator: 'CUSTOMER',
          return_reason_type: returnData.return_reason_type,
          reason: returnData.reason,
          customer_tracking_number: null,
          company_tracking_number: null,
          customer_courier_code: null,
          company_courier_code: null,
          quantity: returnData.quantity,
          return_goodsflow_id: null,
          approval_yn: null,
          cancel_yn: 'N',
          del_yn: 'N',
          reg_dt: formattedDate,
          reg_id: returnData.account_app_id,
          mod_dt: null,
          mod_id: null
        })
        .execute();

      return {
        success: true,
        message: '반품 신청이 성공적으로 등록되었습니다.',
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

  async updateMemberReturnApp(returnData: {
    account_app_id: string;
    order_detail_app_ids: number[];
    return_reason_type: string;
    reason: string;
    quantity: number;
    cancel_yn: string;
  }): Promise<{ success: boolean; data: any | null; code: string }> {
    try {
      const result = await this.dataSource
        .createQueryBuilder()
        .update('member_return_app')
        .set({
          return_reason_type: returnData.return_reason_type,
          reason: returnData.reason,
          quantity: returnData.quantity,
          cancel_yn: returnData.cancel_yn,
          mod_dt: getCurrentDateYYYYMMDDHHIISS(),
          mod_id: returnData.account_app_id
        })
        .where('order_detail_app_id IN (:...order_detail_app_ids)', { order_detail_app_ids: returnData.order_detail_app_ids })
        .execute();

      return {
        success: true,
        data: result,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error updating member return app:', error);
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

  async updateMemberReturnAppOrderAddressId(updateMemberReturnAppOrderAddressIdDto: UpdateMemberReturnAppOrderAddressIdDto): Promise<{ success: boolean; data: any | null; code: string }> {
    try {
      const { order_detail_app_id, order_address_id, account_app_id } = updateMemberReturnAppOrderAddressIdDto;
      const result = await this.dataSource
        .createQueryBuilder()
        .update('member_return_app')
        .set({
          order_address_id: order_address_id,
          mod_dt: getCurrentDateYYYYMMDDHHIISS(),
          mod_id: account_app_id
        })
        .where('order_detail_app_id = :order_detail_app_id', { order_detail_app_id: order_detail_app_id })
        .execute();
        
      return {
        success: true,
        data: result,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error updating member return app order address id:', error);
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

  async updateMemberReturnAppCancelYn(updateMemberReturnAppCancelYnDto: UpdateMemberReturnAppCancelYnDto): Promise<{ success: boolean; data: any | null; code: string }> {
    try {
      const { account_app_id, order_detail_app_ids, cancel_yn } = updateMemberReturnAppCancelYnDto;
      const result = await this.dataSource
        .createQueryBuilder()
        .update('member_return_app')
        .set({
          cancel_yn: cancel_yn,
          mod_dt: getCurrentDateYYYYMMDDHHIISS(),
          mod_id: account_app_id
        })
        .where('order_detail_app_id IN (:...order_detail_app_ids)', { order_detail_app_ids: order_detail_app_ids })
        .execute();

      return {
        success: true,
        data: result,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error updating member return app cancel yn:', error);
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

  async updateMemberReturnAppApprovalYn(updateMemberReturnAppApprovalYnDto: UpdateMemberReturnAppApprovalYnDto): Promise<{ success: boolean; data: any | null; code: string }> {
    try {
      const { account_app_id, order_detail_app_ids, approval_yn } = updateMemberReturnAppApprovalYnDto;
      
      const result = await this.dataSource
        .createQueryBuilder()
        .update('member_return_app')
        .set({
          approval_yn: approval_yn,
          mod_dt: getCurrentDateYYYYMMDDHHIISS(),
          mod_id: account_app_id
        })
        .where('order_detail_app_id IN (:...order_detail_app_ids)', { order_detail_app_ids: order_detail_app_ids })
        .execute();

      return {
        success: true,
        data: result,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
        console.error('Error updating member return app approval yn:', error);
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