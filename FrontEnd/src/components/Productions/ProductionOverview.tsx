import {useCallback, useEffect, useState} from 'react';
import {Production, productionPlansApi, productionsApi, Station, SummaryResponse} from '../../services/api';
import './ProductionOverview.css';

export function ProductionOverview() {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [productions, setProductions] = useState<Production[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [stationStatuses, setStationStatuses] = useState<any[]>([]);
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
      // Fetch all data in parallel
      const [summaryData, statusData, stationStatusData] = await Promise.all([
        productionPlansApi.getDailySummary(date),
        productionsApi.getStatus(date),
        productionsApi.getStationStatus(date),
      ]);

      setSummary(summaryData);
      setStations(statusData.stations || []);
      setProductions(statusData.productions || []);
      setStationStatuses(stationStatusData.stations || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchAllData();
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

  const formatStationTime = (production: Production, stationId: string): string => {
    if (!production.stations || production.stations.length === 0) {
      return '...';
    }
    
    const log = production.stations.find((s) => s?.station?.id === stationId);
    if (!log || !log.station) return '...';

    const hasStart = !!log.startTime;
    const hasEnd = !!log.endTime;

    if (!hasStart && !hasEnd) return '...';
    if (hasStart && !hasEnd) {
      return `${formatTime(log.startTime)} – ...`;
    }
    if (hasStart && hasEnd) {
      const minutes = log.periodMinutes || 0;
      return `${formatTime(log.startTime)} – ${formatTime(log.endTime)} (${minutes}')`;
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const getStatusInfo = (status: string | null) => {
    switch (status) {
      case 'RUNNING':
        return {
          label: 'RUNNING',
          className: 'overview-status-running',
        };
      case 'STOP':
        return {
          label: 'STOP',
          className: 'overview-status-stop',
          reason: 'Lỗi',
        };
      case 'PENDING':
        return {
          label: 'TẠM DỪNG',
          className: 'overview-status-pending',
        };
      case 'COMPLETED':
        return {
          label: 'HOÀN THÀNH',
          className: 'overview-status-completed',
        };
      default:
        return {
          label: 'CHƯA CÓ DỮ LIỆU',
          className: 'overview-status-unknown',
        };
    }
  };

  const sortedStations = [...stations].sort((a, b) => a.sequence - b.sequence);
  const sortedStationStatuses = [...stationStatuses].sort(
    (a, b) => a.station.sequence - b.station.sequence
  );

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
          {loading && !summary ? (
            <div className="overview-loading">Đang tải...</div>
          ) : summary ? (
            <div className="overview-table-wrapper">
              <table className="overview-table production-plan-table">
                <thead>
                  <tr>
                    <th>Loại xe</th>
                    <th>KH ngày</th>
                    <th>Hoàn thành</th>
                    <th>KH tháng</th>
                    <th>Lũy kế</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.rows.map((row, index) => (
                    <tr key={index}>
                      <td>{row.model}</td>
                      <td>{formatNumber(row.plannedDay)}</td>
                      <td>{formatNumber(row.actualDay)}</td>
                      <td>{formatNumber(row.plannedMonth)}</td>
                      <td>{formatNumber(row.cumulative)}</td>
                    </tr>
                  ))}
                  {summary.rows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="no-data">
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td><strong>TỔNG</strong></td>
                    <td><strong>{formatNumber(summary.total.plannedDay)}</strong></td>
                    <td><strong>{formatNumber(summary.total.actualDay)}</strong></td>
                    <td><strong>{formatNumber(summary.total.plannedMonth)}</strong></td>
                    <td><strong>{formatNumber(summary.total.cumulative)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="overview-error">Không có dữ liệu</div>
          )}
        </section>

        {/* Vehicle Status Section */}
        <section className="overview-section vehicle-status-section">
          <div className="section-header">
            <div className="section-title-bar"></div>
            <h2 className="section-title">TRẠNG THÁI XE</h2>
          </div>
          {loading && productions.length === 0 ? (
            <div className="overview-loading">Đang tải...</div>
          ) : (
            <div className="overview-table-wrapper">
              <table className="overview-table vehicle-status-table">
                <thead>
                  <tr>
                    <th>Mã số</th>
                    <th>Loại xe</th>
                    {sortedStations.length > 0 ? (
                      sortedStations.map((station, index) => (
                        <th key={station.id}>
                          Trạm {index + 1} – {station.name}
                        </th>
                      ))
                    ) : (
                      <th>Trạm</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {productions.length === 0 ? (
                    <tr>
                      <td colSpan={2 + sortedStations.length} className="no-data">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    productions.map((production) => (
                      <tr key={production.id}>
                        <td>{production.productionNo}</td>
                        <td>{production.model}</td>
                        {sortedStations.length > 0 ? (
                          sortedStations.map((station) => (
                            <td key={station.id}>
                              {formatStationTime(production, station.id)}
                            </td>
                          ))
                        ) : (
                          <td>...</td>
                        )}
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
          {loading && sortedStationStatuses.length === 0 ? (
            <div className="overview-loading">Đang tải...</div>
          ) : sortedStationStatuses.length === 0 ? (
            <div className="overview-error">Không có trạm nào</div>
          ) : (
            <div className="overview-station-grid">
              {sortedStationStatuses.map((item) => {
                const statusInfo = getStatusInfo(item.status);
                return (
                  <div
                    key={item.station.id}
                    className={`overview-station-card ${statusInfo.className}`}
                  >
                    <div className="overview-station-name">
                      Trạm {item.station.sequence} – {item.station.name}
                    </div>
                    <div className="overview-station-status">{statusInfo.label}</div>
                    {item.reason && (
                      <div className="overview-station-reason">{item.reason}</div>
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
