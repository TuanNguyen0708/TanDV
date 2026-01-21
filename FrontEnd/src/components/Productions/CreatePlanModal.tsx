import { useState, useEffect, FormEvent } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../ProductionStatus/DatePickerStyles.css';
import { modelsApi, Model } from '../../services/api';
import { formatLocalDate } from '../../utils/dateUtils';
import './CreatePlanModal.css';

interface CreateMonthPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { model: string; month: string; plannedMonth: number }) => void;
  loading?: boolean;
  initialData?: { model: string; month: string; plannedMonth: number };
}

export function CreateMonthPlanModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  initialData,
}: CreateMonthPlanModalProps) {
  const [formData, setFormData] = useState({
    model: '',
    month: null as Date | null,
    plannedMonth: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [models, setModels] = useState<Model[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // Fetch models when modal opens
  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Parse month string YYYY-MM to Date (first day of month)
        const [year, month] = initialData.month.split('-').map(Number);
        const monthDate = new Date(year, month - 1, 1);
        setFormData({
          model: initialData.model,
          month: monthDate,
          plannedMonth: initialData.plannedMonth.toString(),
        });
      } else {
        setFormData({
          model: '',
          month: new Date(), // Default to current month
          plannedMonth: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!formData.model.trim()) {
      newErrors.model = 'Vui lòng nhập loại xe';
    }

    if (!formData.month) {
      newErrors.month = 'Vui lòng chọn tháng';
    }

    if (!formData.plannedMonth.trim()) {
      newErrors.plannedMonth = 'Vui lòng nhập kế hoạch tháng';
    } else {
      const plannedMonth = parseInt(formData.plannedMonth, 10);
      if (isNaN(plannedMonth) || plannedMonth <= 0) {
        newErrors.plannedMonth = 'Kế hoạch tháng phải là số dương';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Format month as YYYY-MM
    const monthStr = formData.month 
      ? `${formData.month.getFullYear()}-${String(formData.month.getMonth() + 1).padStart(2, '0')}`
      : '';

    onSubmit({
      model: formData.model.trim(),
      month: monthStr,
      plannedMonth: parseInt(formData.plannedMonth, 10),
    });
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ model: '', month: new Date(), plannedMonth: '' });
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{initialData ? 'Sửa kế hoạch tháng' : 'Tạo kế hoạch tháng'}</h2>
          <button className="modal-close" onClick={handleClose} disabled={loading}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="model">Loại xe *</label>
            <select
              id="model"
              value={formData.model}
              onChange={(e) => {
                setFormData({ ...formData, model: e.target.value });
                if (errors.model) setErrors({ ...errors, model: '' });
              }}
              disabled={loading || loadingModels || models.length === 0}
            >
              <option value="">-- Chọn loại xe --</option>
              {models.map((model) => (
                <option key={model.modelId} value={model.modelId}>
                  {model.name} ({model.modelId})
                </option>
              ))}
            </select>
            {errors.model && <span className="form-error">{errors.model}</span>}
            {loadingModels && (
              <span style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.25rem', display: 'block' }}>
                Đang tải danh sách model...
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="month">Tháng *</label>
            <DatePicker
              id="month"
              selected={formData.month}
              onChange={(date) => {
                setFormData({ ...formData, month: date });
                if (errors.month) setErrors({ ...errors, month: '' });
              }}
              dateFormat="MM/yyyy"
              showMonthYearPicker
              placeholderText="Chọn tháng"
              className={errors.month ? 'error' : ''}
              disabled={loading}
            />
            {errors.month && <span className="form-error">{errors.month}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="plannedMonth">Kế hoạch tháng *</label>
            <input
              id="plannedMonth"
              type="number"
              min="1"
              value={formData.plannedMonth}
              onChange={(e) => {
                setFormData({ ...formData, plannedMonth: e.target.value });
                if (errors.plannedMonth) setErrors({ ...errors, plannedMonth: '' });
              }}
              disabled={loading}
              placeholder="Nhập số lượng"
            />
            {errors.plannedMonth && (
              <span className="form-error">{errors.plannedMonth}</span>
            )}
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
              {loading ? 'Đang xử lý...' : initialData ? 'Cập nhật' : 'Tạo kế hoạch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CreateDayPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { model: string; date: string; plannedDay: number; monthPlanId: string }) => void;
  defaultDate?: string;
  defaultModel?: string;
  loading?: boolean;
  initialPlannedDay?: number;
  monthPlans?: Array<{ id: string; model: string; planMonth: string; plannedMonth: number }>;
}

export function CreateDayPlanModal({
  isOpen,
  onClose,
  onSubmit,
  defaultDate,
  defaultModel,
  loading = false,
  initialPlannedDay,
  monthPlans = [],
}: CreateDayPlanModalProps) {
  const [formData, setFormData] = useState({
    model: defaultModel || '',
    date: null as Date | null,
    plannedDay: '',
    monthPlanId: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [models, setModels] = useState<Model[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // Fetch models when modal opens
  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialMonthPlanId = defaultModel && monthPlans.length > 0
        ? monthPlans.find(mp => mp.model === defaultModel)?.id || ''
        : '';
      
      // Parse defaultDate string to Date if available
      const dateObj = defaultDate ? new Date(defaultDate) : null;
      
      setFormData({
        model: defaultModel || '',
        date: dateObj,
        plannedDay: initialPlannedDay != null ? initialPlannedDay.toString() : '',
        monthPlanId: initialMonthPlanId,
      });
      setErrors({});
    }
  }, [isOpen, defaultDate, defaultModel, initialPlannedDay, monthPlans]);

  // Update monthPlanId when model changes
  useEffect(() => {
    if (formData.model && monthPlans.length > 0) {
      const matchingMonthPlan = monthPlans.find(mp => mp.model === formData.model);
      if (matchingMonthPlan) {
        setFormData(prev => ({ ...prev, monthPlanId: matchingMonthPlan.id }));
      } else {
        setFormData(prev => ({ ...prev, monthPlanId: '' }));
      }
    }
  }, [formData.model, monthPlans]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!formData.model.trim()) {
      newErrors.model = 'Vui lòng chọn loại xe';
    }

    if (!formData.date) {
      newErrors.date = 'Vui lòng chọn ngày';
    }

    if (!formData.plannedDay.trim()) {
      newErrors.plannedDay = 'Vui lòng nhập kế hoạch ngày';
    } else {
      const plannedDay = parseInt(formData.plannedDay, 10);
      if (isNaN(plannedDay) || plannedDay <= 0) {
        newErrors.plannedDay = 'Kế hoạch ngày phải là số dương';
      }
    }

    if (!formData.monthPlanId.trim()) {
      newErrors.monthPlanId = 'Vui lòng chọn kế hoạch tháng';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      model: formData.model.trim(),
      date: formData.date ? formatLocalDate(formData.date) : '',
      plannedDay: parseInt(formData.plannedDay, 10),
      monthPlanId: formData.monthPlanId,
    });
  };

  const handleClose = () => {
    if (!loading) {
      const dateObj = defaultDate ? new Date(defaultDate) : null;
      setFormData({ model: defaultModel || '', date: dateObj, plannedDay: '', monthPlanId: '' });
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Tạo kế hoạch ngày</h2>
          <button className="modal-close" onClick={handleClose} disabled={loading}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="day-model">Loại xe *</label>
            <select
              id="day-model"
              value={formData.model}
              onChange={(e) => {
                setFormData({ ...formData, model: e.target.value });
                if (errors.model) setErrors({ ...errors, model: '' });
              }}
              disabled={loading || loadingModels || models.length === 0}
            >
              <option value="">-- Chọn loại xe --</option>
              {models.map((model) => (
                <option key={model.modelId} value={model.modelId}>
                  {model.name} ({model.modelId})
                </option>
              ))}
            </select>
            {errors.model && <span className="form-error">{errors.model}</span>}
            {loadingModels && (
              <span style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.25rem', display: 'block' }}>
                Đang tải danh sách model...
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="day-date">Ngày *</label>
            <DatePicker
              id="day-date"
              selected={formData.date}
              onChange={(date) => {
                setFormData({ ...formData, date: date });
                if (errors.date) setErrors({ ...errors, date: '' });
              }}
              dateFormat="dd/MM/yyyy"
              placeholderText="Chọn ngày"
              className={errors.date ? 'error' : ''}
              disabled={loading}
            />
            {errors.date && <span className="form-error">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="day-monthPlan">Kế hoạch tháng *</label>
            <select
              id="day-monthPlan"
              value={formData.monthPlanId}
              onChange={(e) => {
                setFormData({ ...formData, monthPlanId: e.target.value });
                if (errors.monthPlanId) setErrors({ ...errors, monthPlanId: '' });
              }}
              disabled={loading || !formData.model || monthPlans.length === 0}
            >
              <option value="">-- Chọn kế hoạch tháng --</option>
              {monthPlans
                .filter(mp => mp.model === formData.model)
                .map((monthPlan) => {
                  // Parse planMonth string (YYYY-MM-DD) to get year and month
                  const [year, month] = monthPlan.planMonth.split('-').map(Number);
                  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
                  return (
                    <option key={monthPlan.id} value={monthPlan.id}>
                      {monthStr} - KH: {new Intl.NumberFormat('vi-VN').format(monthPlan.plannedMonth)}
                    </option>
                  );
                })}
            </select>
            {errors.monthPlanId && <span className="form-error">{errors.monthPlanId}</span>}
            {!formData.model && (
              <span style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.25rem', display: 'block' }}>
                Vui lòng chọn loại xe trước
              </span>
            )}
            {formData.model && monthPlans.filter(mp => mp.model === formData.model).length === 0 && (
              <span style={{ fontSize: '0.85rem', color: '#f44336', marginTop: '0.25rem', display: 'block' }}>
                Không có kế hoạch tháng cho loại xe này
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="day-plannedDay">Kế hoạch ngày *</label>
            <input
              id="day-plannedDay"
              type="number"
              min="1"
              value={formData.plannedDay}
              onChange={(e) => {
                setFormData({ ...formData, plannedDay: e.target.value });
                if (errors.plannedDay) setErrors({ ...errors, plannedDay: '' });
              }}
              disabled={loading}
              placeholder="Nhập số lượng"
            />
            {errors.plannedDay && (
              <span className="form-error">{errors.plannedDay}</span>
            )}
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
              {loading ? 'Đang tạo...' : 'Tạo kế hoạch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
