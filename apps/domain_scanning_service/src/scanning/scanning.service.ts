import { Injectable } from '@nestjs/common';
import { CreateScanningDto } from './dto/create-scanning.dto';
import { UpdateScanningDto } from './dto/update-scanning.dto';

@Injectable()
export class ScanningService {
  create(createScanningDto: CreateScanningDto) {
    return 'This action adds a new scanning';
  }

  findAll() {
    return `This action returns all scanning`;
  }

  findOne(id: number) {
    return `This action returns a #${id} scanning`;
  }

  update(id: number, updateScanningDto: UpdateScanningDto) {
    return `This action updates a #${id} scanning`;
  }

  remove(id: number) {
    return `This action removes a #${id} scanning`;
  }
}
