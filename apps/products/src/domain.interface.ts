import { Domain, Results, ScanApi } from '@prisma/client';

interface ExtendedResults extends Results {
  scanApi: ScanApi;
}

export interface DomainRecord extends Domain {
  results: ExtendedResults[];
}
