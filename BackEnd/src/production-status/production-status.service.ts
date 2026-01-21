import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionStatus } from './entity/production-status.entity';
import { CreateProductionStatusDto } from './dto/create-production-status.dto';
import { UpdateProductionStatusDto } from './dto/update-production-status.dto';
import { UpdateStationTimelineDto } from './dto/update-station-timeline.dto';
import { UpdateQualityDto } from './dto/update-quality.dto';
import { ProductionDailyPlans } from '../production-plans/entity/production-daily-plans.entity';
import { ProductionMonthPlan } from '../production-plans/entity/production-month-plans.entity';

@Injectable()
export class ProductionStatusService {
  constructor(
    @InjectRepository(ProductionStatus)
    private productionStatusRepository: Repository<ProductionStatus>,
    @InjectRepository(ProductionDailyPlans)
    private productionDailyPlansRepository: Repository<ProductionDailyPlans>,
    @InjectRepository(ProductionMonthPlan)
    private productionMonthPlanRepository: Repository<ProductionMonthPlan>,
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
      throw new NotFoundException(
        `Production status với ID ${id} không tồn tại`,
      );
    }

    return productionStatus;
  }

  async update(
    id: string,
    updateDto: UpdateProductionStatusDto,
  ): Promise<ProductionStatus> {
    const productionStatus = await this.findOne(id);

    // If updating vehicleID, check for uniqueness
    if (
      updateDto.vehicleID &&
      updateDto.vehicleID !== productionStatus.vehicleID
    ) {
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
    const startTime = stationDto.startTime
      ? new Date(stationDto.startTime)
      : new Date();

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

    // Update actualDay count in production plan if quality is set
    if (qualityDto.quality) {
      await this.updateProductionPlanCount(
        productionStatus.modelID,
        productionStatus.productionDate,
      );
    }

    return this.findOne(id);
  }

  private async updateProductionPlanCount(
    modelID: string,
    productionDate: Date | string,
  ): Promise<void> {
    try {
      // Convert Date to string format YYYY-MM-DD for workDate comparison
      let workDate: string;
      if (productionDate instanceof Date) {
        workDate = productionDate.toISOString().split('T')[0];
      } else {
        workDate = String(productionDate).split('T')[0];
      }

      // Find the daily plan for this model and date
      const dailyPlan = await this.productionDailyPlansRepository.findOne({
        where: {
          model: modelID,
          workDate: workDate,
        },
        relations: ['monthPlan'],
      });

      console.log(dailyPlan, 'dailyPlan found for updating count');

      if (dailyPlan) {
        // Increment actualDay by 1
        dailyPlan.actualDay = (dailyPlan.actualDay || 0) + 1;
        await this.productionDailyPlansRepository.save(dailyPlan);

        // Also increment cumulative in month plan
        if (dailyPlan.monthPlan) {
          const monthPlan = await this.productionMonthPlanRepository.findOne({
            where: { id: dailyPlan.monthPlan.id },
          });

          if (monthPlan) {
            console.log('updating month plan cumulative count');
            monthPlan.cumulative = (monthPlan.cumulative || 0) + 1;
            await this.productionMonthPlanRepository.save(monthPlan);
          }
        }
      }
    } catch (error) {
      // Log error but don't fail the main operation
      console.error('Error updating production plan count:', error);
    }
  }

  async remove(id: string): Promise<void> {
    const productionStatus = await this.findOne(id);

    // Decrement count in production plan if quality was set
    if (productionStatus.quality) {
      await this.decrementProductionPlanCount(
        productionStatus.modelID,
        productionStatus.productionDate,
      );
    }

    await this.productionStatusRepository.remove(productionStatus);
  }

  private async decrementProductionPlanCount(
    modelID: string,
    productionDate: Date | string,
  ): Promise<void> {
    try {
      // Convert Date to string format YYYY-MM-DD for workDate comparison
      let workDate: string;
      if (productionDate instanceof Date) {
        workDate = productionDate.toISOString().split('T')[0];
      } else {
        workDate = String(productionDate).split('T')[0];
      }

      // Find the daily plan for this model and date
      const dailyPlan = await this.productionDailyPlansRepository.findOne({
        where: {
          model: modelID,
          workDate: workDate,
        },
        relations: ['monthPlan'],
      });

      console.log(dailyPlan, 'dailyPlan found for decrementing count');

      if (dailyPlan) {
        // Decrement actualDay by 1 (but not below 0)
        dailyPlan.actualDay = Math.max((dailyPlan.actualDay || 0) - 1, 0);
        await this.productionDailyPlansRepository.save(dailyPlan);

        // Also decrement cumulative in month plan
        if (dailyPlan.monthPlan) {
          const monthPlan = await this.productionMonthPlanRepository.findOne({
            where: { id: dailyPlan.monthPlan.id },
          });

          if (monthPlan) {
            console.log('decrementing month plan cumulative count');
            monthPlan.cumulative = Math.max((monthPlan.cumulative || 0) - 1, 0);
            await this.productionMonthPlanRepository.save(monthPlan);
          }
        }
      }
    } catch (error) {
      // Log error but don't fail the main operation
      console.error('Error decrementing production plan count:', error);
    }
  }
}
