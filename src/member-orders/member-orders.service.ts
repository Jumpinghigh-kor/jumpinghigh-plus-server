import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../entities/member.entity';
import { GetMemberOrdersDto, MemberOrderResponse, UpdateMemberOrdersRemainingCntDto } from './dto/member-orders.dto';
import { COMMON_RESPONSE_CODES } from '../core/constants/response-codes';

@Injectable()
export class MemberOrdersService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  async getMemberOrdersList(getMemberOrdersDto: GetMemberOrdersDto): Promise<{ success: boolean; data: MemberOrderResponse[]; code: string }> {
    try {
      const { mem_id } = getMemberOrdersDto;
      const orders = await this.memberRepository
        .createQueryBuilder('m')
        .select([
          'mo.memo_id',
          'mo.memo_pro_name',
          'mo.memo_pro_price',
          'mo.memo_remaining_counts',
          'mo.memo_start_date',
          'mo.memo_end_date',
          'mo.memo_purchase_date',
          'mo.center_id',
          'p.pro_type'
        ])
        .leftJoin('member_orders', 'mo', 'm.mem_id = mo.memo_mem_id')
        .leftJoin('products', 'p', 'mo.memo_pro_id = p.pro_id')
        .where('m.mem_status = 1')
        .andWhere('mo.memo_status = 1')
        .andWhere('m.mem_id = :mem_id', { mem_id })
        .andWhere("DATE_FORMAT(mo.memo_start_date, '%Y%m%d%H%i%s') <= DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')")
        .andWhere("DATE_FORMAT(NOW(), '%Y%m%d%H%i%s') <= DATE_FORMAT(mo.memo_end_date, '%Y%m%d%H%i%s')")
        .andWhere('(p.pro_type != :type OR (p.pro_type = :type AND mo.memo_remaining_counts > 0))', { type: '회차권' })
        .getRawMany();
      return {
        success: true,
        data: orders,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }

  async updateMemberOrdersRemainingCnt(UpdateMemberOrdersRemainingCntDto: UpdateMemberOrdersRemainingCntDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { memo_id } = UpdateMemberOrdersRemainingCntDto;

      const result = await this.memberRepository
        .createQueryBuilder()
        .update('member_orders')
        .set({
          memo_remaining_counts: () => 'memo_remaining_counts - 1'
        })
        .where('memo_id = :memo_id', { memo_id })
        .execute();

      if (result.affected === 0) {
        return {
          success: false,
          message: '회원권 정보를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.FAIL
        };
      }

      return {
        success: true,
        message: '회원권 잔여 횟수가 업데이트되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      return {
        success: false,
        message: '회원권 잔여 횟수 업데이트 중 오류가 발생했습니다.',
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }
} 