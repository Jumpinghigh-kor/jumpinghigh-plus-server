import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MemberOrderAppService } from './member-order-app.service';
import { InsertMemberOrderAppDto, InsertMemberOrderDetailAppDto, UpdateOrderStatusDto, UpdateOrderQuantityDto, UpdateMemberOrderDetailAppDto } from './dto/member-order-app.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BadRequestException } from '@nestjs/common';

@Controller('member-order-app')
@UseGuards(JwtAuthGuard)
export class MemberOrderAppController {
  constructor(private readonly memberOrderAppService: MemberOrderAppService) {}

  @Post('getMemberOrderAppList')
  async getMemberOrderAppList(
    @Body('account_app_id') account_app_id: string,
    @Body('screen_type') screen_type: string,
    @Body('year') year: string,
    @Body('search_title') search_title: string
  ): Promise<{ success: boolean; data: any[] | null; code: string }> {
    try {
      return this.memberOrderAppService.getMemberOrderAppList(account_app_id, screen_type, year, search_title);
    } catch (error) {
      throw error;
    }
  }

  @Post('insertMemberOrderApp')
  async insertMemberOrderApp(
    @Body() payload: any
  ): Promise<{ success: boolean; message: string; code: string }> {
    try {
      return this.memberOrderAppService.insertMemberOrderApp(payload as any);
    } catch (error) {
      throw error;
    }
  }

  @Post('insertMemberOrderDetailApp')
  async insertMemberOrderDetailApp(
    @Body() payload: any
  ): Promise<{ success: boolean; message: string; code: string; order_detail_app_id: number | null }> {
    try {
      return this.memberOrderAppService.insertMemberOrderDetailApp(payload as any);
    } catch (error) {
      throw error;
    }
  }

  @Post('updateMemberOrderDetailApp')
  async updateMemberOrderDetailApp(
    @Body() payload: any
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberOrderAppService.updateMemberOrderDetailApp(payload as any);
  }

  @Post('updateOrderStatus')
  async updateOrderStatus(
    @Body() payload: any
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberOrderAppService.updateOrderStatus(payload as any);
  }

  @Post('updateOrderQuantity')
  async updateOrderQuantity(
    @Body() payload: any
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberOrderAppService.updateOrderQuantity(payload as any);
  }
} 