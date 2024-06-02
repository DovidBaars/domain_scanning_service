import { NestFactory } from '@nestjs/core';

import { ProductsServiceModule } from './products_service.module';

async function bootstrap() {
  const app = await NestFactory.create(ProductsServiceModule);
  await app.listen(3000);
}
bootstrap();
