import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberAccountApp } from '../entities/member-account-app.entity';
import { Member } from '../entities/member.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import * as bcrypt from 'bcrypt';
import { getCurrentDateYYYYMMDDHHIISS, getFutureDate } from '../core/utils/date.utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(MemberAccountApp)
    private memberAccountAppRepository: Repository<MemberAccountApp>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async validateUser(login_id: string, password: string): Promise<any> {
    try {
      const memberAccountApp = await this.memberAccountAppRepository
        .createQueryBuilder('maa')
        .select([
          'maa.account_app_id',
          'maa.mem_id',
          'maa.login_id',
          'maa.password',
          'maa.status',
          'maa.nickname',
          'm.mem_name',
          'm.center_id',
        ])
        .leftJoin(Member, 'm', 'maa.mem_id = m.mem_id')
        .where('maa.login_id = :login_id', { login_id })
        .andWhere('maa.del_yn = :del_yn', { del_yn: 'N' })
        .getOne();
        
      if (!memberAccountApp) {
        throw new HttpException({
          success: false,
          message: '존재하지 않는 아이디입니다.',
          code: 'LOGIN_ID_NOT_FOUND',
          field: 'login_id'
        }, HttpStatus.BAD_REQUEST);
      }

      // 비밀번호가 없는 경우
      if (!memberAccountApp.password) {
        throw new HttpException({
          success: false,
          message: '비밀번호가 설정되지 않았습니다. 비밀번호 설정이 필요합니다.',
          code: 'PASSWORD_NOT_SET',
          field: 'password'
        }, HttpStatus.BAD_REQUEST);
      }

      try {
        const isMatch = await bcrypt.compare(password, memberAccountApp.password);
        if (!isMatch) {
          throw new HttpException({
            success: false,
            message: '아이디 또는 비밀번호가 일치하지 않습니다.',
            code: 'INVALID_PASSWORD',
            field: 'password'
          }, HttpStatus.BAD_REQUEST);
        }
      } catch (bcryptError) {
        // bcrypt 비교 중 에러가 발생한 경우 (해시되지 않은 비밀번호일 수 있음)
        if (password !== memberAccountApp.password) {
          throw new HttpException({
            success: false,
            message: '비밀번호가 일치하지 않습니다.',
            code: 'INVALID_PASSWORD',
            field: 'password'
          }, HttpStatus.BAD_REQUEST);
        }
      }

      const { password: _hashedPassword, ...result } = memberAccountApp;
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({
        success: false,
        message: '로그인 처리 중 오류가 발생했습니다.',
        code: 'SERVER_ERROR'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(user: any) {
    try {
      const payload = { 
        account_app_id: user.account_app_id,
        mem_id: user.mem_id,
        login_id: user.login_id,
        status: user.status,
        nickname: user.nickname,
        mem_name: user.mem_name,
        center_id: user.center_id,
      };
      
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = await this.generateRefreshToken(user.account_app_id);

      return {
        success: true,
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          user: payload
        }
      };
    } catch (error) {
      throw new HttpException('로그인 처리 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async generateRefreshToken(account_app_id: number): Promise<string> {
    const refreshToken = this.jwtService.sign(
      { account_app_id },
      { expiresIn: '1y' }  // 리프레시 토큰 1년
    );

    const reg_dt = getCurrentDateYYYYMMDDHHIISS();
    
    // 만료 시간 계산 - 1년(365일) 설정
    // 5초 = 5초
    // 1시간 = 60 * 60 = 3600초
    // 1일 = 24 * 3600 = 86400초
    // 1년 = 365 * 86400 = 31536000초
    const expirationSeconds = 31536000; // 1년
    const expires_dt = getFutureDate(expirationSeconds);

    // 기존 리프레시 토큰을 del_yn = 'Y'로 업데이트
    await this.refreshTokenRepository.update(
      { account_app_id, del_yn: 'N' },
      { 
        del_yn: 'Y',
        mod_dt: reg_dt,
        mod_id: account_app_id
      }
    );

    // 새로운 리프레시 토큰 저장
    await this.refreshTokenRepository.save({
      account_app_id,
      token: refreshToken,
      expires_dt,
      del_yn: 'N',
      reg_dt,
      reg_id: account_app_id
    });

    return refreshToken;
  }

  async refreshAccessToken(refreshToken: string): Promise<{ success: boolean; data: { access_token: string } | null; code: string }> {
    try {
      const tokenData = await this.refreshTokenRepository.findOne({
        where: { token: refreshToken, del_yn: 'N' }
      });

      if (!tokenData) {
        return {
          success: false,
          data: null,
          code: 'INVALID_REFRESH_TOKEN'
        };
      }

      // YYYYMMDDHHIISS 형식의 날짜 비교
      const now = getCurrentDateYYYYMMDDHHIISS();
      const expires = tokenData.expires_dt;
      
      if (now > expires) {
        console.log('리프레시 토큰 만료됨', {
          current: now,
          expires: expires
        });
        return {
          success: false,
          data: null,
          code: 'EXPIRED_REFRESH_TOKEN'
        };
      }

      const memberAccountApp = await this.memberAccountAppRepository.findOne({
        where: { account_app_id: tokenData.account_app_id }
      });

      if (!memberAccountApp) {
        return {
          success: false,
          data: null,
          code: 'USER_NOT_FOUND'
        };
      }

      const payload = {
        account_app_id: memberAccountApp.account_app_id,
        mem_id: memberAccountApp.mem_id,
        login_id: memberAccountApp.login_id,
        status: memberAccountApp.status,
        nickname: memberAccountApp.nickname,
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        success: true,
        data: { access_token: accessToken },
        code: 'SUCCESS'
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      return {
        success: false,
        data: null,
        code: 'INTERNAL_SERVER_ERROR'
      };
    }
  }
}
