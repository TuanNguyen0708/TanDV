import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionMonthPlan } from './entity/production-month-plans.entity';
import { ProductionDailyPlans } from './entity/production-daily-plans.entity';
import { CreateMonthPlanDto } from './dto/create-month-plan.dto';
import { CreateDailyResultDto } from './dto/create-daily-plan.dto';

@Injectable()
export class ProductionPlanService {
  constructor(
    @InjectRepository(ProductionMonthPlan)
    private readonly monthRepo: Repository<ProductionMonthPlan>,

    @InjectRepository(ProductionDailyPlans)
    private readonly dayRepo: Repository<ProductionDailyPlans>,
  ) {}

  /* ================== MONTH PLAN ================== */

  async upsertMonthPlan(dto: CreateMonthPlanDto) {
    const planMonth = `${dto.month}-01`;

    // Find existing record
    const existing = await this.monthRepo.findOne({
      where: { model: dto.model, planMonth },
    });

    if (existing) {
      // Update existing
      existing.plannedMonth = dto.plannedMonth;
      return this.monthRepo.save(existing);
    } else {
      // Create new
      return this.monthRepo.save({
        model: dto.model,
        planMonth,
        plannedMonth: dto.plannedMonth,
      });
    }
  }

  async getAllMonthPlans(month: string) {
    const planMonth = `${month}-01`;
    return this.monthRepo.find({
      where: { planMonth },
      relations: ['dailyPlans'],
      order: { model: 'ASC' },
    });
  }

  async deleteMonthPlan(id: string) {
    // Delete the month plan - daily plans will be automatically deleted due to CASCADE
    await this.monthRepo.delete(id);
    return { success: true };
  }

  /* ================== DAILY RESULT ================== */

  async upsertDailyResult(dto: CreateDailyResultDto) {
    // Find the month plan by ID
    const monthPlan = await this.monthRepo.findOne({
      where: { id: dto.monthPlanId },
    });

    if (!monthPlan) {
      throw new Error(`Month plan not found with id: ${dto.monthPlanId}`);
    }

    // Verify model matches
    if (monthPlan.model !== dto.model) {
      throw new Error(
        `Model mismatch: month plan model is ${monthPlan.model}, but provided model is ${dto.model}`,
      );
    }

    // Find existing record
    const existing = await this.dayRepo.findOne({
      where: { model: dto.model, workDate: dto.date },
    });

    if (existing) {
      // Update existing
      existing.plannedDay = dto.plannedDay;
      existing.actualDay = dto.actualDay ?? existing.actualDay;
      existing.monthPlan = monthPlan;
      return this.dayRepo.save(existing);
    } else {
      // Create new
      return this.dayRepo.save({
        model: dto.model,
        workDate: dto.date,
        plannedDay: dto.plannedDay,
        actualDay: dto.actualDay ?? 0,
        monthPlan: monthPlan,
      });
    }
  }

  async getAllDailyPlans(date: string) {
    return this.dayRepo.find({
      where: { workDate: date },
      relations: ['monthPlan'],
      order: { model: 'ASC' },
    });
  }

  async deleteDailyPlan(id: string) {
    await this.dayRepo.delete(id);
    return { success: true };
  }

  /* ================== SUMMARY TABLE ================== */

  async getDailySummary(date: string) {
    const rows = await this.dayRepo.query(
      `
      SELECT
        d.model                                   AS model,
        d.planned_day                            AS "plannedDay",
        d.actual_day                             AS "actualDay",
        m.planned_month                          AS "plannedMonth",
        SUM(r.actual_day)                        AS "cumulative"
      FROM production_daily_plans d
      JOIN production_month_plans m
        ON m.model = d.model
       AND m.plan_month = date_trunc('month', d.work_date)
      JOIN production_daily_plans r
        ON r.model = d.model
       AND r.work_date BETWEEN date_trunc('month', d.work_date) AND d.work_date
      WHERE d.work_date = $1
      GROUP BY
        d.model,
        d.planned_day,
        d.actual_day,
        m.planned_month
      ORDER BY d.model
      `,
      [date],
    );

    const total = rows.reduce(
      (acc: any, r: any) => {
        acc.plannedDay += Number(r.plannedDay);
        acc.actualDay += Number(r.actualDay);
        acc.plannedMonth += Number(r.plannedMonth);
        acc.cumulative += Number(r.cumulative);
        return acc;
      },
      {
        plannedDay: 0,
        actualDay: 0,
        plannedMonth: 0,
        cumulative: 0,
      },
    );

    return {
      date,
      rows,
      total,
    };
  }
}
