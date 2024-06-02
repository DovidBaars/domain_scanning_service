import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { PrismaService } from '../prisma.service';
import { ScanningService } from './scanning.service';
import { VirusTotalService } from './scanners/virus_total.service';

@Module({
  imports: [RabbitMQModule],
  providers: [ScanningService, PrismaService, VirusTotalService],
})
export class ScanningModule {}
