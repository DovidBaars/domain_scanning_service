import { Domain } from '@prisma/client';
import { Injectable, HttpStatus } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Response, Request } from 'express';

import { IDomainRecord } from './domain.interface';
import { PrismaService } from '@scanning/prisma.service';
import { ScheduleRequestDto } from '@apps/scheduling/src/dto/request.dto';
import { DSS_BaseService } from '@apps/scanning/src/scanning/base.service';
import { EXCHANGE, ROUTING_KEY } from '@apps/constants/message-queue';
import { API_RESPONSE } from '@apps/constants/api';
import { ERROR_MESSAGE } from '@apps/constants/errors';

@Injectable()
export class ProductsServiceService extends DSS_BaseService {
  domainRecords: IDomainRecord[] = [];
  constructor(
    private readonly amqpConnection: AmqpConnection,
    protected readonly prisma: PrismaService,
  ) {
    super(prisma);
  }

  private async findDomainInDb(
    domain: string,
    extended: boolean,
  ): Promise<IDomainRecord> {
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
    })) as IDomainRecord | null;
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
    const scanScheduleMessage: ScheduleRequestDto = {
      domain: domain.url,
      domainId: domain.id,
      interval: domain.interval,
    };
    return await this.amqpConnection.publish(
      EXCHANGE.MAIN,
      `${ROUTING_KEY.SCAN}.${ROUTING_KEY.SCHEDULE}`,
      scanScheduleMessage,
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
      const domainData: IDomainRecord = await this.findDomainInDb(
        domain,
        false,
      );

      if (domainData) {
        response.status(HttpStatus.CONFLICT).send(API_RESPONSE.DOMAIN_CONFLICT);
        return;
      }

      const domainRecord = await this.addDomainToDb(domain, interval);
      if (!domainRecord || !(await this.addScanReqToQueue(domainRecord))) {
        response
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send(API_RESPONSE.ADD_DOMAIN_ERROR);
        return;
      }
      response.status(HttpStatus.ACCEPTED).send(API_RESPONSE.ADD_DOMAIN);
      return;
    } catch (error) {
      console.error(ERROR_MESSAGE.GET, error);
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(API_RESPONSE.ADD_DOMAIN_ERROR);
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
      const domainData: IDomainRecord = await this.findDomainInDb(domain, true);

      if (domainData?.['results'].length > 0) {
        response.status(HttpStatus.OK).json(domainData);
        return;
      }

      if (domainData) {
        response.status(HttpStatus.NOT_FOUND).send(API_RESPONSE.GET_NO_RESULTS);
        return;
      }

      const domainRecord = await this.addDomainToDb(domain, interval);
      if (!domainRecord || !(await this.addScanReqToQueue(domainRecord))) {
        response
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send(API_RESPONSE.ADD_DOMAIN_ERROR);
        return;
      }
      response.status(HttpStatus.ACCEPTED).send(API_RESPONSE.GET_NEW_DOMAIN);
      return;
    } catch (error) {
      console.error(ERROR_MESSAGE.GET, error);
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(API_RESPONSE.GET_DOMAIN_ERROR);
    }
  }
}
