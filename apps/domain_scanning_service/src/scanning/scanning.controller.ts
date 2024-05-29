// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
// } from '@nestjs/common';
// import { ScanningService } from './scanning.service';
// import { CreateScanningDto } from './dto/create-scanning.dto';
// import { UpdateScanningDto } from './dto/update-scanning.dto';

// @Controller('scanning')
// export class ScanningController {
//   constructor(private readonly scanningService: ScanningService) {}

//   @Post()
//   create(@Body() createScanningDto: CreateScanningDto) {
//     return this.scanningService.create(createScanningDto);
//   }

//   @Get()
//   findAll() {
//     // return this.scanningService.findAll();
//     return 'Scanning';
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.scanningService.findOne(+id);
//   }

//   @Patch(':id')
//   update(
//     @Param('id') id: string,
//     @Body() updateScanningDto: UpdateScanningDto,
//   ) {
//     return this.scanningService.update(+id, updateScanningDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.scanningService.remove(+id);
//   }
// }
