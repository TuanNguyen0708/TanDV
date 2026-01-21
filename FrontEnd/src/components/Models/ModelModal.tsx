import { useState, useEffect, FormEvent } from 'react';
import { Model } from '../../services/api';
import '../Productions/CreatePlanModal.css';

interface ModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Model) => void;
  loading?: boolean;
  initialData?: Model;
}

export function ModelModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  initialData,
}: ModelModalProps) {
  const [formData, setFormData] = useState({
    modelId: '',
    name: '',
    description: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          modelId: initialData.modelId,
          name: initialData.name,
          description: initialData.description || '',
        });
      } else {
        setFormData({
          modelId: '',
          name: '',
          description: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!formData.modelId.trim()) {
      newErrors.modelId = 'Vui lòng nhập Model ID';
    } else if (formData.modelId.length > 50) {
      newErrors.modelId = 'Model ID không được vượt quá 50 ký tự';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên model';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Tên model không được vượt quá 100 ký tự';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      modelId: formData.modelId.trim(),
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    });
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ modelId: '', name: '', description: '' });
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {initialData ? 'Sửa model' : 'Tạo model mới'}
          </h2>
          <button className="modal-close" onClick={handleClose} disabled={loading}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="modelId">Model ID *</label>
            <input
              id="modelId"
              type="text"
              value={formData.modelId}
              onChange={(e) => {
                setFormData({ ...formData, modelId: e.target.value });
                if (errors.modelId) setErrors({ ...errors, modelId: '' });
              }}
              disabled={loading || !!initialData}
              placeholder="Nhập Model ID (ví dụ: KL199)"
            />
            {errors.modelId && <span className="form-error">{errors.modelId}</span>}
            {initialData && (
              <span style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.25rem', display: 'block' }}>
                Model ID không thể thay đổi
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="name">Tên model *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              disabled={loading}
              placeholder="Nhập tên model"
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              disabled={loading}
              placeholder="Nhập mô tả (tùy chọn)"
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#242424',
                border: '1px solid #444',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
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
              {loading ? 'Đang xử lý...' : initialData ? 'Cập nhật' : 'Tạo model'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
