import { BadRequestException } from '@nestjs/common';
import { DomainDto } from 'apps/products_service/src/domain.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

export async function validateMessage(msg: any): Promise<DomainDto> {
  const message = plainToClass(DomainDto, msg);
  const errors = await validate(message);
  if (errors.length > 0) {
    throw new BadRequestException('Validation failed');
  }
  return message;
}
