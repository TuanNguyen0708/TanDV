# Frontend - Hệ thống Quản lý Sản xuất Xưởng Lắp Ráp

Frontend application cho hệ thống quản lý sản xuất, theo dõi trạng thái xe và trạm làm việc trong xưởng lắp ráp.

## 🚀 Công nghệ sử dụng

- **Framework**: React 18.x
- **Language**: TypeScript 5.x
- **Build Tool**: Vite 5.x
- **Routing**: React Router DOM 7.x
- **HTTP Client**: Axios 1.6.x
- **Date Picker**: React DatePicker 9.x
- **Styling**: CSS Modules

## 📋 Yêu cầu hệ thống

- Node.js >= 18.x
- npm hoặc yarn

## 🔧 Cài đặt

1. **Clone repository và di chuyển vào thư mục Frontend**
```bash
cd FrontEnd
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình API endpoint**

File `src/services/api.ts` - cấu hình base URL:
```typescript
const API_BASE_URL = 'http://localhost:3000';
```

## 🏃 Chạy ứng dụng

### Development mode
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

### Build production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## 📁 Cấu trúc thư mục

```
FrontEnd/
├── public/                        # Static assets
├── src/
│   ├── App.tsx                    # Component chính
│   ├── main.tsx                   # Entry point
│   ├── components/                # React components
│   │   ├── Models/                # Quản lý loại xe
│   │   │   ├── Models.tsx
│   │   │   └── Models.css
│   │   ├── Stations/              # Quản lý trạm
│   │   │   ├── Stations.tsx
│   │   │   ├── StationModal.tsx
│   │   │   └── Stations.css
│   │   ├── ProductionStatus/      # Quản lý trạng thái xe
│   │   │   ├── ProductionStatus.tsx
│   │   │   ├── ProductionStatusModal.tsx
│   │   │   ├── UpdateStationModal.tsx
│   │   │   └── ProductionStatus.css
│   │   ├── Productions/           # Kế hoạch sản xuất & Overview
│   │   │   ├── ProductionPlans.tsx
│   │   │   ├── ProductionPlanTable.tsx
│   │   │   ├── ProductionOverview.tsx
│   │   │   ├── CreatePlanModal.tsx
│   │   │   └── ProductionOverview.css
│   │   └── StationDaily/          # Trạng thái trạm theo ngày
│   │       ├── StationDaily.tsx
│   │       └── StationDaily.css
│   ├── services/                  # API services
│   │   └── api.ts                 # Axios configuration & API calls
│   └── styles/                    # Global styles
```

## 🎨 Các trang chính

### 1. Overview (Trang tổng quan)
**Route**: `/`

Hiển thị bảng thông tin sản xuất tổng quan bao gồm:
- **Kế hoạch sản xuất**: Bảng tổng hợp kế hoạch theo ngày
  - Loại xe, KH ngày, Hoàn thành, KH tháng, Lũy kế, Tiến độ %
- **Trạng thái xe**: Bảng theo dõi từng xe qua các trạm
  - Mã số, Loại xe, Ngày sản xuất
  - Timeline các trạm (thời gian bắt đầu - kết thúc)
  - Chất lượng (OK/NG), Ghi chú
- **Trạng thái trạm**: Hiển thị trạng thái real-time của các trạm
  - Running, Stop, Idle, Emergency
  - Downtime của ngày

**Tính năng**:
- Tự động refresh mỗi 30 giây
- Hiển thị thời gian thực
- Responsive design

### 2. Production Plans (Kế hoạch sản xuất)
**Route**: `/plans`

Quản lý kế hoạch sản xuất theo tháng và ngày:
- Tạo/cập nhật kế hoạch tháng
- Tạo/cập nhật kế hoạch ngày
- Cập nhật số lượng hoàn thành
- Xóa kế hoạch

### 3. Production Status (Trạng thái xe)
**Route**: `/production-status`

Quản lý trạng thái sản xuất của từng xe:
- Thêm xe mới vào sản xuất
- Cập nhật trạm hiện tại của xe
- Cập nhật chất lượng khi hoàn thành
- Xem timeline chi tiết qua các trạm
- Xóa production status

**Tính năng đặc biệt**:
- Thêm trạm: Tự động set endTime cho trạm trước
- Cập nhật chất lượng: Checkbox để đánh dấu trạm cuối + chọn OK/NG
- Timeline hiển thị thời gian và duration

### 4. Stations (Quản lý trạm)
**Route**: `/stations`

Quản lý các trạm làm việc:
- Thêm/sửa/xóa trạm
- Cập nhật trạng thái trạm (Running/Stop/Idle/Emergency)
- Ghi chú trạng thái hiện tại
- Active/Inactive trạm

### 5. Station Daily (Trạng thái trạm theo ngày)
**Route**: `/station-daily`

Theo dõi trạng thái trạm theo từng ngày:
- Thời gian bắt đầu/kết thúc
- Tổng downtime
- Log downtime chi tiết

### 6. Models (Quản lý loại xe)
**Route**: `/models`

Quản lý các loại xe/model:
- Thêm/sửa/xóa model
- Model ID, tên, mô tả

## 🔌 API Integration

File `src/services/api.ts` chứa tất cả API calls:

### Production Status API
```typescript
productionStatusApi.getAll()
productionStatusApi.getById(id)
productionStatusApi.create(data)
productionStatusApi.update(id, data)
productionStatusApi.addStation(id, data)
productionStatusApi.updateQuality(id, data)
productionStatusApi.delete(id)
```

### Stations API
```typescript
stationsApi.getAllStations()
stationsApi.getStationById(id)
stationsApi.createStation(data)
stationsApi.updateStation(id, data)
stationsApi.deleteStation(id)
```

### Production Plans API
```typescript
productionPlansApi.upsertMonthPlan(data)
productionPlansApi.upsertDailyResult(data)
productionPlansApi.getDailySummary(date)
productionPlansApi.getAllDailyPlans(date)
productionPlansApi.getAllMonthPlans(month)
productionPlansApi.deleteDailyPlan(id)
productionPlansApi.deleteMonthPlan(id)
```

### Models API
```typescript
modelsApi.getAllModels()
modelsApi.getModelById(modelId)
modelsApi.createModel(data)
modelsApi.updateModel(modelId, data)
modelsApi.deleteModel(modelId)
```

## 🎨 Styling

### CSS Modules
Mỗi component có file CSS riêng:
- `ProductionOverview.css` - Style cho trang overview
- `ProductionStatus.css` - Style cho quản lý production status
- `Stations.css` - Style cho quản lý trạm
- `Models.css` - Style cho quản lý models

### DatePicker Styles
File `DatePickerStyles.css` chứa custom styles cho React DatePicker component.

### Theme Colors
```css
/* Primary colors */
--primary-blue: #1890ff
--success-green: #52c41a
--warning-orange: #fa8c16
--error-red: #ff4d4f

/* Status colors */
--status-running: #52c41a (green)
--status-stop: #ff4d4f (red)
--status-idle: #d9d9d9 (gray)
--status-emergency: #fa8c16 (orange)

/* Quality badges */
--quality-ok: green
--quality-ng: red
```

## 📱 Responsive Design

Ứng dụng được tối ưu cho:
- Desktop (1920x1080)
- Tablet (768px - 1024px)
- Mobile (< 768px)

## 🔑 Tính năng chính

### 1. Real-time Updates
- Auto-refresh mỗi 30 giây ở trang Overview
- Cập nhật trạng thái trạm real-time
- Hiển thị thời gian hiện tại

### 2. Production Status Management
- Thêm xe vào sản xuất
- Cập nhật trạm + checkbox cập nhật chất lượng
- Timeline tracking qua các trạm
- Tự động tính toán duration

### 3. Station Timeline Display
- Format: `HH:mm - HH:mm (duration')`
- Hiển thị "..." nếu chưa có thời gian
- Hiển thị "HH:mm – ..." nếu đang xử lý

### 4. Quality Management
- Checkbox "Cập nhật chất lượng" khi thêm trạm
- Select chất lượng (OK/NG) xuất hiện khi tick checkbox
- Tự động cập nhật count trong kế hoạch sản xuất

### 5. Data Validation
- Validate form inputs
- Error messages hiển thị rõ ràng
- Confirmation dialog khi xóa

## 🧪 Development

### Lint code
```bash
npm run lint
```

### Type checking
TypeScript sẽ tự động check types trong quá trình development.

## 🔧 Configuration

### Vite Config
File `vite.config.ts` - cấu hình build và development server:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})
```

### TypeScript Config
File `tsconfig.json` - cấu hình TypeScript compiler.

## 📊 Data Flow

```
Component → API Service → Axios → Backend API
                ↓
        Update State (useState)
                ↓
        Re-render Component
```

## 🐛 Troubleshooting

### CORS Error
Backend cần enable CORS cho frontend origin:
```typescript
app.enableCors({
  origin: 'http://localhost:5173'
});
```

### API Connection Error
- Kiểm tra Backend đã chạy chưa (port 3000)
- Kiểm tra API_BASE_URL trong `src/services/api.ts`

### Port 5173 already in use
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5173
kill -9 <PID>
```

### Build Error
```bash
# Clean node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 Scripts

- `npm run dev` - Chạy development server với HMR
- `npm run build` - Build production (TypeScript + Vite)
- `npm run preview` - Preview production build
- `npm run lint` - Lint code với ESLint

## 🚀 Deployment

### Build production
```bash
npm run build
```

Output sẽ nằm trong folder `dist/`

### Serve static files
Có thể dùng bất kỳ static file server nào:
```bash
# Sử dụng serve
npx serve -s dist

# Sử dụng http-server
npx http-server dist
```

## 📄 License

UNLICENSED - Private project

## 👥 Author

Production Management System Team

## 🔗 Related

- Backend Repository: `../BackEnd`
- API Documentation: `http://localhost:3000/api`
