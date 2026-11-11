-- =============================================================================
-- MIGRATION 0002: ROW LEVEL SECURITY (RLS) POLICIES & AUTH TRIGGERS
-- =============================================================================

-- 1. Automatic Profile Creation on Supabase Auth User Signup
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_super_admin_role_id UUID;
    v_existing_profile_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_existing_profile_count FROM public.profiles;

    INSERT INTO public.profiles (id, email, full_name, job_title, is_active)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, 'Staff'), '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'job_title', 'BAO Staff'),
        true
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;

    -- Bootstrap rule: The very first user created in the system automatically receives super_admin
    IF v_existing_profile_count = 0 THEN
        SELECT id INTO v_super_admin_role_id FROM public.roles WHERE slug = 'super_admin' LIMIT 1;
        IF v_super_admin_role_id IS NOT NULL THEN
            INSERT INTO public.user_roles (user_id, role_id)
            VALUES (NEW.id, v_super_admin_role_id)
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 2. RBAC Helper Functions (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles p
        JOIN public.user_roles ur ON ur.user_id = p.id
        WHERE p.id = auth.uid() AND p.is_active = true
    );
$$;

CREATE OR REPLACE FUNCTION public.has_role(target_role_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles p
        JOIN public.user_roles ur ON ur.user_id = p.id
        JOIN public.roles r ON r.id = ur.role_id
        WHERE p.id = auth.uid()
          AND p.is_active = true
          AND (r.slug = target_role_slug OR r.slug = 'super_admin')
    );
$$;

CREATE OR REPLACE FUNCTION public.has_permission(target_permission_code TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles p
        JOIN public.user_roles ur ON ur.user_id = p.id
        JOIN public.roles r ON r.id = ur.role_id
        LEFT JOIN public.role_permissions rp ON rp.role_id = r.id
        LEFT JOIN public.permissions perm ON perm.id = rp.permission_id
        WHERE p.id = auth.uid()
          AND p.is_active = true
          AND (r.slug = 'super_admin' OR perm.code = target_permission_code)
    );
$$;

-- 3. ENABLE RLS ON ALL 31 TABLES
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'profiles', 'roles', 'permissions', 'user_roles', 'role_permissions',
        'media_assets', 'content_media', 'pages', 'page_translations', 'page_versions',
        'programmes', 'programme_translations', 'projects', 'project_translations',
        'project_activities', 'article_categories', 'articles', 'article_translations',
        'stories', 'story_translations', 'partners', 'resources', 'team_members',
        'impact_indicators', 'impact_records', 'menus', 'menu_items',
        'site_settings', 'contact_messages', 'volunteer_applications',
        'publication_reviews', 'activity_logs'
    ]
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    END LOOP;
END $$;

-- 4. PUBLIC WEBSITE READ POLICIES (Strictly Published / Public Content Only)
CREATE POLICY "Public can read public media_assets" ON public.media_assets
    FOR SELECT USING (visibility = 'public' OR public.is_active_staff());

CREATE POLICY "Public can read content_media" ON public.content_media
    FOR SELECT USING (true);

CREATE POLICY "Public can read published pages" ON public.pages
    FOR SELECT USING (status = 'published' OR public.is_active_staff());

CREATE POLICY "Public can read published page_translations" ON public.page_translations
    FOR SELECT USING (
        (translation_status = 'published' AND EXISTS (
            SELECT 1 FROM public.pages p WHERE p.id = page_id AND p.status = 'published'
        ))
        OR public.is_active_staff()
    );

CREATE POLICY "Public can read published programmes" ON public.programmes
    FOR SELECT USING (status = 'published' OR public.is_active_staff());

CREATE POLICY "Public can read published programme_translations" ON public.programme_translations
    FOR SELECT USING (
        (translation_status = 'published' AND EXISTS (
            SELECT 1 FROM public.programmes pr WHERE pr.id = programme_id AND pr.status = 'published'
        ))
        OR public.is_active_staff()
    );

CREATE POLICY "Public can read published projects" ON public.projects
    FOR SELECT USING (status = 'published' OR public.is_active_staff());

CREATE POLICY "Public can read published project_translations" ON public.project_translations
    FOR SELECT USING (
        (translation_status = 'published' AND EXISTS (
            SELECT 1 FROM public.projects pj WHERE pj.id = project_id AND pj.status = 'published'
        ))
        OR public.is_active_staff()
    );

CREATE POLICY "Public can read project_activities of published projects" ON public.project_activities
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.projects pj WHERE pj.id = project_id AND pj.status = 'published')
        OR public.is_active_staff()
    );

CREATE POLICY "Public can read article_categories" ON public.article_categories
    FOR SELECT USING (true);

CREATE POLICY "Public can read published articles" ON public.articles
    FOR SELECT USING (status = 'published' OR public.is_active_staff());

CREATE POLICY "Public can read published article_translations" ON public.article_translations
    FOR SELECT USING (
        (translation_status = 'published' AND EXISTS (
            SELECT 1 FROM public.articles a WHERE a.id = article_id AND a.status = 'published'
        ))
        OR public.is_active_staff()
    );

CREATE POLICY "Public can read published and safeguarding-approved stories" ON public.stories
    FOR SELECT USING (
        (status = 'published' AND has_written_consent = true AND safeguarding_review_status = 'approved')
        OR public.is_active_staff()
    );

CREATE POLICY "Public can read published story_translations" ON public.story_translations
    FOR SELECT USING (
        (translation_status = 'published' AND EXISTS (
            SELECT 1 FROM public.stories s
            WHERE s.id = story_id
              AND s.status = 'published'
              AND s.has_written_consent = true
              AND s.safeguarding_review_status = 'approved'
        ))
        OR public.is_active_staff()
    );

CREATE POLICY "Public can read active partners" ON public.partners
    FOR SELECT USING (is_active = true OR public.is_active_staff());

CREATE POLICY "Public can read published resources" ON public.resources
    FOR SELECT USING (status = 'published' OR public.is_active_staff());

CREATE POLICY "Public can read published team_members" ON public.team_members
    FOR SELECT USING (status = 'published' OR public.is_active_staff());

CREATE POLICY "Public can read published impact_indicators" ON public.impact_indicators
    FOR SELECT USING (status = 'published' OR public.is_active_staff());

CREATE POLICY "Public can read published impact_records" ON public.impact_records
    FOR SELECT USING (status = 'published' OR public.is_active_staff());

CREATE POLICY "Public can read menus" ON public.menus
    FOR SELECT USING (true);

CREATE POLICY "Public can read active menu_items" ON public.menu_items
    FOR SELECT USING (is_active = true OR public.is_active_staff());

CREATE POLICY "Public can read public site_settings" ON public.site_settings
    FOR SELECT USING (is_public = true OR public.is_active_staff());

-- Public form submission policies (INSERT only)
CREATE POLICY "Public can submit contact_messages" ON public.contact_messages
    FOR INSERT WITH CHECK (
        length(trim(sender_name)) >= 2
        AND length(trim(sender_email)) >= 5
        AND length(trim(message)) >= 10
    );

CREATE POLICY "Public can submit volunteer_applications" ON public.volunteer_applications
    FOR INSERT WITH CHECK (
        length(trim(full_name)) >= 2
        AND length(trim(email)) >= 5
        AND length(trim(motivation)) >= 10
    );

-- 5. STAFF & RBAC WRITE POLICIES
CREATE POLICY "Staff can read profiles" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_active_staff());

CREATE POLICY "Users can update own profile or super_admin" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.has_permission('users.manage'));

CREATE POLICY "Staff can read roles and permissions" ON public.roles
    FOR SELECT USING (public.is_active_staff());

CREATE POLICY "Staff can read permissions" ON public.permissions
    FOR SELECT USING (public.is_active_staff());

CREATE POLICY "Staff can read user_roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id OR public.is_active_staff());

CREATE POLICY "Staff can read role_permissions" ON public.role_permissions
    FOR SELECT USING (public.is_active_staff());

CREATE POLICY "Super admin manages user_roles" ON public.user_roles
    FOR ALL USING (public.has_permission('users.manage'));

CREATE POLICY "Super admin manages role_permissions" ON public.role_permissions
    FOR ALL USING (public.has_permission('roles.manage'));

-- Content module write policies for authenticated staff with permissions
CREATE POLICY "Staff manage pages" ON public.pages
    FOR ALL USING (public.has_permission('pages.create_edit') OR public.has_permission('pages.publish'));

CREATE POLICY "Staff manage page_translations" ON public.page_translations
    FOR ALL USING (public.has_permission('pages.create_edit') OR public.has_permission('pages.publish'));

CREATE POLICY "Staff read and write page_versions" ON public.page_versions
    FOR ALL USING (public.is_active_staff());

CREATE POLICY "Staff manage programmes" ON public.programmes
    FOR ALL USING (public.has_permission('programmes.create_edit') OR public.has_permission('programmes.publish'));

CREATE POLICY "Staff manage programme_translations" ON public.programme_translations
    FOR ALL USING (public.has_permission('programmes.create_edit') OR public.has_permission('programmes.publish'));

CREATE POLICY "Staff manage projects" ON public.projects
    FOR ALL USING (public.has_permission('projects.create_edit') OR public.has_permission('projects.publish'));

CREATE POLICY "Staff manage project_translations" ON public.project_translations
    FOR ALL USING (public.has_permission('projects.create_edit') OR public.has_permission('projects.publish'));

CREATE POLICY "Staff manage project_activities" ON public.project_activities
    FOR ALL USING (public.has_permission('projects.create_edit') OR public.has_permission('projects.publish'));

CREATE POLICY "Staff manage article_categories" ON public.article_categories
    FOR ALL USING (public.has_permission('articles.create_edit') OR public.has_permission('articles.publish'));

CREATE POLICY "Staff manage articles" ON public.articles
    FOR ALL USING (public.has_permission('articles.create_edit') OR public.has_permission('articles.publish'));

CREATE POLICY "Staff manage article_translations" ON public.article_translations
    FOR ALL USING (public.has_permission('articles.create_edit') OR public.has_permission('articles.publish'));

CREATE POLICY "Staff manage stories" ON public.stories
    FOR ALL USING (public.has_permission('stories.create_edit') OR public.has_permission('stories.publish'));

CREATE POLICY "Staff manage story_translations" ON public.story_translations
    FOR ALL USING (public.has_permission('stories.create_edit') OR public.has_permission('stories.publish'));

CREATE POLICY "Staff manage partners" ON public.partners
    FOR ALL USING (public.has_permission('partners.manage'));

CREATE POLICY "Staff manage resources" ON public.resources
    FOR ALL USING (public.has_permission('resources.create_edit') OR public.has_permission('resources.publish'));

CREATE POLICY "Staff manage team_members" ON public.team_members
    FOR ALL USING (public.has_permission('pages.create_edit') OR public.has_permission('settings.manage'));

CREATE POLICY "Staff manage impact_indicators" ON public.impact_indicators
    FOR ALL USING (public.has_permission('impact.create_edit') OR public.has_permission('impact.publish'));

CREATE POLICY "Staff manage impact_records" ON public.impact_records
    FOR ALL USING (public.has_permission('impact.create_edit') OR public.has_permission('impact.publish'));

CREATE POLICY "Staff manage media_assets" ON public.media_assets
    FOR ALL USING (public.has_permission('media.upload') OR public.has_permission('media.edit_metadata'));

CREATE POLICY "Staff manage content_media" ON public.content_media
    FOR ALL USING (public.is_active_staff());

CREATE POLICY "Staff manage menus" ON public.menus
    FOR ALL USING (public.has_permission('menus.manage'));

CREATE POLICY "Staff manage menu_items" ON public.menu_items
    FOR ALL USING (public.has_permission('menus.manage'));

CREATE POLICY "Staff manage site_settings" ON public.site_settings
    FOR ALL USING (public.has_permission('settings.manage'));

CREATE POLICY "Staff manage contact_messages" ON public.contact_messages
    FOR ALL USING (public.has_permission('messages.manage'));

CREATE POLICY "Staff manage volunteer_applications" ON public.volunteer_applications
    FOR ALL USING (public.has_permission('messages.manage'));

CREATE POLICY "Staff manage publication_reviews" ON public.publication_reviews
    FOR ALL USING (public.is_active_staff());

CREATE POLICY "Staff view activity_logs" ON public.activity_logs
    FOR SELECT USING (public.has_permission('audit_logs.view') OR public.is_active_staff());

CREATE POLICY "Staff insert activity_logs" ON public.activity_logs
    FOR INSERT WITH CHECK (public.is_active_staff());

