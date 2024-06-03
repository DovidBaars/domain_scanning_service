import { Domain } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Response, Request } from 'express';

import { DomainRecord } from './domain.interface';
import { PrismaService } from '@scanning/prisma.service';
import { DSS_BaseService } from '@scanning/scanning/dss_base.service';
import { ScheduleRequestDto } from '@scheduling/dto/scheduleRequest.dto';

@Injectable()
export class ProductsServiceService extends DSS_BaseService {
  domainRecords: DomainRecord[] = [];
  constructor(
    private readonly amqpConnection: AmqpConnection,
    protected readonly prisma: PrismaService,
  ) {
    super(prisma);
  }

  private async findDomainInDb(
    domain: string,
    extended: boolean,
  ): Promise<DomainRecord> {
    const domainRecord = (await this.prisma.domain.findUnique({
      where: { url: domain },
      include: {
        results: extended
          ? {
              include: {
                scanApi: true,
              },
            }
          : undefined,
      },
    })) as DomainRecord | null;
    if (domainRecord) {
      this.domainRecords.push(domainRecord);
    }
    return domainRecord;
  }

  private async addDomainToDb(url: string, interval: number): Promise<Domain> {
    return await this.prisma.domain.create({
      data: {
        url,
        interval,
      },
    });
  }

  private async addScanReqToQueue(domain: Domain): Promise<boolean> {
    const scanScheduleMsg: ScheduleRequestDto = {
      domain: domain.url,
      domainId: domain.id,
      interval: domain.interval,
    };
    return await this.amqpConnection.publish(
      'dss-exchange',
      'scan.schedule',
      scanScheduleMsg,
    );
  }

  public async addDomain(
    domain: string,
    request: Request,
    response: Response,
    interval?: number,
  ): Promise<void> {
    this.logAccess({
      url: domain,
      userAgent: request.headers['user-agent'],
      method: request.method,
      interval,
    });

    try {
      const domainData: DomainRecord = await this.findDomainInDb(domain, false);

      if (domainData) {
        response.status(404).send('Domain is already in our system.');
        return;
      }

      const domainRecord = await this.addDomainToDb(domain, interval);
      if (!domainRecord || !(await this.addScanReqToQueue(domainRecord))) {
        response.status(500).send('Error adding domain.');
        return;
      }
      response.status(202).send('Domain added.');
      return;
    } catch (e) {
      console.error('Error getting domain:', e);
      response.status(500).send('Error adding domain.');
    }
  }

  public async getDomainResults(
    domain: string,
    request: Request,
    response: Response,
    interval?: number,
  ): Promise<void> {
    this.logAccess({
      url: domain,
      userAgent: request.headers['user-agent'],
      method: request.method,
      interval,
    });
    try {
      const domainData: DomainRecord = await this.findDomainInDb(domain, true);

      if (domainData?.['results'].length > 0) {
        response.status(200).json(domainData);
        return;
      }

      if (domainData) {
        response
          .status(404)
          .send(
            'Domain found in DB, but no records found. Please check back later.',
          );
        return;
      }

      const domainRecord = await this.addDomainToDb(domain, interval);
      if (!domainRecord || !(await this.addScanReqToQueue(domainRecord))) {
        response.status(500).send('Error adding domain.');
        return;
      }
      response
        .status(202)
        .send('Domain added to queue for scanning, please check back later.');
      return;
    } catch (e) {
      console.error('Error getting domain:', e);
      response.status(500).send('Error getting domain.');
    }
  }
}
