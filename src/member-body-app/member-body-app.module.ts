import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberBodyAppController } from './member-body-app.controller';
import { MemberBodyAppService } from './member-body-app.service';
import { MemberBodyApp } from './dto/member-body-app.dto';

@Module({
  imports: [TypeOrmModule.forFeature([MemberBodyApp])],
  controllers: [MemberBodyAppController],
  providers: [MemberBodyAppService],
  exports: [MemberBodyAppService],
})
export class MemberBodyAppModule {}


