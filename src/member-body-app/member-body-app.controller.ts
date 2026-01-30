import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MemberBodyAppService } from './member-body-app.service';
import {
  GetMemberBodyAppDto,
  InsertMemberBodyAppDto,
  UpdateMemberBodyAppDto,
} from './dto/member-body-app.dto';

@Controller('member-body-app')
@UseGuards(JwtAuthGuard)
export class MemberBodyAppController {
  constructor(private readonly memberBodyAppService: MemberBodyAppService) {}

  @Post('getMemberBodyApp')
  async getMemberBodyApp(@Body() dto: GetMemberBodyAppDto) {
    return this.memberBodyAppService.getMemberBodyApp(dto);
  }

  @Post('insertMemberBodyApp')
  async insertMemberBodyApp(@Body() dto: InsertMemberBodyAppDto) {
    return this.memberBodyAppService.insertMemberBodyApp(dto);
  }

  @Post('updateMemberBodyApp')
  async updateMemberBodyApp(@Body() dto: UpdateMemberBodyAppDto) {
    return this.memberBodyAppService.updateMemberBodyApp(dto);
  }
}


