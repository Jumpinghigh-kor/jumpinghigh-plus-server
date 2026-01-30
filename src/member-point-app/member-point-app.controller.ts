import { Controller, Get, Query, Post, Body, UseGuards } from '@nestjs/common';
import { MemberPointAppService } from './member-point-app.service';
import { GetMemberPointAppListDto, GetMemberPointAppTargetCntDto, InsertMemberPointAppDto } from './dto/member-point-app.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('member-point-app')
@UseGuards(JwtAuthGuard)
export class MemberPointAppController {
  constructor(
    private readonly memberPointAppService: MemberPointAppService,
  ) {}

  @Post('/getMemberPointAppList')
  getMemberPointAppList(@Body() getMemberPointAppListDto: GetMemberPointAppListDto) {
    return this.memberPointAppService.getMemberPointAppList(getMemberPointAppListDto.account_app_id, getMemberPointAppListDto.reg_ym);
  }

  @Post('/getMemberPointAppTargetCnt')
  getMemberPointAppTargetCnt(@Body() getMemberPointAppTargetCntDto: GetMemberPointAppTargetCntDto) {
    return this.memberPointAppService.getMemberPointAppTargetCnt(getMemberPointAppTargetCntDto.order_detail_app_id);
  }

  @Post('/insertMemberPointApp')
  insertMemberPointApp(@Body() payload: any) {
    try {
      return this.memberPointAppService.insertMemberPointApp(payload as any);
    } catch (error) {
      throw error;
    }
  }
} 