import { Module } from '@nestjs/common';
import { DatabaseServiceController } from './database_service.controller';
import { DatabaseServiceService } from './database_service.service';

@Module({
  imports: [],
  controllers: [DatabaseServiceController],
  providers: [DatabaseServiceService],
})
export class DatabaseServiceModule {}
