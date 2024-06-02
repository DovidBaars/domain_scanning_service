import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { PrismaService } from '../prisma.service';
import { ScanningService } from './scanning.service';
import { VirusTotalService } from './scanners/virus_total.service';
import { PolyswarmService } from './scanners/polyswarm.service';

@Module({
  imports: [RabbitMQModule],
  providers: [
    ScanningService,
    PrismaService,
    VirusTotalService,
    PolyswarmService,
  ],
})
export class ScanningModule {}
