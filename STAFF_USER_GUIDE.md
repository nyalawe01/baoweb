# Babawatoto Organization (BAO) — Staff User Guide (`cms.babawatoto.or.tz`)

## 1. Getting Started & First-Time Super Admin Bootstrap
1. Open the Administrative CMS (`https://cms.babawatoto.or.tz` or `http://localhost:3001` locally).
2. Switch to **Register Staff Account** and register using your official `@babawatoto.or.tz` email address.
3. **Automatic Super Admin Assignment**: The PostgreSQL trigger `handle_new_auth_user()` automatically assigns the `super_admin` role to the very first staff account registered in the system. All subsequent staff accounts are created with active profile records awaiting role assignment by a Super Admin.

---

## 2. Initializing or Resetting Website Content
On the **Dashboard & Seed** module:
- **Empty State by Default**: Per BAO organizational policy, the public website never displays fictional or placeholder projects, stories, or statistics. When tables are empty, the website renders clean, branded empty states.
- **1-Click Verified BAO Assets Importer**: Click **Import Verified BAO Assets** to populate the verified photographs, partner logos, 6 core programmes (English & Kiswahili), 3 field projects, executive leadership profiles, and MEL impact indicators extracted from `assets.zip`.
- **Reset to Empty State**: Click **Reset to Empty State** to clear dynamic tables back to their empty state at any time.

---

## 3. Managing Bilingual Content (English & Kiswahili)
Every content module (**Pages & Page Builder**, **Core Programmes**, **Projects**) includes an **EN / SW** language toggle in the editor header:
1. Fill in the **English (EN)** title, URL slug, summary, and rich-text/HTML body.
2. Switch to **Kiswahili (SW)** to provide the Kiswahili translation.
3. Choose the publication status:
   - `draft` — Saved privately in CMS; not visible on `babawatoto.or.tz`.
   - `pending_review` — Submitted for review by a Website Administrator or Super Admin.
   - `published` — Live immediately on the public website.
   - `archived` — Removed from public listings while preserving historical records.

---

## 4. Child Safeguarding & Written Consent Policy Gate (Stories of Change)
In the **Stories of Change** module:
- Stories involving children or youth **cannot** be published unless both checkboxes are verified:
  - `[x] Safeguarding Cleared`
  - `[x] Written Consent Verified`
- Both the CMS API (`/api/v1/stories`) and PostgreSQL `CHECK` constraints block publication if either verification is missing.

---

## 5. Uploading & Managing Media (`bao-cms-storage`)
In the **cPanel Media Library** module:
1. Choose a file (JPEG, PNG, WebP, GIF, PDF, DOCX, XLSX, MP4).
2. Select a **Category** (`organization`, `programmes`, `projects`, `staff`, `stories`, `events`, `partners`, `reports`, `publications`, `policies`, `resources`) and **Visibility**:
   - `Public` — Stored in `bao-cms-storage/public/` and served via `/media/public/...`.
   - `Private` — Stored in `bao-cms-storage/private/` for internal staff download only.
3. Enter descriptive **Alt Text** for screen-reader accessibility (WCAG 2.1 AA).
4. Use **Replace** to swap an outdated file while preserving its database ID across all linked pages.

