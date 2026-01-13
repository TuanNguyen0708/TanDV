import { SummaryResponse } from '../../services/api';
import './ProductionPlanTable.css';

interface ProductionPlanTableProps {
  summary: SummaryResponse | null;
  loading?: boolean;
  showActions?: boolean;
  onEdit?: (row: SummaryResponse['rows'][0]) => void;
  onDelete?: (row: SummaryResponse['rows'][0]) => void;
}

export function ProductionPlanTable({
  summary,
  loading,
  showActions = false,
  onEdit,
  onDelete,
}: ProductionPlanTableProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  if (loading && !summary) {
    return <div className="plan-table-loading">Đang tải...</div>;
  }

  if (!summary) {
    return <div className="plan-table-error">Không có dữ liệu</div>;
  }

  return (
    <div className="plan-table-wrapper">
      <table className="plan-table">
        <thead>
          <tr>
            <th>Loại xe</th>
            <th>KH ngày</th>
            <th>Hoàn thành</th>
            <th>KH tháng</th>
            <th>Lũy kế</th>
            {showActions && <th>Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {summary.rows.map((row, index) => (
            <tr key={index}>
              <td>{row.model}</td>
              <td>{formatNumber(row.plannedDay)}</td>
              <td>{formatNumber(row.actualDay)}</td>
              <td>{formatNumber(row.plannedMonth)}</td>
              <td>{formatNumber(row.cumulative)}</td>
              {showActions && (
                <td className="action-cell">
                  <div className="action-buttons">
                    <button
                      className="action-btn action-btn-edit"
                      onClick={() => onEdit?.(row)}
                      title="Sửa"
                    >
                      Sửa
                    </button>
                    <button
                      className="action-btn action-btn-delete"
                      onClick={() => onDelete?.(row)}
                      title="Xóa"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
          {summary.rows.length === 0 && (
            <tr>
              <td colSpan={showActions ? 6 : 5} className="no-data">
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="total-row">
            <td><strong>TỔNG</strong></td>
            <td><strong>{formatNumber(summary.total.plannedDay)}</strong></td>
            <td><strong>{formatNumber(summary.total.actualDay)}</strong></td>
            <td><strong>{formatNumber(summary.total.plannedMonth)}</strong></td>
            <td><strong>{formatNumber(summary.total.cumulative)}</strong></td>
            {showActions && <td></td>}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
