import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePickerStyles.css';
import { ProductionStatus, Model, modelsApi, CreateProductionStatusDto } from '../../services/api';
import { formatLocalDate } from '../../utils/dateUtils';

interface ProductionStatusModalProps {
  status: ProductionStatus | null;
  onClose: () => void;
  onSubmit: (data: CreateProductionStatusDto) => void;
}

export function ProductionStatusModal({
  status,
  onClose,
  onSubmit,
}: ProductionStatusModalProps) {
  const [formData, setFormData] = useState({
    modelID: '',
    vehicleID: '',
    productionDate: null as Date | null,
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
        productionDate: status.productionDate ? new Date(status.productionDate) : null,
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const submitData: CreateProductionStatusDto = {
      modelID: formData.modelID.trim(),
      vehicleID: formData.vehicleID.trim(),
      productionDate: formData.productionDate
        ? formatLocalDate(formData.productionDate)
        : '',
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
                  disabled={!!status}
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
              <DatePicker
                selected={formData.productionDate}
                onChange={(date) => {
                  setFormData((prev) => ({ ...prev, productionDate: date }));
                  if (errors.productionDate) {
                    setErrors((prev) => ({ ...prev, productionDate: '' }));
                  }
                }}
                dateFormat="dd/MM/yyyy"
                placeholderText="Chọn ngày sản xuất"
                className={errors.productionDate ? 'error' : ''}
                id="productionDate"
              />
              {errors.productionDate && (
                <span className="error-text">{errors.productionDate}</span>
              )}
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
