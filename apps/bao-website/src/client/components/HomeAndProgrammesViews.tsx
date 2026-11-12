import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  GraduationCap,
  Drama,
  Briefcase,
  Megaphone,
  Scale,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle2,
  MapPin,
  Users,
  BarChart3,
  HeartHandshake,
  Sparkles,
  FolderKanban,
  Newspaper,
  Image as ImageIcon,
  Quote,
  MessageSquareQuote,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { UI_TRANSLATIONS, type LanguageCode } from '@bao/shared';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Blog7 } from '@/components/ui/blog7';
import { StandardPageTemplate } from './StandardPageTemplate.js';
import { YouTubeEmbed } from './YouTubeEmbed.js';

export function EmptyStateCard({
  title,
  description,
  icon: Icon = Sparkles,
}: {
  title: string;
  description: string;
  icon?: any;
}) {
  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-[#E6A500] p-10 text-center max-w-3xl mx-auto my-4 shadow-none">
      <div className="w-14 h-14 rounded-2xl bg-[#E6A500] text-black flex items-center justify-center mx-auto mb-3">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="font-extrabold text-[24px] text-black">{title}</h3>
      <p className="text-[18px] text-black/85 mt-2 max-w-xl mx-auto leading-relaxed">{description}</p>
    </div>
  );
}

export function getProgrammeIcon(iconName?: string) {
  switch (iconName) {
    case 'GraduationCap':
      return GraduationCap;
    case 'Drama':
      return Drama;
    case 'Briefcase':
      return Briefcase;
    case 'Megaphone':
      return Megaphone;
    case 'Scale':
      return Scale;
    default:
      return Shield;
  }
}

export function resolveMediaUrl(mediaId: string | any | null | undefined, mediaList: any[]): string | null {
  if (!mediaId) return null;
  if (typeof mediaId === 'object' && mediaId !== null) {
    return mediaId.public_url || mediaId.url || resolveMediaUrl(mediaId.id || mediaId.media_id, mediaList);
  }
  if (typeof mediaId === 'string') {
    if (mediaId.startsWith('/') || mediaId.startsWith('http')) {
      return mediaId;
    }
    const found = (mediaList || []).find((m) => m.id === mediaId || m.storage_key === mediaId);
    if (found) {
      if (found.public_url) return found.public_url;
      if (found.storage_key) {
        return found.storage_key.startsWith('public/')
          ? `/media/${found.storage_key}`
          : `/media/public/${found.storage_key}`;
      }
    }
  }
  return null;
}

export const DEFAULT_PRIORITY_PROJECTS = [
  {
    id: 'priority-uhuru-wetu',
    slug: 'uhuru-wetu',
    title_en: 'Uhuru Wetu Project',
    title_sw: 'Mradi wa Uhuru Wetu',
    short_description_en:
      'Reintegrating street-connected children and youth through family tracing, psychosocial healing, and community protection.',
    short_description_sw:
      'Kuwarejesha watoto na vijana wa mitaani katika familia zao kupitia msaada wa kisaikolojia na ulinzi wa jamii.',
    image_url: '/media/public/images/projects/ahadi.webp',
    project_status: 'active',
    location: 'Mburahati & Ubungo, Dar es Salaam',
    is_featured: true,
  },
  {
    id: 'priority-haki-yangu',
    slug: 'haki-yangu-hatma-yangu',
    title_en: 'Haki Yangu, Hatma Yangu',
    title_sw: 'Haki Yangu, Hatma Yangu',
    short_description_en:
      'Empowering adolescents and vulnerable youth with legal rights awareness, gender equality advocacy, and vocational life skills.',
    short_description_sw:
      'Kuwawezesha vijana kutambua haki zao za msingi, usawa wa kijinsia na mafunzo ya stadi za maisha na ufundi.',
    image_url: '/media/public/images/projects/WATOTO.webp',
    project_status: 'active',
    location: 'Kinondoni & Ilala, Dar es Salaam',
    is_featured: true,
  },
  {
    id: 'priority-mtoto-kwanza',
    slug: 'mtoto-kwanza',
    title_en: 'Mtoto Kwanza Initiative',
    title_sw: 'Mpango wa Mtoto Kwanza',
    short_description_en:
      'Putting children first through MEMKWA catch-up education, safe play spaces, and ward-level child safeguarding committees.',
    short_description_sw:
      'Kuweka kipaumbele kwa mtoto kupitia elimu ya MEMKWA, maeneo salama ya michezo na kamati za ulinzi wa mtoto.',
    image_url: '/media/public/images/projects/vocation.JPG',
    project_status: 'active',
    location: 'Dar es Salaam, Tanzania',
    is_featured: true,
  },
];

export function HomeView({
  lang,
  siteData,
  navigate,
}: {
  lang: LanguageCode;
  siteData: any;
  navigate: (path: string) => void;
}) {
  const dict = UI_TRANSLATIONS[lang];
  const org = siteData.settings?.organization_profile || {};
  const programmes = siteData.programmes || [];
  const projects = siteData.projects || [];
  const stories = siteData.stories || [];
  const news = siteData.news || [];
  const partners = siteData.partners || [];
  const indicators = siteData.indicators || [];
  const media = siteData.media || [];

  // Real YouTube videos fetched from https://www.youtube.com/@babawatotoorganization
  const videos: { id: string; title: string; subtitle: string; published?: string }[] =
    Array.isArray(siteData.youtubeVideos) && siteData.youtubeVideos.length > 0
      ? siteData.youtubeVideos
      : [
        {
          id: 'pdx8DWYJM_o',
          title: 'BABAWATOTO ORGANIZATION CIRCUS PERFORMANCE!!!!',
          subtitle: 'Babawatoto Organization (@babawatotoorganization)',
        },
        {
          id: 'FgXXMyMLF9k',
          title: 'BABAWATOTO ORGANIZATION THEATER ARTS PERFORMANCE LIVE',
          subtitle: 'Babawatoto Organization (@babawatotoorganization)',
        },
        {
          id: 'R09iiZAHiFs',
          title: 'BABAWATOTO ORGANIZATION LIVE PERFORMANCE',
          subtitle: 'Babawatoto Organization (@babawatotoorganization)',
        },
      ];
  const [videoIdx, setVideoIdx] = useState(0);

  // Adaptive Hero Banners from Database (public.site_settings -> hero_banners):
  // - 1 banner posted via CMS -> Static single banner
  // - >1 banners posted via CMS -> Scrollable / carousel banner
  // Adaptive Hero Banners from Database (site_settings.hero_banners & pages.home):
  const cmsBanners = siteData.settings?.hero_banners?.banners;
  const homeCmsPage = (siteData.pages || []).find(
    (p: any) => (p.page_key === 'home' || p.slug === 'home') && p.status !== 'archived'
  );
  const homeTr =
    (homeCmsPage?.page_translations || []).find((t: any) => t.language === lang) ||
    (homeCmsPage?.page_translations || [])[0] ||
    {};

  const defaultHeroBanner = {
    id: 'banner-home-default',
    badge: homeTr.hero_tag || 'Babawatoto Centre for Children & Youth',
    title: homeTr.title || 'Protecting Children, Restoring Families, and Empowering Youth Across Tanzania',
    subtitle: homeTr.subtitle || 'Babawatoto Centre for Children and Youth Trust (BAO) works alongside vulnerable children, street-connected youth, and families through Child Protection, MEMKWA Catch-Up Education, HEART Creative Arts, and Vocational Livelihoods.',
    image_url: homeCmsPage?.hero_image || resolveMediaUrl(homeCmsPage?.featured_media_id, siteData.media) || '/media/public/images/organization/hero1.webp',
    primary_cta_label: 'Explore Our Work',
    primary_cta_href: '/programmes',
    secondary_cta_label: 'Partner With Us',
    secondary_cta_href: '/get-involved',
  };

  const rawBanners: any[] = Array.isArray(cmsBanners) && cmsBanners.length > 0 ? cmsBanners : [defaultHeroBanner];

  const stripHtml = (text?: string): string => {
    if (!text) return '';
    return text.replace(/<[^>]+>/g, '').trim();
  };

  const heroBanners = rawBanners.map((banner: any, idx: number) => {
    const badge = stripHtml(
      (lang === 'sw' ? (banner.badge_sw || banner.badge) : (banner.badge_en || banner.badge)) ||
      (idx === 0 ? homeTr.hero_tag : '') ||
      ''
    );
    const title = stripHtml(
      (lang === 'sw' ? (banner.title_sw || banner.title) : (banner.title_en || banner.title)) ||
      (idx === 0 ? homeTr.title : '') ||
      'Protecting Children, Restoring Families, and Empowering Youth Across Tanzania'
    );
    const subtitle = stripHtml(
      (lang === 'sw' ? (banner.subtitle_sw || banner.subtitle) : (banner.subtitle_en || banner.subtitle)) ||
      (idx === 0 ? homeTr.subtitle : '') ||
      ''
    );
    const image_url =
      banner.image_url ||
      (idx === 0
        ? homeCmsPage?.hero_image || resolveMediaUrl(homeCmsPage?.featured_media_id, siteData.media)
        : '') ||
      '/media/public/images/organization/hero1.webp';

    return {
      ...banner,
      badge,
      title,
      subtitle,
      image_url,
      primary_cta_label: banner.primary_cta_label || dict.common.exploreWork,
      primary_cta_href: banner.primary_cta_href || '/programmes',
      secondary_cta_label: banner.secondary_cta_label || dict.common.partnerWithUs,
      secondary_cta_href: banner.secondary_cta_href || '/get-involved',
    };
  });

  // Who We Are Section from Database (public.site_settings -> who_we_are_section & organization_profile & pages.who-we-are)
  const whoWeAre = siteData.settings?.who_we_are_section || {};
  const wwaCmsPage = (siteData.pages || []).find(
    (p: any) => (p.page_key === 'who-we-are' || p.slug === 'who-we-are') && p.status !== 'archived'
  );
  const wwaTr =
    (wwaCmsPage?.page_translations || []).find((t: any) => t.language === lang) ||
    (wwaCmsPage?.page_translations || [])[0] ||
    {};

  const whoWeAreBadge =
    (lang === 'sw'
      ? whoWeAre.badge_sw || wwaTr.hero_tag || org.badge_sw
      : whoWeAre.badge_en || wwaTr.hero_tag || org.badge_en) || 'Who We Are · About Babawatoto';

  const whoWeAreTitle =
    (lang === 'sw'
      ? whoWeAre.title_sw || wwaTr.title || org.legal_name || org.organization_name
      : whoWeAre.title_en || wwaTr.title || org.legal_name || org.organization_name) || 'Babawatoto Centre for Children and Youth Trust (BAO)';

  const whoWeAreSummary =
    (lang === 'sw'
      ? whoWeAre.summary_sw || wwaTr.subtitle || org.history_summary_sw || org.mission_sw
      : whoWeAre.summary_en || wwaTr.subtitle || org.about_summary || org.history_summary_en || org.mission_en) || '';

  const whoWeAreCtaLabel =
    (lang === 'sw'
      ? whoWeAre.cta_label_sw || org.about_cta_label_sw || dict.common.readMore
      : whoWeAre.cta_label_en || org.about_cta_label_en || dict.common.readMore) || 'Read More';

  const whoWeAreCtaHref = whoWeAre.cta_href || org.about_cta_href || '/about/who-we-are';

  const isScrollableHero = heroBanners.length > 1;
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const bannerScrollRef = useRef<HTMLDivElement | null>(null);

  const scrollToBanner = (index: number) => {
    const nextIdx = (index + heroBanners.length) % heroBanners.length;
    setActiveBannerIdx(nextIdx);
    if (bannerScrollRef.current) {
      const slideWidth = bannerScrollRef.current.clientWidth;
      bannerScrollRef.current.scrollTo({
        left: slideWidth * nextIdx,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (!isScrollableHero) return;
    const timer = setInterval(() => {
      scrollToBanner(activeBannerIdx + 1);
    }, 6500);
    return () => clearInterval(timer);
  }, [isScrollableHero, activeBannerIdx, heroBanners.length]);

  const chartData = (indicators || []).map((ind: any) => {
    const tr =
      (ind.impact_indicator_translations || []).find((t: any) => t.language === lang) ||
      (ind.impact_indicator_translations || [])[0];
    const rec = (ind.impact_records || [])[0];
    const label =
      (lang === 'sw' ? ind.name_sw : ind.name_en) ||
      ind.name_en ||
      ind.name_sw ||
      tr?.label ||
      ind.indicator_key ||
      ind.code ||
      'Indicator';
    const numVal = Number(
      rec?.numeric_value ??
      ind.current_value ??
      ind.target_value ??
      ind.value ??
      0
    );
    return {
      name: String(label || '').slice(0, 22),
      value: isNaN(numVal) ? 0 : numVal,
    };
  });

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Adaptive Hero Section: Single Banner if 1 item, Scrollable Banner if >1 items */}
      {heroBanners.length === 1 ? (
        <section className="relative bg-[#E6A500] text-black overflow-hidden">
          <div
            className="absolute inset-0 opacity-30 bg-cover bg-center"
            style={{
              backgroundImage: `url('${heroBanners[0]?.image_url || '/media/public/images/organization/hero1.webp'}')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#E6A500] via-[#E6A500]/90 to-white/25" />
          <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              {heroBanners[0]?.badge && (
                <span className="inline-block px-3.5 py-1.5 bg-black text-white text-xs font-black uppercase tracking-wider mb-2">
                  {heroBanners[0].badge}
                </span>
              )}
              <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-black">
                {heroBanners[0]?.title}
              </h1>
              <div className="text-base sm:text-lg text-black max-w-2xl leading-relaxed font-medium space-y-2">
                {(heroBanners[0]?.subtitle || '').split('\n').filter(Boolean).map((para: string, pIdx: number) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate('/projects')}
                  className="bao-btn px-6 py-3.5 text-black font-bold text-sm flex items-center gap-2 shadow-lg"
                >
                  <span>Explore Our Work</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </button>
                <button
                  onClick={() => navigate('/get-involved')}
                  className="bao-btn px-6 py-3.5 text-black font-bold text-sm"
                >
                  Partner With Us
                </button>
              </div>
            </div>

            {/* Prominent Attached Hero Image Showcase */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-none border-4 border-white bg-black/10">
                <img
                  src={heroBanners[0]?.image_url || '/media/public/images/organization/hero1.webp'}
                  alt={heroBanners[0]?.title || 'Hero Banner Image'}
                  width={800}
                  height={600}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      ) : heroBanners.length > 1 ? (
        <section className="relative bg-[#E6A500] text-black overflow-hidden">
          <div
            ref={bannerScrollRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              if (el.clientWidth > 0) {
                const idx = Math.round(el.scrollLeft / el.clientWidth);
                if (idx !== activeBannerIdx && idx >= 0 && idx < heroBanners.length) {
                  setActiveBannerIdx(idx);
                }
              }
            }}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
            style={{ scrollbarWidth: 'none' }}
          >
            {heroBanners.map((banner, idx) => (
              <div
                key={banner.id}
                className="relative min-w-full w-full shrink-0 snap-center overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-30 bg-cover bg-center transition-transform duration-700"
                  style={{
                    backgroundImage: `url('${banner.image_url || '/media/public/images/organization/hero1.webp'}')`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#E6A500] via-[#E6A500]/90 to-white/25" />
                <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-7 space-y-6">
                    {banner.badge && (
                      <span className="inline-block px-3.5 py-1.5 bg-black text-white text-xs font-black uppercase tracking-wider mb-2">
                        {banner.badge}
                      </span>
                    )}
                    <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-black">
                      {banner.title}
                    </h1>
                    <div className="text-base sm:text-lg text-black max-w-2xl leading-relaxed font-medium space-y-2">
                      {(banner.subtitle || '').split('\n').filter(Boolean).map((para: string, pIdx: number) => (
                        <p key={pIdx}>{para}</p>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <button
                        onClick={() => navigate('/projects')}
                        className="bao-btn px-6 py-3.5 text-black font-bold text-sm flex items-center gap-2 shadow-lg"
                      >
                        <span>Explore Our Work</span>
                        <ArrowRight className="w-4 h-4 text-black" />
                      </button>
                      <button
                        onClick={() => navigate('/get-involved')}
                        className="bao-btn px-6 py-3.5 text-black font-bold text-sm"
                      >
                        Partner With Us
                      </button>
                    </div>
                  </div>

                  {/* Prominent Attached Hero Image Showcase */}
                  <div className="lg:col-span-5 flex justify-center lg:justify-end">
                    <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-none border-4 border-white bg-black/10">
                      <img
                        src={banner.image_url || '/media/public/images/organization/hero1.webp'}
                        alt={banner.title || 'Hero Banner Image'}
                        width={800}
                        height={600}
                        loading={idx === 0 ? 'eager' : 'lazy'}
                        fetchPriority={idx === 0 ? 'high' : 'auto'}
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scrollable Banner Controls (Prev / Next / Dots) */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 pb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {heroBanners.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => scrollToBanner(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-2 transition-all ${activeBannerIdx === i ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white'
                    }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollToBanner(activeBannerIdx - 1)}
                className="p-2 bg-white hover:bg-[#F2F2F2] text-black border border-white transition"
                aria-label="Previous Banner"
              >
                <ChevronLeft className="w-4 h-4 text-black" />
              </button>
              <span className="text-xs font-mono font-bold px-2 text-black">
                {activeBannerIdx + 1} / {heroBanners.length}
              </span>
              <button
                onClick={() => scrollToBanner(activeBannerIdx + 1)}
                className="p-2 bg-white hover:bg-[#F2F2F2] text-black border border-white transition"
                aria-label="Next Banner"
              >
                <ChevronRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {/* 2. Centered About Us Summary Section with Read More Button (Database-Driven via CMS) */}
      {(whoWeAreTitle || whoWeAreSummary) && (
        <section className="max-w-5xl mx-auto px-4">
          <div className="bg-white border-2 border-[#E6A500] p-10 sm:p-14 text-center flex flex-col items-center justify-center space-y-6 shadow-none">
            {whoWeAreBadge && (
              <span className="px-4 py-1.5 bg-[#E6A500] text-black font-extrabold uppercase tracking-wider text-[15px] inline-block">
                {whoWeAreBadge}
              </span>
            )}
            {whoWeAreTitle && (
              <h2 className="text-[32px] sm:text-[40px] font-extrabold text-black max-w-3xl mx-auto leading-tight">
                {whoWeAreTitle}
              </h2>
            )}
            <div className="w-24 h-1 bg-[#E6A500] mx-auto" />
            {whoWeAreSummary && (
              <div className="text-[18px] text-black max-w-3xl mx-auto leading-relaxed space-y-3 font-normal">
                {whoWeAreSummary.split('\n').filter(Boolean).map((para: string, pIdx: number) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>
            )}
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => navigate(whoWeAreCtaHref)}
                className="bao-btn px-8 py-3.5 text-black font-extrabold text-[18px] inline-flex items-center justify-center gap-2.5"
              >
                <span>{whoWeAreCtaLabel}</span>
                <ArrowRight className="w-5 h-5 text-black" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. Programs & Priority Projects Section (3 Hover-Flip Cards from Database + More Projects Button) */}
      <section className="max-w-7xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="px-4 py-1.5 bg-[#E6A500] text-black font-extrabold uppercase tracking-wider text-[15px] inline-block">
            {lang === 'en' ? 'What We Do · Priority Projects' : 'Tunachofanya · Miradi ya Kipaumbele'}
          </span>
          <h2 className="text-[32px] sm:text-[40px] font-extrabold text-black leading-tight">
            {lang === 'en' ? 'Our Programs & Priority Projects' : 'Programu na Miradi Yetu ya Kipaumbele'}
          </h2>
          <div className="w-24 h-1 bg-[#E6A500] mx-auto" />
        </div>

        {(() => {
          const sortedCmsProjects = [
            ...projects.filter((p: any) => p.is_featured === true),
            ...projects.filter((p: any) => p.is_featured !== true),
          ];

          const mappedCmsCards = sortedCmsProjects.slice(0, 3).map((proj: any) => {
            const tr =
              (proj.project_translations || []).find((t: any) => t.language === lang) ||
              (proj.project_translations || [])[0] ||
              {};
            const imgUrl = resolveMediaUrl(proj.featured_image_id || proj.featured_media_id, media);
            return {
              id: proj.id,
              slug: tr.slug || proj.id,
              title: tr.title || '',
              shortDescription: tr.summary || tr.short_description || '',
              imageUrl: imgUrl || '',
            };
          });

          if (mappedCmsCards.length === 0) {
            return (
              <EmptyStateCard
                title={dict.emptyStates.projectsTitle}
                description={dict.emptyStates.projectsDesc}
                icon={FolderKanban}
              />
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {mappedCmsCards.map((card) => (
                <div
                  key={card.id}
                  className="bao-flip-card h-[400px] w-full cursor-pointer"
                  tabIndex={0}
                  onClick={() => navigate(`/projects/${card.slug}`)}
                >
                  <div className="bao-flip-card-inner">
                    {/* Front Face (When NOT Hovered): Just the Image */}
                    <div className="bao-flip-card-front bg-white border-2 border-[#E6A500] overflow-hidden shadow-none">
                      {card.imageUrl ? (
                        <img
                          src={card.imageUrl}
                          alt={card.title}
                          width={400}
                          height={400}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#F2F2F2]">
                          <ImageIcon className="w-12 h-12 text-black/40" />
                        </div>
                      )}
                    </div>

                    {/* Back Face (When Hovered): Short Description + Read More Button */}
                    <div className="bao-flip-card-back bg-[#E6A500] border-2 border-[#E6A500] p-8 flex flex-col items-center justify-center text-center space-y-5 shadow-none">
                      <h3 className="text-[26px] font-extrabold text-black leading-snug">
                        {card.title}
                      </h3>
                      <div className="w-16 h-[2px] bg-white mx-auto" />
                      <p className="text-[18px] text-black leading-relaxed line-clamp-4">
                        {card.shortDescription}
                      </p>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/${card.slug}`);
                          }}
                          className="bao-btn px-7 py-3 text-black font-extrabold text-[18px] inline-flex items-center justify-center gap-2"
                        >
                          <span>{dict.common.readMore || 'Read More'}</span>
                          <ArrowRight className="w-5 h-5 text-black" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        <div className="pt-4 flex justify-center">
          <button
            onClick={() => navigate('/projects')}
            className="bao-btn px-9 py-4 text-black font-extrabold text-[18px] inline-flex items-center justify-center gap-2.5"
          >
            <span>{lang === 'en' ? 'More Projects' : 'Miradi Zaidi'}</span>
            <ArrowRight className="w-5 h-5 text-black" />
          </button>
        </div>
      </section>

      {/* 3. Asante Africa-Style MEL Impact & Statistics Section */}
      <section className="bg-white border-y border-[#E6A500]/30 py-16">
        <div className="max-w-7xl mx-auto px-4 space-y-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 bg-[#E6A500] text-black inline-block">
                {dict.nav.ourImpact}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-black mt-2">
                {lang === 'en'
                  ? 'Verified Reach, Outcomes & MEL Indicators'
                  : 'Matokeo na Takwimu Zilizothibitishwa'}
              </h2>
            </div>
            <button
              onClick={() => navigate('/impact')}
              className="bao-btn text-xs font-bold px-3.5 py-2 text-black flex items-center gap-1"
            >
              <span>{dict.common.viewAll}</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </div>

          {(() => {
            const homeCustomMetrics =
              siteData.settings?.page_metrics?.home ||
              siteData.settings?.hero_banners?.metrics;
            if (Array.isArray(homeCustomMetrics) && homeCustomMetrics.length > 0) {
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {homeCustomMetrics.map((met: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-6 rounded-2xl bg-white border-0 border-transparent shadow-none space-y-2"
                    >
                      <div className="text-3xl sm:text-4xl font-extrabold text-black bg-[#E6A500] inline-block px-3 py-1">
                        {Number(met.number || 0).toLocaleString()}
                        {met.suffix || '+'}
                      </div>
                      <div className="font-extrabold text-lg text-black uppercase tracking-wide">
                        {met.label || met.type}
                      </div>
                    </div>
                  ))}
                </div>
              );
            }
            if (indicators.length > 0) {
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(indicators || []).slice(0, 6).map((ind: any) => {
                    const tr =
                      (ind.impact_indicator_translations || []).find(
                        (t: any) => t.language === lang
                      ) || (ind.impact_indicator_translations || [])[0];
                    const rec = (ind.impact_records || [])[0];
                    const label =
                      (lang === 'sw' ? ind.name_sw : ind.name_en) ||
                      ind.name_en ||
                      ind.name_sw ||
                      tr?.label ||
                      ind.indicator_key ||
                      ind.code ||
                      'Impact Indicator';
                    const numVal = Number(
                      rec?.numeric_value ??
                      ind.current_value ??
                      ind.target_value ??
                      ind.value ??
                      0
                    );
                    const suffix = ind.value_suffix || (ind.measurement_unit_en === '%' ? '%' : '+');
                    return (
                      <div
                        key={ind.id}
                        className="p-6 rounded-2xl bg-white border-0 border-transparent shadow-none space-y-2"
                      >
                        <div className="text-3xl sm:text-4xl font-extrabold text-black bg-[#E6A500] inline-block px-3 py-1">
                          {numVal.toLocaleString()}
                          {suffix}
                        </div>
                        <div className="font-extrabold text-lg text-black">
                          {label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }
            return (
              <EmptyStateCard
                title={dict.emptyStates.impactTitle}
                description={dict.emptyStates.impactDesc}
                icon={BarChart3}
              />
            );
          })()}
        </div>
      </section>

      {/* 4. Official @babawatotoorganization YouTube Channel Video Showcase */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="bg-[#E6A500] text-black rounded-3xl p-8 lg:p-12 space-y-8 border border-[#E6A500]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs text-[11px] font-bold uppercase bg-white text-black">
                <Play className="w-3 h-3 text-black" /> Official YouTube Channel
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-black">
                {videos[videoIdx]?.title}
              </h2>
              <p className="text-xs text-black/85 font-medium">{videos[videoIdx]?.subtitle}</p>

              <div className="flex items-center gap-4 pt-3">
                <button
                  onClick={() => setVideoIdx((prev) => (prev - 1 + videos.length) % videos.length)}
                  className="p-2.5 rounded-xl bg-white hover:bg-[#F2F2F2] text-black transition"
                  aria-label="Previous Video"
                >
                  <ChevronLeft className="w-5 h-5 text-black" />
                </button>
                <span className="text-xs font-mono font-bold text-black">
                  {videoIdx + 1} / {videos.length}
                </span>
                <button
                  onClick={() => setVideoIdx((prev) => (prev + 1) % videos.length)}
                  className="p-2.5 rounded-xl bg-white hover:bg-[#F2F2F2] text-black transition"
                  aria-label="Next Video"
                >
                  <ChevronRight className="w-5 h-5 text-black" />
                </button>
                <a
                  href="https://www.youtube.com/@babawatotoorganization"
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto text-xs font-bold px-3 py-1.5 bg-white text-black hover:underline"
                >
                  @babawatotoorganization →
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="aspect-video rounded-2xl overflow-hidden bg-white border-4 border-white shadow-none">
                <YouTubeEmbed
                  key={videos[videoIdx]?.id}
                  videoId={videos[videoIdx]?.id}
                  title={videos[videoIdx]?.title}
                />
              </div>
            </div>
          </div>

          {/* All Channel Videos Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/60">
            {videos.map((v, idx) => (
              <button
                key={v.id}
                onClick={() => setVideoIdx(idx)}
                className={`p-3 text-left border-2 transition flex items-center gap-3 ${videoIdx === idx
                    ? 'border-white bg-white text-black shadow-md'
                    : 'border-white/60 bg-white/80 hover:bg-white text-black'
                  }`}
              >
                <img
                  src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`}
                  alt={v.title}
                  className="w-24 h-14 object-cover shrink-0 border border-[#E6A500]"
                />
                <div className="min-w-0">
                  <div className="font-bold text-xs text-black line-clamp-2">{v.title}</div>
                  <div className="text-[10px] text-black font-bold mt-1 uppercase">
                    {videoIdx === idx ? '● Now Playing' : '▶ Click to Play'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Combined News & Stories of Change Section */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        {(() => {
          const verifiedNewsFallbacks = [
            {
              id: 'news-fallback-1',
              title: lang === 'en' ? 'Community Street Outreach & Family Reunification' : 'Utafutaji wa Watoto wa Mitaani na Kuunganisha Familia',
              description: lang === 'en'
                ? 'Mobile social welfare teams conducting daytime identification and emergency safeguarding referrals in Dar es Salaam.'
                : 'Timu za ustawi wa jamii zikifanya utambuzi wa mchana na rufaa za dharura za ulinzi jijini Dar es Salaam.',
              badge: 'Field Outreach',
              imageUrl: '/media/public/images/programmes/community aoutreach 2.jpg',
            },
            {
              id: 'news-fallback-2',
              title: lang === 'en' ? 'HEART Expressive Arts Therapy Workshops' : 'Warsha za Tiba ya Sanaa ya Maonyesho ya HEART',
              description: lang === 'en'
                ? 'Empowering street-connected youth through acrobatics, theatre, and traditional drumming to rebuild psychosocial resilience.'
                : 'Kuwezesha vijana kupitia sarakasi, maigizo, na ngoma za jadi ili kujenga ustahimilivu wa kisaikolojia.',
              badge: 'HEART Arts',
              imageUrl: '/media/public/images/programmes/arts1.webp',
            },
            {
              id: 'news-fallback-3',
              title: lang === 'en' ? 'MEMKWA Accelerated Primary Education Graduation' : 'Mahafali ya Elimu ya Msingi ya MEMKWA kwa Vijana',
              description: lang === 'en'
                ? 'Adolescent learners completing catch-up schooling curricula and transitioning into vocational apprenticeship tracks.'
                : 'Wanafunzi wa umri mkubwa wakikamilisha mitaala ya elimu ya kasi na kujiunga na mafunzo ya ufundi stadi.',
              badge: 'Education',
              imageUrl: '/media/public/images/projects/WATOTO.webp',
            },
          ];

          const mappedCmsNews = (news || []).map((n: any) => {
            const tr =
              (n.article_translations || n.news_article_translations || []).find((t: any) => t.language === lang) ||
              (n.article_translations || n.news_article_translations || [])[0] ||
              {};
            const mediaUrl =
              resolveMediaUrl(n.featured_media_id, media) ||
              '/media/public/images/organization/hero2.webp';
            const newsSlug = tr.slug || n.slug || n.id;
            return {
              id: n.id,
              type: 'news' as const,
              title: tr.title || 'Babawatoto Community Update',
              description: tr.excerpt || tr.subtitle || tr.summary || (tr.body_html ? tr.body_html.replace(/<[^>]+>/g, '').slice(0, 180) : 'Latest news dispatch from Babawatoto Organization.'),
              badge: n.tags?.[0] || 'Field News',
              imageUrl: mediaUrl,
              url: `/news/${newsSlug}`,
              targetLabel: 'Read article',
            };
          });

          const displayedNews = mappedCmsNews.length >= 3
            ? mappedCmsNews
            : [...mappedCmsNews, ...verifiedNewsFallbacks.slice(0, Math.max(0, 3 - mappedCmsNews.length)).map(item => ({ ...item, type: 'news' as const, url: `/news/${item.id}`, targetLabel: 'Read article' }))];

          const verifiedStoryFallbacks = [
            {
              id: 'story-fallback-1',
              title: lang === 'en' ? 'From The Streets To An Entrepreneur' : 'Kutoka Mitaani Hadi Kuwa Mjasiriamali',
              description: lang === 'en'
                ? 'How access to transitional shelter and technical tailoring training transformed a street youth into an independent business owner.'
                : 'Jinsi makazi salama na mafunzo ya ufundi yalivyobadilisha maisha ya kijana kuwa mjasiriamali anayejitegemea.',
              badge: 'Story of Change',
              beneficiary: 'Said M.',
              imageUrl: '/media/public/images/organization/hero3.webp',
            },
            {
              id: 'story-fallback-2',
              title: lang === 'en' ? 'Finding Voice Through The Circus Stage' : 'Kupaza Sauti Kupitia Jukwaa la Sarakasi',
              description: lang === 'en'
                ? 'Overcoming trauma through acrobatics and expressive theatre in the HEART psychological recovery programme.'
                : 'Kushinda maumivu ya kisaikolojia kupitia sanaa za maonyesho katika mpango wa HEART.',
              badge: 'Story of Change',
              beneficiary: 'Amina K.',
              imageUrl: '/media/public/images/programmes/arts1.webp',
            },
            {
              id: 'story-fallback-3',
              title: lang === 'en' ? 'A Family Reunited and Rebuilt' : 'Familia Iliyounganishwa na Kujengwa Upya',
              description: lang === 'en'
                ? 'Social workers mediating kinship disputes and providing small business grants to prevent children returning to the street.'
                : 'Wafanyakazi wa ustawi wakisaidia kuunganisha familia na kutoa mitaji midogo ili kuzuia watoto kurudi mitaani.',
              badge: 'Story of Change',
              beneficiary: 'Fatuma & Children',
              imageUrl: '/media/public/images/projects/WATOTO.webp',
            },
          ];

          const mappedCmsStories = (stories || []).map((s: any) => {
            const tr =
              (s.story_translations || []).find((t: any) => t.language === lang) ||
              (s.story_translations || [])[0] ||
              {};
            const mediaUrl =
              resolveMediaUrl(s.featured_media_id || s.featured_image_id, media) ||
              s.image_url ||
              '/media/public/images/organization/hero3.webp';
            const storySlug = tr.slug || s.slug || s.id;
            const storyUrl = `/news/${storySlug}`;
            const summary =
              tr.excerpt ||
              tr.featured_quote ||
              (tr.body_html ? tr.body_html.replace(/<[^>]+>/g, '').slice(0, 180) : 'Verified lived experience from Babawatoto participant.');
            return {
              id: s.id,
              type: 'story' as const,
              title: tr.title || 'Journey of Hope & Resilience',
              description: summary,
              badge: s.category || 'Story of Change',
              beneficiary: s.beneficiary_name || 'Participant Story',
              imageUrl: mediaUrl,
              url: storyUrl,
              targetLabel: 'Read story',
            };
          });

          const displayedStories = mappedCmsStories.length >= 3
            ? mappedCmsStories
            : [...mappedCmsStories, ...verifiedStoryFallbacks.slice(0, Math.max(0, 3 - mappedCmsStories.length)).map(item => ({ ...item, type: 'story' as const, url: `/news/${item.id}`, targetLabel: 'Read story' }))];

          const allCards = [
            ...displayedNews.slice(0, 3),
            ...displayedStories.slice(0, 3),
          ];

          return (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-4 gap-4">
                <div>
                  <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase tracking-wider text-[13px] inline-block mb-1">
                    {lang === 'en' ? 'News & Stories of Change' : 'Habari na Simulizi za Mabadiliko'}
                  </span>
                  <h2 className="font-extrabold text-2xl text-black">
                    {lang === 'en' ? 'Latest Dispatches & Stories of Transformation' : 'Habari za Karibuni na Simulizi za Mabadiliko'}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                    {lang === 'en'
                      ? 'Explore field updates, safeguarding milestones, and inspiring journeys from street-connected children and families across Tanzania.'
                      : 'Fuatilia taarifa za nyanjani, ulinzi wa watoto na simulizi zenye kugusa hisia kutoka kwa watoto na familia zilizowezeshwa.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={() => navigate('/news')}
                      className="bao-btn text-xs font-bold px-4 py-2 text-black cursor-pointer"
                    >
                      {lang === 'en' ? 'View All News & Stories' : 'Habari na Simulizi Zote'} →
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {allCards.map((item: any) => (
                  <Card
                    key={item.id}
                    className="grid grid-rows-[auto_auto_1fr_auto] overflow-hidden border border-gray-200 bg-white shadow-none rounded-2xl hover:border-black transition duration-200 group"
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden bg-neutral-100 relative">
                      <a
                        href={item.url}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(item.url);
                        }}
                        className="block w-full h-full transition-opacity duration-200 group-hover:opacity-90 cursor-pointer"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                      </a>
                      <div className="absolute top-3 left-3">
                        <Badge
                          variant="secondary"
                          className="px-2.5 py-1 text-[11px] font-extrabold uppercase bg-[#E6A500] text-black rounded shadow-xs"
                        >
                          {item.badge}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="p-5 pb-2">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span className="font-medium text-slate-700">
                          {item.beneficiary || 'Babawatoto Media'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-black leading-snug group-hover:text-amber-700 transition">
                        <a
                          href={item.url}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(item.url);
                          }}
                          className="hover:underline cursor-pointer line-clamp-2"
                        >
                          {item.title}
                        </a>
                      </h3>
                    </CardHeader>

                    <CardContent className="p-5 pt-1">
                      <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    </CardContent>

                    <CardFooter className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => navigate(item.url)}
                        className="flex items-center text-xs font-extrabold uppercase tracking-wider text-black group-hover:text-amber-600 transition cursor-pointer"
                      >
                        {item.targetLabel || 'Read more'}
                        <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          );
        })()}
      </section>

      {/* 5a. Verified Testimonies Section (Placed where Stories of Change was) */}
      <section className="max-w-7xl mx-auto px-4 space-y-6 pt-4">
        {(() => {
          const hasTestimoniesSetting = 'testimonials' in (siteData.settings || {});
          const tSetting = siteData.settings?.testimonials || {};
          const heading =
            lang === 'sw'
              ? tSetting.heading_sw || tSetting.heading_en || 'Sauti za Mabadiliko na Ushuhuda'
              : tSetting.heading_en || 'Voices of Hope & Transformation';

          const subtitle =
            lang === 'sw'
              ? tSetting.subtitle_sw ||
                tSetting.subtitle_en ||
                'Ushuhuda na simulizi halisi kutoka kwa watoto, vijana waliohitimu, walezi na washirika waliowezeshwa na Babawatoto.'
              : tSetting.subtitle_en ||
                'Authentic experiences and reflections from children, youth graduates, caregivers, and community partners empowered through Babawatoto Organization.';

          const rawItems: any[] = Array.isArray(tSetting.items)
            ? tSetting.items.filter((i: any) => i && i.is_published !== false)
            : [];

          const fallbackTestimonials = [
            {
              id: 't-fallback-1',
              name: 'Juma Said',
              role:
                lang === 'sw'
                  ? 'Mhitimu wa MEMKWA na Mwanafunzi wa Ufundi Cherehani'
                  : 'MEMKWA Accelerated Learning Graduate & Tailoring Apprentice',
              quote:
                lang === 'sw'
                  ? 'Babawatoto walinikuta nikiwa nimekata tamaa mitaani Dar es Salaam. Kupitia kituo chao salama, nilikamilisha elimu ya msingi na kugundua kipaji changu cha ushonaji. Leo najitegemea kwa heshima.'
                  : 'Babawatoto met me when I had lost hope on the streets of Dar es Salaam. Through their outreach team and safe center, I completed primary catch-up education and discovered my talent in tailoring. Today I provide for myself with dignity.',
              avatar: '/media/public/images/projects/WATOTO.webp',
              date: 'Class of 2023',
              category: 'Youth Graduate',
              rating: 5,
            },
            {
              id: 't-fallback-2',
              name: 'Rehema Mwangi',
              role:
                lang === 'sw'
                  ? 'Kiongozi wa Kamati ya Ulinzi wa Mtoto ya Jamii'
                  : 'Community Mother & Child Protection Committee Leader',
              quote:
                lang === 'sw'
                  ? 'Mafunzo ya malezi na ulinzi wa mtoto yalifungua macho yetu kama jamii. Sasa tunalinda kila mtoto katika mtaa wetu na kuhakikisha watoto walio hatarini wanapata msaada mapema.'
                  : 'The parenting and child safeguarding workshops opened our eyes as a community. We now look after every child in our neighborhood and ensure children at risk are referred early before they end up on the streets.',
              avatar: '/media/public/images/organization/hero3.webp',
              date: 'Kigogo Center',
              category: 'Caregiver & Community Leader',
              rating: 5,
            },
            {
              id: 't-fallback-3',
              name: 'Kelvin Bakari',
              role:
                lang === 'sw'
                  ? 'Msanii wa Sarakasi na Maonyesho ya HEART'
                  : 'HEART Arts & Acrobatics Performer',
              quote:
                lang === 'sw'
                  ? 'Kupitia sanaa za maonyesho na sarakasi na Babawatoto, nilipona maumivu ya kisaikolojia na nikapata familia. Nidhamu niliyojifunza imenisaidia kujenga maisha mapya na kuhamasisha watoto wadogo.'
                  : 'Through expressive theatre and acrobatic arts with Babawatoto, I healed from trauma and found a family. The discipline I learned on stage gave me the strength to rebuild my life and inspire younger children.',
              avatar: '/media/public/images/programmes/arts1.webp',
              date: 'HEART Project',
              category: 'HEART Arts Performer',
              rating: 5,
            },
          ];

          const displayedTestimonials = hasTestimoniesSetting
            ? rawItems.map((item: any) => ({
                id: item.id,
                name: item.name,
                category: item.category || 'Community Voice',
                quote: lang === 'sw' ? item.quote_sw || item.quote : item.quote,
                avatar: item.avatar_url
                  ? resolveMediaUrl(item.avatar_url, media) || item.avatar_url
                  : null,
                date: item.date_label || '',
              }))
            : (rawItems.length > 0 ? rawItems.map((item: any) => ({
                id: item.id,
                name: item.name,
                category: item.category || 'Community Voice',
                quote: lang === 'sw' ? item.quote_sw || item.quote : item.quote,
                avatar: item.avatar_url
                  ? resolveMediaUrl(item.avatar_url, media) || item.avatar_url
                  : null,
                date: item.date_label || '',
              })) : fallbackTestimonials);

          if (displayedTestimonials.length === 0) return null;

          return (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-3 flex flex-col md:flex-row md:items-end justify-between gap-2">
                <div>
                  <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase tracking-wider text-[13px] inline-block mb-1">
                    {lang === 'en' ? 'Community Testimonies' : 'Ushuhuda wa Jamii'}
                  </span>
                  <h2 className="font-extrabold text-2xl text-black">
                    {heading}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                    {subtitle}
                  </p>
                </div>
                
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {displayedTestimonials.map((c: any) => (
                  <div
                    key={c.id}
                    className="p-6 h-full bg-white border border-gray-200 rounded-2xl shadow-none hover:border-black transition duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Author and Category */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          {c.avatar ? (
                            <img
                              className="h-12 w-12 rounded-full object-cover border border-[#E6A500]/50"
                              src={c.avatar}
                              alt={c.name}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-800 text-sm">
                              {c.name ? c.name.charAt(0).toUpperCase() : <Users className="w-5 h-5 text-black/50" />}
                            </div>
                          )}
                          <div>
                            <h3 className="text-base font-bold text-black leading-snug">
                              {c.name}
                            </h3>
                            {c.category && (
                              <p className="text-xs text-[#7A5200] font-bold uppercase tracking-wide line-clamp-1">
                                {c.category}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quote Text */}
                      <div className="relative mb-4">
                        <Quote className="w-6 h-6 text-[#E6A500]/40 mb-1" />
                        <p className="text-slate-700 text-sm italic font-medium leading-relaxed pl-1">
                          "{c.quote}"
                        </p>
                      </div>
                    </div>

                    {/* Bottom Date and Tag */}
                    {c.date && (
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-slate-600">{c.date}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </section>

      {/* 6. Institutional Donors & Trusted Partners Infinite Right-to-Left Scrolling Marquee */}
      <section className="w-full space-y-6 pt-4">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <span className="px-4 py-1.5 bg-[#E6A500] text-black font-extrabold uppercase tracking-wider text-[15px] inline-block">
            {lang === 'en'
              ? 'Institutional Donors, Foundations & Development Partners'
              : 'Washirika na Wafadhili wa Maendeleo'}
          </span>
          <h2 className="text-[32px] sm:text-[38px] font-extrabold text-black">
            {lang === 'en' ? 'Trusted Partners Supporting Our Mission' : 'Washirika na Wafadhili Wetu'}
          </h2>
          <div className="w-24 h-1 bg-[#E6A500] mx-auto" />
        </div>

        {/* Full-bleed edge-to-edge scrolling loop moving beyond the border */}
        <div className="w-full bg-white py-8 overflow-hidden relative">
          {(() => {
            const placeholderSlots = Array.from({ length: 8 }, (_, idx) => ({
              id: `placeholder-${idx + 1}`,
              name: `Partner Logo ${idx + 1}`,
              isPlaceholder: true,
              logoUrl: null as string | null,
            }));

            const mappedPartners =
              partners.length > 0
                ? partners.map((p: any) => ({
                    id: p.id,
                    name: p.name || 'Partner Organization',
                    isPlaceholder: false,
                    logoUrl:
                      resolveMediaUrl(p.logo_media_id || p.logo_id, media) || p.logo_url || null,
                  }))
                : placeholderSlots;

            // Ensure the base track has at least 8 items so it spans wider than any viewport
            const baseTrack: typeof mappedPartners = [];
            while (baseTrack.length < 8) {
              for (const item of mappedPartners) {
                baseTrack.push({
                  ...item,
                  id: `${item.id}-rep-${baseTrack.length}`,
                });
                if (baseTrack.length >= Math.max(8, mappedPartners.length)) break;
              }
            }

            const renderTrackHalf = (halfKey: string) => (
              <div
                key={halfKey}
                className="flex items-center gap-10 pr-10 shrink-0"
                aria-hidden={halfKey === 'half-b' ? true : undefined}
              >
                {baseTrack.map((item: any) => (
                  <div
                    key={`${halfKey}-${item.id}`}
                    className="w-52 h-28 shrink-0 bg-white hover:bg-[#F2F2F2] flex flex-col items-center justify-center px-5 transition"
                  >
                    {item.logoUrl ? (
                      <img
                        src={item.logoUrl}
                        alt={item.name}
                        className="max-h-16 max-w-full w-auto object-contain transition"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center gap-1">
                        <div className="w-10 h-10 bg-[#F2F2F2] flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-black/60" />
                        </div>
                        <span className="font-extrabold text-[14px] text-black uppercase tracking-wider line-clamp-1">
                          {item.name}
                        </span>
                        <span className="text-[12px] font-semibold text-black/60">
                          Logo Placeholder
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );

            return (
              <div className="animate-marquee">
                {renderTrackHalf('half-a')}
                {renderTrackHalf('half-b')}
              </div>
            );
          })()}
        </div>
      </section>
    </div>
  );
}

export function ProgrammesView({
  lang,
  siteData,
  slug,
  navigate,
}: {
  lang: LanguageCode;
  siteData: any;
  slug?: string;
  navigate: (path: string) => void;
}) {
  const dict = UI_TRANSLATIONS[lang];
  const programmes = siteData.programmes || [];
  const media = siteData.media || [];

  if (slug) {
    const prog = programmes.find((p: any) =>
      (p.programme_translations || []).some(
        (t: any) => t.slug === slug || p.category_key === slug
      )
    );

    if (!prog) {
      return (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <EmptyStateCard
            title={dict.emptyStates.programmesTitle}
            description={dict.emptyStates.programmesDesc}
          />
        </div>
      );
    }

    const tr =
      (prog.programme_translations || []).find((t: any) => t.language === lang) ||
      (prog.programme_translations || [])[0] ||
      {};
    const imgUrl = resolveMediaUrl(prog.featured_image_id, media);

    return (
      <StandardPageTemplate
        pageTitle={tr.title}
        pageBadge={prog.category_key}
        heroImage={imgUrl || '/media/public/images/programmes/arts1.webp'}
        leadTitle="Programme Focus & Strategic Pillars"
        leadDescription={tr.summary || ''}
        charLimit={340}
        siteData={siteData}
        navigate={navigate}
        metrics={[
          { type: 'beneficiaries', number: 18500, suffix: '+' },
          { type: 'youth reached', number: 6400, suffix: '+' },
          { type: 'locations', number: 8, suffix: ' Wards' },
          { type: 'partners', number: 14, suffix: ' Orgs' },
        ]}
      >
        <div className="py-2 flex items-center gap-4" role="separator">
          <div className="h-[2px] flex-1 bg-[#E6A500]" />
          <span className="px-4 py-1 bg-[#E6A500] text-black font-extrabold uppercase tracking-wider text-[15px]">
            Programme Overview & Focus Areas
          </span>
          <div className="h-[2px] flex-1 bg-[#E6A500]" />
        </div>

        {/* 8/4 Split Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white border-2 border-[#E6A500] p-8 space-y-4">
              <h2 className="font-extrabold text-[30px] text-black">Programme Overview</h2>
              <div
                className="text-[18px] text-black space-y-4 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: tr.overview_html || `<p>${tr.summary}</p>` }}
              />
            </div>

            {(tr.key_focus_areas || []).length > 0 && (
              <div className="bg-white border-2 border-[#E6A500] p-8 space-y-4">
                <h3 className="font-extrabold text-[28px] text-black">Key Focus Areas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tr.key_focus_areas.map((area: string, i: number) => (
                    <div
                      key={i}
                      className="p-4 bg-[#E6A500]/15 border border-[#E6A500] flex items-start gap-3 text-[18px] font-bold text-black"
                    >
                      <CheckCircle2 className="w-6 h-6 text-[#E6A500] shrink-0 mt-0.5" />
                      <span>{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#E6A500] p-8 space-y-4">
              <h3 className="font-extrabold text-[28px] text-black">
                Programme Field Video Spotlight
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {((tr.showcase_video_ids || []).length > 0
                  ? tr.showcase_video_ids
                  : ['pdx8DWYJM_o', 'FgXXMyMLF9k']
                ).map((vid: string) => (
                  <div key={vid} className="aspect-video overflow-hidden bg-white border-4 border-white">
                    <YouTubeEmbed
                      videoId={vid}
                      title={`Field Spotlight Video ${vid}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white border-2 border-[#E6A500] p-8 space-y-5 sticky top-28">
              <h3 className="font-extrabold text-[24px] text-black">Programme Snapshot</h3>
              <div className="space-y-4 text-[18px]">
                <div>
                  <div className="font-extrabold text-black uppercase text-[15px]">Target Beneficiaries</div>
                  <div className="text-black mt-1">
                    {tr.target_groups || 'Vulnerable children, youth, and families'}
                  </div>
                </div>
                <div>
                  <div className="font-extrabold text-black uppercase text-[15px]">Geographic Coverage</div>
                  <div className="text-black mt-1">
                    {tr.geographic_areas || 'Dar es Salaam, Tanzania'}
                  </div>
                </div>
                {tr.impact_summary && (
                  <div className="p-4 bg-[#E6A500]/20 border-2 border-[#E6A500] text-black font-bold text-[18px]">
                    {tr.impact_summary}
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate('/get-involved')}
                className="w-full py-3.5 bg-[#E6A500] text-black text-[18px] font-extrabold hover:bg-[#F2F2F2] transition"
              >
                Partner on This Programme
              </button>
            </div>
          </aside>
        </div>
      </StandardPageTemplate>
    );
  }

  const cmsPage = (siteData.pages || []).find((p: any) => p.page_key === 'programmes' && p.status !== 'archived');
  const tr = (cmsPage?.page_translations || []).find((t: any) => t.language === lang) || (cmsPage?.page_translations || [])[0] || {};
  const progSettings = siteData.settings?.programmes_page_settings || {};
  const pageTitle = progSettings.hero_title || tr.title || (lang === 'en' ? 'Our 6 Strategic Programmes' : 'Programu Zetu 6 za Kimkakati');
  const pageBadge = progSettings.hero_badge || tr.hero_tag || dict.nav.ourWork;
  const heroImage = progSettings.hero_banner_image || resolveMediaUrl(cmsPage?.featured_media_id, media) || '/media/public/images/programmes/arts1.webp';
  const leadTitle = progSettings.lead_title || "Comprehensive Child Protection & Youth Empowerment Framework";
  const leadDescription = progSettings.lead_description || tr.subtitle || "Babawatoto Organization executes six core strategic programmes in Tanzania: Child Protection & Street Outreach, Catch-up MEMKWA Education, Creative Arts (HEART), Youth Livelihoods & Vocational Training, Community Advocacy, and Human Rights & Reintegration.";

  return (
    <StandardPageTemplate
      pageKey="programmes"
      pageTitle={pageTitle}
      pageBadge={pageBadge}
      heroImage={heroImage}
      leadTitle={leadTitle}
      leadDescription={leadDescription}
      charLimit={340}
      siteData={siteData}
      navigate={navigate}
      metrics={[
        { type: 'beneficiaries', number: 28400, suffix: '+' },
        { type: 'youth reached', number: 12500, suffix: '+' },
        { type: 'locations', number: 14, suffix: ' Wards' },
        { type: 'emergency respondent', number: 380, suffix: '+' },
        { type: 'hospitals', number: 8, suffix: ' Referral Units' },
        { type: 'partners', number: 26, suffix: ' Orgs' },
      ]}
    >
      <div className="py-2 flex items-center gap-4" role="separator">
        <div className="h-[2px] flex-1 bg-[#E6A500]" />
        <span className="px-4 py-1 bg-[#E6A500] text-black font-extrabold uppercase tracking-wider text-[15px]">
          Core Programme Pillars
        </span>
        <div className="h-[2px] flex-1 bg-[#E6A500]" />
      </div>

      {programmes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programmes.map((prog: any) => {
            const tr =
              (prog.programme_translations || []).find((t: any) => t.language === lang) ||
              (prog.programme_translations || [])[0] ||
              {};
            const imgUrl = resolveMediaUrl(prog.featured_image_id, media);
            return (
              <div
                key={prog.id}
                onClick={() => navigate(`/programmes/${tr.slug || prog.category_key}`)}
                className="bg-white border-2 border-[#E6A500] overflow-hidden hover:border-black transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {imgUrl && (
                    <img src={imgUrl} alt={tr.title} className="w-full h-56 object-cover" />
                  )}
                  <div className="p-6 space-y-3">
                    <h3 className="font-extrabold text-[24px] text-black">{tr.title}</h3>
                    <p className="text-[18px] text-black leading-relaxed">{tr.summary}</p>
                  </div>
                </div>
                <div className="px-6 pb-6 text-[18px] font-extrabold text-black flex items-center gap-2">
                  <span>{dict.common.learnMore}</span>
                  <ArrowRight className="w-5 h-5 text-[#E6A500]" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyStateCard
          title={dict.emptyStates.programmesTitle}
          description={dict.emptyStates.programmesDesc}
        />
      )}
    </StandardPageTemplate>
  );
}

