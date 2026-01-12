import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { COMMON_RESPONSE_CODES } from '../core/constants/response-codes';
import { getCurrentDateYYYYMMDDHHIISS } from '../core/utils/date.utils';
import { GetMemberShippingAddressListDto, InsertMemberShippingAddressDto, UpdateMemberShippingAddressDto, DeleteMemberShippingAddressDto, UpdateDeliveryRequestDto, UpdateSelectYnDto } from './dto/member-shipping-address.dto';

@Injectable()
export class MemberShippingAddressService {
  constructor(
    private dataSource: DataSource
  ) {}

  async getMemberShippingAddressList(getMemberShippingAddressListDto: GetMemberShippingAddressListDto): Promise<{ success: boolean; data: any[] | null; code: string }> {
    try {
      const { account_app_id } = getMemberShippingAddressListDto;
      
      const addressList = await this.dataSource.manager
        .createQueryBuilder()
        .select([
          'shipping_address_id'
          , 'account_app_id'
          , 'shipping_address_name'
          , 'receiver_name'
          , `CONCAT(
              SUBSTRING(receiver_phone, 1, 3), '-', 
              SUBSTRING(receiver_phone, 4, 4), '-', 
              SUBSTRING(receiver_phone, 8)
          ) AS receiver_phone`
          , 'default_yn'
          , 'select_yn'
          , 'del_yn'
          , 'address'
          , 'address_detail'
          , 'zip_code'
          , 'enter_way'
          , 'enter_memo'
          , 'delivery_request'
          , 'reg_dt'
          , 'reg_id'
        ])
        .from('member_shipping_address', 'msa')
        .where('msa.account_app_id = :account_app_id', { account_app_id })
        .andWhere('msa.del_yn = :del_yn', { del_yn: 'N' })
        .orderBy('msa.default_yn', 'DESC')
        .addOrderBy('msa.shipping_address_id', 'DESC')
        .getRawMany();

      if (!addressList || addressList.length === 0) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: addressList,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error fetching shipping address list:', error);
      return {
        success: false,
        data: null,
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }

  async getTargetMemberShippingAddress(getMemberShippingAddressListDto: GetMemberShippingAddressListDto): Promise<{ success: boolean; data: any | null; code: string }> {
    try {
      const { account_app_id, shipping_address_id } = getMemberShippingAddressListDto;

      const checkSelectYn = await this.dataSource.manager
        .createQueryBuilder()
        .select([
          'COUNT(*) as count'
        ])
        .from('member_shipping_address', 'msa')
        .where('msa.account_app_id = :account_app_id', { account_app_id })
        .andWhere('msa.del_yn = :del_yn', { del_yn: 'N' })
        .andWhere('msa.select_yn = :select_yn', { select_yn: 'Y' })
        .getRawOne();

      // 먼저 default_yn='Y'인 주소 확인
      const queryBuilder = this.dataSource.manager
        .createQueryBuilder()
        .select([
          'shipping_address_id'
          , 'account_app_id'
          , 'shipping_address_name'
          , 'receiver_name'
          , `CONCAT(
              SUBSTRING(receiver_phone, 1, 3), '-', 
              SUBSTRING(receiver_phone, 4, 4), '-', 
              SUBSTRING(receiver_phone, 8)
          ) AS receiver_phone`
          , 'default_yn'
          , 'select_yn'
          , 'del_yn'
          , 'address'
          , 'address_detail'
          , 'zip_code'
          , 'enter_way'
          , 'enter_memo'
          , 'delivery_request'
          , 'reg_dt'
          , 'reg_id'
        ])
        .from('member_shipping_address', 'msa')
        .where('msa.account_app_id = :account_app_id', { account_app_id })
        .andWhere('msa.del_yn = :del_yn', { del_yn: 'N' })
        .andWhere('msa.default_yn = :default_yn', { default_yn: 'Y' });
        
      if(shipping_address_id) {
        queryBuilder.andWhere('msa.shipping_address_id = :shipping_address_id', { shipping_address_id });
      }
      
      let addressList = await queryBuilder.getRawOne();
      
      if(checkSelectYn?.count > 0) {
        addressList = null;  
      }
      
      if (!addressList) {
        addressList = await this.dataSource.manager
          .createQueryBuilder()
          .select([
            'shipping_address_id'
            , 'account_app_id'
            , 'shipping_address_name'
            , 'receiver_name'
            , `CONCAT(
                SUBSTRING(receiver_phone, 1, 3), '-', 
                SUBSTRING(receiver_phone, 4, 4), '-', 
                SUBSTRING(receiver_phone, 8)
            ) AS receiver_phone`
            , 'default_yn'
            , 'select_yn'
            , 'del_yn'
            , 'address'
            , 'address_detail'
            , 'zip_code'
            , 'enter_way'
            , 'enter_memo'
            , 'delivery_request'
            , 'reg_dt'
            , 'reg_id'
          ])
          .from('member_shipping_address', 'msa')
          .where('msa.account_app_id = :account_app_id', { account_app_id })
          .andWhere('msa.del_yn = :del_yn', { del_yn: 'N' })
          .andWhere('msa.select_yn = :select_yn', { select_yn: 'Y' })
          .getRawOne();
      }

      if (!addressList) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: addressList,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error fetching shipping address list:', error);
      return {
        success: false,
        data: null,
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }

  async insertMemberShippingAddress(insertMemberShippingAddressDto: InsertMemberShippingAddressDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { 
        account_app_id,
        shipping_address_name,
        receiver_name,
        receiver_phone,
        default_yn,
        select_yn,
        address,
        address_detail,
        zip_code,
        enter_way,
        enter_memo
      } = insertMemberShippingAddressDto;
      
      // 현재 시간 (YYYYMMDDHHIISS 형식)
      const currentDate = getCurrentDateYYYYMMDDHHIISS();
      
      // default_yn이 'Y'로 설정되는 경우, 해당 사용자의 다른 모든 배송지의 default_yn을 'N'으로 변경
      if (default_yn === 'Y') {
        await this.dataSource
          .createQueryBuilder()
          .update('member_shipping_address')
          .set({
            default_yn: 'N',
            select_yn: 'N',
            mod_dt: currentDate,
            mod_id: account_app_id
          })
          .where('account_app_id = :account_app_id', { account_app_id })
          .andWhere('default_yn = :default_yn', { default_yn: 'Y' })
          .andWhere('del_yn = :del_yn', { del_yn: 'N' })
          .execute();
      }
      
      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into('member_shipping_address')
        .values({
          account_app_id,
          shipping_address_name,
          receiver_name,
          receiver_phone,
          default_yn,
          select_yn,
          del_yn: 'N',
          address,
          address_detail,
          zip_code,
          enter_way,
          enter_memo,
          delivery_request: null,
          reg_dt: currentDate,
          reg_id: account_app_id,
          mod_dt: null,
          mod_id: null
        })
        .execute();
      
      return {
        success: true,
        message: '배송지 정보가 성공적으로 등록되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error creating shipping address:', error);
      return {
        success: false,
        message: error.message,
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }

  async updateMemberShippingAddress(updateMemberShippingAddressDto: UpdateMemberShippingAddressDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { 
        shipping_address_id,
        account_app_id,
        shipping_address_name,
        receiver_name,
        receiver_phone,
        default_yn,
        address,
        address_detail,
        zip_code,
        enter_way,
        enter_memo,
        delivery_request
      } = updateMemberShippingAddressDto;
      
      // 현재 시간 (YYYYMMDDHHIISS 형식)
      const currentDate = getCurrentDateYYYYMMDDHHIISS();
      
      // default_yn이 'Y'로 설정되는 경우, 해당 사용자의 다른 모든 배송지의 default_yn을 'N'으로 변경
      if (default_yn === 'Y') {
        await this.dataSource
          .createQueryBuilder()
          .update('member_shipping_address')
          .set({
            default_yn: 'N',
            select_yn: 'N',
            mod_dt: currentDate,
            mod_id: account_app_id
          })
          .where('account_app_id = :account_app_id', { account_app_id })
          .andWhere('default_yn = :default_yn', { default_yn: 'Y' })
          .andWhere('del_yn = :del_yn', { del_yn: 'N' })
          .execute();
      }
      
      // 1. 기존 주소를 논리적 삭제 (del_yn = 'Y')
      const deleteResult = await this.deleteMemberShippingAddress({ 
        shipping_address_id, 
        account_app_id 
      });
      
      if (!deleteResult.success) {
        return deleteResult;
      }
        
      // 2. 새로운 주소 정보 삽입
      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into('member_shipping_address')
        .values({
          account_app_id,
          shipping_address_name,
          receiver_name,
          receiver_phone,
          default_yn,
          select_yn: 'N',
          del_yn: 'N',
          address,
          address_detail,
          zip_code,
          enter_way,
          enter_memo,
          delivery_request,
          reg_dt: currentDate,
          reg_id: account_app_id,
          mod_dt: null,
          mod_id: null
        })
        .execute();
      
      return {
        success: true,
        message: '배송지 정보가 성공적으로 업데이트되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error updating shipping address:', error);
      return {
        success: false,
        message: error.message,
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }

  async deleteMemberShippingAddress(deleteMemberShippingAddressDto: DeleteMemberShippingAddressDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { shipping_address_id, account_app_id } = deleteMemberShippingAddressDto;

      // 현재 시간 (YYYYMMDDHHIISS 형식)
      const currentDate = getCurrentDateYYYYMMDDHHIISS();
      
      // TypeORM QueryBuilder 사용하여 del_yn 필드 업데이트
      const result = await this.dataSource
        .createQueryBuilder()
        .update('member_shipping_address')
        .set({
          del_yn: 'Y',
          mod_dt: currentDate,
          mod_id: account_app_id
        })
        .where('shipping_address_id = :shipping_address_id', { shipping_address_id })
        .execute();
      
      if (result.affected === 0) {
        return {
          success: false,
          message: '삭제할 배송지 정보를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }
      
      return {
        success: true,
        message: '배송지 정보가 성공적으로 삭제되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error deleting shipping address:', error);
      return {
        success: false,
        message: error.message,
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }

  async updateDeliveryRequest(updateDeliveryRequestDto: UpdateDeliveryRequestDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { shipping_address_id, account_app_id, delivery_request } = updateDeliveryRequestDto;

      // 현재 시간 (YYYYMMDDHHIISS 형식)
      const currentDate = getCurrentDateYYYYMMDDHHIISS();
      
      // 배송 요청 사항 업데이트
      const result = await this.dataSource
        .createQueryBuilder()
        .update('member_shipping_address')
        .set({
          delivery_request,
          mod_dt: currentDate,
          mod_id: account_app_id
        })
        .where('shipping_address_id = :shipping_address_id', { shipping_address_id })
        .execute();
      
      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 배송지 정보를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }
      
      return {
        success: true,
        message: '배송 요청 사항이 성공적으로 업데이트되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }

  async updateSelectYn(updateSelectYnDto: UpdateSelectYnDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { shipping_address_id, account_app_id, select_yn } = updateSelectYnDto;

      // 현재 시간 (YYYYMMDDHHIISS 형식)
      const currentDate = getCurrentDateYYYYMMDDHHIISS();
      
      // 먼저 해당 사용자의 모든 배송지의 select_yn을 'N'으로 변경
      await this.dataSource
        .createQueryBuilder()
        .update('member_shipping_address')
        .set({
          select_yn: 'N',
          mod_dt: currentDate,
          mod_id: account_app_id
        })
        .where('account_app_id = :account_app_id', { account_app_id })
        .andWhere('select_yn = :select_yn', { select_yn: 'Y' })
        .andWhere('del_yn = :del_yn', { del_yn: 'N' })
        .execute();
      
      // 배송 선택 여부 업데이트
      if(shipping_address_id) { 
        const result = await this.dataSource
          .createQueryBuilder()
          .update('member_shipping_address')
          .set({
            select_yn,
            mod_dt: currentDate,
            mod_id: account_app_id
          })
          .where('shipping_address_id = :shipping_address_id', { shipping_address_id })
          .execute();
        
        if (result.affected === 0) {
          return {
            success: false,
            message: '업데이트할 배송지 정보를 찾을 수 없습니다.',
            code: COMMON_RESPONSE_CODES.NO_DATA
          };
        }
      }
      
      return {
        success: true,
        message: '배송지 선택 여부가 성공적으로 업데이트되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        code: COMMON_RESPONSE_CODES.FAIL
      };
    }
  }
} 