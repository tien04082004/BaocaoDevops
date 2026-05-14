// Shared UI components

export function Spinner() {
  return <div className="spinner" />;
}

export function Alert({ type = 'error', children }) {
  return <div className={`alert alert-${type}`}>{children}</div>;
}

export function Badge({ status }) {
  const label = { present: 'Có mặt', absent: 'Vắng', late: 'Trễ' };
  return <span className={`badge badge-${status}`}>{label[status] || status}</span>;
}

export function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 16
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600 }}>{title}</h2>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '4px 10px' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StatCard({ label, value, color }) {
  return (
    <div className="card" style={{ textAlign: 'center', borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>{label}</div>
    </div>
  );
}
