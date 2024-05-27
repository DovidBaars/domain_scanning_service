import { Injectable } from '@nestjs/common';

@Injectable()
export class SchedulingServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
