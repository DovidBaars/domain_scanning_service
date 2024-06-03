import { Injectable } from '@nestjs/common';
import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

import { PrismaService } from '../prisma.service';
import { DSS_BaseService } from './dss_base.service';
import { ScannerBase } from './scanners/scanner_base.service';
import { PolyswarmService } from './scanners/polyswarm.service';
import { validateMessage } from '@scheduling/message_validator';
import { VirusTotalService } from './scanners/virus_total.service';
import { ScheduleRequestDto } from '@scheduling/dto/scheduleRequest.dto';

@Injectable()
export class ScanningService extends DSS_BaseService {
  private readonly scannerServices: ScannerBase[] = [];

  constructor(
    protected readonly prisma: PrismaService,
    private virusTotalService: VirusTotalService,
    private polyswarmService: PolyswarmService,
  ) {
    super(prisma);
  }

  async onModuleInit() {
    this.initScanners();
  }

  private async initScanners() {
    this.scannerServices.push(this.virusTotalService, this.polyswarmService);
  }

  private async scanDomain(
    domain: string,
    scannerService: ScannerBase,
  ): Promise<{ result: object; scanApiId: number }> {
    const result = await scannerService.scan(domain);
    const { scanApiId } = await scannerService.upsertToScannerDb();
    return { result, scanApiId };
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
      const { domain, domainId } = await validateMessage(
        msg,
        ScheduleRequestDto,
      );

      for (const scannerService of this.scannerServices) {
        const scanner: ScannerBase = scannerService;
        try {
          const { scanApiId, result } = await this.scanDomain(domain, scanner);

          await this.prisma.results.upsert({
            create: {
              domainId,
              scanApiId: scanApiId,
              results: JSON.stringify(result),
            },
            where: {
              domainId_scanApiId: {
                domainId,
                scanApiId,
              },
            },
            update: { results: JSON.stringify(result) },
          });
        } catch (error: any) {
          throw new Error(error.message + `: ${scanner.constructor.name}`);
        }
      }
    } catch (error: any) {
      console.error(
        'Error scanning domain',
        error.message ? error.message : error,
      );
      return new Nack(false);
    }
  }
}
