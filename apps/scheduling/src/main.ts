import { NestFactory } from '@nestjs/core';

import { SchedulingServiceModule } from './scheduling_service.module';

async function bootstrap() {
  await NestFactory.create(SchedulingServiceModule);
}
bootstrap();
