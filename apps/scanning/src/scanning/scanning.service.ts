import { Injectable } from '@nestjs/common';
import * as DomainScannerClient from 'domain-scanner';
import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

import {
  DomainScannerClientCallback,
  DomainScannerClientOptions,
  DomainScannerClientType,
} from './scanning.interface';
import { DSS_BaseService } from './base.service';
import { PrismaService } from '../prisma.service';
import { validateMessage } from '@scheduling/message_validator';
import { ScheduleRequestDto } from '@scheduling/dto/scheduleRequest.dto';

@Injectable()
export class ScanningService extends DSS_BaseService {
  private domainForScanning: { domainId: number; domain: string };
  private scanClientApiArray: { id: number; name: string; key: string }[] = [
    {
      name: 'virustotal',
      id: undefined,
      // REMOVE
      key: '874bfa1a8cb9e2820a1c026817b56a38dcbb3f4604135a1e38685447fc529a5f',
    },
    // Currently supported scanners: hunterio, google, virustotal, spyonweb
  ];
  private scannerOptions: DomainScannerClientOptions =
    this.scanClientApiArray.reduce(
      (acc, item) => {
        acc.keys[item.name] = item.key;
        return acc;
      },
      { keys: {} },
    );
  private results: object;
  private domainScannerClient: DomainScannerClientType = DomainScannerClient;

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  private async upsertScannerDb() {
    this.scanClientApiArray = await this.scanClientApiArray.reduce(
      async (prevPromise, { name }) => {
        const acc = await prevPromise;
        const { scanApiId } = await this.prisma.scanApi.upsert({
          where: { api: name },
          update: { lastRun: new Date() },
          create: { api: name, lastRun: new Date() },
          select: { scanApiId: true },
        });
        acc.push({ id: scanApiId, name: name });
        return acc;
      },
      Promise.resolve([]),
    );
  }

  private async upsertResultsDb() {
    this.scanClientApiArray.forEach(async (scanClient) => {
      await this.prisma.results.upsert({
        create: {
          domainId: this.domainForScanning.domainId,
          scanApiId: scanClient.id,
          results: JSON.stringify(this.results),
        },
        where: {
          domainId_scanApiId: {
            domainId: this.domainForScanning.domainId,
            scanApiId: scanClient.id,
          },
        },
        update: { results: JSON.stringify(this.results) },
      });
    });
  }

  @RabbitSubscribe({
    exchange: 'dss-exchange',
    routingKey: 'scan.*',
    queueOptions: {
      durable: true,
      deadLetterExchange: 'dead-letter-exchange',
    },
  })
  async create(msg: any) {
    this.logAccess({ service: this.constructor.name, routingKey: 'scan.*' });
    try {
      this.domainForScanning = await validateMessage(msg, ScheduleRequestDto);
      const callback: DomainScannerClientCallback = async (err, res) => {
        if (
          err ||
          (this.scanClientApiArray.length &&
            this.scanClientApiArray.every(
              ({ name }) => res[name]?.data?.response_code,
            ))
        ) {
          throw new Error(err);
        }
        this.results = res;
        console.log('Results from scanner:', res.domain);
        await this.upsertScannerDb();
        await this.upsertResultsDb();
      };

      this.domainScannerClient(
        this.domainForScanning.domain,
        this.scannerOptions,
        callback.bind(this),
      );
    } catch (error: any) {
      console.error(
        'Error scanning domain',
        error.message ? error.message : error,
      );
      return new Nack(false);
    }
  }
}
