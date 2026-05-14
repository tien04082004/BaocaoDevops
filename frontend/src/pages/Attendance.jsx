import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { Spinner, Alert, Badge } from '../components/UI';

const STATUS_OPTIONS = [
  { value: 'present', label: 'Có mặt', color: 'var(--success)' },
  { value: 'absent', label: 'Vắng', color: 'var(--danger)' },
  { value: 'late', label: 'Đi trễ', color: 'var(--warning)' },
];

export default function AttendancePage() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [existing, setExisting] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const [sv, att] = await Promise.all([
        api.getStudents(),
        api.getAttendance({ date })
      ]);
      setStudents(sv.data);
      const existingMap = {};
      const marksMap = {};
      att.data.forEach(r => {
        existingMap[r.student_id] = r;
        marksMap[r.student_id] = r.status;
      });
      setExisting(existingMap);
      setMarks(marksMap);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleMark = (sid, status) => {
    setMarks(prev => ({ ...prev, [sid]: status }));
  };

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const records = students.map(s => ({
        student_id: s.id,
        status: marks[s.id] || 'absent',
      }));
      await api.bulkAttendance({ date, records });
      setSuccess(`Đã lưu điểm danh ngày ${new Date(date + 'T00:00:00').toLocaleDateString('vi-VN')} thành công!`);
      loadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const markedCount = Object.keys(marks).length;
  const presentCount = Object.values(marks).filter(v => v === 'present').length;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Điểm danh</h1>
      <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 24 }}>Chọn ngày và đánh dấu trạng thái cho từng sinh viên</p>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Ngày điểm danh</label>
            <input type="date" value={date} max={today} onChange={e => setDate(e.target.value)} style={{ width: 200 }} />
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--gray-500)' }}>
            <span>📋 Tổng: <b style={{ color: 'var(--gray-900)' }}>{students.length}</b></span>
            <span>✅ Đã chấm: <b style={{ color: 'var(--primary)' }}>{markedCount}</b></span>
            <span>🟢 Có mặt: <b style={{ color: 'var(--success)' }}>{presentCount}</b></span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" onClick={() => {
              const all = {};
              students.forEach(s => { all[s.id] = 'present'; });
              setMarks(all);
            }}>Chấm tất cả</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : '💾 Lưu điểm danh'}
            </button>
          </div>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      {loading ? <Spinner /> : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã SV</th>
                  <th>Họ tên</th>
                  <th>Lớp</th>
                  <th>Trạng thái</th>
                  <th>Trạng thái hiện tại</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>{s.student_code}</td>
                    <td style={{ fontWeight: 500 }}>{s.full_name}</td>
                    <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>{s.class_name}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {STATUS_OPTIONS.map(opt => (
                          <button key={opt.value}
                            onClick={() => handleMark(s.id, opt.value)}
                            style={{
                              padding: '5px 12px', fontSize: 13,
                              background: marks[s.id] === opt.value ? opt.color : 'transparent',
                              color: marks[s.id] === opt.value ? '#fff' : 'var(--gray-500)',
                              border: `1px solid ${marks[s.id] === opt.value ? opt.color : 'var(--gray-200)'}`,
                              borderRadius: 6
                            }}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td>
                      {existing[s.id]
                        ? <Badge status={existing[s.id].status} />
                        : <span style={{ fontSize: 12, color: 'var(--gray-300)' }}>Chưa chấm</span>
                      }
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
