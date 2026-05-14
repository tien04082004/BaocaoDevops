require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan('[:date[clf]] :method :url :status :response-time ms'));

// Routes
app.use('/api/students', require('./routes/students'));
app.use('/api/attendance', require('./routes/attendance'));

// Health check — bắt buộc
app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ ok: false, error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[UNHANDLED ERROR]', err.stack);
  res.status(500).json({ ok: false, error: 'Internal server error' });
});

// Init DB then start
initDB();
app.listen(PORT, () => {
  console.log(`[SERVER] Running on port ${PORT} | ENV: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
