import { ProductionStatus } from '../../services/api';

interface DeleteProductionStatusModalProps {
  status: ProductionStatus;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteProductionStatusModal({
  status,
  onClose,
  onConfirm,
}: DeleteProductionStatusModalProps) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-delete" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Xác nhận xóa</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="delete-warning">
            <span className="warning-icon">⚠️</span>
            <p>Bạn có chắc chắn muốn xóa production status này?</p>
          </div>
          <div className="delete-info">
            <p>
              <strong>Số xe:</strong> {status.vehicleID}
            </p>
            <p>
              <strong>Model:</strong> {status.modelID}
            </p>
            <p>
              <strong>Ngày sản xuất:</strong> {formatDate(status.productionDate)}
            </p>
            {status.quality && (
              <p>
                <strong>Chất lượng:</strong>{' '}
                <span className={`quality-badge quality-${status.quality.toLowerCase()}`}>
                  {status.quality}
                </span>
              </p>
            )}
          </div>
          <p className="delete-note">Hành động này không thể hoàn tác!</p>
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
