import './CreatePlanModal.css';

interface DeletePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  model?: string;
}

export function DeletePlanModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  model,
}: DeletePlanModalProps) {
  if (!isOpen) return null;

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Xóa kế hoạch tháng</h2>
          <button className="modal-close" onClick={handleClose} disabled={loading}>
            ×
          </button>
        </div>
        <div className="modal-form">
          <p style={{ color: '#fff', marginBottom: '1rem' }}>
            Bạn có chắc chắn muốn xóa kế hoạch tháng
            {model ? ` của loại xe ${model}` : ''}?
          </p>
          <p style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>
            Hành động này sẽ đặt kế hoạch tháng về 0.
          </p>

          <div className="modal-actions">
            <button
              type="button"
              className="modal-button modal-button-cancel"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="button"
              className="modal-button modal-button-submit"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Đang xóa...' : 'Xóa kế hoạch'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

