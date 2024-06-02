import { IsInt, IsOptional } from 'class-validator';

import { ScanRequestDto } from '@scanning/scanning/dto/ScanRequest.dto';

export class ScheduleRequestDto extends ScanRequestDto {
  @IsInt()
  @IsOptional()
  interval: number;
}
