import { Injectable } from '@nestjs/common';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { validateMessage } from './message_validator';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { DomainDto } from 'apps/products/src/domain.dto';
import { ScheduleRequestDto } from './dto/scheduleRequest.dto';
import { PrismaService } from 'apps/scanning/src/prisma.service';

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

  async onModuleInit() {
    await this.restartCronJobsFromDb();
    this.printCronJobs();
  }

  private printCronJobs() {
    const jobs = this.schedulerRegistry.getCronJobs();
    console.log('Currently running cron jobs: ', jobs.size);
    jobs.forEach((value, key) => {
      console.log(`- ${key}`);
    });
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
      console.warn(`Job ${name} added with cron time: ${cronTime}`);
      updateDbCallback(name, cronTime);
    } catch (e) {
      console.error(`Job ${name} already exists`);
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
  })
  async create(msg: any) {
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
    }
  }
}