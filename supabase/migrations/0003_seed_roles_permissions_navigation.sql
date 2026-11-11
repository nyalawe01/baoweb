-- =============================================================================
-- MIGRATION 0003: SEED ROLES, PERMISSIONS, NAVIGATION MENUS & SITE SETTINGS
-- Zero fictional content; only structural RBAC, navigation, and verified BAO metadata.
-- =============================================================================

-- 1. SEED SYSTEM ROLES
INSERT INTO public.roles (slug, name, description, is_system_role)
VALUES
    ('super_admin', 'Super Administrator', 'Full system access, including user management, roles, configuration and all content.', true),
    ('website_admin', 'Website Administrator', 'Manages website content, navigation, media and publishing settings.', true),
    ('editor', 'Editor', 'Creates, edits, reviews and publishes permitted content.', true),
    ('contributor', 'Contributor', 'Creates and edits assigned content but cannot publish without approval.', true),
    ('media_manager', 'Media Manager', 'Manages the media library and uploaded files.', true),
    ('viewer', 'Viewer', 'Read-only dashboard and content access.', true)
ON CONFLICT (slug) DO NOTHING;

-- 2. SEED GRANULAR PERMISSIONS
INSERT INTO public.permissions (code, module, description)
VALUES
    ('dashboard.view', 'dashboard', 'View CMS dashboard statistics and recent activity'),
    ('content.view_drafts', 'content', 'Preview unpublished draft and pending review content'),
    ('pages.create_edit', 'pages', 'Create and edit pages and page builder blocks'),
    ('pages.publish', 'pages', 'Approve, schedule, publish, and archive pages'),
    ('pages.delete', 'pages', 'Delete pages permanently'),
    ('programmes.create_edit', 'programmes', 'Create and edit organization programmes'),
    ('programmes.publish', 'programmes', 'Approve and publish programmes'),
    ('projects.create_edit', 'projects', 'Create and edit projects and project activities'),
    ('projects.publish', 'projects', 'Approve and publish projects'),
    ('projects.delete', 'projects', 'Delete projects'),
    ('articles.create_edit', 'articles', 'Create and edit news articles and events'),
    ('articles.publish', 'articles', 'Approve, schedule, and publish news and events'),
    ('articles.delete', 'articles', 'Delete news articles and events'),
    ('stories.create_edit', 'stories', 'Create and edit Stories of Change drafts'),
    ('stories.safeguarding_approve', 'stories', 'Review and approve child/beneficiary safeguarding and consent'),
    ('stories.publish', 'stories', 'Publish safeguarding-approved Stories of Change'),
    ('partners.manage', 'partners', 'Manage partner organizations, logos, and institutional donor case studies'),
    ('resources.create_edit', 'resources', 'Upload and edit downloadable publications and reports'),
    ('resources.publish', 'resources', 'Publish and archive resources and publications'),
    ('impact.create_edit', 'impact', 'Create and edit impact indicators and records'),
    ('impact.publish', 'impact', 'Approve and publish verified impact statistics'),
    ('media.upload', 'media', 'Upload images, documents, and videos to cPanel storage'),
    ('media.edit_metadata', 'media', 'Edit media titles, alt text, captions, and categories'),
    ('media.replace', 'media', 'Replace existing media files while preserving references'),
    ('media.delete', 'media', 'Delete unused media files from storage'),
    ('media.view_private', 'media', 'Access and download private safeguarding and verification documents'),
    ('menus.manage', 'menus', 'Manage header and footer navigation menus'),
    ('settings.manage', 'settings', 'Manage global website settings and upload limits'),
    ('messages.manage', 'messages', 'View and respond to contact messages and volunteer applications'),
    ('users.manage', 'users', 'Create, edit, activate, and assign roles to CMS users'),
    ('roles.manage', 'roles', 'Configure role permission assignments'),
    ('audit_logs.view', 'audit_logs', 'View system activity and security audit logs')
ON CONFLICT (code) DO NOTHING;

-- 3. ASSIGN PERMISSIONS TO ROLES
-- Super Administrator: All permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.slug = 'super_admin'
ON CONFLICT DO NOTHING;

-- Website Administrator: All except users.manage and roles.manage
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.slug = 'website_admin'
  AND p.code NOT IN ('users.manage', 'roles.manage')
ON CONFLICT DO NOTHING;

-- Editor: Content creation, review, safeguarding approval, and publishing
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.slug = 'editor'
  AND p.code IN (
      'dashboard.view', 'content.view_drafts',
      'pages.create_edit', 'pages.publish',
      'programmes.create_edit', 'programmes.publish',
      'projects.create_edit', 'projects.publish',
      'articles.create_edit', 'articles.publish', 'articles.delete',
      'stories.create_edit', 'stories.safeguarding_approve', 'stories.publish',
      'partners.manage',
      'resources.create_edit', 'resources.publish',
      'impact.create_edit', 'impact.publish',
      'media.upload', 'media.edit_metadata', 'media.replace', 'media.view_private',
      'messages.manage'
  )
ON CONFLICT DO NOTHING;

-- Contributor: Draft creation & editing only (no publish permissions)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.slug = 'contributor'
  AND p.code IN (
      'dashboard.view', 'content.view_drafts',
      'pages.create_edit',
      'programmes.create_edit',
      'projects.create_edit',
      'articles.create_edit',
      'stories.create_edit',
      'resources.create_edit',
      'impact.create_edit',
      'media.upload', 'media.edit_metadata'
  )
ON CONFLICT DO NOTHING;

-- Media Manager
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.slug = 'media_manager'
  AND p.code IN (
      'dashboard.view', 'content.view_drafts',
      'media.upload', 'media.edit_metadata', 'media.replace', 'media.delete', 'media.view_private',
      'resources.create_edit'
  )
ON CONFLICT DO NOTHING;

-- Viewer
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.slug = 'viewer'
  AND p.code IN ('dashboard.view', 'content.view_drafts')
ON CONFLICT DO NOTHING;

-- 4. SEED DEFAULT ARTICLE CATEGORIES
INSERT INTO public.article_categories (slug, name_en, name_sw, display_order)
VALUES
    ('organizational-news', 'Organizational News', 'Habari za Shirika', 1),
    ('field-updates', 'Field Updates', 'Taarifa kutoka Jamii', 2),
    ('child-protection', 'Child Protection & Rights', 'Ulinzi na Haki za Mtoto', 3),
    ('youth-empowerment', 'Youth & Vocational Skills', 'Uwezeshaji Vijana na Stadi', 4),
    ('press-releases', 'Press Releases & Advocacy', 'Taarifa kwa Vyombo vya Habari', 5)
ON CONFLICT (slug) DO NOTHING;

-- 5. SEED NAVIGATION MENUS (Main Header, Footer Primary, Footer Policies)
INSERT INTO public.menus (location_key, name)
VALUES
    ('main_header', 'Main Header Navigation'),
    ('footer_primary', 'Footer Quick Links'),
    ('footer_policies', 'Footer Organizational Policies')
ON CONFLICT (location_key) DO NOTHING;

-- Seed Main Header Menu Items (with BizyTech-style descriptive dropdown sub-items)
DO $$
DECLARE
    v_header_menu_id UUID;
    v_footer_menu_id UUID;
    v_policy_menu_id UUID;
    v_about_parent_id UUID;
    v_work_parent_id UUID;
BEGIN
    SELECT id INTO v_header_menu_id FROM public.menus WHERE location_key = 'main_header';
    SELECT id INTO v_footer_menu_id FROM public.menus WHERE location_key = 'footer_primary';
    SELECT id INTO v_policy_menu_id FROM public.menus WHERE location_key = 'footer_policies';

    IF NOT EXISTS (SELECT 1 FROM public.menu_items WHERE menu_id = v_header_menu_id) THEN
        -- 1. Home
        INSERT INTO public.menu_items (menu_id, label_en, label_sw, url_path, display_order)
        VALUES (v_header_menu_id, 'Home', 'Mwanzo', '/', 1);

        -- 2. About Us (Parent)
        INSERT INTO public.menu_items (menu_id, label_en, label_sw, url_path, display_order)
        VALUES (v_header_menu_id, 'About Us', 'Kuhusu Sisi', '/about', 2)
        RETURNING id INTO v_about_parent_id;

        INSERT INTO public.menu_items (menu_id, parent_id, label_en, label_sw, description_en, description_sw, url_path, display_order)
        VALUES
            (v_header_menu_id, v_about_parent_id, 'Who We Are', 'Sisi ni Nani', 'Our mandate, philosophy, and NGO registration since 2006.', 'Dira, falsafa na usajili wetu tangu mwaka 2006.', '/about/who-we-are', 1),
            (v_header_menu_id, v_about_parent_id, 'Mission and Vision', 'Dhamira na Dira', 'Guiding principles of shared responsibility and child dignity.', 'Misingi ya uwajibikaji wa pamoja na utu wa mtoto.', '/about/mission-and-vision', 2),
            (v_header_menu_id, v_about_parent_id, 'Our History', 'Historia Yetu', 'Our journey from a grassroots community response to national impact.', 'Safari yetu kuanzia ngazi ya jamii hadi kufikia taifa.', '/about/our-history', 3),
            (v_header_menu_id, v_about_parent_id, 'Leadership and Governance', 'Uongozi na Utawala', 'Board of Trustees, accountability, and institutional governance.', 'Bodi ya Wadhamini, uwajibikaji na mfumo wa utawala.', '/about/leadership-and-governance', 4),
            (v_header_menu_id, v_about_parent_id, 'Our Team', 'Timu Yetu', 'Meet our executive leadership and programme coordinators.', 'Kutana na viongozi na waratibu wa miradi yetu.', '/about/our-team', 5);

        -- 3. Our Work (Parent)
        INSERT INTO public.menu_items (menu_id, label_en, label_sw, url_path, display_order)
        VALUES (v_header_menu_id, 'Our Work', 'Kazi Zetu', '/programmes', 3)
        RETURNING id INTO v_work_parent_id;

        INSERT INTO public.menu_items (menu_id, parent_id, label_en, label_sw, description_en, description_sw, url_path, display_order)
        VALUES
            (v_header_menu_id, v_work_parent_id, 'Child Protection', 'Ulinzi wa Mtoto', 'Safeguarding vulnerable children, safe spaces, and ethics.', 'Kulinda watoto walio katika mazingira magumu na maadili.', '/programmes/child-protection', 1),
            (v_header_menu_id, v_work_parent_id, 'Education & Vocational Skills', 'Elimu na Stadi za Ufundi', 'Employability training and learning support at BAO Youth Centre.', 'Mafunzo ya ufundi stadi na elimu katika Kituo cha Vijana.', '/programmes/education', 2),
            (v_header_menu_id, v_work_parent_id, 'HEART and Creative Arts', 'Sanaa za Jamii na Utamaduni', 'Theatre, music, dance, and visual arts for healing and social change.', 'Sanaa, muziki na maigizo kwa ajili ya uponyaji na mabadiliko ya jamii.', '/programmes/heart-and-creative-arts', 3),
            (v_header_menu_id, v_work_parent_id, 'Youth Empowerment', 'Uwezeshaji Vijana', 'Entrepreneurship coaching, digital literacy, and civic engagement.', 'Ujasiriamali, ujuzi wa kidijitali na ushiriki wa vijana.', '/programmes/youth-empowerment', 4),
            (v_header_menu_id, v_work_parent_id, 'Behaviour Change & ASRH', 'Mabadiliko ya Tabia na Afya', 'Adolescent reproductive health education, counseling, and outreach.', 'Elimu ya afya ya uzazi kwa vijana na ushauri nasaha.', '/programmes/behaviour-change-communication', 5),
            (v_header_menu_id, v_work_parent_id, 'Advocacy and Consultancy', 'Utetezi na Ushauri', 'Child rights governance, humanitarian response, and climate resilience.', 'Utetezi wa haki za mtoto, misaada ya kibinadamu na mazingira.', '/programmes/advocacy-and-consultancy', 6);

        -- 4 to 10. Top-Level Links
        INSERT INTO public.menu_items (menu_id, label_en, label_sw, url_path, display_order)
        VALUES
            (v_header_menu_id, 'Projects', 'Miradi', '/projects', 4),
            (v_header_menu_id, 'Our Impact', 'Matokeo Yetu', '/impact', 5),
            (v_header_menu_id, 'Stories of Change', 'Simulizi za Mabadiliko', '/stories', 6),
            (v_header_menu_id, 'News and Events', 'Habari na Matukio', '/news-events', 7),
            (v_header_menu_id, 'Resources', 'Machapisho', '/resources', 8),
            (v_header_menu_id, 'Get Involved', 'Shirikiana Nasi', '/get-involved', 9),
            (v_header_menu_id, 'Contact Us', 'Wasiliana Nasi', '/contact', 10);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.menu_items WHERE menu_id = v_footer_menu_id) THEN
        INSERT INTO public.menu_items (menu_id, label_en, label_sw, url_path, display_order)
        VALUES
            (v_footer_menu_id, 'Who We Are', 'Kuhusu Sisi', '/about/who-we-are', 1),
            (v_footer_menu_id, 'Our Programmes', 'Programu Zetu', '/programmes', 2),
            (v_footer_menu_id, 'Active Projects', 'Miradi Inayoendelea', '/projects', 3),
            (v_footer_menu_id, 'Our Impact & MEL', 'Takwimu na Matokeo', '/impact', 4),
            (v_footer_menu_id, 'Institutional Donors & Partners', 'Wafadhili na Washirika', '/get-involved', 5),
            (v_footer_menu_id, 'Resources & Annual Reports', 'Ripoti na Machapisho', '/resources', 6),
            (v_footer_menu_id, 'Contact Our Team', 'Wasiliana Nasi', '/contact', 7);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.menu_items WHERE menu_id = v_policy_menu_id) THEN
        INSERT INTO public.menu_items (menu_id, label_en, label_sw, url_path, display_order)
        VALUES
            (v_policy_menu_id, 'Child Safeguarding Policy', 'Sera ya Ulinzi wa Mtoto', '/policies/child-safeguarding', 1),
            (v_policy_menu_id, 'Privacy & Data Protection', 'Sera ya Faragha', '/policies/privacy-policy', 2),
            (v_policy_menu_id, 'Accessibility Statement', 'Taarifa ya Ufikivu', '/policies/accessibility', 3),
            (v_policy_menu_id, 'Terms of Use', 'Masharti ya Matumizi', '/policies/terms-of-use', 4);
    END IF;
END $$;

-- 6. SEED VERIFIED BAO SITE SETTINGS (Editable in CMS Website Settings Module)
INSERT INTO public.site_settings (key, value, description, is_public)
VALUES
    ('organization_profile', '{
        "organization_name": "Babawatoto Organization",
        "short_name": "BAO",
        "swahili_meaning": "Father of the Children",
        "established_year": 2006,
        "reregistered_year": 2019,
        "registration_number": "00NGO/R2/000001",
        "registration_ministry": "Ministry of Community Development, Children, Elders and Special Groups",
        "tagline_en": "Empowering Children and Youth to Live in Dignity",
        "tagline_sw": "Kuwawezesha Watoto na Vijana Kuishi kwa Heshima na Utu",
        "mission_en": "To promote and protect the rights of children and youth through advocacy, education, and community empowerment programs that address the root causes of vulnerability and create sustainable change.",
        "mission_sw": "Kukuza na kulinda haki za watoto na vijana kupitia utetezi, elimu na programu za uwezeshaji jamii zinazokabiliana na vyanzo vya mazingira magumu na kuleta mabadiliko endelevu.",
        "vision_en": "A society where children and youth enjoy their rights and live in dignity, free from all forms of abuse and exploitation.",
        "vision_sw": "Jamii ambayo watoto na vijana wanafurahia haki zao na kuishi kwa utu, bila aina yoyote ya ukatili na unyonyaji.",
        "logo_url": "/media/public/images/organization/logo.png"
    }'::jsonb, 'Core organizational identity and legal registration details', true),

    ('contact_details', '{
        "po_box": "P.O. Box 8293",
        "street_address": "Morogoro Road, Mbezi Kwa Msuguri, St. Anne Marie Street, House No. 27",
        "city": "Dar es Salaam",
        "country": "Tanzania",
        "phones": ["+255 651 136502", "+255 651 136504"],
        "primary_email": "info@babawatoto.or.tz",
        "safeguarding_email": "info@babawatoto.or.tz",
        "working_hours_en": "Mon – Fri: 8:00 AM – 5:00 PM",
        "working_hours_sw": "Jumatatu – Ijumaa: Saa 2:00 Asubuhi – Saa 11:00 Jioni"
    }'::jsonb, 'Official headquarters address, phone numbers, and emails', true),

    ('social_links', '{
        "facebook": "https://www.facebook.com/groups/3551680445156661",
        "instagram": "https://www.instagram.com/babawatoto_organization/",
        "twitter": "https://twitter.com/babawatotoorga1",
        "youtube": "https://youtube.com/@babawatotoorganization",
        "linkedin": ""
    }'::jsonb, 'Official social media profiles', true),

    ('seo_defaults', '{
        "default_title_en": "Babawatoto Organization | Empowering Children & Youth in Tanzania",
        "default_title_sw": "Shirika la Babawatoto | Kuwawezesha Watoto na Vijana Tanzania",
        "default_description_en": "Babawatoto Organization (BAO) is a registered non-governmental organization in Tanzania (00NGO/R2/000001) promoting child rights, youth empowerment, creative arts, and sustainable community development.",
        "default_description_sw": "Shirika la Babawatoto (BAO) ni shirika lisilo la kiserikali Tanzania linalokuza haki za watoto, uwezeshaji vijana, sanaa za jamii na maendeleo endelevu.",
        "og_image_url": "/media/public/images/organization/logo.png"
    }'::jsonb, 'Default SEO titles, descriptions, and Open Graph metadata', true),

    ('upload_limits', '{
        "max_image_size_mb": 10,
        "max_document_size_mb": 25,
        "max_video_size_mb": 100,
        "storage_quota_gb": 5
    }'::jsonb, 'Configurable upload size limits and storage quota thresholds', false)
ON CONFLICT (key) DO NOTHING;

