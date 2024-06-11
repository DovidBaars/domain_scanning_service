/* eslint-disable i18next/no-literal-string */
import { PrismaClient } from '@prisma/client';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      log: [
        // {
        //   emit: 'stdout',
        //   level: 'query',
        // },
        // {
        //   emit: 'stdout',
        //   level: 'info',
        // },
        {
          emit: 'stdout',
          level: 'warn',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
