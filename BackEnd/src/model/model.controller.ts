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
import { ModelService } from './model.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';

@ApiTags('Models')
@Controller('models')
export class ModelController {
  constructor(private readonly service: ModelService) {}

  @Get()
  @ApiOperation({ summary: 'Get all models' })
  getAll() {
    return this.service.getAll();
  }

  @Get(':modelId')
  @ApiOperation({ summary: 'Get model by modelId' })
  getById(@Param('modelId') modelId: string) {
    return this.service.getById(modelId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new model' })
  create(@Body() dto: CreateModelDto) {
    return this.service.create(dto);
  }

  @Put(':modelId')
  @ApiOperation({ summary: 'Update model' })
  update(@Param('modelId') modelId: string, @Body() dto: UpdateModelDto) {
    return this.service.update(modelId, dto);
  }

  @Delete(':modelId')
  @ApiOperation({ summary: 'Delete model' })
  delete(@Param('modelId') modelId: string) {
    return this.service.delete(modelId);
  }
}

