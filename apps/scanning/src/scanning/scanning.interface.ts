export type DomainScannerClientType = (
  domain: string,
  options: DomainScannerClientOptions,
  callback: DomainScannerClientCallback,
) => void;

export interface DomainScannerClientCbRes {
  data: { [key: string]: { response_code: number } };
  domain: string;
}

export type DomainScannerClientCallback = (
  err: string,
  res: DomainScannerClientCbRes,
) => void;

export interface DomainScannerClientOptions {
  keys: {
    [key: string]: string;
  };
}
