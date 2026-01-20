import { PartialType } from '@nestjs/mapped-types';
import { CreateProductionStatusDto } from './create-production-status.dto';

export class UpdateProductionStatusDto extends PartialType(
  CreateProductionStatusDto,
) {}
