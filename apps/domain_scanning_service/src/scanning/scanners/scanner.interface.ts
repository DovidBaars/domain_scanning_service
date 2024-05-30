export interface Scanner<T> {
  scan(url: string): Promise<T | { error: string }>;
  upsertToScannerDb(): Promise<{
    scanApiId: number;
    api: string;
    lastRun: Date;
  }>;
}
