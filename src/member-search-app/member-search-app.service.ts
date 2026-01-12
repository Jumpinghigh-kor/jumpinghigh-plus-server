import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { COMMON_RESPONSE_CODES } from '../core/constants/response-codes';
import { getCurrentDateYYYYMMDDHHIISS } from '../core/utils/date.utils';
import { SearchProductDto, GetMemberSearchAppListDto, DeleteMemberSearchAppDto, InsertMemberSearchAppDto } from './dto/member-search-app.dto';

@Injectable()
export class MemberSearchAppService {
  constructor(
    private dataSource: DataSource
  ) {}

  async getSearchProduct(searchProductDto: SearchProductDto): Promise<{ success: boolean; data: any[] | null; code: string }> {
    try {
      const { keyword, account_app_id, search_type } = searchProductDto;
      
      // 검색어가 없으면 빈 배열 반환
      if (!keyword || keyword.trim() === '') {
        return {
          success: true,
          data: [],
          code: COMMON_RESPONSE_CODES.SUCCESS
        };
      }
      
      // 검색어를 공백으로 분리
      const keywords = keyword.split(' ').filter(word => word.trim() !== '');
      
      // 쿼리 빌더 초기화
      const queryBuilder = this.dataSource.manager
        .createQueryBuilder()
        .select([
          'product_app_id',
          'big_category',
          'small_category',
          'title',
          'FORMAT(price, 0) AS price',
          'FORMAT(original_price, 0) AS original_price',
          'discount',
          'give_point',
          'sell_start_dt',
          'sell_end_dt',
          `
            (
              SELECT
                ROUND(SUM(star_point) / COUNT(*), 1)
              FROM	member_review_app smra
              WHERE	smra.product_app_id = p.product_app_id
            ) AS review_average
          , (
   		        SELECT
			          COUNT(*)
              FROM	member_review_app smra
              WHERE	smra.product_app_id = p.product_app_id
            ) AS review_cnt
          `
        ])
        .from('product_app', 'p')
        .where('p.del_yn = :del_yn', { del_yn: 'N' })
        .andWhere('p.view_yn = :view_yn', { view_yn: 'Y' });
      
      // 검색어가 하나 이상이면
      if (keywords.length > 0) {
        // 각 단어에 대해 OR 조건으로 검색 (대소문자 구분 없이)
        const conditions = keywords.map((word, index) => `LOWER(COALESCE(p.title, '')) LIKE LOWER(:keyword${index})`);
        const params = {};
        
        keywords.forEach((word, index) => {
          params[`keyword${index}`] = `%${word}%`;
        });
        
        queryBuilder.andWhere(`(${conditions.join(' OR ')})`, params);
      }
      
      // 회원 ID가 있으면 찜 정보도 조회
      if (account_app_id) {
        queryBuilder.addSelect(`(
            SELECT
              zzim_yn
            FROM  member_zzim_app
            WHERE product_app_id = p.product_app_id
            AND   account_app_id = :account_app_id
            AND   zzim_yn = 'Y'
          ) AS zzim_yn`
        )
        .setParameter('account_app_id', account_app_id);
      }

      // 정렬 조건 추가
      if(search_type === 'high_star') {
        queryBuilder.orderBy('review_average', 'DESC');
        queryBuilder.addOrderBy('review_cnt', 'DESC');
      }

      if(search_type === 'low_star') {
        queryBuilder.orderBy('review_average', 'ASC');
        queryBuilder.addOrderBy('review_cnt', 'ASC');
      }

      if(search_type === 'high_price') {
        queryBuilder.orderBy('price', 'DESC');
        queryBuilder.addOrderBy('review_cnt', 'DESC');
      }

      if(search_type === 'low_price') {
        queryBuilder.orderBy('price', 'ASC');
        queryBuilder.addOrderBy('review_cnt', 'ASC');
      }

      if(search_type === 'new') {
        queryBuilder.orderBy('product_app_id', 'DESC');
      }
      
      
      let products = [];
      try {
        products = await queryBuilder.getRawMany();
      } catch (queryError) {
        console.error('Query error:', queryError);
        products = [];
      }

      // 검색 결과가 없으면 빈 배열 반환
      if (!products || products.length === 0) {
        return {
          success: true,
          data: [],
          code: COMMON_RESPONSE_CODES.SUCCESS
        };
      }

      return {
        success: true,
        data: products,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error searching products:', error);
      return {
        success: false,
        data: null,
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }

  async getMemberSearchAppList(getMemberSearchAppListDto: GetMemberSearchAppListDto): Promise<{ success: boolean; data: any[] | null; code: string }> {
    try {
      const { account_app_id } = getMemberSearchAppListDto;
      
      const searchList = await this.dataSource.manager
        .createQueryBuilder()
        .select([
          'search_app_id',
          'account_app_id',
          'keyword',
          'del_yn',
          'reg_dt',
          'reg_id'
        ])
        .from('member_search_app', 'msa')
        .where('msa.del_yn = :del_yn', { del_yn: 'N' })
        .andWhere('msa.account_app_id = :account_app_id', { account_app_id })
        .orderBy('msa.search_app_id', 'DESC')
        .limit(5)
        .getRawMany();

      if (!searchList || searchList.length === 0) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: searchList,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error fetching search history:', error);
      return {
        success: false,
        data: null,
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }

  async deleteMemberSearchApp(deleteMemberSearchAppDto: DeleteMemberSearchAppDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { search_app_id, account_app_id } = deleteMemberSearchAppDto;
      
      // 현재 시간 (YYYYMMDDHHIISS 형식)
      const mod_dt = getCurrentDateYYYYMMDDHHIISS();
      
      // TypeORM QueryBuilder 사용하여 데이터 업데이트
      const result = await this.dataSource.manager
        .createQueryBuilder()
        .update('member_search_app')
        .set({
          del_yn: 'Y',
          mod_dt: mod_dt,
          mod_id: account_app_id
        })
        .where('search_app_id = :search_app_id', { search_app_id })
        .execute();
      
      if (result.affected === 0) {
        return {
          success: false,
          message: '삭제할 검색 기록을 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }
      
      return {
        success: true,
        message: '검색 기록이 성공적으로 삭제되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error deleting search history:', error);
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

  async insertMemberSearchApp(insertMemberSearchAppDto: InsertMemberSearchAppDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { keyword, account_app_id } = insertMemberSearchAppDto;
      
      // 현재 시간 (YYYYMMDDHHIISS 형식)
      const reg_dt = getCurrentDateYYYYMMDDHHIISS();
      const mod_dt = getCurrentDateYYYYMMDDHHIISS();
      
      // 동일한 키워드가 있는지 확인
      const existingSearch = await this.dataSource.manager
        .createQueryBuilder()
        .select('search_app_id')
        .from('member_search_app', 'msa')
        .where('msa.keyword = :keyword', { keyword })
        .andWhere('msa.account_app_id = :account_app_id', { account_app_id })
        .andWhere('msa.del_yn = :del_yn', { del_yn: 'N' })
        .getRawOne();
        
      if (existingSearch) {
        await this.dataSource.manager
          .createQueryBuilder()
          .update('member_search_app')
          .set({
            mod_dt: mod_dt,
            mod_id: account_app_id
          })
          .where('search_app_id = :search_app_id', { search_app_id: existingSearch.search_app_id })
          .execute();
      } else {
        await this.dataSource.manager
          .createQueryBuilder()
          .insert()
          .into('member_search_app')
          .values({
            account_app_id: account_app_id,
            keyword: keyword,
            del_yn: 'N',
            reg_dt: reg_dt,
            reg_id: account_app_id,
            mod_dt: null,
            mod_id: null
          })
          .execute();
      }
      
      return {
        success: true,
        message: '검색 기록이 성공적으로 등록되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error inserting search history:', error);
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