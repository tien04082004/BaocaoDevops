const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  // Health
  health: () => request('/api/health'),

  // Students
  getStudents: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/students${q ? '?' + q : ''}`);
  },
  getStudent: (id) => request(`/api/students/${id}`),
  createStudent: (body) => request('/api/students', { method: 'POST', body }),
  updateStudent: (id, body) => request(`/api/students/${id}`, { method: 'PUT', body }),
  deleteStudent: (id) => request(`/api/students/${id}`, { method: 'DELETE' }),
  getStudentStats: (id) => request(`/api/students/${id}/stats`),

  // Attendance
  getAttendance: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/attendance${q ? '?' + q : ''}`);
  },
  markAttendance: (body) => request('/api/attendance', { method: 'POST', body }),
  bulkAttendance: (body) => request('/api/attendance/bulk', { method: 'POST', body }),
  deleteAttendance: (id) => request(`/api/attendance/${id}`, { method: 'DELETE' }),
  getSummary: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/attendance/summary${q ? '?' + q : ''}`);
  },
};
