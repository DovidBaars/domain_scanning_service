import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { PrismaService } from '@scanning/prisma.service';
import { ProductsServiceService } from './products_service.service';
import { ProductsServiceController } from './products_service.controller';

@Module({
  imports: [RabbitMQModule],
  controllers: [ProductsServiceController],
  providers: [ProductsServiceService, PrismaService],
})
export class ProductsServiceModule {}
