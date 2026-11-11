import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
  }) || path.resolve(process.cwd(), '../../bao-cms-storage');

const storageProvider = new LocalCpanelStorageProvider(STORAGE_ROOT);
storageProvider.ensureDirectories().catch((err) => {
  console.error('[bao-website] Failed to initialize storage directories:', err);
});

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);
app.use(compression());
app.use(cors());
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
      res.status(404).json({ error: 'Media file not found' });
      return;
    }
    res.setHeader('Cache-Control', 'public, max-age=86400');
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

// Public site data endpoint (only published / active records enforced by RLS & query filters)
app.get('/api/public/site-data', async (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  try {
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

    res.json({
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
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load public site data' });
  }
});

// Rate limiter for public forms
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions from this IP, please try again later.' },
});

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
  const isProd = process.env.NODE_ENV === 'production';
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
  } else {
    const clientDist = path.resolve(process.cwd(), 'dist/client');
    app.use(express.static(clientDist, { index: false }));
    app.get('*', (req: Request, res: Response) => {
      const indexFile = path.join(clientDist, 'index.html');
      if (fs.existsSync(indexFile)) {
        let html = fs.readFileSync(indexFile, 'utf-8');
        html = html.replace(
          '<!--SEO_HEAD-->',
          `<link rel="canonical" href="https://babawatoto.or.tz${req.originalUrl}" /><script type="application/ld+json">${ngoJsonLd}</script>`
        );
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
      } else {
        res.status(200).send('Babawatoto Organization Public Website API is running.');
      }
    });
  }

  if (process.env.VITEST !== 'true') {
    app.listen(port, () => {
      console.log(`[bao-website] Server listening on http://localhost:${port}`);
    });
  }
}

startServer();

