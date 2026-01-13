import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductionsService } from './productions.service';
import { CreateProductionDto } from './dto/create-production.dto';
import { UpdateStationTimeDto } from './dto/update-station-time.dto';
import { UpdateStationStatusDto } from './dto/update-station-status.dto';
import { UpdateQualityDto } from './dto/update-quality.dto';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';

@ApiTags('Productions')
@Controller('productions')
export class ProductionsController {
  constructor(private readonly service: ProductionsService) {}

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

  @Get('station-status')
  @ApiOperation({ summary: 'Get station status by date' })
  getStationStatus(@Query('date') date: string) {
    return this.service.getStationStatusByDate(date);
  }

  @Put(':productionId/stations/:stationId/time')
  @ApiOperation({ summary: 'Update station time' })
  updateStationTime(
    @Param('productionId') productionId: string,
    @Param('stationId') stationId: string,
    @Body() dto: UpdateStationTimeDto,
  ) {
    return this.service.updateStationTime(productionId, stationId, dto);
  }

  @Put(':productionId/stations/:stationId/status')
  @ApiOperation({ summary: 'Update station status' })
  updateStationStatus(
    @Param('productionId') productionId: string,
    @Param('stationId') stationId: string,
    @Body() dto: UpdateStationStatusDto,
  ) {
    return this.service.updateStationStatus(productionId, stationId, dto);
  }

  @Put('stations/:stationId/status')
  @ApiOperation({ summary: 'Update station status by date' })
  updateStationStatusByDate(
    @Param('stationId') stationId: string,
    @Query('date') date: string,
    @Body() dto: UpdateStationStatusDto,
  ) {
    return this.service.updateStationStatusByDate(date, stationId, dto);
  }

  @Patch(':id/quality')
  @ApiOperation({ summary: 'Update quality & remark' })
  updateQuality(@Param('id') id: string, @Body() dto: UpdateQualityDto) {
    return this.service.updateQuality(id, dto);
  }

  // Station management endpoints
  @Get('stations')
  @ApiOperation({ summary: 'Get all stations' })
  getAllStations() {
    return this.service.getAllStations();
  }

  @Get('stations/:id')
  @ApiOperation({ summary: 'Get station by id' })
  getStationById(@Param('id') id: string) {
    return this.service.getStationById(id);
  }

  @Post('stations')
  @ApiOperation({ summary: 'Create new station' })
  createStation(@Body() dto: CreateStationDto) {
    return this.service.createStation(dto);
  }

  @Put('stations/:id')
  @ApiOperation({ summary: 'Update station' })
  updateStation(@Param('id') id: string, @Body() dto: UpdateStationDto) {
    return this.service.updateStation(id, dto);
  }

  @Delete('stations/:id')
  @ApiOperation({ summary: 'Delete station' })
  deleteStation(@Param('id') id: string) {
    return this.service.deleteStation(id);
  }
}
