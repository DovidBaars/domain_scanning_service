import { ScanRequestDto } from 'apps/scanning/src/scanning/dto/ScanRequest.dto';
import { IsInt } from 'class-validator';

export class ScheduleRequestDto extends ScanRequestDto {
  @IsInt()
  interval: number;
}
