import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsUrl } from 'class-validator';

export class DomainDto {
  @IsUrl()
  domain: string;

  @Transform(({ value }) => parseInt(value), { toClassOnly: true })
  @IsInt()
  @IsOptional()
  interval: number;
}
