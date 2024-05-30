import { ScanRequestDto } from 'apps/domain_scanning_service/src/scanning/dto/ScanRequest.dto';
import { IsInt } from 'class-validator';

export class ScheduleRequestDto extends ScanRequestDto {
  @IsInt()
  interval: number;
}
