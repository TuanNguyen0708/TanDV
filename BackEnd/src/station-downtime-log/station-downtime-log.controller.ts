import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { StationDowntimeLogService } from './station-downtime-log.service';
import { CreateStationDowntimeLogDto } from './dto/create-station-downtime-log.dto';
import { UpdateStationDowntimeLogDto } from './dto/update-station-downtime-log.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Station Downtime Log')
@Controller('station-downtime-log')
export class StationDowntimeLogController {
  constructor(
    private readonly stationDowntimeLogService: StationDowntimeLogService,
  ) {}

  @Post()
  create(@Body() createDto: CreateStationDowntimeLogDto) {
    return this.stationDowntimeLogService.create(createDto);
  }

  @Get()
  findAll() {
    return this.stationDowntimeLogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stationDowntimeLogService.findOne(id);
  }

  @Get('station-daily/:stationDailyId')
  findByStationDaily(@Param('stationDailyId') stationDailyId: string) {
    return this.stationDowntimeLogService.findByStationDaily(stationDailyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateStationDowntimeLogDto,
  ) {
    return this.stationDowntimeLogService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stationDowntimeLogService.remove(id);
  }
}
