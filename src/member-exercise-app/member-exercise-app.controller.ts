import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MemberExerciseAppService } from './member-exercise-app.service';
import { InsertMemberExerciseAppDto, UpdateMemberExerciseAppDto, GetMemberExerciseAppListDto, MemberExerciseAppListResponse, GetExerciseJumpingDetailDto, GetExerciseOtherDetailDto, ExerciseJumpingDetailResponse, ExerciseOtherDetailResponse, DeleteMemberExerciseAppDto, DeleteExerciseJumpingDto, DeleteExerciseOtherDto } from './dto/member-exercise-app.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('member-exercise-app')
@UseGuards(JwtAuthGuard)
export class MemberExerciseAppController {
  constructor(private readonly memberExerciseAppService: MemberExerciseAppService) {}

  @Post('insertMemberExerciseApp')
  async insertMemberExerciseApp(
    @Body() insertMemberExerciseAppDto: InsertMemberExerciseAppDto
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberExerciseAppService.insertMemberExerciseApp(insertMemberExerciseAppDto);
  }

  @Post('updateMemberExerciseApp')
  async updateMemberExerciseApp(
    @Body() payload: any
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberExerciseAppService.updateMemberExerciseApp(payload as any);
  }

  @Post('getMemberExerciseAppList')
  async getMemberExerciseAppList(
    @Body() getMemberExerciseAppListDto: GetMemberExerciseAppListDto
  ): Promise<{ success: boolean; data: MemberExerciseAppListResponse[] | null; code: string }> {
    return this.memberExerciseAppService.getMemberExerciseAppList(getMemberExerciseAppListDto);
  }

  @Post('getExerciseJumpingDetail')
  async getExerciseJumpingDetail(
    @Body() getExerciseJumpingDetailDto: GetExerciseJumpingDetailDto
  ): Promise<{ success: boolean; data: ExerciseJumpingDetailResponse[] | null; code: string }> {
    return this.memberExerciseAppService.getExerciseJumpingDetail(getExerciseJumpingDetailDto);
  }

  @Post('getExerciseOtherDetail')
  async getExerciseOtherDetail(
    @Body() getExerciseOtherDetailDto: GetExerciseOtherDetailDto
  ): Promise<{ success: boolean; data: ExerciseOtherDetailResponse[] | null; code: string }> {
    return this.memberExerciseAppService.getExerciseOtherDetail(getExerciseOtherDetailDto);
  }

  @Post('deleteMemberExerciseApp')
  async deleteMemberExerciseApp(
    @Body() deleteMemberExerciseAppDto: DeleteMemberExerciseAppDto,
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberExerciseAppService.deleteMemberExerciseApp(deleteMemberExerciseAppDto);
  }

  @Post('deleteExerciseJumping')
  async deleteExerciseJumping(
    @Body() deleteExerciseJumpingDto: DeleteExerciseJumpingDto,
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberExerciseAppService.deleteExerciseJumping(deleteExerciseJumpingDto);
  }

  @Post('deleteExerciseOther')
  async deleteExerciseOther(
    @Body() deleteExerciseOtherDto: DeleteExerciseOtherDto,
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberExerciseAppService.deleteExerciseOther(deleteExerciseOtherDto);
  }
} 