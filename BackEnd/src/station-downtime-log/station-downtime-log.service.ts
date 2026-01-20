import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StationDowntimeLog } from './entity/station-downtime-log.entity';
import { CreateStationDowntimeLogDto } from './dto/create-station-downtime-log.dto';
import { UpdateStationDowntimeLogDto } from './dto/update-station-downtime-log.dto';

@Injectable()
export class StationDowntimeLogService {
  constructor(
    @InjectRepository(StationDowntimeLog)
    private stationDowntimeLogRepository: Repository<StationDowntimeLog>,
  ) {}

  async create(
    createDto: CreateStationDowntimeLogDto,
  ): Promise<StationDowntimeLog> {
    const downtimeLog = this.stationDowntimeLogRepository.create(createDto);
    return await this.stationDowntimeLogRepository.save(downtimeLog);
  }

  async findAll(): Promise<StationDowntimeLog[]> {
    return await this.stationDowntimeLogRepository.find({
      relations: ['stationDailyStatus'],
    });
  }

  async findOne(id: string): Promise<StationDowntimeLog> {
    return await this.stationDowntimeLogRepository.findOne({
      where: { id },
      relations: ['stationDailyStatus'],
    });
  }

  async findByStationDaily(
    stationDailyID: string,
  ): Promise<StationDowntimeLog[]> {
    return await this.stationDowntimeLogRepository.find({
      where: { stationDailyID },
      relations: ['stationDailyStatus'],
    });
  }

  async update(
    id: string,
    updateDto: UpdateStationDowntimeLogDto,
  ): Promise<StationDowntimeLog> {
    await this.stationDowntimeLogRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.stationDowntimeLogRepository.delete(id);
  }
}
