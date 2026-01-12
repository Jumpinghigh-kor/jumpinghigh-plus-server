import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Member } from '../entities/member.entity';
import { MemberPaymentApp } from '../entities/member-payment-app.entity';
import { COMMON_RESPONSE_CODES } from '../core/constants/response-codes';
import { getCurrentDateYYYYMMDDHHIISS } from '../core/utils/date.utils';
import { InsertMemberPaymentAppDto } from './dto/member-payment-app.dto';

@Injectable()
export class MemberPaymentAppService {
  constructor(
    @InjectRepository(MemberPaymentApp)
    private memberPaymentAppRepository: Repository<MemberPaymentApp>,
    private dataSource: DataSource
  ) {}

  async insertMemberPaymentApp(insertMemberPaymentAppDto: InsertMemberPaymentAppDto): Promise<{ success: boolean; data: { payment_app_id: number } | null; code: string }> {
    try {
      const { order_app_id, account_app_id, return_app_id, payment_status, payment_type, payment_method, payment_amount, portone_imp_uid, portone_merchant_uid, portone_status, card_name } = insertMemberPaymentAppDto;
      
      const now_dt = getCurrentDateYYYYMMDDHHIISS();
      
      const result = await this.dataSource
        .createQueryBuilder()
        .insert()
        .into('member_payment_app')
        .values({
          order_app_id: order_app_id,
          account_app_id: account_app_id,
          return_app_id: return_app_id,
          payment_status: payment_status,
          payment_type: payment_type,
          payment_method: payment_method,
          payment_amount: payment_amount,
          payment_dt: now_dt,
          payment_memo: null,
          refund_amount: null,
          portone_imp_uid: portone_imp_uid,
          portone_merchant_uid: portone_merchant_uid,
          portone_status: portone_status,
          card_name: card_name,
          reg_dt: now_dt,
          reg_id: account_app_id,
          mod_dt: null,
          mod_id: null
        })
        .execute();
      
      const payment_app_id = result.identifiers[0].payment_app_id;
      
      return {
        success: true,
        data: { payment_app_id },
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error creating payment:', error);
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