import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InquiryApp } from '../entities/inquiry-app.entity';
import { GetInquiryAppListDto, InquiryAppListResponse, InsertInquiryAppDto, UpdateInquiryAppDto, DeleteInquiryAppDto } from './dto/inquiry-app.dto';
import { COMMON_RESPONSE_CODES } from '../core/constants/response-codes';

@Injectable()
export class InquiryAppService {
  constructor(
    @InjectRepository(InquiryApp)
    private inquiryAppRepository: Repository<InquiryApp>,
    private dataSource: DataSource
  ) {}

  async insertInquiryApp(insertInquiryAppDto: InsertInquiryAppDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { 
        account_app_id,
        inquiry_type,
        title,
        content
      } = insertInquiryAppDto;

      // Using the provided SQL query with QueryBuilder
      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into(InquiryApp)
        .values({
          account_app_id,
          inquiry_type,
          title,
          content,
          answer: undefined,
          answer_dt: undefined,
          reg_dt: () => "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')",
          reg_id: account_app_id,
          mod_dt: undefined,
          mod_id: undefined,
          del_yn: 'N'
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

  async getInquiryAppList(getInquiryAppListDto: GetInquiryAppListDto): Promise<{ success: boolean; data: InquiryAppListResponse[] | null; code: string }> {
    const { account_app_id } = getInquiryAppListDto;

    try {
      // 요청된 쿼리를 사용하여 데이터 조회
      const inquiryAppList = await this.dataSource
        .createQueryBuilder()
        .select('title', 'title')
        .addSelect('content', 'content')
        .addSelect('inquiry_type', 'inquiry_type')
        .addSelect('inquiry_app_id', 'inquiry_app_id')
        .addSelect('answer', 'answer')
        .addSelect('answer_dt', 'answer_dt')
        .addSelect('reg_dt', 'reg_dt')
        .from('inquiry_app', 'ia')
        .where('ia.del_yn = :del_yn', { del_yn: 'N' })
        .andWhere('ia.account_app_id = :account_app_id', { account_app_id: account_app_id })
        .orderBy('inquiry_app_id', 'DESC')
        .getRawMany();

      if (!inquiryAppList || inquiryAppList.length === 0) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: inquiryAppList,
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

  async updateInquiryApp(updateInquiryAppDto: UpdateInquiryAppDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { 
        inquiry_app_id,
        inquiry_type,
        title,
        content,
        account_app_id,
        mod_id
      } = updateInquiryAppDto;

      const finalModId = account_app_id || mod_id;

      // 필드 값 설정
      const updateFields = {
        mod_dt: () => "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')",
        mod_id: finalModId
      };

      if (inquiry_type !== undefined) {
        updateFields['inquiry_type'] = inquiry_type;
      }
      
      if (title !== undefined) {
        updateFields['title'] = title;
      }
      
      if (content !== undefined) {
        updateFields['content'] = content;
      }
      
      // Using QueryBuilder
      const result = await this.inquiryAppRepository
        .createQueryBuilder()
        .update(InquiryApp)
        .set(updateFields)
        .where("inquiry_app_id = :inquiry_app_id", { inquiry_app_id })
        .execute();

      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 문의사항을 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        message: '문의사항이 성공적으로 업데이트되었습니다.',
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

  async deleteInquiryApp(deleteInquiryAppDto: DeleteInquiryAppDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { 
        inquiry_app_id,
        account_app_id
      } = deleteInquiryAppDto;

      // Using QueryBuilder
      const result = await this.inquiryAppRepository
        .createQueryBuilder()
        .update(InquiryApp)
        .set({
          del_yn: 'Y',
          mod_dt: () => "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')",
          mod_id: account_app_id
        })
        .where("inquiry_app_id = :inquiry_app_id", { inquiry_app_id })
        .execute();

      if (result.affected === 0) {
        return {
          success: false,
          message: '삭제할 문의사항을 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        message: '문의사항이 성공적으로 삭제되었습니다.',
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