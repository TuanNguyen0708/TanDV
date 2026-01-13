import { useState } from 'react';
import { MonthlyPlanForm } from './components/ProductionPlans/MonthlyPlanForm';
import { DailyResultForm } from './components/ProductionPlans/DailyResultForm';
import { SummaryTable } from './components/ProductionPlans/SummaryTable';
import './App.css';

type Tab = 'month' | 'day' | 'summary';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('summary');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Quản lý sản xuất</h1>
        <nav className="nav-tabs">
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
        {activeTab === 'summary' && <SummaryTable />}
        {activeTab === 'month' && <MonthlyPlanForm />}
        {activeTab === 'day' && <DailyResultForm />}
      </main>
    </div>
  );
}

export default App;
