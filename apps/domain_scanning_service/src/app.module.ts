import { Module } from '@nestjs/common';
import { ProductsServiceController } from 'apps/products_service/src/products_service.controller';
import { ProductsServiceService } from 'apps/products_service/src/products_service.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { PrismaService } from './prisma.service';
import { SchedulingServiceService } from 'apps/scheduling_service/src/scheduling_service.service';
import { ScheduleModule } from '@nestjs/schedule';

const messagingClient = RabbitMQModule.forRoot(RabbitMQModule, {
  exchanges: [
    {
      name: 'dss-exchange',
      type: 'topic',
    },
  ],
  uri: 'amqp://user:password@localhost:5672',
  connectionInitOptions: { wait: false },
});

@Module({
  imports: [messagingClient, ScheduleModule.forRoot()],
  controllers: [ProductsServiceController],
  providers: [ProductsServiceService, SchedulingServiceService, PrismaService],
  exports: [RabbitMQModule],
})
export class AppModule {}
