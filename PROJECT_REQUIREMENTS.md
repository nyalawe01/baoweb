# PROJECT REQUIREMENTS: BABAWATOTO ORGANIZATION WEBSITE & CUSTOM CMS

## 1. Executive Summary & Project Objective
The objective of this project is to build a complete, production-ready, custom database-driven website and administrative content management system (CMS) for **Babawatoto Organization (BAO)**.

The system comprises two connected yet logically separated applications:
1. **Public Website (`babawatoto.or.tz`)**: A responsive, accessible, bilingual (English & Kiswahili) NGO website presenting BAO's identity, programmes, projects, institutional partnership track record, impact statistics, stories of change, news, events, and publications.
2. **Administrative CMS (`cms.babawatoto.or.tz`)**: A secure, role-based administration platform allowing non-technical BAO staff to author, upload, review, translate, schedule, and publish all website content without modifying source code.

---

## 2. Core Principles & Content Integrity Rules
1. **Zero Fictional Content**: No organizational data, projects, statistics, partner logos, testimonials, photographs, or achievements may be fabricated or hardcoded in source files.
2. **Database-Driven Rendering**: Every dynamic content section on the public website must query published records from the Supabase PostgreSQL database.
3. **Polished Empty States & Controlled Seeding**:
   - The website must render professionally designed empty-state placeholders whenever a database table or section has no published records.
   - Only verified organizational structure (navigation menus, page routes, and if requested, a controlled migration script importing existing verified data from the live `babawatoto.or.tz` website as editable CMS records) may be seeded.
4. **Non-Destructive Development**: The existing live website at `babawatoto.or.tz` (`/home/babawatotoor/public_html`) must remain untouched and operational until the new platform is fully verified and approved for cutover.
5. **Bilingual First-Class Support**: English (`en`) and Kiswahili (`sw`) translations must be independently authored, reviewed, and published without automated machine-fabricated Kiswahili text.

---

## 3. Audit of Current Live Website (`https://babawatoto.or.tz/`)

An inspection of the live static website (`index.html`, `pages/about.html`, `pages/programs.html`, `pages/contact.html`, `assets/js/main.js`, `assets/css/styles.css`) revealed the following authentic organizational profile and structure:

### 3.1 Verified Organizational Identity & Legal Status
- **Organization Name**: Babawatoto Organization (BAO) — Swahili for *"Father of the Children"*.
- **Establishment & Legal Registration**: First established in **2006** as a Board of Trustees; re-registered in **2019** under the Ministry of Community Development, Children, Elders and Special Groups with registration number **`00NGO/R2/000001`**.
- **Vision**: *"A society where children and youth enjoy their rights and live in dignity, free from all forms of abuse and exploitation."*
- **Mission**: *"To promote and protect the rights of children and youth through advocacy, education, and community empowerment programs that address the root causes of vulnerability and create sustainable change."*
- **Mandate**: To promote the rights and fight against all elements that lead children to become vulnerable and empower youth to improve their lives by engaging people through the power of communication, arts, sports, and culture.
- **Core Philosophy**:
  - *Shared Responsibility*: Gender equality and equity—mutual commitment from both men and women without pushing blame.
  - *Rights & Accountability*: Strengthening local accountability and establishing safer environments for children and youth.
- **Official Contact & Headquarters**:
  - **Address**: P.O. Box 8293, Morogoro Road, Mbezi Kwa Msuguri, St. Anne Marie Street, House No. 27, Dar es Salaam, Tanzania
  - **Phones**: `+255 651 136502` / `+255 651 136504`
  - **Email**: `info@babawatoto.or.tz`
  - **Working Hours**: Mon – Fri: 8:00 AM – 5:00 PM
  - **Social Channels**: Facebook (`groups/3551680445156661`), Instagram (`@babawatoto_organization`), X/Twitter (`@babawatotoorga1`), YouTube (`@babawatotoorganization`, featuring showcase videos `FgXXMyMLF9k`, `R09iiZAHiFs`, `pdx8DWYJM_o`).
- **Leadership Team on Live Site**:
  - **Mgunga Mwamnyenyelwa** — Founder & Executive Director
  - **Lugano Maclean** — Project Coordinator

### 3.2 Existing Thematic Programmes & Active Projects on Live Site
The current `babawatoto.or.tz` presents 7 thematic areas (`pages/programs.html`) alongside the 6 core pillars defined in the master specification:
1. **Child Protection & Ethics** (*Safe Play Spaces, Safeguarding Committee Training, Family Guidance & Counseling*)
2. **Social Arts & Culture / HEART and Creative Arts** (*Community Theatre & Street Drama, Youth Music & Dance Coaching, Fine Arts & Painting*)
3. **Education & Vocational Skills Training** (*Tailoring & Fashion Design, Carpentry & Woodwork, Welding & Metal Fabrication at BAO Youth Centre*)
4. **Youth Empowerment & Civic Engagement** (*Entrepreneurship Bootcamps, Digital Literacy & IT Training, Civic Leadership Clubs*)
5. **ASRH, Well-being & Behaviour Change Communication** (*ASRH Workshops, Mobile Referral Clinics, Peer Educator Networks*)
6. **Humanitarian Response, Conservation & Clean Energy** (*Food Security & Nutrition, Hygiene Kits, Emergency Relocation, Afforestation & Clean Cookstoves*)
7. **Advocacy and Consultancy** (*Child Rights Governance, Community Accountability & Institutional Capacity Building*)

- **Active Projects Highlighted on Live Site**:
  - **AHADI Project** (Multi-year initiative supporting children and youth through protection, education, and community strengthening)
  - **Child Protection & Support** (Strengthening safeguarding mechanisms and psychosocial support services)
  - **Vocational & Life Skills** (Employability and mentorship at BAO Youth Centre)
- **Institutional Partners Displayed on Live Site**:
  - Danish Refugee Council (DRC), Jesuit Refugee Service (JRS), Goethe-Institut, USAID, Pact, World Vision, Save the Children, Plan International, UNICEF, International Rescue Committee (IRC).

---

## 4. Reference Websites Analysis & Component Mapping

We analyzed the five benchmark websites you provided and mapped their strongest structural, layout, and UX patterns directly into the BAO Website & CMS design:

| Reference Site | Key Layout & Component Patterns Adopted for BAO |
| :--- | :--- |
| **1. World Vision Tanzania (`wvi.org/tanzania`)** | • **Core Pillars Icon Grid**: Clean 3-column thematic sector cards with custom SVG/Lucide line icons, uppercase tracking titles, and concise descriptions.<br>• **Video Showcase Carousel**: Interactive documentary video player with custom play button overlay, slide counter (`1 / 3`), and YouTube channel integration.<br>• **Geographic Reach & Field Stories**: Highlighting community-level interventions across wards/regions. |
| **2. BizyTech (`bizytech.com`)** | • **Card-Style Mega-Menu Dropdowns**: Navigation dropdowns where each link displays a **Title + 1-line Subtitle Description + Right Chevron badge** (`About BAO`, `Mission & Vision`, `Meet Our Team`, etc.).<br>• **Contextual Sticky Breadcrumb Bar**: Clean secondary breadcrumb strip on inner pages.<br>• **Featured Split Case-Study Card**: 2-column bordered feature box (`image left + bold title, summary, and pill CTA button right`).<br>• **Tag-Filtered News & Articles Cards**: Equal-height cards with category badges, publication dates, 3-line clamp excerpts, and "Read More ->" transitions. |
| **3. Consortium for Street Children (`streetchildren.org/institutional-donors-and-foundations/`)** | • **Institutional Donors & Foundations Track Record Layout**: Dedicated section/template under *Partners & Get Involved* showcasing **Partnership Case-Study Blocks** (Donor Name/Logo + Project Focus + Delivery Model + Measurable Outcomes) to build high trust with institutional grant-makers (UNICEF, USAID, DRC, etc.). |
| **4. Asante Africa Foundation (`asanteafrica.org`)** | • **Evidence-Based MEL & Impact Architecture**: Pairing quantitative reach metrics with qualitative outcomes, multi-year reporting periods, and downloadable verification/audit reports.<br>• **Programmatic Sub-Pillars**: Structuring each programme page into *Overview*, *Key Focus Areas (Checklists)*, *Target Beneficiaries*, and *Primary Outcomes*. |
| **5. Save the Children Tanzania (`savethechildren.net/tanzania`)** | • **Humanitarian Editorial Hierarchy**: High-impact documentary hero banner, clear country/community context, prominent **Child Safeguarding & Reporting** links in the footer, and structured **Resources, Publications & Tenders/Opportunities** listings. |

---

## 5. Public Website Sitemap & Navigation Structure

### 5.1 Main Header Navigation (with BizyTech-Style Descriptive Dropdown Cards)
1. **Home** (`/`)
2. **About Us** (`/about`)
   - **Who We Are & Our Journey** (`/about/who-we-are`) — *Our mandate, philosophy, and registration since 2006*
   - **Mission, Vision & Philosophy** (`/about/mission-and-vision`) — *Guiding principles of shared responsibility and child dignity*
   - **Our History** (`/about/our-history`) — *Milestones from community response to national NGO*
   - **Leadership and Governance** (`/about/leadership-and-governance`) — *Board of Trustees, accountability, and organizational structure*
   - **Our Team** (`/about/our-team`) — *Executive leadership and programme coordinators*
3. **Our Work (Programmes)** (`/programmes`)
   - **Child Protection & Ethics** (`/programmes/child-protection`)
   - **Education & Vocational Skills** (`/programmes/education`)
   - **HEART, Social Arts & Culture** (`/programmes/heart-and-creative-arts`)
   - **Youth Empowerment & Civic Engagement** (`/programmes/youth-empowerment`)
   - **ASRH & Behaviour Change Communication** (`/programmes/behaviour-change-communication`)
   - **Humanitarian, Conservation & Clean Energy** (`/programmes/humanitarian-and-conservation`)
   - **Advocacy and Consultancy** (`/programmes/advocacy-and-consultancy`)
   *(All programme items are 100% CMS-managed so staff can add, rename, reorder, or archive programmes anytime.)*
4. **Projects** (`/projects` and `/projects/:slug`)
5. **Our Impact** (`/impact`) — *Reach & Outcomes metrics, interactive charts, and MEL verification reports*
6. **Stories of Change** (`/stories` and `/stories/:slug`)
7. **News & Events** (`/news-events`, `/news/:slug`, `/events/:slug`)
8. **Resources & Publications** (`/resources`) — *Annual reports, policies, research, and guidelines*
9. **Get Involved** (`/get-involved`) — *Institutional Donors & Foundations (CSC layout), Volunteering, and Partnerships*
10. **Contact Us** (`/contact`)
- **Header Utility Controls**: Language Switcher (`EN` | `SW`), Search trigger, and Primary CTA Button (`Partner With Us`).
- **Footer Policy Navigation**: Child Safeguarding Policy & Reporting, Privacy Policy, Accessibility Statement, Terms of Use.
