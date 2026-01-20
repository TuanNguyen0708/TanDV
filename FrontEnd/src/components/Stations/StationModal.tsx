import { useState, useEffect, FormEvent } from 'react';
import { Station, StationStatusCode } from '../../services/api';
import '../Productions/CreatePlanModal.css';

interface StationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Station, 'id'>) => void;
  loading?: boolean;
  initialData?: Station;
}

export function StationModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  initialData,
}: StationModalProps) {
  const [formData, setFormData] = useState({
    stationName: '',
    description: '',
    isActive: true,
    currentStatusCode: StationStatusCode.IDLE,
    currentStatusBrief: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          stationName: initialData.stationName,
          description: initialData.description || '',
          isActive: initialData.isActive,
          currentStatusCode: initialData.currentStatusCode,
          currentStatusBrief: initialData.currentStatusBrief || '',
        });
      } else {
        setFormData({
          stationName: '',
          description: '',
          isActive: true,
          currentStatusCode: StationStatusCode.IDLE,
          currentStatusBrief: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!formData.stationName.trim()) {
      newErrors.stationName = 'Vui lòng nhập tên station';
    } else if (formData.stationName.length > 100) {
      newErrors.stationName = 'Tên station không được vượt quá 100 ký tự';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      stationName: formData.stationName.trim(),
      description: formData.description.trim() || undefined,
      isActive: formData.isActive,
      currentStatusCode: formData.currentStatusCode,
      currentStatusBrief: formData.currentStatusBrief.trim() || undefined,
    });
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        stationName: '',
        description: '',
        isActive: true,
        currentStatusCode: StationStatusCode.IDLE,
        currentStatusBrief: '',
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {initialData ? 'Sửa station' : 'Tạo station mới'}
          </h2>
          <button className="modal-close" onClick={handleClose} disabled={loading}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="stationName">Tên Station *</label>
            <input
              id="stationName"
              type="text"
              value={formData.stationName}
              onChange={(e) => {
                setFormData({ ...formData, stationName: e.target.value });
                if (errors.stationName) setErrors({ ...errors, stationName: '' });
              }}
              disabled={loading}
              placeholder="Nhập tên station (ví dụ: Khung gầm)"
            />
            {errors.stationName && <span className="form-error">{errors.stationName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
              }}
              disabled={loading}
              placeholder="Nhập mô tả chi tiết về station"
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#242424',
                border: '1px solid #444',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="currentStatusCode">Trạng thái hiện tại</label>
            <select
              id="currentStatusCode"
              value={formData.currentStatusCode}
              onChange={(e) => {
                setFormData({ ...formData, currentStatusCode: e.target.value as StationStatusCode });
              }}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#242424',
                border: '1px solid #444',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            >
              <option value={StationStatusCode.IDLE}>IDLE - Rảnh</option>
              <option value={StationStatusCode.RUNNING}>RUNNING - Đang chạy</option>
              <option value={StationStatusCode.STOP}>STOP - Dừng</option>
              <option value={StationStatusCode.EMERGENCY}>EMERGENCY - Khẩn cấp</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="currentStatusBrief">Mô tả trạng thái</label>
            <input
              id="currentStatusBrief"
              type="text"
              value={formData.currentStatusBrief}
              onChange={(e) => {
                setFormData({ ...formData, currentStatusBrief: e.target.value });
              }}
              disabled={loading}
              placeholder="Nhập mô tả ngắn về trạng thái hiện tại"
            />
          </div>

          <div className="form-group">
            <label htmlFor="isActive" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                id="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => {
                  setFormData({ ...formData, isActive: e.target.checked });
                }}
                disabled={loading}
              />
              <span>Hoạt động</span>
            </label>
          </div>

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
              type="submit"
              className="modal-button modal-button-submit"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : initialData ? 'Cập nhật' : 'Tạo station'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
