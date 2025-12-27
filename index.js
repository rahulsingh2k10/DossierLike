'use strict';

/* =========================
   Imports & App Setup
========================= */
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const UAParser = require('ua-parser-js');

const app = express();
app.use(express.json());
app.use(cookieParser());

/* =========================
   CORS (match production)
========================= */
const ALLOWED_ORIGINS = [
  'https://rahulsingh.ai',
  'https://www.rahulsingh.ai'
];

/* =========================
   Helper to allow vercel preview hostnames, plus your allowed origins
========================= */
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

function getAllowedOrigin(origin) {
  if (!origin) return '*';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  try {
    const url = new URL(origin);
    if (url.hostname.endsWith('.vercel.app')) return origin;
  } catch (e) {}
  return ALLOWED_ORIGINS[0]; // fallback
}

// Handle preflight FIRST
app.options('*', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': getAllowedOrigin(req.headers.origin),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  });
  res.status(200).end();
});


// Use the cors middleware
app.use(cors({
  origin: corsOriginChecker,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400
}));

// Ensure preflight requests are handled quickly
app.options('*', cors({ 
  origin: corsOriginChecker,
  credentials: true,
  methods: ['GET','POST','OPTIONS']
}));


/* =========================
   Database
========================= */
if (!process.env.DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL not set. The app will fail to connect without it.');
}


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Railway Postgres often works with default SSL settings; if you need SSL set:
  // ssl: { rejectUnauthorized: false }
});


/* =========================
   Session & Identity
========================= */
const SECRET_KEY = process.env.SECRET_KEY;
const SESSION_COOKIE = 'sid';
const SESSION_DAYS = 30;

function generateSessionId() {
  return crypto.randomBytes(16).toString('hex');
}

function generateSubjectId(sessionId) {
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(sessionId)
    .digest('hex');
}

function getOrCreateSession(req, res) {
  const token = req.cookies.sid;

  if (token) {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      return {
        sessionId: decoded.sid,
        subjectId: generateSubjectId(decoded.sid)
      };
    } catch {
      // fall through and re-create
    }
  }

  // Create new session (first-ever visit OR cookie expired)
  const sessionId = crypto.randomBytes(16).toString('hex');

  const jwtToken = jwt.sign(
    { sid: sessionId },
    SECRET_KEY,
    { expiresIn: '365d' }
  );

  res.cookie('sid', jwtToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 365 * 24 * 60 * 60 * 1000
  });

  return {
    sessionId,
    subjectId: generateSubjectId(sessionId)
  };
}


/* =========================
   Client Metadata
========================= */
function parseUserAgent(req) {
  const parser = new UAParser(req.headers['user-agent']);
  const ua = parser.getResult();

  return {
    os_family: ua.os.name || 'Unknown',
    browser_name: ua.browser.name || 'Unknown',
    is_mobile:
      ua.device.type === 'mobile' ||
      ua.device.type === 'tablet'
  };
}

function getClientIp(req) {
  return (
    req.headers['cf-connecting-ip'] ||
    req.headers['true-client-ip'] ||
    req.headers['x-real-ip'] ||
    (req.headers['x-forwarded-for'] || '').split(',')[0] ||
    req.socket.remoteAddress ||
    'Unknown'
  );
}

/* =========================
   Geo Lookup (ip-api)
========================= */
async function getGeo(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1') {
    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      isp: 'Unknown',
      network: 'Unknown'
    };
  }

  try {
    const { data } = await axios.get(
      `http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,mobile,hosting,proxy`,
      { timeout: 5000 }
    );

    if (data.status !== 'success') throw new Error();

    let network = 'Broadband';
    if (data.mobile) network = 'Mobile';
    else if (data.hosting) network = 'Hosting/Data Center';
    else if (data.proxy) network = 'Proxy/VPN';

    return {
      country: data.country || 'Unknown',
      region: data.regionName || 'Unknown',
      city: data.city || 'Unknown',
      isp: data.isp || 'Unknown',
      network
    };
  } catch {
    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      isp: 'Unknown',
      network: 'Unknown'
    };
  }
}

/* =========================
   Health Check
========================= */
app.get('/', (_, res) => res.send('ok'));

/* =========================
   Views API (EVENT BASED)
========================= */
app.post('/api/views', async (req, res) => {
  console.log('POST /api/views HIT', new Date().toISOString());

  try {
    const { subjectId } = getOrCreateSession(req, res);
    const ua = parseUserAgent(req);
    const ip = getClientIp(req);
    const geo = await getGeo(ip);

    const viewId = crypto.randomUUID();
    const timezone = req.body?.timezone || 'Unknown';

	console.log('ABOUT TO INSERT', {viewId,subjectId});
    const result = await pool.query(
      `
      INSERT INTO portfolio_views
      (view_id, subject_id, os_family, browser_name, timezone,
       ip_country, ip_region, ip_city, ip_isp, ip_network_type)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      `,
      [
        viewId,
        subjectId,
        ua.os_family,
        ua.browser_name,
        timezone,
        geo.country,
        geo.region,
        geo.city,
        geo.isp,
        geo.network
      ]
    );

	console.log('INSERT RESULT:', result.rowCount);

    res.json({ success: true });
  } catch (err) {
    console.error('View tracking failed:', err);
    res.status(500).json({ success: false });
  }
});

/* =========================
   Views Count
========================= */
app.get('/api/views', async (_, res) => {
  try {
    const r = await pool.query('SELECT COUNT(*) FROM portfolio_views');
    res.json({ success: true, view_count: Number(r.rows[0].count) });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* =========================
   Start Server
========================= */
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});