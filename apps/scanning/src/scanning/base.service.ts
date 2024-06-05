import { PrismaService } from '../prisma.service';

interface AccessLog {
  url: string;
  userAgent: string;
  method: string;
  interval?: number;
}

interface ServiceEntryLog {
  service: string;
  routingKey: string;
}

export class DSS_BaseService {
  constructor(protected readonly prisma: PrismaService) {}
  protected async logAccess(
    accessLog: AccessLog | ServiceEntryLog,
  ): Promise<void> {
    console.log('Logging access', accessLog);
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
    } catch (e) {
      console.error('Error logging access:', e);
    }
  }
}
