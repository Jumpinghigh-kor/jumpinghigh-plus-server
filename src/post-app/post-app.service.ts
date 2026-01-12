import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { COMMON_RESPONSE_CODES } from '../core/constants/response-codes';
import { PostApp } from '../entities/post-app.entity';
import { GetPostAppListDto, PostAppListResponse, InsertMemberPostAppDto, DeleteMemberPostAppDto, UpdateMemberPostAppDto } from './dto/post-app.dto';
import { getCurrentDateYYYYMMDDHHIISS } from 'src/core/utils/date.utils';

@Injectable()
export class PostAppService {
  constructor(
    @InjectRepository(PostApp)
    private postAppRepository: Repository<PostApp>
  ) {}

  async getPostAppList(getPostAppListDto: GetPostAppListDto): Promise<{ success: boolean; data: PostAppListResponse[] | null; code: string }> {
    try {
      const { account_app_id, post_type } = getPostAppListDto;

      const queryBuilder = this.postAppRepository
        .createQueryBuilder('pa')
        .select([
          'pa.post_app_id AS post_app_id'
          , 'pa.post_type AS post_type'
          , 'pa.all_send_yn AS all_send_yn'
          , 'pa.push_send_yn AS push_send_yn'
          , 'pa.title AS title'
          , 'pa.content AS content'
          , 'DATE_FORMAT(pa.reg_dt, "%Y.%m.%d %H:%i") AS reg_dt'
          , 'mpa.member_post_app_id AS member_post_app_id'
          , 'mpa.read_dt AS read_dt'
        ])
        .addSelect(
          `CASE
            WHEN  (mpa.member_post_app_id IS NULL OR mpa.read_yn = 'N') THEN 'N'
            ELSE  'Y'
          END AS read_yn`
        )
        .innerJoin('member_account_app', 'maa', 'maa.account_app_id = :account_app_id', { account_app_id: account_app_id })
        .leftJoin('member_post_app', 'mpa', 'pa.post_app_id = mpa.post_app_id AND mpa.account_app_id = maa.account_app_id')
        .where('maa.reg_dt <= pa.reg_dt')
        .andWhere('pa.del_yn = :delYn', { delYn: 'N' })
        .andWhere(
          new Brackets((qb) => {
            qb.where(
              new Brackets((qb2) => {
                qb2
                  .where('pa.all_send_yn = :allSend', { allSend: 'Y' })
                  .andWhere(
                    new Brackets((qb3) => {
                      qb3
                        .where('mpa.member_post_app_id IS NULL')
                        .orWhere('mpa.del_yn = :mpaDelYn', { mpaDelYn: 'N' });
                    }),
                  );
              }),
            )
              .orWhere(
                new Brackets((qb2) => {
                  qb2
                    .where('pa.all_send_yn = :eachSend', { eachSend: 'N' })
                    .andWhere('mpa.member_post_app_id IS NOT NULL')
                    .andWhere('mpa.del_yn = :mpaDelYn', { mpaDelYn: 'N' });
                }),
              );
          }),
        )
        .andWhere(
          new Brackets((qb) => {
            qb.where('pa.post_type = :allType', { allType: 'ALL' })
              .orWhere('pa.post_type = :postType', { postType: post_type });
          }),
        )
        .orderBy('pa.reg_dt', 'DESC');

      const postAppList = await queryBuilder.getRawMany();

      return {
        success: true,
        data: postAppList,
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

  async insertMemberPostApp(insertMemberPostAppDto: InsertMemberPostAppDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { account_app_id, post_app_id } = insertMemberPostAppDto;
      
      const reg_dt = getCurrentDateYYYYMMDDHHIISS();
      
      await this.postAppRepository
        .createQueryBuilder()
        .insert()
        .into('member_post_app')
        .values({
          account_app_id: account_app_id,
          post_app_id: post_app_id,
          read_yn: 'Y',
          read_dt: reg_dt,
          del_yn: 'N',
          reg_dt: reg_dt,
          reg_id: account_app_id,
          mod_dt: null,
          mod_id: null
        })
        .execute();
      
      return {
        success: true,
        message: '회원 우편 정보가 성공적으로 등록되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error creating member post:', error);
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

  async updateMemberPostApp(updateMemberPostAppDto: UpdateMemberPostAppDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { account_app_id, member_post_app_id, read_yn } = updateMemberPostAppDto;
      
      const reg_dt = getCurrentDateYYYYMMDDHHIISS();
      
      await this.postAppRepository
        .createQueryBuilder()
        .update('member_post_app')
        .set({
          read_yn: read_yn,
          read_dt: reg_dt,
          mod_dt: reg_dt,
          mod_id: account_app_id
        })
        .where('member_post_app_id = :member_post_app_id', { member_post_app_id })
        .execute();
      
      return {
        success: true,
        message: '회원 우편 정보가 성공적으로 업데이트되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error updating member post:', error);
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

  async deleteMemberPostApp(deleteMemberPostAppDto: DeleteMemberPostAppDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { account_app_id, post_app_id } = deleteMemberPostAppDto;
      
      const reg_dt = getCurrentDateYYYYMMDDHHIISS();
      
      await this.postAppRepository
        .createQueryBuilder()
        .update('member_post_app')
        .set({
          del_yn: 'Y',
          mod_dt: reg_dt,
          mod_id: account_app_id
        })
        .where('post_app_id IN (:...post_app_ids)', { post_app_ids: post_app_id })
        .andWhere('account_app_id = :account_app_id', { account_app_id: account_app_id })
        .execute();
      
      return {
        success: true,
        message: '회원 우편 정보가 성공적으로 삭제되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error deleting member post:', error);
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