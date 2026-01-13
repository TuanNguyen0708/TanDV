import { useState, useEffect, useCallback } from 'react';
import { productionsApi, stationsApi, Station, StationStatus } from '../../services/api';
import './StationStatusDisplay.css';

interface StationStatusItem {
  station: {
    id: string;
    code: string;
    name: string;
    sequence: number;
  };
  status: StationStatus | null;
  reason: string | null;
  productionNo: string | null;
}

interface StationStatusResponse {
  stations: StationStatusItem[];
}

export function StationStatusDisplay() {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [stationStatuses, setStationStatuses] = useState<StationStatusItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStationManagement, setShowStationManagement] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState<StationStatusItem | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<StationStatus | null>(null);
  const [reasonInput, setReasonInput] = useState('');

  const fetchStationStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productionsApi.getStationStatus(date);
      setStationStatuses(data.stations || []);
    } catch (err: any) {
      console.error('Error fetching station status:', err);
      setError(err.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchStationStatus();
  }, [fetchStationStatus]);

  const handleStationsUpdated = () => {
    fetchStationStatus();
  };

  const getStatusInfo = (status: string | null) => {
    switch (status) {
      case 'RUNNING':
        return {
          label: 'RUNNING',
          className: 'status-running',
        };
      case 'STOP':
        return {
          label: 'STOP',
          className: 'status-stop',
        };
      case 'COMPLETED':
        return {
          label: 'HOÀN THÀNH',
          className: 'status-completed',
        };
      case 'PENDING':
        return {
          label: 'CHỜ XỬ LÝ',
          className: 'status-pending',
        };
      default:
        return {
          label: 'CHƯA CÓ DỮ LIỆU',
          className: 'status-unknown',
        };
    }
  };

  const handleStatusAction = (item: StationStatusItem, status: StationStatus) => {
    if (status === 'STOP' || status === 'PENDING') {
      setSelectedStation(item);
      setSelectedStatus(status);
      setReasonInput(item.reason || '');
      setShowReasonModal(true);
    } else {
      updateStatus(item.station.id, status, '');
    }
  };

  const updateStatus = async (stationId: string, status: StationStatus, reason: string) => {
    try {
      await productionsApi.updateStationStatusByDate(date, stationId, {
        status,
        reason: reason || undefined,
      });
      await fetchStationStatus();
      setShowReasonModal(false);
      setSelectedStation(null);
      setSelectedStatus(null);
      setReasonInput('');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleReasonSubmit = () => {
    if (selectedStation && selectedStatus) {
      updateStatus(selectedStation.station.id, selectedStatus, reasonInput);
    }
  };

  const sortedStations = [...stationStatuses].sort(
    (a, b) => a.station.sequence - b.station.sequence
  );

  return (
    <div className="station-status-container">
      <div className="station-status-header">
        <div className="station-status-title-wrapper">
          <div className="station-status-title-bar"></div>
          <h2 className="station-status-title">TRẠNG THÁI TRẠM</h2>
        </div>
        <div className="station-status-header-actions">
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
        <div className="station-status-grid">
          {sortedStations.length === 0 ? (
            <div className="message message-error">
              Không có trạm nào được cấu hình.
            </div>
          ) : (
            sortedStations.map((item) => {
              const statusInfo = getStatusInfo(item.status);
              return (
                <div
                  key={item.station.id}
                  className={`station-status-card ${statusInfo.className}`}
                >
                  <div className="station-status-card-header">
                    Trạm {item.station.sequence} – {item.station.name}
                  </div>
                  <div className="station-status-card-body">
                    <div className="station-status-label">{statusInfo.label}</div>
                    {item.reason && (
                      <div className="station-status-reason">{item.reason}</div>
                    )}
                    {item.productionNo && (
                      <div className="station-status-production">
                        Xe: {item.productionNo}
                      </div>
                    )}
                  </div>
                  <div className="station-status-actions">
                    <button
                      className={`action-btn ${item.status === 'RUNNING' ? 'active' : ''}`}
                      onClick={() => handleStatusAction(item, 'RUNNING')}
                    >
                      RUNNING
                    </button>
                    <button
                      className={`action-btn ${item.status === 'PENDING' ? 'active' : ''}`}
                      onClick={() => handleStatusAction(item, 'PENDING')}
                    >
                      PENDING
                    </button>
                    <button
                      className={`action-btn ${item.status === 'COMPLETED' ? 'active' : ''}`}
                      onClick={() => handleStatusAction(item, 'COMPLETED')}
                    >
                      COMPLETED
                    </button>
                    <button
                      className={`action-btn ${item.status === 'STOP' ? 'active' : ''}`}
                      onClick={() => handleStatusAction(item, 'STOP')}
                    >
                      STOP
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {showStationManagement && (
        <StationManagementModal
          onClose={() => setShowStationManagement(false)}
          onStationsUpdated={handleStationsUpdated}
        />
      )}

      {showReasonModal && selectedStation && selectedStatus && (
        <ReasonModal
          stationName={selectedStation.station.name}
          status={selectedStatus}
          reason={reasonInput}
          onReasonChange={setReasonInput}
          onSubmit={handleReasonSubmit}
          onClose={() => {
            setShowReasonModal(false);
            setSelectedStation(null);
            setSelectedStatus(null);
            setReasonInput('');
          }}
        />
      )}
    </div>
  );
}

// Station Management Modal Component
interface StationManagementModalProps {
  onClose: () => void;
  onStationsUpdated: () => void;
}

function StationManagementModal({
  onClose,
  onStationsUpdated,
}: StationManagementModalProps) {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    sequence: 1,
    isActive: true,
  });

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await stationsApi.getAllStations();
      setStations(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách trạm');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingStation) {
        await productionsApi.updateStation(editingStation.id, formData);
      } else {
        await productionsApi.createStation(formData);
      }
      await fetchStations();
      onStationsUpdated();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Lỗi khi lưu trạm');
    }
  };

  const handleEdit = (station: Station) => {
    setEditingStation(station);
    setIsCreating(false);
    setFormData({
      code: station.code,
      name: station.name,
      sequence: station.sequence,
      isActive: station.isActive,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa trạm này?')) {
      return;
    }

    try {
      await stationsApi.deleteStation(id);
      await fetchStations();
      onStationsUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Lỗi khi xóa trạm');
    }
  };

  const handleCreate = () => {
    setEditingStation(null);
    setIsCreating(true);
    setFormData({
      code: '',
      name: '',
      sequence: stations.length > 0 ? Math.max(...stations.map(s => s.sequence)) + 1 : 1,
      isActive: true,
    });
  };

  const resetForm = () => {
    setEditingStation(null);
    setIsCreating(false);
    setFormData({
      code: '',
      name: '',
      sequence: 1,
      isActive: true,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Quản lý trạm</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="message message-error">{error}</div>}

        <div className="modal-body">
          <div className="station-form-section">
            <div className="section-header">
              <h3>{editingStation ? 'Chỉnh sửa trạm' : isCreating ? 'Thêm trạm mới' : 'Thông tin trạm'}</h3>
              {!editingStation && !isCreating && (
                <button className="btn btn-primary" onClick={handleCreate}>
                  + Thêm trạm
                </button>
              )}
            </div>

            {(isCreating || editingStation) && (
              <form onSubmit={handleSubmit} className="station-form">
                <div className="form-group">
                  <label>Mã trạm *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    maxLength={50}
                  />
                </div>

                <div className="form-group">
                  <label>Tên trạm *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    maxLength={100}
                  />
                </div>

                <div className="form-group">
                  <label>Thứ tự *</label>
                  <input
                    type="number"
                    value={formData.sequence}
                    onChange={(e) => setFormData({ ...formData, sequence: parseInt(e.target.value) || 1 })}
                    required
                    min={1}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    {' '}Kích hoạt
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingStation ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="station-list-section">
            <h3>Danh sách trạm ({stations.length})</h3>
            {loading ? (
              <div className="loading">Đang tải...</div>
            ) : (
              <div className="station-list">
                {stations.length === 0 ? (
                  <div className="no-data">Chưa có trạm nào</div>
                ) : (
                  stations.map((station) => (
                    <div
                      key={station.id}
                      className={`station-item ${!station.isActive ? 'inactive' : ''}`}
                    >
                      <div className="station-info">
                        <div className="station-code">{station.code}</div>
                        <div className="station-name">{station.name}</div>
                        <div className="station-meta">
                          Thứ tự: {station.sequence} |{' '}
                          {station.isActive ? (
                            <span className="status-active">Đang hoạt động</span>
                          ) : (
                            <span className="status-inactive">Tạm dừng</span>
                          )}
                        </div>
                      </div>
                      <div className="station-actions">
                        <button
                          className="btn-icon"
                          onClick={() => handleEdit(station)}
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => handleDelete(station.id)}
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reason Modal Component
interface ReasonModalProps {
  stationName: string;
  status: StationStatus;
  reason: string;
  onReasonChange: (reason: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

function ReasonModal({
  stationName,
  status,
  reason,
  onReasonChange,
  onSubmit,
  onClose,
}: ReasonModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content reason-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Cập nhật trạng thái: {status}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Trạm: {stationName}</label>
          </div>
          <div className="form-group">
            <label>Lý do (tùy chọn):</label>
            <textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Nhập lý do..."
              rows={4}
              className="reason-input"
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-primary" onClick={onSubmit}>
              Xác nhận
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
