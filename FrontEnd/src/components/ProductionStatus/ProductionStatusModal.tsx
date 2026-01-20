import { useEffect, useState } from 'react';
import { ProductionStatus, Model, modelsApi } from '../../services/api';

interface ProductionStatusModalProps {
  status: ProductionStatus | null;
  onClose: () => void;
  onSubmit: (data: Omit<ProductionStatus, 'id'>) => void;
}

export function ProductionStatusModal({
  status,
  onClose,
  onSubmit,
}: ProductionStatusModalProps) {
  const [formData, setFormData] = useState({
    modelID: '',
    vehicleID: '',
    productionDate: '',
    stationStart: '',
    stationEnd: '',
    quality: '' as '' | 'OK' | 'NG',
    remark: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [models, setModels] = useState<Model[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    // Fetch models
    const fetchModels = async () => {
      setLoadingModels(true);
      try {
        const data = await modelsApi.getAllModels();
        setModels(data);
      } catch (err) {
        console.error('Error fetching models:', err);
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModels();
  }, []);

  useEffect(() => {
    if (status) {
      setFormData({
        modelID: status.modelID,
        vehicleID: status.vehicleID,
        productionDate: status.productionDate,
        stationStart: status.stationStart
          ? new Date(status.stationStart).toISOString().slice(0, 16)
          : '',
        stationEnd: status.stationEnd
          ? new Date(status.stationEnd).toISOString().slice(0, 16)
          : '',
        quality: status.quality || '',
        remark: status.remark || '',
      });
    }
  }, [status]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.modelID.trim()) {
      newErrors.modelID = 'Model ID là bắt buộc';
    }

    if (!formData.vehicleID.trim()) {
      newErrors.vehicleID = 'Số xe là bắt buộc';
    }

    if (!formData.productionDate) {
      newErrors.productionDate = 'Ngày sản xuất là bắt buộc';
    }

    // Validate station start/end times
    if (formData.stationStart && formData.stationEnd) {
      const start = new Date(formData.stationStart).getTime();
      const end = new Date(formData.stationEnd).getTime();
      if (end <= start) {
        newErrors.stationEnd = 'Giờ kết thúc phải sau giờ bắt đầu';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const submitData: Omit<ProductionStatus, 'id'> = {
      modelID: formData.modelID.trim(),
      vehicleID: formData.vehicleID.trim(),
      productionDate: formData.productionDate,
      stationStart: formData.stationStart
        ? new Date(formData.stationStart).toISOString()
        : undefined,
      stationEnd: formData.stationEnd
        ? new Date(formData.stationEnd).toISOString()
        : undefined,
      quality: formData.quality || undefined,
      remark: formData.remark.trim() || undefined,
    };

    onSubmit(submitData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{status ? 'Sửa Production Status' : 'Thêm Production Status'}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="vehicleID">
                  Số xe <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="vehicleID"
                  name="vehicleID"
                  value={formData.vehicleID}
                  onChange={handleChange}
                  className={errors.vehicleID ? 'error' : ''}
                  placeholder="Nhập số xe"
                />
                {errors.vehicleID && (
                  <span className="error-text">{errors.vehicleID}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="modelID">
                  Model <span className="required">*</span>
                </label>
                <select
                  id="modelID"
                  name="modelID"
                  value={formData.modelID}
                  onChange={handleChange}
                  className={errors.modelID ? 'error' : ''}
                  disabled={loadingModels}
                >
                  <option value="">-- Chọn model --</option>
                  {models.map((model) => (
                    <option key={model.modelId} value={model.modelId}>
                      {model.name}
                    </option>
                  ))}
                </select>
                {errors.modelID && (
                  <span className="error-text">{errors.modelID}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="productionDate">
                Ngày sản xuất <span className="required">*</span>
              </label>
              <input
                type="date"
                id="productionDate"
                name="productionDate"
                value={formData.productionDate}
                onChange={handleChange}
                className={errors.productionDate ? 'error' : ''}
              />
              {errors.productionDate && (
                <span className="error-text">{errors.productionDate}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="stationStart">Giờ bắt đầu</label>
                <input
                  type="datetime-local"
                  id="stationStart"
                  name="stationStart"
                  value={formData.stationStart}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="stationEnd">Giờ kết thúc</label>
                <input
                  type="datetime-local"
                  id="stationEnd"
                  name="stationEnd"
                  value={formData.stationEnd}
                  onChange={handleChange}
                  className={errors.stationEnd ? 'error' : ''}
                />
                {errors.stationEnd && (
                  <span className="error-text">{errors.stationEnd}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="quality">Chất lượng</label>
              <select
                id="quality"
                name="quality"
                value={formData.quality}
                onChange={handleChange}
              >
                <option value="">-- Chọn --</option>
                <option value="OK">OK</option>
                <option value="NG">NG</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="remark">Ghi chú</label>
              <textarea
                id="remark"
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                rows={3}
                placeholder="Nhập ghi chú..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              {status ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
