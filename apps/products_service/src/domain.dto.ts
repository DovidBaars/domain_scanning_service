import { IsUrl } from 'class-validator';

export class DomainDto {
  @IsUrl()
  domain: string;
}
