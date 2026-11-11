import { z } from 'zod';

// =============================================================================
// 1. CORE ENUMS & CONSTANTS
// =============================================================================

export const PUBLICATION_STATUSES = [
  'draft',
  'pending_review',
  'approved',
  'scheduled',
  'published',
  'archived',
] as const;

export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export const LANGUAGE_CODES = ['en', 'sw'] as const;
export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export const SYSTEM_ROLES = [
  'super_admin',
  'website_admin',
  'editor',
  'contributor',
  'media_manager',
  'viewer',
] as const;

export type SystemRoleSlug = (typeof SYSTEM_ROLES)[number];

export const PERMISSION_CODES = [
  'dashboard.view',
  'content.view_drafts',
  'pages.create_edit',
  'pages.publish',
  'pages.delete',
  'programmes.create_edit',
  'programmes.publish',
  'projects.create_edit',
  'projects.publish',
  'projects.delete',
  'articles.create_edit',
  'articles.publish',
  'articles.delete',
  'stories.create_edit',
  'stories.safeguarding_approve',
  'stories.publish',
  'partners.manage',
  'resources.create_edit',
  'resources.publish',
  'impact.create_edit',
  'impact.publish',
  'media.upload',
  'media.edit_metadata',
  'media.replace',
  'media.delete',
  'media.view_private',
  'menus.manage',
  'settings.manage',
  'messages.manage',
  'users.manage',
  'roles.manage',
  'audit_logs.view',
] as const;

export type PermissionCode = (typeof PERMISSION_CODES)[number];

export const MEDIA_CATEGORIES = [
  'organization',
  'programmes',
  'projects',
  'staff',
  'stories',
  'events',
  'partners',
  'reports',
  'publications',
  'policies',
  'resources',
] as const;

export type MediaCategory = (typeof MEDIA_CATEGORIES)[number];

// =============================================================================
// 2. CONTROLLED PAGE BUILDER BLOCKS (16 BLOCK TYPES)
// =============================================================================

export const PAGE_BLOCK_TYPES = [
  'heading',
  'rich_text',
  'single_image',
  'image_gallery',
  'image_and_text',
  'two_column_layout',
  'three_column_layout',
  'video_embed',
  'statistics',
  'project_cards',
  'programme_cards',
  'partner_logos',
  'downloadable_documents',
  'call_to_action',
  'divider',
  'spacer',
] as const;

export type PageBlockType = (typeof PAGE_BLOCK_TYPES)[number];

export const PageBlockSchema = z.object({
  id: z.string().min(1),
  type: z.enum(PAGE_BLOCK_TYPES),
  data: z.record(z.any()),
});

export type PageBlock = z.infer<typeof PageBlockSchema>;

// =============================================================================
// 3. ZOD VALIDATION SCHEMAS FOR API & FORMS
// =============================================================================

export const ContactSubmissionSchema = z.object({
  sender_name: z.string().trim().min(2, 'Full name is required').max(120),
  sender_email: z.string().trim().email('Enter a valid email address').max(160),
  sender_phone: z.string().trim().max(40).optional().or(z.literal('')),
  subject: z.string().trim().min(2, 'Subject is required').max(160),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(5000),
  website: z.string().max(0).optional(), // Honeypot field
});

export type ContactSubmissionInput = z.infer<typeof ContactSubmissionSchema>;

export const VolunteerApplicationSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name is required').max(120),
  email: z.string().trim().email('Enter a valid email address').max(160),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  area_of_interest: z.string().trim().min(2, 'Area of interest is required').max(160),
  motivation: z.string().trim().min(15, 'Please share a brief motivation statement').max(5000),
});

export type VolunteerApplicationInput = z.infer<typeof VolunteerApplicationSchema>;

export const ProgrammeTranslationInputSchema = z.object({
  language: z.enum(LANGUAGE_CODES),
  title: z.string().trim().min(2).max(200),
  subtitle: z.string().trim().max(240).optional().nullable(),
  slug: z.string().trim().min(2).max(200),
  short_description: z.string().trim().min(5).max(1000),
  full_description: z.string().trim().min(5),
  objectives: z.array(z.string()).default([]),
  key_focus_areas: z.array(z.string()).default([]),
  activities: z.array(z.string()).default([]),
  target_beneficiaries: z.string().optional().nullable(),
  geographic_coverage: z.string().optional().nullable(),
  primary_outcomes: z.string().optional().nullable(),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
  translation_status: z.enum(PUBLICATION_STATUSES).default('draft'),
});

export const ProgrammeUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().trim().min(2).max(100),
  icon_name: z.string().trim().default('Shield'),
  category_tag: z.string().trim().default('protection'),
  featured_media_id: z.string().uuid().optional().nullable(),
  showcase_video_ids: z.array(z.string()).default([]),
  is_featured: z.boolean().default(false),
  display_order: z.number().int().default(0),
  status: z.enum(PUBLICATION_STATUSES).default('draft'),
  translations: z.array(ProgrammeTranslationInputSchema).min(1),
});

export const ProjectTranslationInputSchema = z.object({
  language: z.enum(LANGUAGE_CODES),
  title: z.string().trim().min(2).max(200),
  slug: z.string().trim().min(2).max(200),
  short_description: z.string().trim().min(5).max(1000),
  full_description: z.string().trim().min(5),
  objectives: z.array(z.string()).default([]),
  location: z.string().optional().nullable(),
  public_beneficiary_summary: z.string().optional().nullable(),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
  translation_status: z.enum(PUBLICATION_STATUSES).default('draft'),
});

export const ProjectUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  project_code: z.string().trim().optional().nullable(),
  programme_id: z.string().uuid().optional().nullable(),
  project_status: z.enum(['planned', 'ongoing', 'completed']).default('ongoing'),
  category_tag: z.string().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  implementing_partners: z.array(z.string()).default([]),
  donors: z.array(z.string()).default([]),
  featured_media_id: z.string().uuid().optional().nullable(),
  is_featured: z.boolean().default(false),
  display_order: z.number().int().default(0),
  status: z.enum(PUBLICATION_STATUSES).default('draft'),
  translations: z.array(ProjectTranslationInputSchema).min(1),
});

export const StoryTranslationInputSchema = z.object({
  language: z.enum(LANGUAGE_CODES),
  title: z.string().trim().min(2).max(200),
  slug: z.string().trim().min(2).max(200),
  summary: z.string().trim().min(5).max(1000),
  full_story: z.string().trim().min(10),
  beneficiary_display_name: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
  translation_status: z.enum(PUBLICATION_STATUSES).default('draft'),
});

export const StoryUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  programme_id: z.string().uuid().optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  featured_media_id: z.string().uuid().optional().nullable(),
  has_written_consent: z.boolean().default(false),
  consent_document_media_id: z.string().uuid().optional().nullable(),
  uses_pseudonym: z.boolean().default(true),
  safeguarding_review_status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  safeguarding_notes: z.string().optional().nullable(),
  status: z.enum(PUBLICATION_STATUSES).default('draft'),
  translations: z.array(StoryTranslationInputSchema).min(1),
}).refine(
  (data) =>
    data.status !== 'published' ||
    (data.has_written_consent === true && data.safeguarding_review_status === 'approved'),
  {
    message:
      'Safeguarding Violation: A Story of Change cannot be published until written consent is confirmed and safeguarding review is approved.',
    path: ['status'],
  }
);

// =============================================================================
// 4. BILINGUAL UI DICTIONARY (STATIC NAVIGATION & EMPTY STATE LABELS ONLY)
// Zero fictional organizational content — strictly UI chrome and empty-state guidance
// =============================================================================

export const UI_DICTIONARY = {
  en: {
    partnerWithUs: 'Partner With Us',
    becomeVolunteer: 'Become a Volunteer',
    learnMore: 'Learn More',
    viewDetails: 'View Details',
    backToAllProgrammes: 'Back to All Programmes',
    backToProjects: 'Back to All Projects',
    readFullStory: 'Read Story',
    readArticle: 'Read Article',
    downloadResource: 'Download Document',
    whatWeDo: 'What We Do',
    whatWeDoSub: 'Core thematic pillars designed to foster long-term community resilience',
    activeProjects: 'Active Projects',
    reachAndOutcomes: 'Reach & Outcomes',
    reachAndOutcomesSub: 'Guided by transparency, rigorous monitoring, and real community transformation.',
    latestVideos: 'Latest Documentary & Field Videos',
    subscribeYoutube: 'Subscribe on YouTube',
    trustedPartners: 'Trusted By Leading Global & Institutional Organizations',
    latestNewsEvents: 'Latest News & Upcoming Events',
    storiesOfChange: 'Stories of Change',
    resourcesPublications: 'Resources & Publications',
    emptyStates: {
      programmesTitle: 'Programmes Currently Being Updated',
      programmesDesc: 'Authorized BAO staff have not yet published programme descriptions for this section. Once published in the CMS, programme pillars will appear here automatically.',
      projectsTitle: 'No Published Projects Yet',
      projectsDesc: 'Project records are currently in preparation inside the BAO Content Management System. Check back soon for verified project profiles.',
      impactTitle: 'Impact Indicators Awaiting Publication',
      impactDesc: 'Babawatoto Organization only displays verified Monitoring, Evaluation, and Learning (MEL) indicators approved through our CMS.',
      storiesTitle: 'No Stories of Change Published Yet',
      storiesDesc: 'Field stories appear here once they pass BAO consent and child-safeguarding review in the CMS.',
      newsTitle: 'No News Articles or Events Published Yet',
      newsDesc: 'Organizational news updates, press releases, and community events will appear here as soon as they are published by BAO editors.',
      partnersTitle: 'Partner Directory Awaiting Publication',
      partnersDesc: 'Institutional donors, foundations, and implementing partners will be displayed here once activated in the CMS.',
      resourcesTitle: 'No Publications or Reports Uploaded Yet',
      resourcesDesc: 'Annual reports, safeguarding policies, research publications, and guidelines will be listed here once published.',
      teamTitle: 'Leadership & Team Profiles Awaiting Publication',
      teamDesc: 'Board of Trustees and leadership profiles will appear here once published in the CMS.',
      pageTitle: 'Page Content Under Preparation',
      pageDesc: 'This page structure is active. Content blocks will appear automatically once published by authorized BAO staff.',
    },
  },
  sw: {
    partnerWithUs: 'Shirikiana Nasi',
    becomeVolunteer: 'Jitolee Nasi',
    learnMore: 'soma Zaidi',
    viewDetails: 'Tazama Maelezo',
    backToAllProgrammes: 'Rudi Kwenye Programu Zote',
    backToProjects: 'Rudi Kwenye Miradi Yote',
    readFullStory: 'Soma Simulizi',
    readArticle: 'Soma Habari',
    downloadResource: 'Pakua Nyaraka',
    whatWeDo: 'Tunachokifanya',
    whatWeDoSub: 'Nguzo kuu za programu zinazolenga kujenga ustawi na ustahimilivu wa jamii',
    activeProjects: 'Miradi Inayoendelea',
    reachAndOutcomes: 'Ufikiaji na Matokeo Yetu',
    reachAndOutcomesSub: 'Kazi zetu zinaongozwa na uwazi, ufuatiliaji makini na mabadiliko halisi katika jamii.',
    latestVideos: 'Video za Shughuli Zetu',
    subscribeYoutube: 'Jiunge Nasi YouTube',
    trustedPartners: 'Washirika na Wafadhili Wetu',
    latestNewsEvents: 'Habari na Matukio ya Karibuni',
    storiesOfChange: 'Simulizi za Mabadiliko',
    resourcesPublications: 'Ripoti na Machapisho',
    emptyStates: {
      programmesTitle: 'Taarifa za Programu Zinaboreshwa',
      programmesDesc: 'Wafanyakazi wa BAO bado hawajachapisha programu katika sehemu hii. Zitaonekana hapa mara tu zitakapochapishwa kwenye mfumo wa CMS.',
      projectsTitle: 'Hakuna Miradi Iliyochapishwa Kwa Sasa',
      projectsDesc: 'Taarifa za miradi zinaandaliwa katika mfumo wa CMS wa BAO na zitaonekana hapa pindi zitakapoidhinishwa.',
      impactTitle: 'Takwimu za Matokeo Zinasubiri Uidhinishaji',
      impactDesc: 'Shirika la Babawatoto huonyesha takwimu zilizohakikiwa na kuidhinishwa pekee.',
      storiesTitle: 'Hakuna Simulizi za Mabadiliko Zilizochapishwa',
      storiesDesc: 'Simulizi za jamii zitaonekana hapa baada ya kupitia uhakiki wa ridhaa na ulinzi wa mtoto.',
      newsTitle: 'Hakuna Habari au Matukio Yaliyochapishwa',
      newsDesc: 'Habari za shirika na matukio ya jamii yataonekana hapa mara tu yatakapochapishwa.',
      partnersTitle: 'Orodha ya Washirika Inasubiri Kuchapishwa',
      partnersDesc: 'Nembo na taarifa za wafadhili na washirika zitaonekana hapa baada ya kuwekwa kwenye mfumo wa CMS.',
      resourcesTitle: 'Hakuna Machapisho au Ripoti Zilizowekwa',
      resourcesDesc: 'Ripoti za mwaka, sera za ulinzi wa mtoto na miongozo itaonekana hapa baada ya kuchapishwa.',
      teamTitle: 'Wasifu wa Viongozi na Timu Unasubiri Kuchapishwa',
      teamDesc: 'Wasifu wa Bodi ya Wadhamini na viongozi wa BAO utaonekana hapa pindi utakapochapishwa.',
      pageTitle: 'Maudhui ya Ukurasa Huu Yanaandaliwa',
      pageDesc: 'Muundo wa ukurasa huu uko tayari. Maudhui yataonekana mara tu yatakapochapishwa kupitia CMS.',
    },
  },
} as const;

export const PERMISSIONS = PERMISSION_CODES;

export const contactSubmissionSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name is required').max(120),
  email: z.string().trim().email('Enter a valid email address').max(160),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  organization: z.string().trim().max(160).optional().or(z.literal('')),
  subject: z.string().trim().min(2, 'Subject is required').max(160),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(5000),
  honeypot: z.string().max(0, 'Bot honeypot triggered').optional(),
});

export const volunteerSubmissionSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(5).max(40),
  country_city: z.string().trim().min(2).max(160),
  area_of_interest: z.string().trim().min(2).max(160),
  skills_summary: z.string().trim().min(10).max(2000),
  availability: z.string().trim().min(2).max(160),
  motivation: z.string().trim().min(15).max(5000),
  safeguarding_pledge_accepted: z.literal(true),
  honeypot: z.string().max(0, 'Bot honeypot triggered').optional(),
});

export const storyUpsertSchema = z
  .object({
    id: z.string().uuid().optional(),
    programme_id: z.string().uuid().optional().nullable(),
    featured_image_id: z.string().uuid().optional().nullable(),
    safeguarding_cleared: z.boolean().default(false),
    consent_verified: z.boolean().default(false),
    use_pseudonym: z.boolean().default(true),
    status: z.enum(PUBLICATION_STATUSES).default('draft'),
    translations: z.record(
      z.object({
        title: z.string().min(2),
        slug: z.string().min(2),
        excerpt: z.string().min(5),
        featured_quote: z.string().optional(),
        body_html: z.string().min(10),
      })
    ),
  })
  .refine(
    (d) =>
      d.status !== 'published' ||
      (d.safeguarding_cleared === true && d.consent_verified === true),
    {
      message:
        'Safeguarding Policy Violation: Stories cannot be published without both safeguarding_cleared and consent_verified.',
      path: ['status'],
    }
  );

export const UI_TRANSLATIONS = {
  en: {
    nav: {
      home: 'Home',
      aboutUs: 'About Us',
      whoWeAre: 'Who We Are',
      missionVision: 'Mission & Vision',
      ourHistory: 'Our History',
      leadershipGovernance: 'Leadership & Governance',
      ourTeam: 'Our Team',
      ourWork: 'Our Work',
      childProtection: 'Child Protection',
      education: 'Education (MEMKWA)',
      heartCreativeArts: 'HEART & Creative Arts',
      youthEmpowerment: 'Youth Empowerment',
      bcc: 'Behaviour Change Communication',
      advocacyConsultancy: 'Advocacy & Consultancy',
      projects: 'Projects',
      ourImpact: 'Our Impact',
      storiesOfChange: 'Stories of Change',
      newsAndEvents: 'News & Events',
      resources: 'Resources & Publications',
      getInvolved: 'Get Involved',
      contactUs: 'Contact Us',
    },
    common: {
      exploreWork: 'Explore Our Work',
      partnerWithUs: 'Partner With Us',
      viewAll: 'View All',
      learnMore: 'Learn More',
      readMore: 'Read More',
      submit: 'Submit Inquiry',
    },
    footer: {
      safeguardingPolicy: 'Child Safeguarding Policy',
      privacyPolicy: 'Privacy Policy',
      accessibility: 'Accessibility',
      termsOfUse: 'Terms of Use',
      rightsReserved: 'All Rights Reserved.',
      safeguardingNotice:
        'Zero tolerance for child abuse or exploitation. All content and photographs comply with the BAO Child Safeguarding Policy.',
    },
    emptyStates: {
      ...UI_DICTIONARY.en.emptyStates,
      eventsTitle: 'No Upcoming Events Scheduled Yet',
      eventsDesc: 'Community events and workshops will appear here once published in the CMS.',
      publicationsTitle: UI_DICTIONARY.en.emptyStates.resourcesTitle,
      publicationsDesc: UI_DICTIONARY.en.emptyStates.resourcesDesc,
    },
  },
  sw: {
    nav: {
      home: 'Mwanzo',
      aboutUs: 'Kuhusu Sisi',
      whoWeAre: 'Sisi ni Nani',
      missionVision: 'Dira na Dhamira',
      ourHistory: 'Historia Yetu',
      leadershipGovernance: 'Uongozi na Utawala',
      ourTeam: 'Timu Yetu',
      ourWork: 'Kazi Zetu',
      childProtection: 'Ulinzi wa Mtoto',
      education: 'Elimu (MEMKWA)',
      heartCreativeArts: 'Sanaa na Ubunifu (HEART)',
      youthEmpowerment: 'Uwezeshaji Vijana',
      bcc: 'Mawasiliano ya Mabadiliko ya Tabia',
      advocacyConsultancy: 'Utetezi na Ushauri',
      projects: 'Miradi',
      ourImpact: 'Matokeo Yetu',
      storiesOfChange: 'Simulizi za Mabadiliko',
      newsAndEvents: 'Habari na Matukio',
      resources: 'Machapisho na Ripoti',
      getInvolved: 'Shirikiana Nasi',
      contactUs: 'Wasiliana Nasi',
    },
    common: {
      exploreWork: 'Chunguza Kazi Zetu',
      partnerWithUs: 'Shirikiana Nasi',
      viewAll: 'Tazama Zote',
      learnMore: 'Jifunze Zaidi',
      readMore: 'Soma Zaidi',
      submit: 'Tuma Ujumbe',
    },
    footer: {
      safeguardingPolicy: 'Sera ya Ulinzi wa Mtoto',
      privacyPolicy: 'Sera ya Faragha',
      accessibility: 'Ufikikaji',
      termsOfUse: 'Masharti ya Matumizi',
      rightsReserved: 'Haki Zote Zimehifadhiwa.',
      safeguardingNotice:
        'Tunapinga vikali ukatili dhidi ya watoto. Picha na simulizi zote zimezingatia Sera ya Ulinzi wa Mtoto ya BAO.',
    },
    emptyStates: {
      ...UI_DICTIONARY.sw.emptyStates,
      eventsTitle: 'Hakuna Matukio Yaliyopangwa Kwa Sasa',
      eventsDesc: 'Matukio ya jamii na warsha zitaonekana hapa mara tu zitakapochapishwa.',
      publicationsTitle: UI_DICTIONARY.sw.emptyStates.resourcesTitle,
      publicationsDesc: UI_DICTIONARY.sw.emptyStates.resourcesDesc,
    },
  },
} as const;

export * from './verified-seed-data.js';


