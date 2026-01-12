import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET') || 'default_secret_key_change_in_production';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.account_app_id) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      mem_id: payload.mem_id,
      account_app_id: payload.account_app_id,
      login_id: payload.login_id,
      mem_name: payload.mem_name,
      center_id: payload.center_id,
      status: payload.status
    };
  }
} 