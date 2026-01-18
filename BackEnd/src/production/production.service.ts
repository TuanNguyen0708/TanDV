import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Production } from './entity/production.entity';
import { CreateProductionDto } from './dto/create-production.dto';
import { UpdateQualityDto } from './dto/update-quality.dto';
import { Station } from '../station/entity/station.entity';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(Production)
    private readonly productionRepo: Repository<Production>,
    @InjectRepository(Station)
    private readonly stationRepo: Repository<Station>,
  ) {}

  async create(dto: CreateProductionDto) {
    return this.productionRepo.save(dto);
  }

  async getStatusByDate(date: string) {
    const stations = await this.stationRepo.find({
      where: { isActive: true },
      order: { sequence: 'ASC' },
    });

    const productions = await this.productionRepo.find({
      where: { productionDate: date },
      relations: ['stations', 'stations.station'],
    });

    // Ensure stations array is initialized and properly serialized
    const productionsWithStations = productions.map((production) => {
      return {
        id: production.id,
        productionNo: production.productionNo,
        model: production.model,
        productionDate: production.productionDate,
        qualityStatus: production.qualityStatus,
        remark: production.remark,
        stations: (production.stations || []).map((log) => ({
          id: log.id,
          status: log.status,
          reason: log.reason,
          startTime: log.startTime,
          endTime: log.endTime,
          periodMinutes: log.periodMinutes,
          station: log.station
            ? {
                id: log.station.id,
                code: log.station.code,
                name: log.station.name,
                sequence: log.station.sequence,
                isActive: log.station.isActive,
              }
            : null,
        })),
      };
    });

    return { stations, productions: productionsWithStations };
  }

  async updateQuality(id: string, dto: UpdateQualityDto) {
    const production = await this.productionRepo.findOneBy({ id });
    if (!production) throw new NotFoundException();

    Object.assign(production, dto);
    return this.productionRepo.save(production);
  }

  async findOrCreateByDate(date: string) {
    let production = await this.productionRepo.findOne({
      where: { productionDate: date },
      order: { productionNo: 'DESC' },
    });

    if (!production) {
      production = await this.productionRepo.save({
        productionNo: `AUTO-${date}`,
        model: 'AUTO',
        productionDate: date,
      });
    }

    return production;
  }
}
