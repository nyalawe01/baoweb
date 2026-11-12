import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const helmetFn: any = (helmet as any)?.default || helmet;
const rateLimitFn: any = (rateLimit as any)?.default || rateLimit;
const compressionFn: any = (compression as any)?.default || compression;
const corsFn: any = (cors as any)?.default || cors;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import nodemailer from 'nodemailer';
import {
  contactSubmissionSchema,
  volunteerSubmissionSchema,
} from '@bao/shared';
import { LocalCpanelStorageProvider } from '@bao/shared/storage';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config();

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://jkpopfcqkrpmtxcamqdx.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcG9wZmNxa3JwbXR4Y2FtcWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxMjY3NTUsImV4cCI6MjEwOTcwMjc1NX0.eNAASSE3NKBUdYcJdZ1bYczzY_v3JxuPAomSB4B0Sjs';

const candidateRoots = [
  path.resolve(process.cwd(), 'dist/media'),
  path.resolve(__dirname, 'media'),
  path.resolve(__dirname, '../dist/media'),
  path.resolve(process.cwd(), '../../bao-cms-storage'),
  path.resolve(__dirname, '../../../bao-cms-storage'),
  path.resolve(__dirname, '../../bao-cms-storage'),
  path.resolve(process.cwd(), 'bao-cms-storage'),
];
const STORAGE_ROOT =
  candidateRoots.find((dir) => {
    try {
      return fs.existsSync(path.join(dir, 'public'));
    } catch {
      return false;
    }
  }) || (process.env.VERCEL ? path.join(os.tmpdir(), 'bao-cms-storage') : path.resolve(process.cwd(), '../../bao-cms-storage'));

const storageProvider = new LocalCpanelStorageProvider(STORAGE_ROOT);
storageProvider.ensureDirectories().catch((err) => {
  console.error('[bao-website] Failed to initialize storage directories:', err);
});

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const app = express();

app.use(
  (helmetFn as any)({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);
app.use((compressionFn as any)());
app.use((corsFn as any)());
app.use(express.json({ limit: '1mb' }));

// Serve public media files from cPanel storage outside public_html
app.get('/media/public/*', async (req: Request, res: Response) => {
  try {
    const relativePath = req.params[0] || '';
    const storageKey = `public/${relativePath}`;
    let resolved = await storageProvider.getReadablePath(storageKey);
    if (!resolved) {
      for (const root of candidateRoots) {
        const candidateFile = path.resolve(root, storageKey);
        if (fs.existsSync(candidateFile)) {
          resolved = candidateFile;
          break;
        }
      }
    }
    if (!resolved) {
      // If media file is not present on local filesystem (e.g. Vercel serverless), fetch via bound CMS service
      if (process.env.CMS_URL) {
        try {
          const remoteUrl = new URL(`/media/public/${relativePath}`, process.env.CMS_URL);
          const remoteRes = await fetch(remoteUrl);
          if (remoteRes.ok) {
            const contentType = remoteRes.headers.get('content-type') || 'application/octet-stream';
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            const arrayBuffer = await remoteRes.arrayBuffer();
            res.send(Buffer.from(arrayBuffer));
            return;
          }
        } catch (fetchErr) {
          console.warn('[bao-website] Failed to fetch media from bound CMS service:', fetchErr);
        }
      }

      res.status(404).json({ error: 'Media file not found' });
      return;
    }
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.sendFile(resolved);
  } catch {
    res.status(400).json({ error: 'Invalid media path' });
  }
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'bao-website',
    timestamp: new Date().toISOString(),
  });
});

const BAO_YOUTUBE_CHANNEL_ID = 'UCNMoBpb_dcEuXOUMfW2q62Q';
const BAO_YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@babawatotoorganization';

const FALLBACK_YOUTUBE_VIDEOS = [
  {
    id: 'pdx8DWYJM_o',
    title: 'BABAWATOTO ORGANIZATION CIRCUS PERFORMANCE!!!!',
    published: '2025-12-15T11:13:19+00:00',
    subtitle: 'Babawatoto Organization (@babawatotoorganization)',
  },
  {
    id: 'FgXXMyMLF9k',
    title: 'BABAWATOTO ORGANIZATION THEATER ARTS PERFORMANCE LIVE',
    published: '2025-12-15T11:10:30+00:00',
    subtitle: 'Babawatoto Organization (@babawatotoorganization)',
  },
  {
    id: 'R09iiZAHiFs',
    title: 'BABAWATOTO ORGANIZATION LIVE PERFORMANCE',
    published: '2025-12-15T11:08:28+00:00',
    subtitle: 'Babawatoto Organization (@babawatotoorganization)',
  },
];

let cachedYoutubeVideos = FALLBACK_YOUTUBE_VIDEOS;
let lastYoutubeFetchMs = 0;

async function fetchBaoYoutubeVideos() {
  const now = Date.now();
  if (now - lastYoutubeFetchMs < 15 * 60 * 1000 && cachedYoutubeVideos.length > 0) {
    return cachedYoutubeVideos;
  }
  try {
    const feedRes = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${BAO_YOUTUBE_CHANNEL_ID}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (feedRes.ok) {
      const xml = await feedRes.text();
      const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => {
        const block = m[1];
        const id = block.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] || '';
        const title = block.match(/<title>(.*?)<\/title>/)?.[1] || '';
        const published = block.match(/<published>(.*?)<\/published>/)?.[1] || '';
        return {
          id,
          title,
          published,
          subtitle: 'Babawatoto Organization (@babawatotoorganization)',
        };
      }).filter((v) => v.id);

      if (entries.length > 0) {
        cachedYoutubeVideos = entries;
        lastYoutubeFetchMs = now;
      }
    }
  } catch {
    // Keep cached or fallback videos
  }
  return cachedYoutubeVideos;
}

app.get('/api/public/youtube-videos', async (_req: Request, res: Response) => {
  const videos = await fetchBaoYoutubeVideos();
  res.json({
    channelId: BAO_YOUTUBE_CHANNEL_ID,
    channelUrl: BAO_YOUTUBE_CHANNEL_URL,
    videos,
  });
});

let cachedSiteData: any = null;
let lastSiteDataFetchTime = 0;
const SITE_DATA_CACHE_TTL = 30 * 1000; // 30-second TTL

export async function getPublicSiteData(force = false) {
  const now = Date.now();
  if (!force && cachedSiteData && now - lastSiteDataFetchTime < SITE_DATA_CACHE_TTL) {
    return cachedSiteData;
  }

  const [
    settingsRes,
    menusRes,
    pagesRes,
    progRes,
    projRes,
    storiesRes,
    newsRes,
    partnersRes,
    teamRes,
    pubsRes,
    indRes,
    mediaRes,
    youtubeVideos,
  ] = await Promise.all([
    supabase.from('site_settings').select('*'),
    supabase.from('menus').select('*, menu_items(*)'),
    supabase.from('pages').select('*, page_translations(*)').neq('status', 'archived'),
    supabase
      .from('programmes')
      .select('*, programme_translations(*)')
      .neq('status', 'archived')
      .order('display_order'),
    supabase
      .from('projects')
      .select('*, project_translations(*)')
      .neq('status', 'archived')
      .order('is_featured', { ascending: false })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false }),
    supabase
      .from('stories')
      .select('*, story_translations(*)')
      .neq('status', 'archived')
      .order('published_at', { ascending: false }),
    supabase
      .from('articles')
      .select('*, article_translations(*)')
      .eq('content_type', 'news')
      .neq('status', 'archived')
      .order('published_at', { ascending: false }),
    supabase
      .from('partners')
      .select('*')
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('team_members')
      .select('*')
      .neq('status', 'archived')
      .order('display_order'),
    supabase
      .from('resources')
      .select('*')
      .neq('status', 'archived')
      .order('publication_year', { ascending: false }),
    supabase
      .from('impact_indicators')
      .select('*, impact_records(*)')
      .neq('status', 'archived')
      .order('display_order'),
    supabase.from('media_assets').select('*').eq('visibility', 'public'),
    fetchBaoYoutubeVideos(),
  ]);

  const settingsMap: Record<string, any> = {};
  for (const s of settingsRes.data || []) {
    const k = s.key || s.setting_key;
    const v = s.value ?? s.setting_value;
    if (k) settingsMap[k] = v;
  }

  cachedSiteData = {
    settings: settingsMap,
    menus: menusRes.data || [],
    pages: pagesRes.data || [],
    programmes: progRes.data || [],
    projects: projRes.data || [],
    stories: storiesRes.data || [],
    news: newsRes.data || [],
    events: [],
    partners: partnersRes.data || [],
    team: teamRes.data || [],
    publications: pubsRes.data || [],
    indicators: indRes.data || [],
    media: mediaRes.data || [],
    youtubeVideos,
  };
  lastSiteDataFetchTime = now;
  return cachedSiteData;
}

// Agentic Resource Discovery & LLM endpoints
app.get('/.well-known/ard.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.json({
    name: 'Babawatoto Organization',
    description: 'Babawatoto Centre for Children and Youth Trust (BAO) empowers street-connected children, youth, and families across Tanzania.',
    url: 'https://babawatoto.or.tz',
    documentation: 'https://babawatoto.or.tz/llms.txt',
    version: '1.0.0',
    entries: [
      {
        id: 'llms-txt',
        name: 'Babawatoto AI Context',
        description: 'Comprehensive structured markdown context of Babawatoto Organization initiatives, governance, and contact information.',
        type: 'documentation',
        uri: 'https://babawatoto.or.tz/llms.txt',
        format: 'text/markdown',
      },
      {
        id: 'site-data-api',
        name: 'Public Site Data API',
        description: 'JSON API endpoint serving published programmes, project indicators, team members, and official contact channels.',
        type: 'api',
        uri: 'https://babawatoto.or.tz/api/public/site-data',
        format: 'application/json',
      },
    ],
  });
});

app.get('/llms.txt', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const candidateLlms = [
    path.resolve(process.cwd(), 'public/llms.txt'),
    path.resolve(__dirname, '../public/llms.txt'),
    path.resolve(__dirname, 'public/llms.txt'),
    path.resolve(__dirname, '../../apps/bao-website/public/llms.txt'),
  ];
  const found = candidateLlms.find((f) => fs.existsSync(f));
  if (found) {
    res.sendFile(found);
  } else {
    res.send('# Babawatoto Organization (BAO)\n\n> Babawatoto Centre for Children and Youth Trust (BAO) is a registered non-governmental organization in Tanzania dedicated to protecting vulnerable street-connected children, restoring families, and empowering youth through education, creative arts therapy, and vocational livelihoods.\n\n## Core Initiatives\n- [Child Protection & Street Outreach](https://babawatoto.or.tz/programmes/child-protection)\n- [MEMKWA Catch-Up Education](https://babawatoto.or.tz/programmes/memkwa-education)\n- [HEART & Creative Arts](https://babawatoto.or.tz/programmes/heart-arts)\n- [Vocational Training & Livelihoods](https://babawatoto.or.tz/programmes/vocational-skills)\n');
  }
});

// Public site data endpoint (only published / active records enforced by RLS & query filters)
app.get('/api/public/site-data', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  try {
    const force = Boolean(req.query._t);
    const data = await getPublicSiteData(force);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load public site data' });
  }
});

// Rate limiter for public forms
const formLimiter = (rateLimitFn as any)({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions from this IP, please try again later.' },
});

// Email dispatch for contact inquiries to info@babawatoto.or.tz
async function sendContactNotificationEmail(data: {
  fullName: string;
  email: string;
  phone?: string | null;
  subject?: string;
  message: string;
  organization?: string;
}) {
  const recipient = process.env.CONTACT_NOTIFICATION_EMAIL || 'info@babawatoto.or.tz';
  const mailSubject = `[Website Inquiry] ${data.subject || 'Message from ' + data.fullName}`;

  const textBody = `
New inquiry submitted via Babawatoto Organization website:

From: ${data.fullName}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Organization: ${data.organization || 'Not provided'}
Subject: ${data.subject || 'General Inquiry'}

Message:
${data.message}

---
Babawatoto Centre for Children & Youth Trust (BAO)
Email: info@babawatoto.or.tz
Website: https://babawatoto.or.tz
Received at: ${new Date().toISOString()}
  `.trim();

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #E6A500; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #E6A500; color: #000; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 22px; font-weight: 800;">Babawatoto Organization (BAO)</h2>
        <p style="margin: 5px 0 0 0; font-size: 13px; font-weight: bold; text-transform: uppercase;">New Website Contact Inquiry</p>
      </div>
      <div style="padding: 24px; background-color: #fff; color: #111;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 130px; color: #555;">Sender Name:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #000;">${data.fullName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555;">Email Address:</td>
            <td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #000; font-weight: bold;">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555;">Phone:</td>
            <td style="padding: 8px 0; color: #000;">${data.phone || 'Not provided'}</td>
          </tr>
          ${data.organization ? `
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555;">Organization:</td>
            <td style="padding: 8px 0; color: #000;">${data.organization}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555;">Subject:</td>
            <td style="padding: 8px 0; color: #000;">${data.subject || 'General Inquiry'}</td>
          </tr>
        </table>
        <div style="background-color: #fafafa; border-left: 4px solid #E6A500; padding: 16px; border-radius: 4px;">
          <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #333;">Message Content:</h4>
          <p style="margin: 0; line-height: 1.6; white-space: pre-wrap; font-size: 14px;">${data.message}</p>
        </div>
      </div>
      <div style="background-color: #000; color: #fff; padding: 12px; text-align: center; font-size: 11px;">
        Babawatoto Centre for Children and Youth Trust · Dar es Salaam, Tanzania · info@babawatoto.or.tz
      </div>
    </div>
  `;

  const smtpHost = process.env.SMTP_HOST || process.env.MAIL_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 587);
  const smtpUser = process.env.SMTP_USER || process.env.MAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.MAIL_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });
      await transporter.sendMail({
        from: `"${data.fullName} via BAO Website" <${smtpUser}>`,
        to: recipient,
        replyTo: data.email,
        subject: mailSubject,
        text: textBody,
        html: htmlBody,
      });
      console.log(`[Email] Successfully delivered inquiry to ${recipient}`);
    } catch (mailErr) {
      console.error('[Email] Failed to dispatch email via SMTP:', mailErr);
    }
  } else {
    console.log(`[Email] Notification prepared for ${recipient}:`, mailSubject);
  }
}

// Contact form submission
app.post('/api/public/contact', formLimiter, async (req: Request, res: Response) => {
  const parsed = contactSubmissionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten(),
    });
    return;
  }

  const { error } = await supabase.from('contact_messages').insert({
    sender_name: parsed.data.full_name,
    sender_email: parsed.data.email,
    sender_phone: parsed.data.phone || null,
    subject: parsed.data.subject,
    message: parsed.data.organization
      ? `[Organization: ${parsed.data.organization}]\n\n${parsed.data.message}`
      : parsed.data.message,
    status: 'unread',
  });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  // Asynchronously dispatch email notification to info@babawatoto.or.tz
  sendContactNotificationEmail({
    fullName: parsed.data.full_name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    subject: parsed.data.subject,
    message: parsed.data.message,
    organization: parsed.data.organization,
  }).catch((err) => console.error('[bao-website] Email background error:', err));

  res.status(201).json({ success: true, message: 'Inquiry received by Babawatoto Organization.' });
});

// Volunteer / Partnership application submission
app.post('/api/public/volunteer', formLimiter, async (req: Request, res: Response) => {
  const parsed = volunteerSubmissionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten(),
    });
    return;
  }

  const combinedMotivation = [
    parsed.data.motivation,
    parsed.data.country_city ? `Location: ${parsed.data.country_city}` : null,
    parsed.data.skills_summary ? `Skills: ${parsed.data.skills_summary}` : null,
    parsed.data.availability ? `Availability: ${parsed.data.availability}` : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const { error } = await supabase.from('volunteer_applications').insert({
    full_name: parsed.data.full_name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    area_of_interest: parsed.data.area_of_interest,
    motivation: combinedMotivation,
    status: 'submitted',
  });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json({
    success: true,
    message: 'Volunteer application submitted to Babawatoto Organization.',
  });
});

// Dynamic robots.txt
app.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain').send(
    `User-agent: *\nAllow: /\nSitemap: https://babawatoto.or.tz/sitemap.xml\n`
  );
});

// Dynamic sitemap.xml
app.get('/sitemap.xml', async (_req: Request, res: Response) => {
  const baseUrl = 'https://babawatoto.or.tz';
  const staticPaths = [
    '/',
    '/about',
    '/about/who-we-are',
    '/about/mission-and-vision',
    '/about/our-history',
    '/about/leadership-and-governance',
    '/about/our-team',
    '/programmes',
    '/projects',
    '/impact',
    '/stories',
    '/news',
    '/resources',
    '/get-involved',
    '/contact',
  ];

  const { data: progs } = await supabase
    .from('programme_translations')
    .select('slug')
    .eq('language', 'en');
  const { data: projs } = await supabase
    .from('project_translations')
    .select('slug')
    .eq('language', 'en');

  const urls = [
    ...staticPaths.map((p) => `${baseUrl}${p}`),
    ...(progs || []).map((p: any) => `${baseUrl}/programmes/${p.slug}`),
    ...(projs || []).map((p: any) => `${baseUrl}/projects/${p.slug}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><changefreq>weekly</changefreq></url>`).join('\n')}
</urlset>`;

  res.type('application/xml').send(xml);
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  const port = Number(process.env.PORT || 3000);

  const ngoJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: 'Babawatoto Organization (BAO)',
    alternateName: 'Babawatoto Centre for Children and Youth Trust',
    url: 'https://babawatoto.or.tz',
    logo: 'https://babawatoto.or.tz/logo.png',
    foundingDate: '2007',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Mburahati Barafu, Temeke / Kinondoni',
      addressLocality: 'Dar es Salaam',
      postalCode: 'P.O. Box 70107',
      addressCountry: 'TZ',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+255-784-712095',
      email: 'info@babawatoto.or.tz',
      contactType: 'customer support',
    },
  });

  if (!isProd) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'custom',
      });
      app.use(vite.middlewares);
      app.use('*', async (req, res) => {
        try {
          const url = req.originalUrl;
          let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          template = template.replace(
            '<!--SEO_HEAD-->',
            `<link rel="canonical" href="https://babawatoto.or.tz${url}" /><script type="application/ld+json">${ngoJsonLd}</script>`
          );
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } catch (e: any) {
          res.status(500).end(e.message);
        }
      });
    } catch (viteErr) {
      console.warn('[bao-website] Vite dev middleware unavailable, serving static/API mode:', viteErr);
    }
  } else {
    const candidateClientDists = [
      path.resolve(__dirname, 'client'), // when running from dist/server.js, __dirname is dist -> dist/client
      path.resolve(__dirname),           // when running from dist/server.js, __dirname is dist
      path.resolve(__dirname, 'dist/client'), // when running from apps/bao-website/server.ts
      path.resolve(__dirname, 'dist'),        // when running from apps/bao-website/server.ts
      path.resolve(process.cwd(), 'dist/client'),
      path.resolve(process.cwd(), 'dist'),
      path.resolve(process.cwd(), 'apps/bao-website/dist/client'),
      path.resolve(process.cwd(), 'apps/bao-website/dist'),
      path.resolve(__dirname, '../dist/client'),
      path.resolve(__dirname, '../dist'),
    ];

    // Mount all valid static asset directories
    for (const dir of candidateClientDists) {
      if (fs.existsSync(dir)) {
        app.use(
          express.static(dir, {
            index: false,
            maxAge: '365d',
            immutable: true,
            setHeaders: (res, filePath) => {
              if (filePath.endsWith('.html')) {
                res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
              }
            },
          })
        );
      }
    }

    // Locate the compiled production index.html (ensure it is NOT the uncompiled dev source HTML)
    let indexFile = '';
    for (const dir of candidateClientDists) {
      const cand = path.join(dir, 'index.html');
      if (fs.existsSync(cand)) {
        const content = fs.readFileSync(cand, 'utf-8');
        // A built index.html references /assets/ and does not contain raw /src/client/main.tsx
        if (content.includes('/assets/') || !content.includes('/src/client/main.tsx')) {
          indexFile = cand;
          break;
        }
      }
    }
    // Fallback if no build marker found
    if (!indexFile) {
      for (const dir of candidateClientDists) {
        const cand = path.join(dir, 'index.html');
        if (fs.existsSync(cand)) {
          indexFile = cand;
          break;
        }
      }
    }

    app.get('*', async (req: Request, res: Response) => {
      if (indexFile && fs.existsSync(indexFile)) {
        let html = fs.readFileSync(indexFile, 'utf-8');
        let initialDataScript = '';
        try {
          const siteData = await getPublicSiteData();
          if (siteData) {
            const safeJson = JSON.stringify(siteData).replace(/<\/script/gi, '<\\/script');
            initialDataScript = `<script id="__BAO_DATA__">window.__INITIAL_DATA__ = ${safeJson};</script>`;
          }
        } catch (e) {
          console.warn('[bao-website] Failed to pre-inject initial site data:', e);
        }

        html = html.replace(
          '<!--SEO_HEAD-->',
          `<link rel="canonical" href="https://babawatoto.or.tz${req.originalUrl}" /><script type="application/ld+json">${ngoJsonLd}</script>${initialDataScript}`
        );
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        res.send(html);
      } else {
        res.status(200).send('Babawatoto Organization Public Website API is running.');
      }
    });

    app.use((err: any, _req: Request, res: Response, _next: any) => {
      console.error('[bao-website] Unhandled server error:', err);
      res.status(500).json({ error: err?.message || 'Internal Server Error' });
    });
  }

  if (process.env.VITEST !== 'true' && !process.env.VERCEL) {
    app.listen(port, () => {
      console.log(`[bao-website] Server listening on http://localhost:${port}`);
    });
  }
}

startServer().catch((err) => {
  console.error('[bao-website] Failed to initialize server:', err);
});

export default app;

