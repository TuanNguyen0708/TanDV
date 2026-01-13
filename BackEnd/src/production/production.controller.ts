import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductionService } from './production.service';
import { CreateProductionDto } from './dto/create-production.dto';
import { UpdateQualityDto } from './dto/update-quality.dto';

@ApiTags('Productions')
@Controller('productions')
export class ProductionController {
  constructor(private readonly service: ProductionService) {}

  @Post()
  @ApiOperation({ summary: 'Create production' })
  create(@Body() dto: CreateProductionDto) {
    return this.service.create(dto);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get production status by date' })
  getStatus(@Query('date') date: string) {
    return this.service.getStatusByDate(date);
  }

  @Patch(':id/quality')
  @ApiOperation({ summary: 'Update quality & remark' })
  updateQuality(@Param('id') id: string, @Body() dto: UpdateQualityDto) {
    return this.service.updateQuality(id, dto);
  }
}
