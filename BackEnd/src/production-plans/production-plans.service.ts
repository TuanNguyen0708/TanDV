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
      order: { model: 'ASC' },
    });
  }

  async deleteMonthPlan(model: string, month: string) {
    const planMonth = `${month}-01`;
    // Delete all daily plans in this month for the model first
    await this.dayRepo
      .createQueryBuilder()
      .delete()
      .from(ProductionDailyPlans)
      .where('model = :model', { model })
      .andWhere('date_trunc(\'month\', work_date) = :planMonth', { planMonth })
      .execute();

    // Then delete the month plan
    await this.monthRepo.delete({ model, planMonth });
    return { success: true };
  }

  /* ================== DAILY RESULT ================== */

  async upsertDailyResult(dto: CreateDailyResultDto) {
    // Find existing record
    const existing = await this.dayRepo.findOne({
      where: { model: dto.model, workDate: dto.date },
    });

    if (existing) {
      // Update existing
      existing.plannedDay = dto.plannedDay;
      existing.actualDay = dto.actualDay ?? existing.actualDay;
      return this.dayRepo.save(existing);
    } else {
      // Create new
      return this.dayRepo.save({
        model: dto.model,
        workDate: dto.date,
        plannedDay: dto.plannedDay,
        actualDay: dto.actualDay ?? 0,
      });
    }
  }

  async getAllDailyPlans(date: string) {
    return this.dayRepo.find({
      where: { workDate: date },
      order: { model: 'ASC' },
    });
  }

  async deleteDailyPlan(model: string, date: string) {
    await this.dayRepo.delete({ model, workDate: date });
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
