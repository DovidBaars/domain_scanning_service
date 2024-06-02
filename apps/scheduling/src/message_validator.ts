import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';

export async function validateMessage<T extends object, V>(
  msg: V,
  dtoClass: ClassConstructor<T>,
): Promise<T> {
  const message = plainToInstance(dtoClass, msg);
  const errors = await validate(message);
  console.log('Errors:', errors);
  if (errors.length > 0) {
    throw new BadRequestException('Validation failed');
  }
  return message;
}
