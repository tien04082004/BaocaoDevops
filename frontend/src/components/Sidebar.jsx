import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Tổng quan', icon: '▤' },
  { to: '/attendance', label: 'Điểm danh', icon: '✓' },
  { to: '/students', label: 'Sinh viên', icon: '⊞' },
  { to: '/history', label: 'Lịch sử', icon: '◷' },
];

export default function Sidebar({ healthOk }) {
  return (
    <aside style={{
      width: 220, background: '#1e293b', color: '#fff',
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh', padding: '0 0 20px',
      flexShrink: 0
    }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>📋 Điểm Danh</div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Hệ thống quản lý</div>
      </div>

      <nav style={{ flex: 1, padding: '12px 12px' }}>
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, marginBottom: 2,
              textDecoration: 'none', fontSize: 14, fontWeight: 500,
              color: isActive ? '#fff' : '#94a3b8',
              background: isActive ? 'rgba(37,99,235,.7)' : 'transparent',
              transition: 'all .15s'
            })}
          >
            <span style={{ fontSize: 16 }}>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,.1)', fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: healthOk ? '#22c55e' : '#ef4444',
            display: 'inline-block'
          }} />
          <span style={{ color: '#94a3b8' }}>API {healthOk ? 'Online' : 'Offline'}</span>
        </div>
      </div>
    </aside>
  );
}
