import { useState } from 'react';
import { productionPlansApi, CreateMonthPlanDto } from '../../services/api';
import './ProductionPlans.css';

export const MonthlyPlanForm = () => {
  const [formData, setFormData] = useState<CreateMonthPlanDto>({
    model: '',
    month: '',
    plannedMonth: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await productionPlansApi.upsertMonthPlan(formData);
      setMessage({ type: 'success', text: 'Kế hoạch tháng đã được lưu thành công!' });
      setFormData({ model: '', month: '', plannedMonth: 0 });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Có lỗi xảy ra khi lưu kế hoạch tháng',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Kế hoạch sản xuất tháng</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="model">Mã sản phẩm</label>
          <input
            id="model"
            type="text"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            placeholder="VD: KL199"
            required
            maxLength={50}
          />
        </div>

        <div className="form-group">
          <label htmlFor="month">Tháng (YYYY-MM)</label>
          <input
            id="month"
            type="text"
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
            placeholder="VD: 2026-01"
            pattern="\d{4}-\d{2}"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="plannedMonth">Số lượng kế hoạch tháng</label>
          <input
            id="plannedMonth"
            type="number"
            value={formData.plannedMonth || ''}
            onChange={(e) => setFormData({ ...formData, plannedMonth: parseInt(e.target.value) || 0 })}
            min="0"
            required
          />
        </div>

        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Đang lưu...' : 'Lưu kế hoạch tháng'}
        </button>
      </form>
    </div>
  );
};
