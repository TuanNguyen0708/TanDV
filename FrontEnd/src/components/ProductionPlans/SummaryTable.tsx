import { useState, useEffect } from 'react';
import { productionPlansApi, SummaryResponse } from '../../services/api';
import './ProductionPlans.css';

export const SummaryTable = () => {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    if (!date) return;

    setLoading(true);
    setError(null);

    try {
      const data = await productionPlansApi.getDailySummary(date);
      setSummary(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [date]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  return (
    <div className="summary-container">
      <h2>Tổng hợp sản xuất</h2>
      
      <div className="date-selector">
        <label htmlFor="summary-date">Chọn ngày:</label>
        <input
          id="summary-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="date-input"
        />
        <button onClick={fetchSummary} disabled={loading} className="btn btn-secondary">
          {loading ? 'Đang tải...' : 'Tải lại'}
        </button>
      </div>

      {error && (
        <div className="message message-error">
          {error}
        </div>
      )}

      {loading && !summary && (
        <div className="loading">Đang tải dữ liệu...</div>
      )}

      {summary && (
        <div className="summary-content">
          <div className="summary-info">
            <strong>Ngày:</strong> {summary.date}
          </div>

          <div className="table-wrapper">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Mã sản phẩm</th>
                  <th>Kế hoạch ngày</th>
                  <th>Thực tế ngày</th>
                  <th>Kế hoạch tháng</th>
                  <th>Lũy kế</th>
                  <th>% hoàn thành</th>
                </tr>
              </thead>
              <tbody>
                {summary.rows.map((row, index) => {
                  const completionRate = row.plannedMonth > 0 
                    ? ((row.cumulative / row.plannedMonth) * 100).toFixed(2)
                    : '0.00';
                  
                  return (
                    <tr key={index}>
                      <td className="model-cell">{row.model}</td>
                      <td>{formatNumber(row.plannedDay)}</td>
                      <td>{formatNumber(row.actualDay)}</td>
                      <td>{formatNumber(row.plannedMonth)}</td>
                      <td>{formatNumber(row.cumulative)}</td>
                      <td className={parseFloat(completionRate) >= 100 ? 'success' : ''}>
                        {completionRate}%
                      </td>
                    </tr>
                  );
                })}
                {summary.rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="no-data">
                      Không có dữ liệu cho ngày này
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td><strong>Tổng</strong></td>
                  <td><strong>{formatNumber(summary.total.plannedDay)}</strong></td>
                  <td><strong>{formatNumber(summary.total.actualDay)}</strong></td>
                  <td><strong>{formatNumber(summary.total.plannedMonth)}</strong></td>
                  <td><strong>{formatNumber(summary.total.cumulative)}</strong></td>
                  <td>
                    <strong>
                      {summary.total.plannedMonth > 0
                        ? ((summary.total.cumulative / summary.total.plannedMonth) * 100).toFixed(2)
                        : '0.00'}%
                    </strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
