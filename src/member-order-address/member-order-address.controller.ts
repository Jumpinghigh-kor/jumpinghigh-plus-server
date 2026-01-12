import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MemberOrderAddressService } from './member-order-address.service';
import { DeleteMemberOrderAddressDto, InsertMemberOrderAddressDto, UpdateMemberOrderAddressDto, UpdateMemberOrderAddressTypeDto, UpdateMemberOrderAddressUseYnDto, UpdateOrderDetailAppIdDto } from './dto/member-order-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('member-order-address')
@UseGuards(JwtAuthGuard)
export class MemberOrderAddressController {
  constructor(private readonly memberOrderAddressService: MemberOrderAddressService) {}

  @Post('getMemberOrderAddressList')
  async getMemberOrderAddressList(
    @Body('account_app_id') account_app_id: string
  ): Promise<{ success: boolean; data: any[] | null; code: string }> {
    try {
      return this.memberOrderAddressService.getMemberOrderAddressList(account_app_id);
    } catch (error) {
      throw error;
    }
  }

  @Post('getTargetMemberOrderAddress')
  async getTargetMemberOrderAddress(
    @Body('order_address_id') order_address_id: number
  ): Promise<{ success: boolean; data: any[] | null; code: string }> {
    try {
      return this.memberOrderAddressService.getTargetMemberOrderAddress(order_address_id);
    } catch (error) {
      throw error;
    }
  }
  
  @Post('insertMemberOrderAddress')
  async insertMemberOrderAddress(
    @Body() insertMemberOrderAddressDto: InsertMemberOrderAddressDto,
    @Body('account_app_id') account_app_id: number
  ): Promise<{ success: boolean; data: { order_address_id: number } | null; code: string }> {
    try {
      return this.memberOrderAddressService.insertMemberOrderAddress(insertMemberOrderAddressDto, account_app_id);
    } catch (error) {
      throw error;
    }
  }

  @Post('updateMemberOrderAddress')
  async updateMemberOrderAddress(
    @Body() updateMemberOrderAddressDto: UpdateMemberOrderAddressDto,
  ): Promise<{ success: boolean; message: string; code: string }> {
    try {
      return this.memberOrderAddressService.updateMemberOrderAddress(updateMemberOrderAddressDto);
    } catch (error) {
      throw error;
    }
  }

  @Post('updateMemberOrderAddressType')
  async updateMemberOrderAddressType(
    @Body() updateMemberOrderAddressTypeDto: UpdateMemberOrderAddressTypeDto
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberOrderAddressService.updateMemberOrderAddressType(updateMemberOrderAddressTypeDto);
  }

  @Post('updateOrderDetailAppId')
  async updateOrderDetailAppId(
    @Body() updateOrderDetailAppIdDto: UpdateOrderDetailAppIdDto
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberOrderAddressService.updateOrderDetailAppId(updateOrderDetailAppIdDto);
  }

  @Post('deleteMemberOrderAddress')
  async deleteMemberOrderAddress(
    @Body() deleteMemberOrderAddressDto: DeleteMemberOrderAddressDto
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberOrderAddressService.deleteMemberOrderAddress(deleteMemberOrderAddressDto);
  }

  @Post('updateMemberOrderAddressUseYn')
  async updateMemberOrderAddressUseYn(
    @Body() updateMemberOrderAddressUseYnDto: UpdateMemberOrderAddressUseYnDto
  ): Promise<{ success: boolean; message: string; code: string }> {
    return this.memberOrderAddressService.updateMemberOrderAddressUseYn(updateMemberOrderAddressUseYnDto);
  }
} 