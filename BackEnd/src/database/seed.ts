import { DataSource } from 'typeorm';
import { Model } from '../model/entity/model.entity';
import { Station } from '../station/entity/station.entity';
import { ProductionMonthPlan } from '../production-plans/entity/production-month-plans.entity';
import { ProductionDailyPlans } from '../production-plans/entity/production-daily-plans.entity';
import { ProductionStatus } from '../production-status/entity/production-status.entity';
import { StationDailyStatus } from '../station-daily-status/entity/station-daily-status.entity';
import { StationDowntimeLog } from '../station-downtime-log/entity/station-downtime-log.entity';
import { StationStatusCode } from '../common/enums/station-status-code.enum';

async function seed() {
  // Tạo kết nối database
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 5432,
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'nestjs_db',
    entities: [
      Model,
      Station,
      ProductionMonthPlan,
      ProductionDailyPlans,
      ProductionStatus,
      StationDailyStatus,
      StationDowntimeLog,
    ],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Đã kết nối database');

    // 1. Seed Models (3-5 models)
    console.log('\n📦 Đang tạo Models...');
    const modelRepository = dataSource.getRepository(Model);
    const models = [
      {
        modelId: 'KL199',
        name: 'Xe tải KL199',
        description: 'Xe tải hạng trung, tải trọng 5 tấn',
      },
      {
        modelId: 'KL250',
        name: 'Xe tải KL250',
        description: 'Xe tải hạng nặng, tải trọng 10 tấn',
      },
      {
        modelId: 'KL300',
        name: 'Xe tải KL300',
        description: 'Xe tải siêu trọng, tải trọng 15 tấn',
      },
      {
        modelId: 'BUS01',
        name: 'Xe buýt BUS01',
        description: 'Xe buýt 40 chỗ ngồi',
      },
    ];

    for (const modelData of models) {
      const existingModel = await modelRepository.findOne({
        where: { modelId: modelData.modelId },
      });
      if (!existingModel) {
        await modelRepository.save(modelData);
        console.log(`  ✓ Đã tạo model: ${modelData.modelId}`);
      } else {
        console.log(`  ⊘ Model đã tồn tại: ${modelData.modelId}`);
      }
    }

    // 2. Seed Stations (5 stations)
    console.log('\n🏭 Đang tạo Stations...');
    const stationRepository = dataSource.getRepository(Station);
    const stations = [
      {
        stationName: 'Trạm hàn khung',
        description: 'Trạm hàn khung xe - giai đoạn đầu',
        isActive: true,
        currentStatusCode: StationStatusCode.RUNNING,
        currentStatusBrief: 'Đang hoạt động bình thường',
      },
      {
        stationName: 'Trạm sơn',
        description: 'Trạm sơn xe - xử lý bề mặt',
        isActive: true,
        currentStatusCode: StationStatusCode.RUNNING,
        currentStatusBrief: 'Đang sơn lô xe KL199',
      },
      {
        stationName: 'Trạm lắp ráp động cơ',
        description: 'Trạm lắp ráp động cơ và hệ thống truyền động',
        isActive: true,
        currentStatusCode: StationStatusCode.IDLE,
        currentStatusBrief: 'Chờ linh kiện',
      },
      {
        stationName: 'Trạm lắp ráp nội thất',
        description: 'Trạm lắp ráp nội thất cabin',
        isActive: true,
        currentStatusCode: StationStatusCode.STOP,
        currentStatusBrief: 'Bảo trì định kỳ',
      },
      {
        stationName: 'Trạm kiểm tra cuối',
        description: 'Trạm kiểm tra chất lượng cuối cùng',
        isActive: true,
        currentStatusCode: StationStatusCode.RUNNING,
        currentStatusBrief: 'Đang kiểm tra xe',
      },
    ];

    const createdStations: Station[] = [];
    for (const stationData of stations) {
      const existingStation = await stationRepository.findOne({
        where: { stationName: stationData.stationName },
      });
      if (!existingStation) {
        const station = await stationRepository.save(stationData);
        createdStations.push(station);
        console.log(`  ✓ Đã tạo station: ${stationData.stationName}`);
      } else {
        createdStations.push(existingStation);
        console.log(`  ⊘ Station đã tồn tại: ${stationData.stationName}`);
      }
    }

    // 3. Seed Production Month Plans
    console.log('\n📅 Đang tạo Production Month Plans...');
    const monthPlanRepository = dataSource.getRepository(ProductionMonthPlan);
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;
    const nextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    );
    const nextMonthStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;

    const monthPlans = [
      {
        model: 'KL199',
        planMonth: currentMonth,
        plannedMonth: 500,
        cumulative: 150,
      },
      {
        model: 'KL250',
        planMonth: currentMonth,
        plannedMonth: 300,
        cumulative: 80,
      },
      {
        model: 'KL199',
        planMonth: nextMonthStr,
        plannedMonth: 600,
        cumulative: 0,
      },
    ];

    const createdMonthPlans: ProductionMonthPlan[] = [];
    for (const planData of monthPlans) {
      const existingPlan = await monthPlanRepository.findOne({
        where: { model: planData.model, planMonth: planData.planMonth },
      });
      if (!existingPlan) {
        const plan = await monthPlanRepository.save(planData);
        createdMonthPlans.push(plan);
        console.log(
          `  ✓ Đã tạo month plan: ${planData.model} - ${planData.planMonth}`,
        );
      } else {
        createdMonthPlans.push(existingPlan);
        console.log(
          `  ⊘ Month plan đã tồn tại: ${planData.model} - ${planData.planMonth}`,
        );
      }
    }

    // 4. Seed Production Daily Plans
    console.log('\n📆 Đang tạo Production Daily Plans...');
    const dailyPlanRepository = dataSource.getRepository(ProductionDailyPlans);
    const today = new Date();
    const dailyPlans = [];

    // Tạo daily plans cho 5 ngày gần đây
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      dailyPlans.push({
        model: 'KL199',
        workDate: dateStr,
        plannedDay: 20 + Math.floor(Math.random() * 10),
        actualDay: 15 + Math.floor(Math.random() * 10),
        monthPlan: createdMonthPlans[0],
      });

      if (i < 3) {
        dailyPlans.push({
          model: 'KL250',
          workDate: dateStr,
          plannedDay: 15 + Math.floor(Math.random() * 5),
          actualDay: 10 + Math.floor(Math.random() * 8),
          monthPlan: createdMonthPlans[1],
        });
      }
    }

    for (const planData of dailyPlans) {
      const existingPlan = await dailyPlanRepository.findOne({
        where: { model: planData.model, workDate: planData.workDate },
      });
      if (!existingPlan) {
        await dailyPlanRepository.save(planData);
        console.log(
          `  ✓ Đã tạo daily plan: ${planData.model} - ${planData.workDate}`,
        );
      } else {
        console.log(
          `  ⊘ Daily plan đã tồn tại: ${planData.model} - ${planData.workDate}`,
        );
      }
    }

    // 5. Seed Production Status
    console.log('\n🚗 Đang tạo Production Status...');
    const productionStatusRepository =
      dataSource.getRepository(ProductionStatus);
    const productionStatuses = [];

    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 3));

      const stationTimeline = [];
      // Tạo timeline qua 3 stations ngẫu nhiên
      for (let j = 0; j < 3 && j < createdStations.length; j++) {
        const startTime = new Date(date);
        startTime.setHours(8 + j * 3, 0, 0);
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 2, 30, 0);

        stationTimeline.push({
          stationID: createdStations[j].id,
          stationName: createdStations[j].stationName,
          startTime: startTime,
          endTime: j < 2 ? endTime : undefined, // Station cuối chưa xong
        });
      }

      productionStatuses.push({
        modelID: i <= 3 ? 'KL199' : 'KL250',
        vehicleID: `VEH${String(i).padStart(5, '0')}`,
        productionDate: date,
        stationTimeline: stationTimeline,
        quality: i <= 4 ? 'OK' : null,
        remark: i === 5 ? 'Đang kiểm tra' : null,
      });
    }

    for (const statusData of productionStatuses) {
      const existingStatus = await productionStatusRepository.findOne({
        where: { vehicleID: statusData.vehicleID },
      });
      if (!existingStatus) {
        await productionStatusRepository.save(statusData);
        console.log(`  ✓ Đã tạo production status: ${statusData.vehicleID}`);
      } else {
        console.log(
          `  ⊘ Production status đã tồn tại: ${statusData.vehicleID}`,
        );
      }
    }

    // 6. Seed Station Daily Status
    console.log('\n📊 Đang tạo Station Daily Status...');
    const stationDailyRepository = dataSource.getRepository(StationDailyStatus);
    const stationDailyStatuses = [];

    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      for (const station of createdStations.slice(0, 3)) {
        stationDailyStatuses.push({
          stationID: station.id,
          statusDate: date,
          startTime: '07:00:00',
          stopTime: '17:00:00',
          totalDowntime: Math.floor(Math.random() * 60), // 0-60 phút downtime
        });
      }
    }

    const createdDailyStatuses: StationDailyStatus[] = [];
    for (const statusData of stationDailyStatuses) {
      const existingStatus = await stationDailyRepository.findOne({
        where: {
          stationID: statusData.stationID,
          statusDate: statusData.statusDate,
        },
      });
      if (!existingStatus) {
        const status = await stationDailyRepository.save(statusData);
        createdDailyStatuses.push(status);
        console.log(
          `  ✓ Đã tạo station daily status: Station ${statusData.stationID.substring(0, 8)}... - ${statusData.statusDate.toISOString().split('T')[0]}`,
        );
      } else {
        createdDailyStatuses.push(existingStatus);
        console.log(
          `  ⊘ Station daily status đã tồn tại: Station ${statusData.stationID.substring(0, 8)}...`,
        );
      }
    }

    // 7. Seed Station Downtime Logs
    console.log('\n⏱️  Đang tạo Station Downtime Logs...');
    const downtimeLogRepository = dataSource.getRepository(StationDowntimeLog);
    const downtimeLogs = [];

    // Tạo 2-3 downtime logs cho mỗi daily status
    for (const dailyStatus of createdDailyStatuses.slice(0, 3)) {
      const numLogs = Math.floor(Math.random() * 2) + 1; // 1-2 logs
      for (let i = 0; i < numLogs; i++) {
        const startTime = new Date(dailyStatus.statusDate);
        startTime.setHours(8 + i * 4, Math.floor(Math.random() * 60), 0);
        const stopTime = new Date(startTime);
        stopTime.setMinutes(
          startTime.getMinutes() + 15 + Math.floor(Math.random() * 45),
        ); // 15-60 phút

        const reasons = [
          'Thiếu nguyên liệu',
          'Bảo trì thiết bị',
          'Chờ kiểm tra chất lượng',
          'Thay đổi mẫu sản phẩm',
          'Sự cố kỹ thuật',
        ];

        downtimeLogs.push({
          stationDailyID: dailyStatus.id,
          downTimeLog: reasons[Math.floor(Math.random() * reasons.length)],
          downtimeStart: startTime,
          downtimeStop: stopTime,
        });
      }
    }

    for (const logData of downtimeLogs) {
      const existingLog = await downtimeLogRepository.findOne({
        where: {
          stationDailyID: logData.stationDailyID,
          downtimeStart: logData.downtimeStart,
        },
      });
      if (!existingLog) {
        await downtimeLogRepository.save(logData);
        console.log(
          `  ✓ Đã tạo downtime log: ${logData.downTimeLog} (${logData.downtimeStart.toLocaleTimeString('vi-VN')})`,
        );
      } else {
        console.log(`  ⊘ Downtime log đã tồn tại`);
      }
    }

    console.log('\n✅ Hoàn thành seed data!');
    console.log('\n📈 Tổng kết:');
    console.log(`  - Models: ${models.length} records`);
    console.log(`  - Stations: ${stations.length} records`);
    console.log(`  - Month Plans: ${monthPlans.length} records`);
    console.log(`  - Daily Plans: ${dailyPlans.length} records`);
    console.log(`  - Production Status: ${productionStatuses.length} records`);
    console.log(
      `  - Station Daily Status: ${stationDailyStatuses.length} records`,
    );
    console.log(`  - Downtime Logs: ${downtimeLogs.length} records`);

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Lỗi khi seed data:', error);
    process.exit(1);
  }
}

// Chạy seed
seed()
  .then(() => {
    console.log('🎉 Seed data thành công!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed thất bại:', error);
    process.exit(1);
  });
