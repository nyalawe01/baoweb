import fs from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { MediaCategory } from './index.js';

// =============================================================================
// MODULAR STORAGE PROVIDER INTERFACE & CPANEL LOCAL FILESYSTEM IMPLEMENTATION
// Supports cPanel directory outside public_html + future Cloudflare R2 swap
// =============================================================================

export interface ValidatedUploadInput {
  originalFilename: string;
  buffer: Buffer;
  declaredMimeType?: string;
  mimeType?: string;
  category: MediaCategory;
  visibility: 'public' | 'private';
  maxImageSizeMb?: number;
  maxDocumentSizeMb?: number;
  maxVideoSizeMb?: number;
}

export interface StoredFileResult {
  generatedFilename: string;
  fileExtension: string;
  verifiedMimeType: string;
  mediaType: 'image' | 'document' | 'video';
  fileSizeBytes: number;
  storageKey: string;
  publicUrl: string | null;
  storageProvider: 'cpanel_local' | 'cloudflare_r2';
}

export interface StorageUsageSummary {
  totalBytesUsed: number;
  publicBytesUsed: number;
  privateBytesUsed: number;
  fileCount: number;
}

export interface IStorageProvider {
  readonly providerName: 'cpanel_local' | 'cloudflare_r2';
  saveFile(input: ValidatedUploadInput): Promise<StoredFileResult>;
  replaceFile(existingStorageKey: string, existingVisibility: 'public' | 'private', input: ValidatedUploadInput): Promise<StoredFileResult>;
  deleteFile(storageKey: string, visibility: 'public' | 'private'): Promise<void>;
  getAbsolutePath(storageKey: string, visibility: 'public' | 'private'): string;
  createReadStream(storageKey: string, visibility: 'public' | 'private'): NodeJS.ReadableStream;
  getUsageSummary(): Promise<StorageUsageSummary>;
  cleanupTemporaryFiles(maxAgeMinutes?: number): Promise<number>;
}

const ALLOWED_SIGNATURES: Array<{
  ext: string;
  mime: string;
  mediaType: 'image' | 'document' | 'video';
  check: (buf: Buffer) => boolean;
}> = [
  {
    ext: 'jpg',
    mime: 'image/jpeg',
    mediaType: 'image',
    check: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: 'png',
    mime: 'image/png',
    mediaType: 'image',
    check: (b) =>
      b.length >= 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  },
  {
    ext: 'webp',
    mime: 'image/webp',
    mediaType: 'image',
    check: (b) =>
      b.length >= 12 &&
      b.subarray(0, 4).toString('ascii') === 'RIFF' &&
      b.subarray(8, 12).toString('ascii') === 'WEBP',
  },
  {
    ext: 'pdf',
    mime: 'application/pdf',
    mediaType: 'document',
    check: (b) => b.length >= 5 && b.subarray(0, 5).toString('ascii') === '%PDF-',
  },
  {
    ext: 'docx',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    mediaType: 'document',
    check: (b) => b.length >= 4 && b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04,
  },
  {
    ext: 'xlsx',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    mediaType: 'document',
    check: (b) => b.length >= 4 && b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04,
  },
  {
    ext: 'mp4',
    mime: 'video/mp4',
    mediaType: 'video',
    check: (b) => b.length >= 12 && b.subarray(4, 8).toString('ascii') === 'ftyp',
  },
];

export function validateMagicBytes(buffer: Buffer, declaredMimeType: string): boolean {
  if (!buffer || buffer.length === 0) return false;
  return ALLOWED_SIGNATURES.some(
    (sig) => sig.mime === declaredMimeType && sig.check(buffer)
  );
}

export function validateFileBufferAndSignature(input: ValidatedUploadInput): {
  ext: string;
  mime: string;
  mediaType: 'image' | 'document' | 'video';
} {
  const { originalFilename, buffer } = input;
  if (!buffer || buffer.length === 0) {
    throw new Error('Uploaded file is empty.');
  }

  const rawExt = path.extname(originalFilename).toLowerCase().replace('.', '');
  const normalizedExt = rawExt === 'jpeg' ? 'jpg' : rawExt;

  const disallowedExtensions = ['php', 'phtml', 'sh', 'exe', 'bat', 'cmd', 'js', 'mjs', 'cjs', 'ts', 'html', 'htm', 'svg', 'py', 'pl', 'cgi', 'htaccess'];
  if (disallowedExtensions.includes(normalizedExt)) {
    throw new Error(`Security policy violation: .${rawExt} files are not permitted.`);
  }

  const matched = ALLOWED_SIGNATURES.find(
    (sig) => sig.ext === normalizedExt && sig.check(buffer)
  );

  if (!matched) {
    throw new Error(
      `Invalid or unsupported file signature for "${originalFilename}". Allowed formats: JPG, PNG, WEBP, PDF, DOCX, XLSX, MP4.`
    );
  }

  const maxImgBytes = (input.maxImageSizeMb ?? 10) * 1024 * 1024;
  const maxDocBytes = (input.maxDocumentSizeMb ?? 25) * 1024 * 1024;
  const maxVidBytes = (input.maxVideoSizeMb ?? 100) * 1024 * 1024;

  if (matched.mediaType === 'image' && buffer.length > maxImgBytes) {
    throw new Error(`Image exceeds maximum allowed size of ${input.maxImageSizeMb ?? 10} MB.`);
  }
  if (matched.mediaType === 'document' && buffer.length > maxDocBytes) {
    throw new Error(`Document exceeds maximum allowed size of ${input.maxDocumentSizeMb ?? 25} MB.`);
  }
  if (matched.mediaType === 'video' && buffer.length > maxVidBytes) {
    throw new Error(`Video exceeds maximum allowed size of ${input.maxVideoSizeMb ?? 100} MB.`);
  }

  return {
    ext: matched.ext,
    mime: matched.mime,
    mediaType: matched.mediaType,
  };
}

export class LocalCpanelStorageProvider implements IStorageProvider {
  public readonly providerName = 'cpanel_local' as const;
  private readonly rootPath: string;

  constructor(storageRootPath: string) {
    this.rootPath = path.resolve(storageRootPath);
  }

  public async ensureDirectories(): Promise<void> {
    const dirs = [
      'public/images/organization',
      'public/images/programmes',
      'public/images/projects',
      'public/images/staff',
      'public/images/stories',
      'public/images/events',
      'public/images/partners',
      'public/documents/reports',
      'public/documents/publications',
      'public/documents/policies',
      'public/documents/resources',
      'public/videos',
      'private/safeguarding-consents',
      'private/impact-verification',
      'temporary/uploads-staging',
    ];
    for (const d of dirs) {
      await fs.mkdir(path.join(this.rootPath, d), { recursive: true });
    }
  }

  public resolveSafeStoragePath(storageKey: string): string {
    if (storageKey.includes('..')) {
      throw new Error('Security violation: Path traversal attempt blocked.');
    }
    const cleanedKey = storageKey.replace(/^[/\\]+/, '');
    const resolved = path.resolve(this.rootPath, cleanedKey);
    if (!resolved.startsWith(this.rootPath)) {
      throw new Error('Security violation: Path traversal attempt blocked.');
    }
    return resolved;
  }

  public async getReadablePath(storageKey: string): Promise<string | null> {
    try {
      const full = this.resolveSafeStoragePath(storageKey);
      return existsSync(full) ? full : null;
    } catch {
      return null;
    }
  }

  public async getStorageStats(): Promise<StorageUsageSummary> {
    return this.getUsageSummary();
  }

  private resolveSafePath(storageKey: string): string {
    return this.resolveSafeStoragePath(storageKey);
  }

  private buildSubfolder(
    visibility: 'public' | 'private',
    mediaType: 'image' | 'document' | 'video',
    category: MediaCategory
  ): string {
    if (visibility === 'private') {
      if (category === 'stories') return 'private/safeguarding-consents';
      return 'private/impact-verification';
    }
    if (mediaType === 'image') {
      const validImageFolders = ['organization', 'programmes', 'projects', 'staff', 'stories', 'events', 'partners'];
      const folder = validImageFolders.includes(category) ? category : 'organization';
      return `public/images/${folder}`;
    }
    if (mediaType === 'document') {
      const validDocFolders = ['reports', 'publications', 'policies', 'resources'];
      const folder = validDocFolders.includes(category) ? category : 'resources';
      return `public/documents/${folder}`;
    }
    return 'public/videos';
  }

  public async saveFile(input: ValidatedUploadInput): Promise<StoredFileResult> {
    const validated = validateFileBufferAndSignature(input);
    const uuid = crypto.randomUUID();
    const generatedFilename = `${uuid}.${validated.ext}`;
    const subfolder = this.buildSubfolder(input.visibility, validated.mediaType, input.category);
    const storageKey = `${subfolder}/${generatedFilename}`;
    const targetFullPath = this.resolveSafePath(storageKey);

    await fs.mkdir(path.dirname(targetFullPath), { recursive: true });
    await fs.writeFile(targetFullPath, input.buffer, { mode: 0o640 });

    return {
      generatedFilename,
      fileExtension: validated.ext,
      verifiedMimeType: validated.mime,
      mediaType: validated.mediaType,
      fileSizeBytes: input.buffer.length,
      storageKey,
      publicUrl: input.visibility === 'public' ? `/media/${storageKey}` : null,
      storageProvider: 'cpanel_local',
    };
  }

  public async replaceFile(
    existingStorageKey: string,
    _existingVisibility: 'public' | 'private',
    input: ValidatedUploadInput
  ): Promise<StoredFileResult> {
    const newStored = await this.saveFile(input);
    try {
      const oldFullPath = this.resolveSafePath(existingStorageKey);
      if (existsSync(oldFullPath) && oldFullPath !== this.resolveSafePath(newStored.storageKey)) {
        await fs.unlink(oldFullPath);
      }
    } catch {
      // Ignore if previous file was already missing
    }
    return newStored;
  }

  public async deleteFile(storageKey: string): Promise<void> {
    const fullPath = this.resolveSafePath(storageKey);
    if (existsSync(fullPath)) {
      await fs.unlink(fullPath);
    }
  }

  public getAbsolutePath(storageKey: string): string {
    return this.resolveSafePath(storageKey);
  }

  public createReadStream(storageKey: string): NodeJS.ReadableStream {
    const fullPath = this.resolveSafePath(storageKey);
    if (!existsSync(fullPath)) {
      throw new Error('Requested media file does not exist on storage.');
    }
    return createReadStream(fullPath);
  }

  public async getUsageSummary(): Promise<StorageUsageSummary> {
    let publicBytesUsed = 0;
    let privateBytesUsed = 0;
    let fileCount = 0;

    const walk = async (dir: string, isPrivate: boolean) => {
      if (!existsSync(dir)) return;
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(full, isPrivate);
        } else if (entry.isFile()) {
          const stat = await fs.stat(full);
          fileCount += 1;
          if (isPrivate) privateBytesUsed += stat.size;
          else publicBytesUsed += stat.size;
        }
      }
    };

    await walk(path.join(this.rootPath, 'public'), false);
    await walk(path.join(this.rootPath, 'private'), true);

    return {
      totalBytesUsed: publicBytesUsed + privateBytesUsed,
      publicBytesUsed,
      privateBytesUsed,
      fileCount,
    };
  }

  public async cleanupTemporaryFiles(maxAgeMinutes = 30): Promise<number> {
    const tempDir = path.join(this.rootPath, 'temporary', 'uploads-staging');
    if (!existsSync(tempDir)) return 0;
    const entries = await fs.readdir(tempDir, { withFileTypes: true });
    const cutoff = Date.now() - maxAgeMinutes * 60 * 1000;
    let deleted = 0;
    for (const entry of entries) {
      if (entry.isFile()) {
        const full = path.join(tempDir, entry.name);
        const stat = await fs.stat(full);
        if (stat.mtimeMs < cutoff) {
          await fs.unlink(full);
          deleted += 1;
        }
      }
    }
    return deleted;
  }
}

