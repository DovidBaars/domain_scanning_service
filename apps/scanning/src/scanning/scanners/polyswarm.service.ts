import { firstValueFrom, map } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { ScannerBase } from './scanner_base.service';
import { PrismaService } from '../../prisma.service';
import { VirusTotalDomain } from './dto/virus_total_domain.interface';

@Injectable()
export class PolyswarmService extends ScannerBase {
  constructor(
    private httpService: HttpService,
    prisma: PrismaService,
  ) {
    super(
      '4050afde73665f3b30cedfc49aea998c',
      'https://api.polyswarm.network/v3/search',
      prisma,
    );
  }

  public async scan(domain: string) {
    const url = new URL(domain);
    const transformedDomain = url.hostname;
    const results: VirusTotalDomain = await firstValueFrom(
      this.httpService
        .get(`${this.apiUrl}/url`, {
          headers: {
            Authorization: this.scannerApiKey,
          },
          params: {
            url: transformedDomain,
            community: 'default',
          },
        })
        .pipe(map((response) => response.data)),
    );
    console.log('results: ', !!results);
    if (!results) {
      throw new Error('No results from Polyswarm');
    }
    return results;
  }
}
