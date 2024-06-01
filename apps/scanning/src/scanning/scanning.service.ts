import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { PrismaService } from '../prisma.service';
import { VirusTotalService } from './scanners/virus_total.service';
import { ScheduleRequestDto } from 'apps/scheduling/src/dto/scheduleRequest.dto';
import { validateMessage } from 'apps/scheduling/src/message_validator';
import { ScannerBase } from './scanners/scanner_base';

@Injectable()
export class ScanningService {
  private readonly scannerServices: ScannerBase[] = [];

  constructor(
    private readonly prisma: PrismaService,
    private virusTotalService: VirusTotalService,
  ) {}

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
    console.log('scanning service received message', msg);

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
