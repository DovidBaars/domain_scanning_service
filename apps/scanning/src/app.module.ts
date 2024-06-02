import { Module } from '@nestjs/common';
import { ProductsServiceController } from 'products/products_service.controller';
import { ProductsServiceService } from 'products/products_service.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { PrismaService } from './prisma.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ScanningService } from './scanning/scanning.service';
import { HttpModule } from '@nestjs/axios';
import { VirusTotalService } from './scanning/scanners/virus_total.service';
import { SchedulingServiceService } from 'scheduling/scheduling_service.service';

const messagingClient = RabbitMQModule.forRoot(RabbitMQModule, {
  exchanges: [
    {
      name: 'dss-exchange',
      type: 'topic',
    },
  ],
  uri: process.env.RABBITMQ_URL || 'amqp://user:password@localhost:5672',
  connectionInitOptions: { wait: false },
});

@Module({
  imports: [messagingClient, ScheduleModule.forRoot(), HttpModule.register({})],
  controllers: [ProductsServiceController],
  providers: [
    ProductsServiceService,
    SchedulingServiceService,
    PrismaService,
    ScanningService,
    VirusTotalService,
  ],
  exports: [RabbitMQModule],
})
export class AppModule {}
