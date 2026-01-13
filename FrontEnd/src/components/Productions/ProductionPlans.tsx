import { useCallback, useEffect, useState } from 'react';
import { productionPlansApi, SummaryResponse } from '../../services/api';
import { ProductionPlanTable } from './ProductionPlanTable';
import { CreateMonthPlanModal, CreateDayPlanModal } from './CreatePlanModal';
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
  const [submitting, setSubmitting] = useState(false);
  const [editingRow, setEditingRow] = useState<SummaryResponse['rows'][0] | null>(null);
  const [dayPlanModel, setDayPlanModel] = useState<string | undefined>(undefined);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summaryData = await productionPlansApi.getDailySummary(date);
      setSummary(summaryData);
    } catch (err: any) {
      console.error('Error fetching summary:', err);
      setError(err?.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

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
      await fetchSummary();
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

  const handleOpenDayModal = (row?: SummaryResponse['rows'][0]) => {
    setError(null);
    setShowDayModal(true);
  };

  const handleEdit = (row: SummaryResponse['rows'][0]) => {
    setEditingRow(row);
    setError(null);
    setShowMonthModal(true);
  };

  const handleDelete = async (row: SummaryResponse['rows'][0]) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa kế hoạch tháng của loại xe ${row.model}?`)) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      // Get current month
      const today = new Date();
      const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      
      // Set plannedMonth to 0 to effectively delete it
      await productionPlansApi.upsertMonthPlan({
        model: row.model,
        month,
        plannedMonth: 0,
      });
      
      await fetchSummary();
      setSuccess('Xóa kế hoạch tháng thành công!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting month plan:', err);
      setError(err?.message || 'Lỗi khi xóa kế hoạch tháng');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddDayPlan = (row: SummaryResponse['rows'][0]) => {
    setError(null);
    setDayPlanModel(row.model);
    setShowDayModal(true);
  };

  const handleCloseDayModal = () => {
    if (!submitting) {
      setShowDayModal(false);
      setDayPlanModel(undefined);
    }
  };

  const handleSubmitDayPlan = async (data: {
    model: string;
    date: string;
    plannedDay: number;
  }) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await productionPlansApi.upsertDailyResult(data);
      await fetchSummary();
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
          <div className="plans-actions">
            <button
              className="plans-button plans-button-month"
              onClick={handleOpenMonthModal}
              disabled={submitting}
            >
              Tạo kế hoạch tháng
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="plans-main">
        <section className="plans-section">
          <div className="section-header">
            <div className="section-title-bar"></div>
            <h2 className="section-title">KẾ HOẠCH SẢN XUẤT</h2>
          </div>
          <ProductionPlanTable
            summary={summary}
            loading={loading}
            showActions={true}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddDayPlan={handleAddDayPlan}
          />
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
      />
    </div>
  );
}
