import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MemberService } from './member.service';
import { GetMemberInfoDto, MemberInfoResponse, UpdateMemberAppPasswordDto, UpdatePushTokenDto, UpdatePushYnDto } from './dto/member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('members')
@UseGuards(JwtAuthGuard)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post('getMemberInfo')
  async getMemberInfo(
    @Body() getMemberInfoDto: GetMemberInfoDto
  ): Promise<{ success: boolean; data: MemberInfoResponse | null; code: string }> {
    return this.memberService.getMemberInfo(getMemberInfoDto);
  }

  @Post('updateMemberAppPassword')
  async updateMemberAppPassword(
    @Body() updateMemberAppPasswordDto: UpdateMemberAppPasswordDto
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberService.updateMemberAppPassword(updateMemberAppPasswordDto);
  }

  @Post('checkNicknameDuplicate')
  async checkNicknameDuplicate(
    @Body() body: { nickname: string; account_app_id?: number }
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberService.checkNicknameDuplicate(body.nickname, body.account_app_id);
  }

  @Post('completeSignup')
  async completeSignup(
    @Body() body: { account_app_id: number, nickname: string }
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberService.completeSignup(body);
  }

  @Post('updateMemberWithdrawal')
  async updateMemberWithdrawal(
    @Body() body: { account_app_id: number }
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberService.updateMemberWithdrawal(body.account_app_id);
  }

  @Post('updatePushToken')
  async updatePushToken(
    @Body() updatePushTokenDto: UpdatePushTokenDto
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberService.updatePushToken(updatePushTokenDto.account_app_id, updatePushTokenDto.push_token);
  }

  @Post('updatePushYn')
  async updatePushYn(
    @Body() updatePushYnDto: UpdatePushYnDto
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberService.updatePushYn(updatePushYnDto.account_app_id, updatePushYnDto.push_yn);
  }

  @Post('updateRecentDt')
  async updateRecentDt(
    @Body() body: { account_app_id: number }
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberService.updateRecentDt(body.account_app_id);
  }

  @Public()
  @Post('findId')
  async findId(
    @Body() body: { mem_name: string, mem_phone: string }
  ): Promise<{ success: boolean; message: string; code: string; data: any }> {
    return this.memberService.findId(body.mem_name, body.mem_phone);
  }

  @Public()
  @Post('findPassword')
  async findPassword(
    @Body() body: { login_id: string, mem_name: string, mem_phone: string }
  ): Promise<{ success: boolean; message: string; code: string; data?: { account_app_id: number, temporary_password?: string } }> {
    return this.memberService.findPassword(body);
  }

  @Public()
  @Post('updateChangeNickname')
  async updateChangeNickname(
    @Body() body: { account_app_id: number, nickname: string }
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberService.updateChangeNickname(body.account_app_id, body.nickname);
  }
} 