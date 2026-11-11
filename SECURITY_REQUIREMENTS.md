# SECURITY REQUIREMENTS & SAFEGUARDING CONTROLS

## 1. Defense-in-Depth Security Architecture
The Babawatoto Website and Custom CMS handle organizational publishing, staff accounts, and beneficiary stories requiring strict child and community safeguarding standards. Security is enforced across four layers: **Transport & Edge**, **Application & API**, **Database (RLS)**, and **Filesystem Storage**.

---

## 2. Authentication & Session Security
1. **Supabase Auth Integration**:
   - Passwords hashed with Argon2id/bcrypt managed by Supabase Auth.
   - Short-lived JWT access tokens (`1 hour` expiry) paired with secure `HttpOnly`, `Secure`, `SameSite=Lax` refresh sessions.
2. **Active Account Verification**:
   - Even if a user holds a valid JWT, the CMS middleware queries `public.profiles.is_active`. Deactivated staff accounts are immediately rejected with `403 Forbidden`.
3. **Brute-Force Protection**:
   - Login and password-reset endpoints are protected by strict IP and account rate limiting (`5 attempts per 15 minutes`).

---

## 3. Server-Side Authorization & Row Level Security (RLS)
1. **Zero Trust in Frontend Controls**:
   - Hiding buttons in the React CMS UI is strictly for user experience. Every state-changing API endpoint (`POST`, `PUT`, `PATCH`, `DELETE`) executes `requirePermission('module.action')` on the server.
2. **PostgreSQL Row Level Security (RLS)**:
   - Every table in the `public` schema has `ENABLE ROW LEVEL SECURITY` turned on.
   - Anonymous (`anon`) connections used by the public website can **only `SELECT`** rows where `status = 'published'` (and for stories, where `safeguarding_review_status = 'approved'`).
   - Anonymous connections can **never `SELECT`** from `profiles`, `roles`, `permissions`, `user_roles`, `contact_messages`, `volunteer_applications`, `publication_reviews`, `activity_logs`, or private `media_assets`.

---

## 4. Input Validation, Output Sanitization & XSS Prevention
1. **Strict Schema Validation**:
   - Every API request body, query parameter, and URL parameter is validated on the server using **Zod** schemas with `.strict()` mode enabled to reject unexpected fields.
2. **Rich-Text & Page-Builder Sanitization**:
   - TipTap rich-text content and page-builder blocks are sanitized server-side using `isomorphic-dompurify` before saving to PostgreSQL.
   - `<script>`, `<iframe>` (except validated video embed IDs), `object`, `embed`, `form`, and inline `on*` event attributes (`onerror`, `onload`, `onclick`) are stripped completely.
3. **Content Security Policy (CSP) & HTTP Security Headers**:
   - Configured via `helmet`:
     - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
     - `X-Content-Type-Options: nosniff`
     - `X-Frame-Options: DENY`
     - `Referrer-Policy: strict-origin-when-cross-origin`
     - `Content-Security-Policy`: Restricts scripts, styles, frames, and connections to approved origins only.

---

## 5. File Upload & Media Security
1. **Magic-Byte Inspection**:
   - Uploaded files are inspected using `file-type` buffer signature verification. A file named `report.pdf` whose binary header does not match `%PDF-` is immediately rejected and deleted.
2. **Path Traversal & Filename Sanitization**:
   - Original filenames are stored only as display metadata in `media_assets.original_filename`.
   - Disk filenames are generated using cryptographically random UUIDs (`<uuid>.<verified-ext>`), eliminating `../` path traversal and null-byte injection vectors.
3. **Storage Outside `public_html`**:
   - All files reside in `/home/babawatotoor/bao-cms-storage/` with `0640` permissions so the web server can never execute an uploaded file as a script.
4. **Private Document Access Control**:
   - Files marked `visibility = 'private'` (e.g., signed consent forms, verification docs, volunteer CVs) are never accessible via public media URLs. Downloading requires a valid CMS staff session with `media.view_private` permission, and every private download is recorded in `activity_logs`.

---

## 6. Child & Beneficiary Safeguarding Controls
Because Babawatoto Organization works directly with children, youth, and vulnerable communities:
1. **No Confidential Beneficiary PII in CMS**:
   - The Projects and Impact modules enforce aggregated, public-safe beneficiary summaries only. Staff are prompted with safeguarding reminders on relevant form fields.
2. **Mandatory Safeguarding Gate on Stories of Change**:
   - A Story of Change **cannot transition to `published`** at either the API layer or the PostgreSQL database constraint layer unless:
     - `has_written_consent = true`
     - `safeguarding_review_status = 'approved'` by an authorized Reviewer (`Editor`, `Website Admin`, or `Super Admin`).
3. **Emergency Unpublish & Redaction**:
   - If consent is ever withdrawn by a beneficiary or guardian, an Editor or Administrator can immediately switch the story or media asset to `archived` / `private`, which instantaneously removes it from the public website and purges the server cache.

---

## 7. Secret Management & Audit Logging
1. **Secret Isolation**:
   - `SUPABASE_SERVICE_ROLE_KEY` is stored exclusively in `/home/babawatotoor/bao-cms/.env` (`0600` permissions) and is never bundled into client JavaScript (`VITE_*` variables are restricted to public non-sensitive keys only).
2. **Comprehensive Audit Trail (`activity_logs`)**:
   - Every login, failed authorization attempt, content creation, update, publication status change, safeguarding approval, file upload, file replacement, file deletion, and role change is logged with `actor_id`, `ip_address`, `user_agent`, `timestamp`, and change metadata.
3. **Backup & Recovery**:
   - Daily automated database exports + weekly cPanel `/home/babawatotoor/bao-cms-storage` archive backups.
