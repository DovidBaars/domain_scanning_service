import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsUrl, Min } from 'class-validator';

export class DomainDto {
  @IsUrl()
  domain: string;

  @Transform(({ value }) => parseInt(value), { toClassOnly: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  interval: number;
}
