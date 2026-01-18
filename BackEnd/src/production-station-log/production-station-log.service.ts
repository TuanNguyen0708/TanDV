import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionStationLog } from './entity/production-station-log.entity';
import { UpdateStationTimeDto } from './dto/update-station-time.dto';
import { UpdateStationStatusDto } from './dto/update-station-status.dto';
import { ProductionService } from '../production/production.service';
import { StationService } from '../station/station.service';
import { Production } from '../production/entity/production.entity';

@Injectable()
export class ProductionStationLogService {
  constructor(
    @InjectRepository(ProductionStationLog)
    private readonly logRepo: Repository<ProductionStationLog>,
    private readonly productionService: ProductionService,
    private readonly stationService: StationService,
    @InjectRepository(Production)
    private readonly productionRepo: Repository<Production>,
  ) {}

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
      log.startTime =
        dto.startTime instanceof Date ? dto.startTime : new Date(dto.startTime);
    }
    if (dto.endTime) {
      log.endTime =
        dto.endTime instanceof Date ? dto.endTime : new Date(dto.endTime);
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
    const production = await this.productionService.findOrCreateByDate(date);
    return this.updateStationStatus(production.id, stationId, dto);
  }

  async getStationStatusByDate(date: string) {
    const stations = await this.stationService.getActiveStations();

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
}
