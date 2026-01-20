import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Station } from './entity/station.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';

@Injectable()
export class StationService {
  constructor(
    @InjectRepository(Station)
    private stationRepository: Repository<Station>,
  ) {}

  async create(createDto: CreateStationDto): Promise<Station> {
    const station = this.stationRepository.create(createDto);
    return await this.stationRepository.save(station);
  }

  async findAll(): Promise<Station[]> {
    return await this.stationRepository.find();
  }

  async findOne(id: string): Promise<Station> {
    return await this.stationRepository.findOne({ where: { id } });
  }

  async update(id: string, updateDto: UpdateStationDto): Promise<Station> {
    await this.stationRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.stationRepository.delete(id);
  }
}
