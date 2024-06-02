import { NestFactory } from '@nestjs/core';

import { SchedulingServiceModule } from './scheduling_service.module';

async function bootstrap() {
  const app = await NestFactory.create(SchedulingServiceModule);
  await app.listen(3001);
}
bootstrap();
