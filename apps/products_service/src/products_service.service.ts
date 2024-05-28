import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { PrismaService } from 'apps/domain_scanning_service/src/prisma.service';
import { Domain } from '@prisma/client';

@Injectable()
export class ProductsServiceService {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly prisma: PrismaService,
  ) {}

  private async findDomainInDb(domain: string): Promise<Domain> {
    return await this.prisma.domain.findUnique({
      where: { url: domain },
    });
  }

  private async addDomainToDb(
    domain: Domain['url'],
    interval: Domain['interval'],
  ): Promise<boolean> {
    return !!(await this.prisma.domain.create({
      data: {
        url: domain,
        interval,
      },
    }));
  }

  private async addScanReqToQueue(
    domain: Domain['url'],
    interval: Domain['interval'],
  ): Promise<boolean> {
    return await this.amqpConnection.publish('dss-exchange', 'scan.schedule', {
      domain,
      interval,
    });
  }

  private logAccess(domain: string, request: Request, interval?: number): void {
    this.prisma.accessLogs.create({
      data: {
        domain,
        timestamp: new Date(),
        userAgent: request.headers['user-agent'],
        method: request.method,
        interval,
      },
    });
  }

  public async handleDomainRequest(
    domain: string,
    request: Request,
    interval?: number,
  ): Promise<Omit<Domain, 'id'>> {
    console.log('Handling domain request');
    this.logAccess(domain, request, interval);

    let domainData: Domain = null;
    domainData = await this.findDomainInDb(domain);
    if (domainData) {
      delete domainData.id;
      return domainData;
    }
    console.log('Domain not found in DB, adding...');

    if (
      !(await this.addDomainToDb(domain, interval)) ||
      !(await this.addScanReqToQueue(domain, interval))
    )
      throw new Error('Error adding domain.');
  }
}
