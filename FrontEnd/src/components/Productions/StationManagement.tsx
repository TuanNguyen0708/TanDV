import { useState, useEffect } from 'react';
import { stationsApi, Station } from '../../services/api';
import './StationManagement.css';

interface StationManagementProps {
  onClose: () => void;
  onStationsUpdated: () => void;
}

export function StationManagement({
  onClose,
  onStationsUpdated,
}: StationManagementProps) {
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
        await stationsApi.updateStation(editingStation.id, formData);
      } else {
        await stationsApi.createStation(formData);
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
    <div className="station-management-overlay" onClick={onClose}>
      <div className="station-management-modal" onClick={(e) => e.stopPropagation()}>
        <div className="station-management-header">
          <h2>Quản lý trạm</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="message message-error">{error}</div>}

        <div className="station-management-content">
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
