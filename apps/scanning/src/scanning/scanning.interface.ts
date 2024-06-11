export type DomainScannerClientType = (
  domain: string,
  options: IDomainScannerClientOptions,
  callback: DomainScannerClientCallback,
) => void;

export interface IDomainScannerClientCallbackResponse {
  data: { [key: string]: { response_code: number } };
  domain: string;
}

export type DomainScannerClientCallback = (
  error: string,
  response: IDomainScannerClientCallbackResponse,
) => void;

export interface IDomainScannerClientOptions {
  keys: {
    [key: string]: string;
  };
}

export interface IScanClientApi {
  id: number;
  name: string;
}
