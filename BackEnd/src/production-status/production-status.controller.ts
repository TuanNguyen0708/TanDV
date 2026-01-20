import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProductionStatusService } from './production-status.service';
import { CreateProductionStatusDto } from './dto/create-production-status.dto';
import { UpdateProductionStatusDto } from './dto/update-production-status.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Production Status')
@Controller('production-status')
export class ProductionStatusController {
  constructor(
    private readonly productionStatusService: ProductionStatusService,
  ) {}

  @Post()
  create(@Body() createDto: CreateProductionStatusDto) {
    return this.productionStatusService.create(createDto);
  }

  @Get()
  findAll() {
    return this.productionStatusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productionStatusService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductionStatusDto,
  ) {
    return this.productionStatusService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productionStatusService.remove(id);
  }
}
