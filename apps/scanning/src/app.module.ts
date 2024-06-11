import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { PrismaService } from './prisma.service';
import { ScanningService } from './scanning/scanning.service';
import { ProductsServiceService } from '@apps/products/src/products.service';
import { SchedulingServiceService } from '@apps/scheduling/src/scheduling.service';
import { ProductsServiceController } from '@apps/products/src/products.controller';
import { ConfigModule } from '@nestjs/config';
import { EXCHANGE, TYPE } from '@apps/constants/message-queue';

const messagingClient = RabbitMQModule.forRoot(RabbitMQModule, {
  exchanges: [
    {
      name: EXCHANGE.MAIN,
      type: TYPE,
      options: { durable: true },
    },
    {
      name: EXCHANGE.DEAD_LETTER,
      type: TYPE,
      options: { durable: true },
    },
  ],
  uri: process.env.RABBITMQ_URL,
  connectionInitOptions: { wait: false },
  queues: [
    {
      name: EXCHANGE.DEAD_LETTER,
      options: {
        durable: true,
      },
      exchange: EXCHANGE.DEAD_LETTER,
      routingKey: '#',
    },
  ],
});

@Module({
  imports: [
    ConfigModule.forRoot(),
    messagingClient,
    ScheduleModule.forRoot(),
    HttpModule.register({}),
  ],
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
