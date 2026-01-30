import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Member } from '../entities/member.entity';
import { GetMemberInfoDto, MemberInfoResponse, UpdateMemberAppPasswordDto, FindPasswordDto } from './dto/member.dto';
import { COMMON_RESPONSE_CODES, WITHDRAWAL_RESPONSE_CODES } from '../core/constants/response-codes';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    private dataSource: DataSource
  ) {}

  async getMemberInfo(getMemberInfoDto: GetMemberInfoDto): Promise<{ success: boolean; data: MemberInfoResponse | null; code: string }> {
    try {
      const { account_app_id } = getMemberInfoDto;
      
      // Using the provided SQL query
      const memberInfo = await this.memberRepository
        .createQueryBuilder('m')
        .select([
          'm.mem_id AS mem_id'
          , 'm.mem_name AS mem_name'
          , 'm.mem_phone AS mem_phone'
          , 'm.mem_birth AS mem_birth'
          , 'm.mem_gender AS mem_gender'
          , 'm.mem_checkin_number AS mem_checkin_number'
          , 'm.mem_manager AS mem_manager'
          , 'm.mem_sch_id AS mem_sch_id'
          , 'm.center_id AS center_id'
          , 'maa.account_app_id AS account_app_id'
          , 'maa.login_id AS login_id'
          , 'maa.nickname AS nickname'
          , 'maa.status AS status'
          , 'maa.mem_role AS mem_role'
          , 'maa.push_yn AS push_yn'
          , 'maa.push_token AS push_token'
          , `
              (
                SELECT
                  sc.center_name
                FROM  centers sc
                WHERE sc.center_id = m.center_id
            ) AS center_name`
          , `
              (
                SELECT
                  ss.sch_time
                FROM  schedule ss
                WHERE ss.sch_id = m.mem_sch_id
              ) AS sch_time
            `
          , `
              (
                SELECT
                  FORMAT(SUM(
                      CASE
                        WHEN  point_status = 'POINT_ADD' THEN point_amount
                        WHEN  point_status = 'POINT_MINUS' THEN -point_amount
                        ELSE 0
                      END
                  ), 0)
                FROM      member_point_app smpa
                WHERE     smpa.account_app_id = maa.account_app_id
                AND       smpa.del_yn = 'N'
              ) AS total_point
            `
          , `
              (
                SELECT
                  COUNT(*)
                FROM      member_coupon_app smca
                LEFT JOIN coupon_app sca ON smca.coupon_app_id = sca.coupon_app_id
                WHERE     sca.del_yn = 'N'
                AND       smca.use_yn = 'N'
                AND       smca.account_app_id = maa.account_app_id
                AND       DATE_FORMAT(NOW(), '%Y%m%d%H%i%s') <= sca.end_dt
              ) AS coupon_cnt
            `
          , `
              (
                SELECT
                  COUNT(*)
                FROM      member_cart_app smca
                WHERE     smca.account_app_id = maa.account_app_id
                AND       smca.del_yn = 'N'
              ) AS cart_cnt
            `
          , `
              (
                SELECT
                  smba.height AS height
                FROM      member_body_app smba
                WHERE     smba.account_app_id = maa.account_app_id
                AND       smba.del_yn = 'N'
              ) AS height
            `
          , `
              (
                SELECT
                  smba.birthday AS birthday
                FROM      member_body_app smba
                WHERE     smba.account_app_id = maa.account_app_id
                AND       smba.del_yn = 'N'
              ) AS birthday
            `
          , `
              (
                SELECT
                  smba.weight AS weight
                FROM      member_body_app smba
                WHERE     smba.account_app_id = maa.account_app_id
                AND       smba.del_yn = 'N'
              ) AS weight
            `
        ])
        .leftJoin('member_account_app', 'maa', 'm.mem_id = maa.mem_id')
        .where('maa.account_app_id = :account_app_id', { account_app_id })
        .getRawOne();

      if (!memberInfo) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: memberInfo,
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

  async updateMemberAppPassword(updateMemberAppPasswordDto: UpdateMemberAppPasswordDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { account_app_id, current_password, password } = updateMemberAppPasswordDto;
      
      // 현재 비밀번호 확인을 위해 사용자 정보 조회
      const member = await this.dataSource
        .createQueryBuilder()
        .select(['account_app_id', 'password'])
        .from('member_account_app', 'maa')
        .where('account_app_id = :account_app_id', { account_app_id })
        .getRawOne();
      
      if (!member) {
        return {
          success: false,
          message: '회원 정보를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }
      
      // 현재 비밀번호 검증
      const isPasswordValid = await bcrypt.compare(current_password, member.password);
      
      if (!isPasswordValid) {
        return {
          success: false,
          message: '현재 비밀번호가 일치하지 않습니다.',
          code: COMMON_RESPONSE_CODES.FAIL
        };
      }
      
      // 새 비밀번호 암호화
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Using QueryBuilder for the update
      const result = await this.dataSource
        .createQueryBuilder()
        .update('member_account_app')
        .set({
          password: hashedPassword,
          mod_dt: () => "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')",
          mod_id: account_app_id
        })
        .where("account_app_id = :account_app_id", { account_app_id })
        .execute();
      
      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 회원을 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        message: '비밀번호가 성공적으로 업데이트되었습니다.',
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

  async checkNicknameDuplicate(nickname: string, account_app_id?: number): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const qb = this.dataSource
        .createQueryBuilder()
        .select('account_app_id')
        .from('member_account_app', 'maa')
        .where('maa.nickname = :nickname', { nickname })

      // 닉네임 변경 시 본인 계정은 중복 검사에서 제외
      if (account_app_id) {
        qb.andWhere('maa.account_app_id != :account_app_id', { account_app_id });
      }

      const existingMember = await qb.getRawOne();

      if (existingMember) {
        return {
          success: false,
          message: '이미 사용 중인 닉네임입니다.',
          code: COMMON_RESPONSE_CODES.DUPLICATE
        };
      }

      return {
        success: true,
        message: '사용 가능한 닉네임입니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error checking nickname:', error);
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

  async completeSignup(data: { account_app_id: number, nickname: string }): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { account_app_id, nickname } = data;
      
      // Update member record
      const result = await this.memberRepository
        .createQueryBuilder()
        .update('member_account_app')
        .set({
          nickname,
          status: 'ACTIVE',
          active_dt: () => "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')",
          mod_dt: () => "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')",
          mod_id: account_app_id
        })
        .where("account_app_id = :account_app_id", { account_app_id })
        .execute();
        
      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 회원을 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        message: '회원 가입이 완료되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error completing signup:', error);
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

  async findId(mem_name: string, mem_phone: string): Promise<{ success: boolean; message: string; code: string; data: any}> {
    try {
      const existingMember = await this.memberRepository
        .createQueryBuilder()
        .select(['maa.login_id', 'DATE_FORMAT(maa.reg_dt, "%Y.%m.%d") AS reg_dt'])
        .leftJoin('member_account_app', 'maa', 'm.mem_id = maa.mem_id')
        .where('mem_name = :mem_name', { mem_name })
        .andWhere('mem_phone = :mem_phone', { mem_phone })
        .getRawOne();

      if (!existingMember) {
        return {
          success: false,
          message: '일치하는 회원 정보를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA,
          data: null
        };
      }

      return {
        success: true,
        message: '일치하는 회원 정보를 찾았습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS,
        data: existingMember
      };
    } catch (error) {
      console.error('Error finding id:', error);
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

  async findPassword(findPasswordDto: FindPasswordDto): Promise<{ success: boolean; message: string; code: string; data?: { account_app_id: number, temporary_password?: string } }> {
    try {
      const {  login_id, mem_name, mem_phone } = findPasswordDto;
      
      const member = await this.memberRepository
        .createQueryBuilder()
        .select('account_app_id')
        .leftJoin('member_account_app', 'maa', 'm.mem_id = maa.mem_id')
        .where('mem_name = :mem_name', { mem_name })
        .andWhere('mem_phone = :mem_phone', { mem_phone })
        .andWhere('maa.login_id = :login_id', { login_id })
        .getRawOne();

      if (!member) {
        return {
          success: false,
          message: '일치하는 회원 정보를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      // Generate temporary random password (8 characters: 1 upper, 5 lower, 1 special, 1 digit)
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const digits = '0123456789';
      const specials = '!@#$%^&*';
      const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)];
      const chars = [
        pick(uppercase),
        ...Array.from({ length: 5 }, () => pick(lowercase)),
        pick(specials),
        pick(digits),
      ];
      // shuffle to avoid fixed positions
      for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
      }
      const tempPassword = chars.join('');
      
      // Hash the temporary password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(tempPassword, salt);
      
      // Update member's password with the temporary one
      const result = await this.memberRepository
        .createQueryBuilder()
        .update('member_account_app')
        .set({
          password: hashedPassword,
          mod_dt: () => "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')",
          mod_id: member.account_app_id
        })
        .where("account_app_id = :account_app_id", { account_app_id: member.account_app_id })
        .execute();
      
      if (result.affected === 0) {
        return {
          success: false,
          message: '비밀번호 재설정에 실패했습니다.',
          code: COMMON_RESPONSE_CODES.FAIL
        };
      }

      // In a real application, you would send this password to the user via email or SMS
      // For this example, we'll just return it in the response
      return {
        success: true,
        message: '임시 비밀번호가 생성되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS,
        data: {
          account_app_id: member.account_app_id,
          temporary_password: tempPassword
        }
      };
    } catch (error) {
      console.error('Error finding password:', error);
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

  async updateMemberWithdrawal(account_app_id: number): Promise<{ success: boolean; message: string; code: string }> {
    try {

      const orderCount = await this.dataSource
        .createQueryBuilder()
        .select('COUNT(*) AS order_count')
        .from('member_order_app', 'moa')
        .leftJoin('member_order_detail_app', 'moda', 'moa.order_app_id = moda.order_app_id')
        .where('moa.account_app_id = :account_app_id', { account_app_id })
        .andWhere('moda.order_status NOT IN ("PURCHASE_CONFIRM", "RETURN_COMPLETE", "EXCHANGE_COMPLETE","CANCEL_COMPLETE")')
        .getRawOne();

      if (orderCount?.order_count > 0) {
        return {
          success: false,
          message: '처리 중인 주문이 있어 탈퇴할 수 없습니다.',
          code: WITHDRAWAL_RESPONSE_CODES.ORDER_PROCESSING
        };
      }

      const reservation = await this.memberRepository
        .createQueryBuilder()
        .select('COUNT(*) AS reservation_count')
        .from('schedule', 's')
        .innerJoin('member_schedule_app', 'msa', 's.sch_id = msa.reservation_sch_id')
        .where('msa.account_app_id = :account_app_id', { account_app_id })
        .andWhere('msa.agree_yn = "Y"')
        .andWhere('msa.del_yn = "N"')
        .andWhere('DATE_FORMAT(NOW(), "%Y%m%d%H%i%s") <=  CONCAT(sch_dt, DATE_FORMAT(STR_TO_DATE(sch_time, "%h:%i %p"), "%H%i"), "00")')
        .getRawOne();

      if (reservation?.reservation_count > 0) {
        return {
          success: false,
          message: '처리 중인 예약이 있어 탈퇴할 수 없습니다.',
          code: WITHDRAWAL_RESPONSE_CODES.RESERVATION_PROCESSING
        };
      }

      const result = await this.memberRepository
        .createQueryBuilder()
        .update('member_account_app')
        .set({
          status: 'EXIT',
          del_yn: 'Y',
          exit_dt: () => "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')",
          mod_dt: () => "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')",
          mod_id: account_app_id
        })
        .where("account_app_id = :account_app_id", { account_app_id })
        .execute();
      
      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 회원을 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        message: '회원 탈퇴가 완료되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error updating member status:', error);
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

  async updatePushToken(account_app_id: number, push_token: string): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const result = await this.memberRepository
        .createQueryBuilder()
        .update('member_account_app')
        .set({
          push_token: push_token,
          mod_dt: () => "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')",
          mod_id: account_app_id
        })
        .where("account_app_id = :account_app_id", { account_app_id })
        .execute();
      
      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 회원을 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        message: 'Push token이 성공적으로 업데이트되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error updating push token:', error);
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

  async updatePushYn(account_app_id: number, push_yn: string): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const result = await this.dataSource
        .createQueryBuilder()
        .update('member_account_app')
        .set({
          push_yn,
          mod_dt: () => "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')",
          mod_id: account_app_id
        })
        .where("account_app_id = :account_app_id", { account_app_id })
        .execute();
      
      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 회원을 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        message: 'Push 수신 여부가 성공적으로 업데이트되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error updating push yn:', error);
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

  async updateRecentDt(account_app_id: number): Promise<{ success: boolean; message: string; code: string }> {
    try {

      const result = await this.dataSource
        .createQueryBuilder()
        .update('member_account_app')
        .set({
          recent_dt: () => "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')",
          mod_dt: () => "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')",
          mod_id: account_app_id
        })
        .where("account_app_id = :account_app_id", { account_app_id })
        .execute();

      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 회원을 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        message: '최근 접속일이 성공적으로 업데이트되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error updating recent date:', error);
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

  async updateChangeNickname(account_app_id: number, nickname: string): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const result = await this.dataSource
        .createQueryBuilder()
        .update('member_account_app')
        .set({
          nickname: nickname,
          recent_dt: () => "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')",
          mod_dt: () => "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')",
          mod_id: account_app_id
        })
        .where("account_app_id = :account_app_id", { account_app_id })
        .execute();

      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 회원을 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        message: '닉네임이 성공적으로 업데이트되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error updating nickname:', error);
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