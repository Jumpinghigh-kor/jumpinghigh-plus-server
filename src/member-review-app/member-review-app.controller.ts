import { Controller, UseGuards, Post, Body, Request } from '@nestjs/common';
import { MemberReviewAppService } from './member-review-app.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetMemberReviewAppListDto, UpdateMemberReviewAppDto, DeleteMemberReviewAppDto, ReviewImageDto, GetMemberReviewAppImgDto } from './dto/member-review-app.dto';

@Controller('member-review-app')
@UseGuards(JwtAuthGuard)
export class MemberReviewAppController {
  constructor(private readonly memberReviewAppService: MemberReviewAppService) {}

  @Post('getMemberReviewAppList')
  async getMemberReviewAppList(
    @Body() getMemberReviewAppListDto: GetMemberReviewAppListDto
  ): Promise<{ success: boolean; data: any[] | null; code: string }> {
    return this.memberReviewAppService.getMemberReviewAppList(getMemberReviewAppListDto);
  }

  @Post('getCompleteMemberReviewAppList')
  async getCompleteMemberReviewAppList(
    @Body('account_app_id') account_app_id: string
  ): Promise<{ success: boolean; data: any[] | null; code: string }> {
    return this.memberReviewAppService.getCompleteMemberReviewAppList(account_app_id);
  }

  @Post('insertMemberReviewApp')
  async insertMemberReviewApp(
    @Request() req: any,
    @Body() reviewData: {
      order_app_id: number;
      product_app_id: number;
      title: string;
      content: string;
      star_point: number;
      account_app_id?: number;
      reg_id?: number;
      images?: ReviewImageDto[];
      file_ids?: number[];
      order_seq?: number;
    }
  ): Promise<{ success: boolean; data: any | null; code: string }> {
    const account_app_id =
      reviewData?.reg_id ??
      req?.user?.account_app_id ??
      req?.user?.login_id;

    return this.memberReviewAppService.insertMemberReviewApp({
      account_app_id,
      order_app_id: reviewData.order_app_id,
      product_app_id: reviewData.product_app_id,
      title: reviewData.title,
      content: reviewData.content,
      star_point: reviewData.star_point,
      file_ids: reviewData.file_ids,
      order_seq: reviewData.order_seq,
    });
  }

  @Post('updateMemberReviewApp')
  async updateMemberReviewApp(
    @Body() payload: any
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberReviewAppService.updateMemberReviewApp(payload as any);
  }

  @Post('deleteMemberReviewApp')
  async deleteMemberReviewApp(
    @Body() deleteMemberReviewAppDto: DeleteMemberReviewAppDto
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberReviewAppService.deleteMemberReviewApp(deleteMemberReviewAppDto);
  }

  @Post('getMemberReviewAppImgList')
  async getMemberReviewAppImgList(
    @Body() getMemberReviewAppImgDto: GetMemberReviewAppImgDto
  ): Promise<{ success: boolean; data: any[] | null; code: string }> {
    return this.memberReviewAppService.getMemberReviewAppImgList(getMemberReviewAppImgDto.review_app_id);
  }
}