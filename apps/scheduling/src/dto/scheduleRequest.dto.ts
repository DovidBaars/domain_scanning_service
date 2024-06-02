import { IsInt } from 'class-validator';

import { ScanRequestDto } from '@scanning/scanning/dto/ScanRequest.dto';

export class ScheduleRequestDto extends ScanRequestDto {
  @IsInt()
  interval: number;
}
