import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { COMMON_RESPONSE_CODES } from '../core/constants/response-codes';
import { getCurrentDateYYYYMMDDHHIISS } from '../core/utils/date.utils';
import { InsertMemberZzimAppDto, UpdateMemberZzimAppDto, GetMemberZzimAppListDto, GetMemberZzimAppDetailDto } from './dto/member-zzim-app.dto';

@Injectable()
export class MemberZzimAppService {
  constructor(
    private dataSource: DataSource
  ) {}

  async insertMemberZzimApp(insertMemberZzimAppDto: InsertMemberZzimAppDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { product_app_id, account_app_id } = insertMemberZzimAppDto;
      
      // 현재 시간 (YYYYMMDDHHIISS 형식)
      const reg_dt = getCurrentDateYYYYMMDDHHIISS();
      
      // TypeORM QueryBuilder 사용하여 데이터 삽입
      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into('member_zzim_app')
        .values({
          account_app_id: account_app_id,
          product_app_id: product_app_id,
          zzim_yn: 'Y',
          reg_dt: reg_dt,
          reg_id: account_app_id,
          mod_dt: null,
          mod_id: null
        })
        .execute();
      
      return {
        success: true,
        message: '찜 정보가 성공적으로 등록되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error creating zzim:', error);
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

  async updateMemberZzimApp(updateMemberZzimAppDto: UpdateMemberZzimAppDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { zzim_app_id, account_app_id, zzim_yn } = updateMemberZzimAppDto;
      // 현재 시간 (YYYYMMDDHHIISS 형식)
      const mod_dt = getCurrentDateYYYYMMDDHHIISS();
      
      // TypeORM QueryBuilder 사용하여 데이터 업데이트
      const result = await this.dataSource
        .createQueryBuilder()
        .update('member_zzim_app')
        .set({
          zzim_yn: zzim_yn,
          mod_dt: mod_dt,
          mod_id: account_app_id
        })
        .where('zzim_app_id = :zzim_app_id', { zzim_app_id })
        .execute();
      
      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 찜 정보를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }
      
      return {
        success: true,
        message: '찜 정보가 성공적으로 업데이트되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error updating zzim:', error);
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

  async getMemberZzimAppList(getMemberZzimAppListDto: GetMemberZzimAppListDto): Promise<{ success: boolean; data: any[] | null; code: string }> {
    try {
      const { account_app_id } = getMemberZzimAppListDto;
      
      const zzimList = await this.dataSource.manager
        .createQueryBuilder()
        .select([
          'p.product_app_id AS product_app_id'
          , 'p.big_category AS big_category'
          , 'p.title AS title'
          , 'FORMAT(p.price, 0) AS price'
          , 'FORMAT(p.original_price, 0) AS original_price'
          , 'p.discount AS discount'
          , 'mza.zzim_app_id AS zzim_app_id'
          , 'mza.zzim_yn AS zzim_yn'
          , 'mza.account_app_id AS account_app_id'
        ])
        .from('product_app', 'p')
        .leftJoin('member_zzim_app', 'mza', 'p.product_app_id = mza.product_app_id')
        .where('p.del_yn = :del_yn', { del_yn: 'N' })
        .andWhere('mza.account_app_id = :account_app_id', { account_app_id })
        .andWhere('mza.zzim_yn = :zzim_yn', { zzim_yn: 'Y' })
        .orderBy('mza.zzim_app_id', 'DESC')
        .getRawMany();

      if (!zzimList || zzimList.length === 0) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: zzimList,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error fetching zzim list:', error);
      return {
        success: false,
        data: null,
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }

  async getMemberZzimAppDetail(getMemberZzimAppDetailDto: GetMemberZzimAppDetailDto): Promise<{ success: boolean; data: any | null; code: string }> {
    try {
      const { account_app_id, product_app_id } = getMemberZzimAppDetailDto;
      
      const zzipDetail = await this.dataSource.manager
        .createQueryBuilder()
        .select([
          'mza.zzim_app_id AS zzim_app_id',
          'mza.account_app_id AS account_app_id',
          'mza.product_app_id AS product_app_id',
          'mza.zzim_yn AS zzim_yn',
          'mza.reg_dt AS reg_dt',
          'mza.mod_dt AS mod_dt'
        ])
        .from('member_zzim_app', 'mza')
        .where('mza.account_app_id = :account_app_id', { account_app_id })
        .andWhere('mza.product_app_id = :product_app_id', { product_app_id })
        .orderBy('mza.mod_dt', 'DESC')
        .limit(1)
        .getRawOne();

      if (!zzipDetail) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: zzipDetail,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error fetching zzip detail:', error);
      return {
        success: false,
        data: null,
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }
} 