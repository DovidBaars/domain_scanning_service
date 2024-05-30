import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { PrismaService } from '../prisma.service';
import { validateMessage } from 'apps/scheduling_service/src/message_validator';
import { Scanner } from './scanners/scanner.interface';
import { VirusTotalService } from './scanners/virus_total.service';
import { ScheduleRequestDto } from 'apps/scheduling_service/src/dto/scheduleRequest.dto';

@Injectable()
export class ScanningService {
  private readonly scannerServices: Scanner<any>[] = [];

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
    scannerService: Scanner<any>,
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
        const { result, scanApiId } = await this.scanDomain(
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
      console.error('Error scanning domain.', error.code);
    }
  }
}
