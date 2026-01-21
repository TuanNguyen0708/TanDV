import {useCallback, useEffect, useState} from 'react';
import {
  productionPlansApi,
  productionStatusApi,
  ProductionStatus,
  Station,
  stationsApi,
  stationDailyStatusApi,
  StationDailyStatus,
  SummaryResponse
} from '../../services/api';
import { ProductionPlanTable } from './ProductionPlanTable';
import './ProductionOverview.css';

export function ProductionOverview() {
  const [date] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [productionStatuses, setProductionStatuses] = useState<ProductionStatus[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [stationDailyStatuses, setStationDailyStatuses] = useState<StationDailyStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all data in parallel using NEW APIs
      const [summaryData, productionStatusData, stationsData, stationDailyData] = await Promise.all([
        productionPlansApi.getDailySummary(date),
        productionStatusApi.getAll(),
        stationsApi.getAllStations(),
        stationDailyStatusApi.getAll(),
      ]);

      setSummary(summaryData);
      setProductionStatuses(productionStatusData || []);
      setStations(stationsData || []);
      setStationDailyStatuses(stationDailyData || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err?.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchAllData().then();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const formatTime = (timeString?: string): string => {
    if (!timeString) return '...';
    const date = new Date(timeString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getStationTimelineEntry = (productionStatus: ProductionStatus, stationID: string) => {
    if (!productionStatus.stationTimeline || productionStatus.stationTimeline.length === 0) {
      return null;
    }
    return productionStatus.stationTimeline.find(entry => entry.stationID === stationID);
  };

  const formatStationTime = (timelineEntry: any): string => {
    if (!timelineEntry) return '...';

    const hasStart = !!timelineEntry.startTime;
    const hasEnd = !!timelineEntry.endTime;

    if (!hasStart) return '...';
    if (hasStart && !hasEnd) {
      return `${formatTime(timelineEntry.startTime)} – ...`;
    }
    if (hasStart && hasEnd) {
      const start = new Date(timelineEntry.startTime);
      const end = new Date(timelineEntry.endTime);
      const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
      return `${formatTime(timelineEntry.startTime)} – ${formatTime(timelineEntry.endTime)} (${minutes}')`;
    }
    return '...';
  };

  const formatDateTime = (date: Date): string => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = days[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${dayName.toUpperCase()}, ${day}/${month}/${year} - ${hours}:${minutes}`;
  };


  const getStatusInfo = (statusCode: string) => {
    switch (statusCode) {
      case 'RUNNING':
        return {
          label: 'RUNNING',
          className: 'overview-status-running',
        };
      case 'STOP':
        return {
          label: 'STOP',
          className: 'overview-status-stop',
        };
      case 'EMERGENCY':
        return {
          label: 'KHẨN CẤP',
          className: 'overview-status-emergency',
        };
      case 'IDLE':
      default:
        return {
          label: 'RẢNH',
          className: 'overview-status-idle',
        };
    }
  };

  const getStationDailyStatus = (stationID: string): StationDailyStatus | undefined => {
    return stationDailyStatuses.find(
      (sds) => sds.stationID === stationID && sds.statusDate === date
    );
  };

  const formatDowntime = (minutes?: number): string => {
    if (!minutes) return '0 phút';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins} phút`;
  };

  return (
    <div className="production-overview">
      {/* Header */}
      <header className="overview-header">
        <div className="overview-header-left">XƯỞNG LẮP RÁP</div>
        <div className="overview-header-center">BẢNG THÔNG TIN SẢN XUẤT</div>
        <div className="overview-header-right">{formatDateTime(currentTime)}</div>
      </header>

      {/* Main Content */}
      <main className="overview-main">
        {/* Production Plan Section */}
        <section className="overview-section production-plan-section">
          <div className="section-header">
            <div className="section-title-bar"></div>
            <h2 className="section-title">KẾ HOẠCH SẢN XUẤT</h2>
          </div>
          <ProductionPlanTable summary={summary} loading={loading && !summary} />
        </section>

        {/* Vehicle Status Section */}
        <section className="overview-section vehicle-status-section">
          <div className="section-header">
            <div className="section-title-bar"></div>
            <h2 className="section-title">TRẠNG THÁI XE</h2>
          </div>
          {loading && productionStatuses.length === 0 ? (
            <div className="overview-loading">Đang tải...</div>
          ) : (
            <div className="overview-table-wrapper">
              <table className="overview-table vehicle-status-table">
                <thead>
                  <tr>
                    <th>Mã số</th>
                    <th>Loại xe</th>
                    <th>Ngày Sản Xuất</th>
                    {stations
                      .filter(station => station.isActive)
                      .map((station, index) => (
                        <th key={station.id}>
                          Trạm {index + 1} - {station.stationName}
                        </th>
                      ))
                    }
                    <th>Chất lượng</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {productionStatuses.length === 0 ? (
                    <tr>
                      <td colSpan={5 + stations.filter(s => s.isActive).length} className="no-data">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    productionStatuses.map((productionStatus) => (
                      <tr key={productionStatus.id}>
                        <td className="vehicle-id-cell">{productionStatus.vehicleID}</td>
                        <td>{productionStatus.modelID}</td>
                        <td>
                          {new Date(productionStatus.productionDate).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </td>
                        {stations
                          .filter(station => station.isActive)
                          .map((station) => {
                            const timelineEntry = getStationTimelineEntry(productionStatus, station.id);
                            return (
                              <td key={station.id}>
                                {formatStationTime(timelineEntry)}
                              </td>
                            );
                          })
                        }
                        <td>
                          {productionStatus.quality ? (
                            <span className={`quality-badge quality-${productionStatus.quality.toLowerCase()}`}>
                              {productionStatus.quality}
                            </span>
                          ) : (
                            <span style={{ color: '#fff', opacity: 0.5, fontStyle: 'italic' }}>-</span>
                          )}
                        </td>
                        <td>{productionStatus.remark || <span style={{ color: '#fff', opacity: 0.5, fontStyle: 'italic' }}>-</span>}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Station Status Section */}
        <section className="overview-section station-status-section">
          <div className="section-header">
            <div className="section-title-bar"></div>
            <h2 className="section-title">TRẠNG THÁI TRẠM</h2>
          </div>
          {loading && stations.length === 0 ? (
            <div className="overview-loading">Đang tải...</div>
          ) : stations.length === 0 ? (
            <div className="overview-error">Không có trạm nào</div>
          ) : (
            <div className="overview-station-grid">
              {stations
                .filter(station => station.isActive)
                .map((station, index) => {
                  const statusInfo = getStatusInfo(station.currentStatusCode);
                  const dailyStatus = getStationDailyStatus(station.id);
                  return (
                    <div
                      key={station.id}
                      className={`overview-station-card ${statusInfo.className}`}
                    >
                      <div className="overview-station-name">
                        Trạm {index + 1} – {station.stationName}
                      </div>
                      <div className="overview-station-status">{statusInfo.label}</div>
                      {station.currentStatusBrief && (
                        <div className="overview-station-reason">{station.currentStatusBrief}</div>
                      )}
                      {dailyStatus && dailyStatus.totalDowntime !== undefined && (
                        <div className="overview-station-downtime">
                          Downtime: {formatDowntime(dailyStatus.totalDowntime)}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </section>
      </main>

      {error && (
        <div className="overview-error-message">
          {error}
        </div>
      )}
    </div>
  );
}
