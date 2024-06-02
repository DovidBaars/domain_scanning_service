import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

import { PrismaService } from '../prisma.service';
import { DSS_BaseService } from './dss_base.service';
import { ScannerBase } from './scanners/scanner_base';
import { validateMessage } from '@scheduling/message_validator';
import { VirusTotalService } from './scanners/virus_total.service';
import { ScheduleRequestDto } from '@scheduling/dto/scheduleRequest.dto';

@Injectable()
export class ScanningService extends DSS_BaseService {
  private readonly scannerServices: ScannerBase[] = [];

  constructor(
    protected readonly prisma: PrismaService,
    private virusTotalService: VirusTotalService,
  ) {
    super(prisma);
  }

  async onModuleInit() {
    console.log('Scanning service initialized');
    this.initScanners();
  }

  private async initScanners() {
    this.scannerServices.push(this.virusTotalService);
    console.log('Initializing scanners', this.scannerServices.length);
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
  })
  async create(msg: any) {
    this.logAccess({ service: this.constructor.name, routingKey: 'scan.*' });
    try {
      const { domain, domainId } = await validateMessage(
        msg,
        ScheduleRequestDto,
      );

      for (const scannerService of this.scannerServices) {
        const { scanApiId, result } = await this.scanDomain(
          domain,
          scannerService,
        );

        await this.prisma.results.upsert({
          create: {
            domainId,
            scanApiId: scanApiId,
            results: JSON.stringify(result),
          },
          where: {
            domainId_scanApiId: {
              domainId,
              scanApiId: scanApiId,
            },
          },
          update: { results: JSON.stringify(result) },
        });
      }
    } catch (error) {
      console.error('Error scanning domain', error);
      return;
    }
  }
}
