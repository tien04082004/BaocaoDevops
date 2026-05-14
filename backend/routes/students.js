const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/students
router.get('/', (req, res) => {
  try {
    const { class_name } = req.query;
    let students;
    if (class_name) {
      students = db.prepare('SELECT * FROM students WHERE class_name = ? ORDER BY student_code').all(class_name);
    } else {
      students = db.prepare('SELECT * FROM students ORDER BY student_code').all();
    }
    res.json({ ok: true, data: students });
  } catch (err) {
    console.error('[ERROR] GET /students:', err.message);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// GET /api/students/:id
router.get('/:id', (req, res) => {
  try {
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    if (!student) return res.status(404).json({ ok: false, error: 'Student not found' });
    res.json({ ok: true, data: student });
  } catch (err) {
    console.error('[ERROR] GET /students/:id:', err.message);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// POST /api/students
router.post('/', (req, res) => {
  try {
    const { student_code, full_name, class_name, email } = req.body;
    if (!student_code || !full_name || !class_name) {
      return res.status(400).json({ ok: false, error: 'student_code, full_name, class_name are required' });
    }
    const stmt = db.prepare(
      'INSERT INTO students (student_code, full_name, class_name, email) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(student_code, full_name, class_name, email || '');
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ ok: true, data: student });
  } catch (err) {
    console.error('[ERROR] POST /students:', err.message);
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ ok: false, error: 'student_code already exists' });
    }
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// PUT /api/students/:id
router.put('/:id', (req, res) => {
  try {
    const { full_name, class_name, email } = req.body;
    const existing = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ ok: false, error: 'Student not found' });
    db.prepare('UPDATE students SET full_name=?, class_name=?, email=? WHERE id=?')
      .run(full_name || existing.full_name, class_name || existing.class_name, email ?? existing.email, req.params.id);
    const updated = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    res.json({ ok: true, data: updated });
  } catch (err) {
    console.error('[ERROR] PUT /students/:id:', err.message);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// DELETE /api/students/:id
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ ok: false, error: 'Student not found' });
    db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
    res.json({ ok: true, message: 'Deleted successfully' });
  } catch (err) {
    console.error('[ERROR] DELETE /students/:id:', err.message);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// GET /api/students/:id/stats
router.get('/:id/stats', (req, res) => {
  try {
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    if (!student) return res.status(404).json({ ok: false, error: 'Student not found' });
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status='absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status='late' THEN 1 ELSE 0 END) as late
      FROM attendance WHERE student_id = ?
    `).get(req.params.id);
    res.json({ ok: true, data: { student, stats } });
  } catch (err) {
    console.error('[ERROR] GET /students/:id/stats:', err.message);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

module.exports = router;
