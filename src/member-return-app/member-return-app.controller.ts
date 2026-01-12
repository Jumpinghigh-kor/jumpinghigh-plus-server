import { Controller, Post, Body } from '@nestjs/common';
import { MemberReturnAppService } from './member-return-app.service';
import { GetMemberReturnAppDto, InsertMemberReturnAppDto, UpdateMemberReturnAppDto, UpdateMemberReturnAppOrderAddressIdDto, UpdateMemberReturnAppCancelYnDto, GetMemberReturnAppDetailDto, UpdateMemberReturnAppApprovalYnDto } from './dto/member-return-app.dto';

@Controller('member-return-app')
export class MemberReturnAppController {
  constructor(
    private readonly memberReturnAppService: MemberReturnAppService,
  ) {}

  @Post('/getMemberReturnAppList')
  getMemberReturnAppList(@Body() getMemberReturnAppDto: GetMemberReturnAppDto) {
    return this.memberReturnAppService.getMemberReturnAppList(getMemberReturnAppDto.account_app_id, getMemberReturnAppDto.order_detail_app_id, getMemberReturnAppDto.type, getMemberReturnAppDto.search_content, getMemberReturnAppDto.year);
  }

  @Post('/getMemberReturnAppDetail')
  getMemberReturnAppDetail(@Body() getMemberReturnAppDetailDto: GetMemberReturnAppDetailDto) {
    return this.memberReturnAppService.getMemberReturnAppDetail(getMemberReturnAppDetailDto);
  }

  @Post('/insertMemberReturnApp')
  async insertMemberReturnApp(
    @Body() insertMemberReturnAppDto: InsertMemberReturnAppDto | InsertMemberReturnAppDto[]
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberReturnAppService.insertMemberReturnApp(insertMemberReturnAppDto as InsertMemberReturnAppDto[]);
  }

  @Post('/updateMemberReturnApp')
  async updateMemberReturnApp(
    @Body() updateMemberReturnAppDto: UpdateMemberReturnAppDto
  ): Promise<{ success: boolean; data: any | null; code: string }> {
    return this.memberReturnAppService.updateMemberReturnApp({
      account_app_id: updateMemberReturnAppDto.account_app_id,
      order_detail_app_ids: updateMemberReturnAppDto.order_detail_app_ids,
      return_reason_type: updateMemberReturnAppDto.return_reason_type,
      reason: updateMemberReturnAppDto.reason,
      quantity: updateMemberReturnAppDto.quantity,
      cancel_yn: updateMemberReturnAppDto.cancel_yn
    });
  }

  @Post('/updateMemberReturnAppOrderAddressId')
  async updateMemberReturnAppOrderAddressId(
    @Body() updateMemberReturnAppOrderAddressIdDto: UpdateMemberReturnAppOrderAddressIdDto
  ): Promise<{ success: boolean; data: any | null; code: string }> {
    return this.memberReturnAppService.updateMemberReturnAppOrderAddressId(updateMemberReturnAppOrderAddressIdDto);
  }

  @Post('/updateMemberReturnAppCancelYn')
  async updateMemberReturnAppCancelYn(
    @Body() updateMemberReturnAppCancelYnDto: UpdateMemberReturnAppCancelYnDto
  ): Promise<{ success: boolean; data: any | null; code: string }> {
    return this.memberReturnAppService.updateMemberReturnAppCancelYn(updateMemberReturnAppCancelYnDto);
  }

  @Post('/updateMemberReturnAppApprovalYn')
  async updateMemberReturnAppApprovalYn(
    @Body() payload: {
      account_app_id: string;
      order_detail_app_ids: number[];
      approval_yn: string;
    }
  ): Promise<{ success: boolean; data: any | null; code: string }> {
    return this.memberReturnAppService.updateMemberReturnAppApprovalYn({
      account_app_id: payload.account_app_id,
      order_detail_app_ids: payload.order_detail_app_ids,
      approval_yn: payload.approval_yn
    });
  }
} 