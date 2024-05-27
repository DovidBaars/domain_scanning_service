import { Module } from '@nestjs/common';
import { ProductsServiceController } from 'apps/products_service/src/products_service.controller';
import { ProductsServiceService } from 'apps/products_service/src/products_service.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { PrismaService } from './prisma.service';

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
  imports: [messagingClient],
  controllers: [ProductsServiceController],
  providers: [ProductsServiceService, PrismaService],
  exports: [RabbitMQModule],
})
export class AppModule {}
