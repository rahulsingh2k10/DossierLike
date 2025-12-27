const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// --- CORS configuration ---
// Allowed explicit origins (production)
const ALLOWED_ORIGINS = [
  'https://rahulsingh.ai',
  'https://www.rahulsingh.ai'
];

// Helper to allow vercel preview hostnames, plus your allowed origins
function corsOriginChecker(origin, callback) {
  // If request has no origin (curl, server-to-server), allow it
  if (!origin) return callback(null, true);

  // Allow exact allowed origins
  if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);

  // Allow Vercel preview domains like something.vercel.app
  try {
    const url = new URL(origin);
    if (url.hostname.endsWith('.vercel.app')) return callback(null, true);
  } catch (e) {
    // ignore parse error
  }

  // Otherwise block
  return callback(new Error('Not allowed by CORS'));
}

// Use the cors middleware
app.use(cors({
  origin: corsOriginChecker,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  // If you need cookies/auth from browser, enable the next line:
  // credentials: true
}));

// Ensure preflight requests are handled quickly
app.options('*', cors({ origin: corsOriginChecker, methods: ['GET','POST','OPTIONS'] }));


if (!process.env.DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL not set. The app will fail to connect without it.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Railway Postgres often works with default SSL settings; if you need SSL set:
  // ssl: { rejectUnauthorized: false }
});

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS likes (
      id TEXT PRIMARY KEY,
      count BIGINT NOT NULL DEFAULT 0
    );
  `);
  // ensure a 'global' row exists
  await pool.query(`
    INSERT INTO likes (id, count)
    VALUES ($1, 0)
    ON CONFLICT (id) DO NOTHING
  `, ['global']);
}


const VIEWS_TABLE = 'portfolio_views_qa';

// GET total views
app.get('/api/views', async (req, res) => {
  try {
    const r = await pool.query(`SELECT COUNT(*) FROM ${VIEWS_TABLE}`);
    res.json({
      success: true,
      view_count: Number(r.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});



app.post('/api/views', async (req, res) => {
  try {
    const viewId = uuidv4();

    await pool.query(
      `
      INSERT INTO ${VIEWS_TABLE} (view_id)
      VALUES ($1)
      `,
      [viewId]
    );

    const r = await pool.query(`SELECT COUNT(*) FROM ${VIEWS_TABLE}`);

    res.json({
      success: true,
      view_count: Number(r.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

















app.get('/likes', async (req, res) => {
  try {
    const r = await pool.query('SELECT count FROM likes WHERE id = $1', ['global']);
    const count = r.rows[0] ? Number(r.rows[0].count) : 0;
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

app.post('/likes', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Try to atomically increment; this pattern is robust and simple
    const update = await client.query(
      'UPDATE likes SET count = count + 1 WHERE id = $1 RETURNING count',
      ['global']
    );
    let row;
    if (update.rowCount === 0) {
      const insert = await client.query(
        'INSERT INTO likes (id, count) VALUES ($1, 1) RETURNING count',
        ['global']
      );
      row = insert.rows[0];
    } else {
      row = update.rows[0];
    }
    await client.query('COMMIT');
    res.json({ count: Number(row.count) });
  } catch (err) {
    await client.query('ROLLBACK').catch(()=>{});
    console.error(err);
    res.status(500).json({ error: 'db error' });
  } finally {
    client.release();
  }
});

// health
app.get('/', (req, res) => res.send('ok'));

const port = process.env.PORT || 3000;
ensureTable()
  .then(() => app.listen(port, ()=> console.log(`Listening on ${port}`)))
  .catch(err => {
    console.error('Failed to ensure table:', err);
    process.exit(1);
  });
