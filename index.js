'use strict';

/* =========================
   IMPORTS AND APP SETUP
========================= */
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import axios from 'axios';
import { UAParser } from 'ua-parser-js';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import ContactFormEmail from './emails/ContactFormEmail.js';
import AutoReplyEmail from './emails/AutoReplyEmail.js';

const { Pool } = pg;
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
  RESEND_API_KEY,
  RECIPIENT_EMAIL,
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
   EMAIL CONFIGURATION
   Resend API client
========================= */
const resend = new Resend(RESEND_API_KEY);

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

// =========================
//    CLIENT IP RESOLVER
//    Determines real client
//    IP behind proxies/CDNs
// ========================= */
// function getClientIp(req) {
//   return (
//     req.headers['cf-connecting-ip'] ||
//     req.headers['true-client-ip'] ||
//     req.headers['x-real-ip'] ||
//     (req.headers['x-forwarded-for'] || '').split(',')[0] ||
//     req.socket.remoteAddress ||
//     'Unknown'
//   );
// }

/* =========================
   CLIENT IP RESOLVER
   Determines real client
   IP behind proxies/CDNs
   Priority: Custom header > Cloudflare > Standard headers
========================= */
function getClientIp(req) {
  // 1. Custom header from our Vercel proxy (highest priority)
  const realClientIp = req.headers['x-real-client-ip'];
  if (realClientIp && realClientIp !== 'Unknown') {
    console.log('IP from x-real-client-ip:', realClientIp);
    return realClientIp.trim();
  }

  // 2. Cloudflare headers (if using Cloudflare)
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp) {
    console.log('IP from cf-connecting-ip:', cfIp);
    return cfIp.trim();
  }

  const trueClientIp = req.headers['true-client-ip'];
  if (trueClientIp) {
    console.log('IP from true-client-ip:', trueClientIp);
    return trueClientIp.trim();
  }

  // 3. X-Real-IP (set by some proxies)
  const xRealIp = req.headers['x-real-ip'];
  if (xRealIp) {
    console.log('IP from x-real-ip:', xRealIp);
    return xRealIp.trim();
  }

  // 4. X-Forwarded-For (first IP in the chain is usually the client)
  const xff = req.headers['x-forwarded-for'];
  if (xff) {
    const ips = xff.split(',').map(ip => ip.trim());
    // Filter out private/internal IPs and known CDN ranges
    for (const ip of ips) {
      if (!isPrivateOrCdnIp(ip)) {
        console.log('IP from x-forwarded-for:', ip);
        return ip;
      }
    }
    // If all IPs are proxies, return the first one
    console.log('IP from x-forwarded-for (first):', ips[0]);
    return ips[0];
  }

  // 5. Direct connection (fallback)
  const socketIp = req.socket?.remoteAddress || 'Unknown';
  console.log('IP from socket:', socketIp);
  return socketIp;
}

/* =========================
   IP FILTER
   Identifies private and CDN IPs
========================= */
function isPrivateOrCdnIp(ip) {
  if (!ip) return true;
  
  // Private IP ranges
  if (ip.startsWith('10.') || 
      ip.startsWith('192.168.') ||
      ip.startsWith('172.16.') || ip.startsWith('172.17.') ||
      ip.startsWith('172.18.') || ip.startsWith('172.19.') ||
      ip.startsWith('172.2') || ip.startsWith('172.30.') || 
      ip.startsWith('172.31.') ||
      ip === '127.0.0.1' || ip === '::1') {
    return true;
  }
  
  // Known CDN/Cloud IP ranges (partial - Akamai, Vercel, etc.)
  // Akamai ranges (approximate)
  if (ip.startsWith('23.') || ip.startsWith('104.') || 
      ip.startsWith('184.') || ip.startsWith('2.16.') ||
      ip.startsWith('2.17.') || ip.startsWith('2.18.') ||
      ip.startsWith('2.19.') || ip.startsWith('2.20.') ||
      ip.startsWith('2.21.') || ip.startsWith('2.22.') ||
      ip.startsWith('2.23.')) {
    return true;
  }
  
  // Vercel/AWS ranges (partial)
  if (ip.startsWith('76.76.21.') || ip.startsWith('64.') ||
      ip.startsWith('216.198.')) {
    return true;
  }
  
  return false;
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
   CONTACT FORM EMAIL
========================= */
async function sendContactFormEmail(name, email, subject, message) {
  await resend.emails.send({
    from: 'Rahul Singh\'s Portfolio <support@rahulsingh.ai>',
    to: RECIPIENT_EMAIL,
    replyTo: email,
    subject: `Let's Connect: ${subject}`,
    react: ContactFormEmail({
      name,
      email,
      subject,
      message,
      year: new Date().getFullYear(),
    })
  });
}

/* =========================
   AUTO-REPLY EMAIL
========================= */
async function sendAutoReplyEmail(recipientEmail, recipientName) {
  await resend.emails.send({
    from: 'Rahul Singh\'s Portfolio <no-reply@rahulsingh.ai>',
    to: recipientEmail,
    replyTo: RECIPIENT_EMAIL,
    subject: 'Thank you for your message - Rahul Singh',
    react: AutoReplyEmail({ recipientName })
  });
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
   CONTACT FORM ENDPOINT
   Handles form submissions
   and sends email notifications
========================= */
app.post('/api/contact', async (req, res) => {
  console.log('POST /api/contact HIT', new Date().toISOString());

  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required'
      });
    }

    // Send notification email to owner
    await sendContactFormEmail(name, email, subject, message);
    console.log(`Contact form email sent from ${name} <${email}>`);

    // Send auto-reply to sender (don't fail if this fails)
    try {
      console.log('Sending Email To::', email);

      await sendAutoReplyEmail(email, name);
      console.log(`Auto-reply sent to ${email}`);
    } catch (autoReplyErr) {
      console.error('Auto-reply failed:', autoReplyErr.message);
    }

    res.json({
      status: 'success',
      message: 'Thank you for your message! I\'ll get back to you soon.'
    });

  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send message. Please try again or contact me directly.'
    });
  }
});

/* =========================
   SERVER STARTUP
   Boots HTTP server
========================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});