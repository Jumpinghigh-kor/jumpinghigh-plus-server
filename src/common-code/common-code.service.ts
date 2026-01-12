import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InsertCommonFileDto } from './dto/common-code.dto';
import { COMMON_RESPONSE_CODES } from '../core/constants/response-codes';
import { getCurrentDateYYYYMMDDHHIISS } from '../core/utils/date.utils';

@Injectable()
export class CommonCodeService {
  constructor(
    @InjectDataSource() private dataSource: DataSource
  ) {}

  async insertCommonFile(insertCommonFileDto: InsertCommonFileDto): Promise<{ success: boolean; message: string; code: string; file_id?: number }> {
    try {
      const {
        file_name,
        file_path,
        file_division,
        account_app_id
      } = insertCommonFileDto;

      const reg_dt = getCurrentDateYYYYMMDDHHIISS();

      const result = await this.dataSource
        .createQueryBuilder()
        .insert()
        .into('common_file')
        .values({
          file_name,
          file_path,
          file_division,
          del_yn: 'N',
          reg_dt,
          reg_id: account_app_id,
          mod_dt: null,
          mod_id: null
        })
        .execute();
        
      return {
        success: true,
        message: '파일 정보가 성공적으로 저장되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS,
        file_id: result.raw.insertId
      };
    } catch (error: any) {
      return {
        success: false,
        message: '파일 정보 저장 중 오류가 발생했습니다.',
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }


  async getCommonCodeList(group_code: string): Promise<{ success: boolean; data: any[] | null; code: string }> {
    try {
      const commonCodes = await this.dataSource.manager
        .createQueryBuilder()
        .select([
          'cc.common_code AS common_code'
          , 'cc.common_code_name AS common_code_name'
          , 'cc.group_code AS group_code'
          , 'gc.group_code_name AS group_code_name'
          , 'cc.common_code_memo AS common_code_memo'
          , 'cc.order_seq AS order_seq'
          , 'cc.use_yn AS use_yn'
          , 'cc.reg_dt AS reg_dt'
          , 'cc.reg_id AS reg_id'
          , 'cc.mod_dt AS mod_dt'
          , 'cc.mod_id AS mod_id'
        ])
        .from('common_code', 'cc')
        .leftJoin('group_code', 'gc', 'cc.group_code = gc.group_code')
        .where('cc.group_code = :group_code', { group_code })
        .andWhere('cc.use_yn = :use_yn', { use_yn: 'Y' })
        .orderBy('cc.order_seq', 'ASC')
        .getRawMany();

      if (!commonCodes || commonCodes.length === 0) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: commonCodes,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error fetching common codes:', error);
      return {
        success: false,
        data: null,
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }

  async deleteCommonFile(file_id: number, account_app_id: number): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const mod_dt = getCurrentDateYYYYMMDDHHIISS();

      const result = await this.dataSource
        .createQueryBuilder()
        .update('common_file')
        .set({
          del_yn: 'Y',
          mod_dt,
          mod_id: account_app_id
        })
        .where('file_id = :file_id', { file_id })
        .execute();

      if (result.affected === 0) {
        return {
          success: false,
          message: '삭제할 파일을 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        message: '파일이 성공적으로 삭제되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error: any) {
      return {
        success: false,
        message: '파일 삭제 중 오류가 발생했습니다.',
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }
} 