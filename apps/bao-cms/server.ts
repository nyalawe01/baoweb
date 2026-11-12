import 'dotenv/config';
import os from 'node:os';
import path from 'node:path';
import fs, { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import multer from 'multer';

const helmetFn: any = (helmet as any)?.default || helmet;
const rateLimitFn: any = (rateLimit as any)?.default || rateLimit;
const corsFn: any = (cors as any)?.default || cors;
const multerFn: any = (multer as any)?.default || multer;
import DOMPurify from 'isomorphic-dompurify';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  StoryUpsertSchema,
  VERIFIED_BAO_MEDIA_ASSETS,
  VERIFIED_BAO_PROGRAMMES,
  VERIFIED_BAO_PROJECTS,
  VERIFIED_BAO_PARTNERS,
  VERIFIED_BAO_TEAM,
  VERIFIED_BAO_IMPACT_INDICATORS,
  type MediaCategory,
  type PermissionCode,
} from '@bao/shared';
import { LocalCpanelStorageProvider } from '@bao/shared/storage';

// =============================================================================
// ENVIRONMENT & CLIENTS
// =============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jkpopfcqkrpmtxcamqdx.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcG9wZmNxa3JwbXR4Y2FtcWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxMjY3NTUsImV4cCI6MjEwOTcwMjc1NX0.eNAASSE3NKBUdYcJdZ1bYczzY_v3JxuPAomSB4B0Sjs';

const defaultStorage = process.env.VERCEL
  ? path.join(os.tmpdir(), 'bao-cms-storage')
  : path.resolve(process.cwd(), '../../bao-cms-storage');
const STORAGE_ROOT_PATH = process.env.STORAGE_ROOT_PATH || defaultStorage;
const fallbackRootStorage = existsSync(STORAGE_ROOT_PATH)
  ? STORAGE_ROOT_PATH
  : (process.env.VERCEL ? path.join(os.tmpdir(), 'bao-cms-storage') : path.resolve(process.cwd(), 'bao-cms-storage'));

export const storageProvider = new LocalCpanelStorageProvider(fallbackRootStorage);

export interface StaffContext {
  id: string;
  email: string;
  full_name: string;
  job_title: string | null;
  avatar_url: string | null;
  is_active: boolean;
  roles: string[];
  permissions: PermissionCode[];
}

export interface AuthenticatedRequest extends Request {
  staff?: StaffContext;
  supabase?: SupabaseClient;
}

export function createUserSupabaseClient(accessToken?: string): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html || '', {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h2', 'h3', 'h4',
      'ul', 'ol', 'li', 'blockquote', 'a', 'span',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
}

// =============================================================================
// AUTHENTICATION & RBAC MIDDLEWARE
// =============================================================================

export async function requireStaffAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. Please log in to the BAO CMS.' });
      return;
    }

    const token = authHeader.slice('Bearer '.length).trim();
    const supabase = createUserSupabaseClient(token);
    const { data: staffCtx, error } = await supabase.rpc('get_current_staff_context');

    if (error || !staffCtx || !staffCtx.is_active) {
      res.status(403).json({
        error: 'Unauthorized or inactive staff account.',
      });
      return;
    }

    req.staff = staffCtx as StaffContext;
    req.supabase = supabase;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid authentication session.' });
  }
}

export function requirePermission(permission: PermissionCode) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const staff = req.staff;
    if (!staff) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const isAllowed =
      staff.roles.includes('super_admin') || staff.permissions.includes(permission);
    if (!isAllowed) {
      res.status(403).json({
        error: `Access denied: Your role does not have the required '${permission}' permission.`,
      });
      return;
    }
    next();
  };
}

async function logActivity(
  req: AuthenticatedRequest,
  action: string,
  entityType: string,
  entityId?: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  if (!req.supabase || !req.staff) return;
  try {
    await req.supabase.from('activity_logs').insert({
      actor_id: req.staff.id,
      actor_email: req.staff.email,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      metadata,
      ip_address: req.ip || req.socket.remoteAddress || null,
      user_agent: req.headers['user-agent'] || null,
    });
  } catch {
    // Non-blocking audit log write
  }
}

// =============================================================================
// EXPRESS APPLICATION FACTORY
// =============================================================================

export function createCmsApp() {
  const app = express();

  app.use(
    (helmetFn as any)({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use((corsFn as any)());
  app.use(express.json({ limit: '5mb' }));

  const apiLimiter = (rateLimitFn as any)({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', apiLimiter);

  const upload = (multerFn as any)({
    storage: (multerFn as any).memoryStorage ? (multerFn as any).memoryStorage() : multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 },
  });

  // ---------------------------------------------------------------------------
  // 1. PUBLIC MEDIA STREAMING (Public images & documents from bao-cms-storage)
  // ---------------------------------------------------------------------------
  app.get('/media/public/*', (req: Request, res: Response) => {
    try {
      const relKey = req.params[0] ? `public/${req.params[0]}` : '';
      if (!relKey || relKey.includes('..')) {
        res.status(400).json({ error: 'Invalid media path.' });
        return;
      }
      const absPath = storageProvider.getAbsolutePath(relKey);
      if (!existsSync(absPath)) {
        res.status(404).json({ error: 'Media asset not found.' });
        return;
      }
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.sendFile(absPath);
    } catch {
      res.status(404).json({ error: 'Media asset not found.' });
    }
  });

  // ---------------------------------------------------------------------------
  // 2. HEALTH & BOOTSTRAP STATUS
  // ---------------------------------------------------------------------------
  app.get('/api/v1/health', async (_req: Request, res: Response) => {
    const supabase = createUserSupabaseClient();
    const { data: hasStaff } = await supabase.rpc('has_any_staff_users');
    res.json({
      status: 'ok',
      service: 'bao-cms',
      has_staff_users: Boolean(hasStaff),
      timestamp: new Date().toISOString(),
    });
  });

  // ---------------------------------------------------------------------------
  // 3. CURRENT STAFF CONTEXT & DASHBOARD OVERVIEW
  // ---------------------------------------------------------------------------
  app.get('/api/v1/me', requireStaffAuth, async (req: AuthenticatedRequest, res: Response) => {
    res.json({ staff: req.staff });
  });

  app.get('/api/v1/config', (req: Request, res: Response) => {
    const origin = req.get('host') ? `${req.protocol}://${req.get('host')}` : 'http://localhost:3000';
    res.json({
      websiteUrl: process.env.WEBSITE_URL || origin,
    });
  });

  app.get(
    '/api/v1/dashboard',
    requireStaffAuth,
    requirePermission('dashboard.view'),
    async (req: AuthenticatedRequest, res: Response) => {
      const { data: stats, error } = await req.supabase!.rpc('get_cms_dashboard_stats');
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      const { data: recentLogs } = await req
        .supabase!.from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);

      const storageStats = await storageProvider.getUsageSummary();

      res.json({
        stats,
        storage: storageStats,
        recent_activity: recentLogs || [],
      });
    }
  );

  // ---------------------------------------------------------------------------
  // 4. MEDIA LIBRARY & SECURE CPANEL STORAGE UPLOAD / REPLACE / DELETE
  // ---------------------------------------------------------------------------
  app.get('/api/v1/media', requireStaffAuth, async (req: AuthenticatedRequest, res: Response) => {
    const category = req.query.category as string | undefined;
    let query = req.supabase!.from('media_assets').select('*').order('created_at', { ascending: false });
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ media: data || [] });
  });

  app.post(
    '/api/v1/media/upload',
    requireStaffAuth,
    requirePermission('media.upload'),
    upload.single('file'),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        if (!req.file) {
          res.status(400).json({ error: 'No file provided in upload request.' });
          return;
        }
        const category = ((req.body.category as string) || 'organization') as MediaCategory;
        const visibility = req.body.visibility === 'private' ? 'private' : 'public';

        const stored = await storageProvider.saveFile({
          originalFilename: req.file.originalname,
          buffer: req.file.buffer,
          declaredMimeType: req.file.mimetype,
          category,
          visibility,
        });

        const { data: mediaRecord, error } = await req
          .supabase!.from('media_assets')
          .insert({
            original_filename: req.file.originalname,
            generated_filename: stored.generatedFilename,
            file_extension: stored.fileExtension,
            mime_type: stored.verifiedMimeType,
            file_size_bytes: stored.fileSizeBytes,
            storage_provider: stored.storageProvider,
            storage_key: stored.storageKey,
            public_url: stored.publicUrl,
            media_type: stored.mediaType,
            category,
            visibility,
            title_en: req.body.title_en || req.body.title || req.file.originalname,
            title_sw: req.body.title_sw || req.body.title || req.file.originalname,
            alt_text_en: req.body.alt_text_en || req.body.alt_text || req.file.originalname,
            alt_text_sw: req.body.alt_text_sw || req.body.alt_text || req.file.originalname,
            caption_en: req.body.caption_en || req.body.caption || null,
            caption_sw: req.body.caption_sw || req.body.caption || null,
            safeguarding_cleared: req.body.safeguarding_cleared === 'true',
            uploaded_by: req.staff!.id,
          })
          .select()
          .single();

        if (error) {
          await storageProvider.deleteFile(stored.storageKey);
          res.status(500).json({ error: error.message });
          return;
        }

        await logActivity(req, 'upload_media', 'media_assets', mediaRecord.id, {
          filename: req.file.originalname,
          category,
          visibility,
          size: stored.fileSizeBytes,
        });

        res.status(201).json({ media: mediaRecord });
      } catch (err: any) {
        res.status(400).json({ error: err?.message || 'Upload validation failed.' });
      }
    }
  );

  app.put(
    '/api/v1/media/:id/replace',
    requireStaffAuth,
    requirePermission('media.replace'),
    upload.single('file'),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        if (!req.file) {
          res.status(400).json({ error: 'Replacement file is required.' });
          return;
        }
        const { data: existing, error: fetchErr } = await req
          .supabase!.from('media_assets')
          .select('*')
          .eq('id', req.params.id)
          .single();

        if (fetchErr || !existing) {
          res.status(404).json({ error: 'Media asset not found.' });
          return;
        }

        const replaced = await storageProvider.replaceFile(
          existing.storage_key,
          existing.visibility,
          {
            originalFilename: req.file.originalname,
            buffer: req.file.buffer,
            declaredMimeType: req.file.mimetype,
            category: existing.category as MediaCategory,
            visibility: existing.visibility,
          }
        );

        const { data: updated, error: updateErr } = await req
          .supabase!.from('media_assets')
          .update({
            original_filename: req.file.originalname,
            generated_filename: replaced.generatedFilename,
            file_extension: replaced.fileExtension,
            mime_type: replaced.verifiedMimeType,
            file_size_bytes: replaced.fileSizeBytes,
            storage_key: replaced.storageKey,
            public_url: replaced.publicUrl,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateErr) {
          res.status(500).json({ error: updateErr.message });
          return;
        }

        await logActivity(req, 'replace_media_file', 'media_assets', existing.id, {
          old_key: existing.storage_key,
          new_key: replaced.storageKey,
        });

        res.json({ media: updated });
      } catch (err: any) {
        res.status(400).json({ error: err?.message || 'File replacement failed.' });
      }
    }
  );

  app.get(
    '/api/v1/media/:id/download-private',
    requireStaffAuth,
    requirePermission('media.view_private'),
    async (req: AuthenticatedRequest, res: Response) => {
      const { data: asset } = await req
        .supabase!.from('media_assets')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (!asset) {
        res.status(404).json({ error: 'Media asset not found.' });
        return;
      }

      const absPath = storageProvider.getAbsolutePath(asset.storage_key);
      if (!existsSync(absPath)) {
        res.status(404).json({ error: 'File not found on storage disk.' });
        return;
      }

      await logActivity(req, 'download_private_media', 'media_assets', asset.id, {
        filename: asset.original_filename,
      });

      res.download(absPath, asset.original_filename);
    }
  );

  app.delete(
    '/api/v1/media/:id',
    requireStaffAuth,
    requirePermission('media.delete'),
    async (req: AuthenticatedRequest, res: Response) => {
      const { data: asset } = await req
        .supabase!.from('media_assets')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (!asset) {
        res.status(404).json({ error: 'Media asset not found.' });
        return;
      }

      const { error: delErr } = await req
        .supabase!.from('media_assets')
        .delete()
        .eq('id', asset.id);

      if (delErr) {
        res.status(400).json({
          error:
            'Cannot delete this media file because it is currently referenced by published or draft content.',
        });
        return;
      }

      await storageProvider.deleteFile(asset.storage_key);
      await logActivity(req, 'delete_media', 'media_assets', asset.id, {
        filename: asset.original_filename,
      });

      res.json({ deleted: true });
    }
  );

  // ---------------------------------------------------------------------------
  // 5. STORIES OF CHANGE SAFEGUARDING & CONSENT ENFORCEMENT ENDPOINT
  // ---------------------------------------------------------------------------
  app.post(
    '/api/v1/stories',
    requireStaffAuth,
    requirePermission('stories.create_edit'),
    async (req: AuthenticatedRequest, res: Response) => {
      const parsed = StoryUpsertSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: parsed.error.issues[0]?.message || 'Validation failed.',
          issues: parsed.error.issues,
        });
        return;
      }
      const payload = parsed.data;
      if (payload.status === 'published' && !req.staff!.permissions.includes('stories.publish')) {
        res.status(403).json({
          error: 'Contributors cannot publish stories directly. Submit for review instead.',
        });
        return;
      }

      const { data: story, error } = await req
        .supabase!.from('stories')
        .upsert({
          ...(payload.id ? { id: payload.id } : {}),
          programme_id: payload.programme_id || null,
          project_id: payload.project_id || null,
          featured_media_id: payload.featured_media_id || null,
          has_written_consent: payload.has_written_consent,
          consent_document_media_id: payload.consent_document_media_id || null,
          uses_pseudonym: payload.uses_pseudonym,
          safeguarding_review_status: payload.safeguarding_review_status,
          safeguarding_notes: payload.safeguarding_notes || null,
          status: payload.status,
          published_at: payload.status === 'published' ? new Date().toISOString() : null,
          updated_by: req.staff!.id,
        })
        .select()
        .single();

      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      for (const tr of payload.translations) {
        await req.supabase!.from('story_translations').upsert(
          {
            story_id: story.id,
            language: tr.language,
            title: tr.title,
            slug: tr.slug,
            summary: tr.summary,
            full_story: sanitizeRichText(tr.full_story),
            beneficiary_display_name: tr.beneficiary_display_name || null,
            location: tr.location || null,
            seo_title: tr.seo_title || tr.title,
            seo_description: tr.seo_description || tr.summary,
            translation_status: tr.translation_status,
            updated_by: req.staff!.id,
          },
          { onConflict: 'story_id,language' }
        );
      }

      await logActivity(req, 'save_story', 'stories', story.id, { status: payload.status });
      res.status(201).json({ story });
    }
  );

  // ---------------------------------------------------------------------------
  // 6. 1-CLICK VERIFIED BAO ASSETS & CONTENT IMPORTER / EMPTY-STATE RESETTER
  // Allows staff to either keep the site 100% empty OR import the verified
  // assets & content from assets.zip & babawatoto.or.tz into the CMS database.
  // ---------------------------------------------------------------------------
  app.post(
    '/api/v1/system/import-verified-bao-assets',
    requireStaffAuth,
    requirePermission('settings.manage'),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const publishImmediately = req.body.publishImmediately !== false;
        const targetStatus = publishImmediately ? 'published' : 'draft';
        const supabase = req.supabase!;

        // 1. Upsert verified media assets from assets.zip
        const mediaIdByFilename = new Map<string, string>();
        for (const asset of VERIFIED_BAO_MEDIA_ASSETS) {
          const { data: row } = await supabase
            .from('media_assets')
            .upsert(
              {
                original_filename: asset.original_filename,
                generated_filename: asset.generated_filename,
                file_extension: asset.file_extension,
                mime_type: asset.mime_type,
                file_size_bytes: asset.file_size_bytes,
                storage_provider: 'cpanel_local',
                storage_key: asset.storage_key,
                public_url: asset.public_url,
                media_type: asset.media_type,
                category: asset.category,
                visibility: 'public',
                title_en: asset.title_en,
                title_sw: asset.title_sw,
                alt_text_en: asset.alt_text_en,
                alt_text_sw: asset.alt_text_sw,
                safeguarding_cleared: asset.safeguarding_cleared,
                uploaded_by: req.staff!.id,
              },
              { onConflict: 'storage_key' }
            )
            .select()
            .single();

          if (row) {
            mediaIdByFilename.set(asset.original_filename, row.id);
          }
        }

        // 2. Upsert verified BAO Programmes (English & Kiswahili)
        const programmeIdByCode = new Map<string, string>();
        for (const prog of VERIFIED_BAO_PROGRAMMES) {
          const featuredMediaId = mediaIdByFilename.get(prog.featured_filename) || null;
          const { data: progRow } = await supabase
            .from('programmes')
            .upsert(
              {
                code: prog.code,
                icon_name: prog.icon_name,
                category_tag: prog.category_tag,
                featured_media_id: featuredMediaId,
                showcase_video_ids: prog.showcase_video_ids,
                is_featured: prog.is_featured,
                display_order: prog.display_order,
                status: targetStatus,
                published_at: publishImmediately ? new Date().toISOString() : null,
                updated_by: req.staff!.id,
              },
              { onConflict: 'code' }
            )
            .select()
            .single();

          if (progRow) {
            programmeIdByCode.set(prog.code, progRow.id);
            for (const lang of ['en', 'sw'] as const) {
              const t = prog[lang];
              await supabase.from('programme_translations').upsert(
                {
                  programme_id: progRow.id,
                  language: lang,
                  title: t.title,
                  subtitle: t.subtitle,
                  slug: t.slug,
                  short_description: t.short_description,
                  full_description: t.full_description,
                  objectives: t.objectives,
                  key_focus_areas: t.key_focus_areas,
                  activities: t.activities,
                  target_beneficiaries: t.target_beneficiaries,
                  geographic_coverage: t.geographic_coverage,
                  primary_outcomes: t.primary_outcomes,
                  seo_title: `${t.title} | Babawatoto Organization`,
                  seo_description: t.short_description,
                  translation_status: targetStatus,
                  updated_by: req.staff!.id,
                },
                { onConflict: 'programme_id,language' }
              );
            }
          }
        }

        // 3. Upsert verified BAO Active Projects (AHADI, Child Protection, Vocational & Life Skills)
        for (const prj of VERIFIED_BAO_PROJECTS) {
          const featuredMediaId = mediaIdByFilename.get(prj.featured_filename) || null;
          const programmeId = programmeIdByCode.get(prj.programme_code) || null;
          const { data: prjRow } = await supabase
            .from('projects')
            .upsert(
              {
                project_code: prj.project_code,
                programme_id: programmeId,
                project_status: prj.project_status,
                category_tag: prj.category_tag,
                start_date: prj.start_date,
                end_date: prj.end_date,
                implementing_partners: prj.implementing_partners,
                donors: prj.donors,
                featured_media_id: featuredMediaId,
                is_featured: prj.is_featured,
                display_order: prj.display_order,
                status: targetStatus,
                published_at: publishImmediately ? new Date().toISOString() : null,
                updated_by: req.staff!.id,
              },
              { onConflict: 'project_code' }
            )
            .select()
            .single();

          if (prjRow) {
            for (const lang of ['en', 'sw'] as const) {
              const t = prj[lang];
              await supabase.from('project_translations').upsert(
                {
                  project_id: prjRow.id,
                  language: lang,
                  title: t.title,
                  slug: t.slug,
                  short_description: t.short_description,
                  full_description: t.full_description,
                  objectives: t.objectives,
                  location: t.location,
                  public_beneficiary_summary: t.public_beneficiary_summary,
                  seo_title: `${t.title} | Babawatoto Organization`,
                  seo_description: t.short_description,
                  translation_status: targetStatus,
                  updated_by: req.staff!.id,
                },
                { onConflict: 'project_id,language' }
              );
            }
          }
        }

        // 4. Upsert verified BAO Partners & Institutional Donors (14 organizations from assets.zip)
        await supabase.from('partners').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        for (const partner of VERIFIED_BAO_PARTNERS) {
          const logoId = mediaIdByFilename.get(partner.logo_filename) || null;
          await supabase.from('partners').insert({
            name: partner.name,
            logo_media_id: logoId,
            partner_type: partner.partner_type,
            description_en: partner.description_en,
            description_sw: partner.description_sw,
            partnership_focus_en: partner.partnership_focus_en,
            partnership_focus_sw: partner.partnership_focus_sw,
            deliverables_summary_en: partner.deliverables_summary_en,
            deliverables_summary_sw: partner.deliverables_summary_sw,
            website_url: partner.website_url,
            is_featured_case_study: partner.is_featured_case_study,
            display_order: partner.display_order,
            is_active: publishImmediately,
            created_by: req.staff!.id,
            updated_by: req.staff!.id,
          });
        }

        // 5. Upsert verified BAO Leadership Team (Mgunga Mwamnyenyelwa & Lugano Maclean)
        await supabase.from('team_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        for (const member of VERIFIED_BAO_TEAM) {
          const photoId = mediaIdByFilename.get(member.photo_filename) || null;
          await supabase.from('team_members').insert({
            full_name: member.full_name,
            group_type: member.group_type,
            role_title_en: member.role_title_en,
            role_title_sw: member.role_title_sw,
            bio_en: member.bio_en,
            bio_sw: member.bio_sw,
            photo_media_id: photoId,
            display_order: member.display_order,
            status: targetStatus,
            created_by: req.staff!.id,
            updated_by: req.staff!.id,
          });
        }

        // 6. Upsert verified BAO Reach & Outcomes Impact Indicators
        for (const ind of VERIFIED_BAO_IMPACT_INDICATORS) {
          const { data: indRow } = await supabase
            .from('impact_indicators')
            .upsert(
              {
                code: ind.code,
                name_en: ind.name_en,
                name_sw: ind.name_sw,
                description_en: ind.description_en,
                description_sw: ind.description_sw,
                measurement_unit_en: ind.measurement_unit_en,
                measurement_unit_sw: ind.measurement_unit_sw,
                value_suffix: ind.value_suffix,
                chart_type: ind.chart_type,
                is_featured_on_home: ind.is_featured_on_home,
                display_order: ind.display_order,
                status: targetStatus,
                updated_by: req.staff!.id,
              },
              { onConflict: 'code' }
            )
            .select()
            .single();

          if (indRow) {
            await supabase.from('impact_records').delete().eq('indicator_id', indRow.id);
            await supabase.from('impact_records').insert({
              indicator_id: indRow.id,
              reporting_period: ind.reporting_period,
              numeric_value: ind.numeric_value,
              geographic_location: ind.geographic_location,
              verification_source: ind.verification_source,
              status: targetStatus,
              approved_by: req.staff!.id,
              created_by: req.staff!.id,
            });
          }
        }

        await logActivity(req, 'import_verified_bao_assets', 'system', undefined, {
          status: targetStatus,
          media_imported: VERIFIED_BAO_MEDIA_ASSETS.length,
          programmes_imported: VERIFIED_BAO_PROGRAMMES.length,
          projects_imported: VERIFIED_BAO_PROJECTS.length,
          partners_imported: VERIFIED_BAO_PARTNERS.length,
        });

        res.json({
          imported: true,
          status: targetStatus,
          counts: {
            media: VERIFIED_BAO_MEDIA_ASSETS.length,
            programmes: VERIFIED_BAO_PROGRAMMES.length,
            projects: VERIFIED_BAO_PROJECTS.length,
            partners: VERIFIED_BAO_PARTNERS.length,
            team: VERIFIED_BAO_TEAM.length,
            indicators: VERIFIED_BAO_IMPACT_INDICATORS.length,
          },
        });
      } catch (err: any) {
        res.status(500).json({ error: err?.message || 'Failed to import verified assets.' });
      }
    }
  );

  app.post(
    '/api/v1/system/clear-content-to-empty-state',
    requireStaffAuth,
    requirePermission('settings.manage'),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const supabase = req.supabase!;
        await supabase.from('impact_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('impact_indicators').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('stories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('articles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('resources').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('programmes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('partners').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('team_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('pages').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        await logActivity(req, 'reset_to_empty_states', 'system', undefined, {});
        res.json({ cleared: true });
      } catch (err: any) {
        res.status(500).json({ error: err?.message || 'Failed to reset content.' });
      }
    }
  );

  // ---------------------------------------------------------------------------
  // 7. SERVE COMPILED REACT CMS SPA IN PRODUCTION
  // ---------------------------------------------------------------------------
  const candidateClientDists = [
    path.resolve(__dirname, 'client'), // when running from dist/server.js (__dirname === dist) -> dist/client
    path.resolve(__dirname),           // when running from dist/server.js (__dirname === dist)
    path.resolve(__dirname, 'dist/client'), // when running from apps/bao-cms/server.ts
    path.resolve(__dirname, 'dist'),        // when running from apps/bao-cms/server.ts
    path.resolve(process.cwd(), 'dist/client'),
    path.resolve(process.cwd(), 'dist'),
    path.resolve(process.cwd(), 'apps/bao-cms/dist/client'),
    path.resolve(process.cwd(), 'apps/bao-cms/dist'),
    path.resolve(__dirname, '../dist/client'),
    path.resolve(__dirname, '../dist'),
  ];

  // Mount all valid static asset directories for root and /cms
  for (const dir of candidateClientDists) {
    if (existsSync(dir)) {
      app.use(express.static(dir, { index: false, maxAge: '1d' }));
      app.use('/cms', express.static(dir, { index: false, maxAge: '1d' }));
    }
  }

  // Find the compiled production index.html (ensure it is NOT the uncompiled dev source HTML)
  let indexHtml = '';
  for (const dir of candidateClientDists) {
    const cand = path.join(dir, 'index.html');
    if (existsSync(cand)) {
      const content = readFileSync(cand, 'utf-8');
      if (content.includes('/assets/') || !content.includes('/src/client/main.tsx')) {
        indexHtml = cand;
        break;
      }
    }
  }
  if (!indexHtml) {
    for (const dir of candidateClientDists) {
      const cand = path.join(dir, 'index.html');
      if (existsSync(cand)) {
        indexHtml = cand;
        break;
      }
    }
  }

  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/media/')) {
      next();
      return;
    }
    try {
      let targetHtml = indexHtml;
      if (!targetHtml || !existsSync(targetHtml)) {
        for (const dir of candidateClientDists) {
          const cand = path.join(dir, 'index.html');
          if (existsSync(cand)) {
            targetHtml = cand;
            break;
          }
        }
      }
      if (targetHtml && existsSync(targetHtml)) {
        const html = readFileSync(targetHtml, 'utf-8');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
        return;
      }
    } catch (readErr) {
      console.error('[bao-cms] Failed to read index.html:', readErr);
    }
    res.status(200).send('Babawatoto Organization (BAO) CMS API is running.');
  });

  // Global error handler so unexpected exceptions never crash serverless lambdas
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[bao-cms] Unhandled server error:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  });

  return app;
}

const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'));

export const app = createCmsApp();
export default app;

if (isDirectRun && !process.env.VERCEL) {
  const port = Number(process.env.CMS_PORT || 3001);
  app.listen(port, () => {
    console.log(`[BAO-CMS] Administrative Server listening on http://localhost:${port}`);
  });
}

