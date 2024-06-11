export enum EXCHANGE {
  MAIN = 'dss-exchange',
  DEAD_LETTER = 'dead-letter-exchange',
}
export enum ROUTING_KEY {
  SCAN = 'scan',
  SCHEDULE = 'schedule',
}
export enum SCHEDULE_REGISTRY_TYPE {
  CRON = 'cron',
  TIMEOUT = 'timeout',
  INTERVAL = 'interval',
}
export const TYPE = 'topic';
