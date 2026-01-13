import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProductionOverview } from './components/Productions/ProductionOverview';
import { ProductionPlans } from './components/Productions/ProductionPlans';
import { Models } from './components/Models/Models';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductionOverview />} />
        <Route path="/plans" element={<ProductionPlans />} />
        <Route path="/models" element={<Models />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
