import * as DomainScannerClient from 'domain-scanner';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

import {
  DomainScannerClientCallback,
  IDomainScannerClientOptions,
  DomainScannerClientType,
  IScanClientApi,
} from './scanning.interface';
import { DSS_BaseService } from './base.service';
import { PrismaService } from '../prisma.service';
import { validateMessage } from '@apps/scheduling/src/message-validator';
import { ScheduleRequestDto } from '@apps/scheduling/src/dto/request.dto';
import { EXTERNAL_SOURCES } from '@apps/constants/external-sources';
import { ConfigService } from '@nestjs/config';
import { EXCHANGE, ROUTING_KEY } from '@apps/constants/message-queue';
import { ERROR_MESSAGE } from '@apps/constants/errors';

@Injectable()
export class ScanningService extends DSS_BaseService implements OnModuleInit {
  private domainForScanning: { domainId: number; domain: string };
  private scanClientApi: IScanClientApi[] = [
    {
      name: EXTERNAL_SOURCES.VIRUSTOTAL,
      id: undefined,
    },
  ];
  private scannerOptions: IDomainScannerClientOptions = { keys: {} };
  private results: object;
  private domainScannerClient: DomainScannerClientType = DomainScannerClient;

  constructor(
    protected readonly prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super(prisma);
  }

  onModuleInit(): void {
    this.scanClientApi.forEach((api) => {
      this.initializeScannerOptions(api);
      this.initializeScannerApi(api);
    });
  }

  private initializeScannerOptions(item: IScanClientApi): void {
    this.scannerOptions.keys[item.name] = this.configService.get(
      `${EXTERNAL_SOURCES.VIRUSTOTAL.toUpperCase()}_API_KEY`,
      { infer: true },
    );
  }

  private async initializeScannerApi(item: IScanClientApi): Promise<void> {
    const scanApi = await this.prisma.scanApi.findUnique({
      where: { api: item.name },
    });
    if (scanApi) {
      item.id = scanApi.scanApiId;
    }
  }

  private async upsertScannerDb(apiName: string): Promise<void> {
    await this.prisma.scanApi.upsert({
      where: { api: apiName },
      update: { lastRun: new Date() },
      create: { api: apiName, lastRun: new Date() },
    });
  }

  private async upsertResultsDb(apiId: number): Promise<void> {
    await this.prisma.results.upsert({
      create: {
        domainId: this.domainForScanning.domainId,
        scanApiId: apiId,
        results: JSON.stringify(this.results),
      },
      where: {
        domainId_scanApiId: {
          domainId: this.domainForScanning.domainId,
          scanApiId: apiId,
        },
      },
      update: { results: JSON.stringify(this.results) },
    });
  }

  @RabbitSubscribe({
    exchange: EXCHANGE.MAIN,
    routingKey: `${ROUTING_KEY.SCAN}.*`,
    queueOptions: {
      durable: true,
      deadLetterExchange: EXCHANGE.DEAD_LETTER,
    },
  })
  async create(message: ScheduleRequestDto): Promise<Nack | void> {
    this.logAccess({ service: this.constructor.name, routingKey: `${ROUTING_KEY.SCAN}.*` });
    try {
      this.domainForScanning = await validateMessage(
        message,
        ScheduleRequestDto,
      );
      const callback: DomainScannerClientCallback = async (error, response) => {
        if (
          error ||
          (this.scanClientApi.length > 0 &&
            this.scanClientApi.every(
              ({ name }) => response[name]?.data?.response_code,
            ))
        ) {
          throw new Error(error);
        }
        this.results = response;

        for (const { id, name } of this.scanClientApi) {
          try {
            await this.upsertScannerDb(name);
            await this.upsertResultsDb(id);
          } catch (error) {
            console.error(`Error upserting ${name} or ${id}:`, error);
            throw new Error(ERROR_MESSAGE.SCAN_UPSERT);
          }
        }
      };

      this.domainScannerClient(
        this.domainForScanning.domain,
        this.scannerOptions,
        callback,
      );
    } catch (error: unknown) {
      console.error(
        ERROR_MESSAGE.SCAN,
        typeof error === 'object' && error !== null && 'message' in error
          ? error.message
          : error,
      );
      return new Nack(false);
    }
  }
}
