import { Controller, UseGuards, Post, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCenterScheduleAppDto, InsertMemberScheduleAppDto, GetMemberScheduleAppDto, DeleteMemberScheduleAppDto, UpdateMemberScheduleAppDto } from './dto/member-schedule-app.dto';
import { MemberScheduleAppService } from './member-schedule-app.service';

@UseGuards(JwtAuthGuard)
@Controller('member-schedule-app')
export class MemberScheduleAppController {
  constructor(private readonly memberScheduleAppService: MemberScheduleAppService) {}

  @Post('getCenterScheduleList')
  getCenterScheduleList(@Body() getCenterScheduleDto: GetCenterScheduleAppDto) {
    return this.memberScheduleAppService.getCenterScheduleList(getCenterScheduleDto.center_id, getCenterScheduleDto.mem_id, getCenterScheduleDto.sch_dt);
  }

  @Post('getMemberScheduleAppList')
  getMemberScheduleAppList(@Body() getMemberScheduleAppDto: GetMemberScheduleAppDto) {
    return this.memberScheduleAppService.getMemberScheduleAppList(getMemberScheduleAppDto.account_app_id);
  }

  @Post('insertMemberScheduleApp')
  insertMemberScheduleApp(@Body() insertMemberScheduleAppDto: InsertMemberScheduleAppDto) {
    return this.memberScheduleAppService.insertMemberScheduleApp(insertMemberScheduleAppDto);
  }

  @Post('deleteMemberScheduleApp')
  deleteMemberScheduleApp(@Body() deleteMemberScheduleAppDto: DeleteMemberScheduleAppDto) {
    return this.memberScheduleAppService.deleteMemberScheduleApp(deleteMemberScheduleAppDto);
  }

  @Post('updateMemberScheduleApp')
  updateMemberScheduleApp(@Body() updateMemberScheduleAppDto: UpdateMemberScheduleAppDto) {
    return this.memberScheduleAppService.updateMemberScheduleApp(updateMemberScheduleAppDto);
  }
} 