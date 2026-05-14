import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AttendancePage from './pages/Attendance';
import StudentsPage from './pages/Students';
import HistoryPage from './pages/History';
import { api } from './utils/api';

export default function App() {
  const [healthOk, setHealthOk] = useState(null);

  useEffect(() => {
    api.health()
      .then(() => setHealthOk(true))
      .catch(() => setHealthOk(false));
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar healthOk={healthOk} />
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
        {healthOk === false && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
            padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14
          }}>
            ⚠️ Không thể kết nối tới API backend. Kiểm tra lại server hoặc biến môi trường <code>VITE_API_URL</code>.
          </div>
        )}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>
    </div>
  );
}
