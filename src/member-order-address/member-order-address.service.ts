import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MemberOrderAddress } from '../entities/member-order-address.entity';
import { COMMON_RESPONSE_CODES } from '../core/constants/response-codes';
import { getCurrentDateYYYYMMDDHHIISS } from '../core/utils/date.utils';
import { DeleteMemberOrderAddressDto, InsertMemberOrderAddressDto, UpdateMemberOrderAddressDto, UpdateMemberOrderAddressTypeDto, UpdateMemberOrderAddressUseYnDto, UpdateOrderDetailAppIdDto } from './dto/member-order-address.dto';

@Injectable()
export class MemberOrderAddressService {
  constructor(
    @InjectRepository(MemberOrderAddress)
    private memberOrderAddressRepository: Repository<MemberOrderAddress>,
    private dataSource: DataSource
  ) {}

  async getMemberOrderAddressList(account_app_id: string): Promise<{ success: boolean; data: any[] | null; code: string }> {
    try {
      const memberOrderAddressList = await this.dataSource
        .createQueryBuilder()
        .select([
          'moa.order_app_id AS order_app_id'
          , 'moad.order_detail_app_id AS order_detail_app_id'
          , 'moad.order_address_id AS order_address_id'
          , 'moad.order_address_type AS order_address_type'
          , 'moad.receiver_name AS receiver_name'
          , 'moad.receiver_phone AS receiver_phone'
          , 'moad.address AS address'
          , 'moad.address_detail AS address_detail'
          , 'moad.zip_code AS zip_code'
          , 'moad.enter_way AS enter_way'
          , 'moad.enter_memo AS enter_memo'
          , 'moad.delivery_request AS delivery_request'
          , 'moad.use_yn AS use_yn'
          , `
              (
                SELECT
                  sesa.zip_code
                FROM  extra_shipping_area sesa
                WHERE sesa.zip_code = moad.zip_code
              ) AS extra_zip_code
            `
        ])
        .from('member_account_app', 'mca')
        .leftJoin('member_order_app', 'moa', 'mca.account_app_id = moa.account_app_id')
        .leftJoin('member_order_detail_app', 'moda', 'moa.order_app_id = moda.order_app_id')
        .leftJoin('member_order_address', 'moad', 'moda.order_detail_app_id = moad.order_detail_app_id')
        .where('mca.account_app_id = :account_app_id', { account_app_id })
        .andWhere('moa.del_yn = "N"')
        .andWhere('moad.use_yn = "Y"')
        .getRawMany();
        
      if (!memberOrderAddressList || memberOrderAddressList.length === 0) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }
      
      return {
        success: true,
        data: memberOrderAddressList,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error fetching member order address list:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message,
          code: COMMON_RESPONSE_CODES.FAIL
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getTargetMemberOrderAddress(order_address_id: number): Promise<{ success: boolean; data: any[] | null; code: string }> {
    try {
      const memberOrderAddress = await this.dataSource
        .createQueryBuilder()
        .select([
          'moa.order_address_id AS order_address_id'
          , 'moa.order_detail_app_id AS order_detail_app_id'
          , 'moa.account_app_id AS account_app_id'
          , 'moa.order_address_type AS order_address_type'
          , 'moa.receiver_name AS receiver_name'
          , 'moa.receiver_phone AS receiver_phone'
          , 'moa.address AS address'
          , 'moa.address_detail AS address_detail'
          , 'moa.zip_code AS zip_code'
          , 'moa.enter_way AS enter_way'
          , 'moa.enter_memo AS enter_memo'
          , 'moa.delivery_request AS delivery_request'
          , 'moa.use_yn AS use_yn'
        ])
        .from('member_order_address', 'moa')
        .where('moa.order_address_id = :order_address_id', { order_address_id })
        .getRawOne();
        
      if (!memberOrderAddress) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }
      
      return {
        success: true,
        data: memberOrderAddress,
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error fetching member order address:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message,
          code: COMMON_RESPONSE_CODES.FAIL
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async insertMemberOrderAddress(insertMemberOrderAddressDto: InsertMemberOrderAddressDto, account_app_id: number): Promise<{ success: boolean; data: { order_address_id: number } | null; code: string }> {
    try {
      const { order_detail_app_id, account_app_id, receiver_name, receiver_phone, address, address_detail, zip_code, enter_way, enter_memo, delivery_request, order_address_type } = insertMemberOrderAddressDto;
      const reg_dt = getCurrentDateYYYYMMDDHHIISS();
      
      if (order_address_type === 'RETURN') {
        await this.dataSource
          .createQueryBuilder()
          .update('member_order_address')
          .set({
            use_yn: 'N',
            mod_dt: reg_dt,
            mod_id: account_app_id,
          })
          .where('order_detail_app_id = :order_detail_app_id', { order_detail_app_id })
          .andWhere('order_address_type = :order_address_type', { order_address_type: 'RETURN' })
          .andWhere('use_yn = :use_yn', { use_yn: 'Y' })
          .execute();
      }

      const result = await this.dataSource
        .createQueryBuilder()
        .insert()
        .into('member_order_address')
        .values({
          order_detail_app_id: order_detail_app_id,
          account_app_id: account_app_id,
          order_address_type: order_address_type,
          receiver_name: receiver_name,
          receiver_phone: receiver_phone,
          address: address,
          address_detail: address_detail,
          zip_code: zip_code,
          enter_way: enter_way,
          enter_memo: enter_memo,
          delivery_request: delivery_request,
          use_yn: 'Y',
          reg_dt: reg_dt,
          reg_id: account_app_id,
          mod_dt: null,
          mod_id: null
        })
        .execute();
      
      const order_address_id = result.identifiers[0].order_address_id;
      
      return {
        success: true,
        data: { order_address_id },
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error creating order address:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message,
          code: COMMON_RESPONSE_CODES.FAIL
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateMemberOrderAddress(updateMemberOrderAddressDto: UpdateMemberOrderAddressDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { order_address_id, account_app_id, receiver_name, receiver_phone, address, address_detail, zip_code, enter_way, enter_memo, delivery_request, use_yn } = updateMemberOrderAddressDto;
      const result = await this.memberOrderAddressRepository
        .createQueryBuilder()
        .update('member_order_address')
        .set({
          receiver_name: receiver_name,
          receiver_phone: receiver_phone,
          address: address,
          address_detail: address_detail,
          zip_code: zip_code,
          enter_way: enter_way,
          enter_memo: enter_memo,
          delivery_request: delivery_request,
          use_yn: use_yn,
          mod_dt: getCurrentDateYYYYMMDDHHIISS(),
          mod_id: account_app_id
        })
        .where("order_address_id = :order_address_id", { order_address_id })
        .execute();
      
      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 주문 주소를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        message: '주문 주소가 성공적으로 업데이트되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error updating order address:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message,
          code: COMMON_RESPONSE_CODES.FAIL
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateMemberOrderAddressType(updateMemberOrderAddressTypeDto: UpdateMemberOrderAddressTypeDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { order_address_id, account_app_id, order_address_type } = updateMemberOrderAddressTypeDto;
      const result = await this.memberOrderAddressRepository
        .createQueryBuilder()
        .update('member_order_address')
        .set({
          order_address_type: order_address_type,
          mod_dt: getCurrentDateYYYYMMDDHHIISS(),
          mod_id: account_app_id
        })
        .where("order_address_id = :order_address_id", { order_address_id })
        .execute();
      
      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 주문 주소를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        message: '주문 주소가 성공적으로 업데이트되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error updating order address:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message,
          code: COMMON_RESPONSE_CODES.FAIL
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateMemberOrderAddressUseYn(useYMemberOrderAddressDto: UpdateMemberOrderAddressUseYnDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { order_address_id, account_app_id, use_yn } = useYMemberOrderAddressDto;
      const result = await this.memberOrderAddressRepository
        .createQueryBuilder()
        .update('member_order_address')
        .set({
          use_yn: use_yn,
          mod_dt: getCurrentDateYYYYMMDDHHIISS(),
          mod_id: account_app_id
        })
        .where("order_address_id = :order_address_id", { order_address_id })
        .execute();
      
      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 주문 주소를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        message: '주문 주소가 성공적으로 업데이트되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error updating order address:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message,
          code: COMMON_RESPONSE_CODES.FAIL
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


  async updateOrderDetailAppId(updateData: UpdateOrderDetailAppIdDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { account_app_id, order_address_id, order_detail_app_id } = updateData;

      const result = await this.dataSource
        .createQueryBuilder()
        .update('member_order_address')
        .set({
          order_detail_app_id: order_detail_app_id,
          mod_dt: getCurrentDateYYYYMMDDHHIISS(),
          mod_id: account_app_id
        })
        .where("order_address_id = :order_address_id", { order_address_id: order_address_id })
        .execute();

      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 주문 정보를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        message: '주문 수량이 수정되었습니다',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          code: COMMON_RESPONSE_CODES.FAIL
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteMemberOrderAddress(deleteMemberOrderAddressDto: DeleteMemberOrderAddressDto): Promise<{ success: boolean; message: string; code: string }> {
    try {
      const { order_detail_app_id, account_app_id } = deleteMemberOrderAddressDto;
      const result = await this.memberOrderAddressRepository
        .createQueryBuilder()
        .update('member_order_address')
        .set({
          use_yn: 'N',
          mod_dt: getCurrentDateYYYYMMDDHHIISS(),
          mod_id: account_app_id
        })
        .where("order_detail_app_id = :order_detail_app_id", { order_detail_app_id })
        .execute();
      
      if (result.affected === 0) {
        return {
          success: false,
          message: '업데이트할 주문 주소를 찾을 수 없습니다.',
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        message: '주문 주소가 성공적으로 업데이트되었습니다.',
        code: COMMON_RESPONSE_CODES.SUCCESS
      };
    } catch (error) {
      console.error('Error updating order address:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message,
          code: COMMON_RESPONSE_CODES.FAIL
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}