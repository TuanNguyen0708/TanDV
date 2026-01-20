import { Station } from '../../services/api';
import '../Productions/CreatePlanModal.css';

interface DeleteStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  station: Station | null;
}

export function DeleteStationModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  station,
}: DeleteStationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Xác nhận xóa</h2>
          <button className="modal-close" onClick={onClose} disabled={loading}>
            ×
          </button>
        </div>
        <div className="modal-form">
          <p style={{ color: '#ffffff', marginBottom: '1.5rem' }}>
            Bạn có chắc chắn muốn xóa station <strong>{station?.stationName}</strong>?
          </p>
          <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>
            ID: {station?.id}
          </p>
          <p style={{ color: '#ff6b6b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Hành động này không thể hoàn tác. Nếu station đã được sử dụng trong production status hoặc daily status, bạn sẽ không thể xóa.
          </p>
          <div className="modal-actions">
            <button
              type="button"
              className="modal-button modal-button-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="button"
              className="modal-button modal-button-submit"
              onClick={onConfirm}
              disabled={loading}
              style={{ background: '#dc3545' }}
            >
              {loading ? 'Đang xóa...' : 'Xóa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
