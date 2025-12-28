'use strict';

/* =========================
   IMPORTS AND APP SETUP
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
   ENVIRONMENT VALIDATION
   Ensures all required env
   variables are present
========================= */
const {
  DATABASE_URL,
  SECRET_KEY,
  PORT = 3000
} = process.env;

console.log('BOOTSTRAP STARTED');

/* =========================
   DATABASE
========================= */
if (!DATABASE_URL || !SECRET_KEY) {
  console.warn('FATAL: DATABASE_URL or SECRET_KEY missing');

  throw new Error('Missing required environment variables');
}

/* =========================
   CORS CONFIGURATION
   Controls allowed origins
   including Vercel previews
========================= */
const ALLOWED_ORIGINS = [
  'https://rahulsingh.ai',
  'https://www.rahulsingh.ai'
];

/* =========================
   CORS ORIGIN VALIDATOR
   Dynamically validates
   incoming request origins
========================= */
function corsOriginChecker(origin, callback) {
  console.log('CORS ORIGIN CHECKER', origin);

  if (!origin) return callback(null, true);

  if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);

  try {
    const url = new URL(origin);
    if (url.hostname.endsWith('.vercel.app')) return callback(null, true);
  } catch (e) {
  }

  console.error('CORS BLOCKED:', origin);

  return callback(new Error('Not allowed by CORS'));
}

/* =========================
   Custom CORS middleware that echoes origin
========================= */
app.use(cors({
  origin: corsOriginChecker,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/* =========================
   DATABASE CONFIGURATION
   Initializes PostgreSQL
   connection pool
========================= */
const pool = new Pool({ connectionString: DATABASE_URL });

/* =========================
   SESSION AND IDENTITY
   Cookie-based session
   management helpers
========================= */

/* =========================
   Subject ID GENERATOR
   Creates a stable,
   anonymized identifier
========================= */
function generateSubjectId(sessionId) {
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(sessionId)
    .digest('hex');
}

/* =========================
   SESSION RESOLVER
   Reads existing session
   or creates a new one
========================= */
function getOrCreateSession(req, res) {
  const token = req.cookies.sid;

  if (token) {
    try {
      const { sid } = jwt.verify(token, SECRET_KEY);
      return { subjectId: generateSubjectId(sid) };
    } catch {
      // Invalid or expired token – regenerate
    }
  }

  const sessionId = crypto.randomBytes(16).toString('hex');
  const jwtToken = jwt.sign({ sid: sessionId }, SECRET_KEY, {
    expiresIn: '365d'
  });

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
   CLIENT METADATA
   Browser and OS detection
========================= */

/* =========================
   USER-AGENT PARSER
   Extracts OS and browser
   information from request
========================= */
function parseUserAgent(req) {
  const ua = new UAParser(req.headers['user-agent']).getResult();

  return {
    os_family: ua.os.name || 'Unknown',
    browser_name: ua.browser.name || 'Unknown',
    is_mobile:
      ua.device.type === 'mobile' ||
      ua.device.type === 'tablet'
  };
}

/* =========================
   CLIENT IP RESOLVER
   Determines real client
   IP behind proxies/CDNs
========================= */
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
   GEO LOCATION LOOKUP
   Resolves IP-based
   location and network
========================= */

/* =========================
   EMPTY GEO FALLBACK
   Used when lookup fails
========================= */
function emptyGeo() {
  return {
    country: 'Unknown',
    region: 'Unknown',
    city: 'Unknown',
    isp: 'Unknown',
    network: 'Unknown'
  };
}

/* =========================
   GEO RESOLVER
   Queries external service
   for IP geo metadata
========================= */
async function getGeo(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1') {
    return emptyGeo();
  }

  try {
    const { data } = await axios.get(
      `http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,mobile,hosting,proxy`,
      { timeout: 5000 }
    );

    if (data.status !== 'success') {
      return emptyGeo();
    }

    let network = 'Broadband';
    if (data.mobile) network = 'Mobile';
    else if (data.hosting) network = 'Hosting/Data Center';
    else if (data.proxy) network = 'Proxy/VPN';

    return {
      country: data.country ?? 'Unknown',
      region: data.regionName ?? 'Unknown',
      city: data.city ?? 'Unknown',
      isp: data.isp ?? 'Unknown',
      network
    };
  } catch {
    return emptyGeo();
  }
}

/* =========================
   ROUTES
   HTTP API endpoints
========================= */

/* =========================
   HEALTH CHECK ENDPOINT
   Used for uptime probes
========================= */
app.get('/', (_, res) => res.send('ok'));

/* =========================
   VIEW TRACKING ENDPOINT
   Persists view metadata
   per visit/session
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
   VIEW COUNT ENDPOINT
   Returns total number
   of tracked views
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
   SERVER STARTUP
   Boots HTTP server
========================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});