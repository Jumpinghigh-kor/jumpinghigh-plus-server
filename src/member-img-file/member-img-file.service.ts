import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InsertMemberImgFileDto, MemberImgFileCntDto, SelectMemberImgFileDto, UpdateMemberImgFileDto } from './dto/member-img-file.dto';
import { COMMON_RESPONSE_CODES } from '../core/constants/response-codes';
import { getCurrentDateYYYYMMDDHHIISS } from '../core/utils/date.utils';

@Injectable()
export class MemberImgFileService {
  constructor(
    @InjectDataSource() private dataSource: DataSource
  ) {}

  async selectMemberImgFile(selectMemberImgFileDto: SelectMemberImgFileDto): Promise<{ success: boolean; data: any[] | null; code: string }> {
    try {
      const { account_app_id } = selectMemberImgFileDto;

      const memberImgFiles = await this.dataSource
        .createQueryBuilder()
        .select([
          'cf.file_id',
          'cf.file_name',
          'cf.file_path',
          'cf.file_division',
          'mif.member_img_id',
          `(
            SELECT
              smif.member_img_id
            FROM    member_img_file smif
            WHERE   smif.member_img_id = mif.member_img_id
            AND     smif.del_yn = 'N'
            AND     smif.use_yn = 'Y'
            ORDER BY smif.reg_dt ASC
            LIMIT 1
          ) AS target_member_img_id`
        ])
        .from('member_img_file', 'mif')
        .leftJoin('common_file', 'cf', 'mif.file_id = cf.file_id')
        .where('mif.account_app_id = :account_app_id', { account_app_id })
        .andWhere("mif.del_yn = 'N'")
        .andWhere("mif.use_yn = 'Y'")
        .getRawMany();

      return {
        success: true,
        data: memberImgFiles,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }

  async memberImgFileCnt(memberImgFileCntDto: MemberImgFileCntDto): Promise<{ success: boolean; data: { imgCnt: number } | null; code: string }> {
    try {
      const { account_app_id } = memberImgFileCntDto;

      const result = await this.dataSource
        .createQueryBuilder()
        .select('COUNT(*) AS imgCnt')
        .from('member_img_file', 'mif')
        .leftJoin('common_file', 'cf', 'mif.file_id = cf.file_id')
        .where('mif.account_app_id = :account_app_id', { account_app_id })
        .andWhere("mif.del_yn = 'N'")
        .andWhere("mif.use_yn = 'Y'")
        .getRawOne();

      return {
        success: true,
        data: result,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }

  async insertMemberImgFile(insertMemberImgFileDto: InsertMemberImgFileDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const {
        account_app_id,
        file_id
      } = insertMemberImgFileDto;

      const reg_dt = getCurrentDateYYYYMMDDHHIISS();

      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into('member_img_file')
        .values({
          account_app_id,
          file_id,
          use_yn: 'Y',
          del_yn: 'N',
          reg_dt,
          reg_id: account_app_id,
          mod_dt: null,
          mod_id: null
        })
        .execute();

      return {
        success: true,
        message: '회원 이미지 파일 정보가 성공적으로 저장되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      return {
        success: false,
        message: '회원 이미지 파일 정보 저장 중 오류가 발생했습니다.',
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }

  async updateMemberImgFile(updateMemberImgFileDto: UpdateMemberImgFileDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { member_img_id, account_app_id } = updateMemberImgFileDto;

      const mod_dt = getCurrentDateYYYYMMDDHHIISS();

      await this.dataSource
        .createQueryBuilder()
        .update('member_img_file')
        .set({ 
          use_yn: 'N',
          mod_dt,
          mod_id: account_app_id || null
        })
        .where('member_img_id = :member_img_id', { member_img_id })
        .execute();

      return {
        success: true,
        message: '회원 이미지 사용 여부가 성공적으로 업데이트되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error: any) {
      return {
        success: false,
        message: '회원 이미지 사용 여부 변경 중 오류가 발생했습니다.',
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }

  async deleteMemberImgFile(updateMemberImgFileDto: UpdateMemberImgFileDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { member_img_id, account_app_id } = updateMemberImgFileDto;

      const mod_dt = getCurrentDateYYYYMMDDHHIISS();

      await this.dataSource
        .createQueryBuilder()
        .update('member_img_file')
        .set({ 
          del_yn: 'Y',
          mod_dt,
          mod_id: account_app_id || null
        })
        .where('member_img_id = :member_img_id', { member_img_id })
        .execute();

      return {
        success: true,
        message: '회원 이미지가 성공적으로 삭제되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error: any) {
      return {
        success: false,
        message: '회원 이미지 삭제 중 오류가 발생했습니다.',
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }
} 