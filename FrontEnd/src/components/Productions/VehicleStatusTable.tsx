import { useState, useEffect, useCallback } from 'react';
import { productionsApi, Production, Station } from '../../services/api';
import { StationManagement } from './StationManagement';
import './VehicleStatusTable.css';

export function VehicleStatusTable() {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [productions, setProductions] = useState<Production[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStationManagement, setShowStationManagement] = useState(false);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productionsApi.getStatus(date);
      console.log('API Response:', data);
      console.log('Stations:', data.stations);
      console.log('Productions:', data.productions);
      setStations(data.stations || []);
      setProductions(data.productions || []);
    } catch (err: any) {
      console.error('Error fetching status:', err);
      setError(err.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const formatTime = (timeString?: string): string => {
    if (!timeString) return '';
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

  const sortedStations = [...stations].sort((a, b) => a.sequence - b.sequence);

  const handleStationsUpdated = () => {
    fetchStatus();
  };

  return (
    <div className="vehicle-status-container">
      <div className="vehicle-status-header">
        <div className="vehicle-status-title-wrapper">
          <div className="vehicle-status-title-bar"></div>
          <h2 className="vehicle-status-title">TRẠNG THÁI XE</h2>
        </div>
        <div className="vehicle-status-header-actions">
          <button
            className="btn-config-stations"
            onClick={() => setShowStationManagement(true)}
            title="Cấu hình trạm"
          >
            ⚙️ Cấu hình trạm
          </button>
          <div className="date-selector">
            <label>Ngày:</label>
            <input
              type="date"
              className="date-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading && <div className="loading">Đang tải...</div>}
      {error && <div className="message message-error">{error}</div>}

      {!loading && !error && (
        <div className="table-wrapper">
          {sortedStations.length === 0 && (
            <div className="message message-error" style={{ marginBottom: '1rem' }}>
              Không có trạm nào được cấu hình. Vui lòng thêm trạm vào database.
            </div>
          )}
          <table className="vehicle-status-table">
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

      {showStationManagement && (
        <StationManagement
          onClose={() => setShowStationManagement(false)}
          onStationsUpdated={handleStationsUpdated}
        />
      )}
    </div>
  );
}
