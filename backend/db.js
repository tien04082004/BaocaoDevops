const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './data/attendance.db';

let db;

function getDb() {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (dir !== '.' && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA foreign_keys = ON');
  }
  return db;
}

function initDB() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_code TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      class_name TEXT NOT NULL,
      email TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('present','absent','late')),
      note TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      UNIQUE(student_id, date)
    );
  `);

  const count = database.prepare('SELECT COUNT(*) as c FROM students').get();
  if (count.c === 0) {
    const seedStudents = [
      ['SV001', 'Nguyễn Văn An',   'CNTT-K22A', 'an.nv@student.edu.vn'],
      ['SV002', 'Trần Thị Bình',   'CNTT-K22A', 'binh.tt@student.edu.vn'],
      ['SV003', 'Lê Minh Cường',   'CNTT-K22A', 'cuong.lm@student.edu.vn'],
      ['SV004', 'Phạm Thị Dung',   'CNTT-K22B', 'dung.pt@student.edu.vn'],
      ['SV005', 'Hoàng Văn Em',    'CNTT-K22B', 'em.hv@student.edu.vn'],
      ['SV006', 'Vũ Thị Phương',   'CNTT-K22B', 'phuong.vt@student.edu.vn'],
    ];
    const ins = database.prepare('INSERT INTO students (student_code,full_name,class_name,email) VALUES (?,?,?,?)');
    for (const s of seedStudents) ins.run(...s);

    const insAtt = database.prepare('INSERT OR IGNORE INTO attendance (student_id,date,status,note) VALUES (?,?,?,?)');
    const statuses = ['present','present','present','absent','late'];
    for (let d = 6; d >= 1; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split('T')[0];
      for (let sid = 1; sid <= 6; sid++) {
        insAtt.run(sid, dateStr, statuses[Math.floor(Math.random() * statuses.length)], '');
      }
    }
    console.log('[DB] Seed data inserted');
  }

  console.log('[DB] Initialized at', DB_PATH);
}

module.exports = { db: { prepare: (...a) => getDb().prepare(...a), exec: (...a) => getDb().exec(...a) }, initDB };
