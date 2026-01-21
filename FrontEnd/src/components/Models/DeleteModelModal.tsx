import { Model } from '../../services/api';
import '../Productions/CreatePlanModal.css';

interface DeleteModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  model: Model | null;
}

export function DeleteModelModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  model,
}: DeleteModelModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Xác nhận xóa</h2>
          <button className="modal-close" onClick={onClose} disabled={loading}>
            ×
          </button>
        </div>
        <div className="modal-form">
          <p style={{ color: '#ffffff', marginBottom: '1.5rem' }}>
            Bạn có chắc chắn muốn xóa model <strong>{model?.modelId}</strong> ({model?.name})?
          </p>
          <p style={{ color: '#ff6b6b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Hành động này không thể hoàn tác.
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
