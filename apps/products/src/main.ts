import { NestFactory } from '@nestjs/core';

import { ProductsServiceModule } from './products_service.module';

async function bootstrap() {
  await NestFactory.create(ProductsServiceModule);
}
bootstrap();
