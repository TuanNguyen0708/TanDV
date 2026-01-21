import { useCallback, useEffect, useState } from 'react';
import {
  stationDailyStatusApi,
  stationsApi,
  StationDailyStatus,
  Station,
} from '../../services/api';
import { StationDailyModal } from './StationDailyModal';
import { DeleteStationDailyModal } from './DeleteStationDailyModal';
import './StationDaily.css';

export function StationDaily() {
  const [stationDailyStatuses, setStationDailyStatuses] = useState<StationDailyStatus[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStation, setFilterStation] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<StationDailyStatus | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusData, stationsData] = await Promise.all([
        stationDailyStatusApi.getAll(),
        stationsApi.getAllStations(),
      ]);
      setStationDailyStatuses(statusData || []);
      setStations(stationsData || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err?.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = () => {
    setSelectedStatus(null);
    setShowModal(true);
  };

  const handleEdit = (status: StationDailyStatus) => {
    setSelectedStatus(status);
    setShowModal(true);
  };

  const handleDelete = (status: StationDailyStatus) => {
    setSelectedStatus(status);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (data: Omit<StationDailyStatus, 'id'>) => {
    try {
      if (selectedStatus) {
        await stationDailyStatusApi.update(selectedStatus.id, data);
      } else {
        await stationDailyStatusApi.create(data);
      }
      setShowModal(false);
      setSelectedStatus(null);
      fetchData();
    } catch (err: any) {
      console.error('Error saving station daily status:', err);
      setError(err?.message || 'Lỗi khi lưu dữ liệu');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedStatus) return;
    try {
      await stationDailyStatusApi.delete(selectedStatus.id);
      setShowDeleteModal(false);
      setSelectedStatus(null);
      fetchData();
    } catch (err: any) {
      console.error('Error deleting station daily status:', err);
      setError(err?.message || 'Lỗi khi xóa dữ liệu');
    }
  };

  const getStationName = (stationID: string): string => {
    const station = stations.find((s) => s.id === stationID);
    return station ? station.stationName : stationID;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatTime = (timeString?: string): string => {
    if (!timeString) return '-';
    // Time string is already in HH:mm:ss format from backend
    // Just format it to HH:mm
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const formatDowntime = (minutes?: number): string => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const filteredStatuses = stationDailyStatuses.filter((status) => {
    const matchesSearch =
      searchTerm === '' ||
      getStationName(status.stationID).toLowerCase().includes(searchTerm.toLowerCase()) ||
      status.statusDate.includes(searchTerm);

    const matchesStation = filterStation === '' || status.stationID === filterStation;

    return matchesSearch && matchesStation;
  });

  return (
    <div className="station-daily-page">
      {/* Header */}
      <header className="page-header">
        <h1>TRẠNG THÁI TRẠM HÀNG NGÀY</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          + Thêm mới
        </button>
      </header>

      {/* Main Content */}
      <main className="station-daily-main">
        {/* Filters */}
        <div className="filters">
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm theo trạm, ngày..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="filter-group">
            <label htmlFor="filterStation">Trạm:</label>
            <select
              id="filterStation"
              className="filter-select"
              value={filterStation}
              onChange={(e) => setFilterStation(e.target.value)}
            >
              <option value="">Tất cả</option>
              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.stationName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Table */}
        <div className="table-container">
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <table className="station-daily-table">
              <thead>
                <tr>
                  <th>Trạm</th>
                  <th>Ngày</th>
                  <th>Giờ bắt đầu</th>
                  <th>Giờ kết thúc</th>
                  <th>Tổng downtime</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredStatuses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="no-data">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  filteredStatuses.map((status) => (
                    <tr key={status.id}>
                      <td>{getStationName(status.stationID)}</td>
                      <td>{formatDate(status.statusDate)}</td>
                      <td>{formatTime(status.startTime)}</td>
                      <td>{formatTime(status.stopTime)}</td>
                      <td>{formatDowntime(status.totalDowntime)}</td>
                      <td>
                        <div className="actions">
                          <button
                            className="btn btn-edit"
                            onClick={() => handleEdit(status)}
                            title="Sửa"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-delete"
                            onClick={() => handleDelete(status)}
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modals */}
      {showModal && (
        <StationDailyModal
          status={selectedStatus}
          stations={stations}
          onClose={() => {
            setShowModal(false);
            setSelectedStatus(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      {showDeleteModal && selectedStatus && (
        <DeleteStationDailyModal
          status={selectedStatus}
          stationName={getStationName(selectedStatus.stationID)}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedStatus(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
