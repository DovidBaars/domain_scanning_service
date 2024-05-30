import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { PrismaService } from 'apps/domain_scanning_service/src/prisma.service';
import { Domain } from '@prisma/client';
import { ScheduleRequestDto } from 'apps/scheduling_service/src/dto/scheduleRequest.dto';

@Injectable()
export class ProductsServiceService {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly prisma: PrismaService,
  ) {}

  private async findDomainInDb(domain: string): Promise<Domain> {
    return await this.prisma.domain.findUnique({
      where: { url: domain },
      include: {
        results: {
          include: {
            scanApi: true,
          },
        },
      },
    });
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
    console.log('Publishing message to queue');
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

  private async logAccess(
    domain: string,
    request: Request,
    interval?: number,
  ): Promise<void> {
    console.log('Logging access');
    try {
      await this.prisma.accessLogs.create({
        data: {
          url: domain,
          timestamp: new Date(),
          userAgent: request.headers['user-agent'],
          method: request.method,
          interval,
        },
      });
    } catch (e) {
      console.error('Error logging access:', e);
    }
  }

  public async handleDomainRequest(
    domain: string,
    request: Request,
    interval?: number,
  ): Promise<Omit<Domain, 'id'>> {
    console.log('Handling domain request');
    this.logAccess(domain, request, interval);

    const domainData: Domain = await this.findDomainInDb(domain);
    console.log('Domain data:', domainData);
    if (domainData) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = domainData;
      console.log('Domain found in DB');
      return rest;
    }
    console.log('Domain not found in DB, adding...');

    const domainRecord = await this.addDomainToDb(domain, interval);

    if (!domainRecord || !(await this.addScanReqToQueue(domainRecord)))
      throw new Error('Error adding domain.');
  }
}
