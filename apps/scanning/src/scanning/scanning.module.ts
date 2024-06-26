import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { PrismaService } from '../prisma.service';
import { ScanningService } from './scanning.service';

@Module({
  imports: [RabbitMQModule, ConfigModule],
  providers: [ScanningService, PrismaService],
})
export class ScanningModule {}
