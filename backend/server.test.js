process.env.DB_PATH = ':memory:';
process.env.NODE_ENV = 'test';
process.env.CORS_ORIGIN = 'http://localhost:5173';

const request = require('supertest');
const app = require('./server');
const { initDB } = require('./db');

beforeAll(() => { initDB(); });

describe('GET /api/health', () => {
  it('should return ok: true', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe('Students API', () => {
  it('GET /api/students - returns list', async () => {
    const res = await request(app).get('/api/students');
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/students - creates student', async () => {
    const res = await request(app).post('/api/students').send({
      student_code: 'TEST001',
      full_name: 'Test Student',
      class_name: 'TEST-K22',
      email: 'test@test.com'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.student_code).toBe('TEST001');
  });

  it('POST /api/students - fails on missing fields', async () => {
    const res = await request(app).post('/api/students').send({ full_name: 'No Code' });
    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  it('POST /api/students - fails on duplicate code', async () => {
    await request(app).post('/api/students').send({
      student_code: 'DUP001', full_name: 'First', class_name: 'A'
    });
    const res = await request(app).post('/api/students').send({
      student_code: 'DUP001', full_name: 'Second', class_name: 'A'
    });
    expect(res.statusCode).toBe(409);
  });

  it('GET /api/students/:id - returns 404 for unknown', async () => {
    const res = await request(app).get('/api/students/99999');
    expect(res.statusCode).toBe(404);
  });
});

describe('Attendance API', () => {
  let studentId;

  beforeAll(async () => {
    const res = await request(app).post('/api/students').send({
      student_code: 'ATT001', full_name: 'Att Student', class_name: 'ATT-K22'
    });
    studentId = res.body.data?.id;
  });

  it('POST /api/attendance - marks attendance', async () => {
    const res = await request(app).post('/api/attendance').send({
      student_id: studentId, date: '2024-01-15', status: 'present'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.status).toBe('present');
  });

  it('POST /api/attendance - upserts on duplicate date', async () => {
    await request(app).post('/api/attendance').send({
      student_id: studentId, date: '2024-01-16', status: 'absent'
    });
    const res = await request(app).post('/api/attendance').send({
      student_id: studentId, date: '2024-01-16', status: 'present'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.status).toBe('present');
  });

  it('POST /api/attendance - rejects invalid status', async () => {
    const res = await request(app).post('/api/attendance').send({
      student_id: studentId, date: '2024-01-17', status: 'unknown'
    });
    expect(res.statusCode).toBe(400);
  });

  it('GET /api/attendance - filters by date', async () => {
    const res = await request(app).get('/api/attendance?date=2024-01-15');
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('GET /api/attendance/summary - returns summary', async () => {
    const res = await request(app).get('/api/attendance/summary');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
