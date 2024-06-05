import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { PrismaService } from './prisma.service';
import { ScanningService } from './scanning/scanning.service';
import { ProductsServiceService } from '@products/products_service.service';
import { SchedulingServiceService } from '@scheduling/scheduling_service.service';
import { ProductsServiceController } from '@products/products_service.controller';

const messagingClient = RabbitMQModule.forRoot(RabbitMQModule, {
  exchanges: [
    {
      name: 'dss-exchange',
      type: 'topic',
      options: { durable: true },
    },
    {
      name: 'dead-letter-exchange',
      type: 'topic',
      options: { durable: true },
    },
  ],
  uri: process.env.RABBITMQ_URL || 'amqp://user:password@localhost:5672',
  connectionInitOptions: { wait: false },
  queues: [
    {
      name: 'dead-letter-queue',
      options: {
        durable: true,
      },
      exchange: 'dead-letter-exchange',
      routingKey: '#',
    },
  ],
});

@Module({
  imports: [messagingClient, ScheduleModule.forRoot(), HttpModule.register({})],
  controllers: [ProductsServiceController],
  providers: [
    ProductsServiceService,
    SchedulingServiceService,
    PrismaService,
    ScanningService,
  ],
  exports: [RabbitMQModule],
})
export class AppModule {}
