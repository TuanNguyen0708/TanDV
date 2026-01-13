import { useState } from 'react';
import { productionPlansApi, CreateDailyResultDto } from '../../services/api';
import './ProductionPlans.css';

export const DailyResultForm = () => {
  const [formData, setFormData] = useState<CreateDailyResultDto>({
    model: '',
    date: '',
    plannedDay: 0,
    actualDay: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await productionPlansApi.upsertDailyResult(formData);
      setMessage({ type: 'success', text: 'Kết quả sản xuất ngày đã được lưu thành công!' });
      setFormData({ model: '', date: '', plannedDay: 0, actualDay: undefined });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Có lỗi xảy ra khi lưu kết quả sản xuất',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Kết quả sản xuất ngày</h2>
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
          <label htmlFor="date">Ngày (YYYY-MM-DD)</label>
          <input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="plannedDay">Số lượng kế hoạch ngày</label>
          <input
            id="plannedDay"
            type="number"
            value={formData.plannedDay || ''}
            onChange={(e) => setFormData({ ...formData, plannedDay: parseInt(e.target.value) || 0 })}
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="actualDay">Số lượng thực tế ngày (tùy chọn)</label>
          <input
            id="actualDay"
            type="number"
            value={formData.actualDay || ''}
            onChange={(e) => setFormData({ ...formData, actualDay: e.target.value ? parseInt(e.target.value) : undefined })}
            min="0"
          />
        </div>

        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Đang lưu...' : 'Lưu kết quả sản xuất'}
        </button>
      </form>
    </div>
  );
};
