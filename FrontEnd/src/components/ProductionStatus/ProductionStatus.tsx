import { useEffect, useState } from 'react';
import {
  ProductionStatus,
  productionStatusApi,
} from '../../services/api';
import { ProductionStatusModal } from './ProductionStatusModal';
import { DeleteProductionStatusModal } from './DeleteProductionStatusModal';
import { UpdateStationModal } from './UpdateStationModal';
import './ProductionStatus.css';

export function ProductionStatusPage() {
  const [productionStatuses, setProductionStatuses] = useState<ProductionStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateStationModalOpen, setIsUpdateStationModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ProductionStatus | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterQuality, setFilterQuality] = useState<'ALL' | 'OK' | 'NG'>('ALL');

  useEffect(() => {
    fetchProductionStatuses();
  }, []);

  const fetchProductionStatuses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productionStatusApi.getAll();
      setProductionStatuses(data);
    } catch (err: any) {
      setError(err?.message || 'Lỗi khi tải dữ liệu');
      console.error('Error fetching production statuses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedStatus(null);
    setIsModalOpen(true);
  };

  const handleEdit = (status: ProductionStatus) => {
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  const handleDelete = (status: ProductionStatus) => {
    setSelectedStatus(status);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateStation = (status: ProductionStatus) => {
    setSelectedStatus(status);
    setIsUpdateStationModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedStatus) {
        await productionStatusApi.update(selectedStatus.id, data);
      } else {
        await productionStatusApi.create(data);
      }
      setIsModalOpen(false);
      fetchProductionStatuses();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Lỗi khi lưu dữ liệu';
      alert(errorMessage);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedStatus) return;
    try {
      await productionStatusApi.delete(selectedStatus.id);
      setIsDeleteModalOpen(false);
      fetchProductionStatuses();
    } catch (err: any) {
      alert(err?.message || 'Lỗi khi xóa dữ liệu');
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getStationInfo = (status: ProductionStatus): string => {
    if (!status.stationTimeline || status.stationTimeline.length === 0) {
      return 'Chưa bắt đầu';
    }
    const currentStation = status.stationTimeline[status.stationTimeline.length - 1];
    if (currentStation.endTime) {
      return `Hoàn thành (${status.stationTimeline.length} trạm)`;
    }
    return `${currentStation.stationName || 'Trạm'} (${status.stationTimeline.length}/${status.stationTimeline.length})`;
  };

  const getTotalDuration = (status: ProductionStatus): string => {
    if (!status.stationTimeline || status.stationTimeline.length === 0) {
      return '-';
    }
    const firstStation = status.stationTimeline[0];
    const lastStation = status.stationTimeline[status.stationTimeline.length - 1];
    
    if (!firstStation.startTime) return '-';
    
    const endTime = lastStation.endTime 
      ? new Date(lastStation.endTime).getTime()
      : new Date().getTime();
    
    const startTime = new Date(firstStation.startTime).getTime();
    const minutes = Math.round((endTime - startTime) / 60000);
    
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Filter logic
  const filteredStatuses = productionStatuses.filter((status) => {
    const matchSearch =
      status.vehicleID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      status.modelID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (status.remark && status.remark.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchQuality =
      filterQuality === 'ALL' ||
      (filterQuality === 'OK' && status.quality === 'OK') ||
      (filterQuality === 'NG' && status.quality === 'NG');

    return matchSearch && matchQuality;
  });

  return (
    <div className="production-status-page">
      <div className="page-header">
        <h1>QUẢN LÝ PRODUCTION STATUS</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          + Thêm mới
        </button>
      </div>

      <div className="production-status-main">
        <div className="filters">
        <input
          type="text"
          placeholder="Tìm kiếm theo số xe, model, ghi chú..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="filter-group">
          <label>Chất lượng:</label>
          <select
            value={filterQuality}
            onChange={(e) => setFilterQuality(e.target.value as 'ALL' | 'OK' | 'NG')}
            className="filter-select"
          >
            <option value="ALL">Tất cả</option>
            <option value="OK">OK</option>
            <option value="NG">NG</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <div className="table-container">
          <table className="production-status-table">
            <thead>
              <tr>
                <th>Số xe</th>
                <th>Model</th>
                <th>Ngày sản xuất</th>
                <th>Trạng thái / Trạm</th>
                <th>Tổng thời gian</th>
                <th>Chất lượng</th>
                <th>Ghi chú</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStatuses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="no-data">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredStatuses.map((status) => (
                  <tr key={status.id}>
                    <td className="vehicle-id">{status.vehicleID}</td>
                    <td>{status.modelID}</td>
                    <td>{formatDate(status.productionDate)}</td>
                    <td>{getStationInfo(status)}</td>
                    <td>{getTotalDuration(status)}</td>
                    <td>
                      {status.quality ? (
                        <span className={`quality-badge quality-${status.quality.toLowerCase()}`}>
                          {status.quality}
                        </span>
                      ) : (
                        <span className="quality-badge quality-none">-</span>
                      )}
                    </td>
                    <td className="remark">{status.remark || '-'}</td>
                    <td className="actions">
                      <button
                        className="btn btn-station"
                        onClick={() => handleUpdateStation(status)}
                        title="Cập nhật trạm"
                      >
                        🏭
                      </button>
                      <button
                        className="btn btn-edit"
                        onClick={() => handleEdit(status)}
                        title="Sửa thông tin"
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      </div>

      {isModalOpen && (
        <ProductionStatusModal
          status={selectedStatus}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      {isDeleteModalOpen && selectedStatus && (
        <DeleteProductionStatusModal
          status={selectedStatus}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {isUpdateStationModalOpen && selectedStatus && (
        <UpdateStationModal
          status={selectedStatus}
          onClose={() => setIsUpdateStationModalOpen(false)}
          onSuccess={fetchProductionStatuses}
        />
      )}
    </div>
  );
}
