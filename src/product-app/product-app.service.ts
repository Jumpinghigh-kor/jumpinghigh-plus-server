import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { COMMON_RESPONSE_CODES } from '../core/constants/response-codes';
import { ProductApp } from '../entities/product-app.entity';
import { GetProductAppListDto, ProductAppListResponse, GetProductAppImgDetailDto, ProductAppImgDetailResponse, SelectProductAppThumbnailImgDto, ProductAppThumbnailImgResponse, ProductDetailAppResponse, GetProductDetailAppListDto } from './dto/product-app.dto';

@Injectable()
export class ProductAppService {
  constructor(
    @InjectRepository(ProductApp)
    private productAppRepository: Repository<ProductApp>
  ) {}

  async getProductAppList(getProductAppListDto: GetProductAppListDto): Promise<{ success: boolean; data: ProductAppListResponse[] | null; code: string }> {
    try {
      const { big_category, account_app_id } = getProductAppListDto;
      
      const queryBuilder = this.productAppRepository
        .createQueryBuilder('p')
        .select([
          'product_app_id'
          , 'small_category'
          , 'brand_name'
          , 'product_name'
          , 'title'
          , 'FORMAT(price, 0) AS price'
          , 'FORMAT(original_price, 0) AS original_price'
          , 'discount'
          , 'give_point'
          , 'sell_start_dt'
          , 'sell_end_dt'
          , 'courier_code'
          , 'return_delivery_fee'
          , 'FORMAT(delivery_fee, 0) AS delivery_fee'
          , 'remote_delivery_fee AS remote_delivery_fee'
          , 'FORMAT(free_shipping_amount, 0) AS free_shipping_amount'
          , 'inquiry_phone_number'
          , 'today_send_yn'
          , 'CONCAT(SUBSTRING(today_send_time, 1, 2), ":", SUBSTRING(today_send_time, 3, 2)) AS today_send_time'
          , 'not_today_send_day'
          , 'consignment_yn AS consignment_yn'
          , 'view_yn'
          , 'del_yn'
          , 'reg_dt'
          , 'reg_id'
          , 'mod_dt'
          , 'mod_id'
          , `
              (
                SELECT
                  smza.zzim_yn AS zzim_yn
                FROM  member_zzim_app smza
                WHERE smza.product_app_id = p.product_app_id
                AND   smza.account_app_id = ${account_app_id}
              ) AS zzim_yn
            `
        ])
        .where('del_yn = :del_yn', { del_yn: 'N' })
        .andWhere('view_yn = :view_yn', { view_yn: 'Y' })
        .orderBy('p.small_category', 'DESC');
      
      if (big_category) {
        queryBuilder.andWhere('big_category = :big_category', { big_category });
      }
      
      const productAppList = await queryBuilder.getRawMany();

      if (!productAppList || productAppList.length === 0) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: productAppList,
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

  async getProductAppImgDetail(getProductAppImgDetailDto: GetProductAppImgDetailDto): Promise<{ success: boolean; data: ProductAppImgDetailResponse[] | null; code: string }> {
    try {
      const { product_app_id } = getProductAppImgDetailDto;
      
      const productAppImgDetail = await this.productAppRepository
        .createQueryBuilder('pa')
        .select([
          'cf.file_name AS file_name',
          'cf.file_division AS file_division',
          'cf.file_path AS file_path',
          'pai.img_form AS img_form',
          'pai.order_seq AS order_seq'
        ])
        .leftJoin('product_app_img', 'pai', 'pa.product_app_id = pai.product_app_id')
        .leftJoin('common_file', 'cf', 'pai.file_id = cf.file_id')
        .where('pa.product_app_id = :product_app_id', { product_app_id })
        .andWhere('pa.del_yn = :del_yn', { del_yn: 'N' })
        .andWhere('pai.use_yn = :use_yn', { use_yn: 'Y' })
        .andWhere('pai.del_yn = :pai_del_yn', { pai_del_yn: 'N' })
        .orderBy('pai.product_app_img_id', 'DESC')
        .getRawMany();

      if (!productAppImgDetail || productAppImgDetail.length === 0) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: productAppImgDetail,
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

  async selectProductAppThumbnailImg(selectProductAppThumbnailImgDto: SelectProductAppThumbnailImgDto): Promise<{ success: boolean; data: ProductAppThumbnailImgResponse[] | null; code: string }> {
    try {
      
      const queryBuilder = this.productAppRepository
        .createQueryBuilder('pa')
        .select([
          'cf.file_name AS file_name',
          'cf.file_division AS file_division',
          'cf.file_path AS file_path',
          'pa.product_app_id AS product_app_id',
          'pai.img_form AS img_form',
          'pai.order_seq AS order_seq'
        ])
        .leftJoin('product_app_img', 'pai', 'pa.product_app_id = pai.product_app_id')
        .leftJoin('common_file', 'cf', 'pai.file_id = cf.file_id')
        .where('pa.del_yn = :del_yn', { del_yn: 'N' })
        .andWhere('pai.use_yn = :use_yn', { use_yn: 'Y' })
        .andWhere('pai.del_yn = :pai_del_yn', { pai_del_yn: 'N' })
        .andWhere('pai.order_seq = :order_seq', { order_seq: 1 })
        .andWhere('pai.img_form = :img_form', { img_form: 'REPRESENTER' });
      
      const thumbnailImg = await queryBuilder.getRawMany();

      if (!thumbnailImg || thumbnailImg.length === 0) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: thumbnailImg,
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

  async getProductDetailAppList(getProductDetailAppListDto: GetProductDetailAppListDto): Promise<{ success: boolean; data: ProductDetailAppResponse[] | null; code: string }> {
    try {
      const { product_app_id } = getProductDetailAppListDto;
      
      const productDetailAppList = await this.productAppRepository
        .createQueryBuilder('pa')
        .select([
          'pa.product_app_id AS product_app_id',
          'pa.brand_name AS brand_name',
          'pa.product_name AS product_name',
          'pa.price AS price',
          'pa.original_price AS original_price',
          'pa.discount AS discount',
          'pa.give_point AS give_point',
          'pa.sell_start_dt AS sell_start_dt',
          'pa.sell_end_dt AS sell_end_dt',
          'pa.courier_code AS courier_code',
          'pa.return_delivery_fee AS return_delivery_fee',
          'FORMAT(pa.delivery_fee, 0) AS delivery_fee',
          'pa.remote_delivery_fee AS remote_delivery_fee',
          'FORMAT(pa.free_shipping_amount, 0) AS free_shipping_amount',
          'pa.inquiry_phone_number AS inquiry_phone_number',
          'pa.today_send_yn AS today_send_yn',
          'CONCAT(SUBSTRING(pa.today_send_time, 1, 2), ":", SUBSTRING(pa.today_send_time, 3, 2)) AS today_send_time',
          'pa.not_today_send_day AS not_today_send_day',
          'pda.product_detail_app_id AS product_detail_app_id',
          'pda.option_type AS option_type',
          'pda.option_amount AS option_amount',
          'pda.option_unit AS option_unit',
          'pda.option_gender AS option_gender',
          'pda.quantity AS quantity'
        ])
        .leftJoin('product_detail_app', 'pda', 'pa.product_app_id = pda.product_app_id')
        .where('pda.del_yn = :del_yn', { del_yn: 'N' })
        .andWhere('pda.use_yn = :use_yn', { use_yn: 'Y' })
        .andWhere('pa.product_app_id = :product_app_id', { product_app_id })
        .getRawMany();

      if (!productDetailAppList || productDetailAppList.length === 0) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: productDetailAppList,
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

  async getTargetProductDetailApp(getTargetProductDetailAppDto: ProductDetailAppResponse): Promise<{ success: boolean; data: ProductDetailAppResponse[] | null; code: string }> {
    try {
      const { product_app_id } = getTargetProductDetailAppDto;
      
      const productDetailApp = await this.productAppRepository
        .createQueryBuilder('pa')
        .select([
          'pa.product_app_id AS product_app_id',
          'pa.brand_name AS brand_name',
          'pa.product_name AS product_name',
          'pa.price AS price',
          'pa.original_price AS original_price',
          'pa.discount AS discount',
          'pa.give_point AS give_point',
          'pa.sell_start_dt AS sell_start_dt',
          'pa.sell_end_dt AS sell_end_dt',
          'pa.courier_code AS courier_code',
          'pa.return_delivery_fee AS return_delivery_fee',
          'FORMAT(pa.delivery_fee, 0) AS delivery_fee',
          'pa.remote_delivery_fee AS remote_delivery_fee',
          'FORMAT(pa.free_shipping_amount, 0) AS free_shipping_amount',
          'pa.inquiry_phone_number AS inquiry_phone_number',
          'pa.today_send_yn AS today_send_yn',
          'CONCAT(SUBSTRING(pa.today_send_time, 1, 2), ":", SUBSTRING(pa.today_send_time, 3, 2)) AS today_send_time',
          'pa.not_today_send_day AS not_today_send_day',
        ])
        .where('pa.del_yn = :del_yn', { del_yn: 'N' })
        .andWhere('pa.product_app_id = :product_app_id', { product_app_id })
        .getRawOne();

      if (!productDetailApp) {
        return {
          success: true,
          data: null,
          code: COMMON_RESPONSE_CODES.NO_DATA
        };
      }

      return {
        success: true,
        data: productDetailApp,
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
} 