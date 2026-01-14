import { useCallback, useEffect, useState } from 'react';
import {
  productionPlansApi,
  SummaryResponse,
  DailyPlan,
  MonthPlan,
} from '../../services/api';
import { ProductionPlanTable } from './ProductionPlanTable';
import { CreateMonthPlanModal, CreateDayPlanModal } from './CreatePlanModal';
import { DeletePlanModal } from './DeletePlanModal';
import './ProductionPlans.css';

export function ProductionPlans() {
  const [date] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRow, setEditingRow] = useState<SummaryResponse['rows'][0] | null>(null);
  const [deleteRow, setDeleteRow] = useState<SummaryResponse['rows'][0] | null>(null);
  const [deleteType, setDeleteType] = useState<'day' | 'month' | null>(null);
  const [dayPlanModel, setDayPlanModel] = useState<string | undefined>(undefined);
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [monthPlans, setMonthPlans] = useState<MonthPlan[]>([]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const month = date.slice(0, 7);
      const [summaryData, dailyData, monthData] = await Promise.all([
        productionPlansApi.getDailySummary(date),
        productionPlansApi.getAllDailyPlans(date),
        productionPlansApi.getAllMonthPlans(month),
      ]);

      setSummary(summaryData);
      setDailyPlans(dailyData);
      setMonthPlans(monthData);
    } catch (err: any) {
      console.error('Error fetching summary:', err);
      setError(err?.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenMonthModal = () => {
    setError(null);
    setEditingRow(null);
    setShowMonthModal(true);
  };

  const handleCloseMonthModal = () => {
    if (!submitting) {
      setShowMonthModal(false);
    }
  };

  const handleSubmitMonthPlan = async (data: {
    model: string;
    month: string;
    plannedMonth: number;
  }) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await productionPlansApi.upsertMonthPlan(data);
      await fetchData();
      setShowMonthModal(false);
      setEditingRow(null);
      setSuccess(editingRow ? 'Cập nhật kế hoạch tháng thành công!' : 'Tạo kế hoạch tháng thành công!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error creating/updating month plan:', err);
      setError(err?.message || 'Lỗi khi tạo/cập nhật kế hoạch tháng');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (row: SummaryResponse['rows'][0]) => {
    setEditingRow(row);
    setError(null);
    setShowMonthModal(true);
  };

  const handleDeleteMonth = (row: SummaryResponse['rows'][0] | MonthPlan) => {
    setError(null);
    // If it's a MonthPlan, convert to SummaryRow format; otherwise use as is
    const deleteRowData: SummaryResponse['rows'][0] = 'id' in row
      ? {
          model: row.model,
          plannedDay: 0,
          actualDay: 0,
          plannedMonth: row.plannedMonth,
          cumulative: 0,
        }
      : row as SummaryResponse['rows'][0];

    setDeleteRow(deleteRowData);
    setDeleteType('month');
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    if (!submitting) {
      setShowDeleteModal(false);
      setDeleteRow(null);
      setDeleteType(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteRow || !deleteType) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      if (deleteType === 'month') {
        // Find monthPlan from monthPlans
        const monthPlan = monthPlans.find(mp => mp.model === deleteRow.model);
        if (!monthPlan) {
          throw new Error('Không tìm thấy kế hoạch tháng');
        }
        await productionPlansApi.deleteMonthPlan(monthPlan.id);
      } else if (deleteType === 'day') {
        // Find dailyPlan from dailyPlans
        const dailyPlan = dailyPlans.find(dp => dp.model === deleteRow.model);
        if (!dailyPlan) {
          throw new Error('Không tìm thấy kế hoạch ngày');
        }
        await productionPlansApi.deleteDailyPlan(dailyPlan.id);
      }

      await fetchData();
      setShowDeleteModal(false);
      setDeleteRow(null);
      setDeleteType(null);
      setSuccess(deleteType === 'month' ? 'Xóa kế hoạch tháng thành công!' : 'Xóa kế hoạch ngày thành công!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting plan:', err);
      setError(err?.message || `Lỗi khi xóa kế hoạch ${deleteType === 'month' ? 'tháng' : 'ngày'}`);
    } finally {
      setSubmitting(false);
    }
  };


  const handleCloseDayModal = () => {
    if (!submitting) {
      setShowDayModal(false);
      setDayPlanModel(undefined);
    }
  };

  const handleDeleteDay = async (row: SummaryResponse['rows'][0] | DailyPlan) => {
    setError(null);
    setSubmitting(true);
    setSuccess(null);
    try {
      // If it's a DailyPlan, use id directly; otherwise find it from dailyPlans
      const dailyPlan = 'id' in row 
        ? row as DailyPlan
        : dailyPlans.find(dp => dp.model === row.model);
      
      if (!dailyPlan) {
        throw new Error('Không tìm thấy kế hoạch ngày');
      }

      await productionPlansApi.deleteDailyPlan(dailyPlan.id);
      await fetchData();
      setSuccess('Xóa kế hoạch ngày thành công!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting day plan:', err);
      setError(err?.message || 'Lỗi khi xóa kế hoạch ngày');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitDayPlan = async (data: {
    model: string;
    date: string;
    plannedDay: number;
    monthPlanId: string;
  }) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await productionPlansApi.upsertDailyResult(data);
      await fetchData();
      setShowDayModal(false);
      setSuccess('Tạo kế hoạch ngày thành công!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error creating day plan:', err);
      setError(err?.message || 'Lỗi khi tạo kế hoạch ngày');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="production-plans">
      {/* Header */}
      <header className="plans-header">
        <div className="plans-header-left">XƯỞNG LẮP RÁP</div>
        <div className="plans-header-center">KẾ HOẠCH SẢN XUẤT</div>
        <div className="plans-header-right">
        </div>
      </header>

      {/* Main Content */}
      <main className="plans-main">
        {/* Tổng hợp KHSX (không có cột thao tác) */}
        <section className="plans-section">
          <div className="section-header">
            <div className="section-title-bar"></div>
            <h2 className="section-title">KẾ HOẠCH SẢN XUẤT</h2>
          </div>
          <ProductionPlanTable
            summary={summary}
            loading={loading}
            showActions={false}
          />
        </section>

                {/* KHSX (Tháng) */}
                <section className="plans-section">
          <div className="section-header">
            <div className="section-title-bar"></div>
            <h2 className="section-title">KHSX (Tháng)</h2>
            <button
              className="plans-button plans-button-month"
              onClick={handleOpenMonthModal}
              disabled={submitting}
            >
              Tạo kế hoạch tháng
            </button>
          </div>
          {monthPlans.length > 0 ? (
            <div className="plan-table-wrapper">
              <table className="plan-table">
                <thead>
                  <tr>
                    <th>Tháng</th>
                    <th>Loại xe</th>
                    <th>KH tháng</th>
                    <th>Hoàn thành</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {monthPlans.map((row, index) => {
                    const summaryRow = summary?.rows.find((r) => r.model === row.model);
                    const cumulativeValue = summaryRow?.cumulative ?? 0;
                    const rowForActions: SummaryResponse['rows'][0] =
                      summaryRow ?? {
                        model: row.model,
                        plannedDay: 0,
                        actualDay: 0,
                        plannedMonth: row.plannedMonth,
                        cumulative: cumulativeValue,
                      };

                    // Format planMonth from YYYY-MM-DD to YYYY-MM
                    const monthDate = new Date(row.planMonth);
                    const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;

                    return (
                      <tr key={index}>
                        <td>{monthStr}</td>
                        <td>{row.model}</td>
                        <td>{formatNumber(row.plannedMonth)}</td>
                        <td>{formatNumber(rowForActions.cumulative)}</td>
                        <td className="action-cell">
                          <div className="action-buttons">
                            <button
                              className="action-btn action-btn-edit"
                              onClick={() => handleEdit(rowForActions)}
                              title="Sửa"
                            >
                              Sửa
                            </button>
                            <button
                              className="action-btn action-btn-delete"
                              onClick={() => handleDeleteMonth(row)}
                              title="Xóa"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {monthPlans.length === 0 && (
                    <tr>
                      <td colSpan={5} className="no-data">
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td>
                      <strong>TỔNG</strong>
                    </td>
                    <td></td>
                    <td>
                      <strong>
                        {formatNumber(
                          monthPlans.reduce((sum, r) => sum + r.plannedMonth, 0),
                        )}
                      </strong>
                    </td>
                    <td>
                      <strong>
                        {formatNumber(
                          (summary?.rows || []).reduce(
                            (sum, r) => sum + r.cumulative,
                            0,
                          ),
                        )}
                      </strong>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="plan-table-error">
              {loading ? 'Đang tải...' : 'Không có dữ liệu'}
            </div>
          )}
        </section>

        {/* KHSX (Ngày) */}
        <section className="plans-section">
          <div className="section-header">
            <div className="section-title-bar"></div>
            <h2 className="section-title">KHSX (Ngày)</h2>
            <button
              className="plans-button plans-button-day"
              onClick={() => {
                setError(null);
                setDayPlanModel(undefined);
                setShowDayModal(true);
              }}
              disabled={submitting}
            >
              Tạo kế hoạch ngày
            </button>
          </div>
          {dailyPlans.length > 0 ? (
            <div className="plan-table-wrapper">
              <table className="plan-table">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Loại xe</th>
                    <th>KH ngày</th>
                    <th>Hoàn thành</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyPlans.map((row, index) => (
                    <tr key={index}>
                      <td>{row.workDate}</td>
                      <td>{row.model}</td>
                      <td>{formatNumber(row.plannedDay)}</td>
                      <td>{formatNumber(row.actualDay)}</td>
                      <td className="action-cell">
                        <div className="action-buttons">
                          <button
                            className="action-btn action-btn-edit"
                            onClick={() => {
                              setError(null);
                              setDayPlanModel(row.model);
                              setShowDayModal(true);
                            }}
                            title="Sửa"
                          >
                            Sửa
                          </button>
                          <button
                            className="action-btn action-btn-delete"
                            onClick={() => handleDeleteDay(row)}
                            title="Xóa"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {dailyPlans.length === 0 && (
                    <tr>
                      <td colSpan={5} className="no-data">
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td>
                      <strong>TỔNG</strong>
                    </td>
                    <td></td>
                    <td>
                      <strong>
                        {formatNumber(
                          dailyPlans.reduce((sum, r) => sum + r.plannedDay, 0),
                        )}
                      </strong>
                    </td>
                    <td>
                      <strong>
                        {formatNumber(
                          dailyPlans.reduce((sum, r) => sum + r.actualDay, 0),
                        )}
                      </strong>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="plan-table-error">
              {loading ? 'Đang tải...' : 'Không có dữ liệu'}
            </div>
          )}
        </section>
      </main>

      {error && (
        <div className="plans-error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="plans-success-message">
          {success}
        </div>
      )}

      <CreateMonthPlanModal
        isOpen={showMonthModal}
        onClose={handleCloseMonthModal}
        onSubmit={handleSubmitMonthPlan}
        loading={submitting}
        initialData={editingRow ? {
          model: editingRow.model,
          month: new Date().toISOString().slice(0, 7),
          plannedMonth: editingRow.plannedMonth,
        } : undefined}
      />

      <CreateDayPlanModal
        isOpen={showDayModal}
        onClose={handleCloseDayModal}
        onSubmit={handleSubmitDayPlan}
        defaultDate={date}
        defaultModel={dayPlanModel}
        loading={submitting}
        initialPlannedDay={
          dayPlanModel
            ? dailyPlans.find((d) => d.model === dayPlanModel)?.plannedDay
            : undefined
        }
        monthPlans={monthPlans}
      />

      <DeletePlanModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        loading={submitting}
        model={deleteRow?.model}
      />
    </div>
  );
}
