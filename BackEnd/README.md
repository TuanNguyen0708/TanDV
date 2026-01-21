# Backend - Hệ thống Quản lý Sản xuất Xưởng Lắp Ráp

Backend API cho hệ thống quản lý sản xuất, theo dõi trạng thái xe và trạm làm việc trong xưởng lắp ráp.

## 🚀 Công nghệ sử dụng

- **Framework**: NestJS 10.x
- **Database**: PostgreSQL
- **ORM**: TypeORM 0.3.x
- **Language**: TypeScript 5.x
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator, class-transformer

## 📋 Yêu cầu hệ thống

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm hoặc yarn

## 🔧 Cài đặt

1. **Clone repository và di chuyển vào thư mục Backend**
```bash
cd BackEnd
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình database**

Tạo file `.env` hoặc cấu hình trong `src/database/database.module.ts`:

```typescript
{
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'databse_password',
  database: 'production_management'
}
```

4. **Tạo database**
```sql
CREATE DATABASE production_management;
```

Hoặc tạo bảng thủ công:
```sql
-- Xem cấu trúc bảng trong phần Database Schema bên dưới
```

## 🏃 Chạy ứng dụng

### Development mode
```bash
npm run dev
```

### Production mode
```bash
npm run build
npm run start:prod
```

### Debug mode
```bash
npm run start:debug
```

Server sẽ chạy tại: `http://localhost:3000`

## 📚 API Documentation

Sau khi chạy server, truy cập Swagger UI tại:
```
http://localhost:3000/api
```

## 📁 Cấu trúc thư mục

```
BackEnd/
├── src/
│   ├── app.module.ts              # Module chính
│   ├── main.ts                    # Entry point
│   ├── database/                  # Cấu hình database
│   │   └── database.module.ts
│   ├── model/                     # Module Model (loại xe)
│   │   ├── entity/
│   │   ├── dto/
│   │   ├── model.controller.ts
│   │   └── model.service.ts
│   ├── station/                   # Module Station (trạm làm việc)
│   │   ├── entity/
│   │   ├── dto/
│   │   ├── station.controller.ts
│   │   └── station.service.ts
│   ├── production-status/         # Module Production Status (trạng thái xe)
│   │   ├── entity/
│   │   ├── dto/
│   │   ├── production-status.controller.ts
│   │   └── production-status.service.ts
│   ├── production-plans/          # Module Production Plans (kế hoạch sản xuất)
│   │   ├── entity/
│   │   ├── dto/
│   │   ├── production-plans.controller.ts
│   │   └── production-plans.service.ts
│   ├── station-daily-status/      # Module Station Daily Status
│   │   ├── entity/
│   │   ├── dto/
│   │   ├── station-daily-status.controller.ts
│   │   └── station-daily-status.service.ts
│   └── station-downtime-log/      # Module Station Downtime Log
│       ├── entity/
│       ├── dto/
│       ├── station-downtime-log.controller.ts
│       └── station-downtime-log.service.ts
```

## 🗄️ Database Schema

### 1. models (Loại xe)
```sql
CREATE TABLE models (
  model_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
);
```

### 2. station (Trạm làm việc)
```sql
CREATE TABLE station (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  current_status_code VARCHAR(20) DEFAULT 'IDLE',
  current_status_brief TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. production_status (Trạng thái xe)
```sql
CREATE TABLE production_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id VARCHAR(50) NOT NULL,
  vehicle_id VARCHAR(50) UNIQUE NOT NULL,
  production_date DATE NOT NULL,
  station_timeline JSONB DEFAULT '[]',
  quality VARCHAR(10) CHECK (quality IN ('OK', 'NG')),
  remark TEXT
);
```

### 4. production_month_plans (Kế hoạch tháng)
```sql
CREATE TABLE production_month_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model VARCHAR(50) NOT NULL,
  plan_month DATE NOT NULL,
  planned_month INTEGER NOT NULL,
  cumulative INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(model, plan_month)
);
```

### 5. production_daily_plans (Kế hoạch ngày)
```sql
CREATE TABLE production_daily_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model VARCHAR(50) NOT NULL,
  work_date DATE NOT NULL,
  planned_day INTEGER NOT NULL,
  actual_day INTEGER DEFAULT 0,
  month_plan_id UUID REFERENCES production_month_plans(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(model, work_date)
);
```

### 6. station_daily_status (Trạng thái trạm theo ngày)
```sql
CREATE TABLE station_daily_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES station(id) ON DELETE CASCADE,
  status_date DATE NOT NULL,
  start_time TIMESTAMP,
  stop_time TIMESTAMP,
  total_downtime INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 7. station_downtime_log (Log downtime của trạm)
```sql
CREATE TABLE station_downtime_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_daily_id UUID REFERENCES station_daily_status(id) ON DELETE CASCADE,
  down_time_log TEXT,
  downtime_start TIMESTAMP,
  downtime_stop TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔌 API Endpoints

### Models (Loại xe)
- `GET /models` - Lấy danh sách tất cả models
- `GET /models/:modelId` - Lấy thông tin model theo ID
- `POST /models` - Tạo model mới
- `PUT /models/:modelId` - Cập nhật model
- `DELETE /models/:modelId` - Xóa model

### Station (Trạm làm việc)
- `GET /station` - Lấy danh sách tất cả trạm
- `GET /station/:id` - Lấy thông tin trạm theo ID
- `POST /station` - Tạo trạm mới
- `PATCH /station/:id` - Cập nhật trạm
- `DELETE /station/:id` - Xóa trạm

### Production Status (Trạng thái xe)
- `GET /production-status` - Lấy danh sách tất cả production status
- `GET /production-status/:id` - Lấy chi tiết production status
- `POST /production-status` - Tạo production status mới
- `PATCH /production-status/:id` - Cập nhật thông tin cơ bản
- `POST /production-status/:id/station` - Thêm trạm vào timeline
- `POST /production-status/:id/quality` - Cập nhật chất lượng (tự động cập nhật count)
- `DELETE /production-status/:id` - Xóa production status (tự động giảm count)

### Production Plans (Kế hoạch sản xuất)
- `POST /production-plan/month` - Tạo/cập nhật kế hoạch tháng
- `GET /production-plan/month-all` - Lấy tất cả kế hoạch tháng
- `DELETE /production-plan/month/:id` - Xóa kế hoạch tháng
- `POST /production-plan/day` - Tạo/cập nhật kế hoạch ngày
- `GET /production-plan/day-all` - Lấy tất cả kế hoạch ngày
- `DELETE /production-plan/day/:id` - Xóa kế hoạch ngày
- `GET /production-plan/summary` - Lấy bảng tổng hợp theo ngày

### Station Daily Status
- `GET /station-daily-status` - Lấy danh sách tất cả
- `GET /station-daily-status/:id` - Lấy theo ID
- `GET /station-daily-status/station/:stationId` - Lấy theo station
- `POST /station-daily-status` - Tạo mới
- `PATCH /station-daily-status/:id` - Cập nhật
- `DELETE /station-daily-status/:id` - Xóa

### Station Downtime Log
- `GET /station-downtime-log` - Lấy danh sách tất cả
- `GET /station-downtime-log/:id` - Lấy theo ID
- `GET /station-downtime-log/station-daily/:stationDailyId` - Lấy theo station daily
- `POST /station-downtime-log` - Tạo mới
- `PATCH /station-downtime-log/:id` - Cập nhật
- `DELETE /station-downtime-log/:id` - Xóa

## 🔑 Tính năng chính

### 1. Quản lý Production Status
- Tạo production status với thông tin cơ bản (model, vehicleID, productionDate)
- Thêm trạm vào timeline (tự động set endTime cho trạm trước)
- Cập nhật chất lượng (OK/NG) và tự động:
  - Set endTime cho trạm cuối cùng
  - Tăng `actualDay` trong production_daily_plans
  - Tăng `cumulative` trong production_month_plans

### 2. Tự động cập nhật count khi xóa
- Khi xóa production status có quality, tự động:
  - Giảm `actualDay` trong production_daily_plans
  - Giảm `cumulative` trong production_month_plans
  - Đảm bảo count không xuống âm

### 3. Station Timeline
- Lưu trữ timeline của xe qua các trạm dưới dạng JSONB
- Mỗi entry bao gồm: stationID, stationName, startTime, endTime

### 4. Quản lý Kế hoạch Sản xuất
- Kế hoạch tháng và kế hoạch ngày
- Tự động tính toán lũy kế
- Bảng tổng hợp theo ngày

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Scripts

- `npm run dev` - Chạy development mode với hot reload
- `npm run build` - Build production
- `npm run start:prod` - Chạy production
- `npm run lint` - Lint code
- `npm run format` - Format code với Prettier

## 🐛 Troubleshooting

### Database connection error
- Kiểm tra PostgreSQL đã chạy chưa
- Kiểm tra thông tin kết nối trong `database.module.ts`
- Đảm bảo database đã được tạo

### Port 3000 already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

## 📄 License

UNLICENSED - Private project

## 👥 Author

Production Management System Team
