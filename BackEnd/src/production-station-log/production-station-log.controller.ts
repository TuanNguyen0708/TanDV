import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductionStationLogService } from './production-station-log.service';
import { UpdateStationTimeDto } from './dto/update-station-time.dto';
import { UpdateStationStatusDto } from './dto/update-station-status.dto';

@ApiTags('Production Station Logs')
@Controller('productions')
export class ProductionStationLogController {
  constructor(private readonly service: ProductionStationLogService) {}

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
}
