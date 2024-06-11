import { NestFactory } from '@nestjs/core';

import { ProductsServiceModule } from './products.module';

await NestFactory.create(ProductsServiceModule);
