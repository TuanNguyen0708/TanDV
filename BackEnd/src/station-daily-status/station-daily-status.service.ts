import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StationDailyStatus } from './entity/station-daily-status.entity';
import { CreateStationDailyStatusDto } from './dto/create-station-daily-status.dto';
import { UpdateStationDailyStatusDto } from './dto/update-station-daily-status.dto';

@Injectable()
export class StationDailyStatusService {
  constructor(
    @InjectRepository(StationDailyStatus)
    private stationDailyStatusRepository: Repository<StationDailyStatus>,
  ) {}

  async create(
    createDto: CreateStationDailyStatusDto,
  ): Promise<StationDailyStatus> {
    const stationDailyStatus =
      this.stationDailyStatusRepository.create(createDto);
    return await this.stationDailyStatusRepository.save(stationDailyStatus);
  }

  async findAll(): Promise<StationDailyStatus[]> {
    return await this.stationDailyStatusRepository.find({
      relations: ['station'],
    });
  }

  async findOne(id: string): Promise<StationDailyStatus> {
    return await this.stationDailyStatusRepository.findOne({
      where: { id },
      relations: ['station'],
    });
  }

  async findByStation(stationID: string): Promise<StationDailyStatus[]> {
    return await this.stationDailyStatusRepository.find({
      where: { stationID },
      relations: ['station'],
    });
  }

  async update(
    id: string,
    updateDto: UpdateStationDailyStatusDto,
  ): Promise<StationDailyStatus> {
    await this.stationDailyStatusRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.stationDailyStatusRepository.delete(id);
  }
}
