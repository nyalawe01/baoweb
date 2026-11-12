import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Globe,
  Menu,
  X,
  Instagram,
  Facebook,
  Youtube,
  FolderKanban,
  Lock,
} from 'lucide-react';
import { UI_TRANSLATIONS, VERIFIED_BAO_PROJECTS, type LanguageCode } from '@bao/shared';

function TikTokIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export function Header({
  lang,
  setLang,
  currentPath,
  navigate,
  settings,
  menus,
  projects = [],
}: {
  lang: LanguageCode;
  setLang?: (l: LanguageCode) => void;
  currentPath: string;
  navigate: (path: string) => void;
  settings: Record<string, any>;
  menus: any[];
  projects?: any[];
}) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dict = UI_TRANSLATIONS[lang];

  const contact = settings?.contact_details || {
    email_primary: 'info@babawatoto.or.tz',
    phones: ['+255 754 282 474'],
    physical_address_en: 'Mburahati Barafu, Dar es Salaam, Tanzania',
  };
  const contactPageSettings = settings?.contact_page_settings || {};
  const phonesList: Array<{ title?: string; number: string }> =
    Array.isArray(contactPageSettings.phones_list) && contactPageSettings.phones_list.length > 0
      ? contactPageSettings.phones_list
      : Array.isArray(contact.phones_list) && contact.phones_list.length > 0
      ? contact.phones_list
      : (contact.phones || ['+255 651 136502', '+255 651 136504']).map((p: string) => ({ number: p }));

  const social = settings?.social_links || {};
  const instagramUrl = social.instagram || 'https://www.instagram.com/babawatotocentre/';
  const facebookUrl = social.facebook || 'https://www.facebook.com/babawatotocentre/';
  const youtubeUrl = social.youtube || 'https://www.youtube.com/@babawatotoorganization';
  const tiktokUrl = social.tiktok || 'https://www.tiktok.com/@babawatoto';

  // 1. "Who we are" dropdown items (each opens its own standalone separate page)
  const whoWeAreSubItems = [
    {
      href: '/mission-vision',
      title: lang === 'en' ? 'Our Vision & Mission' : 'Maono na Dhima Yetu',
      desc:
        lang === 'en'
          ? 'Our driving purpose, core institutional values, and commitment to children'
          : 'Madhumuni yetu makuu, maadili ya msingi, na ahadi yetu kwa watoto',
    },
    {
      href: '/our-history',
      title: lang === 'en' ? 'Our History' : 'Historia Yetu',
      desc:
        lang === 'en'
          ? 'Over 17 years of empowering street-connected children and families in Tanzania'
          : 'Zaidi ya miaka 17 ya kuwezesha watoto na familia nchini Tanzania',
    },
    {
      href: '/leadership-governance',
      title: lang === 'en' ? 'Leadership & Governance' : 'Uongozi na Utawala',
      desc:
        lang === 'en'
          ? 'Board of trustees, executive leadership, and multidisciplinary staff practitioners'
          : 'Bodi ya wadhamini, uongozi mkuu na watendaji wetu',
    },
    {
      href: '/about-street-children',
      title: lang === 'en' ? 'About street children' : 'Kuhusu watoto wa mitaani',
      desc:
        lang === 'en'
          ? 'Understanding the realities, rights, and potential of street-connected children'
          : 'Kuelewa hali halisi, haki na uwezo wa watoto wanaoishi na kufanya kazi mitaani',
    },
    {
      href: '/news',
      title: lang === 'en' ? 'News' : 'Habari',
      desc:
        lang === 'en'
          ? 'Latest organizational updates, field stories, and press releases'
          : 'Habari za hivi karibuni za shirika na simulizi za mabadiliko',
    },
    {
      href: '/contact',
      title: lang === 'en' ? 'Contact us' : 'Wasiliana nasi',
      desc:
        lang === 'en'
          ? 'Reach our Dar es Salaam head office or submit a partnership inquiry'
          : 'Wasiliana na ofisi yetu kuu jijini Dar es Salaam',
    },
  ];

  // 2. "What we do" dropdown items: List of all projects
  const publishedProjectItems =
    projects.length > 0
      ? projects.map((proj: any) => {
        const tr =
          (proj.project_translations || []).find((t: any) => t.language === lang) ||
          (proj.project_translations || [])[0] ||
          {};
        return {
          href: `/projects/${tr.slug || proj.id}`,
          title: tr.title || 'Project',
          desc: tr.summary || proj.location || 'Babawatoto Organization Field Project',
          status: proj.project_status || 'active',
        };
      })
      : VERIFIED_BAO_PROJECTS.map((vp: any) => ({
        href: `/projects/${vp.en.slug}`,
        title: lang === 'en' ? vp.en.title : vp.sw.title,
        desc: lang === 'en' ? vp.en.short_description : vp.sw.short_description,
        status: vp.project_status,
      }));

  // 3. "Resources" dropdown items
  const resourcesSubItems = [
    {
      href: '/resources/gallery',
      title: lang === 'en' ? 'Our Gallery' : 'Matunzio ya Picha',
      desc:
        lang === 'en'
          ? 'Verified field photographs across Child Protection, Education, and HEART Arts'
          : 'Picha za shughuli zetu za ulinzi wa mtoto, elimu na sanaa',
    },
    {
      href: '/resources/documentation',
      title: lang === 'en' ? 'Documentation' : 'Nyaraka za Mradi',
      desc:
        lang === 'en'
          ? 'Programme briefs, institutional documentation, and training manuals'
          : 'Nyaraka za programu, miongozo ya mafunzo na taarifa za kitaasisi',
    },
    {
      href: '/resources/policies-and-guidelines',
      title: lang === 'en' ? 'Policy and Guidelines' : 'Sera na Miongozo',
      desc:
        lang === 'en'
          ? 'Child Safeguarding Policy, ethical standards, and operational guidelines'
          : 'Sera ya Ulinzi wa Mtoto, maadili na miongozo ya utendaji kazi',
    },
    {
      href: '/resources/publications',
      title: lang === 'en' ? 'Publications' : 'Machapisho na Ripoti',
      desc:
        lang === 'en'
          ? 'Annual reports, research studies, and MEL evaluation publications'
          : 'Ripoti za mwaka, tafiti na machapisho ya tathmini',
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-xs">
      {/* Top Bar: Far Left = Office Email | Far Right = Language & Social Media Links */}
      <div className="bg-[#E6A500] text-black text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          {/* Far Left: Office Email */}
          <a
            href={`mailto:${contact.email_primary || 'info@babawatoto.or.tz'}`}
            className="flex items-center gap-2 text-black hover:bg-[#F2F2F2] px-2 py-0.5 rounded-xs font-bold transition truncate max-w-[190px] sm:max-w-none text-[11px] sm:text-xs"
          >
            <Mail className="w-3.5 h-3.5 text-black shrink-0" />
            <span className="truncate">{contact.email_primary || 'info@babawatoto.or.tz'}</span>
          </a>

          {/* Far Right: Social Media Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex items-center gap-1.5 text-black hover:bg-[#F2F2F2] px-1.5 py-0.5 rounded-xs font-bold transition"
            >
              <Instagram className="w-3.5 h-3.5 text-black" />
              <span className="hidden md:inline text-[11px] font-bold">Instagram</span>
            </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex items-center gap-1.5 text-black hover:bg-[#F2F2F2] px-1.5 py-0.5 rounded-xs font-bold transition"
              >
                <Facebook className="w-3.5 h-3.5 text-black" />
                <span className="hidden md:inline text-[11px] font-bold">Facebook</span>
              </a>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="flex items-center gap-1.5 text-black hover:bg-[#F2F2F2] px-1.5 py-0.5 rounded-xs font-bold transition"
              >
                <Youtube className="w-3.5 h-3.5 text-black" />
                <span className="hidden md:inline text-[11px] font-bold">YouTube</span>
              </a>
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="flex items-center gap-1.5 text-black hover:bg-[#F2F2F2] px-1.5 py-0.5 rounded-xs font-bold transition"
              >
                <TikTokIcon className="w-3.5 h-3.5 text-black" />
                <span className="hidden md:inline text-[11px] font-bold">TikTok</span>
              </a>
            </div>
          </div>
        </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between bg-white">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 text-left focus:outline-none cursor-pointer"
        >
          <picture>
            <source srcSet="/logo.webp" type="image/webp" />
            <img
              src="/logo.png"
              alt="Babawatoto Organization Logo"
              width={48}
              height={48}
              loading="eager"
              fetchPriority="high"
              className="w-12 h-12 object-contain bg-white"
            />
          </picture>
          <div>
            <span className="block font-extrabold text-lg tracking-tight text-black">
              BABAWATOTO
            </span>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-black">
              Centre for Children & Youth
            </span>
          </div>
        </button>

        {/* Desktop Nav Links: Who we are | What we do | Resources | Contact us */}
        <nav className="hidden lg:flex items-center gap-4">
          {/* 1. Who we are */}
          <div
            className="relative py-2"
            onMouseEnter={() => setOpenDropdown('who-we-are')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button
              onClick={() => navigate('/mission-vision')}
              className={`bao-nav-link cursor-pointer ${
                currentPath.startsWith('/about') ||
                currentPath === '/mission-vision' ||
                currentPath === '/mission-and-vision' ||
                currentPath === '/our-history' ||
                currentPath === '/history' ||
                currentPath === '/leadership-governance' ||
                currentPath === '/governance' ||
                currentPath === '/about-street-children'
                  ? 'bao-nav-link-active'
                  : ''
              }`}
            >
              <span>{lang === 'en' ? 'Who we are' : 'Kuhusu sisi'}</span>
              <ChevronDown className="w-4 h-4 transition-transform duration-200" />
            </button>

            {openDropdown === 'who-we-are' && (
              <div className="absolute left-0 top-full pt-1 w-[460px] z-50">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-3 space-y-1">
                  {whoWeAreSubItems.map((sub) => (
                    <button
                      key={sub.href}
                      onClick={() => {
                        setOpenDropdown(null);
                        navigate(sub.href);
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white hover:bg-[#F2F2F2] text-left group transition"
                    >
                      <div className="pr-3">
                        <div className="font-extrabold text-[20px] text-black transition">
                          {sub.title}
                        </div>
                        <div className="text-[18px] text-black/80 mt-0.5 line-clamp-1">
                          {sub.desc}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-black group-hover:translate-x-0.5 shrink-0 transition" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. What we do (Dropdown list of all projects) */}
          <div
            className="relative py-2"
            onMouseEnter={() => setOpenDropdown('what-we-do')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button
              onClick={() => navigate('/projects')}
              className={`bao-nav-link cursor-pointer ${currentPath.startsWith('/projects') || currentPath.startsWith('/programmes')
                  ? 'bao-nav-link-active'
                  : ''
                }`}
            >
              <span>{lang === 'en' ? 'What we do' : 'Tunachokifanya'}</span>
              <ChevronDown className="w-4 h-4 transition-transform duration-200" />
            </button>

            {openDropdown === 'what-we-do' && (
              <div className="absolute left-0 top-full pt-1 w-[500px] z-50">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-3 space-y-1">
                  <div className="px-3.5 py-2 text-[15px] font-extrabold uppercase tracking-wider text-black bg-[#E6A500] flex items-center justify-between">
                    <span>{lang === 'en' ? 'Our Projects' : 'Miradi Yetu'}</span>
                    <button
                      onClick={() => {
                        setOpenDropdown(null);
                        navigate('/projects');
                      }}
                      className="hover:bg-[#F2F2F2] px-2 py-0.5 rounded-xs text-black transition"
                    >
                      {lang === 'en' ? 'View All Projects →' : 'Tazama Miradi Yote →'}
                    </button>
                  </div>
                  {publishedProjectItems.map((projItem) => (
                    <button
                      key={projItem.href}
                      onClick={() => {
                        setOpenDropdown(null);
                        navigate(projItem.href);
                      }}
                      className="w-full flex items-start justify-between p-3.5 rounded-xl bg-white hover:bg-[#F2F2F2] text-left group transition"
                    >
                      <div className="flex items-start gap-3 pr-3">
                        <FolderKanban className="w-5 h-5 text-black shrink-0 mt-1" />
                        <div>
                          <div className="font-extrabold text-[20px] text-black transition">
                            {projItem.title}
                          </div>
                          <div className="text-[18px] text-black/80 mt-0.5 line-clamp-2">
                            {projItem.desc}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-black group-hover:translate-x-0.5 shrink-0 mt-1 transition" />
                    </button>
                  ))}
                  <div className="pt-1 mt-1 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setOpenDropdown(null);
                        navigate('/programmes');
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white hover:bg-[#F2F2F2] border border-[#E6A500] text-[18px] font-extrabold text-black transition"
                    >
                      <span>
                        {lang === 'en'
                          ? 'Explore All 6 Strategic Programmes'
                          : 'Tazama Programu Zote 6 za Kimkakati'}
                      </span>
                      <ChevronRight className="w-5 h-5 text-black" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Resources (Our Gallery, Documentation, Policy and Guidelines, Publications) */}
          <div
            className="relative py-2"
            onMouseEnter={() => setOpenDropdown('resources')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button
              onClick={() => navigate('/resources')}
              className={`bao-nav-link cursor-pointer ${currentPath.startsWith('/resources') ? 'bao-nav-link-active' : ''
                }`}
            >
              <span>{lang === 'en' ? 'Resources' : 'Rasilimali'}</span>
              <ChevronDown className="w-4 h-4 transition-transform duration-200" />
            </button>

            {openDropdown === 'resources' && (
              <div className="absolute right-0 top-full pt-1 w-[460px] z-50">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-3 space-y-1">
                  {resourcesSubItems.map((sub) => (
                    <button
                      key={sub.href}
                      onClick={() => {
                        setOpenDropdown(null);
                        navigate(sub.href);
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white hover:bg-[#F2F2F2] text-left group transition"
                    >
                      <div className="pr-3">
                        <div className="font-extrabold text-[20px] text-black transition">
                          {sub.title}
                        </div>
                        <div className="text-[18px] text-black/80 mt-0.5 line-clamp-1">
                          {sub.desc}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-black group-hover:translate-x-0.5 shrink-0 transition" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Contact us */}
          <div className="py-2">
            <button
              onClick={() => navigate('/contact')}
              className={`bao-nav-link cursor-pointer ${currentPath.startsWith('/contact') ? 'bao-nav-link-active' : ''
                }`}
            >
              <span>{lang === 'en' ? 'Contact us' : 'Wasiliana nasi'}</span>
            </button>
          </div>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-lg border border-[#E6A500] bg-white text-black"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-4 max-h-[85vh] overflow-y-auto">
          <div>
            <div className="text-xs font-extrabold uppercase text-black bg-[#E6A500] px-2 py-1 mb-1">
              Who we are
            </div>
            {whoWeAreSubItems.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  setMobileOpen(false);
                  navigate(item.href);
                }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-black hover:bg-[#F2F2F2] cursor-pointer"
              >
                {item.title}
              </button>
            ))}
          </div>

          <div>
            <div className="text-xs font-extrabold uppercase text-black bg-[#E6A500] px-2 py-1 mb-1">
              What we do (Projects)
            </div>
            {publishedProjectItems.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  setMobileOpen(false);
                  navigate(item.href);
                }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-black hover:bg-[#F2F2F2] cursor-pointer"
              >
                {item.title}
              </button>
            ))}
          </div>

          <div>
            <div className="text-xs font-extrabold uppercase text-black bg-[#E6A500] px-2 py-1 mb-1">
              Resources
            </div>
            {resourcesSubItems.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  setMobileOpen(false);
                  navigate(item.href);
                }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-black hover:bg-[#F2F2F2] cursor-pointer"
              >
                {item.title}
              </button>
            ))}
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                setMobileOpen(false);
                navigate('/contact');
              }}
              className="block w-full text-center px-3 py-2.5 rounded-lg text-sm font-bold text-black bg-[#E6A500] hover:bg-black hover:text-white transition cursor-pointer"
            >
              {lang === 'en' ? 'Contact us' : 'Wasiliana nasi'}
            </button>

            <a
              href={typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3001' : (settings?.cms_url || 'https://cms.babawatoto.or.tz')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-xs font-extrabold text-white bg-black hover:bg-neutral-800 transition cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-[#E6A500]" />
              <span>CMS Portal Login</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer({
  lang,
  navigate,
  settings,
  menus = [],
}: {
  lang: LanguageCode;
  navigate: (path: string) => void;
  settings: Record<string, any>;
  menus?: any[];
}) {
  const dict = UI_TRANSLATIONS[lang];
  const contact = settings?.contact_details || {};
  const contactPageSettings = settings?.contact_page_settings || {};
  const phonesList: Array<{ title?: string; number: string }> =
    Array.isArray(contactPageSettings.phones_list) && contactPageSettings.phones_list.length > 0
      ? contactPageSettings.phones_list
      : Array.isArray(contact.phones_list) && contact.phones_list.length > 0
      ? contact.phones_list
      : (contact.phones || ['+255 651 136502', '+255 651 136504']).map((p: string) => ({ number: p }));
  const social = settings?.social_links || {};

  const instagramUrl = social.instagram || 'https://www.instagram.com/babawatotocentre/';
  const facebookUrl = social.facebook || 'https://www.facebook.com/babawatotocentre/';
  const youtubeUrl = social.youtube || 'https://www.youtube.com/@babawatotoorganization';
  const tiktokUrl = social.tiktok || 'https://www.tiktok.com/@babawatoto';

  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const cmsLoginUrl = isLocal ? 'http://localhost:3001' : (settings?.cms_url || 'https://cms.babawatoto.or.tz');

  // Dynamic Useful Links from menus (footer_primary)
  const footerPrimaryMenu = (menus || []).find(
    (m: any) => m.location_key === 'footer_primary' || m.location_key === 'footer'
  );
  const footerItems = (footerPrimaryMenu?.menu_items || [])
    .filter((i: any) => i.is_active !== false)
    .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));

  const usefulLinks =
    footerItems.length > 0
      ? footerItems.map((item: any) => ({
          href: item.url_path,
          label: lang === 'en' ? item.label_en || item.label_sw : item.label_sw || item.label_en,
          isExternal: Boolean(item.url_path?.startsWith('http')),
        }))
      : [
          { href: '/mission-vision', label: 'Our Vision & Mission', isExternal: false },
          { href: '/our-history', label: 'Our History', isExternal: false },
          { href: '/leadership-governance', label: 'Leadership & Governance', isExternal: false },
          { href: '/about-street-children', label: 'About street children', isExternal: false },
          { href: '/projects', label: 'What we do (Projects)', isExternal: false },
          { href: '/resources/gallery', label: 'Our Gallery', isExternal: false },
          { href: '/news', label: 'News & Stories', isExternal: false },
          { href: '/contact', label: 'Contact us', isExternal: false },
        ];

  // Dynamic Policies Links from menus (footer_policies)
  const footerPoliciesMenu = (menus || []).find(
    (m: any) => m.location_key === 'footer_policies'
  );
  const footerPolicyItems = (footerPoliciesMenu?.menu_items || [])
    .filter((i: any) => i.is_active !== false)
    .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));

  return (
    <footer className="bg-[#E6A500] text-black pt-14 pb-8 border-t-4 border-white">
      <div className="max-w-7xl mx-auto px-4 space-y-10">
        <h2 className="sr-only">Footer Information & Navigation</h2>
        {/* ROW 1: 4 Columns (1: Logo Only | 2: Useful Links | 3: Our Address | 4: Get in Touch) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-white/60 items-start">
          {/* Column 1: Only the Logo */}
          <div className="flex items-start">
            <button
              onClick={() => navigate('/')}
              className="focus:outline-none"
              aria-label="Babawatoto Organization Home"
            >
              <picture>
                <source srcSet="/logo.webp" type="image/webp" />
                <img
                  src="/logo.png"
                  alt="Babawatoto Organization Logo"
                  width={144}
                  height={144}
                  loading="lazy"
                  decoding="async"
                  className="w-36 h-36 bg-white p-3 object-contain"
                />
              </picture>
            </button>
          </div>

          {/* Column 2: Useful Links */}
          <div className="space-y-2.5 text-xs">
            <h3 className="font-bold text-sm text-black uppercase tracking-wider mb-3">
              Useful Links
            </h3>
            {usefulLinks.map((l: any) => (
              l.isExternal ? (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-black font-medium hover:bg-[#F2F2F2] px-2 py-0.5 rounded-xs transition text-left cursor-pointer"
                >
                  {l.label}
                </a>
              ) : (
                <button
                  key={l.href}
                  onClick={() => navigate(l.href)}
                  className="block text-black font-medium hover:bg-[#F2F2F2] px-2 py-0.5 rounded-xs transition text-left cursor-pointer"
                >
                  {l.label}
                </button>
              )
            ))}
            <a
              href={cmsLoginUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-black font-bold hover:bg-[#F2F2F2] px-2 py-0.5 rounded-xs transition text-left mt-1 cursor-pointer"
            >
              <Lock className="w-3 h-3 text-black" />
              <span>CMS Portal Login</span>
            </a>
          </div>

          {/* Column 3: Our Address */}
          <div className="space-y-3 text-xs">
            <h3 className="font-bold text-sm text-black uppercase tracking-wider mb-3">
              Our Address
            </h3>
            <div className="flex items-start gap-2.5 text-black leading-relaxed">
              <MapPin className="w-4 h-4 text-black shrink-0 mt-0.5" />
              <div className="space-y-1.5 break-normal hyphens-none">
                <p className="font-bold text-black uppercase tracking-wide text-[11px]">
                  Head Office
                </p>
                <div className="text-black font-medium space-y-0.5">
                  <p className="leading-snug">
                    <span className="inline-block whitespace-nowrap">St. Anne Marie Street,</span>{' '}
                    <span className="inline-block whitespace-nowrap">House No. 27</span>
                  </p>
                  <p className="leading-snug">
                    <span className="inline-block whitespace-nowrap">Morogoro Road,</span>{' '}
                    <span className="inline-block whitespace-nowrap">Mbezi Kwa Msuguri</span>
                  </p>
                  <p className="leading-snug text-black/90">
                    <span className="inline-block whitespace-nowrap">{contact.po_box || contact.postal_address || 'P.O. Box 8293'},</span>{' '}
                    <span className="inline-block whitespace-nowrap">{contact.city || 'Dar es Salaam'}, {contact.country || 'Tanzania'}</span>
                  </p>
                </div>
                <div className="pt-1.5 text-black/85 text-[11px] leading-snug">
                  <span className="font-semibold text-black block mb-0.5">Office Hours:</span>
                  <p className="whitespace-nowrap">
                    {contact.working_hours_en || 'Mon – Fri: 8:00 AM – 5:00 PM (EAT)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Get in Touch (Contact Us) */}
          <div className="space-y-3 text-xs">
            <h3 className="font-bold text-sm text-black uppercase tracking-wider mb-3">
              Get in Touch (Contact Us)
            </h3>
            <div className="space-y-2 text-black font-medium">
              {phonesList.map((p, idx) => (
                <a
                  key={idx}
                  href={`tel:${p.number.replace(/\s+/g, '')}`}
                  className="flex items-center gap-2.5 text-black hover:bg-[#F2F2F2] px-2 py-0.5 rounded-xs transition"
                >
                  <Phone className="w-4 h-4 text-black shrink-0" />
                  <span className="truncate">
                    {p.title ? `${p.title}: ` : ''}{p.number}
                  </span>
                </a>
              ))}
              <a
                href={`mailto:${contact.primary_email || contact.email_primary || 'info@babawatoto.or.tz'}`}
                className="flex items-center gap-2.5 text-black hover:bg-[#F2F2F2] px-2 py-0.5 rounded-xs transition"
              >
                <Mail className="w-4 h-4 text-black shrink-0" />
                <span className="truncate">{contact.primary_email || contact.email_primary || 'info@babawatoto.or.tz'}</span>
              </a>
            </div>

            {/* Social Media Icon Links */}
            <div className="pt-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-black mb-2">
                Follow Us
              </div>
              <div className="flex items-center gap-2.5">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="p-2.5 bg-white hover:bg-[#EAEAEA] text-black transition"
                >
                  <Instagram className="w-4 h-4 text-black" />
                </a>
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="p-2.5 bg-white hover:bg-[#EAEAEA] text-black transition"
                >
                  <Facebook className="w-4 h-4 text-black" />
                </a>
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="p-2.5 bg-white hover:bg-[#EAEAEA] text-black transition"
                >
                  <Youtube className="w-4 h-4 text-black" />
                </a>
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok"
                  className="p-2.5 bg-white hover:bg-[#EAEAEA] text-black transition"
                >
                  <TikTokIcon className="w-4 h-4 text-black" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: Single Row & Single Column with Copyright, Policies & Safeguarding */}
        <div className="grid grid-cols-1 text-center space-y-3 text-xs text-black">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {footerPolicyItems.length > 0 ? (
              footerPolicyItems.map((pi: any) => (
                <button
                  key={pi.id}
                  onClick={() => navigate(pi.url_path)}
                  className="hover:bg-[#F2F2F2] px-2 py-0.5 rounded-xs flex items-center gap-1.5 font-bold text-black transition cursor-pointer"
                >
                  {pi.url_path.includes('safeguard') && <ShieldCheck className="w-3.5 h-3.5 text-black" />}
                  <span>{lang === 'en' ? pi.label_en || pi.label_sw : pi.label_sw || pi.label_en}</span>
                </button>
              ))
            ) : (
              <>
                <button
                  onClick={() => navigate('/policies/child-safeguarding')}
                  className="hover:bg-[#F2F2F2] px-2 py-0.5 rounded-xs flex items-center gap-1.5 font-bold text-black transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-black" />
                  <span>{dict.footer.safeguardingPolicy}</span>
                </button>
                <button
                  onClick={() => navigate('/policies/privacy-policy')}
                  className="hover:bg-[#F2F2F2] px-2 py-0.5 rounded-xs font-bold text-black transition"
                >
                  {dict.footer.privacyPolicy}
                </button>
                <button
                  onClick={() => navigate('/policies/accessibility')}
                  className="hover:bg-[#F2F2F2] px-2 py-0.5 rounded-xs font-bold text-black transition"
                >
                  {dict.footer.accessibility}
                </button>
                <button
                  onClick={() => navigate('/policies/terms-of-use')}
                  className="hover:bg-[#F2F2F2] px-2 py-0.5 rounded-xs font-bold text-black transition"
                >
                  {dict.footer.termsOfUse}
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="hover:bg-[#F2F2F2] px-2 py-0.5 rounded-xs font-bold text-black transition"
                >
                  Contact Us
                </button>
              </>
            )}

            {/* CMS Portal Login Button */}
            <a
              href={cmsLoginUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white hover:bg-neutral-800 text-xs font-extrabold uppercase tracking-wider rounded shadow-xs transition cursor-pointer ml-1"
              title="Babawatoto CMS Administrative Portal Login"
            >
              <Lock className="w-3.5 h-3.5 text-[#E6A500]" />
              <span>CMS Login</span>
            </a>
          </div>
          <div className="font-medium text-black">
            © {new Date().getFullYear()} Babawatoto Centre for Children and Youth Trust (BAO).{' '}
            {dict.footer.rightsReserved} · {dict.footer.safeguardingNotice}
          </div>
        </div>
      </div>
    </footer>
  );
}
