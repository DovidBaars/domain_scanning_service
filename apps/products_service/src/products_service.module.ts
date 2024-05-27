import { Module } from '@nestjs/common';
import { ProductsServiceController } from './products_service.controller';
import { ProductsServiceService } from './products_service.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [RabbitMQModule],
  controllers: [ProductsServiceController],
  providers: [ProductsServiceService],
})
export class ProductsServiceModule {}
