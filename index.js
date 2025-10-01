// // index.js
// require('dotenv').config();
// const express = require('express');
// const { Pool } = require('pg');
// const cors = require('cors');
// 
// const app = express();
// app.use(express.json());
// app.use(cors());
// 
// const PORT = process.env.PORT || 3000;
// 
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false }   // required on Railway Postgres
// });
// 
// // GET /api/like
// app.get('/api/like', async (req, res) => {
//   try {
//     const { rows } = await pool.query('SELECT likes FROM dossierlikes LIMIT 1');
//     const count = rows.length ? rows[0].likes : 0;
//     res.json({ count });
//   } catch (err) {
//     console.error('GET /api/like error', err);
//     res.status(500).json({ error: 'internal' });
//   }
// });
// 
// // POST /api/like
// app.post('/api/like', async (req, res) => {
//   try {
//     await pool.query('UPDATE dossierlikes SET likes = likes + 1');
//     const { rows } = await pool.query('SELECT likes FROM dossierlikes LIMIT 1');
//     res.json({ count: rows[0].likes });
//   } catch (err) {
//     console.error('POST /api/like error', err);
//     res.status(500).json({ error: 'internal' });
//   }
// });
// 
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Listening on ${PORT}`);
// });


// index.js (safer DB connect)
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* log DB config (obscure password before printing if prefer) */
console.log('Using DATABASE_URL (first 100 chars):', (process.env.DATABASE_URL || '').slice(0,100));

app.get('/', (req, res) => res.send('OK - root'));

app.get('/api/like', async (req, res) => {
  try {
    // quick safe query (no write)
    const { rows } = await pool.query('SELECT likes FROM dossierlikes LIMIT 1');
    res.json({ count: rows[0] ? Number(rows[0].likes) : 0 });
  } catch (err) {
    console.error('DB query error', err);
    // return an error body — but app must respond, not hang
    res.status(500).json({ error: 'db' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`App listening on ${PORT}`);
});