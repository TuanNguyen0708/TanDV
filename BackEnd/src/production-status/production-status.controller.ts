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
import { UpdateStationTimelineDto } from './dto/update-station-timeline.dto';
import { UpdateQualityDto } from './dto/update-quality.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Production Status')
@Controller('production-status')
export class ProductionStatusController {
  constructor(
    private readonly productionStatusService: ProductionStatusService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mới production status (chỉ với thông tin cơ bản)' })
  create(@Body() createDto: CreateProductionStatusDto) {
    return this.productionStatusService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả production status' })
  findAll() {
    return this.productionStatusService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết production status theo ID' })
  findOne(@Param('id') id: string) {
    return this.productionStatusService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin cơ bản production status' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductionStatusDto,
  ) {
    return this.productionStatusService.update(id, updateDto);
  }

  @Post(':id/station')
  @ApiOperation({ 
    summary: 'Thêm trạm vào timeline (tự động set endTime cho trạm trước đó)',
    description: 'Khi thêm trạm mới, hệ thống tự động set endTime của trạm trước đó bằng startTime của trạm hiện tại'
  })
  addStation(
    @Param('id') id: string,
    @Body() stationDto: UpdateStationTimelineDto,
  ) {
    return this.productionStatusService.addStationToTimeline(id, stationDto);
  }

  @Post(':id/quality')
  @ApiOperation({ 
    summary: 'Cập nhật chất lượng và kết thúc production (set endTime cho trạm cuối cùng)',
    description: 'Khi set chất lượng, hệ thống tự động set endTime cho trạm cuối cùng nếu chưa có'
  })
  updateQuality(
    @Param('id') id: string,
    @Body() qualityDto: UpdateQualityDto,
  ) {
    return this.productionStatusService.updateQuality(id, qualityDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa production status' })
  remove(@Param('id') id: string) {
    return this.productionStatusService.remove(id);
  }
}
