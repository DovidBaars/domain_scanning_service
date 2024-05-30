import { Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ProductsServiceService } from './products_service.service';
import { Domain } from '@prisma/client';
import { DomainDto } from './domain.dto';

@Controller('domain')
export class ProductsServiceController {
  constructor(
    private readonly productsServiceService: ProductsServiceService,
  ) {}

  @Get()
  async getDomain(
    @Req() request: Request,
    @Query() { domain, interval }: DomainDto,
  ): Promise<Omit<Domain, 'id'> | string> {
    console.log('GET domain request:', domain, interval);

    try {
      const scanResults = await this.productsServiceService.handleDomainRequest(
        domain,
        request,
        interval,
      );

      console.log('Scan results:', scanResults);
      return (
        scanResults ||
        'Domain added to queue for scanning, please check back later.'
      );
    } catch (error) {
      console.error('Error getting domain:', error);
      return 'Error getting domain.';
    }
  }

  @Post()
  async addDomain(
    @Req() request: Request,
    @Query() { domain, interval }: DomainDto,
  ): Promise<string> {
    console.log('POST domain request:', domain, interval);

    try {
      const previouslyAdded =
        !!(await this.productsServiceService.handleDomainRequest(
          domain,
          request,
          interval,
        ));
      console.log('Previously added:', previouslyAdded);
      return previouslyAdded
        ? 'Domain previously added.'
        : 'Domain added to queue for scanning.';
    } catch (error) {
      console.error('Error adding domain:', error);
      return 'Error adding domain.';
    }
  }
}
