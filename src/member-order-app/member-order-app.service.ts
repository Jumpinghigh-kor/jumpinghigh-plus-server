import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Member } from '../entities/member.entity';
import { COMMON_RESPONSE_CODES } from '../core/constants/response-codes';
import { getCurrentDateYYYYMMDDHHIISS } from '../core/utils/date.utils';
import { InsertMemberOrderAppDto, InsertMemberOrderDetailAppDto } from './dto/member-order-app.dto';
import { UpdateOrderStatusDto, UpdateOrderQuantityDto, UpdateMemberOrderDetailAppDto } from './dto/member-order-app.dto';

@Injectable()
export class MemberOrderAppService {
  constructor(
    private dataSource: DataSource
  ) {}

  async getMemberOrderAppList(account_app_id: string, screen_type: string, year: string, search_title: string): Promise<{ success: boolean; data: any[] | null; code: string }> {

    try {
      const subQuery = this.dataSource.manager
        .createQueryBuilder()
        .select([
          'pa.product_app_id AS product_app_id'
          , 'pa.brand_name AS brand_name'
          , 'pa.product_name AS product_name'
          , 'pa.title AS product_title'
          , 'pa.courier_code AS courier_code'
          , 'pa.discount AS discount'
          , 'pa.give_point AS give_point'
          , 'pa.remote_delivery_fee AS remote_delivery_fee'
          , 'FORMAT(pa.delivery_fee, 0) AS delivery_fee'
          , 'pa.free_shipping_amount AS free_shipping_amount'
          , 'pa.inquiry_phone_number AS inquiry_phone_number'
          , 'pa.today_send_yn AS today_send_yn'
          , 'CONCAT(SUBSTRING(pa.today_send_time, 1, 2), ":", SUBSTRING(pa.today_send_time, 3, 2)) AS today_send_time'
          , 'pa.not_today_send_day AS not_today_send_day'
          , 'FORMAT(pa.original_price, 0) AS original_price'
          , 'FORMAT(pa.price, 0) AS price'
          , `
              (
                SELECT
                  FORMAT(SUM(smpa.payment_amount) - IFNULL(SUM(smpa.refund_amount), 0), 0)
                FROM  member_payment_app smpa
                WHERE smpa.order_app_id = moa.order_app_id
              ) AS order_price
            `
          , 'pda.product_detail_app_id AS product_detail_app_id'
          , 'pda.option_amount AS option_amount'
          , 'pda.option_type AS option_type'
          , 'pda.option_unit AS option_unit'
          , 'pda.option_gender AS option_gender'
          , `
              (
                SELECT
                  CASE
                    WHEN COUNT(*) > 0 THEN 'Y'
                    ELSE 'N'
                  END
                FROM  member_review_app smra
                WHERE smra.account_app_id = moa.account_app_id
                AND   smra.product_app_id = pda.product_app_id
                AND   smra.del_yn = 'N'
            ) AS review_yn`
            , 'moa.order_app_id AS order_app_id'
            , 'moda.order_detail_app_id AS order_detail_app_id'
            , 'pa.return_delivery_fee AS return_delivery_fee'
            , 'moda.order_status AS order_status'
            , 'moda.order_quantity AS order_quantity'
            , 'DATE_FORMAT(moa.order_dt, "%y.%m.%d") AS order_dt'
            , 'moda.tracking_number AS tracking_number'
            , 'moda.purchase_confirm_dt AS purchase_confirm_dt'
            , 'moda.shipping_complete_dt AS shipping_complete_dt'
            , 'moda.goodsflow_id AS goodsflow_id'
            , 'mra.approval_yn AS approval_yn'
            , 'mra.return_app_id AS return_app_id'
            , 'mra.return_reason_type AS return_reason_type'
            , 'mra.reason AS reason'
            , 'mra.return_goodsflow_id AS return_goodsflow_id'
            , 'mra.customer_tracking_number AS customer_tracking_number'
            , 'mra.company_tracking_number AS company_tracking_number'
            , 'mra.customer_courier_code AS customer_courier_code'
            , 'mra.company_courier_code AS company_courier_code'
            , `
                (
                  SELECT
                    smoa.receiver_name
                  FROM  member_order_address smoa
                  WHERE smoa.order_detail_app_id = moda.order_detail_app_id
                  AND   smoa.use_yn = 'Y'
                ) AS receiver_name
              `
            , `
            		(
                  SELECT
                    smpa.payment_app_id
                  FROM	member_payment_app smpa
                  WHERE	smpa.order_app_id = moa.order_app_id
                  AND		smpa.payment_type = 'PRODUCT_BUY'
                )	AS 	payment_app_id
              `
            , `
              (
                SELECT
                  smoa.order_address_id
                FROM  member_order_address smoa
                WHERE smoa.order_detail_app_id = moda.order_detail_app_id
                AND   smoa.order_address_type = 'ORDER'
                ORDER BY smoa.order_address_id DESC
                LIMIT 1
              ) AS order_address_id
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
                  SUM(smpa.payment_amount)
                FROM  member_payment_app smpa
                WHERE smpa.order_app_id = moa.order_app_id
                AND   smpa.payment_status = 'PAYMENT_COMPLETE'
              ) AS total_payment_amount
            `
            , `
              (
                SELECT
                  SUM(smpa.refund_amount)
                FROM  member_payment_app smpa
                WHERE smpa.order_app_id = moa.order_app_id
              ) AS total_refund_amount
            `
            , `
              (
                SELECT
                  smpa.payment_app_id
                FROM  member_payment_app smpa
                WHERE smpa.order_app_id = moa.order_app_id
                AND   smpa.return_app_id = mra.return_app_id
                AND   smpa.payment_status = 'PAYMENT_COMPLETE'
                AND   smpa.payment_type = 'DELIVERY_FEE'
              ) AS delivery_fee_payment_app_id
            `
            , `
              (
                SELECT
                  SUM(smpa.payment_amount)
                FROM  member_payment_app smpa
                WHERE smpa.order_app_id = moa.order_app_id
                AND   smpa.payment_status = 'PAYMENT_COMPLETE'
                AND   smpa.payment_type = 'DELIVERY_FEE'
              ) AS total_delivery_fee_amount
            `
            , `
            (
              SELECT
                smpa.portone_imp_uid
              FROM  member_payment_app smpa
              WHERE smpa.order_app_id = moa.order_app_id
              AND   smpa.return_app_id = mra.return_app_id
              AND   smpa.payment_status = 'PAYMENT_COMPLETE'
              AND   smpa.payment_type = 'DELIVERY_FEE'
            ) AS delivery_fee_portone_imp_uid
          `
          , `
            (
              SELECT
                smpa.portone_merchant_uid
              FROM  member_payment_app smpa
              WHERE smpa.order_app_id = moa.order_app_id
              AND   smpa.return_app_id = mra.return_app_id
              AND   smpa.payment_status = 'PAYMENT_COMPLETE'
              AND   smpa.payment_type = 'DELIVERY_FEE'
            ) AS delivery_fee_portone_merchant_uid
          `
        ])
        .from('member_account_app', 'mca')
        .innerJoin('member_order_app', 'moa', 'mca.account_app_id = moa.account_app_id')
        .leftJoin('member_order_detail_app', 'moda', 'moa.order_app_id = moda.order_app_id')
        .leftJoin('product_detail_app', 'pda', 'moda.product_detail_app_id = pda.product_detail_app_id')
        .leftJoin('product_app', 'pa', 'pda.product_app_id = pa.product_app_id')
        .leftJoin('member_return_app', 'mra', 'moda.order_detail_app_id = mra.order_detail_app_id AND mra.del_yn = "N" AND mra.cancel_yn = "N"')
        .where('moa.account_app_id = :account_app_id', { account_app_id })
        .andWhere('moa.del_yn = :del_yn', { del_yn: 'N' })
        .orderBy('moa.order_dt', 'DESC');

      if(screen_type == 'REVIEW') {
        subQuery.andWhere('order_status = :status', { status: 'PURCHASE_CONFIRM' });
      }
      
      if(year) {
        subQuery.andWhere('DATE_FORMAT(moa.order_dt, "%Y") = :year', { year });
      }
      
      if(search_title) {
        subQuery.andWhere('pa.product_name LIKE CONCAT("%", :search_title, "%")', { search_title });
      }
      
      // Create a wrapper query that selects from the subquery
      const queryBuilder = this.dataSource.manager
        .createQueryBuilder()
        .select('*')
        .from(`(${subQuery.getQuery()})`, 'A')
        .setParameters(subQuery.getParameters());
        
      if(screen_type == 'REVIEW') {
        queryBuilder.andWhere('review_yn = :review_yn', { review_yn: 'N' });
      }

      const orders = await queryBuilder.getRawMany();
      
      if (!orders || orders.length === 0) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: orders,
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

  async insertMemberOrderApp(insertMemberOrderAppDto: InsertMemberOrderAppDto): Promise<{ success: boolean; message: string; code: string; order_app_id: number | null }> {
    try {
      const { account_app_id } = insertMemberOrderAppDto;
      
      const reg_dt = getCurrentDateYYYYMMDDHHIISS();
      
      const result = await this.dataSource
        .createQueryBuilder()
        .insert()
        .into('member_order_app')
        .values({
          account_app_id: account_app_id,
          order_dt: reg_dt,
          order_memo: null,
          order_memo_dt: null,
          memo_check_yn: null,
          memo_del_yn: null,
          del_yn: 'N',
          reg_dt: reg_dt,
          reg_id: account_app_id,
          mod_dt: null,
          mod_id: null
        })
        .execute();
      
      const insertedId: number | null =
        (result as any)?.identifiers?.[0]?.order_app_id ??
        (result as any)?.raw?.insertId ??
        null;
      
      return {
        success: true,
        message: '주문 정보가 성공적으로 등록되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS,
        order_app_id: insertedId
      };
    } catch (error) {
      console.error('Error creating order:', error);
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

  async insertMemberOrderDetailApp(insertMemberOrderDetailAppDto: InsertMemberOrderDetailAppDto): Promise<{ success: boolean; message: string; code: string; order_detail_app_id: number | null }> {
    try {
      const { account_app_id, order_app_id, product_detail_app_id, order_status, order_quantity, order_group } =
        insertMemberOrderDetailAppDto;
      
      const reg_dt = getCurrentDateYYYYMMDDHHIISS();

      // Optional shipping/payment related fields: use provided values or default to null
      const courier_code = (insertMemberOrderDetailAppDto as any).courier_code ?? null;
      const tracking_number = (insertMemberOrderDetailAppDto as any).tracking_number ?? null;
      const goodsflow_id = (insertMemberOrderDetailAppDto as any).goodsflow_id ?? null;
      const purchase_confirm_dt = (insertMemberOrderDetailAppDto as any).purchase_confirm_dt ?? null;
      const shipping_complete_dt = (insertMemberOrderDetailAppDto as any).shipping_complete_dt ?? null;
      
      const order_group_result = await this.dataSource
        .createQueryBuilder()
        .select('IFNULL(MAX(moda.order_group) + 1, 1) AS max_order_group')
        .from('member_order_detail_app', 'moda')
        .where('moda.order_app_id = :order_app_id', { order_app_id: order_app_id })
        .getRawOne();

      const finalOrderGroup =
        order_group ?? (order_group_result?.max_order_group ?? 1);

      const result = await this.dataSource
        .createQueryBuilder()
        .insert()
        .into('member_order_detail_app')
        .values({
          order_app_id: order_app_id
          , product_detail_app_id: product_detail_app_id
          , order_status: order_status
          , order_quantity: order_quantity
          , order_group: finalOrderGroup
          , courier_code: courier_code
          , tracking_number: tracking_number
          , goodsflow_id: goodsflow_id
          , shipping_complete_dt: shipping_complete_dt
          , purchase_confirm_dt: purchase_confirm_dt
          , reg_dt: reg_dt
          , reg_id: account_app_id
          , mod_dt: null
          , mod_id: null
        })
        .execute();
      
      const insertedId: number | null =
        (result as any)?.identifiers?.[0]?.order_detail_app_id ??
        (result as any)?.raw?.insertId ??
        null;
      
      return {
        success: true,
        message: '주문 상세 정보가 성공적으로 등록되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS,
        order_detail_app_id: insertedId
      };
    } catch (error) {
      console.error('Error creating order detail:', error);
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

  async updateMemberOrderDetailApp(updateData: UpdateMemberOrderDetailAppDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { account_app_id, order_detail_app_ids, courier_code, tracking_number, goodsflow_id, purchase_confirm_dt } = updateData;
      

      const result = await this.dataSource
        .createQueryBuilder()
        .update('member_order_detail_app')
        .set({
          courier_code: courier_code,
          tracking_number: tracking_number,
          goodsflow_id: goodsflow_id,
          purchase_confirm_dt: purchase_confirm_dt,
          mod_dt: getCurrentDateYYYYMMDDHHIISS(),
          mod_id: account_app_id
        })
        .where("order_detail_app_id IN (:...order_detail_app_ids)", { order_detail_app_ids: order_detail_app_ids })
        .execute();

      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 주문 정보를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        message: '주문 상태가 수정되었습니다',
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

  async updateOrderStatus(updateData: UpdateOrderStatusDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { account_app_id, order_detail_app_ids, order_group, order_status } = updateData;
      
      const setPayload: any = {
        order_status: order_status,
        mod_dt: getCurrentDateYYYYMMDDHHIISS(),
        mod_id: account_app_id
      };

      if (order_status == 'PURCHASE_CONFIRM') {
        setPayload.purchase_confirm_dt = getCurrentDateYYYYMMDDHHIISS();
      }

      // 취소/반품/교환 신청 또는 구매확정 상태로 변경될 때는 동일 주문 내에서 새 order_group 으로 이동시키고,
      // 프론트에서 넘어온 order_group 값은 사용하지 않는다.
      const shouldMoveToNewGroup = ['CANCEL_APPLY', 'RETURN_APPLY', 'EXCHANGE_APPLY', 'PURCHASE_CONFIRM'].includes(order_status);

      if (shouldMoveToNewGroup && order_detail_app_ids && order_detail_app_ids.length > 0) {
        const firstDetail = await this.dataSource
          .createQueryBuilder()
          .select('moda.order_app_id', 'order_app_id')
          .from('member_order_detail_app', 'moda')
          .where('moda.order_detail_app_id = :id', { id: order_detail_app_ids[0] })
          .getRawOne();

        const order_app_id = firstDetail?.order_app_id;

        if (order_app_id) {
          const maxGroupResult = await this.dataSource
            .createQueryBuilder()
            .select('IFNULL(MAX(moda.order_group) + 1, 1)', 'next_group')
            .from('member_order_detail_app', 'moda')
            .where('moda.order_app_id = :order_app_id', { order_app_id })
            .getRawOne();

          const nextGroup = maxGroupResult?.next_group ?? 1;
          setPayload.order_group = nextGroup;
        }
      } else if (order_group !== undefined && order_group !== null) {
        // 위의 특별 케이스가 아닌 경우에만 프론트에서 전달한 order_group을 그대로 사용
        setPayload.order_group = order_group;
      }

      const result = await this.dataSource
        .createQueryBuilder()
        .update('member_order_detail_app')
        .set(setPayload)
        .where("order_detail_app_id IN (:...order_detail_app_ids)", { order_detail_app_ids: order_detail_app_ids })
        .execute();

      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 주문 정보를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        message: '주문 상태가 수정되었습니다',
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

  async updateOrderQuantity(updateData: UpdateOrderQuantityDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { account_app_id, order_detail_app_id, order_quantity } = updateData;

      const setPayload: any = {
        order_quantity: order_quantity,
        mod_dt: () => "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')",
        mod_id: account_app_id
      };

      const result = await this.dataSource
        .createQueryBuilder()
        .update('member_order_detail_app')
        .set(setPayload)
        .where("order_detail_app_id = :order_detail_app_id", { order_detail_app_id: order_detail_app_id })
        .execute();

      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 주문 정보를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        message: '주문 수량이 수정되었습니다',
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