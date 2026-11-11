# DEPLOYMENT GUIDE: CPANEL HOSTING & SUPABASE PRODUCTION SETUP

## 1. Existing cPanel Infrastructure Summary
- **Primary Domain**: `babawatoto.or.tz`
- **CMS Subdomain**: `cms.babawatoto.or.tz`
- **cPanel Account**: `babawatotoor`
- **Home Directory**: `/home/babawatotoor`
- **Shared IP Address**: `65.181.111.30`
- **Web Server**: LiteSpeed Enterprise + Phusion Passenger (`Setup Node.js App`)
- **SSL Status**: Active (AutoSSL / Let's Encrypt)
- **Account Resource Limits**: `2 GB` Physical Memory, `30` Entry Processes

---

## 2. Non-Destructive Directory Layout on cPanel

To ensure the existing website in `/home/babawatotoor/public_html` is **never overwritten or disrupted** during development and staging, all new applications and media live in sibling directories inside `/home/babawatotoor/`:

```text
/home/babawatotoor/
├── public_html/                  # EXISTING LIVE WEBSITE (Untouched until final approved cutover)
├── public_html_legacy_backup/    # Full archive backup created prior to cutover
├── bao-website/                  # New Public Website Node.js Application
│   ├── dist/
│   │   ├── server.js             # Passenger startup file
│   │   └── client/               # Compiled static client assets
│   ├── package.json
│   └── .env                      # Production environment variables (0600 permissions)
├── bao-cms/                      # New Administrative CMS Node.js Application
│   ├── dist/
│   │   ├── server.js             # Passenger startup file
│   │   └── client/               # Compiled CMS SPA assets
│   ├── package.json
│   └── .env                      # Production CMS environment variables (0600 permissions)
└── bao-cms-storage/              # Persistent Media Storage (Outside public_html)
    ├── public/
    ├── private/
    └── temporary/
```

---

## 3. Step-by-Step Deployment Procedure

### Step 1: Prepare DNS & Subdomains in cPanel
1. Log in to cPanel (`babawatotoor`).
2. Open **Domains** -> **Create A New Domain**:
   - Domain: `cms.babawatoto.or.tz`
   - Document Root: `/home/babawatotoor/cms_public_html` (outside `public_html`)
   - Optional staging subdomain for testing the public website before cutover: `staging.babawatoto.or.tz` -> `/home/babawatotoor/staging_public_html`.
3. Open **Zone Editor** and verify an `A` record exists for `cms.babawatoto.or.tz` pointing to `65.181.111.30`.
4. Open **SSL/TLS Status** and click **Run AutoSSL** so `cms.babawatoto.or.tz` receives an active HTTPS certificate.

### Step 2: Create Persistent Storage Directories
Via cPanel Terminal or SSH:
```bash
mkdir -p /home/babawatotoor/bao-cms-storage/public/images/{organization,programmes,projects,staff,stories,events}
mkdir -p /home/babawatotoor/bao-cms-storage/public/documents/{reports,publications,policies,resources}
mkdir -p /home/babawatotoor/bao-cms-storage/public/videos
mkdir -p /home/babawatotoor/bao-cms-storage/private/{safeguarding-consents,impact-verification,volunteer-cvs}
mkdir -p /home/babawatotoor/bao-cms-storage/temporary/uploads-staging
chmod -R 750 /home/babawatotoor/bao-cms-storage
```

### Step 3: Build Locally / in CI (Avoiding cPanel RAM Spikes)
Because compiling TypeScript and bundling Vite assets can consume `1 GB+` RAM, always run `npm run build` in the development/CI environment and upload the pre-built production artifacts (`dist/`, `package.json`, `package-lock.json`) to `/home/babawatotoor/bao-website` and `/home/babawatotoor/bao-cms`.

### Step 4: Configure `bao-cms` in cPanel "Setup Node.js App"
1. In cPanel, open **Setup Node.js App** -> **Create Application**:
   - **Node.js version**: Select highest available LTS (`v20.x` or `v22.x`).
   - **Application mode**: `Production`
   - **Application root**: `bao-cms` (`/home/babawatotoor/bao-cms`)
   - **Application URL**: `cms.babawatoto.or.tz`
   - **Application startup file**: `dist/server.js`
   - **Passenger log file**: `/home/babawatotoor/logs/bao-cms.log`
2. Click **Create**, then click **Run NPM Install** (installs production dependencies only).
3. Add Environment Variables in the cPanel Node.js UI (or `/home/babawatotoor/bao-cms/.env` with `chmod 600`):
   - `NODE_ENV=production`
   - `SUPABASE_URL=<project-url>`
   - `SUPABASE_ANON_KEY=<anon-key>`
   - `SUPABASE_SERVICE_ROLE_KEY=<service-role-key>` (CMS Backend Only!)
   - `STORAGE_ROOT_PATH=/home/babawatotoor/bao-cms-storage`
   - `PUBLIC_WEBSITE_URL=https://babawatoto.or.tz`
   - `CMS_BASE_URL=https://cms.babawatoto.or.tz`
   - `CACHE_PURGE_SECRET=<random-32-byte-hex>`

### Step 5: Configure `bao-website` in cPanel "Setup Node.js App"
1. **Staged Verification First**:
   - Bind `bao-website` initially to `staging.babawatoto.or.tz` (or test via preview port) while `/home/babawatotoor/public_html` continues serving the existing site.
   - **Application root**: `bao-website` (`/home/babawatotoor/bao-website`)
   - **Application startup file**: `dist/server.js`
   - **Passenger log file**: `/home/babawatotoor/logs/bao-website.log`
2. Configure Environment Variables for `bao-website`:
   - `NODE_ENV=production`
   - `SUPABASE_URL=<project-url>`
   - `SUPABASE_ANON_KEY=<anon-key>` (Never include `SUPABASE_SERVICE_ROLE_KEY` here)
   - `STORAGE_ROOT_PATH=/home/babawatotoor/bao-cms-storage`
   - `PUBLIC_WEBSITE_URL=https://babawatoto.or.tz`
   - `CACHE_PURGE_SECRET=<matching-random-32-byte-hex>`

### Step 6: Safe Production Cutover & Rollback Plan
1. **Backup Current Website**:
   ```bash
   cp -rp /home/babawatotoor/public_html /home/babawatotoor/public_html_backup_$(date +%F)
   ```
2. **Switch Application URL**:
   - Once BAO staff have verified both `cms.babawatoto.or.tz` and the staged public website, update the `bao-website` Node.js Application URL in cPanel to `babawatoto.or.tz`.
   - cPanel Passenger automatically injects the `.htaccess` PhusionPassenger configuration to route traffic to `bao-website/dist/server.js`.
3. **Instant Rollback**:
   - If a rollback is ever needed, stop the `bao-website` Node.js app in cPanel and restore `/home/babawatotoor/public_html/.htaccess` from `/home/babawatotoor/public_html_backup_YYYY-MM-DD`.

---

## 4. Process Persistence & Restart Management
- LiteSpeed / Phusion Passenger automatically starts `dist/server.js` on incoming traffic and restarts it if the process exits.
- To trigger a graceful zero-downtime restart after deploying code updates:
  ```bash
  mkdir -p /home/babawatotoor/bao-cms/tmp /home/babawatotoor/bao-website/tmp
  touch /home/babawatotoor/bao-cms/tmp/restart.txt
  touch /home/babawatotoor/bao-website/tmp/restart.txt
  ```
