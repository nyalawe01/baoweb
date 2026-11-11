-- =============================================================================
-- MIGRATION 0001: BABAWATOTO ORGANIZATION WEBSITE & CMS INITIAL SCHEMA
-- Normalized PostgreSQL 17 Schema (31 Core Tables)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE public.publication_status AS ENUM (
        'draft',
        'pending_review',
        'approved',
        'scheduled',
        'published',
        'archived'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE public.language_code AS ENUM ('en', 'sw');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Updated_at trigger helper
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SECTION A: IDENTITY, ROLES & PERMISSIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    job_title TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    is_system_role BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    module TEXT NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- =============================================================================
-- SECTION B: MEDIA & STORAGE MANAGEMENT
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_filename TEXT NOT NULL,
    generated_filename TEXT UNIQUE NOT NULL,
    file_extension TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes >= 0),
    storage_provider TEXT NOT NULL DEFAULT 'cpanel_local',
    storage_key TEXT UNIQUE NOT NULL,
    public_url TEXT,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'document', 'video')),
    category TEXT NOT NULL DEFAULT 'organization',
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
    width INTEGER,
    height INTEGER,
    title_en TEXT,
    title_sw TEXT,
    alt_text_en TEXT,
    alt_text_sw TEXT,
    caption_en TEXT,
    caption_sw TEXT,
    safeguarding_cleared BOOLEAN NOT NULL DEFAULT false,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.content_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE RESTRICT,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('page', 'programme', 'project', 'article', 'story', 'event', 'partner', 'resource')),
    entity_id UUID NOT NULL,
    usage_role TEXT NOT NULL DEFAULT 'gallery',
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_media_entity ON public.content_media(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_category ON public.media_assets(category, visibility);

-- =============================================================================
-- SECTION C: DYNAMIC PAGES & CONTROLLED PAGE BUILDER
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_key TEXT UNIQUE NOT NULL,
    template TEXT NOT NULL DEFAULT 'standard' CHECK (template IN ('home', 'standard', 'programme', 'contact', 'policy', 'landing')),
    parent_page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
    status public.publication_status NOT NULL DEFAULT 'draft',
    featured_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.page_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    language public.language_code NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    subtitle TEXT,
    hero_tag TEXT,
    excerpt TEXT,
    blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    seo_title TEXT,
    seo_description TEXT,
    og_image_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
    translation_status public.publication_status NOT NULL DEFAULT 'draft',
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (page_id, language),
    UNIQUE (language, slug)
);

CREATE TABLE IF NOT EXISTS public.page_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    language public.language_code NOT NULL,
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    blocks_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
    status_at_snapshot public.publication_status NOT NULL,
    change_note TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_translations_slug ON public.page_translations(language, slug);

-- =============================================================================
-- SECTION D: PROGRAMMES MANAGEMENT
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.programmes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    icon_name TEXT NOT NULL DEFAULT 'Shield',
    category_tag TEXT NOT NULL DEFAULT 'protection',
    featured_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
    showcase_video_ids TEXT[] NOT NULL DEFAULT '{}',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    status public.publication_status NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.programme_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    programme_id UUID NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
    language public.language_code NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    slug TEXT NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
    key_focus_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
    activities JSONB NOT NULL DEFAULT '[]'::jsonb,
    target_beneficiaries TEXT,
    geographic_coverage TEXT,
    primary_outcomes TEXT,
    seo_title TEXT,
    seo_description TEXT,
    translation_status public.publication_status NOT NULL DEFAULT 'draft',
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (programme_id, language),
    UNIQUE (language, slug)
);

CREATE INDEX IF NOT EXISTS idx_programmes_status_order ON public.programmes(status, display_order);

-- =============================================================================
-- SECTION E: PROJECTS MANAGEMENT
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_code TEXT UNIQUE,
    programme_id UUID REFERENCES public.programmes(id) ON DELETE SET NULL,
    project_status TEXT NOT NULL DEFAULT 'ongoing' CHECK (project_status IN ('planned', 'ongoing', 'completed')),
    category_tag TEXT,
    start_date DATE,
    end_date DATE,
    implementing_partners TEXT[] NOT NULL DEFAULT '{}',
    donors TEXT[] NOT NULL DEFAULT '{}',
    featured_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    status public.publication_status NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    language public.language_code NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
    location TEXT,
    public_beneficiary_summary TEXT,
    seo_title TEXT,
    seo_description TEXT,
    translation_status public.publication_status NOT NULL DEFAULT 'draft',
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (project_id, language),
    UNIQUE (language, slug)
);

CREATE TABLE IF NOT EXISTS public.project_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title_en TEXT NOT NULL,
    title_sw TEXT,
    description_en TEXT,
    description_sw TEXT,
    activity_date DATE,
    location TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status, project_status, is_featured);

-- =============================================================================
-- SECTION F: NEWS, EVENTS & STORIES OF CHANGE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.article_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_sw TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type TEXT NOT NULL DEFAULT 'news' CHECK (content_type IN ('news', 'event')),
    category_id UUID REFERENCES public.article_categories(id) ON DELETE SET NULL,
    featured_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    event_start_at TIMESTAMPTZ,
    event_end_at TIMESTAMPTZ,
    event_location TEXT,
    event_registration_url TEXT,
    event_status TEXT CHECK (event_status IS NULL OR event_status IN ('upcoming', 'ongoing', 'past', 'cancelled')),
    status public.publication_status NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.article_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    language public.language_code NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    body TEXT NOT NULL,
    event_registration_info TEXT,
    seo_title TEXT,
    seo_description TEXT,
    translation_status public.publication_status NOT NULL DEFAULT 'draft',
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (article_id, language),
    UNIQUE (language, slug)
);

CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    programme_id UUID REFERENCES public.programmes(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    featured_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
    has_written_consent BOOLEAN NOT NULL DEFAULT false,
    consent_document_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
    uses_pseudonym BOOLEAN NOT NULL DEFAULT true,
    safeguarding_review_status TEXT NOT NULL DEFAULT 'pending' CHECK (safeguarding_review_status IN ('pending', 'approved', 'rejected')),
    safeguarding_reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    safeguarding_reviewed_at TIMESTAMPTZ,
    safeguarding_notes TEXT,
    status public.publication_status NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_stories_safeguarding_before_publish CHECK (
        status <> 'published' OR (has_written_consent = true AND safeguarding_review_status = 'approved')
    )
);

CREATE TABLE IF NOT EXISTS public.story_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    language public.language_code NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    summary TEXT NOT NULL,
    full_story TEXT NOT NULL,
    beneficiary_display_name TEXT,
    location TEXT,
    seo_title TEXT,
    seo_description TEXT,
    translation_status public.publication_status NOT NULL DEFAULT 'draft',
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (story_id, language),
    UNIQUE (language, slug)
);

-- =============================================================================
-- SECTION G: PARTNERS, RESOURCES & TEAM
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
    partner_type TEXT NOT NULL DEFAULT 'institutional_donor' CHECK (partner_type IN ('institutional_donor', 'foundation', 'implementing', 'government', 'network', 'corporate')),
    description_en TEXT,
    description_sw TEXT,
    partnership_focus_en TEXT,
    partnership_focus_sw TEXT,
    deliverables_summary_en TEXT,
    deliverables_summary_sw TEXT,
    website_url TEXT,
    is_featured_case_study BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_category TEXT NOT NULL CHECK (resource_category IN ('report', 'annual_report', 'research', 'policy', 'safeguarding', 'guideline', 'educational', 'other')),
    file_media_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE RESTRICT,
    cover_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
    programme_id UUID REFERENCES public.programmes(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    title_en TEXT NOT NULL,
    title_sw TEXT,
    slug TEXT UNIQUE NOT NULL,
    description_en TEXT,
    description_sw TEXT,
    publication_year INTEGER,
    status public.publication_status NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    download_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    group_type TEXT NOT NULL DEFAULT 'leadership' CHECK (group_type IN ('board', 'leadership', 'staff')),
    role_title_en TEXT NOT NULL,
    role_title_sw TEXT,
    bio_en TEXT,
    bio_sw TEXT,
    photo_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
    linkedin_url TEXT,
    twitter_url TEXT,
    email TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    status public.publication_status NOT NULL DEFAULT 'draft',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- SECTION H: IMPACT & STATISTICS (MEL)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.impact_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_sw TEXT,
    description_en TEXT,
    description_sw TEXT,
    measurement_unit_en TEXT NOT NULL,
    measurement_unit_sw TEXT,
    value_suffix TEXT DEFAULT '+',
    programme_id UUID REFERENCES public.programmes(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    chart_type TEXT NOT NULL DEFAULT 'stat_card' CHECK (chart_type IN ('stat_card', 'bar', 'line', 'area', 'table')),
    is_featured_on_home BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    status public.publication_status NOT NULL DEFAULT 'draft',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.impact_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    indicator_id UUID NOT NULL REFERENCES public.impact_indicators(id) ON DELETE CASCADE,
    reporting_period TEXT NOT NULL,
    numeric_value NUMERIC(15, 2) NOT NULL,
    geographic_location TEXT,
    verification_source TEXT,
    verification_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
    status public.publication_status NOT NULL DEFAULT 'draft',
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- SECTION I: NAVIGATION, SETTINGS, PUBLIC SUBMISSIONS & GOVERNANCE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    label_en TEXT NOT NULL,
    label_sw TEXT NOT NULL,
    description_en TEXT,
    description_sw TEXT,
    url_path TEXT NOT NULL,
    page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    open_in_new_tab BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT true,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    sender_phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'responded', 'archived')),
    handled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.volunteer_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    area_of_interest TEXT NOT NULL,
    motivation TEXT NOT NULL,
    cv_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'closed')),
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.publication_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    language public.language_code,
    submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    decision TEXT NOT NULL CHECK (decision IN ('submitted', 'approved', 'rejected')),
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_email TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- Attach updated_at triggers
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'profiles', 'media_assets', 'pages', 'page_translations',
        'programmes', 'programme_translations', 'projects', 'project_translations',
        'articles', 'article_translations', 'stories', 'story_translations',
        'partners', 'resources', 'team_members', 'impact_indicators',
        'impact_records', 'menus', 'site_settings', 'contact_messages',
        'volunteer_applications'
    ]
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I;', tbl);
        EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();', tbl);
    END LOOP;
END $$;

