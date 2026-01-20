import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { StationDailyStatusService } from './station-daily-status.service';
import { CreateStationDailyStatusDto } from './dto/create-station-daily-status.dto';
import { UpdateStationDailyStatusDto } from './dto/update-station-daily-status.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Station Daily Status')
@Controller('station-daily-status')
export class StationDailyStatusController {
  constructor(
    private readonly stationDailyStatusService: StationDailyStatusService,
  ) {}

  @Post()
  create(@Body() createDto: CreateStationDailyStatusDto) {
    return this.stationDailyStatusService.create(createDto);
  }

  @Get()
  findAll() {
    return this.stationDailyStatusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stationDailyStatusService.findOne(id);
  }

  @Get('station/:stationId')
  findByStation(@Param('stationId') stationId: string) {
    return this.stationDailyStatusService.findByStation(stationId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateStationDailyStatusDto,
  ) {
    return this.stationDailyStatusService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stationDailyStatusService.remove(id);
  }
}
