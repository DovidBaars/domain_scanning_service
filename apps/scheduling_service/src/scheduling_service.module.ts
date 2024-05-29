import { Module } from '@nestjs/common';
import { SchedulingServiceService } from './scheduling_service.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [RabbitMQModule],
  providers: [SchedulingServiceService],
})
export class SchedulingServiceModule {}
