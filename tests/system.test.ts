import { describe, it, expect } from 'vitest';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';
import request from 'supertest';
import {
  contactSubmissionSchema,
  volunteerSubmissionSchema,
  storyUpsertSchema,
  SYSTEM_ROLES,
  PERMISSIONS,
  PAGE_BLOCK_TYPES,
} from '../packages/shared/src/index.js';
import {
  validateMagicBytes,
  LocalCpanelStorageProvider,
} from '../packages/shared/src/storage.js';
import {
  VERIFIED_BAO_MEDIA_ASSETS,
  VERIFIED_BAO_PROGRAMMES,
  VERIFIED_BAO_PROJECTS,
  VERIFIED_BAO_PARTNERS,
} from '../packages/shared/src/verified-seed-data.js';
import { createCmsApp } from '../apps/bao-cms/server.js';
import { app as websiteApp } from '../apps/bao-website/server.js';

describe('Babawatoto Organization (BAO) Shared Security, Storage & Schema Verification', () => {
  it('validates genuine PNG, JPEG, and PDF magic byte signatures and rejects spoofed executables', () => {
    const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
    const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
    const validPdf = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
    const spoofedExeAsPng = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);

    expect(validateMagicBytes(validPng, 'image/png')).toBe(true);
    expect(validateMagicBytes(validJpeg, 'image/jpeg')).toBe(true);
    expect(validateMagicBytes(validPdf, 'application/pdf')).toBe(true);
    expect(validateMagicBytes(spoofedExeAsPng, 'image/png')).toBe(false);
    expect(validateMagicBytes(validPng, 'application/x-msdownload')).toBe(false);
  });

  it('prevents path traversal attacks in LocalCpanelStorageProvider and stores/replaces files cleanly', async () => {
    const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'bao-storage-test-'));
    const provider = new LocalCpanelStorageProvider(tmpRoot);
    await provider.ensureDirectories();

    expect(() => provider.resolveSafeStoragePath('../../etc/passwd')).toThrow(
      /Path traversal attempt blocked/
    );

    const pngBuf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x01, 0x02]);
    const saved = await provider.saveFile({
      buffer: pngBuf,
      originalFilename: 'bao-child-protection.png',
      mimeType: 'image/png',
      category: 'programmes',
      visibility: 'public',
    });

    expect(saved.storageKey).toContain('public/images/programmes/');
    expect(saved.fileExtension).toBe('png');

    const readable = await provider.getReadablePath(saved.storageKey);
    expect(readable).toBeTruthy();

    const stats = await provider.getStorageStats();
    expect(stats.fileCount).toBe(1);
    expect(stats.totalBytesUsed).toBe(pngBuf.length);

    await provider.deleteFile(saved.storageKey);
    const afterDelete = await provider.getReadablePath(saved.storageKey);
    expect(afterDelete).toBeNull();

    await fs.rm(tmpRoot, { recursive: true, force: true });
  });

  it('enforces mandatory Child Safeguarding & Written Consent before publishing Stories of Change', () => {
    const unsafePublishedStory = storyUpsertSchema.safeParse({
      safeguarding_cleared: false,
      consent_verified: true,
      use_pseudonym: true,
      status: 'published',
      translations: {
        en: {
          title: 'Reunification Journey',
          slug: 'reunification-journey',
          excerpt: 'A story of family reunification in Dar es Salaam.',
          body_html: '<p>Full narrative content for the story of change.</p>',
        },
      },
    });
    expect(unsafePublishedStory.success).toBe(false);

    const safePublishedStory = storyUpsertSchema.safeParse({
      safeguarding_cleared: true,
      consent_verified: true,
      use_pseudonym: true,
      status: 'published',
      translations: {
        en: {
          title: 'Reunification Journey',
          slug: 'reunification-journey',
          excerpt: 'A story of family reunification in Dar es Salaam.',
          body_html: '<p>Full narrative content for the story of change.</p>',
        },
      },
    });
    expect(safePublishedStory.success).toBe(true);
  });

  it('validates public Contact and Volunteer forms and blocks bot honeypot fills', () => {
    const botAttempt = contactSubmissionSchema.safeParse({
      full_name: 'Spam Bot',
      email: 'bot@example.com',
      subject: 'Spam message',
      message: 'This is a spam message filling the hidden honeypot field.',
      honeypot: 'http://spam.example.com',
    });
    expect(botAttempt.success).toBe(false);

    const validVolunteer = volunteerSubmissionSchema.safeParse({
      full_name: 'Asha Juma',
      email: 'asha@example.org',
      phone: '+255784000111',
      country_city: 'Dar es Salaam, Tanzania',
      area_of_interest: 'Child Protection',
      skills_summary: 'Licensed social worker with 5 years experience in Dar es Salaam.',
      availability: 'Full-time 6 months',
      motivation: 'Committed to supporting child protection and family reintegration.',
      safeguarding_pledge_accepted: true,
      honeypot: '',
    });
    expect(validVolunteer.success).toBe(true);
  });

  it('verifies complete RBAC roles, permissions, page builder block types, and verified BAO seed assets', () => {
    expect(SYSTEM_ROLES).toHaveLength(6);
    expect(PERMISSIONS.length).toBeGreaterThanOrEqual(30);
    expect(PAGE_BLOCK_TYPES).toHaveLength(16);
    expect(VERIFIED_BAO_MEDIA_ASSETS.length).toBeGreaterThanOrEqual(30);
    expect(VERIFIED_BAO_PROGRAMMES).toHaveLength(6);
    expect(VERIFIED_BAO_PROJECTS).toHaveLength(3);
    expect(VERIFIED_BAO_PARTNERS.length).toBeGreaterThanOrEqual(12);
  });

  it('enforces JWT authentication & RBAC on CMS API endpoints and serves public Website endpoints', async () => {
    const cmsApp = createCmsApp();

    // Unauthenticated requests to protected CMS endpoints must return 401
    const dashUnauth = await request(cmsApp).get('/api/v1/dashboard');
    expect(dashUnauth.status).toBe(401);

    const uploadUnauth = await request(cmsApp).post('/api/v1/media/upload');
    expect(uploadUnauth.status).toBe(401);

    const deleteProjectUnauth = await request(cmsApp).delete('/api/v1/projects/00000000-0000-0000-0000-000000000000');
    expect(deleteProjectUnauth.status).toBe(401);

    // Public Website health, robots.txt, and contact form validation
    const healthRes = await request(websiteApp).get('/api/health');
    expect(healthRes.status).toBe(200);
    expect(healthRes.body.service).toBe('bao-website');

    const robotsRes = await request(websiteApp).get('/robots.txt');
    expect(robotsRes.status).toBe(200);
    expect(robotsRes.text).toContain('Sitemap: https://babawatoto.or.tz/sitemap.xml');

    const invalidContact = await request(websiteApp)
      .post('/api/public/contact')
      .send({ full_name: 'A', email: 'not-an-email' });
    expect(invalidContact.status).toBe(400);
  });
});

