import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ProductsServiceService } from './products_service.service';
import { Domain } from '@prisma/client';

@Controller('domain')
export class ProductsServiceController {
  constructor(
    private readonly productsServiceService: ProductsServiceService,
  ) {}

  @Get(':domain')
  async getDomain(
    @Req() request: Request,
    @Param('domain') domain: string,
    @Query('interval', new ParseIntPipe({ optional: true })) interval: number,
  ): Promise<Domain | string> {
    this.productsServiceService.logAccess(
      domain,
      new Date(),
      request,
      interval,
    );
    const scanResults = await this.productsServiceService.handleDomainRequest(
      domain,
      interval,
    );
    return (
      scanResults ||
      'Domain added to queue for scanning, please check back later.'
    );
  }

  @Post(':domain')
  async addDomain(
    @Req() request: Request,
    @Param('domain') domain: string,
    @Query('interval', new ParseIntPipe({ optional: true })) interval: number,
  ): Promise<string> {
    this.productsServiceService.logAccess(
      domain,
      new Date(),
      request,
      interval,
    );
    const addResults = await this.productsServiceService.handleDomainRequest(
      domain,
      interval,
    );
    if (addResults)
      return (
        'Domain previously added with interval of ' + addResults.interval + '.'
      );
  }
}
