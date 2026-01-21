import { StationDailyStatus } from '../../services/api';

interface DeleteStationDailyModalProps {
  status: StationDailyStatus;
  stationName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteStationDailyModal({
  status,
  stationName,
  onClose,
  onConfirm,
}: DeleteStationDailyModalProps) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-delete">
        <div className="modal-header">
          <h2>Xác nhận xóa</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="delete-warning">
            <span className="warning-icon">⚠️</span>
            <p>Bạn có chắc chắn muốn xóa station daily status này?</p>
          </div>

          <div className="delete-info">
            <p>
              <strong>Trạm:</strong> {stationName}
            </p>
            <p>
              <strong>Ngày:</strong> {formatDate(status.statusDate)}
            </p>
          </div>

          <p className="delete-note">
            Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh viễn.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
