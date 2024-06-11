import { ERROR_MESSAGE } from '@apps/constants/errors';
import { PrismaService } from '../prisma.service';
import { LOG } from '@apps/constants/log';

interface IAccessLog {
  url: string;
  userAgent: string;
  method: string;
  interval?: number;
}

interface IServiceEntryLog {
  service: string;
  routingKey: string;
}

export class DSS_BaseService {
  constructor(protected readonly prisma: PrismaService) {}
  protected async logAccess(
    accessLog: IAccessLog | IServiceEntryLog,
  ): Promise<void> {
    console.log(LOG.ACCESS, accessLog);
    try {
      if ('service' in accessLog) {
        const { service, routingKey } = accessLog;
        await this.prisma.serviceEntryLogs.create({
          data: {
            service: service,
            routingKey: routingKey,
            timestamp: new Date(),
          },
        });
        return;
      }

      const { url, userAgent, method, interval } = accessLog;
      await this.prisma.accessLogs.create({
        data: {
          url,
          timestamp: new Date(),
          userAgent,
          method,
          interval,
        },
      });
    } catch (error) {
      console.error(ERROR_MESSAGE.ACCESS_LOG, error);
    }
  }
}
