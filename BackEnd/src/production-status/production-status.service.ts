import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionStatus } from './entity/production-status.entity';
import { CreateProductionStatusDto } from './dto/create-production-status.dto';
import { UpdateProductionStatusDto } from './dto/update-production-status.dto';
import { UpdateStationTimelineDto } from './dto/update-station-timeline.dto';
import { UpdateQualityDto } from './dto/update-quality.dto';

@Injectable()
export class ProductionStatusService {
  constructor(
    @InjectRepository(ProductionStatus)
    private productionStatusRepository: Repository<ProductionStatus>,
  ) {}

  async create(
    createDto: CreateProductionStatusDto,
  ): Promise<ProductionStatus> {
    // Check if vehicleID already exists
    const existing = await this.productionStatusRepository.findOne({
      where: { vehicleID: createDto.vehicleID },
    });

    if (existing) {
      throw new BadRequestException(
        `Số xe ${createDto.vehicleID} đã tồn tại trong hệ thống`,
      );
    }

    const productionStatus = this.productionStatusRepository.create({
      ...createDto,
      stationTimeline: [],
    });
    return await this.productionStatusRepository.save(productionStatus);
  }

  async findAll(): Promise<ProductionStatus[]> {
    return await this.productionStatusRepository.find();
  }

  async findOne(id: string): Promise<ProductionStatus> {
    const productionStatus = await this.productionStatusRepository.findOne({
      where: { id },
    });

    if (!productionStatus) {
      throw new NotFoundException(`Production status với ID ${id} không tồn tại`);
    }

    return productionStatus;
  }

  async update(
    id: string,
    updateDto: UpdateProductionStatusDto,
  ): Promise<ProductionStatus> {
    const productionStatus = await this.findOne(id);

    // If updating vehicleID, check for uniqueness
    if (updateDto.vehicleID && updateDto.vehicleID !== productionStatus.vehicleID) {
      const existing = await this.productionStatusRepository.findOne({
        where: { vehicleID: updateDto.vehicleID },
      });

      if (existing) {
        throw new BadRequestException(
          `Số xe ${updateDto.vehicleID} đã tồn tại trong hệ thống`,
        );
      }
    }

    await this.productionStatusRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async addStationToTimeline(
    id: string,
    stationDto: UpdateStationTimelineDto,
  ): Promise<ProductionStatus> {
    const productionStatus = await this.findOne(id);

    const timeline = productionStatus.stationTimeline || [];
    const startTime = stationDto.startTime ? new Date(stationDto.startTime) : new Date();

    // If there's a previous station without endTime, set it to current startTime
    if (timeline.length > 0) {
      const lastStation = timeline[timeline.length - 1];
      if (!lastStation.endTime) {
        lastStation.endTime = startTime;
      }
    }

    // Add new station entry
    timeline.push({
      stationID: stationDto.stationID,
      stationName: stationDto.stationName,
      startTime: startTime,
    });

    await this.productionStatusRepository.update(id, {
      stationTimeline: timeline,
    });

    return this.findOne(id);
  }

  async updateQuality(
    id: string,
    qualityDto: UpdateQualityDto,
  ): Promise<ProductionStatus> {
    const productionStatus = await this.findOne(id);

    const timeline = productionStatus.stationTimeline || [];

    // Set endTime for the last station if it doesn't have one
    if (timeline.length > 0) {
      const lastStation = timeline[timeline.length - 1];
      if (!lastStation.endTime) {
        lastStation.endTime = new Date();
      }
    }

    await this.productionStatusRepository.update(id, {
      quality: qualityDto.quality,
      remark: qualityDto.remark,
      stationTimeline: timeline,
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const productionStatus = await this.findOne(id);
    await this.productionStatusRepository.remove(productionStatus);
  }
}
