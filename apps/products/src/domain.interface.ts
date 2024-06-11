import { Domain, Results, ScanApi } from '@prisma/client';

interface IExtendedResults extends Results {
  scanApi: ScanApi;
}

export interface IDomainRecord extends Domain {
  results: IExtendedResults[];
}
