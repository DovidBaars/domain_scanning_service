import { Module } from '@nestjs/common';
import { SchedulingServiceController } from './scheduling_service.controller';
import { SchedulingServiceService } from './scheduling_service.service';

@Module({
  imports: [],
  controllers: [SchedulingServiceController],
  providers: [SchedulingServiceService],
})
export class SchedulingServiceModule {}
