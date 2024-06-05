import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { PrismaService } from '../prisma.service';
import { ScanningService } from './scanning.service';

@Module({
  imports: [RabbitMQModule],
  providers: [ScanningService, PrismaService],
})
export class ScanningModule {}
