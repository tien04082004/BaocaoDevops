import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Spinner, Alert, Modal } from '../components/UI';

function StudentForm({ initial, onSubmit, onClose }) {
  const [form, setForm] = useState(initial || { student_code: '', full_name: '', class_name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try { await onSubmit(form); onClose(); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      {error && <Alert>{error}</Alert>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {!initial && (
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Mã sinh viên *</label>
            <input value={form.student_code} onChange={set('student_code')} placeholder="SV001" />
          </div>
        )}
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Họ và tên *</label>
          <input value={form.full_name} onChange={set('full_name')} placeholder="Nguyễn Văn A" />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Lớp *</label>
          <input value={form.class_name} onChange={set('class_name')} placeholder="CNTT-K22A" />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Email</label>
          <input type="email" value={form.email} onChange={set('email')} placeholder="sv@student.edu.vn" />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn-ghost" onClick={onClose}>Hủy</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Đang lưu...' : (initial ? 'Cập nhật' : 'Thêm sinh viên')}
          </button>
        </div>
      </div>
    </>
  );
}

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getStudents();
      setStudents(res.data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Xóa sinh viên "${name}"? Dữ liệu điểm danh cũng sẽ bị xóa.`)) return;
    try {
      await api.deleteStudent(id);
      setSuccess(`Đã xóa sinh viên ${name}`);
      load();
    } catch (e) { setError(e.message); }
  };

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.student_code.toLowerCase().includes(search.toLowerCase()) ||
    s.class_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Quản lý sinh viên</h1>
      <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 24 }}>Thêm, sửa, xóa thông tin sinh viên</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Tìm kiếm theo tên, mã SV, lớp..."
          style={{ flex: 1, minWidth: 200 }} />
        <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Thêm sinh viên</button>
      </div>

      {error && <Alert>{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      {loading ? <Spinner /> : (
        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12 }}>
            Tìm thấy <b>{filtered.length}</b> / {students.length} sinh viên
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Mã SV</th><th>Họ tên</th><th>Lớp</th><th>Email</th><th>Ngày tạo</th><th>Hành động</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 32 }}>Không có sinh viên nào.</td></tr>
                  : filtered.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>{s.student_code}</td>
                      <td style={{ fontWeight: 500 }}>{s.full_name}</td>
                      <td><span style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 12, padding: '2px 8px', borderRadius: 99, fontWeight: 500 }}>{s.class_name}</span></td>
                      <td style={{ color: 'var(--gray-500)', fontSize: 13 }}>{s.email || '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>{new Date(s.created_at).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 13 }}
                            onClick={() => setEditing(s)}>Sửa</button>
                          <button className="btn-danger" style={{ padding: '4px 10px', fontSize: 13 }}
                            onClick={() => handleDelete(s.id, s.full_name)}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && (
        <Modal title="Thêm sinh viên mới" onClose={() => setShowAdd(false)}>
          <StudentForm onClose={() => { setShowAdd(false); load(); }}
            onSubmit={data => api.createStudent(data)} />
        </Modal>
      )}

      {editing && (
        <Modal title={`Sửa: ${editing.full_name}`} onClose={() => setEditing(null)}>
          <StudentForm
            initial={editing}
            onClose={() => { setEditing(null); load(); }}
            onSubmit={data => api.updateStudent(editing.id, data)} />
        </Modal>
      )}
    </div>
  );
}
