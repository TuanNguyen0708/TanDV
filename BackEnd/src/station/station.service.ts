import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Station } from './entity/station.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { StationDailyStatus } from '../station-daily-status/entity/station-daily-status.entity';
import { StationDowntimeLog } from '../station-downtime-log/entity/station-downtime-log.entity';

@Injectable()
export class StationService {
  constructor(
    @InjectRepository(Station)
    private stationRepository: Repository<Station>,
    @InjectRepository(StationDailyStatus)
    private stationDailyStatusRepository: Repository<StationDailyStatus>,
    @InjectRepository(StationDowntimeLog)
    private stationDowntimeLogRepository: Repository<StationDowntimeLog>,
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
    // Get current station state before update
    const currentStation = await this.findOne(id);
    const oldStatus = currentStation?.currentStatusCode;
    const newStatus = updateDto.currentStatusCode;

    // Update station
    await this.stationRepository.update(id, updateDto);

    // If status changed, handle downtime tracking
    if (oldStatus && newStatus && oldStatus !== newStatus) {
      await this.handleStatusChange(
        id,
        oldStatus,
        newStatus,
        updateDto.currentStatusBrief,
      );
    }

    return this.findOne(id);
  }

  private async handleStatusChange(
    stationId: string,
    oldStatus: string,
    newStatus: string,
    statusBrief?: string,
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // Get or create station daily status for today
    let dailyStatus = await this.stationDailyStatusRepository.findOne({
      where: { stationID: stationId, statusDate: today as any },
    });

    if (!dailyStatus) {
      dailyStatus = this.stationDailyStatusRepository.create({
        stationID: stationId,
        statusDate: today as any,
        startTime: new Date().toTimeString().split(' ')[0],
        totalDowntime: 0,
      });
      dailyStatus = await this.stationDailyStatusRepository.save(dailyStatus);
    }

    // If changing to STOP or EMERGENCY, create downtime log
    if (
      (newStatus === 'STOP' || newStatus === 'EMERGENCY') &&
      oldStatus === 'RUNNING'
    ) {
      const downtimeLog = this.stationDowntimeLogRepository.create({
        stationDailyID: dailyStatus.id,
        downTimeLog: statusBrief || 'Unknown reason',
        downtimeStart: new Date(),
      });
      await this.stationDowntimeLogRepository.save(downtimeLog);
    }

    // If changing from STOP/EMERGENCY to RUNNING, update latest downtime log
    if (oldStatus === 'STOP' || oldStatus === 'EMERGENCY') {
      if (newStatus === 'RUNNING') {
        // Find the latest open downtime log (no downtimeStop)
        const openLog = await this.stationDowntimeLogRepository
          .createQueryBuilder('log')
          .where('log.stationDailyID = :dailyId', { dailyId: dailyStatus.id })
          .andWhere('log.downtimeStop IS NULL')
          .orderBy('log.downtimeStart', 'DESC')
          .getOne();

        if (openLog) {
          const downtimeStop = new Date();
          const downtimeStart = new Date(openLog.downtimeStart);
          const downtimeMinutes = Math.floor(
            (downtimeStop.getTime() - downtimeStart.getTime()) / 60000,
          );

          // Update downtime log
          openLog.downtimeStop = downtimeStop;
          await this.stationDowntimeLogRepository.save(openLog);

          // Update total downtime in daily status
          dailyStatus.totalDowntime =
            (dailyStatus.totalDowntime || 0) + downtimeMinutes;
          await this.stationDailyStatusRepository.save(dailyStatus);
        }
      }
    }

    // Update stop time when station stops for the day
    if (newStatus === 'IDLE' && !dailyStatus.stopTime) {
      dailyStatus.stopTime = new Date().toTimeString().split(' ')[0];
      await this.stationDailyStatusRepository.save(dailyStatus);
    }
  }

  async remove(id: string): Promise<void> {
    await this.stationRepository.delete(id);
  }
}
