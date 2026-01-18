import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Station } from './entity/station.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { ProductionStationLog } from '../production-station-log/entity/production-station-log.entity';

@Injectable()
export class StationService {
  constructor(
    @InjectRepository(Station)
    private readonly stationRepo: Repository<Station>,
    @InjectRepository(ProductionStationLog)
    private readonly logRepo: Repository<ProductionStationLog>,
  ) {}

  async getAllStations() {
    return this.stationRepo.find({
      order: { sequence: 'ASC' },
    });
  }

  async getStationById(id: string) {
    const station = await this.stationRepo.findOneBy({ id });
    if (!station) throw new NotFoundException('Station not found');
    return station;
  }

  async createStation(dto: CreateStationDto) {
    // Check if code already exists
    const existing = await this.stationRepo.findOne({
      where: { code: dto.code },
    });
    if (existing) {
      throw new BadRequestException('Station code already exists');
    }

    const station = this.stationRepo.create({
      ...dto,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });
    return this.stationRepo.save(station);
  }

  async updateStation(id: string, dto: UpdateStationDto) {
    const station = await this.stationRepo.findOneBy({ id });
    if (!station) throw new NotFoundException('Station not found');

    // Check if code already exists (if code is being updated)
    if (dto.code && dto.code !== station.code) {
      const existing = await this.stationRepo.findOne({
        where: { code: dto.code },
      });
      if (existing) {
        throw new BadRequestException('Station code already exists');
      }
    }

    Object.assign(station, dto);
    return this.stationRepo.save(station);
  }

  async deleteStation(id: string) {
    const station = await this.stationRepo.findOneBy({ id });
    if (!station) throw new NotFoundException('Station not found');

    // Check if station is used in any production logs
    const logsCount = await this.logRepo.count({
      where: { station: { id } },
    });
    if (logsCount > 0) {
      throw new BadRequestException(
        'Cannot delete station that is used in production logs',
      );
    }

    await this.stationRepo.remove(station);
    return { message: 'Station deleted successfully' };
  }

  async getActiveStations() {
    return this.stationRepo.find({
      where: { isActive: true },
      order: { sequence: 'ASC' },
    });
  }
}
