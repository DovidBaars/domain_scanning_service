import { Module } from '@nestjs/common';
import { ScanningService } from './scanning.service';
import { PrismaService } from '../prisma.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { VirusTotalService } from './scanners/virus_total.service';

@Module({
  imports: [RabbitMQModule],
  providers: [ScanningService, PrismaService, VirusTotalService],
})
export class ScanningModule {}
