import {
  AmqpConnection,
  Nack,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { CronJob } from 'cron';
import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

import {
  HOURLY_INTERVAL,
  MIN_INTERVAL,
  DEFAULT_INTERVAL,
} from '@apps/constants/cron-interval';
import {
  EXCHANGE,
  ROUTING_KEY,
  SCHEDULE_REGISTRY_TYPE,
} from '@apps/constants/message-queue';
import { DomainDto } from '@products/domain.dto';
import { validateMessage } from './message-validator';
import { ScheduleRequestDto } from './dto/request.dto';
import { ERROR_MESSAGE } from '@apps/constants/errors';
import { PrismaService } from '@scanning/prisma.service';
import { DSS_BaseService } from '@apps/scanning/src/scanning/base.service';

@Injectable()
export class SchedulingServiceService extends DSS_BaseService {
  private readonly intervalGenerator: (timesPerDay: number) => string;
  private readonly maxInterval = HOURLY_INTERVAL;
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private amqpConnection: AmqpConnection,
    protected readonly prisma: PrismaService,
  ) {
    super(prisma);
    this.intervalGenerator = this.hoursInDayCronStringIntervalGenerator;
  }

  async onModuleInit(): Promise<void> {
    await this.restartCronJobsFromDb();
  }

  private async restartCronJobsFromDb(): Promise<void> {
    const cronTasks = await this.prisma.cronTask.findMany();
    for (const task of cronTasks) {
      if (
        this.schedulerRegistry.doesExist(SCHEDULE_REGISTRY_TYPE.CRON, task.url)
      ) {
        continue;
      }
      this.addCronJobForDailyScanning(task.url, task.cronString, () => {
        this.addMessageToScanningQueue(task.url);
        this.upsertCronJobToDB(task.url);
      });
    }
  }

  private validateIntervalBetweenMinMax(timesPerDay: number): number {
    return Math.max(MIN_INTERVAL, Math.min(timesPerDay, this.maxInterval));
  }

  private hoursInDayCronStringIntervalGenerator(timesPerDay: number): string {
    const hours = new Set<number>();
    while (hours.size < timesPerDay) {
      hours.add(Math.floor(Math.random() * this.maxInterval));
    }
    return `0 ${[...hours].join(',')} * * *`;
  }

  private generateCronTimeFromInterval(interval: number): string {
    interval = this.validateIntervalBetweenMinMax(interval);
    return this.intervalGenerator(interval);
  }

  private addCronJobForDailyScanning(
    name: string,
    cronTime: string,
    cronJobCallback: () => void,
    updateDatabaseCallback?: (name: string, cronTime: string) => void,
  ): void {
    const cronJob = new CronJob(
      cronTime,
      cronJobCallback,
      undefined,
      undefined,
      'UTC',
    );
    try {
      this.schedulerRegistry.addCronJob(name, cronJob);
      updateDatabaseCallback?.(name, cronTime);
    } catch (error) {
      console.error(`Job ${name} threw an error: ${error}`);
    }
  }

  private async addMessageToScanningQueue(
    domain: DomainDto['domain'],
  ): Promise<void> {
    await this.amqpConnection.publish(EXCHANGE.MAIN, ROUTING_KEY.SCAN, {
      domain,
    });
  }

  private async upsertCronJobToDB(
    domain: string,
    cronString: string = '',
  ): Promise<void> {
    await this.prisma.cronTask.upsert({
      create: {
        url: domain,
        cronString,
      },
      update: {
        lastRun: new Date(),
      },
      where: { url: domain },
    });
  }

  @RabbitSubscribe({
    exchange: EXCHANGE.MAIN,
    routingKey: `*.${ROUTING_KEY.SCHEDULE}`,
    queueOptions: {
      durable: true,
      deadLetterExchange: EXCHANGE.DEAD_LETTER,
    },
  })
  async create(message: ScheduleRequestDto): Promise<Nack | void> {
    this.logAccess({
      service: this.constructor.name,
      routingKey: `*.${ROUTING_KEY.SCHEDULE}`,
    });
    try {
      const { domain, interval = DEFAULT_INTERVAL } = await validateMessage(
        message,
        ScheduleRequestDto,
      );
      this.addCronJobForDailyScanning(
        domain,
        this.generateCronTimeFromInterval(interval),
        () => {
          this.addMessageToScanningQueue(domain);
          this.upsertCronJobToDB(domain);
        },
        (domainForUpsert, cronStringForUpsert) =>
          this.upsertCronJobToDB(domainForUpsert, cronStringForUpsert),
      );
    } catch (error) {
      console.error(ERROR_MESSAGE.SCHEDULING, error);
      return new Nack(false);
    }
  }
}
