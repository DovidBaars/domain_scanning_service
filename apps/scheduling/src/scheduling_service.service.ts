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
import { DSS_BaseService } from '@scanning/scanning/dss_base.service';

const DEFAULT_INTERVAL = 1;
const MAX_INTERVAL = 3;
const MIN_INTERVAL = 1;

@Injectable()
export class SchedulingServiceService extends DSS_BaseService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private amqpConnection: AmqpConnection,
    protected readonly prisma: PrismaService,
  ) {
    super(prisma);
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

  private validateTimesPerDay(timesPerDay: number) {
    return Math.max(MIN_INTERVAL, Math.min(timesPerDay, MAX_INTERVAL));
  }

  private generateDailyCronTime(timesPerDay: number) {
    timesPerDay = this.validateTimesPerDay(timesPerDay);

    const hours = new Set<number>();
    while (hours.size < timesPerDay) {
      const hour = Math.floor(Math.random() * 24);
      hours.add(hour);
    }

    return `0 ${Array.from(hours).join(',')} * * *`;
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
        this.generateDailyCronTime(interval),
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
