-- =============================================================================
-- MIGRATION 0004: STAFF CONTEXT & CMS DASHBOARD METRICS RPC FUNCTIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_current_staff_context()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_profile RECORD;
    v_roles TEXT[];
    v_permissions TEXT[];
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT id, email, full_name, job_title, avatar_url, is_active, last_login_at
    INTO v_profile
    FROM public.profiles
    WHERE id = auth.uid();

    IF NOT FOUND OR v_profile.is_active = false THEN
        RETURN NULL;
    END IF;

    SELECT COALESCE(array_agg(DISTINCT r.slug), '{}')
    INTO v_roles
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_profile.id;

    IF 'super_admin' = ANY(v_roles) THEN
        SELECT COALESCE(array_agg(code), '{}') INTO v_permissions FROM public.permissions;
    ELSE
        SELECT COALESCE(array_agg(DISTINCT p.code), '{}')
        INTO v_permissions
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON rp.role_id = ur.role_id
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE ur.user_id = v_profile.id;
    END IF;

    RETURN jsonb_build_object(
        'id', v_profile.id,
        'email', v_profile.email,
        'full_name', v_profile.full_name,
        'job_title', v_profile.job_title,
        'avatar_url', v_profile.avatar_url,
        'is_active', v_profile.is_active,
        'roles', to_jsonb(v_roles),
        'permissions', to_jsonb(v_permissions)
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_cms_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total_pages INT;
    v_published_pages INT;
    v_draft_pages INT;
    v_total_programmes INT;
    v_published_programmes INT;
    v_total_projects INT;
    v_active_projects INT;
    v_published_news INT;
    v_upcoming_events INT;
    v_total_stories INT;
    v_published_stories INT;
    v_pending_safeguarding INT;
    v_total_media INT;
    v_total_media_bytes BIGINT;
    v_pending_reviews INT;
    v_unread_messages INT;
    v_active_partners INT;
    v_published_resources INT;
    v_published_indicators INT;
BEGIN
    IF NOT public.is_active_staff() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT COUNT(*),
           COUNT(*) FILTER (WHERE status = 'published'),
           COUNT(*) FILTER (WHERE status = 'draft')
    INTO v_total_pages, v_published_pages, v_draft_pages
    FROM public.pages;

    SELECT COUNT(*),
           COUNT(*) FILTER (WHERE status = 'published')
    INTO v_total_programmes, v_published_programmes
    FROM public.programmes;

    SELECT COUNT(*),
           COUNT(*) FILTER (WHERE project_status = 'ongoing' AND status = 'published')
    INTO v_total_projects, v_active_projects
    FROM public.projects;

    SELECT COUNT(*) FILTER (WHERE content_type = 'news' AND status = 'published'),
           COUNT(*) FILTER (WHERE content_type = 'event' AND status = 'published')
    INTO v_published_news, v_upcoming_events
    FROM public.articles;

    SELECT COUNT(*),
           COUNT(*) FILTER (WHERE status = 'published'),
           COUNT(*) FILTER (WHERE safeguarding_review_status = 'pending')
    INTO v_total_stories, v_published_stories, v_pending_safeguarding
    FROM public.stories;

    SELECT COUNT(*), COALESCE(SUM(file_size_bytes), 0)
    INTO v_total_media, v_total_media_bytes
    FROM public.media_assets;

    SELECT (
        (SELECT COUNT(*) FROM public.pages WHERE status = 'pending_review') +
        (SELECT COUNT(*) FROM public.programmes WHERE status = 'pending_review') +
        (SELECT COUNT(*) FROM public.projects WHERE status = 'pending_review') +
        (SELECT COUNT(*) FROM public.articles WHERE status = 'pending_review') +
        (SELECT COUNT(*) FROM public.stories WHERE status = 'pending_review')
    ) INTO v_pending_reviews;

    SELECT COUNT(*) INTO v_unread_messages FROM public.contact_messages WHERE status = 'unread';
    SELECT COUNT(*) INTO v_active_partners FROM public.partners WHERE is_active = true;
    SELECT COUNT(*) INTO v_published_resources FROM public.resources WHERE status = 'published';
    SELECT COUNT(*) INTO v_published_indicators FROM public.impact_indicators WHERE status = 'published';

    RETURN jsonb_build_object(
        'total_pages', v_total_pages,
        'published_pages', v_published_pages,
        'draft_pages', v_draft_pages,
        'total_programmes', v_total_programmes,
        'published_programmes', v_published_programmes,
        'total_projects', v_total_projects,
        'active_projects', v_active_projects,
        'published_news', v_published_news,
        'upcoming_events', v_upcoming_events,
        'total_stories', v_total_stories,
        'published_stories', v_published_stories,
        'pending_safeguarding', v_pending_safeguarding,
        'total_media', v_total_media,
        'total_media_bytes', v_total_media_bytes,
        'pending_reviews', v_pending_reviews,
        'unread_messages', v_unread_messages,
        'active_partners', v_active_partners,
        'published_resources', v_published_resources,
        'published_indicators', v_published_indicators
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.has_any_staff_users()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (SELECT 1 FROM public.profiles LIMIT 1);
$$;

