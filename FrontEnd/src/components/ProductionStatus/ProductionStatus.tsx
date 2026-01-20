import { useEffect, useState } from 'react';
import {
  ProductionStatus,
  productionStatusApi,
} from '../../services/api';
import { ProductionStatusModal } from './ProductionStatusModal';
import { DeleteProductionStatusModal } from './DeleteProductionStatusModal';
import './ProductionStatus.css';

export function ProductionStatusPage() {
  const [productionStatuses, setProductionStatuses] = useState<ProductionStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

  const handleSubmit = async (data: Omit<ProductionStatus, 'id'>) => {
    try {
      if (selectedStatus) {
        await productionStatusApi.update(selectedStatus.id, data);
      } else {
        await productionStatusApi.create(data);
      }
      setIsModalOpen(false);
      fetchProductionStatuses();
    } catch (err: any) {
      alert(err?.message || 'Lỗi khi lưu dữ liệu');
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

  const formatDateTime = (dateTimeString?: string): string => {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const calculateDuration = (start?: string, end?: string): string => {
    if (!start || !end) return '-';
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const minutes = Math.round((endTime - startTime) / 60000);
    return `${minutes} phút`;
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
                <th>Giờ bắt đầu</th>
                <th>Giờ kết thúc</th>
                <th>Thời gian</th>
                <th>Chất lượng</th>
                <th>Ghi chú</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStatuses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="no-data">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredStatuses.map((status) => (
                  <tr key={status.id}>
                    <td className="vehicle-id">{status.vehicleID}</td>
                    <td>{status.modelID}</td>
                    <td>{formatDate(status.productionDate)}</td>
                    <td>{formatDateTime(status.stationStart)}</td>
                    <td>{formatDateTime(status.stationEnd)}</td>
                    <td>{calculateDuration(status.stationStart, status.stationEnd)}</td>
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
    </div>
  );
}
