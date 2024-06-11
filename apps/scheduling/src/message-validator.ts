import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { ERROR_MESSAGE } from '@apps/constants/errors';

export async function validateMessage<T extends object, V>(
  message_: V,
  dtoClass: ClassConstructor<T>,
): Promise<T> {
  const message = plainToInstance(dtoClass, message_);
  const errors = await validate(message);
  if (errors.length > 0) {
    throw new BadRequestException(
      ERROR_MESSAGE.INPUT_VALIDATION,
      JSON.stringify(errors),
    );
  }
  return message;
}
