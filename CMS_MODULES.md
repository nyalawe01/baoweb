# CMS MODULES SPECIFICATION: BABAWATOTO ADMINISTRATIVE CMS

## 1. Overview
The Babawatoto Administrative CMS (`cms.babawatoto.or.tz`) provides 16 purpose-built modules designed for non-technical NGO staff. Every module enforces role-based access control (RBAC), bilingual content management (English & Kiswahili), and the 6-stage publishing workflow (`Draft`, `Pending Review`, `Approved`, `Scheduled`, `Published`, `Archived`).

---

## 2. Detailed Module Specifications

### Module 1: Dashboard Overview
- **Metrics Displayed (Strictly from Live Database Counts)**:
  - Total Pages (`pages` count) | Published Pages | Draft Pages
  - Total Programmes & Total Projects | Active (`ongoing`) Projects
  - Published News Articles & Upcoming Events
  - Published Stories of Change
  - Total Media Files & Storage Disk Usage (`SUM(file_size_bytes)`)
  - Pending Content Reviews & Pending Safeguarding Reviews
- **Visualizations**:
  - Recent CMS Activity Feed (latest 15 entries from `activity_logs`)
  - Quick-action shortcuts based on user permissions ("Create News Article", "Upload Media", "Review Pending Submissions").

### Module 2: Pages & Controlled Page Builder
- **Capabilities**:
  - Manage all structural pages (Home, About Us subpages, Get Involved / Institutional Donors, Contact, Policies, and custom pages).
  - Edit English (`en`) and Kiswahili (`sw`) translations side-by-side or via language tabs, with clear badges for missing translations.
  - Edit page titles, slugs, SEO metadata, and Open Graph images.
  - Version History viewer with 1-click restore to any previous `page_versions` snapshot.
- **Controlled Page Builder (16 Validated Block Types + Reference Layout Variants)**:
  1. `heading`: Level (`h2`, `h3`, `h4`), alignment, subtitle, uppercase tag.
  2. `rich_text`: Sanitized TipTap HTML/JSON content.
  3. `single_image`: Media reference, caption, aspect ratio, optional floating metric badge (like the "18+ Years of Community Impact" badge on BAO's About page).
  4. `image_gallery`: Grid or carousel of selected `media_assets` with lightbox captions.
  5. `image_and_text`: Split layout (image left/right, heading, rich text, optional CTA button — supports BizyTech bordered feature card variant and StreetChildren institutional donor case-study variant).
  6. `two_column_layout`: Structured two-column content cards (e.g., Vision & Mission side-by-side cards with Lucide icons).
  7. `three_column_layout`: Structured three-column feature/value cards (e.g., Our Beginning / Establishment / Our Mandate cards).
  8. `video_embed`: Supports both single video embed and **World Vision-style Multi-Video Carousel** with slide counter (`1 / N`), custom play overlay, and YouTube channel subscribe link.
  9. `statistics`: Dynamic selector pulling published `impact_indicators` (renders as count-up metric cards, Recharts bar/line charts, or data tables).
  10. `project_cards`: Dynamic block displaying featured or programme-filtered published projects.
  11. `programme_cards`: Dynamic block rendering published programmes in either **World Vision Icon Pillar Grid** style or **Photo Card Grid with Category Filter Tabs** style.
  12. `partner_logos`: Dynamic **Continuous Looping Marquee** or **Categorized Partner Grid** of active partner logos.
  13. `downloadable_documents`: Curated list of published `resources` with file type badge, file size, publication year, and download button.
  14. `call_to_action`: Full-width background image banner (like BAO's *"Join Us in Making a Difference"* section) or solid surface banner (`charcoal`, `ochre`, `light_grey`) with primary and secondary CTA buttons.
  15. `divider`: Subtle horizontal rule (`#E5E7E5`).
  16. `spacer`: Configurable vertical whitespace (`sm`, `md`, `lg`, `xl`).

### Module 3: Programmes Management
- Supports BAO's thematic pillars (e.g., *Child Protection & Ethics*, *Education & Vocational Skills*, *HEART, Social Arts & Culture*, *Youth Empowerment & Civic Engagement*, *ASRH & Behaviour Change Communication*, *Humanitarian, Conservation & Clean Energy*, *Advocacy & Consultancy*).
- **Editable Bilingual Fields**:
  - Title, Subtitle, Slug, Category Filter Tag, Lucide Icon selector (for World Vision-style pillar grid)
  - Short Description & Full Overview (TipTap)
  - **Key Focus Areas Checklist** (Title + description items, matching BAO's `programs.html` detail layout)
  - Activities list, Target Beneficiaries, Geographic Coverage, Primary Outcomes summary text
  - Featured Image, Gallery Images, **Showcase YouTube Video IDs / Uploaded Videos**
  - Linked Projects, Linked Stories, Linked Publications, Publication Status, and SEO metadata.

### Module 4: Projects Management
- Full lifecycle management for BAO projects (such as *AHADI Project*, *Child Protection & Support*, *Vocational & Life Skills*):
  - Title, Slug, Short & Full Description (EN/SW)
  - Objectives & Project Activities timeline (`project_activities`)
  - Location, Start Date, End Date, Status (`planned`, `ongoing`, `completed`)
  - Implementing Partners & Institutional Donors tags
  - Public Beneficiary Summary (with explicit UI reminder against entering confidential PII)
  - Linked Programme, Linked Impact Indicators, Project Gallery, and Project Documents.

### Module 5: News and Events
- **News Tab**: Create/edit articles (BizyTech / Save the Children card layout with category badge, date, 3-line excerpt, full rich-text body), assign `article_categories`, add tags, select featured image, author EN/SW content, schedule publication date, preview, and publish.
- **Events Tab**: Manage event title, description, start/end date & time, physical/virtual location, registration URL/instructions, featured image, and event status (`upcoming`, `ongoing`, `past`, `cancelled`).

### Module 6: Stories of Change (with Safeguarding Gate)
- Bilingual story editor (Title, Slug, Summary, Full Story, Featured Image, Image Gallery, Programme & Project associations).
- **Mandatory Safeguarding & Consent Gate**:
  - Checkbox: *Written informed consent obtained and archived* (`has_written_consent`)
  - Private file attachment: Upload signed consent form (`consent_document_media_id`, stored in `private/` directory)
  - Toggle: *Uses pseudonym to protect beneficiary identity* (`uses_pseudonym`)
  - Safeguarding Review Status (`pending`, `approved`, `rejected`) — Enforced at both API and database levels before a story can be published.

### Module 7: Media Library
- Unified browser for Images, Documents, and Videos stored in `/home/babawatotoor/bao-cms-storage/`.
- Drag-and-drop multi-file upload with progress bars and magic-byte validation feedback.
- Metadata editor: Title (EN/SW), Alt Text (EN/SW), Caption (EN/SW), Category, Public/Private toggle, Safeguarding clearance flag.
- **File Replacement & Safe Reference-Checked Deletion**.

### Module 8: Partners & Institutional Donors Management
- Manage partner name, partner type (`institutional_donor`, `foundation`, `implementing`, `government`, `network`), logo selection, EN/SW description, **Partnership Case Study / Track Record summary** (inspired by `streetchildren.org/institutional-donors-and-foundations/`), website link, display order, and active/inactive visibility toggle.

### Module 9: Resources and Publications
- Manage downloadable documents across categories (`Reports`, `Annual Reports`, `Research Publications`, `Policies`, `Safeguarding Policies`, `Guidelines`, `Educational Materials`, `Other`).
- Link to underlying PDF/Office document in Media Library, optional cover image, publication year, EN/SW title and description, and publication status.

### Module 10: Impact and Statistics (MEL Module)
- Inspired by Asante Africa's MEL dashboard and BAO's *Reach & Outcomes* section:
  - Create and manage `impact_indicators` (Name EN/SW, Unit EN/SW, Suffix e.g. `+` or `k+`, Linked Programme/Project, Visualization Type: `Animated Count-Up Stat Card`, `Bar Chart`, `Line Chart`, `Table`).
  - Add verified `impact_records` per reporting period with numeric values, geographic scope, and optional verification document link.

### Module 11: Navigation Menus
- Visual tree editor for `main_header`, `footer_primary`, and `footer_policies`.
- Supports **BizyTech-style descriptive dropdown items** (`Label EN/SW` + optional `Description Subtitle EN/SW` + `URL/Page Link`).

### Module 12: Website Settings
- Manage organization name, registration number (`00NGO/R2/000001`), tagline (EN/SW), official address, phone numbers, email addresses, working hours, social media links, YouTube channel URL, default SEO metadata, and configurable upload size limits.

### Module 13: Contact Messages & Volunteer Inquiries
- View, filter (`unread`, `read`, `responded`, `archived`), add internal handling notes, and manage public Contact Form submissions (including Subject categories: *General Inquiry*, *Partnership Proposal*, *Institutional Donor Inquiry*, *Volunteering*, *Safeguarding Concern*, *Annual Reports*) and Volunteer applications.

### Module 14: User Management
- Create/invite BAO staff accounts, assign roles, activate/deactivate accounts, and view login activity.

### Module 15: Roles and Permissions
- Inspect and manage the 6 RBAC roles (`Super Administrator`, `Website Administrator`, `Editor`, `Contributor`, `Media Manager`, `Viewer`).

### Module 16: Activity Logs
- Searchable, filterable audit trail displaying Actor, Action, Module/Entity, IP Address, Timestamp, and JSON metadata diff.
