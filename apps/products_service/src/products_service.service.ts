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

  async findDomain(domain: string): Promise<Domain> {
    return await this.prisma.domain.findUnique({
      where: { url: domain },
    });
  }

  addDomain(domain: string, interval: number): void {
    this.addDomainToDb(domain, interval);
    this.addScanReqToQueue(domain, interval);
  }

  async handleDomainRequest(
    domain: string,
    interval?: number,
  ): Promise<Domain> {
    let domainData: Domain = null;
    domainData = await this.findDomain(domain);
    if (domainData) {
      return domainData;
    }
    this.addDomain(domain, interval);
  }

  addDomainToDb(domain: string, interval: number): void {
    this.prisma.domain.create({
      data: {
        url: domain,
        interval,
      },
    });
  }

  addScanReqToQueue(domain: string, interval: number): string {
    this.amqpConnection.publish('dss-exchange', 'dss-key', { domain });
    return `Domain ${domain} added!`;
  }

  logAccess(
    domain: string,
    timestamp: Date,
    request: Request,
    interval?: number,
  ): void {
    this.prisma.accessLogs.create({
      data: {
        domain,
        timestamp,
        userAgent: request.headers['user-agent'],
        method: request.method,
        interval,
      },
    });
  }
}
