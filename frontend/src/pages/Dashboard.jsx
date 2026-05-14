import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Spinner, Alert, StatCard } from '../components/UI';

export default function Dashboard() {
  const [summary, setSummary] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getSummary(), api.getStudents()])
      .then(([s, st]) => { setSummary(s.data); setStudents(st.data); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const today = new Date().toISOString().split('T')[0];
  const todayData = summary.find(s => s.date === today);
  const totalPresent = summary.reduce((a, s) => a + s.present, 0);
  const totalAbsent = summary.reduce((a, s) => a + s.absent, 0);
  const totalLate = summary.reduce((a, s) => a + s.late, 0);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Tổng quan</h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: 24, fontSize: 14 }}>
        Thống kê điểm danh hệ thống — {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      {error && <Alert>{error}</Alert>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard label="Tổng sinh viên" value={students.length} color="var(--primary)" />
        <StatCard label="Hôm nay: Có mặt" value={todayData?.present ?? '—'} color="var(--success)" />
        <StatCard label="Hôm nay: Vắng" value={todayData?.absent ?? '—'} color="var(--danger)" />
        <StatCard label="Tổng buổi ghi nhận" value={summary.length} color="#7c3aed" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>📅 Lịch sử 30 ngày gần nhất</h2>
          {summary.length === 0
            ? <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Chưa có dữ liệu điểm danh.</p>
            : <div className="table-wrap">
              <table>
                <thead><tr><th>Ngày</th><th>Có mặt</th><th>Vắng</th><th>Trễ</th></tr></thead>
                <tbody>
                  {summary.slice(0, 10).map(row => (
                    <tr key={row.date}>
                      <td style={{ fontWeight: 500 }}>{new Date(row.date + 'T00:00:00').toLocaleDateString('vi-VN')}</td>
                      <td style={{ color: 'var(--success)' }}>{row.present}</td>
                      <td style={{ color: 'var(--danger)' }}>{row.absent}</td>
                      <td style={{ color: 'var(--warning)' }}>{row.late}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        </div>

        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>📊 Tổng hợp toàn kỳ</h2>
          {[
            { label: 'Có mặt', value: totalPresent, color: 'var(--success)' },
            { label: 'Vắng', value: totalAbsent, color: 'var(--danger)' },
            { label: 'Đi trễ', value: totalLate, color: 'var(--warning)' },
          ].map(item => {
            const total = totalPresent + totalAbsent + totalLate;
            const pct = total ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={item.label} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 500 }}>{item.label}</span>
                  <span style={{ color: 'var(--gray-500)' }}>{item.value} ({pct}%)</span>
                </div>
                <div style={{ height: 8, background: 'var(--gray-100)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: 99, transition: 'width .4s' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
