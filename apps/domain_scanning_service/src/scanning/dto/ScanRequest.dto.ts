import { IsInt, IsUrl } from 'class-validator';

export class ScanRequestDto {
  @IsInt()
  domainId: number;

  @IsUrl()
  domain: string;
}
