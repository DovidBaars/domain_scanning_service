import { Module } from '@nestjs/common';
import { SchedulingServiceService } from './scheduling_service.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { PrismaService } from 'apps/domain_scanning_service/src/prisma.service';

@Module({
  imports: [RabbitMQModule],
  providers: [SchedulingServiceService, PrismaService],
})
export class SchedulingServiceModule {}
