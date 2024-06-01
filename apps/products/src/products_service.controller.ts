import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { ProductsServiceService } from './products_service.service';
import { DomainDto } from './domain.dto';
import { Request, Response } from 'express';

@Controller('domain')
export class ProductsServiceController {
  constructor(
    private readonly productsServiceService: ProductsServiceService,
  ) {}

  @Get()
  async getDomain(
    @Req() request: Request,
    @Res() response: Response,
    @Query() { domain, interval }: DomainDto,
  ): Promise<void> {
    console.log('GET domain request:', domain, interval);
    return await this.productsServiceService.getDomainResults(
      domain,
      request,
      response,
      interval,
    );
  }

  @Post()
  async addDomain(
    @Req() request: Request,
    @Res() response: Response,
    @Query() { domain, interval }: DomainDto,
  ): Promise<void> {
    console.log('POST domain request:', domain, interval);
    await this.productsServiceService.addDomain(
      domain,
      request,
      response,
      interval,
    );
  }
}
