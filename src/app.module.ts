import { Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Member } from './entities/member.entity';
import { MemberAccountApp } from './entities/member-account-app.entity';
import { CheckinLog } from './entities/checkin-log.entity';
import { MemberExerciseApp } from './entities/member-exercise-app.entity';
import { Notice } from './entities/notice.entity';
import { NoticesApp } from './entities/notices-app.entity';
import { InquiryApp } from './entities/inquiry-app.entity';
import { InquiryShoppingApp } from './entities/inquiry-shopping-app.entity';
import { CheckinLogModule } from './checkin-log/checkin-log.module';
import { MemberOrdersModule } from './member-orders/member-orders.module';
import { MemberOrderAppModule } from './member-order-app/member-order-app.module';
import { MemberModule } from './member/member.module';
import { MemberExerciseAppModule } from './member-exercise-app/member-exercise-app.module';
import { NoticesAppModule } from './notices-app/notices-app.module';
import { InquiryAppModule } from './inquiry-app/inquiry-app.module';
import { UpdateLogAppModule } from './update-log-app/update-log-app.module';
import { MemberImgFileModule } from './member-img-file/member-img-file.module';
import { RefreshToken } from './entities/refresh-token.entity';
import { BannerAppModule } from './banner-app/banner-app.module';
import { BannerApp } from './entities/banner-app.entity';
import { ProductAppModule } from './product-app/product-app.module';
import { ProductApp } from './entities/product-app.entity';
import { MemberReviewAppModule } from './member-review-app/member-review-app.module';
import { MemberReviewApp } from './entities/member-review-app.entity';
import { MemberScheduleAppModule } from './member-schedule-app/member-schedule-app.module';
import { MemberSchedule } from './entities/member-schedule-app.entity';
import { CommonCodeModule } from './common-code/common-code.module';
import { MemberZzimAppModule } from './member-zzim-app/member-zzim-app.module';
import { MemberSearchAppModule } from './member-search-app/member-search-app.module';
import { MemberShippingAddressModule } from './member-shipping-address/member-shipping-address.module';
import { MemberExerciseGoalModule } from './member-exercise-goal/member-exercise-goal.module';
import { MemberCartAppModule } from './member-cart-app/member-cart-app.module';
import { MemberCartApp } from './member-cart-app/dto/member-cart-app.dto';
import { MemberPointAppModule } from './member-point-app/member-point-app.module';
import { MemberCouponAppModule } from './member-coupon-app/member-coupon-app.module';
import { NoticesShoppingAppModule } from './notices-shopping-app/notices-shopping-app.module';
import { InquiryShoppingAppModule } from './inquiry-shopping-app/inquiry-shopping-app.module';
import { MemberReturnAppModule } from './member-return-app/member-return-app.module';
import { EventAppModule } from './event-app/event-app.module';
import { ReturnExchangePolicyModule } from './return_exchange_policy/return_exchange_policy.module';
import { MemberOrderApp } from './entities/member-order-app.entity';
import { MemberOrderAddress } from './entities/member-order-address.entity';
import { PostApp } from './entities/post-app.entity';
import { MemberPostApp } from './entities/member-post-app.entity';
import { PostAppModule } from './post-app/post-app.module';
import { MemberOrderAddressModule } from './member-order-address/member-order-address.module';
import { MemberPaymentApp } from './entities/member-payment-app.entity';
import { MemberPaymentAppModule } from './member-payment-app/member-payment-app.module';
import { PortoneModule } from './portone/portone.module';
import { DeliveryTrackerModule } from './delivery-tracker/delivery-tracker.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 100,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'jumping',
      entities: [Member, MemberAccountApp, CheckinLog, MemberExerciseApp, Notice, NoticesApp, InquiryApp, InquiryShoppingApp, RefreshToken, BannerApp, ProductApp, MemberReviewApp, MemberSchedule, MemberCartApp, MemberOrderApp, MemberOrderAddress, PostApp, MemberPostApp, MemberPaymentApp],
      synchronize: false, // 데이터 보존을 위해 false로 설정
    }),
    AuthModule,
    CheckinLogModule,
    MemberOrderAppModule,
    MemberOrdersModule,
    MemberModule,
    MemberExerciseAppModule,
    MemberExerciseGoalModule,
    NoticesAppModule,
    InquiryAppModule,
    InquiryShoppingAppModule,
    UpdateLogAppModule,
    MemberImgFileModule,
    BannerAppModule,
    ProductAppModule,
    MemberReviewAppModule,
    MemberScheduleAppModule,
    CommonCodeModule,
    MemberZzimAppModule,
    MemberSearchAppModule,
    MemberShippingAddressModule,
    MemberCartAppModule,
    MemberPointAppModule,
    MemberCouponAppModule,
    NoticesShoppingAppModule,
    MemberReturnAppModule,
    EventAppModule,
    ReturnExchangePolicyModule,
    PostAppModule,
    MemberOrderAddressModule,
    MemberPaymentAppModule,
    PortoneModule,
    DeliveryTrackerModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: 'APP_GUARD', useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
