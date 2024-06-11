import { NestFactory } from '@nestjs/core';

import { SchedulingServiceModule } from './scheduling.module';

await NestFactory.create(SchedulingServiceModule);
