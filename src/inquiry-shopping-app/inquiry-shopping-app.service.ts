import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InquiryShoppingApp } from '../entities/inquiry-shopping-app.entity';
import { InsertInquiryShoppingAppDto } from './dto/inquiry-shopping-app.dto';
import { COMMON_RESPONSE_CODES } from '../core/constants/response-codes';

@Injectable()
export class InquiryShoppingAppService {
  constructor(
    @InjectRepository(InquiryShoppingApp)
    private inquiryShoppingAppRepository: Repository<InquiryShoppingApp>,
    private dataSource: DataSource,
  ) {}

  async insertInquiryShoppingApp(insertInquiryAppDto: InsertInquiryShoppingAppDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { 
        account_app_id,
        product_app_id,
        content
      } = insertInquiryAppDto;

      await this.inquiryShoppingAppRepository
        .createQueryBuilder()
        .insert()
        .into(InquiryShoppingApp)
        .values({
          account_app_id,
          product_app_id,
          content,
          del_yn: 'N',
          reg_dt: () => "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')",
          reg_id: account_app_id,
          mod_dt: undefined,
          mod_id: undefined
        })
        .execute();

      return {
        success: true,
        message: '문의사항이 성공적으로 저장되었습니다.',
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