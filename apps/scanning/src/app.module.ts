import { Module } from '@nestjs/common';
import { ProductsServiceController } from 'apps/products/src/products_service.controller';
import { ProductsServiceService } from 'apps/products/src/products_service.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { PrismaService } from './prisma.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ScanningService } from './scanning/scanning.service';
import { HttpModule } from '@nestjs/axios';
import { VirusTotalService } from './scanning/scanners/virus_total.service';
import { SchedulingServiceService } from 'apps/scheduling/src/scheduling_service.service';

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
