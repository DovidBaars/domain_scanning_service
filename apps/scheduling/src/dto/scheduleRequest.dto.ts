import { IsInt, IsOptional } from 'class-validator';

import { ScanRequestDto } from '@apps/scanning/src/scanning/ScanRequest.dto';

export class ScheduleRequestDto extends ScanRequestDto {
  @IsInt()
  @IsOptional()
  interval: number;
}
