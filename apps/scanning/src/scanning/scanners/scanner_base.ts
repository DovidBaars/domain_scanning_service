import { PrismaService } from '../../prisma.service';
import { VirusTotalDomain } from './dto/virus_total_domain.interface';

export abstract class ScannerBase {
  readonly scannerApiKey: string;
  readonly apiUrl: string;
  constructor(
    key: string,
    api: string,
    private readonly prisma: PrismaService,
  ) {
    this.scannerApiKey = key;
    this.apiUrl = api;
  }

  abstract scan(url: string): Promise<object | VirusTotalDomain>;

  async upsertToScannerDb() {
    return await this.prisma.scanApi.upsert({
      where: { api: this.apiUrl },
      update: { lastRun: new Date() },
      create: { api: this.apiUrl, lastRun: new Date() },
    });
  }
}
