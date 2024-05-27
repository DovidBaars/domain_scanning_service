import { Controller, Get } from '@nestjs/common';
import { SchedulingServiceService } from './scheduling_service.service';

@Controller()
export class SchedulingServiceController {
  constructor(
    private readonly schedulingServiceService: SchedulingServiceService,
  ) {}

  @Get()
  getHello(): string {
    return this.schedulingServiceService.getHello();
  }
}
