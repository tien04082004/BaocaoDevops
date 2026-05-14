const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/attendance?date=YYYY-MM-DD
router.get('/', (req, res) => {
  try {
    const { date, student_id, class_name } = req.query;
    let query = `
      SELECT a.*, s.student_code, s.full_name, s.class_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE 1=1
    `;
    const params = [];
    if (date) { query += ' AND a.date = ?'; params.push(date); }
    if (student_id) { query += ' AND a.student_id = ?'; params.push(student_id); }
    if (class_name) { query += ' AND s.class_name = ?'; params.push(class_name); }
    query += ' ORDER BY a.date DESC, s.student_code ASC';

    const records = db.prepare(query).all(...params);
    res.json({ ok: true, data: records });
  } catch (err) {
    console.error('[ERROR] GET /attendance:', err.message);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// POST /api/attendance — mark one student
router.post('/', (req, res) => {
  try {
    const { student_id, date, status, note } = req.body;
    if (!student_id || !date || !status) {
      return res.status(400).json({ ok: false, error: 'student_id, date, status are required' });
    }
    if (!['present', 'absent', 'late'].includes(status)) {
      return res.status(400).json({ ok: false, error: 'status must be present | absent | late' });
    }
    const student = db.prepare('SELECT id FROM students WHERE id = ?').get(student_id);
    if (!student) return res.status(404).json({ ok: false, error: 'Student not found' });

    db.prepare(`
      INSERT INTO attendance (student_id, date, status, note)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(student_id, date) DO UPDATE SET status=excluded.status, note=excluded.note
    `).run(student_id, date, status, note || '');

    const record = db.prepare(`
      SELECT a.*, s.student_code, s.full_name, s.class_name
      FROM attendance a JOIN students s ON a.student_id = s.id
      WHERE a.student_id = ? AND a.date = ?
    `).get(student_id, date);
    res.status(201).json({ ok: true, data: record });
  } catch (err) {
    console.error('[ERROR] POST /attendance:', err.message);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// POST /api/attendance/bulk — mark whole class for a date
router.post('/bulk', (req, res) => {
  try {
    const { date, records } = req.body;
    if (!date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ ok: false, error: 'date and records[] are required' });
    }
    const stmt = db.prepare(`
      INSERT INTO attendance (student_id, date, status, note)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(student_id, date) DO UPDATE SET status=excluded.status, note=excluded.note
    `);
    const bulkInsert = db.transaction((recs) => {
      for (const r of recs) {
        if (!['present', 'absent', 'late'].includes(r.status)) continue;
        stmt.run(r.student_id, date, r.status, r.note || '');
      }
    });
    bulkInsert(records);
    res.json({ ok: true, message: `Saved ${records.length} records for ${date}` });
  } catch (err) {
    console.error('[ERROR] POST /attendance/bulk:', err.message);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// DELETE /api/attendance/:id
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT id FROM attendance WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ ok: false, error: 'Record not found' });
    db.prepare('DELETE FROM attendance WHERE id = ?').run(req.params.id);
    res.json({ ok: true, message: 'Deleted successfully' });
  } catch (err) {
    console.error('[ERROR] DELETE /attendance/:id:', err.message);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// GET /api/attendance/summary?date=YYYY-MM-DD
router.get('/summary', (req, res) => {
  try {
    const { date, class_name } = req.query;
    let query = `
      SELECT 
        a.date,
        COUNT(*) as total,
        SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN a.status='absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN a.status='late' THEN 1 ELSE 0 END) as late
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE 1=1
    `;
    const params = [];
    if (date) { query += ' AND a.date = ?'; params.push(date); }
    if (class_name) { query += ' AND s.class_name = ?'; params.push(class_name); }
    query += ' GROUP BY a.date ORDER BY a.date DESC LIMIT 30';
    const summary = db.prepare(query).all(...params);
    res.json({ ok: true, data: summary });
  } catch (err) {
    console.error('[ERROR] GET /attendance/summary:', err.message);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

module.exports = router;
