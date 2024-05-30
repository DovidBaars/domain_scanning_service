import { PrismaService } from '../../prisma.service';

export class ScannerBase {
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
  async upsertToScannerDb() {
    return await this.prisma.scanApi.upsert({
      where: { api: this.apiUrl },
      update: { lastRun: new Date() },
      create: { api: this.apiUrl, lastRun: new Date() },
    });
  }
}
