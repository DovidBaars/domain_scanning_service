import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { PrismaService } from '@scanning/prisma.service';
import { SchedulingServiceService } from './scheduling_service.service';

@Module({
  imports: [RabbitMQModule],
  providers: [SchedulingServiceService, PrismaService],
})
export class SchedulingServiceModule {}
