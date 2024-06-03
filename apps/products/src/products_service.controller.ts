import { Request, Response } from 'express';
import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';

import { DomainDto } from './domain.dto';
import { ProductsServiceService } from './products_service.service';

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
    await this.productsServiceService.addDomain(
      domain,
      request,
      response,
      interval,
    );
  }
}
