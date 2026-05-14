import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Spinner, Alert, Badge } from '../components/UI';

export default function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    api.getStudents()
      .then(res => {
        const cls = [...new Set(res.data.map(s => s.class_name))].sort();
        setClasses(cls);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true); setError('');
    const params = {};
    if (filterDate) params.date = filterDate;
    if (filterClass) params.class_name = filterClass;
    api.getAttendance(params)
      .then(res => setRecords(res.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [filterDate, filterClass]);

  const handleDelete = async (id) => {
    if (!confirm('Xóa bản ghi điểm danh này?')) return;
    try {
      await api.deleteAttendance(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (e) { setError(e.message); }
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Lịch sử điểm danh</h1>
      <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 24 }}>Xem và tra cứu toàn bộ lịch sử điểm danh</p>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Lọc theo ngày</label>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Lọc theo lớp</label>
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)}>
              <option value="">-- Tất cả lớp --</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn-ghost" onClick={() => { setFilterDate(''); setFilterClass(''); }}>Xóa bộ lọc</button>
          </div>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}

      {loading ? <Spinner /> : (
        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12 }}>
            Tổng: <b>{records.length}</b> bản ghi
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Ngày</th><th>Mã SV</th><th>Họ tên</th><th>Lớp</th><th>Trạng thái</th><th>Ghi chú</th><th></th></tr>
              </thead>
              <tbody>
                {records.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 32 }}>Không có bản ghi nào.</td></tr>
                  : records.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500 }}>{new Date(r.date + 'T00:00:00').toLocaleDateString('vi-VN')}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 600 }}>{r.student_code}</td>
                      <td>{r.full_name}</td>
                      <td style={{ fontSize: 13 }}>{r.class_name}</td>
                      <td><Badge status={r.status} /></td>
                      <td style={{ color: 'var(--gray-500)', fontSize: 13 }}>{r.note || '—'}</td>
                      <td>
                        <button className="btn-danger" style={{ padding: '3px 8px', fontSize: 12 }}
                          onClick={() => handleDelete(r.id)}>Xóa</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
