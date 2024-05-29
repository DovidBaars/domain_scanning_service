import { Injectable } from '@nestjs/common';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { validateMessage } from './message_validator';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { DomainDto } from 'apps/products_service/src/domain.dto';
import { PrismaService } from 'apps/domain_scanning_service/src/prisma.service';
import { last } from 'rxjs';

const DEFAULT_INTERVAL = 1;
const MAX_INTERVAL = 3;
const MIN_INTERVAL = 1;

@Injectable()
export class SchedulingServiceService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private amqpConnection: AmqpConnection,
    private readonly prisma: PrismaService,
  ) {}

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
    callback: () => void,
  ) {
    const cronJob = new CronJob(
      cronTime,
      callback,
      null,
      null,
      'UTC',
      null,
      true, // Start the job immediately only for dev
    );
    try {
      this.schedulerRegistry.addCronJob(name, cronJob);
      console.warn(`Job ${name} added with cron time: ${cronTime}`);
      this.addCronJobToDB(name, cronTime);
    } catch (e) {
      console.error(`Job ${name} already exists`);
    }
  }

  private async addMessageToQueue(domain: DomainDto['domain']) {
    console.log('Publishing message to queue', domain);
    await this.amqpConnection.publish('dss-exchange', 'scan', {
      domain,
    });
  }

  private async addCronJobToDB(domain: string, cronString: string) {
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
  })
  async handleScheduleRequest(msg: any) {
    const { domain, interval = DEFAULT_INTERVAL } = await validateMessage(msg);
    console.log('Received message 1:', domain, interval);
    this.addCronJobForDailyScanning(
      domain,
      this.generateDailyCronTime(interval),
      () => {
        this.addMessageToQueue(domain);
        this.addCronJobToDB(domain, '');
      },
    );

    console.log('Received message 2:', domain, interval);
  }
}
