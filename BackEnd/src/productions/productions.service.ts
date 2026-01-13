import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductionDto } from './dto/create-production.dto';
import { UpdateStationTimeDto } from './dto/update-station-time.dto';
import { UpdateStationStatusDto } from './dto/update-station-status.dto';
import { UpdateQualityDto } from './dto/update-quality.dto';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { Production } from './entity/production.entity';
import { Station } from './entity/station.entity';
import { ProductionStationLog } from './entity/production-station-log.entity';

@Injectable()
export class ProductionsService {
  constructor(
    @InjectRepository(Production)
    private readonly productionRepo: Repository<Production>,

    @InjectRepository(Station)
    private readonly stationRepo: Repository<Station>,

    @InjectRepository(ProductionStationLog)
    private readonly logRepo: Repository<ProductionStationLog>,
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

  async updateStationTime(
    productionId: string,
    stationId: string,
    dto: UpdateStationTimeDto,
  ) {
    let log = await this.logRepo.findOne({
      where: {
        production: { id: productionId },
        station: { id: stationId },
      },
      relations: ['production', 'station'],
    });

    if (!log) {
      log = this.logRepo.create({
        production: { id: productionId } as any,
        station: { id: stationId } as any,
      });
    }

    if (dto.startTime) {
      log.startTime = dto.startTime instanceof Date 
        ? dto.startTime 
        : new Date(dto.startTime);
    }
    if (dto.endTime) {
      log.endTime = dto.endTime instanceof Date 
        ? dto.endTime 
        : new Date(dto.endTime);
    }

    if (log.startTime && log.endTime) {
      log.periodMinutes =
        (log.endTime.getTime() - log.startTime.getTime()) / 60000;
    }

    return this.logRepo.save(log);
  }

  async updateStationStatus(
    productionId: string,
    stationId: string,
    dto: UpdateStationStatusDto,
  ) {
    let log = await this.logRepo.findOne({
      where: {
        production: { id: productionId },
        station: { id: stationId },
      },
      relations: ['production', 'station'],
    });

    if (!log) {
      log = this.logRepo.create({
        production: { id: productionId } as any,
        station: { id: stationId } as any,
      });
    }

    if (dto.status !== undefined) {
      log.status = dto.status;
    }
    if (dto.reason !== undefined) {
      log.reason = dto.reason;
    }

    return this.logRepo.save(log);
  }

  async updateStationStatusByDate(
    date: string,
    stationId: string,
    dto: UpdateStationStatusDto,
  ) {
    // Tìm production đầu tiên trong ngày, nếu không có thì tạo mới
    let production = await this.productionRepo.findOne({
      where: { productionDate: date },
      order: { productionNo: 'DESC' },
    });

    if (!production) {
      // Tạo production mặc định nếu chưa có
      production = await this.productionRepo.save({
        productionNo: `AUTO-${date}`,
        model: 'AUTO',
        productionDate: date,
      });
    }

    return this.updateStationStatus(production.id, stationId, dto);
  }

  async getStationStatusByDate(date: string) {
    const stations = await this.stationRepo.find({
      where: { isActive: true },
      order: { sequence: 'ASC' },
    });

    const productions = await this.productionRepo.find({
      where: { productionDate: date },
      relations: ['stations', 'stations.station'],
      order: { productionNo: 'DESC' },
    });

    // Lấy trạng thái mới nhất của mỗi trạm từ production có log mới nhất
    const stationStatuses = stations.map((station) => {
      // Tìm log mới nhất của trạm này trong tất cả productions
      let latestLog: ProductionStationLog | null = null;
      let latestProduction: Production | null = null;

      // Duyệt qua các productions để tìm log mới nhất của trạm
      for (const production of productions) {
        const log = production.stations?.find(
          (l) => l.station?.id === station.id && l.status,
        );
        if (log) {
          // Nếu chưa có log hoặc log này mới hơn (dựa trên productionNo hoặc id)
          if (!latestLog || !latestProduction) {
            latestLog = log;
            latestProduction = production;
          } else if (production.id > latestProduction.id) {
            latestLog = log;
            latestProduction = production;
          }
        }
      }

      return {
        station: {
          id: station.id,
          code: station.code,
          name: station.name,
          sequence: station.sequence,
        },
        status: latestLog?.status || null,
        reason: latestLog?.reason || null,
        productionNo: latestProduction?.productionNo || null,
      };
    });

    return { stations: stationStatuses };
  }

  async updateQuality(id: string, dto: UpdateQualityDto) {
    const production = await this.productionRepo.findOneBy({ id });
    if (!production) throw new NotFoundException();

    Object.assign(production, dto);
    return this.productionRepo.save(production);
  }

  // Station CRUD methods
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
}
