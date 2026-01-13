import { useState } from 'react';
import { MonthlyPlanForm } from './components/ProductionPlans/MonthlyPlanForm';
import { DailyResultForm } from './components/ProductionPlans/DailyResultForm';
import { SummaryTable } from './components/ProductionPlans/SummaryTable';
import { VehicleStatusTable } from './components/Productions/VehicleStatusTable';
import { StationStatusDisplay } from './components/Productions/StationStatusDisplay';
import { ProductionOverview } from './components/Productions/ProductionOverview';
import './App.css';

type Tab = 'month' | 'day' | 'summary' | 'status' | 'station-status' | 'overview';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // If overview is active, render it full screen without the app wrapper
  if (activeTab === 'overview') {
    return <ProductionOverview />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Quản lý sản xuất</h1>
        <nav className="nav-tabs">
          <button
            className="nav-tab"
            onClick={() => setActiveTab('overview')}
          >
            Tổng quan
          </button>
          <button
            className={`nav-tab ${activeTab === 'station-status' ? 'active' : ''}`}
            onClick={() => setActiveTab('station-status')}
          >
            Trạng thái trạm
          </button>
          <button
            className={`nav-tab ${activeTab === 'status' ? 'active' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            Trạng thái xe
          </button>
          <button
            className={`nav-tab ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            Tổng hợp
          </button>
          <button
            className={`nav-tab ${activeTab === 'month' ? 'active' : ''}`}
            onClick={() => setActiveTab('month')}
          >
            Kế hoạch tháng
          </button>
          <button
            className={`nav-tab ${activeTab === 'day' ? 'active' : ''}`}
            onClick={() => setActiveTab('day')}
          >
            Kết quả ngày
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'station-status' && <StationStatusDisplay />}
        {activeTab === 'status' && <VehicleStatusTable />}
        {activeTab === 'summary' && <SummaryTable />}
        {activeTab === 'month' && <MonthlyPlanForm />}
        {activeTab === 'day' && <DailyResultForm />}
      </main>
    </div>
  );
}

export default App;
