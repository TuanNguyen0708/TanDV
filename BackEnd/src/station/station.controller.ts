import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StationService } from './station.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';

@ApiTags('Stations')
@Controller('stations')
export class StationController {
  constructor(private readonly service: StationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stations' })
  getAllStations() {
    return this.service.getAllStations();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get station by id' })
  getStationById(@Param('id') id: string) {
    return this.service.getStationById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new station' })
  createStation(@Body() dto: CreateStationDto) {
    return this.service.createStation(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update station' })
  updateStation(@Param('id') id: string, @Body() dto: UpdateStationDto) {
    return this.service.updateStation(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete station' })
  deleteStation(@Param('id') id: string) {
    return this.service.deleteStation(id);
  }
}
