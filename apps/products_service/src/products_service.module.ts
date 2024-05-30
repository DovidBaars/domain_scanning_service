import { Module } from '@nestjs/common';
import { ProductsServiceController } from './products_service.controller';
import { ProductsServiceService } from './products_service.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { PrismaService } from 'apps/domain_scanning_service/src/prisma.service';

@Module({
  imports: [RabbitMQModule],
  controllers: [ProductsServiceController],
  providers: [ProductsServiceService, PrismaService],
})
export class ProductsServiceModule {}
