import { useCallback, useEffect, useState } from 'react';
import { stationsApi, Station } from '../../services/api';
import { StationModal } from './StationModal';
import { DeleteStationModal } from './DeleteStationModal';
import './Stations.css';

export function Stations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [deletingStation, setDeletingStation] = useState<Station | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchStations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await stationsApi.getAllStations();
      setStations(data);
    } catch (err: any) {
      console.error('Error fetching stations:', err);
      setError(err?.response?.data?.message || err?.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  const handleOpenModal = (station?: Station) => {
    setEditingStation(station || null);
    setError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (!submitting) {
      setShowModal(false);
      setEditingStation(null);
    }
  };

  const handleSubmit = async (data: Omit<Station, 'id'>) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      if (editingStation) {
        await stationsApi.updateStation(editingStation.id, data);
        setSuccess('Cập nhật station thành công!');
      } else {
        await stationsApi.createStation(data);
        setSuccess('Tạo station thành công!');
      }
      await fetchStations();
      setShowModal(false);
      setEditingStation(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving station:', err);
      setError(err?.response?.data?.message || err?.message || 'Lỗi khi lưu station');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (station: Station) => {
    setDeletingStation(station);
    setError(null);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    if (!submitting) {
      setShowDeleteModal(false);
      setDeletingStation(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingStation) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await stationsApi.deleteStation(deletingStation.id);
      await fetchStations();
      setShowDeleteModal(false);
      setDeletingStation(null);
      setSuccess('Xóa station thành công!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting station:', err);
      setError(err?.response?.data?.message || err?.message || 'Lỗi khi xóa station');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="stations">
      {/* Header */}
      <header className="stations-header">
        <div className="stations-header-left">QUẢN LÝ STATION</div>
        <div className="stations-header-center">DANH SÁCH STATION</div>
        <div className="stations-header-right">
          <button
            className="stations-button stations-button-create"
            onClick={() => handleOpenModal()}
            disabled={submitting}
          >
            + Tạo station mới
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="stations-main">
        {loading && stations.length === 0 ? (
          <div className="stations-loading">Đang tải...</div>
        ) : error && stations.length === 0 ? (
          <div className="stations-error">{error}</div>
        ) : (
          <div className="stations-table-wrapper">
            <table className="stations-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên Station</th>
                  <th>Mô tả</th>
                  <th>Trạng thái hiện tại</th>
                  <th>Hoạt động</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {stations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="no-data">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  stations.map((station) => (
                    <tr key={station.id}>
                      <td>{station.id}</td>
                      <td>{station.stationName}</td>
                      <td>{station.description || <span style={{ color: '#888', fontStyle: 'italic' }}>-</span>}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            station.currentStatusCode === 'RUNNING'
                              ? 'status-running'
                              : station.currentStatusCode === 'IDLE'
                              ? 'status-idle'
                              : station.currentStatusCode === 'STOP'
                              ? 'status-stop'
                              : 'status-emergency'
                          }`}
                        >
                          {station.currentStatusCode === 'RUNNING'
                            ? 'Đang chạy'
                            : station.currentStatusCode === 'IDLE'
                            ? 'Rảnh'
                            : station.currentStatusCode === 'STOP'
                            ? 'Dừng'
                            : 'Khẩn cấp'}
                        </span>
                        {station.currentStatusBrief && (
                          <div style={{ fontSize: '0.85em', color: '#888', marginTop: '4px' }}>
                            {station.currentStatusBrief}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            station.isActive ? 'status-active' : 'status-inactive'
                          }`}
                        >
                          {station.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                      <td className="action-cell">
                        <div className="action-buttons">
                          <button
                            className="action-btn action-btn-edit"
                            onClick={() => handleOpenModal(station)}
                            title="Sửa"
                          >
                            Sửa
                          </button>
                          <button
                            className="action-btn action-btn-delete"
                            onClick={() => handleDelete(station)}
                            title="Xóa"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {error && (
        <div className="stations-error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="stations-success-message">
          {success}
        </div>
      )}

      <StationModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        loading={submitting}
        initialData={editingStation || undefined}
      />

      <DeleteStationModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        loading={submitting}
        station={deletingStation}
      />
    </div>
  );
}
