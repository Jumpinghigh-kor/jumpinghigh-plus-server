import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { COMMON_RESPONSE_CODES } from '../core/constants/response-codes';
import { MemberReviewApp } from '../entities/member-review-app.entity';
import { GetMemberReviewAppListDto, ReviewImageDto } from './dto/member-review-app.dto';
import { getCurrentDateYYYYMMDDHHIISS } from '../core/utils/date.utils';

@Injectable()
export class MemberReviewAppService {
  constructor(
    @InjectRepository(MemberReviewApp)
    private memberReviewAppRepository: Repository<MemberReviewApp>,
    private connection: Connection
  ) {}

  // 작성된 리뷰 목록 조회
  async getMemberReviewAppList(getMemberReviewAppListDto: GetMemberReviewAppListDto): Promise<{ success: boolean; data: any[] | null; code: string }> {
    try {
      const { product_app_id, filter, review_img_yn } = getMemberReviewAppListDto;
      
      const queryBuilder = this.memberReviewAppRepository
      .createQueryBuilder('mra')
      .select([
          'maa.nickname AS nickname'
          , 'maa.status AS status'
          , 'mra.review_app_id AS review_app_id'
          , 'mra.account_app_id AS account_app_id'
          , 'mra.order_app_id AS order_app_id'
          , 'mra.product_app_id AS product_app_id'
          , 'mra.title AS title'
          , 'mra.content AS content'
          , 'mra.star_point AS star_point'
          , 'mra.admin_del_yn AS admin_del_yn'
          , 'DATE_FORMAT(mra.reg_dt, "%Y.%m.%d") AS reg_dt'
          , 'pa.product_app_id AS product_app_id'
          , `(
              SELECT
                CASE
                  WHEN COUNT(*) > 0 THEN 'Y'
                  ELSE 'N'
                END
              FROM  member_review_app_img mrai
              WHERE mrai.review_app_id = mra.review_app_id
              AND   mrai.del_yn = 'N'
            ) AS review_img_yn`
          , `
              (
                SELECT
                  COUNT(*)
                FROM  member_review_app_img mrai
                WHERE mrai.review_app_id = mra.review_app_id
                AND   mrai.del_yn = 'N'
                LIMIT 1
              ) AS review_img_count
            `
        ])
        .innerJoin('member_account_app', 'maa', 'mra.account_app_id = maa.account_app_id')
        .leftJoin('product_app', 'pa', 'mra.product_app_id = pa.product_app_id')
        .where('mra.del_yn = :del_yn', { del_yn: 'N' })
        .andWhere('maa.del_yn = :del_yn', { del_yn: 'N' })
       
      if (review_img_yn === 'Y') {
        queryBuilder.having('review_img_count > 0');
      }

      if (product_app_id) {
        queryBuilder.andWhere('mra.product_app_id = :product_app_id', { product_app_id });
      }

      if (filter === 'new') {
        queryBuilder.orderBy('mra.reg_dt', 'DESC');
      } else if (filter === 'high_star') {
        queryBuilder.orderBy('mra.star_point', 'DESC');
      } else if (filter === 'low_star') {
        queryBuilder.orderBy('mra.star_point', 'ASC');
      }
      
      const memberReviewAppList = await queryBuilder.getRawMany();

      if (!memberReviewAppList || memberReviewAppList.length === 0) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: memberReviewAppList,
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

  // 리뷰 쓰기 목록 조회
  async getCompleteMemberReviewAppList(account_app_id: string): Promise<{ success: boolean; data: any[] | null; code: string }> {
    try {
      const queryBuilder = this.memberReviewAppRepository
        .createQueryBuilder('mra')
        .select([
          'mra.review_app_id AS review_app_id'
          , 'mra.account_app_id AS account_app_id'
          , 'maa.nickname AS nickname'
          , 'mra.product_app_id AS product_app_id'
          , 'mra.content AS content'
          , 'mra.title AS review_title'
          , 'mra.star_point AS star_point'
          , 'mra.admin_del_yn AS admin_del_yn'
          , 'CONCAT(SUBSTRING(DATE_FORMAT(STR_TO_DATE(mra.reg_dt, "%Y%m%d%H%i%s"), "%Y.%m.%d"), 3, 2), ".", DATE_FORMAT(STR_TO_DATE(mra.reg_dt, "%Y%m%d%H%i%s"), "%m.%d")) AS reg_dt'
          , 'pa.product_app_id AS product_app_id'
          , 'pa.title AS product_title'
          , 'pa.brand_name AS brand_name'
          , 'pa.product_name AS product_name'
          , `
              (
                SELECT
                  spda.option_unit
                FROM        member_order_app smoa
                INNER JOIN  member_order_detail_app smoda ON smoa.order_app_id = smoda.order_app_id
                INNER JOIN  product_detail_app spda ON smoda.product_detail_app_id = spda.product_detail_app_id
                WHERE       smoa.order_app_id = mra.order_app_id
                AND       smoa.del_yn = 'N'
              ) AS option_unit
            `
          , `
              (
                SELECT
                  spda.option_amount
                FROM        member_order_app smoa
                INNER JOIN  member_order_detail_app smoda ON smoa.order_app_id = smoda.order_app_id
                INNER JOIN  product_detail_app spda ON smoda.product_detail_app_id = spda.product_detail_app_id
                WHERE       smoa.order_app_id = mra.order_app_id
                AND         smoa.del_yn = 'N'
              ) AS option_amount
            `
          , `
              (
                SELECT
                  smoda.order_quantity
                FROM        member_order_app smoa
                INNER JOIN  member_order_detail_app smoda ON smoa.order_app_id = smoda.order_app_id
                INNER JOIN  product_detail_app spda ON smoda.product_detail_app_id = spda.product_detail_app_id
                WHERE       smoa.order_app_id = mra.order_app_id
                AND         smoa.del_yn = 'N'
              ) AS order_quantity
            `
        ])
        .leftJoin('member_account_app', 'maa', 'mra.account_app_id = maa.account_app_id')
        .leftJoin('product_app', 'pa', 'mra.product_app_id = pa.product_app_id')
        .where('mra.account_app_id = :account_app_id', { account_app_id })
        .andWhere('maa.del_yn = :del_yn', { del_yn: 'N' })
        .andWhere('mra.del_yn = :del_yn', { del_yn: 'N' });
      
      const memberReviewAppList = await queryBuilder.getRawMany();

      if (!memberReviewAppList || memberReviewAppList.length === 0) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: memberReviewAppList,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error fetching complete member review app list:', error);
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

  async insertMemberReviewApp(reviewData: {
    account_app_id: number;
    order_app_id: number;
    product_app_id: number;
    title: string;
    content: string;
    star_point: number;
    file_ids?: number[];
    order_seq?: number;
  }): Promise<{ success: boolean; data: any | null; code: string }> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const formattedDate = getCurrentDateYYYYMMDDHHIISS();

      const reviewInsertResult = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into('member_review_app')
        .values({
          account_app_id: reviewData.account_app_id,
          order_app_id: reviewData.order_app_id,
          product_app_id: reviewData.product_app_id,
          title: reviewData.title,
          content: reviewData.content,
          star_point: reviewData.star_point,
          del_yn: 'N',
          admin_del_yn: 'N',
          reg_dt: formattedDate,
          reg_id: reviewData.account_app_id,
          mod_dt: null,
          mod_id: null
        })
        .execute();

      const reviewAppId = reviewInsertResult.identifiers[0].review_app_id || reviewInsertResult.raw.insertId;

      if (reviewData.file_ids && reviewData.file_ids.length > 0) {
        for (let i = 0; i < reviewData.file_ids.length; i++) {
          const fileId = reviewData.file_ids[i];
          const orderSeq = i + 1;

          await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into('member_review_app_img')
            .values({
              review_app_id: reviewAppId,
              file_id: fileId,
              order_seq: orderSeq,
              del_yn: 'N',
              reg_dt: formattedDate,
              reg_id: reviewData.account_app_id,
              mod_dt: null,
              mod_id: null
            })
            .execute();
        }
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        data: { review_app_id: reviewAppId },
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error inserting member review app:', error);
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        {
          success: false,
          message: error.message,
          code: COMMON_RESPONSE_CODES.FAIL
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateMemberReviewApp(updateData: {
    review_app_id: number;
    title: string;
    content: string;
    star_point: number;
    account_app_id: number;
    file_ids?: number[];
    review_app_img_id?: number[];
  }): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { review_app_id, title, content, star_point, account_app_id, review_app_img_id, file_ids } = updateData;
      const mod_dt = getCurrentDateYYYYMMDDHHIISS();
      
      const result = await this.memberReviewAppRepository
        .createQueryBuilder()
        .update('member_review_app')
        .set({
          title: title,
          content: content,
          star_point: star_point,
          mod_dt: mod_dt,
          mod_id: account_app_id
        })
        .where('review_app_id = :review_app_id', { review_app_id })
        .execute();
      
      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 리뷰를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      if (file_ids && file_ids.length > 0) {
        for (let i = 0; i < file_ids.length; i++) {
          const file_id = file_ids[i];
          const order_seq = i + 1;
          const insertImgResult = await this.memberReviewAppRepository
          .createQueryBuilder()
          .insert()
          .into('member_review_app_img')
          .values({
            review_app_id: review_app_id,
            file_id: file_id,
            order_seq: order_seq,
            del_yn: 'N',
            reg_dt: mod_dt,
            reg_id: account_app_id,
            mod_dt: null,
            mod_id: null
          })
          .execute();
        }
      }

      if (review_app_img_id && review_app_img_id.length > 0) {
        for (const review_app_img_ids of review_app_img_id) {
          const delteImgResult = await this.memberReviewAppRepository
            .createQueryBuilder()
            .update('member_review_app_img')
            .set({
              del_yn: 'Y',
              mod_dt: mod_dt,
              mod_id: account_app_id
            })
            .where('review_app_img_id = :review_app_img_id', { review_app_img_id: review_app_img_ids })
            .execute();
          
        }
      }

      return {
        success: true,
        message: '리뷰가 성공적으로 업데이트되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error updating member review app:', error);
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

  async deleteMemberReviewApp(deleteData: {
    review_app_id: number;
    account_app_id: number;
  }): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { review_app_id, account_app_id } = deleteData;
      const mod_dt = getCurrentDateYYYYMMDDHHIISS();
      
      const result = await this.memberReviewAppRepository
        .createQueryBuilder()
        .update('member_review_app')
        .set({
          del_yn: 'Y',
          mod_dt: mod_dt,
          mod_id: account_app_id
        })
        .where('review_app_id = :review_app_id', { review_app_id })
        .execute();
      
      if (result.affected === 0) {
        return {
          success: false,
          message: '삭제할 리뷰를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }
      
      return {
        success: true,
        message: '리뷰가 성공적으로 삭제되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error deleting member review app:', error);
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

  // 리뷰 이미지 조회
  async getMemberReviewAppImgList(review_app_id?: number): Promise<{ success: boolean; data: any[] | null; code: string }> {
    try {
      const queryBuilder = this.memberReviewAppRepository
        .createQueryBuilder('mra')
        .select([
          'mra.review_app_id AS review_app_id',
          'mrai.review_app_img_id AS review_app_img_id',
          'mrai.file_id AS file_id',
          'mrai.order_seq AS order_seq',
          'cf.file_name AS file_name',
          'cf.file_path AS file_path',
          'cf.file_division AS file_division'
        ])
        .leftJoin('member_review_app_img', 'mrai', 'mra.review_app_id = mrai.review_app_id')
        .leftJoin('common_file', 'cf', 'mrai.file_id = cf.file_id')
        .where('mrai.del_yn = :del_yn', { del_yn: 'N' })
        .andWhere('mra.review_app_id = :review_app_id', { review_app_id })
        .orderBy('mrai.review_app_img_id', 'ASC');

      const memberReviewAppImgList = await queryBuilder.getRawMany();

      if (!memberReviewAppImgList || memberReviewAppImgList.length === 0) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: memberReviewAppImgList,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error fetching member review app images:', error);
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