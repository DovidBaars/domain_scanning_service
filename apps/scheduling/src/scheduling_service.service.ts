import {
  AmqpConnection,
  Nack,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { CronJob } from 'cron';
import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

import { DomainDto } from '@products/domain.dto';
import { validateMessage } from './message_validator';
import { PrismaService } from '@scanning/prisma.service';
import { ScheduleRequestDto } from './dto/scheduleRequest.dto';
import { DSS_BaseService } from '@apps/scanning/src/scanning/base.service';

const DEFAULT_INTERVAL = 1;
const HOURLY_INTERVAL = 24;
const MIN_INTERVAL = 1;

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

  async onModuleInit() {
    await this.restartCronJobsFromDb();
  }

  private async restartCronJobsFromDb() {
    const cronTasks = await this.prisma.cronTask.findMany();
    for (const task of cronTasks) {
      if (this.schedulerRegistry.doesExist('cron', task.url)) {
        continue;
      }
      this.addCronJobForDailyScanning(task.url, task.cronString, () => {
        this.addMessageToQueue(task.url);
        this.upsertCronJobToDB(task.url);
      });
    }
  }

  private validateIntervalBetweenMinMax(timesPerDay: number) {
    return Math.max(MIN_INTERVAL, Math.min(timesPerDay, this.maxInterval));
  }

  private hoursInDayCronStringIntervalGenerator(timesPerDay: number) {
    const hours = new Set<number>();
    while (hours.size < timesPerDay) {
      hours.add(Math.floor(Math.random() * this.maxInterval));
    }
    return `0 ${Array.from(hours).join(',')} * * *`;
  }

  private generateCronTimeFromInterval(interval: number) {
    interval = this.validateIntervalBetweenMinMax(interval);
    return this.intervalGenerator(interval);
  }

  private addCronJobForDailyScanning(
    name: string,
    cronTime: string,
    cronJobCallback: () => void,
    updateDbCallback?: (name: string, cronTime: string) => void,
  ) {
    const cronJob = new CronJob(cronTime, cronJobCallback, null, null, 'UTC');
    try {
      this.schedulerRegistry.addCronJob(name, cronJob);
      updateDbCallback?.(name, cronTime);
    } catch (e) {
      console.error(`Job ${name} threw an error: ${e}`);
    }
  }

  private async addMessageToQueue(domain: DomainDto['domain']) {
    await this.amqpConnection.publish('dss-exchange', 'scan', {
      domain,
    });
  }

  private async upsertCronJobToDB(domain: string, cronString: string = '') {
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
    exchange: 'dss-exchange',
    routingKey: '*.schedule',
    queueOptions: {
      durable: true,
      deadLetterExchange: 'dead-letter-exchange',
    },
  })
  async create(msg: any) {
    this.logAccess({
      service: this.constructor.name,
      routingKey: '*.schedule',
    });
    try {
      const { domain, interval = DEFAULT_INTERVAL } = await validateMessage(
        msg,
        ScheduleRequestDto,
      );
      this.addCronJobForDailyScanning(
        domain,
        this.generateCronTimeFromInterval(interval),
        () => {
          this.addMessageToQueue(domain);
          this.upsertCronJobToDB(domain);
        },
        (domainForUpsert, cronStringForUpsert) =>
          this.upsertCronJobToDB(domainForUpsert, cronStringForUpsert),
      );
    } catch (error) {
      console.error('Error scheduling domain:', error);
      return new Nack(false);
    }
  }
}
