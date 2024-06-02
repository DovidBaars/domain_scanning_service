import { firstValueFrom, map } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { ScannerBase } from './scanner_base';
import { PrismaService } from '../../prisma.service';
import { VirusTotalDomain } from './dto/virus_total_domain.interface';

@Injectable()
export class VirusTotalService extends ScannerBase {
  constructor(
    private httpService: HttpService,
    prisma: PrismaService,
  ) {
    super(
      '874bfa1a8cb9e2820a1c026817b56a38dcbb3f4604135a1e38685447fc529a5f',
      'https://www.virustotal.com/api/v3/domains',
      prisma,
    );
  }

  public async scan(domain: string) {
    // try {
    const url = new URL(domain);
    const transformedDomain = url.hostname;
    const results: VirusTotalDomain = await firstValueFrom(
      this.httpService
        .get(`${this.apiUrl}/${transformedDomain}`, {
          headers: {
            'x-apikey': this.scannerApiKey,
          },
        })
        .pipe(map((response) => response.data)),
    );
    return results;
    // } catch (err) {
    //   console.error('Error scanning domain:', err);
    //   return new Error(err instanceof Error ? err.message : err);
    // }
  }
}
