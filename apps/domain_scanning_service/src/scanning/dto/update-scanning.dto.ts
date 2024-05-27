import { PartialType } from '@nestjs/mapped-types';
import { CreateScanningDto } from './create-scanning.dto';

export class UpdateScanningDto extends PartialType(CreateScanningDto) {}
