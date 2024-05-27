import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
