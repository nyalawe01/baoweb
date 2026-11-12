import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  FileText,
  Download,
  Search,
  ShieldCheck,
  Users,
  Handshake,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  BarChart3,
  HeartHandshake,
  FolderKanban,
  Newspaper,
  Play,
  Image as ImageIcon,
  ArrowRight,
  ArrowLeft,
  Award,
  BookOpen,
  Scale,
  Sparkles,
  Building2,
  Ambulance,
  HeartPulse,
  ExternalLink,
  Globe,
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
import { UI_TRANSLATIONS, VERIFIED_BAO_PROJECTS, type LanguageCode } from '@bao/shared';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  EmptyStateCard,
  resolveMediaUrl,
  DEFAULT_PRIORITY_PROJECTS,
} from './HomeAndProgrammesViews.js';
import { YouTubeEmbed } from './YouTubeEmbed.js';
/**
 * Animated Counter Component for Impact Metrics
 */
function MetricAnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1500; // ms
    let frameId: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [target]);
  return <span>{count.toLocaleString()}</span>;
}
/**
 * Standard Inner Page Hero Banner & Structure Template
 * 1. Single image hero banner with a floating grid component at bottom left holding page title.
 * 2. Starting section with small title and lead paragraph with character overflow split into second paragraph.
 * 3. Impact metrics counter component (Youth Reached, Locations, Emergency Respondent, Beneficiaries, Hospitals, Partners).
 * 4. Second paragraph continuation space (uses same typography as top paragraph).
 * 5. Attached News Section (displaying latest published news or custom selection with images & descriptions).
 */
export function StandardPageTemplate({
  pageTitle,
  pageBadge,
  heroImage = '/media/public/images/organization/hero1.webp',
  leadTitle,
  leadDescription = '',
  charLimit = 360,
  pageKey,
  metrics,
  siteData,
  navigate,
  hideNews = false,
  hideMetrics = false,
  children,
}: {
  pageTitle: string;
  pageBadge?: string;
  heroImage?: string;
  leadTitle?: string;
  leadDescription?: string;
  charLimit?: number;
  pageKey?: string;
  metrics?: Array<{
    type: 'youth reached' | 'locations' | 'emergency respondent' | 'beneficiaries' | 'hospitals' | 'partners';
    number: number;
    suffix?: string;
  }>;
  siteData: any;
  navigate?: (path: string) => void;
  hideNews?: boolean;
  hideMetrics?: boolean;
  children?: React.ReactNode;
}) {
  // Character limit splitting for lead description
  const cleanDesc = (leadDescription || '').trim();
  let firstParagraph = cleanDesc;
  let secondParagraph = '';
  if (!hideMetrics && cleanDesc.length > charLimit) {
    // Find closest sentence or space before charLimit
    const cutoff = cleanDesc.lastIndexOf(' ', charLimit);
    const splitIndex = cutoff > charLimit * 0.7 ? cutoff : charLimit;
    firstParagraph = cleanDesc.slice(0, splitIndex).trim();
    secondParagraph = cleanDesc.slice(splitIndex).trim();
  }
  // Available metrics definition with icons
  const metricIconMap: Record<string, any> = {
    'youth reached': Users,
    'locations': MapPin,
    'emergency respondent': Ambulance,
    'beneficiaries': HeartHandshake,
    'hospitals': HeartPulse,
    'partners': Handshake,
  };
  const defaultMetrics: Array<{
    type: 'youth reached' | 'locations' | 'emergency respondent' | 'beneficiaries' | 'hospitals' | 'partners';
    number: number;
    suffix?: string;
  }> = [
      { type: 'youth reached', number: 12500, suffix: '+' },
      { type: 'locations', number: 14, suffix: ' Wards' },
      { type: 'emergency respondent', number: 380, suffix: '+' },
      { type: 'beneficiaries', number: 28400, suffix: '+' },
      { type: 'hospitals', number: 8, suffix: ' Referral Units' },
      { type: 'partners', number: 26, suffix: ' Orgs' },
    ];
  const activeMetrics = metrics && metrics.length > 0 ? metrics : defaultMetrics;
  const newsList: any[] = (siteData.news || []).slice(0, 3);
  return (
    <div className="w-full space-y-12 pb-16">
      {/* 1. HERO SECTION: Full-width Edge-to-Edge matching Home Hero Section size & layout */}
      <section className="relative w-full bg-[#E6A500] text-black overflow-hidden">
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{
            backgroundImage: `url('${heroImage}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#E6A500] via-[#E6A500]/90 to-white/25" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Badge, Title & Lead Description */}
          <div className="lg:col-span-7 space-y-6">
            {pageBadge && (
              <span className="inline-block px-3.5 py-1.5 bg-black text-white text-xs font-black uppercase tracking-wider mb-2">
                {pageBadge}
              </span>
            )}
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-black">
              {pageTitle}
            </h1>
            {leadDescription && (
              <div className="text-base sm:text-lg text-black max-w-2xl leading-relaxed font-medium space-y-2">
                <p>{firstParagraph}</p>
              </div>
            )}
          </div>
          {/* Right Column: Prominent Attached Hero Image Showcase */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-none border-4 border-white bg-black/10">
              <img
                src={heroImage}
                alt={pageTitle}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Main Page Content Body */}
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* 2. STARTING SECTION: Lead Title & Continuation Paragraph (if leadTitle or secondParagraph exists) */}
        {(leadTitle || secondParagraph) && (
          <section className="bg-white border border-gray-200 shadow-none p-8 lg:p-10 space-y-4">
            {leadTitle && (
              <div className="inline-block">
                <span className="px-3.5 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[15px] tracking-wider">
                  {leadTitle}
                </span>
              </div>
            )}
            <p className="text-[18px] text-black leading-relaxed font-medium">
              {secondParagraph || firstParagraph}
            </p>
          </section>
        )}
      {/* 3. IMPACT METRICS COMPONENT: Animated Counters for Chosen Metrics (Borderless, Centered, 3-Row Layout) */}
      {!hideMetrics && (
        <section className="bg-white border-0 shadow-none p-6 lg:p-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[13px] font-extrabold uppercase tracking-wider px-3 py-1 bg-[#E6A500] text-black inline-block">
              Verified Reach & MEL Indicators
            </span>
            <h2 className="text-[28px] sm:text-[32px] font-extrabold text-black">
              Measurable Impact Across Tanzania
            </h2>
          </div>

          <div
            className={`grid gap-8 items-center justify-center ${
              activeMetrics.length === 4
                ? 'grid-cols-2 md:grid-cols-4'
                : activeMetrics.length <= 3
                  ? 'grid-cols-1 md:grid-cols-3'
                  : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
            }`}
          >
            {activeMetrics.map((met, idx) => {
              const IconComponent = metricIconMap[met.type] || BarChart3;
              return (
                <div
                  key={idx}
                  className="p-4 bg-transparent border-0 shadow-none flex flex-col items-center justify-center text-center space-y-2"
                >
                  {/* Row 1: Logo / Icon */}
                  <div className="w-10 h-10 flex items-center justify-center bg-transparent mb-1">
                    <IconComponent className="w-8 h-8 text-black stroke-[1.75]" />
                  </div>

                  {/* Row 2: Number / Numerical Metric */}
                  <div className="text-[28px] sm:text-[32px] lg:text-[36px] font-extrabold text-black leading-tight tracking-tight flex flex-wrap items-baseline justify-center gap-x-1">
                    <MetricAnimatedCounter target={met.number} />
                    <span className="text-[18px] sm:text-[20px] font-bold text-[#E6A500]">
                      {met.suffix || '+'}
                    </span>
                  </div>

                  {/* Row 3: Text */}
                  <div className="text-[14px] sm:text-[15px] font-extrabold text-black uppercase tracking-wider leading-snug text-center">
                    {met.type}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. OVERFLOW NARRATIVE CONTINUATION PARAGRAPH (Same Type Format) */}
      {secondParagraph && (
        <section className="bg-white border border-gray-200 shadow-none p-8 lg:p-10 space-y-4">
          <p className="text-[18px] text-black leading-relaxed font-medium">
            {secondParagraph}
          </p>
        </section>
      )}

      {/* Children Components / Custom Page Sections */}
      {children}

      {/* 5. ATTACHED NEWS SECTION (Published News Articles with Images and Descriptions) */}
      {!hideNews && (
        <section className="space-y-6 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-3">
            <div>
              <span className="text-[13px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-[#E6A500] text-black inline-block">
                Latest Updates & Community Stories
              </span>
              <h2 className="text-[28px] font-extrabold text-black mt-1">
                Organizational News & Field Dispatches
              </h2>
            </div>
            {navigate && (
              <button
                onClick={() => navigate('/news')}
                className="bao-btn px-4 py-2 text-black font-extrabold text-[15px] inline-flex items-center gap-1.5"
              >
                <span>View All News</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            )}
          </div>
          {newsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {newsList.map((item: any) => {
                const tr = (item.article_translations || [])[0] || (item.news_article_translations || [])[0] || {};
                const title = tr.title || item.title || 'Community Update';
                const excerpt = tr.excerpt || item.excerpt || 'Read more about recent developments at Babawatoto.';
                const image = resolveMediaUrl(item.featured_image_id || item.featured_media_id, siteData.media) || '/media/public/images/programmes/arts1.webp';
                return (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 shadow-none rounded-xl overflow-hidden flex flex-col justify-between group hover:border-black transition"
                  >
                    <div className="h-48 overflow-hidden bg-[#E6A500]/15">
                      <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    </div>
                    <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="px-2.5 py-0.5 bg-[#E6A500] text-black font-bold text-[13px] uppercase inline-block mb-1">
                          {item.published_at ? new Date(item.published_at).toLocaleDateString() : 'News'}
                        </span>
                        <h3 className="font-extrabold text-[20px] text-black leading-snug line-clamp-2">
                          {title}
                        </h3>
                        <p className="text-[16px] text-black/80 mt-1 line-clamp-3 leading-relaxed">
                          {excerpt}
                        </p>
                      </div>
                      {navigate && (
                        <div className="pt-2">
                          <button
                            onClick={() => navigate('/news')}
                            className="text-[15px] font-bold text-black inline-flex items-center gap-1 group-hover:translate-x-1 transition"
                          >
                            <span>Read full article</span>
                            <ArrowRight className="w-4 h-4 text-black" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 bg-white border border-gray-200 shadow-none rounded-xl text-center space-y-2">
              <Newspaper className="w-8 h-8 text-[#E6A500] mx-auto" />
              <p className="text-[18px] font-bold text-black">
                News and stories will appear here as soon as they are published via the CMS dashboard.
              </p>
            </div>
          )}
        </section>
      )}
      </div>
    </div>
  );
}
/**
 * Professional Section Separator Component (#E6A500 orange & white theme, black text)
 */
export function SectionSeparator({ label }: { label?: string }) {
  return (
    <div className="py-4 flex items-center gap-4" role="separator">
      <div className="h-[2px] flex-1 bg-[#E6A500]" />
      {label && (
        <span className="px-4 py-1 bg-[#E6A500] text-black font-extrabold uppercase tracking-wider text-[15px]">
          {label}
        </span>
      )}
      <div className="h-[2px] flex-1 bg-[#E6A500]" />
    </div>
  );
}
/**
 * Renders any custom CMS Page Builder blocks attached to a given page_key
 */
export function DynamicCmsPageBlocks({
  pageKey,
  lang,
  siteData,
  hideSeparator = false,
}: {
  pageKey: string;
  lang: LanguageCode;
  siteData: any;
  hideSeparator?: boolean;
}) {
  const pages = siteData.pages || [];
  const matchedPage = pages.find((p: any) => p.page_key === pageKey && p.status !== 'archived');
  if (!matchedPage) return null;
  const tr =
    (matchedPage.page_translations || []).find((t: any) => t.language === lang) ||
    (matchedPage.page_translations || [])[0];
  const blocks: any[] = Array.isArray(tr?.blocks) ? tr.blocks : [];
  if (blocks.length === 0) return null;
  return (
    <div className="space-y-10 pt-4">
      {!hideSeparator && <SectionSeparator label="CMS Custom Page Sections" />}
      {blocks.map((blk: any) => {
        if (blk.type === 'heading') {
          return (
            <div key={blk.id} className="space-y-2">
              {blk.data?.subtitle && (
                <span className="px-3 py-1 bg-[#E6A500] text-black font-bold uppercase text-[15px] inline-block">
                  {blk.data.subtitle}
                </span>
              )}
              <h2 className="text-[32px] font-extrabold text-black">{blk.data?.text}</h2>
            </div>
          );
        }
        if (blk.type === 'rich_text') {
          const content = blk.data?.html || blk.data?.body || blk.data?.text || '';
          const hasHtml = /<[a-z][\s\S]*>/i.test(content);
          return (
            <div
              key={blk.id}
              className="bg-white border border-gray-200 shadow-none p-8 text-[18px] text-black leading-relaxed space-y-4"
            >
              {hasHtml ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                content.split('\n\n').filter(Boolean).map((para: string, pIdx: number) => (
                  <p key={pIdx} className="mb-4">
                    {para.split('\n').map((line: string, lIdx: number, arr: string[]) => (
                      <React.Fragment key={lIdx}>
                        {line}
                        {lIdx < arr.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
                ))
              )}
            </div>
          );
        }
        if (blk.type === 'single_image' && blk.data?.image_url) {
          return (
            <figure
              key={blk.id}
              className="bg-white border border-gray-200 shadow-none p-4 space-y-3"
            >
              <img
                src={blk.data.image_url}
                alt={blk.data.caption || 'Babawatoto Field Image'}
                className="w-full max-h-[520px] object-cover"
              />
              {blk.data.caption && (
                <figcaption className="text-[18px] font-semibold text-black px-2">
                  {blk.data.caption}
                </figcaption>
              )}
            </figure>
          );
        }
        if (blk.type === 'image_and_text') {
          const isRight = blk.data?.image_position !== 'left';
          return (
            <div
              key={blk.id}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-gray-200 shadow-none p-8"
            >
              {isRight ? (
                <>
                  <div className="lg:col-span-7 space-y-4">
                    {blk.data?.subtitle && (
                      <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[15px] inline-block">
                        {blk.data.subtitle}
                      </span>
                    )}
                    <h3 className="text-[28px] font-extrabold text-black">{blk.data?.heading}</h3>
                    <p className="text-[18px] text-black leading-relaxed whitespace-pre-line">{blk.data?.body}</p>
                  </div>
                  {blk.data?.image_url && (
                    <div className="lg:col-span-5">
                      <figure className="border-4 border-white shadow-none overflow-hidden bg-[#F2F2F2]">
                        <img
                          src={blk.data.image_url}
                          alt={blk.data.heading || 'Babawatoto'}
                          className="w-full h-80 object-cover"
                        />
                        {blk.data?.caption && (
                          <figcaption className="p-3 bg-white text-xs font-semibold text-black/75">
                            {blk.data.caption}
                          </figcaption>
                        )}
                      </figure>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {blk.data?.image_url && (
                    <div className="lg:col-span-5">
                      <figure className="border-4 border-white shadow-none overflow-hidden bg-[#F2F2F2]">
                        <img
                          src={blk.data.image_url}
                          alt={blk.data.heading || 'Babawatoto'}
                          className="w-full h-80 object-cover"
                        />
                        {blk.data?.caption && (
                          <figcaption className="p-3 bg-white text-xs font-semibold text-black/75">
                            {blk.data.caption}
                          </figcaption>
                        )}
                      </figure>
                    </div>
                  )}
                  <div className="lg:col-span-7 space-y-4">
                    {blk.data?.subtitle && (
                      <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[15px] inline-block">
                        {blk.data.subtitle}
                      </span>
                    )}
                    <h3 className="text-[28px] font-extrabold text-black">{blk.data?.heading}</h3>
                    <p className="text-[18px] text-black leading-relaxed whitespace-pre-line">{blk.data?.body}</p>
                  </div>
                </>
              )}
            </div>
          );
        }
        if (blk.type === 'two_column_layout') {
          return (
            <div key={blk.id} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-gray-200 shadow-none p-8 space-y-4">
                <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[15px] inline-block">
                  {blk.data?.left_title || 'Vision'}
                </span>
                <p className="text-[18px] font-medium text-black leading-relaxed whitespace-pre-line">{blk.data?.left_body}</p>
              </div>
              <div className="bg-white border border-gray-200 shadow-none p-8 space-y-4">
                <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[15px] inline-block">
                  {blk.data?.right_title || 'Mission'}
                </span>
                <p className="text-[18px] font-medium text-black leading-relaxed whitespace-pre-line">{blk.data?.right_body}</p>
              </div>
            </div>
          );
        }
        if (blk.type === 'three_column_layout') {
          return (
            <div key={blk.id} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: blk.data?.col1_title, body: blk.data?.col1_body, img: blk.data?.col1_image },
                { title: blk.data?.col2_title, body: blk.data?.col2_body, img: blk.data?.col2_image },
                { title: blk.data?.col3_title, body: blk.data?.col3_body, img: blk.data?.col3_image },
              ].map((c, i) => (
                <div key={i} className="bg-white border border-gray-200 shadow-none overflow-hidden flex flex-col justify-between">
                  <div>
                    {c.img && <img src={c.img} alt={c.title || ''} className="w-full h-56 object-cover" />}
                    <div className="p-6 space-y-3">
                      <h3 className="text-[24px] font-extrabold text-black">{c.title}</h3>
                      <p className="text-[18px] text-black leading-relaxed whitespace-pre-line">{c.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        }
        if (blk.type === 'call_to_action') {
          return (
            <div key={blk.id} className="bg-[#E6A500] text-black p-8 lg:p-12 space-y-4 text-center">
              <h3 className="text-[32px] font-extrabold">{blk.data?.heading}</h3>
              {blk.data?.subtext && <p className="text-[18px] max-w-2xl mx-auto">{blk.data?.subtext}</p>}
              {blk.data?.primary_label && (
                <a
                  href={blk.data?.primary_url || '/contact'}
                  className="bao-btn px-6 py-3 font-extrabold text-black inline-block mt-2"
                >
                  {blk.data?.primary_label}
                </a>
              )}
            </div>
          );
        }
        if (blk.type === 'video_embed' && blk.data?.youtube_id) {
          return (
            <div key={blk.id} className="bg-[#E6A500] p-8 space-y-4">
              <h3 className="text-[26px] font-extrabold text-black">
                {blk.data.title || 'Featured Documentary Video'}
              </h3>
              <div className="aspect-video bg-white border-4 border-white">
                <YouTubeEmbed
                  videoId={blk.data.youtube_id}
                  title={blk.data.title || 'Video'}
                />
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
/**
 * Reusable Media & Video Attachment Showcase Section for Standalone Pages
 */
function MediaAndVideoShowcaseSection({
  sectionLabel,
  photos,
  videoId,
  videoTitle,
  videoDescription,
  navigate,
}: {
  sectionLabel: string;
  photos: { src: string; title: string; caption: string }[];
  videoId: string;
  videoTitle: string;
  videoDescription: string;
  navigate: (path: string) => void;
}) {
  return (
    <div className="space-y-12">
      <SectionSeparator label={sectionLabel} />
      {/* Field Photography Gallery Slots */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="px-3 py-1 bg-[#E6A500] text-black font-bold uppercase text-[15px] inline-flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-black" /> Verified Field Photography
            </span>
            <h2 className="text-[32px] font-extrabold text-black mt-2">
              Field Photographs & Visual Documentation
            </h2>
          </div>
          <button
            onClick={() => navigate('/resources/gallery')}
            className="bao-btn px-4 py-2.5 text-black font-bold text-[18px] flex items-center gap-2"
          >
            <span>Open Full Gallery</span>
            <ArrowRight className="w-5 h-5 text-black" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {photos.map((ph, i) => (
            <figure
              key={i}
              className="bg-white border border-gray-200 shadow-none overflow-hidden flex flex-col justify-between group"
            >
              <div className="h-64 overflow-hidden bg-[#E6A500]/15">
                <img
                  src={ph.src}
                  alt={ph.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <figcaption className="p-5 space-y-1.5 bg-white">
                <div className="text-[20px] font-bold text-black">{ph.title}</div>
                <p className="text-[18px] text-black/85 leading-relaxed">{ph.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <SectionSeparator label="Documentary & Video Spotlight" />
      {/* Embedded YouTube Documentary Video Slot */}
      <div className="bg-[#E6A500] text-black p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-5 space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white text-black font-bold uppercase text-[15px]">
            <Play className="w-4 h-4 text-black" /> Official Video Feature
          </span>
          <h3 className="text-[30px] font-extrabold text-black leading-tight">{videoTitle}</h3>
          <p className="text-[18px] text-black font-medium leading-relaxed">{videoDescription}</p>
          <div className="pt-2">
            <a
              href="https://www.youtube.com/@babawatotoorganization"
              target="_blank"
              rel="noreferrer"
              className="bao-btn inline-flex items-center gap-2 px-5 py-3 text-black font-bold text-[18px]"
            >
              <span>Watch More on @babawatotoorganization</span>
              <ArrowRight className="w-5 h-5 text-black" />
            </a>
          </div>
        </div>
        <div className="lg:col-span-7">
          <div className="aspect-video bg-white border-4 border-white shadow-none overflow-hidden">
            <YouTubeEmbed
              videoId={videoId}
              title={videoTitle}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
/**
 * Standalone Multi-Section Pages for Every "Who we are" / "/about/*" Route
 * (No horizontal sub-tab bar; each sub-route is a distinct, complete professional page)
 */
export function AboutView({
  lang,
  subpage,
  siteData,
  navigate,
}: {
  lang: LanguageCode;
  subpage?: string;
  siteData: any;
  navigate: (path: string) => void;
}) {
  const dict = UI_TRANSLATIONS[lang];
  const org = siteData.settings?.organization_profile || {};
  const team = siteData.team || [];
  const media = siteData.media || [];
  const pageSlug = subpage || 'who-we-are';
  // 1. STANDALONE PAGE: /about/about-street-children
  if (pageSlug === 'about-street-children') {
    const hasAsc = 'about_street_children' in (siteData.settings || {});
    const ascData = siteData.settings?.about_street_children || {};
    const cmsPage = (siteData.pages || []).find(
      (p: any) => p.page_key === 'about-street-children' && p.status !== 'archived'
    );
    const tr =
      (cmsPage?.page_translations || []).find((t: any) => t.language === lang) ||
      (cmsPage?.page_translations || [])[0] ||
      {};
    const pageTitle = ascData.title || tr.title || "About Street-Connected Children";
    const pageBadge = ascData.hero_badge || tr.hero_tag || "Child Rights & Protection";
    const heroImage =
      ascData.hero_image ||
      resolveMediaUrl(cmsPage?.featured_media_id, siteData.media) ||
      cmsPage?.hero_image ||
      "/media/public/images/organization/abouts.webp";
    const leadTitle = ascData.lead_title || tr.excerpt || "Understanding Realities, Rights & Potential of Children on the Streets";
    const defaultLeadDesc =
      "Street-connected children and youth in Tanzania are children for whom the street has become a central reference point—whether for daily survival, temporary shelter, or informal livelihood. At Babawatoto Centre for Children and Youth Trust (BAO), we recognize that every street-connected child possesses inherent human dignity and full legal rights under Tanzania’s Law of the Child Act (2009) and the UN Convention on the Rights of the Child. Rather than viewing street-connected children as passive victims, BAO’s social workers, educators, and creative arts mentors meet children where they are—providing daily street outreach, trauma-informed psychosocial counselling, safe family tracing, and accelerated catch-up education.";
    const leadDescription = hasAsc
      ? (ascData.lead_description !== undefined ? ascData.lead_description.trim() : '')
      : (tr.subtitle || defaultLeadDesc);
    const blocks: any[] = Array.isArray(tr.blocks) ? tr.blocks : [];
    const contextHeading = ascData.context_heading || "";
    const contextText = hasAsc && ascData.context_text !== undefined ? ascData.context_text.trim() : "";
    const contextImage = ascData.context_image || "";
    const pillars = hasAsc && Array.isArray(ascData.pillars) ? ascData.pillars : [];
    const spotlightBadge = ascData.spotlight_badge || "";
    const spotlightHeading = ascData.spotlight_heading || "";
    const spotlightText = hasAsc && ascData.spotlight_text !== undefined ? ascData.spotlight_text.trim() : "";
    const spotlightImage = ascData.spotlight_image || "";
    const spotlightCaption = ascData.spotlight_caption || "";
    return (
      <StandardPageTemplate
        pageKey="street-children"
        pageTitle={pageTitle}
        pageBadge={pageBadge}
        heroImage={heroImage}
        leadTitle={leadTitle}
        leadDescription={leadDescription}
        charLimit={340}
        siteData={siteData}
        navigate={navigate}
        hideNews={true}
      >
        {/* Split Image & Narrative Section - only render if contextText is present */}
        {contextText && (
          <>
            <SectionSeparator label="Understanding the Context" />
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white border border-gray-200 shadow-none p-8 lg:p-10">
              <div className="lg:col-span-7 space-y-5">
                <h2 className="text-[32px] font-extrabold text-black">
                  {contextHeading}
                </h2>
                <div className="text-[18px] text-black leading-relaxed space-y-4">
                  {contextText.split('\n\n').map((para: string, idx: number) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-5">
                <img
                  src={contextImage}
                  alt={contextHeading}
                  className="w-full h-80 object-cover border border-gray-200 shadow-none"
                />
              </div>
            </section>
          </>
        )}
        {/* 3 Pillar Cards - only render if pillars exist */}
        {pillars.length > 0 && (
          <>
            <SectionSeparator label="Core Protection Pillars" />
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pillars.map((card: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 shadow-none overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <img src={card.img} alt={card.title} className="w-full h-56 object-cover" />
                    <div className="p-6 space-y-3">
                      <h3 className="text-[24px] font-extrabold text-black">{card.title}</h3>
                      <p className="text-[18px] text-black leading-relaxed">{card.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
        {/* Commemorative Narrative & Feature Image Section - only render if spotlightText is present */}
        {spotlightText && (
          <>
            <SectionSeparator label="Commemorative Story & Impact" />
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-gray-200 shadow-none p-8 lg:p-12">
              <div className="lg:col-span-7 space-y-4">
                <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[15px] inline-block">
                  {spotlightBadge}
                </span>
                <h3 className="text-[30px] font-extrabold text-black">
                  {spotlightHeading}
                </h3>
                <div className="text-[18px] text-black leading-relaxed space-y-4">
                  {spotlightText.split('\n\n').map((para: string, idx: number) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-5">
                <figure className="border-4 border-white shadow-none overflow-hidden bg-[#F2F2F2]">
                  <img
                    src={spotlightImage}
                    alt={spotlightHeading}
                    className="w-full h-80 object-cover"
                  />
                  <figcaption className="p-3 bg-white text-xs font-semibold text-black/75">
                    {spotlightCaption}
                  </figcaption>
                </figure>
              </div>
            </section>
          </>
        )}
        <DynamicCmsPageBlocks pageKey="about-street-children" lang={lang} siteData={siteData} />
      </StandardPageTemplate>
    );
  }
  // 2. Growing up on the streets page removed -> Redirect to About street children
  if (pageSlug === 'growing-up-on-the-streets') {
    navigate('/about-street-children');
    return null;
  }
  // 3. Meet the team page removed -> Redirect to Leadership & Governance
  if (pageSlug === 'our-team' || pageSlug === 'team') {
    navigate('/leadership-governance');
    return null;
  }
  // 4. STANDALONE PAGE: /mission-vision or /about/mission-and-vision
  if (pageSlug === 'mission-and-vision' || pageSlug === 'mission-vision') {
    const hasVm = 'vision_and_mission' in (siteData.settings || {});
    const vmData = siteData.settings?.vision_and_mission || {};
    const vision = hasVm
      ? (vmData.vision !== undefined ? vmData.vision.trim() : '')
      : (org.vision_en || 'A society where children and youth enjoy their rights and live in dignity, free from all forms of abuse and exploitation.');
    const mission = hasVm
      ? (vmData.mission !== undefined ? vmData.mission.trim() : '')
      : (org.mission_en || 'To promote and protect the rights of children and youth through advocacy, education, and community empowerment programs that address the root causes of vulnerability and create sustainable change.');
    const defaultCoreValues = [
      {
        title: 'Child Safeguarding & Dignity First',
        description: 'Every child deserves absolute safety, emotional security, and unconditional respect across all settings.',
        image_url: '/media/public/images/projects/WATOTO.webp',
      },
      {
        title: 'Community Ownership & Inclusion',
        description: 'Grassroots families and community leaders actively co-create sustainable protection interventions.',
        image_url: '/media/public/images/projects/ahadi.webp',
      },
      {
        title: 'Creative Empowerment (HEART)',
        description: 'Transforming trauma into resilience and joy through acrobatics, theatre, and expressive arts.',
        image_url: '/media/public/images/programmes/arts1.webp',
      },
      {
        title: 'Transparency & Accountability',
        description: 'High humanitarian ethics, verified monitoring, and audited accountability to our stakeholders.',
        image_url: '/media/public/images/organization/hero3.webp',
      },
      {
        title: 'Evidence-Based Social Work',
        description: 'Rigorous individual case management, family tracing, and sustainable home reintegration.',
        image_url: '/media/public/images/programmes/IMG_1087.JPG',
      },
      {
        title: 'Youth Livelihoods & Autonomy',
        description: 'Equipping vulnerable youth and young mothers with apprentice skills and micro-enterprise capital.',
        image_url: '/media/public/images/projects/vocation.JPG',
      },
    ];
    const coreValues = hasVm
      ? (Array.isArray(vmData.core_values) ? vmData.core_values : [])
      : defaultCoreValues;
    const commitmentTitle = hasVm
      ? (vmData.commitment_title !== undefined ? vmData.commitment_title.trim() : '')
      : 'Our Unwavering Commitment to Tanzanian Children';
    const commitmentText = hasVm
      ? (vmData.commitment_text !== undefined ? vmData.commitment_text.trim() : '')
      : "At Babawatoto Centre for Children and Youth Trust (BAO), our commitment goes far beyond immediate humanitarian aid. Since 2007, we have remained on the frontlines of Dar es Salaam's most vulnerable communities—listening, mentoring, educating, and rebuilding broken family ties. We pledge to maintain safe spaces, uphold transparent governance, and advocate relentlessly until every street-connected child in Tanzania has a safe pathway home, quality education, and the dignity they deserve.";
    const commitmentImageUrl = vmData.commitment_image_url || '/media/public/images/organization/abouts.webp';
    const cmsPage = (siteData.pages || []).find((p: any) => p.page_key === 'mission-and-vision' && p.status !== 'archived');
    const tr = (cmsPage?.page_translations || []).find((t: any) => t.language === lang) || (cmsPage?.page_translations || [])[0] || {};
    const pageTitle = vmData.heading || tr.title || "Our Mission, Vision & Core Values";
    const pageBadge = vmData.hero_badge || tr.hero_tag || "Babawatoto Strategic Framework";
    const heroImage = vmData.hero_image || resolveMediaUrl(cmsPage?.featured_media_id, siteData.media) || "/media/public/images/organization/hero1.webp";
    const leadDescription = tr.subtitle || "Babawatoto Centre for Children and Youth Trust (BAO) operates under a clear, evidence-based strategic framework designed to protect vulnerable children, restore emotional well-being, and rebuild resilient family foundations across Tanzania. Our mission and vision guide every field outreach and community programme.";
    return (
      <StandardPageTemplate
        pageKey="vision-mission"
        pageTitle={pageTitle}
        pageBadge={pageBadge}
        heroImage={heroImage}
        leadTitle="Strategic Direction, Mandate & Child Safeguarding Integrity"
        leadDescription={leadDescription}
        charLimit={340}
        siteData={siteData}
        navigate={navigate}
        hideNews={true}
        metrics={[
          { type: 'beneficiaries', number: 28400, suffix: '+' },
          { type: 'youth reached', number: 12500, suffix: '+' },
          { type: 'locations', number: 14, suffix: ' Wards' },
          { type: 'partners', number: 26, suffix: ' Orgs' },
        ]}
      >
        {/* Centered Underlined Heading */}
        <div className="text-center py-6">
          <h2 className="text-[32px] sm:text-[44px] font-extrabold text-black inline-block border-b-4 border-gray-200 pb-2 tracking-tight">
            {vmData.heading || 'Our Vision, Mission & Core Values'}
          </h2>
          <p className="text-[18px] text-black/75 max-w-2xl mx-auto mt-4 font-medium">
            Strategic direction, core convictions, and institutional commitment steering our grassroots interventions across Tanzania.
          </p>
        </div>
        {/* Vision & Mission Cards - render only if at least one is present */}
        {(vision || mission) && (
          <section className={`grid grid-cols-1 ${vision && mission ? 'md:grid-cols-2' : ''} gap-8`}>
            {vision && (
              <div className="bg-white border border-gray-200 shadow-none p-8 lg:p-10 space-y-4 rounded-2xl hover:border-black transition flex flex-col justify-between">
                <div>
                  <span className="px-3.5 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[15px] inline-block mb-3">
                    Our Vision
                  </span>
                  <h3 className="text-[24px] sm:text-[28px] font-extrabold text-black leading-snug">
                    {vision}
                  </h3>
                </div>
              </div>
            )}
            {mission && (
              <div className="bg-white border border-gray-200 shadow-none p-8 lg:p-10 space-y-4 rounded-2xl hover:border-black transition flex flex-col justify-between">
                <div>
                  <span className="px-3.5 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[15px] inline-block mb-3">
                    Our Mission
                  </span>
                  <h3 className="text-[24px] sm:text-[28px] font-extrabold text-black leading-snug">
                    {mission}
                  </h3>
                </div>
              </div>
            )}
          </section>
        )}
        {/* Core Values Section - render only if core values exist */}
        {coreValues.length > 0 && (
          <>
            <SectionSeparator label="Our Core Values" />
            <div className="text-center space-y-2">
              <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[14px] inline-block">
                Guiding Principles
              </span>
              <h3 className="text-[30px] sm:text-[38px] font-extrabold text-black">
                Organizational Core Values
              </h3>
              <p className="text-[18px] text-black/70 max-w-xl mx-auto">
                Hover over any core value card to reveal its meaning and practical field implementation.
              </p>
            </div>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreValues.map((val: any, idx: number) => (
                <div
                  key={idx}
                  className="relative group h-72 sm:h-80 rounded-2xl overflow-hidden border border-gray-200 shadow-none cursor-pointer bg-black"
                >
                  <img
                    src={val.image_url || '/media/public/images/projects/WATOTO.webp'}
                    alt={val.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500 ease-out"
                  />
                  {/* Subtle base gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition duration-300" />
                  {/* Default Title Display at Bottom */}
                  <div className="absolute bottom-5 left-5 right-5 group-hover:opacity-0 transition duration-300 pointer-events-none">
                    <span className="px-3.5 py-1.5 bg-white text-black font-extrabold text-[17px] inline-block rounded-md shadow border border-gray-200">
                      {val.title}
                    </span>
                  </div>
                  {/* Hover Revealed Card Details */}
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] p-6 flex flex-col justify-end text-white opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[13px] inline-block w-fit rounded mb-2">
                      Core Value #{idx + 1}
                    </span>
                    <h4 className="text-[22px] font-extrabold text-white leading-snug">
                      {val.title}
                    </h4>
                    {val.description && (
                      <p className="text-[16px] text-white/90 mt-2 leading-relaxed">
                        {val.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
        {/* Our Commitment Area - render only if commitment text or title exists */}
        {(commitmentTitle || commitmentText) && (
          <>
            <SectionSeparator label="Our Commitment" />
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-gray-200 shadow-none p-8 lg:p-12 rounded-2xl shadow-sm">
              {/* Left Side: Image Placeholder / Photo */}
              <div className="lg:col-span-5">
                <div className="relative border-4 border-white shadow-none overflow-hidden rounded-2xl bg-[#F2F2F2]">
                  <img
                    src={commitmentImageUrl}
                    alt="Our Commitment to Children"
                    className="w-full h-80 sm:h-96 object-cover"
                  />
                  <div className="p-3 bg-white text-xs font-semibold text-black/75 border-t border-gray-200">
                    Babawatoto staff and community practitioners in Dar es Salaam.
                  </div>
                </div>
              </div>
              {/* Right Side: Text Area */}
              <div className="lg:col-span-7 space-y-4">
                <span className="px-3.5 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[15px] inline-block">
                  Institutional Pledge
                </span>
                {commitmentTitle && (
                  <h3 className="text-[30px] sm:text-[36px] font-extrabold text-black leading-tight">
                    {commitmentTitle}
                  </h3>
                )}
                {commitmentText && (
                  <p className="text-[18px] text-black leading-relaxed font-medium">
                    {commitmentText}
                  </p>
                )}
              </div>
            </section>
          </>
        )}
        <DynamicCmsPageBlocks pageKey="about-mission-and-vision" lang={lang} siteData={siteData} />
      </StandardPageTemplate>
    );
  }
  // 5. STANDALONE PAGE: /our-history or /history or /about/our-history
  if (pageSlug === 'our-history' || pageSlug === 'history') {
    const hasHistory = 'our_history' in (siteData.settings || {});
    const historyData = siteData.settings?.our_history || {};
    const historyText = hasHistory
      ? (historyData.history_text !== undefined ? historyData.history_text.trim() : '')
      : (org.history_summary_en ||
        'Founded in 2007 in Mburahati Barafu, Dar es Salaam, Babawatoto Centre for Children and Youth Trust (BAO) is a registered Tanzanian Non-Governmental Organization dedicated to protecting vulnerable children, reuniting street-connected youth with their families, and empowering communities.\n\nWhat started as a grassroots sanctuary offering hot meals, emergency medical aid, and basic care has evolved into a nationally recognized model of community-based child protection. Over the past 17 years, Babawatoto has developed integrated programs spanning MEMKWA Catch-Up Primary Education, HEART Creative Arts Therapy, Youth Vocational Livelihoods, and legal advocacy.');
    const blockTitle = hasHistory
      ? (historyData.block_title !== undefined ? historyData.block_title.trim() : '')
      : 'Building Hope, Restoring Dignity & Reconnecting Families';
    const blockText = hasHistory
      ? (historyData.block_text !== undefined ? historyData.block_text.trim() : '')
      : 'Throughout our grassroots history, Babawatoto has prioritized direct street outreach, family reunification, and community-led safeguarding. By partnering with local social welfare offices, municipal health centres, and dedicated caregivers, we have successfully restored hundreds of street-connected children to secure homes and provided adolescent youth with viable pathways out of extreme poverty.';
    const blockImage = historyData.block_image || '/media/public/images/organization/abouts.webp';
    const blockBadge = historyData.block_badge || 'Milestones in the Community';
    return (
      <div className="w-full space-y-12 pb-16">
        {/* Full-width Hero Section matching Home Hero Section size & layout */}
        <section className="relative w-full bg-[#E6A500] text-black overflow-hidden">
          <div
            className="absolute inset-0 opacity-25 bg-cover bg-center"
            style={{
              backgroundImage: `url('${historyData.hero_image || '/media/public/images/organization/hero1.webp'}')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#E6A500] via-[#E6A500]/90 to-white/25" />
          <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Badge, Title & Lead Description */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-block px-3.5 py-1.5 bg-black text-white text-xs font-black uppercase tracking-wider mb-2">
                {historyData.hero_badge || 'Our Journey Since 2007'}
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-black">
                {historyData.title || 'Our History'}
              </h1>
              <p className="text-base sm:text-lg text-black max-w-2xl leading-relaxed font-medium">
                Nearly two decades of unwavering commitment, empowering street-connected children, restoring families, and building grassroots community resilience in Tanzania.
              </p>
            </div>
            {/* Right Column: Prominent Attached Hero Image Showcase */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-none border-4 border-white bg-black/10">
                <img
                  src={historyData.hero_image || '/media/public/images/organization/hero1.webp'}
                  alt={historyData.title || 'Our History'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        {/* Main Body Content */}
        <div className="max-w-7xl mx-auto px-4 space-y-12">
          {/* Paragraph Area where User Writes the History - only render if historyText is present */}
          {historyText && (
            <section className="bg-white border border-gray-200 shadow-none p-8 lg:p-12 space-y-4 rounded-2xl">
              <span className="px-3.5 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[15px] inline-block">
                The Babawatoto Story
              </span>
              <h2 className="text-[30px] sm:text-[38px] font-extrabold text-black leading-tight">
                {historyData.title || 'Nearly Two Decades of Grassroots Transformation'}
              </h2>
              <div className="text-[18px] text-black leading-relaxed font-medium space-y-4">
                {historyText.split('\n\n').map((para: string, idx: number) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </section>
          )}
          {/* Component Block: Image on Left, Text on Right - only render if title or text is present */}
          {(blockTitle || blockText) && (
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-gray-200 shadow-none p-8 lg:p-12 rounded-2xl">
              {/* Image on the left */}
              <div className="lg:col-span-5">
                <div className="relative border-4 border-white shadow-none overflow-hidden rounded-2xl bg-[#F2F2F2]">
                  <img
                    src={blockImage}
                    alt="Milestones in the Community"
                    className="w-full h-80 sm:h-96 object-cover"
                  />
                  <div className="p-3 bg-white text-xs font-semibold text-black/75 border-t border-gray-200">
                    {historyData.block_image_caption || 'Babawatoto community empowerment & child protection activities in Dar es Salaam.'}
                  </div>
                </div>
              </div>
              {/* Text on the right */}
              <div className="lg:col-span-7 space-y-4">
                <span className="px-3.5 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[15px] inline-block">
                  {blockBadge}
                </span>
                {blockTitle && (
                  <h3 className="text-[28px] sm:text-[36px] font-extrabold text-black leading-tight">
                    {blockTitle}
                  </h3>
                )}
                {blockText && (
                  <p className="text-[18px] text-black leading-relaxed font-medium">
                    {blockText}
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }
  if (
    pageSlug === 'leadership-and-governance' ||
    pageSlug === 'leadership-governance' ||
    pageSlug === 'governance'
  ) {
    const hasGov = 'leadership_and_governance' in (siteData.settings || {});
    const govData = siteData.settings?.leadership_and_governance || {};
    const defaultGovText =
      'Babawatoto Centre for Children and Youth Trust (BAO) is governed by a dedicated Board of Trustees, an Executive Leadership Council, and multidisciplinary field practitioners who maintain strict safeguarding oversight and humanitarian accountability.\n\nOur leadership combines decades of experience across child welfare social work, accelerated education, creative arts therapy, and human rights advocacy. Together, we ensure every Tanzanian shilling and donor grant directly advances the protection and empowerment of vulnerable children.';
    const govText = hasGov
      ? (govData.narrative_text !== undefined ? govData.narrative_text.trim() : '')
      : defaultGovText;
    const defaultStaff = [
      {
        id: 'lead-1',
        name: 'Mgunga Mwamnyenyelwa',
        role: 'Founder & Executive Director',
        department: 'Executive Leadership',
        photo_url: '/media/public/images/staff/mgunga.webp',
        bio: 'Pioneered Babawatoto in 2007, championing community child protection, MEMKWA schooling, and expressive arts therapy.',
      },
      {
        id: 'lead-2',
        name: 'Lugano Mwakisambwe',
        role: 'Senior Social Welfare Officer',
        department: 'Child Protection & Reintegration',
        photo_url: '/media/public/images/staff/lugano.webp',
        bio: 'Oversees field intake assessment, crisis mediation, and family reunification across Dar es Salaam.',
      },
      {
        id: 'lead-3',
        name: 'Amina Salum',
        role: 'MEMKWA Education Coordinator',
        department: 'Non-Formal Education',
        photo_url: '/media/public/images/staff/mgunga.webp',
        bio: 'Coordinates accelerated primary curriculum enabling out-of-school children to re-enter formal schooling.',
      },
      {
        id: 'lead-4',
        name: 'Juma Ramadhani',
        role: 'HEART Creative Arts Mentor',
        department: 'Psychosocial Arts',
        photo_url: '/media/public/images/staff/lugano.webp',
        bio: 'Leads acrobatic workshops, music therapy, and stage performance building youth self-worth.',
      },
    ];
    const customMembers = hasGov
      ? (Array.isArray(govData.members) ? govData.members : [])
      : null;
    const dbTeam = Array.isArray(siteData.team) && siteData.team.length > 0 ? siteData.team.map((m: any) => {
      const enT = (m.team_member_translations || []).find((t: any) => t.language === 'en') || {};
      const photoUrl = resolveMediaUrl(m.photo_media_id, siteData.media) || m.photo_url || '/media/public/images/staff/mgunga.webp';
      return {
        id: m.id,
        name: m.full_name,
        role: enT.role_title || m.leadership_group || 'Staff Member',
        department: m.leadership_group?.replace(/_/g, ' '),
        photo_url: photoUrl,
        bio: enT.bio_html?.replace(/<[^>]+>/g, '') || '',
      };
    }) : null;
    const staffList = customMembers !== null ? customMembers : (dbTeam || defaultStaff);
    return (
      <div className="w-full space-y-12 pb-16">
        {/* Full-width Hero Section matching Home Hero Section size & layout */}
        <section className="relative w-full bg-[#E6A500] text-black overflow-hidden">
          <div
            className="absolute inset-0 opacity-25 bg-cover bg-center"
            style={{
              backgroundImage: `url('${govData.hero_image || '/media/public/images/organization/hero1.webp'}')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#E6A500] via-[#E6A500]/90 to-white/25" />
          <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Badge, Title & Lead Description */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-block px-3.5 py-1.5 bg-black text-white text-xs font-black uppercase tracking-wider mb-2">
                {govData.hero_badge || 'Babawatoto Governance & Oversight'}
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-black">
                {govData.hero_title || 'Leadership & Governance'}
              </h1>
              <p className="text-base sm:text-lg text-black max-w-2xl leading-relaxed font-medium">
                Board of trustees, executive leadership, and multidisciplinary staff practitioners dedicated to child protection, transparent stewardship, and community impact.
              </p>
            </div>
            {/* Right Column: Prominent Attached Hero Image Showcase */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-none border-4 border-white bg-black/10">
                <img
                  src={govData.hero_image || '/media/public/images/organization/hero1.webp'}
                  alt={govData.hero_title || 'Leadership & Governance'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        {/* Main Body Content */}
        <div className="max-w-7xl mx-auto px-4 space-y-12">
          {/* Paragraph for Text - only render if narrative text is present */}
          {govText && (
            <section className="bg-white border border-gray-200 shadow-none p-8 lg:p-12 space-y-4 rounded-2xl">
              <span className="px-3.5 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[15px] inline-block">
                {govData.section_badge || 'Institutional Mandate'}
              </span>
              <h2 className="text-[30px] sm:text-[38px] font-extrabold text-black leading-tight">
                {govData.section_title || 'Accountable Leadership Committed to Child Protection'}
              </h2>
              <div className="text-[18px] text-black leading-relaxed font-medium space-y-4">
                {govText.split('\n\n').map((para: string, idx: number) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </section>
          )}
          {/* Component with Circle Image Holder with Title & Names Under It for the Staff - only render if staffList has members */}
          {staffList.length > 0 && (
            <section className="space-y-6">
              <div className="text-center space-y-2">
                <span className="px-3.5 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[14px] inline-block">
                  {govData.staff_badge || 'Our People & Practitioners'}
                </span>
                <h3 className="text-[30px] sm:text-[38px] font-extrabold text-black">
                  {govData.staff_title || 'Leadership, Educators & Social Work Mentors'}
                </h3>
                <p className="text-[18px] text-black/75 max-w-xl mx-auto font-medium">
                  Multidisciplinary professionals driving transparent governance and child rights advocacy across Tanzania.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 pt-4">
                {staffList.map((member: any, idx: number) => (
                  <div
                    key={member.id || idx}
                    className="bg-white border border-gray-200 shadow-none p-6 rounded-2xl text-center space-y-4 hover:border-black transition duration-300 flex flex-col items-center"
                  >
                    {/* Circle Image Holder */}
                    <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-[#E6A500] p-1 bg-white shadow-none">
                      <img
                        src={member.photo_url || '/media/public/images/staff/mgunga.webp'}
                        alt={member.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    {/* Title and Names Under It - ONLY Profile Image, Title, Name */}
                    <div className="space-y-1 w-full">
                      <h4 className="text-[20px] font-extrabold text-black leading-snug">
                        {member.name}
                      </h4>
                      <p className="text-[15px] font-bold text-[#E6A500] leading-snug">
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }
  // 7. STANDALONE PAGES FOR OTHER /about/* ROUTES (who-we-are)
  const cmsWwaPage = (siteData.pages || []).find((p: any) => p.page_key === 'who-we-are' && p.status !== 'archived');
  const trWwa = (cmsWwaPage?.page_translations || []).find((t: any) => t.language === lang) || (cmsWwaPage?.page_translations || [])[0] || {};
  const whoWeAre = siteData.settings?.who_we_are_section || {};
  const currentTitle = trWwa.title || whoWeAre.title_en || org.full_name || 'Who We Are';
  const currentBadge = trWwa.hero_tag || whoWeAre.badge_en || org.about_badge || 'Babawatoto Organization';
  const currentSummary = trWwa.subtitle || whoWeAre.summary_en || org.about_summary || 'Founded in 2007 in Mburahati Barafu, Dar es Salaam, Babawatoto Organization works at the grassroots level to protect vulnerable children, reunite street-connected youth with families, and build resilient communities across Tanzania.';
  const currentHeroImage = whoWeAre.hero_image || resolveMediaUrl(cmsWwaPage?.featured_media_id, media) || '/media/public/images/organization/hero1.webp';
  const hasVm = 'vision_and_mission' in (siteData.settings || {});
  const vmData = siteData.settings?.vision_and_mission || {};
  const currentVision = hasVm
    ? (vmData.vision !== undefined ? vmData.vision.trim() : '')
    : (lang === 'en' ? (org.vision_en || 'A just, inclusive, and protective society where every child and young person realizes their full potential in dignity and safety.') : (org.vision_sw || ''));
  const currentMission = hasVm
    ? (vmData.mission !== undefined ? vmData.mission.trim() : '')
    : (lang === 'en' ? (org.mission_en || 'To protect, educate, and empower vulnerable children, street-connected youth, and families through holistic social work, creative arts, quality education, and sustainable livelihoods.') : (org.mission_sw || ''));
  return (
    <StandardPageTemplate
      pageKey="about"
      pageTitle={currentTitle}
      pageBadge={currentBadge}
      heroImage={currentHeroImage}
      leadTitle="Institutional Mandate, Vision & Safeguarding Accountability"
      leadDescription={currentSummary}
      charLimit={340}
      siteData={siteData}
      navigate={navigate}
    >
      {(currentVision || currentMission) && (
        <>
          <SectionSeparator label="Institutional Identity & Mandate" />
          <section className={`grid grid-cols-1 ${currentVision && currentMission ? 'md:grid-cols-2' : ''} gap-8`}>
            {currentVision && (
              <div className="bg-white border border-gray-200 shadow-none p-8 space-y-4">
                <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[15px] inline-block">
                  Our Vision
                </span>
                <h2 className="text-[28px] font-extrabold text-black">
                  {currentVision}
                </h2>
              </div>
            )}
            {currentMission && (
              <div className="bg-white border border-gray-200 shadow-none p-8 space-y-4">
                <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[15px] inline-block">
                  Our Mission
                </span>
                <h2 className="text-[28px] font-extrabold text-black">
                  {currentMission}
                </h2>
              </div>
            )}
          </section>
        </>
      )}
      <SectionSeparator label="Core Organizational Values" />
      <section className="bg-white border border-gray-200 shadow-none p-8 space-y-6">
        <h3 className="text-[30px] font-extrabold text-black">Guiding Principles of Our Work</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {(org.core_values_en || [
            'Child Safeguarding & Dignity First',
            'Community Ownership & Inclusion',
            'Transparency & Accountability',
            'Creative Empowerment (HEART)',
            'Gender Equality & Non-Discrimination',
            'Evidence-Based Social Work',
          ]).map((val: string, idx: number) => (
            <div
              key={idx}
              className="p-5 bg-white border border-gray-200 shadow-none font-bold text-[18px] text-black flex items-center gap-3"
            >
              <CheckCircle2 className="w-6 h-6 text-[#E6A500] shrink-0" />
              <span>{val}</span>
            </div>
          ))}
        </div>
      </section>
      {/* Commemorative Narrative & Feature Image Section */}
      <SectionSeparator label="Commemorative Milestone" />
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-gray-200 shadow-none p-8 lg:p-12">
        <div className="lg:col-span-7 space-y-4">
          <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[15px] inline-block">
            Our Journey & Impact
          </span>
          <h3 className="text-[30px] font-extrabold text-black">
            Rooted in Community, Driven by Lasting Child Protection
          </h3>
          <p className="text-[18px] text-black leading-relaxed">
            Since its founding in 2007 in Mburahati Barafu, Dar es Salaam, Babawatoto Centre for Children and
            Youth Trust (BAO) has stood as a sanctuary of care, education, and creative transformation for
            thousands of vulnerable children, street-connected youth, and young mothers.
          </p>
          <p className="text-[18px] text-black leading-relaxed">
            We commemorate the community partners, social welfare officers, and resilient families who have
            partnered with us over nearly two decades to build safe homes, restore self-worth, and inspire youth leadership.
          </p>
        </div>
        <div className="lg:col-span-5">
          <figure className="border-4 border-white shadow-none overflow-hidden bg-[#F2F2F2]">
            <img
              src="/media/public/images/organization/abouts.webp"
              alt="Babawatoto Commemorative Showcase"
              className="w-full h-80 object-cover"
            />
            <figcaption className="p-3 bg-white text-xs font-semibold text-black/75">
              Children participating in Babawatoto community empowerment activities in Dar es Salaam.
            </figcaption>
          </figure>
        </div>
      </section>
      <DynamicCmsPageBlocks pageKey={`about-${pageSlug}`} lang={lang} siteData={siteData} />
    </StandardPageTemplate>
  );
}
/**
 * Standalone Multi-Section Pages for "What we do" Projects (/projects & /projects/:slug)
 */
export function ProjectsView({
  lang,
  slug,
  siteData,
  navigate,
}: {
  lang: LanguageCode;
  slug?: string;
  siteData: any;
  navigate: (path: string) => void;
}) {
  const dict = UI_TRANSLATIONS[lang];
  const projects = siteData.projects || [];
  const media = siteData.media || [];
  const projSettings = siteData.settings?.projects_page_settings || {};
  const metricIconMap: Record<string, any> = {
    'youth reached': Users,
    'locations': MapPin,
    'emergency respondent': Ambulance,
    'beneficiaries': HeartHandshake,
    'hospitals': HeartPulse,
    'partners': Handshake,
  };
  const defaultAchievements: Array<{
    type: 'youth reached' | 'locations' | 'emergency respondent' | 'beneficiaries' | 'hospitals' | 'partners';
    number: number;
    suffix?: string;
  }> = [
    { type: 'youth reached', number: 12500, suffix: '+' },
    { type: 'locations', number: 24, suffix: ' Wards' },
    { type: 'emergency respondent', number: 380, suffix: '+' },
    { type: 'beneficiaries', number: 28400, suffix: '+' },
    { type: 'hospitals', number: 8, suffix: ' Units' },
    { type: 'partners', number: 26, suffix: ' Orgs' },
  ];
  const defaultGallery = [
    {
      url: '/media/public/images/projects/ahadi.webp',
      title: 'AHADI Field Outreach',
      caption: 'Mobile social work teams identifying vulnerable children in Temeke.',
    },
    {
      url: '/media/public/images/projects/WATOTO.webp',
      title: 'Child Safeguarding',
      caption: 'Safe space counseling and trauma-informed support groups.',
    },
    {
      url: '/media/public/images/projects/vocation.JPG',
      title: 'Vocational Apprenticeships',
      caption: 'Tailoring, carpentry, and entrepreneurship mentoring.',
    },
    {
      url: '/media/public/images/programmes/arts1.webp',
      title: 'HEART Performing Arts',
      caption: 'Acrobatics and music therapy rehearsals at Babawatoto Centre.',
    },
  ];
  const previewGallery =
    Array.isArray(projSettings.gallery_preview) && projSettings.gallery_preview.length > 0
      ? projSettings.gallery_preview
      : defaultGallery;
  // Single Project Detail Page (/projects/:slug)
  if (slug) {
    const proj = projects.find(
      (p: any) =>
        p.id === slug || (p.project_translations || []).some((t: any) => t.slug === slug)
    );
    const verifiedFallback = VERIFIED_BAO_PROJECTS.find(
      (vp: any) => vp.en.slug === slug || vp.sw.slug === slug
    );
    const defaultPriority = DEFAULT_PRIORITY_PROJECTS.find((dp) => dp.slug === slug);
    if (!proj && !verifiedFallback && !defaultPriority) {
      return (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <EmptyStateCard
            title={dict.emptyStates.projectsTitle}
            description={dict.emptyStates.projectsDesc}
          />
        </div>
      );
    }
    const tr = proj
      ? (proj.project_translations || []).find((t: any) => t.language === lang) ||
        (proj.project_translations || [])[0] ||
        {}
      : verifiedFallback
      ? lang === 'en'
        ? verifiedFallback.en
        : verifiedFallback.sw
      : {
          title: lang === 'en' ? defaultPriority?.title_en : defaultPriority?.title_sw,
          slug: defaultPriority?.slug,
          summary:
            lang === 'en'
              ? defaultPriority?.short_description_en
              : defaultPriority?.short_description_sw,
          short_description:
            lang === 'en'
              ? defaultPriority?.short_description_en
              : defaultPriority?.short_description_sw,
          objectives: [
            'Strengthen community-level child safeguarding, protection, and referral networks.',
            'Deliver catch-up education, creative arts healing, and vocational skills training.',
            'Engage families, caregivers, and municipal social welfare officers for lasting reintegration.',
          ],
          beneficiary_summary: 'Vulnerable children, street-connected youth, and families in Dar es Salaam.',
        };
    const imgUrl = proj
      ? resolveMediaUrl(proj.featured_image_id || proj.featured_media_id, media) ||
        '/media/public/images/projects/ahadi.webp'
      : verifiedFallback
      ? '/media/public/images/projects/' + verifiedFallback.featured_filename
      : defaultPriority?.image_url || '/media/public/images/projects/ahadi.webp';
    const projStatus =
      proj?.project_status ||
      verifiedFallback?.project_status ||
      defaultPriority?.project_status ||
      'active';
    const projLocation =
      proj?.location ||
      (verifiedFallback ? verifiedFallback[lang].location : defaultPriority?.location) ||
      'Dar es Salaam, Tanzania';
    const projPartners =
      proj?.implementing_partners ||
      verifiedFallback?.implementing_partners || ['Babawatoto Organization', 'Local Government Authorities'];
    // Specific metrics for this project
    const projectSlugKey = (tr?.slug || slug).toLowerCase();
    const customProjectMetrics =
      projSettings.project_metrics?.[projectSlugKey] ||
      projSettings.project_metrics?.[slug] ||
      siteData.settings?.page_metrics?.[`project-${projectSlugKey}`] ||
      siteData.settings?.page_metrics?.[`project-${slug}`];
    const projectAchievements: Array<{
      type: 'youth reached' | 'locations' | 'emergency respondent' | 'beneficiaries' | 'hospitals' | 'partners';
      number: number;
      suffix?: string;
    }> =
      customProjectMetrics && customProjectMetrics.length > 0
        ? customProjectMetrics
        : projectSlugKey.includes('ahadi')
        ? [
            { type: 'youth reached', number: 3850, suffix: '+' },
            { type: 'locations', number: 12, suffix: ' Wards' },
            { type: 'emergency respondent', number: 145, suffix: '+' },
            { type: 'beneficiaries', number: 8900, suffix: '+' },
            { type: 'hospitals', number: 4, suffix: ' Referral Units' },
            { type: 'partners', number: 18, suffix: ' Orgs' },
          ]
        : projectSlugKey.includes('vocation')
        ? [
            { type: 'youth reached', number: 2450, suffix: '+' },
            { type: 'locations', number: 8, suffix: ' Centres' },
            { type: 'emergency respondent', number: 90, suffix: '+' },
            { type: 'beneficiaries', number: 5600, suffix: '+' },
            { type: 'hospitals', number: 3, suffix: ' Units' },
            { type: 'partners', number: 15, suffix: ' Orgs' },
          ]
        : Array.isArray(projSettings.metrics) && projSettings.metrics.length > 0
        ? projSettings.metrics
        : defaultAchievements;
    return (
      <div className="w-full space-y-12 pb-16">
        {/* 1. HERO BANNER: Full-width matching Home Hero Banner */}
        <section className="relative w-full bg-[#E6A500] text-black overflow-hidden">
          <div
            className="absolute inset-0 opacity-25 bg-cover bg-center"
            style={{ backgroundImage: `url('${imgUrl}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#E6A500] via-[#E6A500]/90 to-white/25" />
          <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-block px-3.5 py-1.5 bg-black text-white text-xs font-black uppercase tracking-wider">
                  Project Status: {projStatus}
                </span>
                <span className="px-3 py-1 bg-white text-black font-bold text-xs flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-black" /> {projLocation}
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-black">
                {tr?.title}
              </h1>
              {tr?.summary && (
                <p className="text-base sm:text-lg text-black max-w-2xl leading-relaxed font-medium">
                  {tr?.summary}
                </p>
              )}
            </div>
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-none border-4 border-white bg-black/10">
                <img
                  src={imgUrl}
                  alt={tr?.title || 'Babawatoto Project'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* 2. ABOUT THE PROJECT SECTION: Text on Left, Image on Right */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white border border-gray-200 shadow-none p-8 lg:p-12">
          {/* Left Column: Text */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-block">
              <span className="px-3.5 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[15px] tracking-wider">
                About the Project
              </span>
            </div>
            <h2 className="text-[30px] sm:text-[38px] font-extrabold text-black leading-tight">
              {tr?.title}
            </h2>
            <div className="text-[18px] text-black leading-relaxed space-y-4">
              <p className="font-medium text-[20px] text-black leading-relaxed">
                {tr?.summary || tr?.short_description}
              </p>
              {tr?.background_html ? (
                <div
                  className="space-y-4"
                  dangerouslySetInnerHTML={{ __html: tr.background_html }}
                />
              ) : (
                <p>
                  Babawatoto Centre for Children and Youth Trust (BAO) implements this project in close collaboration
                  with Municipal Social Welfare Officers, community para-social workers, and grassroots caregivers to
                  ensure sustainable safeguarding, holistic child development, and durable family empowerment across Dar es Salaam.
                </p>
              )}
            </div>
            {Array.isArray(tr?.objectives) && tr.objectives.length > 0 && (
              <div className="pt-2 space-y-3">
                <h3 className="text-[22px] font-extrabold text-black">Core Project Objectives</h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {tr.objectives.map((obj: string, i: number) => (
                    <div
                      key={i}
                      className="p-3.5 bg-white flex items-start gap-3 text-[18px] font-semibold text-black"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#E6A500] shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {projPartners.length > 0 && (
              <div className="pt-2 text-[17px] text-black">
                <span className="font-extrabold text-black">Partners: </span>
                <span>{projPartners.join(', ')}</span>
              </div>
            )}
          </div>
          {/* Right Column: Image */}
          <div className="lg:col-span-5">
            <div className="border-4 border-white shadow-none overflow-hidden bg-white">
              <img
                src={imgUrl}
                alt={tr?.title}
                className="w-full h-[400px] sm:h-[460px] object-cover border border-gray-200 shadow-none"
              />
              <div className="p-4 bg-white text-black font-semibold text-[15px] border-t border-gray-200 flex items-center justify-between">
                <span className="font-bold truncate">{tr?.title}</span>
                <span className="px-2.5 py-0.5 bg-[#E6A500] text-black text-xs font-extrabold uppercase shrink-0">
                  {projStatus}
                </span>
              </div>
            </div>
          </div>
        </section>
        {/* 3. METRICS FOR OUR ACHIEVEMENTS ON THAT PROJECT (Borderless, Centered, 3-Row Layout) */}
        <section className="bg-white border-0 shadow-none p-6 lg:p-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[13px] font-extrabold uppercase tracking-wider px-3 py-1 bg-[#E6A500] text-black inline-block">
              Measurable Impact
            </span>
            <h2 className="text-[28px] sm:text-[32px] font-extrabold text-black">
              Our Achievements on This Project
            </h2>
          </div>
          <div
            className={`grid gap-8 items-center justify-center ${
              projectAchievements.length === 4
                ? 'grid-cols-2 md:grid-cols-4'
                : projectAchievements.length <= 3
                  ? 'grid-cols-1 md:grid-cols-3'
                  : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
            }`}
          >
            {projectAchievements.map((met, idx) => {
              const IconComponent = metricIconMap[met.type] || Users;
              return (
                <div
                  key={idx}
                  className="p-4 bg-transparent border-0 shadow-none flex flex-col items-center justify-center text-center space-y-2"
                >
                  {/* Row 1: Logo / Icon */}
                  <div className="w-10 h-10 flex items-center justify-center bg-transparent mb-1">
                    <IconComponent className="w-8 h-8 text-black stroke-[1.75]" />
                  </div>

                  {/* Row 2: Number / Numerical Metric */}
                  <div className="text-[28px] sm:text-[32px] lg:text-[36px] font-extrabold text-black leading-tight tracking-tight flex flex-wrap items-baseline justify-center gap-x-1">
                    <MetricAnimatedCounter target={met.number} />
                    <span className="text-[18px] sm:text-[20px] font-bold text-[#E6A500]">
                      {met.suffix || '+'}
                    </span>
                  </div>

                  {/* Row 3: Text */}
                  <div className="text-[14px] sm:text-[15px] font-extrabold text-black uppercase tracking-wider leading-snug text-center">
                    {met.type}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        {/* 4. LITTLE PREVIEW OF IMAGES GALLERY WITH VIEW MORE BUTTON */}
        <section className="space-y-6 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-3">
            <div>
              <span className="text-[13px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-[#E6A500] text-black inline-block">
                Field Evidence
              </span>
              <h2 className="text-[28px] sm:text-[32px] font-extrabold text-black mt-1">
                Project Gallery Preview
              </h2>
            </div>
            <button
              onClick={() => navigate('/resources/gallery')}
              className="bao-btn px-6 py-2.5 text-black font-extrabold text-[16px] inline-flex items-center gap-2"
            >
              <span>View More in Gallery</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {previewGallery.map((img: any, idx: number) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 shadow-none rounded-xl overflow-hidden group hover:border-black transition"
              >
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={img.url}
                    alt={img.title || 'Project moment'}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-4 bg-white border-t border-gray-200 space-y-1">
                  <h4 className="text-[18px] font-extrabold text-black truncate">{img.title}</h4>
                  <p className="text-[15px] text-black/75 line-clamp-2">{img.caption}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center pt-4">
            <button
              onClick={() => navigate('/resources/gallery')}
              className="bao-btn px-8 py-3.5 text-black font-extrabold text-[18px] inline-flex items-center gap-2"
            >
              <span>View More Gallery Photos</span>
              <ArrowRight className="w-5 h-5 text-black" />
            </button>
          </div>
        </section>
        </div>
      </div>
    );
  }
  // Overview page for /projects (View All Projects with Zigzag Blocks)
  const overviewHeroTitle = projSettings.hero_title || 'Our Projects & Field Initiatives';
  const overviewHeroBadge = projSettings.hero_badge || 'What We Do';
  const overviewHeroImage = projSettings.hero_banner_image || '/media/public/images/projects/ahadi.webp';
  const overviewHeading =
    projSettings.overview_heading || 'All Community Projects & Grassroots Field Initiatives';
  // Sourced from CMS / database projects + verified fallback projects
  const sortedCms = [
    ...projects.filter((p: any) => p.is_featured === true),
    ...projects.filter((p: any) => p.is_featured !== true),
  ];
  const cmsCards = sortedCms.map((proj: any) => {
    const tr =
      (proj.project_translations || []).find((t: any) => t.language === lang) ||
      (proj.project_translations || [])[0] ||
      {};
    const imgUrl =
      resolveMediaUrl(proj.featured_image_id || proj.featured_media_id, media) ||
      proj.image_url ||
      (proj.project_code === 'BAO-PRJ-MTOTO-KWANZA' ? '/media/public/images/projects/WATOTO.webp' :
       proj.project_code === 'BAO-PRJ-UHURU-WETU' ? '/media/public/images/projects/ahadi.webp' :
       proj.project_code === 'BAO-PRJ-HAKI-YANGU' ? '/media/public/images/projects/vocation.JPG' :
       '/media/public/images/organization/hero3.webp');
    return {
      id: proj.id,
      slug: tr.slug || proj.id,
      title: tr.title || 'Babawatoto Project',
      summary: tr.summary || tr.short_description || tr.full_description || '',
      imgUrl,
      project_status: proj.project_status || 'Active Project',
      is_featured: Boolean(proj.is_featured),
      location: proj.location || 'Dar es Salaam, Tanzania',
    };
  });
  const allDisplayProjects = cmsCards.length > 0
    ? cmsCards
    : DEFAULT_PRIORITY_PROJECTS.map((dp) => ({
        id: dp.id,
        slug: dp.slug,
        title: lang === 'en' ? dp.title_en : dp.title_sw,
        summary: lang === 'en' ? dp.short_description_en : dp.short_description_sw,
        imgUrl: dp.image_url,
        project_status: dp.project_status || 'Active Project',
        is_featured: dp.is_featured,
        location: dp.location || 'Dar es Salaam, Tanzania',
      }));
  return (
    <div className="w-full space-y-12 pb-16">
      {/* 1. HERO BANNER: Full-width matching Home Hero Banner */}
      <section className="relative w-full bg-[#E6A500] text-black overflow-hidden">
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{ backgroundImage: `url('${overviewHeroImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#E6A500] via-[#E6A500]/90 to-white/25" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            {overviewHeroBadge && (
              <span className="inline-block px-3.5 py-1.5 bg-black text-white text-xs font-black uppercase tracking-wider mb-2">
                {overviewHeroBadge}
              </span>
            )}
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-black">
              {overviewHeroTitle}
            </h1>
            <p className="text-base sm:text-lg text-black max-w-2xl leading-relaxed font-medium">
              Explore Babawatoto field interventions in child safeguarding, catch-up MEMKWA education, creative performing arts therapy, and vocational youth autonomy.
            </p>
          </div>
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-none border-4 border-white bg-black/10">
              <img
                src={overviewHeroImage}
                alt={overviewHeroTitle}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 space-y-12">
      {/* 2. HEADING BELOW BANNER */}
      <div className="space-y-3">
        <div className="inline-block">
          <span className="px-3.5 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[15px] tracking-wider">
            Field Initiatives & Interventions
          </span>
        </div>
        <h2 className="text-[32px] sm:text-[42px] font-extrabold text-black leading-tight border-b border-gray-200 pb-4">
          {overviewHeading}
        </h2>
      </div>
      {/* 3. ZIGZAG LIST OF PROJECT BLOCKS */}
      <div className="space-y-12">
        {allDisplayProjects.map((proj, idx) => {
          // Zigzag pattern: 1st is image left / text right (even index 0), 2nd is text left / image right (odd index 1), 3rd is image left / text right (even index 2), and so on
          const isImageLeft = idx % 2 === 0;
          return (
            <article
              key={proj.id || idx}
              className="bg-white border border-gray-200 shadow-none p-8 lg:p-12 hover:border-black transition"
            >
              <div
                className={
                  isImageLeft
                    ? 'flex flex-col lg:flex-row gap-10 items-center'
                    : 'flex flex-col lg:flex-row-reverse gap-10 items-center'
                }
              >
                {/* Image Side */}
                <div className="w-full lg:w-5/12">
                  <div className="border-4 border-white shadow-none overflow-hidden bg-white">
                    <img
                      src={proj.imgUrl}
                      alt={proj.title}
                      className="w-full h-[320px] sm:h-[380px] object-cover border border-gray-200 shadow-none"
                    />
                    <div className="p-3.5 bg-white text-black font-semibold text-[15px] border-t border-gray-200 flex items-center justify-between">
                      <span className="font-bold truncate">{proj.title}</span>
                      <span className="px-2.5 py-0.5 bg-[#E6A500] text-black text-xs font-extrabold uppercase shrink-0">
                        {proj.project_status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Text Side */}
                <div className="w-full lg:w-7/12 space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {proj.is_featured && (
                      <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[13px] tracking-wider">
                        ★ Priority Project
                      </span>
                    )}
                    <span className="px-3 py-1 bg-white border border-gray-200 text-black font-extrabold uppercase text-[13px] tracking-wider">
                      {proj.project_status || 'Active Project'}
                    </span>
                    <span className="px-3 py-1 bg-[#F2F2F2] text-black font-bold text-[13px] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-black" /> {proj.location}
                    </span>
                  </div>
                  <h3 className="text-[28px] sm:text-[34px] font-extrabold text-black leading-tight">
                    {proj.title}
                  </h3>
                  <p className="text-[18px] text-black leading-relaxed font-normal">
                    {proj.summary}
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => navigate(`/projects/${proj.slug}`)}
                      className="bao-btn px-7 py-3.5 text-black font-extrabold text-[16px] inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span>Read More</span>
                      <ArrowRight className="w-5 h-5 text-black" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      </div>
    </div>
  );
}
/**
 * Standalone Impact Page
 */
export function ImpactView({ lang, siteData, navigate }: { lang: LanguageCode; siteData: any; navigate?: (path: string) => void }) {
  const dict = UI_TRANSLATIONS[lang];
  const indicators = siteData.indicators || [];
  const cmsPage = (siteData.pages || []).find((p: any) => p.page_key === 'impact' && p.status !== 'archived');
  const tr = (cmsPage?.page_translations || []).find((t: any) => t.language === lang) || (cmsPage?.page_translations || [])[0] || {};
  const impactSettings = siteData.settings?.impact_page_settings || {};
  const bannerBadge = impactSettings.hero_badge || tr.hero_tag || 'Monitoring, Evaluation & Learning (MEL)';
  const bannerTitle = impactSettings.hero_title || tr.title || dict.nav.ourImpact;
  const bannerDesc = impactSettings.lead_description || tr.subtitle || 'Verified quantitative and qualitative outcomes across our core strategic programmes in Tanzania.';
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
      name: String(label || '').slice(0, 24),
      value: isNaN(numVal) ? 0 : numVal,
    };
  });
  return (
    <div className="w-full space-y-14 pb-16">
      {/* 1. HERO BANNER: Full-width matching Home Hero Banner */}
      <section className="relative w-full bg-[#E6A500] text-black overflow-hidden">
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{ backgroundImage: `url('/media/public/images/organization/hero2.webp')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#E6A500] via-[#E6A500]/90 to-white/25" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="inline-block px-3.5 py-1.5 bg-black text-white text-xs font-black uppercase tracking-wider mb-2">
              {bannerBadge}
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-black">
              {bannerTitle}
            </h1>
            <p className="text-base sm:text-lg text-black max-w-2xl leading-relaxed font-medium">
              {bannerDesc}
            </p>
          </div>
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-none border-4 border-white bg-black/10">
              <img
                src="/media/public/images/organization/hero2.webp"
                alt={bannerTitle}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 space-y-14">
      <SectionSeparator label="Verified MEL Indicators" />
      {(() => {
        const impactCustomMetrics =
          siteData.settings?.page_metrics?.impact ||
          siteData.settings?.impact_page_settings?.metrics;
        if (Array.isArray(impactCustomMetrics) && impactCustomMetrics.length > 0) {
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {impactCustomMetrics.map((met: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white border-0 border-transparent shadow-none p-7 space-y-3 rounded-2xl"
                >
                  <div className="text-[36px] font-extrabold text-black bg-[#E6A500] inline-block px-3 py-1">
                    {Number(met.number || 0).toLocaleString()}
                    {met.suffix || '+'}
                  </div>
                  <h3 className="font-extrabold text-[22px] text-black uppercase tracking-wide">
                    {met.label || met.type}
                  </h3>
                </div>
              ))}
            </div>
          );
        }
        if (indicators && indicators.length > 0) {
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(indicators || []).map((ind: any) => {
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
                  'Impact Indicator';
                const numVal = Number(
                  rec?.numeric_value ??
                  ind.current_value ??
                  ind.target_value ??
                  ind.value ??
                  0
                );
                const suffix = ind.value_suffix || (ind.measurement_unit_en === '%' ? '%' : '+');
                const desc =
                  tr?.description ||
                  (lang === 'sw' ? ind.description_sw : ind.description_en) ||
                  ind.description_en ||
                  '';
                return (
                  <div
                    key={ind.id}
                    className="bg-white border-0 border-transparent shadow-none p-7 space-y-3 rounded-2xl"
                  >
                    <div className="text-[36px] font-extrabold text-black bg-[#E6A500] inline-block px-3 py-1">
                      {numVal.toLocaleString()}
                      {suffix}
                    </div>
                    <h3 className="font-extrabold text-[22px] text-black">
                      {label}
                    </h3>
                    {desc && <p className="text-[18px] text-black leading-relaxed">{desc}</p>}
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
    </div>
  );
}
/**
 * Stories of Change (Redirects to unified News & Stories page)
 */
export function StoriesView({ navigate }: { lang?: LanguageCode; siteData?: any; navigate?: (path: string) => void }) {
  useEffect(() => {
    navigate?.('/news');
  }, [navigate]);
  return null;
}

/**
 * News & Stories of Change Page (/news, /news/:slug)
 */
export function NewsAndEventsView({
  lang,
  slug,
  siteData,
  navigate,
}: {
  lang: LanguageCode;
  slug?: string;
  siteData: any;
  navigate?: (path: string) => void;
}) {
  const dict = UI_TRANSLATIONS[lang];
  const news = siteData.news || [];
  const stories = siteData.stories || [];
  const media = siteData.media || [];
  const cmsPage = (siteData.pages || []).find((p: any) => (p.page_key === 'news' || p.page_key === 'news-events') && p.status !== 'archived');
  const tr = (cmsPage?.page_translations || []).find((t: any) => t.language === lang) || (cmsPage?.page_translations || [])[0] || {};
  const newsSettings = siteData.settings?.news_page_settings || siteData.settings?.news_events_settings || {};
  const pageTitle = newsSettings.hero_title || tr.title || (lang === 'en' ? "News & Stories of Change" : "Habari na Simulizi za Mabadiliko");
  const pageBadge = newsSettings.hero_badge || tr.hero_tag || (lang === 'en' ? "Field Updates & Lived Journeys" : "Taarifa za Nyanjani na Simulizi");
  const heroImage = newsSettings.hero_banner_image || resolveMediaUrl(cmsPage?.featured_media_id, media) || "/media/public/images/programmes/arts1.webp";
  const leadDescription = newsSettings.lead_description || tr.subtitle || (lang === 'en' ? "Stay up to date with Babawatoto Organization field updates, child safeguarding interventions, community outreach dispatches, and inspiring lived experiences from across Tanzania." : "Fuatilia taarifa za hivi karibuni za shirika la Babawatoto, ulinzi wa watoto na simulizi halisi za mafanikio.");

  const verifiedNewsFallbacks = [
    {
      id: 'news-fallback-1',
      slug: 'community-street-outreach-and-family-reunification',
      title: lang === 'en' ? 'Community Street Outreach & Family Reunification' : 'Utafutaji wa Watoto wa Mitaani na Kuunganisha Familia',
      description: lang === 'en'
        ? 'Mobile social welfare teams conducting daytime identification and emergency safeguarding referrals in Dar es Salaam.'
        : 'Timu za ustawi wa jamii zikifanya utambuzi wa mchana na rufaa za dharura za ulinzi jijini Dar es Salaam.',
      badge: 'Field Outreach',
      imageUrl: '/media/public/images/programmes/community aoutreach 2.jpg',
      url: '/news/community-street-outreach-and-family-reunification',
      author: 'Babawatoto Social Work Unit',
      published: '10 Nov 2026',
      contentParagraphs: [
        'Across Kinondoni and Ilala districts in Dar es Salaam, Babawatoto mobile street outreach teams maintain an active frontline presence to identify and assist children newly arrived on the streets. Operating day and night, para-social workers build trusting relationships with street-connected youth through compassionate dialogue, food assistance, and immediate clinical health assessments.',
        'Our child safeguarding protocol ensures that every child receives individualized psychological triage. Within the first 72 hours of contact, case officers initiate safe family tracing to understand the underlying drivers of separation—frequently extreme poverty, domestic breakdown, or lack of school fees.',
        'Through sustained community mediation and local government collaboration, our field practitioners recently reunited 38 children with their biological families and kinship caregivers. Each reunification is paired with household economic strengthening and regular monitoring visits to prevent secondary separation.',
        'As part of our commitment to sustainable community child protection, Babawatoto continues to train ward-level para-social workers, market leaders, and transport operators to identify vulnerable children early and refer them to safe community sanctuaries.',
      ],
    },
    {
      id: 'news-fallback-2',
      slug: 'heart-expressive-arts-therapy-workshops',
      title: lang === 'en' ? 'HEART Expressive Arts Therapy Workshops' : 'Warsha za Tiba ya Sanaa ya Maonyesho ya HEART',
      description: lang === 'en'
        ? 'Empowering street-connected youth through acrobatics, theatre, and traditional drumming to rebuild psychosocial resilience.'
        : 'Kuwezesha vijana kupitia sarakasi, maigizo, na ngoma za jadi ili kujenga ustahimilivu wa kisaikolojia.',
      badge: 'HEART Arts',
      imageUrl: '/media/public/images/programmes/arts1.webp',
      url: '/news/heart-expressive-arts-therapy-workshops',
      author: 'HEART Creative Mentors',
      published: '06 Nov 2026',
      contentParagraphs: [
        'The Babawatoto Centre in Mburahati Barafu recently concluded an intensive 6-week psychosocial workshop utilizing our signature HEART (Healing and Emotional Arts Recovery Therapy) methodology. Over 120 street-connected boys and girls participated in structured acrobatics, traditional drumming, and interactive theatrical roleplay.',
        'Trauma-informed creative arts offer street-connected children an expressive non-verbal outlet to process emotional distress, build peer solidarity, and restore self-worth. Professional artists and youth mentors guide participants through disciplined physical routines that channel stress into creative mastery and team trust.',
        'The workshop culminated in a vibrant community performance attended by over 400 local residents, ward officers, and caregivers. The showcase challenged social stigma surrounding street youth, presenting them instead as talented cultural ambassadors and powerful creative storytellers.',
        'Graduates of the expressive arts workshop are now transitioning into accelerated primary schooling (MEMKWA) and vocational apprenticeships, carrying forward the emotional stability and confidence gained through artistic expression.',
      ],
    },
    {
      id: 'news-fallback-3',
      slug: 'memkwa-accelerated-primary-education-graduation',
      title: lang === 'en' ? 'MEMKWA Accelerated Primary Education Graduation' : 'Mahafali ya Elimu ya Msingi ya MEMKWA kwa Vijana',
      description: lang === 'en'
        ? 'Adolescent learners completing catch-up schooling curricula and transitioning into vocational apprenticeship tracks.'
        : 'Wanafunzi wa umri mkubwa wakikamilisha mitaala ya elimu ya kasi na kujiunga na mafunzo ya ufundi stadi.',
      badge: 'Education',
      imageUrl: '/media/public/images/projects/WATOTO.webp',
      url: '/news/memkwa-accelerated-primary-education-graduation',
      author: 'Babawatoto Education Team',
      published: '28 Oct 2026',
      contentParagraphs: [
        'Sixty-five adolescent learners celebrated their graduation from Babawatoto’s MEMKWA (Accelerated Primary Education for Out-of-School Youth) cohort during a ceremony held at our community education wing in Dar es Salaam.',
        'Due to extreme hardship, displacement, or domestic adversity, many street-connected youth miss foundational schooling years. Babawatoto’s certified teachers provide an intensive, compressed national curriculum that covers seven years of primary education in just three years, supported by remedial tutoring and school meal programs.',
        'With official certification from the Ministry of Education, these graduates have demonstrated remarkable academic progress. Forty-two learners are successfully matriculating into formal secondary schools, while twenty-three older youths are entering specialized technical apprenticeship programs.',
        'Babawatoto provides continuous educational stipends, school uniforms, textbooks, and mentoring to ensure every learner completes their educational journey without financial interruption.',
      ],
    },
  ];

  const verifiedStoryFallbacks = [
    {
      id: 'story-fallback-1',
      slug: 'from-the-streets-to-an-entrepreneur',
      title: lang === 'en' ? 'From The Streets To An Entrepreneur' : 'Kutoka Mitaani Hadi Kuwa Mjasiriamali',
      description: lang === 'en'
        ? 'How access to transitional shelter and technical tailoring training transformed a street youth into an independent business owner.'
        : 'Jinsi makazi salama na mafunzo ya ufundi yalivyobadilisha maisha ya kijana kuwa mjasiriamali anayejitegemea.',
      badge: 'Story of Change',
      beneficiary: 'Said M.',
      imageUrl: '/media/public/images/organization/hero3.webp',
      url: '/news/from-the-streets-to-an-entrepreneur',
      author: 'Participant Journey',
      published: '15 Oct 2026',
      contentParagraphs: [
        'At age twelve, following family breakdown, Said found himself surviving on the streets of downtown Dar es Salaam, navigating precarious informal work and extreme vulnerability for nearly two years.',
        'A Babawatoto street outreach team connected with Said during an evening outreach round. He was welcomed into our day-reception centre, where social workers provided hot meals, medical care, and trauma counselling.',
        'Recognizing his interest in textiles and craft design, Babawatoto enrolled Said in our vocational tailoring apprenticeship program. Over eighteen months, he mastered garment cutting, machine operation, and financial literacy under the guidance of experienced artisans.',
        'Today, Said operates his own tailoring shop in Kinondoni, employing two other former street youth and training apprentices. His journey stands as a living testament to the transformative power of compassionate community investment.',
      ],
    },
    {
      id: 'story-fallback-2',
      slug: 'finding-voice-through-the-circus-stage',
      title: lang === 'en' ? 'Finding Voice Through The Circus Stage' : 'Kupaza Sauti Kupitia Jukwaa la Sarakasi',
      description: lang === 'en'
        ? 'Overcoming trauma through acrobatics and expressive theatre in the HEART psychological recovery programme.'
        : 'Kushinda maumivu ya kisaikolojia kupitia sanaa za maonyesho katika mpango wa HEART.',
      badge: 'Story of Change',
      beneficiary: 'Amina K.',
      imageUrl: '/media/public/images/programmes/arts1.webp',
      url: '/news/finding-voice-through-the-circus-stage',
      author: 'Participant Journey',
      published: '02 Oct 2026',
      contentParagraphs: [
        'Withdrawn and struggling with deep emotional isolation after months of street life, Amina arrived at Babawatoto unable to speak about her experiences or trust adults.',
        'Invited to observe an acrobatics and music rehearsal by the HEART arts mentors, Amina slowly joined in warm-up routines. The non-verbal physical expression allowed her to release accumulated trauma and rediscover confidence in a safe, affirming space.',
        'Within six months, Amina emerged as a lead acrobat and narrator in Babawatoto’s community advocacy theatre troupe, speaking out boldly against child abuse and early marriage before packed community audiences.',
        'Now reintegrated into a loving extended family home, Amina continues her high school education with a full Babawatoto scholarship, serving as a peer mentor for younger children arriving at the centre.',
      ],
    },
    {
      id: 'story-fallback-3',
      slug: 'a-family-reunited-and-rebuilt',
      title: lang === 'en' ? 'A Family Reunited and Rebuilt' : 'Familia Iliyounganishwa na Kujengwa Upya',
      description: lang === 'en'
        ? 'Social workers mediating kinship disputes and providing small business grants to prevent children returning to the street.'
        : 'Wafanyakazi wa ustawi wakisaidia kuunganisha familia na kutoa mitaji midogo ili kuzuia watoto kurudi mitaani.',
      badge: 'Story of Change',
      beneficiary: 'Fatuma & Children',
      imageUrl: '/media/public/images/projects/WATOTO.webp',
      url: '/news/a-family-reunited-and-rebuilt',
      author: 'Family Reintegration Story',
      published: '20 Sep 2026',
      contentParagraphs: [
        'Fatuma, a single mother of three in Dar es Salaam, faced crushing economic distress that led her eldest son, Juma, to seek survival income on the streets.',
        'Babawatoto’s social welfare team located Juma during market outreach and immediately engaged Fatuma in structured, non-judgmental family counselling. We addressed the root cause of the crisis: lack of sustainable household income.',
        'Alongside enrolling Juma back into school, Babawatoto provided Fatuma with basic business skills training and a micro-enterprise grant to establish a community produce stall. Weekly case visits ensured that the family stayed resilient and connected.',
        'Two years later, the household is economically self-reliant. Juma is excelling in primary school, and Fatuma has become an active advocate in her ward safeguarding committee, helping identify other families at risk of separation.',
      ],
    },
  ];

  const mappedCmsNews = (news || []).map((n: any) => {
    const nTr =
      (n.article_translations || n.news_article_translations || []).find((t: any) => t.language === lang) ||
      (n.article_translations || n.news_article_translations || [])[0] ||
      {};
    const mediaUrl =
      resolveMediaUrl(n.featured_media_id, media) ||
      '/media/public/images/organization/hero2.webp';
    const itemSlug = nTr.slug || n.slug || n.id;
    return {
      id: n.id,
      slug: itemSlug,
      type: 'news' as const,
      title: nTr.title || 'Babawatoto Community Update',
      description: nTr.excerpt || nTr.subtitle || nTr.summary || (nTr.body_html ? nTr.body_html.replace(/<[^>]+>/g, '').slice(0, 180) : 'Latest news dispatch from Babawatoto Organization.'),
      badge: n.tags?.[0] || 'Field News',
      imageUrl: mediaUrl,
      url: `/news/${itemSlug}`,
      targetLabel: 'Read article',
      published: n.published_at ? new Date(n.published_at).toLocaleDateString() : undefined,
      bodyHtml: nTr.body_html,
    };
  });

  const displayedNews = mappedCmsNews.length >= 3
    ? mappedCmsNews
    : [...mappedCmsNews, ...verifiedNewsFallbacks.slice(0, Math.max(0, 3 - mappedCmsNews.length)).map(item => ({ ...item, type: 'news' as const, targetLabel: 'Read article' }))];

  const mappedCmsStories = (stories || []).map((s: any) => {
    const sTr =
      (s.story_translations || []).find((t: any) => t.language === lang) ||
      (s.story_translations || [])[0] ||
      {};
    const mediaUrl =
      resolveMediaUrl(s.featured_media_id || s.featured_image_id, media) ||
      s.image_url ||
      '/media/public/images/organization/hero3.webp';
    const itemSlug = sTr.slug || s.slug || s.id;
    const storyUrl = `/news/${itemSlug}`;
    const summary =
      sTr.excerpt ||
      sTr.featured_quote ||
      (sTr.body_html ? sTr.body_html.replace(/<[^>]+>/g, '').slice(0, 180) : 'Verified lived experience from Babawatoto participant.');
    return {
      id: s.id,
      slug: itemSlug,
      type: 'story' as const,
      title: sTr.title || 'Journey of Hope & Resilience',
      description: summary,
      badge: s.category || 'Story of Change',
      beneficiary: s.beneficiary_name || 'Participant Story',
      imageUrl: mediaUrl,
      url: storyUrl,
      targetLabel: 'Read story',
      published: s.published_at ? new Date(s.published_at).toLocaleDateString() : undefined,
      bodyHtml: sTr.body_html,
      quote: sTr.featured_quote,
    };
  });

  const displayedStories = mappedCmsStories.length >= 3
    ? mappedCmsStories
    : [...mappedCmsStories, ...verifiedStoryFallbacks.slice(0, Math.max(0, 3 - mappedCmsStories.length)).map(item => ({ ...item, type: 'story' as const, targetLabel: 'Read story' }))];

  const allCards = [
    ...displayedNews,
    ...displayedStories,
  ];

  // ==========================================
  // SINGLE NEWS / STORY ARTICLE VIEW
  // ==========================================
  if (slug) {
    const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();

    // 1. Try finding in CMS news
    const cmsNewsMatch = (news || []).find((n: any) => {
      const nTr = (n.article_translations || n.news_article_translations || []).find((t: any) => t.language === lang) || (n.article_translations || n.news_article_translations || [])[0] || {};
      return n.id === slug || n.slug === slug || nTr.slug === slug || String(n.id).toLowerCase() === cleanSlug || n.slug?.toLowerCase() === cleanSlug || nTr.slug?.toLowerCase() === cleanSlug;
    });

    // 2. Try finding in CMS stories
    const cmsStoryMatch = !cmsNewsMatch ? (stories || []).find((s: any) => {
      const sTr = (s.story_translations || []).find((t: any) => t.language === lang) || (s.story_translations || [])[0] || {};
      return s.id === slug || s.slug === slug || sTr.slug === slug || String(s.id).toLowerCase() === cleanSlug || s.slug?.toLowerCase() === cleanSlug || sTr.slug?.toLowerCase() === cleanSlug;
    }) : null;

    // 3. Try finding in fallbacks
    const allFallbacks = [...verifiedNewsFallbacks, ...verifiedStoryFallbacks];
    const fallbackMatch = !cmsNewsMatch && !cmsStoryMatch ? allFallbacks.find((f: any) => {
      return f.id === slug || f.slug === slug || f.id.toLowerCase() === cleanSlug || f.slug?.toLowerCase() === cleanSlug || cleanSlug.includes(f.id.toLowerCase()) || f.url?.toLowerCase().endsWith(cleanSlug);
    }) : null;

    // Extract resolved article data
    const activeItem = cmsNewsMatch
      ? (() => {
          const nTr = (cmsNewsMatch.article_translations || cmsNewsMatch.news_article_translations || []).find((t: any) => t.language === lang) || (cmsNewsMatch.article_translations || cmsNewsMatch.news_article_translations || [])[0] || {};
          return {
            id: cmsNewsMatch.id,
            title: nTr.title || 'Babawatoto Field News',
            badge: cmsNewsMatch.tags?.[0] || 'Field News',
            author: 'Babawatoto Field Team',
            published: cmsNewsMatch.published_at ? new Date(cmsNewsMatch.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Verified Dispatch',
            imageUrl: resolveMediaUrl(cmsNewsMatch.featured_media_id, media) || '/media/public/images/programmes/arts1.webp',
            leadSummary: nTr.excerpt || nTr.subtitle || nTr.summary || '',
            bodyHtml: nTr.body_html,
            paragraphs: nTr.body_html ? null : [
              nTr.excerpt || 'Babawatoto Organization field teams actively document breakthrough child protection interventions across Tanzania.',
              'Our multidisciplinary social workers, educators, and creative arts mentors collaborate closely with local government authorities and community leaders to support street-connected children and vulnerable families.',
              'Through integrated case management, emergency assistance, and trauma-informed psychosocial support, we provide safe transitional spaces and viable pathways toward education and sustainable family reunification.',
              'Community leaders and caregivers actively participate in monitoring progress, ensuring that every child remains protected and supported within their home environment.',
            ],
            quote: null,
          };
        })()
      : cmsStoryMatch
      ? (() => {
          const sTr = (cmsStoryMatch.story_translations || []).find((t: any) => t.language === lang) || (cmsStoryMatch.story_translations || [])[0] || {};
          return {
            id: cmsStoryMatch.id,
            title: sTr.title || 'Story of Change & Transformation',
            badge: cmsStoryMatch.category || 'Story of Change',
            author: cmsStoryMatch.beneficiary_name || 'Participant Journey',
            published: cmsStoryMatch.published_at ? new Date(cmsStoryMatch.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Verified Story',
            imageUrl: resolveMediaUrl(cmsStoryMatch.featured_media_id || cmsStoryMatch.featured_image_id, media) || cmsStoryMatch.image_url || '/media/public/images/organization/hero3.webp',
            leadSummary: sTr.excerpt || sTr.subtitle || '',
            bodyHtml: sTr.body_html,
            paragraphs: sTr.body_html ? null : [
              sTr.excerpt || 'Every child arriving at Babawatoto brings an untold story of resilience and courage.',
              'Through trauma-informed counselling, transitional shelter, and vocational education, Babawatoto stands beside street-connected youth on their journey toward self-reliance.',
              'Today, this young person has re-established family ties and gained the practical life skills needed to build an autonomous, dignified future.',
            ],
            quote: sTr.featured_quote,
          };
        })()
      : fallbackMatch
      ? {
          id: fallbackMatch.id,
          title: fallbackMatch.title,
          badge: fallbackMatch.badge,
          author: (fallbackMatch as any).author || (fallbackMatch as any).beneficiary || 'Babawatoto Media',
          published: (fallbackMatch as any).published || 'Recent Update',
          imageUrl: fallbackMatch.imageUrl,
          leadSummary: fallbackMatch.description,
          bodyHtml: null,
          paragraphs: (fallbackMatch as any).contentParagraphs || [
            fallbackMatch.description,
            'Our frontline social workers and community outreach teams actively work across Kinondoni, Temeke, and Ilala districts to protect vulnerable children and support street-connected youth.',
            'By providing safe transitional shelter, trauma-informed psychosocial counselling, and accelerated MEMKWA education, Babawatoto enables children to regain their confidence and return to school.',
            'Working in close partnership with municipal social welfare officers and local caregivers, our programs ensure sustainable family reunification and long-term community reintegration.',
          ],
          quote: (fallbackMatch as any).badge === 'Story of Change' ? '"With Babawatoto by my side, I rediscovered hope, safety, and a future I can be proud of."' : null,
        }
      : {
          id: 'default-news',
          title: 'Babawatoto Community Field Dispatch',
          badge: 'Field News',
          author: 'Babawatoto Field Team',
          published: 'Recent Update',
          imageUrl: '/media/public/images/programmes/arts1.webp',
          leadSummary: 'Babawatoto Centre for Children and Youth Trust (BAO) field practitioners continue frontline outreach and community safeguarding across Dar es Salaam.',
          bodyHtml: null,
          paragraphs: [
            'Babawatoto Centre for Children and Youth Trust (BAO) is dedicated to protecting vulnerable children, reuniting street-connected youth with their families, and empowering communities in Tanzania.',
            'Our frontline social workers and educators meet children where they are—providing emergency triage, trauma-informed psychosocial counselling, and access to catch-up schooling.',
            'Every outreach mission is conducted with high child safeguarding integrity and in full compliance with Tanzania’s Law of the Child Act.',
          ],
          quote: null,
        };

    // Placeholder of images (Gallery of field photos with captions)
    const articleGallery = [
      {
        url: '/media/public/images/programmes/community aoutreach 2.jpg',
        title: 'Street Outreach Session',
        caption: 'Mobile social work teams identifying vulnerable youth and conducting frontline safeguarding in Dar es Salaam.',
      },
      {
        url: '/media/public/images/projects/WATOTO.webp',
        title: 'Accelerated Education',
        caption: 'Youth engaged in accelerated MEMKWA catch-up primary education classes at Babawatoto community centre.',
      },
      {
        url: '/media/public/images/programmes/arts1.webp',
        title: 'HEART Creative Arts',
        caption: 'Acrobatic storytelling and psychosocial theatre rehearsals building resilience and youth confidence.',
      },
      {
        url: '/media/public/images/programmes/IMG_1087.JPG',
        title: 'Family & Kinship Dialogue',
        caption: 'Social workers facilitating family mediation and preparing safe, sustainable reunification pathways.',
      },
      {
        url: '/media/public/images/projects/vocation.JPG',
        title: 'Vocational Apprenticeships',
        caption: 'Apprentices gaining practical tailoring, carpentry, and small enterprise management skills.',
      },
      {
        url: '/media/public/images/organization/hero2.webp',
        title: 'Community Reflection Forum',
        caption: 'Grassroots caregivers, ward leaders, and mentors collaborating on local child protection systems.',
      },
    ];

    // Related articles (pick other articles)
    const relatedCards = allCards.filter((c: any) => c.id !== activeItem.id && c.title !== activeItem.title).slice(0, 3);

    return (
      <div className="w-full pb-20 space-y-12">
        {/* Article Breadcrumbs & Top Navigation */}
        <div className="w-full bg-[#FBFBFA] border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <button
              onClick={() => navigate?.('/news')}
              className="bao-btn px-4 py-2 text-black font-extrabold text-sm inline-flex items-center gap-2 cursor-pointer hover:bg-black hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'en' ? 'Back to All News & Stories' : 'Rudi kwenye Habari na Simulizi'}</span>
            </button>
            <div className="text-xs font-semibold text-slate-500 hidden sm:flex items-center gap-1.5 truncate">
              <span className="cursor-pointer hover:underline" onClick={() => navigate?.('/')}>Home</span>
              <span>/</span>
              <span className="cursor-pointer hover:underline" onClick={() => navigate?.('/news')}>News</span>
              <span>/</span>
              <span className="text-black font-bold truncate max-w-xs">{activeItem.title}</span>
            </div>
          </div>
        </div>

        {/* Article Main Container */}
        <article className="max-w-4xl mx-auto px-4 space-y-8">
          {/* Header Metadata */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase tracking-wider text-xs rounded-xs">
                {activeItem.badge}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {activeItem.published}
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-bold text-slate-700">
                {activeItem.author}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-black leading-tight tracking-tight">
              {activeItem.title}
            </h1>

            {activeItem.leadSummary && (
              <p className="text-lg sm:text-xl text-slate-700 font-medium leading-relaxed border-l-4 border-[#E6A500] pl-4 py-1">
                {activeItem.leadSummary}
              </p>
            )}
          </div>

          {/* Featured Hero Image Showcase */}
          <div className="overflow-hidden rounded-2xl border-4 border-white shadow-md bg-neutral-100">
            <img
              src={activeItem.imageUrl}
              alt={activeItem.title}
              className="w-full aspect-[16/9] object-cover"
            />
            <div className="p-3 bg-white text-xs font-semibold text-slate-600 border-t border-gray-100 flex items-center justify-between">
              <span>{activeItem.title}</span>
              <span className="text-slate-400 font-mono text-[11px]">Babawatoto Media Archive</span>
            </div>
          </div>

          {/* Paragraphs of Text Body */}
          <div className="space-y-6 pt-2">
            {activeItem.bodyHtml ? (
              <div
                className="prose prose-lg max-w-none text-black leading-relaxed space-y-5"
                dangerouslySetInnerHTML={{ __html: activeItem.bodyHtml }}
              />
            ) : (
              <div className="space-y-5 text-lg text-black/90 leading-relaxed font-normal">
                {activeItem.paragraphs?.map((para: string, pIdx: number) => (
                  <p key={pIdx} className="leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            )}

            {/* Pull Quote Highlight */}
            {activeItem.quote && (
              <blockquote className="my-8 border-l-4 border-[#E6A500] bg-amber-50/80 p-6 rounded-r-2xl italic font-semibold text-xl text-black">
                "{activeItem.quote}"
              </blockquote>
            )}
          </div>

          {/* Placeholder of Images / Event Photo Gallery */}
          <section className="space-y-6 pt-8 border-t border-gray-200">
            <div>
              <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[12px] tracking-wider inline-block mb-1.5">
                {lang === 'en' ? 'Field Documentation & Gallery' : 'Nyaraka za Picha na Simulizi'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-black">
                {lang === 'en' ? 'Photo Documentation from the Field' : 'Picha za Ushahidi kutoka Nyanjani'}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl">
                {lang === 'en'
                  ? 'Visual evidence capturing frontline child protection, community forums, and psychosocial empowerment sessions in action.'
                  : 'Ushahidi wa picha unaoonyesha utekelezaji wa huduma za ulinzi wa watoto na uwezeshaji wa jamii.'}
              </p>
            </div>

            {/* Responsive Image Grid with Captions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articleGallery.map((img, idx) => (
                <div
                  key={idx}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-none transition hover:border-black"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                    <img
                      src={img.url}
                      alt={img.caption}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 bg-white border-t border-gray-100 space-y-1">
                    <span className="text-[11px] font-extrabold uppercase text-[#E6A500] tracking-wider block">
                      {img.title}
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-black/85 leading-snug">
                      {img.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Related Articles & Stories Section */}
          {relatedCards.length > 0 && (
            <section className="space-y-6 pt-10 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[12px] tracking-wider inline-block mb-1.5">
                    {lang === 'en' ? 'Explore More' : 'Gundua Zaidi'}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-black">
                    {lang === 'en' ? 'More News & Stories of Change' : 'Habari na Simulizi Zingine'}
                  </h3>
                </div>
                <button
                  onClick={() => navigate?.('/news')}
                  className="bao-btn px-4 py-2 text-black font-extrabold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{lang === 'en' ? 'View All' : 'Zote'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedCards.map((cardItem: any) => (
                  <Card
                    key={cardItem.id}
                    className="overflow-hidden border border-gray-200 bg-white shadow-none rounded-2xl hover:border-black transition duration-200 group flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[16/9] w-full overflow-hidden bg-neutral-100 relative">
                        <a
                          href={cardItem.url}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate?.(cardItem.url);
                          }}
                          className="block w-full h-full cursor-pointer"
                        >
                          <img
                            src={cardItem.imageUrl}
                            alt={cardItem.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </a>
                        <div className="absolute top-2.5 left-2.5">
                          <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-[#E6A500] text-black rounded">
                            {cardItem.badge}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4 space-y-1.5">
                        <h4 className="font-extrabold text-base text-black leading-snug line-clamp-2 group-hover:text-amber-700 transition">
                          <a
                            href={cardItem.url}
                            onClick={(e) => {
                              e.preventDefault();
                              navigate?.(cardItem.url);
                            }}
                            className="hover:underline cursor-pointer"
                          >
                            {cardItem.title}
                          </a>
                        </h4>
                        <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                          {cardItem.description}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 pt-0">
                      <button
                        onClick={() => navigate?.(cardItem.url)}
                        className="text-xs font-extrabold uppercase text-black inline-flex items-center gap-1 group-hover:text-amber-600 transition cursor-pointer"
                      >
                        <span>{lang === 'en' ? 'Read full article' : 'Soma yote'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Bottom Back Button */}
          <div className="pt-6 text-center">
            <button
              onClick={() => navigate?.('/news')}
              className="bao-btn px-7 py-3 text-black font-extrabold text-base inline-flex items-center gap-2 cursor-pointer hover:bg-black hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'en' ? 'Return to All News & Field Dispatches' : 'Rudi kwenye Habari na Simulizi Zote'}</span>
            </button>
          </div>
        </article>
      </div>
    );
  }

  // ==========================================
  // MAIN NEWS & STORIES LISTING VIEW
  // ==========================================
  return (
    <div className="w-full space-y-12 pb-16">
      {/* 1. Large Hero Section matching Home Hero Section size & layout */}
      <section className="relative w-full bg-[#E6A500] text-black overflow-hidden">
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{
            backgroundImage: `url('${heroImage}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#E6A500] via-[#E6A500]/90 to-white/25" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            {pageBadge && (
              <span className="inline-block px-3.5 py-1.5 bg-black text-white text-xs font-black uppercase tracking-wider mb-2">
                {pageBadge}
              </span>
            )}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-black">
              {pageTitle}
            </h1>
            {leadDescription && (
              <div className="text-base sm:text-lg text-black max-w-2xl leading-relaxed font-medium space-y-2">
                <p>{leadDescription}</p>
              </div>
            )}
          </div>
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-none border-4 border-white bg-black/10">
              <img
                src={heroImage}
                alt={pageTitle}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. News & Stories Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="border-b border-gray-200 pb-4">
          <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase tracking-wider text-[13px] inline-block mb-1">
            {lang === 'en' ? 'News & Stories of Change' : 'Habari na Simulizi za Mabadiliko'}
          </span>
          <h2 className="font-extrabold text-2xl sm:text-3xl text-black">
            {lang === 'en' ? 'All Field Dispatches & Stories of Transformation' : 'Taarifa Zote za Nyanjani na Simulizi za Mabadiliko'}
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            {lang === 'en'
              ? 'Browse all official organizational updates, field milestones, and lived transformation journeys from street-connected youth and families across Tanzania.'
              : 'Soma taarifa zote za shirika, matukio ya nyanjani na simulizi za maisha halisi ya watoto na jamii zilizowezeshwa.'}
          </p>
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
                    navigate?.(item.url);
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
                  {item.published && (
                    <span className="text-slate-400">{item.published}</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-black leading-snug group-hover:text-amber-700 transition">
                  <a
                    href={item.url}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate?.(item.url);
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
                  onClick={() => navigate?.(item.url)}
                  className="flex items-center text-xs font-extrabold uppercase tracking-wider text-black group-hover:text-amber-600 transition cursor-pointer"
                >
                  {item.targetLabel || 'Read full article'}
                  <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1" />
                </button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
export function ResourcesView({
  lang,
  subpage,
  siteData,
  navigate,
}: {
  lang: LanguageCode;
  subpage?: string;
  siteData: any;
  navigate?: (path: string) => void;
}) {
  const dict = UI_TRANSLATIONS[lang];
  const publications = siteData.publications || [];
  const media = siteData.media || [];
  const [search, setSearch] = useState('');
  const activeSub = subpage || 'publications';
  const [lightbox, setLightbox] = useState<any>(null);
  const galleryImages = media.filter(
    (m: any) => m.visibility === 'public' && m.mime_type?.startsWith('image/')
  );

  // 1. STANDALONE PAGE: /resources/gallery (Our Gallery)
  if (activeSub === 'gallery') {
    const cmsPage = (siteData.pages || []).find((p: any) => (p.page_key === 'gallery' || p.slug === 'gallery') && p.status !== 'archived');
    const tr = (cmsPage?.page_translations || []).find((t: any) => t.language === lang) || (cmsPage?.page_translations || [])[0] || {};
    const galSettings = siteData.settings?.gallery_page_settings || {};
    const heroTitle = galSettings.hero_title || tr.title || (lang === 'sw' ? 'Mkusanyiko wa Picha na Video za Babawatoto' : 'Our Field Photo & Video Gallery');
    const heroBadge = galSettings.hero_badge || tr.hero_tag || (lang === 'sw' ? 'Rasilimali · Hifadhi ya Picha' : 'Resources · Visual Archive');
    const heroImage = galSettings.hero_banner_image || resolveMediaUrl(cmsPage?.featured_media_id, media) || '/media/public/images/programmes/arts1.webp';
    const leadDescription = galSettings.lead_description || tr.subtitle || (lang === 'sw' ? 'Picha na video zilizothibitishwa kutoka nyanjani za miradi ya Ulinzi wa Mtoto, MEMKWA, Sanaa za HEART, na Maisha ya Vijana Dar es Salaam.' : 'Verified field photographs and documentary videos across Child Protection, MEMKWA Education, HEART Creative Arts, and Youth Livelihoods in Dar es Salaam.');

    const formattedGalleryItems = (galleryImages.length > 0
      ? galleryImages.map((img: any) => ({
        id: img.id,
        src: `/media/${img.storage_key}`,
        title: (lang === 'sw' ? img.title_sw : img.title_en) || img.title_en || img.title || img.original_filename || (lang === 'sw' ? 'Kazi ya Jamii' : 'Community Field Action'),
        alt: (lang === 'sw' ? img.alt_text_sw : img.alt_text_en) || img.alt_text_en || img.alt_text || img.title_en || 'Babawatoto Gallery',
        caption: (lang === 'sw' ? img.caption_sw : img.caption_en) || img.caption_en || img.caption || img.alt_text_en || img.alt_text || '',
        category: img.category || (lang === 'sw' ? 'Shambani' : 'Field Photo'),
        isPlaceholder: false,
      }))
      : [
        { id: 'g1', src: '/media/public/images/programmes/arts1.webp', title: 'HEART Creative Arts Workshop', alt: 'Creative Arts', caption: 'Children engaged in acrobatic arts and drama facilitation.', category: 'Arts & Culture', isPlaceholder: false },
        { id: 'g2', src: '/media/public/images/programmes/IMG_1087.JPG', title: 'Street Outreach in Dar es Salaam', alt: 'Street Outreach', caption: 'Direct social work support and life-skills counselling.', category: 'Child Protection', isPlaceholder: false },
        { id: 'g3', src: '/media/public/images/organization/abouts.webp', title: 'MEMKWA Accelerated Learning', alt: 'Education Catch-up', caption: 'Non-formal classroom instruction preparing out-of-school youth.', category: 'Education', isPlaceholder: false },
        { id: 'g4', src: '/media/public/images/programmes/YOUTH.webp', title: 'Youth Entrepreneurship Session', alt: 'Youth Livelihoods', caption: 'Vocational apprenticeships and financial literacy training.', category: 'Livelihoods', isPlaceholder: false },
        { id: 'g5', src: '/media/public/images/projects/WATOTO.webp', title: 'Child Rights Forum & Safeguarding', alt: 'Child Protection', caption: 'Safe shelter, psycho-social care, and family reunification.', category: 'Safeguarding', isPlaceholder: false },
        { id: 'g6', src: '/media/public/images/organization/hero1.webp', title: 'Community Sports & Recreation', alt: 'Sports Program', caption: 'Promoting teamwork, self-confidence, and youth wellness.', category: 'Youth Wellness', isPlaceholder: false },
        { id: 'g7', src: '/media/public/images/programmes/kizazi.webp', title: 'Youth Digital Skills & Creative Media', alt: 'Digital Literacy', caption: 'Modern audio-visual and multimedia computer education.', category: 'Creative Tech', isPlaceholder: false },
        { id: 'g8', src: '/media/public/images/organization/babawatoto_center.webp', title: 'Babawatoto Community Centre', alt: 'Centre Activities', caption: 'Our multi-purpose community resource and child activity hub.', category: 'Community Hub', isPlaceholder: false },
      ]
    );

    return (
      <StandardPageTemplate
        pageTitle={heroTitle}
        pageBadge={heroBadge}
        heroImage={heroImage}
        leadDescription={leadDescription}
        siteData={siteData}
        navigate={navigate}
        hideNews={true}
        hideMetrics={true}
      >
        <SectionSeparator label={lang === 'sw' ? 'Mkusanyiko wa Picha Zilizothibitishwa' : 'Verified Field Photography Collection'} />
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-[28px] sm:text-[36px] font-extrabold text-black text-center mx-auto">
            {lang === 'sw' ? 'Picha Zetu za Hivi Karibuni' : 'Our Latest Moments'}
          </h2>
          <p className="text-[17px] sm:text-[19px] text-black/70 text-center max-w-2xl mx-auto font-medium">
            {lang === 'sw'
              ? 'Mkusanyiko wa picha za kazi zetu za hivi karibuni katika jamii, zikipigwa kwa heshima na ridhaa.'
              : 'A visual collection of our most recent work in the community, captured with care, dignity, and informed consent.'}
          </p>
        </div>

        {/* Responsive Photo Gallery Grid across all screen sizes (mobile 1 col, small 2 cols, tablet 3 cols, desktop 4 cols) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {formattedGalleryItems.map((item: any) => (
            <div
              key={item.id}
              className="relative group rounded-2xl overflow-hidden border-2 border-black/10 hover:border-[#E6A500] bg-white shadow-sm hover:shadow-xl transition-all duration-300 aspect-[4/3] flex flex-col justify-end cursor-pointer"
              onClick={() => !item.isPlaceholder && setLightbox(item)}
              tabIndex={0}
              role="button"
              aria-label={item.title}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (!item.isPlaceholder) setLightbox(item);
                }
              }}
            >
              {item.isPlaceholder ? (
                <div className="w-full h-full bg-[#F2F2F2] flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <ImageIcon className="w-10 h-10 text-black/40" />
                  <span className="text-[14px] font-bold text-black/50">
                    {lang === 'sw' ? 'Nafasi ya Picha' : 'Photo Placeholder'}
                  </span>
                </div>
              ) : (
                <>
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Subtle permanent bottom gradient for readability + enhanced on hover/touch */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-85 sm:opacity-75 sm:group-hover:opacity-95 transition-opacity duration-300" />

                  {/* Category Pill at top right */}
                  {item.category && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-2.5 py-1 bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold rounded-full border border-white/20 shadow-sm">
                        {item.category}
                      </span>
                    </div>
                  )}

                  <div className="relative p-4 sm:p-5 text-white z-10 flex flex-col justify-end space-y-1">
                    <h3 className="text-base sm:text-lg font-black text-white line-clamp-2 drop-shadow-sm leading-snug">
                      {item.title}
                    </h3>
                    {item.caption && (
                      <p className="text-xs sm:text-sm text-white/80 line-clamp-1 font-medium">
                        {item.caption}
                      </p>
                    )}
                    <div className="pt-2 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#E6A500] group-hover:underline">
                        <span>{lang === 'sw' ? 'Ona Zaidi' : 'View Full Image'}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#E6A500]" />
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Lightbox for "Show More" */}
        {lightbox && (
          <div
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="relative max-w-5xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border-2 border-black"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/80 hover:bg-black text-white text-[24px] font-bold flex items-center justify-center shadow-lg transition cursor-pointer"
                aria-label="Close"
              >
                &times;
              </button>
              <img
                src={lightbox.src}
                alt={lightbox.alt}
                className="w-full max-h-[75vh] object-contain bg-black"
              />
              <div className="p-5 sm:p-6 space-y-1.5 bg-white">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl sm:text-2xl font-black text-black leading-snug">
                    {lightbox.title}
                  </h3>
                  {lightbox.category && (
                    <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-xs tracking-wider rounded">
                      {lightbox.category}
                    </span>
                  )}
                </div>
                {lightbox.caption && (
                  <p className="text-sm sm:text-base text-black/75 font-medium leading-relaxed">
                    {lightbox.caption}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <SectionSeparator label={lang === 'sw' ? 'Hifadhi ya Video Rasmi @babawatotoorganization' : 'Official @babawatotoorganization Video Archive'} />
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              id: 'pdx8DWYJM_o',
              title: 'BABAWATOTO ORGANIZATION CIRCUS PERFORMANCE!!!!',
              desc: 'Acrobatics and circus arts showcase by Babawatoto youth.',
            },
            {
              id: 'FgXXMyMLF9k',
              title: 'BABAWATOTO ORGANIZATION THEATER ARTS PERFORMANCE LIVE',
              desc: 'Community theatre for child protection and social behaviour change.',
            },
            {
              id: 'R09iiZAHiFs',
              title: 'BABAWATOTO ORGANIZATION LIVE PERFORMANCE',
              desc: 'Live cultural drumming, dance, and youth empowerment performance.',
            },
          ].map((vid) => (
            <div key={vid.id} className="bg-white border-2 border-black/10 hover:border-[#E6A500] rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden">
              <div className="aspect-video bg-black">
                <YouTubeEmbed
                  videoId={vid.id}
                  title={vid.title}
                />
              </div>
              <div className="p-5 space-y-2">
                <h3 className="text-lg font-black text-black line-clamp-2">{vid.title}</h3>
                <p className="text-sm text-black/75 leading-relaxed font-medium">{vid.desc}</p>
              </div>
            </div>
          ))}
        </section>
      </StandardPageTemplate>
    );
  }

  // 2. STANDALONE PAGE: /resources/documentation (Documentation)
  if (activeSub === 'documentation') {
    const docItems = publications.filter((p: any) =>
      ['manual', 'research', 'annual_report'].includes(p.publication_category)
    );
    const cmsPage = (siteData.pages || []).find((p: any) => (p.page_key === 'documentation' || p.slug === 'documentation') && p.status !== 'archived');
    const tr = (cmsPage?.page_translations || []).find((t: any) => t.language === lang) || (cmsPage?.page_translations || [])[0] || {};
    const docSettings = siteData.settings?.documentation_page_settings || {};
    const heroTitle = docSettings.hero_title || tr.title || (lang === 'sw' ? 'Nyaraka za Programu na Miongozo ya Kitaalamu' : 'Programme Documentation & Technical Manuals');
    const heroBadge = docSettings.hero_badge || tr.hero_tag || (lang === 'sw' ? 'Rasilimali · Nyaraka za Kitaasisi' : 'Resources · Institutional Documentation');
    const heroImage = docSettings.hero_banner_image || resolveMediaUrl(cmsPage?.featured_media_id, media) || '/media/public/images/programmes/YOUTH.webp';
    const leadDescription = docSettings.lead_description || tr.subtitle || (lang === 'sw' ? 'Nyaraka za kina za mbinu za ustawi wa jamii za Babawatoto, mitaala ya elimu isiyo rasmi ya MEMKWA, miongozo ya tiba ya sanaa za HEART, na mifumo ya MEL.' : 'Comprehensive documentation of Babawatoto’s social work methodologies, MEMKWA non-formal education curriculum, HEART creative arts therapy guides, and MEL frameworks.');

    return (
      <StandardPageTemplate
        pageTitle={heroTitle}
        pageBadge={heroBadge}
        heroImage={heroImage}
        leadDescription={leadDescription}
        siteData={siteData}
        navigate={navigate}
        hideNews={true}
        hideMetrics={true}
      >
        <SectionSeparator label={lang === 'sw' ? 'Hifadhi ya Nyaraka Zinazoweza Kupakuliwa' : 'Downloadable Documentation Repository'} />
        {docItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {docItems.map((pub: any) => {
              const tr =
                (pub.publication_translations || []).find((t: any) => t.language === lang) ||
                (pub.publication_translations || [])[0] ||
                {};
              const docUrl = resolveMediaUrl(pub.document_media_id, media);
              return (
                <div
                  key={pub.id}
                  className="bg-white border-2 border-black/10 hover:border-[#E6A500] rounded-2xl shadow-sm hover:shadow-lg transition p-6 sm:p-7 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-xs tracking-wider rounded-md inline-block">
                      {pub.publication_category} · {pub.publication_year}
                    </span>
                    <h3 className="font-black text-xl sm:text-2xl text-black leading-snug">{tr.title}</h3>
                    <p className="text-sm sm:text-base text-black/80 font-medium leading-relaxed">{tr.summary}</p>
                  </div>
                  {docUrl && (
                    <div className="pt-2">
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bao-btn px-5 py-2.5 bg-black text-white hover:bg-neutral-900 font-extrabold text-sm inline-flex items-center gap-2 rounded-lg"
                      >
                        <Download className="w-4 h-4 text-[#E6A500]" />
                        <span>Download PDF</span>
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyStateCard
            title={lang === 'sw' ? 'Hifadhi ya Nyaraka za Kitaalamu' : 'Technical Documentation Repository'}
            description={lang === 'sw' ? 'Pakia miongozo ya kiufundi na nyaraka za programu kupitia sehemu ya Usimamizi wa Tovuti (CMS).' : 'Upload technical manuals and programme documentation via the BAO Administrative CMS Resources module.'}
            icon={BookOpen}
          />
        )}
      </StandardPageTemplate>
    );
  }

  // 3. STANDALONE PAGE: /resources/policies-and-guidelines (Policy and Guidelines)
  if (activeSub === 'policies-and-guidelines') {
    const policyDocs = publications.filter((p: any) =>
      ['policy', 'guideline'].includes(p.publication_category)
    );
    const cmsPage = (siteData.pages || []).find((p: any) => (p.page_key === 'policies-and-guidelines' || p.slug === 'policies-and-guidelines') && p.status !== 'archived');
    const tr = (cmsPage?.page_translations || []).find((t: any) => t.language === lang) || (cmsPage?.page_translations || [])[0] || {};
    const polSettings = siteData.settings?.policies_page_settings || {};
    const heroTitle = polSettings.hero_title || tr.title || (lang === 'sw' ? 'Sera za Shirika na Miongozo ya Uendeshaji' : 'Organizational Policies & Operational Guidelines');
    const heroBadge = polSettings.hero_badge || tr.hero_tag || (lang === 'sw' ? 'Rasilimali · Utawala, Maadili na Ulinzi' : 'Resources · Governance, Ethics & Safeguarding');
    const heroImage = polSettings.hero_banner_image || resolveMediaUrl(cmsPage?.featured_media_id, media) || '/media/public/images/projects/WATOTO.webp';
    const leadDescription = polSettings.lead_description || tr.subtitle || (lang === 'sw' ? 'Shirika la Babawatoto linazingatia kanuni thabiti za kutovumilia kabisa unyanyasaji wa watoto na kufuata Sheria ya Mtoto ya Tanzania (2009) na viwango vya kimataifa vya kibinadamu.' : 'Babawatoto Centre for Children and Youth Trust enforces zero tolerance for child abuse and upholds strict institutional policies aligned with Tanzania’s Law of the Child Act (2009) and international humanitarian standards.');

    return (
      <StandardPageTemplate
        pageTitle={heroTitle}
        pageBadge={heroBadge}
        heroImage={heroImage}
        leadDescription={leadDescription}
        siteData={siteData}
        navigate={navigate}
        hideNews={true}
        hideMetrics={true}
      >
        <SectionSeparator label={lang === 'sw' ? 'Nyaraka za Sera Zinazoweza Kupakuliwa' : 'Downloadable Policy Documents'} />
        {policyDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {policyDocs.map((pub: any) => {
              const tr =
                (pub.publication_translations || []).find((t: any) => t.language === lang) ||
                (pub.publication_translations || [])[0] ||
                {};
              const docUrl = resolveMediaUrl(pub.document_media_id, media);
              return (
                <div
                  key={pub.id}
                  className="bg-white border-2 border-black/10 hover:border-[#E6A500] rounded-2xl shadow-sm hover:shadow-lg transition p-6 sm:p-7 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-xs tracking-wider rounded-md inline-block">
                      {pub.publication_category} · {pub.publication_year}
                    </span>
                    <h3 className="font-black text-xl sm:text-2xl text-black leading-snug">{tr.title}</h3>
                    <p className="text-sm sm:text-base text-black/80 font-medium leading-relaxed">{tr.summary}</p>
                  </div>
                  {docUrl && (
                    <div className="pt-2">
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bao-btn px-5 py-2.5 bg-black text-white hover:bg-neutral-900 font-extrabold text-sm inline-flex items-center gap-2 rounded-lg"
                      >
                        <Download className="w-4 h-4 text-[#E6A500]" />
                        <span>Download PDF</span>
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyStateCard
            title={lang === 'sw' ? 'Nyaraka za Sera na Miongozo' : 'Policy PDFs & Guidelines'}
            description={lang === 'sw' ? 'Nyaraka rasmi za sera zilizopakiwa katika mfumo zitaonekana hapa kwa ajili ya kupakuliwa na umma.' : 'Official signed PDF policy documents uploaded in the CMS will appear here for public download.'}
            icon={ShieldCheck}
          />
        )}
      </StandardPageTemplate>
    );
  }

  // 4. STANDALONE PAGE: /resources/publications (Publications)
  const pubSettings = siteData.settings?.publications_page_settings || siteData.settings?.resources_page_settings || {};
  const cmsPage = (siteData.pages || []).find((p: any) => (p.page_key === 'publications' || p.slug === 'publications') && p.status !== 'archived');
  const tr = (cmsPage?.page_translations || []).find((t: any) => t.language === lang) || (cmsPage?.page_translations || [])[0] || {};
  const pubHeroBadge = pubSettings.hero_badge || tr.hero_tag || (lang === 'sw' ? 'Rasilimali · Ripoti na Utafiti' : 'Resources · Reports & Research');
  const pubHeroTitle = pubSettings.hero_title || tr.title || (lang === 'sw' ? 'Machapisho, Ripoti za Mwaka na Tafiti' : 'Publications, Annual Reports & Research Studies');
  const pubLeadDescription = pubSettings.lead_description || tr.subtitle || (lang === 'sw' ? 'Pata ripoti za mwaka za Shirika la Babawatoto, tathmini za MEL, muhtasari wa sera, na machapisho ya utafiti wa kijamii.' : 'Access Babawatoto Organization’s annual reports, MEL evaluation studies, policy briefs, and community research publications.');
  const pubHeroImage = pubSettings.hero_image || pubSettings.hero_banner_image || resolveMediaUrl(cmsPage?.featured_media_id, media) || '/media/public/images/programmes/kizazi.webp';

  const filteredPubs = publications.filter((p: any) => {
    const trPub = (p.publication_translations || [])[0] || {};
    return !search || `${trPub.title} ${trPub.summary}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <StandardPageTemplate
      pageTitle={pubHeroTitle}
      pageBadge={pubHeroBadge}
      heroImage={pubHeroImage}
      leadDescription={pubLeadDescription}
      siteData={siteData}
      navigate={navigate}
      hideNews={true}
      hideMetrics={true}
    >
      <SectionSeparator label={lang === 'sw' ? 'Tafuta na Pakua Machapisho' : 'Search & Download Publications'} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-black text-black">
          {lang === 'sw' ? `Ripoti na Tafiti Zilizochapishwa (${filteredPubs.length})` : `Published Reports & Research (${filteredPubs.length})`}
        </h2>
        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 text-black absolute left-3.5 top-3.5" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'sw' ? 'Tafuta ripoti...' : 'Search publications...'}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#E6A500] text-base text-black"
          />
        </div>
      </div>

      {filteredPubs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {filteredPubs.map((pub: any) => {
            const trPub =
              (pub.publication_translations || []).find((t: any) => t.language === lang) ||
              (pub.publication_translations || [])[0] ||
              {};
            const docUrl = resolveMediaUrl(pub.document_media_id, media);
            return (
              <div
                key={pub.id}
                className="bg-white border-2 border-black/10 hover:border-[#E6A500] rounded-2xl shadow-sm hover:shadow-lg transition p-6 sm:p-7 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-xs tracking-wider rounded-md inline-block">
                    {pub.publication_category} · {pub.publication_year}
                  </span>
                  <h3 className="font-black text-xl sm:text-2xl text-black leading-snug">{trPub.title}</h3>
                  <p className="text-sm sm:text-base text-black/80 font-medium leading-relaxed">{trPub.summary}</p>
                </div>
                {docUrl && (
                  <div className="pt-2">
                    <a
                      href={docUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="bao-btn px-5 py-2.5 bg-black text-white hover:bg-neutral-900 font-extrabold text-sm inline-flex items-center gap-2 rounded-lg"
                    >
                      <Download className="w-4 h-4 text-[#E6A500]" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyStateCard
          title={dict.emptyStates.publicationsTitle}
          description={dict.emptyStates.publicationsDesc}
          icon={FileText}
        />
      )}
    </StandardPageTemplate>
  );
}

/**
 * Standalone Get Involved Page
 */
export function GetInvolvedView({ lang, siteData, navigate }: { lang: LanguageCode; siteData: any; navigate?: (path: string) => void }) {
  const dict = UI_TRANSLATIONS[lang];
  const partners = siteData.partners || [];
  const media = siteData.media || [];
  const cmsPage = (siteData.pages || []).find((p: any) => p.page_key === 'get-involved' && p.status !== 'archived');
  const tr = (cmsPage?.page_translations || []).find((t: any) => t.language === lang) || (cmsPage?.page_translations || [])[0] || {};
  const giSettings = siteData.settings?.get_involved_settings || {};
  const heroBadge = giSettings.hero_badge || tr.hero_tag || 'Institutional Donors, Foundations & Strategic Partnerships';
  const heroTitle = giSettings.hero_title || tr.title || 'Partner With Babawatoto for Lasting Child & Youth Impact';
  const leadDescription = giSettings.lead_description || tr.subtitle || 'Inspired by international humanitarian accountability standards, Babawatoto collaborates with bilateral agencies, international foundations, and local government authorities to deliver measurable, audited, and safeguarding-compliant programmes in Tanzania.';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCity, setCountryCity] = useState('Dar es Salaam, Tanzania');
  const [area, setArea] = useState('Child Protection & Social Work');
  const [skills, setSkills] = useState('');
  const [availability, setAvailability] = useState('3 Months Full-Time');
  const [motivation, setMotivation] = useState('');
  const [pledge, setPledge] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isErr?: boolean } | null>(null);
  const handleVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/public/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          country_city: countryCity,
          area_of_interest: area,
          skills_summary: skills,
          availability,
          motivation,
          safeguarding_pledge_accepted: pledge,
          honeypot: '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setStatusMsg({ text: data.message });
      setFullName('');
      setEmail('');
      setPhone('');
      setSkills('');
      setMotivation('');
    } catch (err: any) {
      setStatusMsg({ text: err.message, isErr: true });
    }
  };
  return (
    <div className="w-full space-y-14 pb-16">
      {/* 1. HERO BANNER: Full-width matching Home Hero Banner */}
      <section className="relative w-full bg-[#E6A500] text-black overflow-hidden">
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{ backgroundImage: `url('/media/public/images/organization/hero1.webp')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#E6A500] via-[#E6A500]/90 to-white/25" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="inline-block px-3.5 py-1.5 bg-black text-white text-xs font-black uppercase tracking-wider mb-2">
              {heroBadge}
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-black">
              {heroTitle}
            </h1>
            <p className="text-base sm:text-lg text-black max-w-2xl leading-relaxed font-medium">
              {leadDescription}
            </p>
          </div>
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-none border-4 border-white bg-black/10">
              <img
                src="/media/public/images/organization/hero1.webp"
                alt={heroTitle}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 space-y-14">
        <section className="space-y-8">
        <SectionSeparator label="Institutional Partners & Donors" />
        {partners && partners.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(partners || []).map((p: any) => {
              const logoUrl = resolveMediaUrl(p.logo_media_id || p.logo_id, media) || p.logo_url || null;
              const categoryLabel = (p.partner_type || p.partner_category || 'partner').replace(/_/g, ' ');
              const description =
                p.description_en ||
                p.partnership_focus_en ||
                p.partnership_description_en ||
                'Strategic development partner supporting Babawatoto Organization programmes.';
              return (
                <div
                  key={p.id}
                  className="bg-white border-2 border-[#E5E7E5] hover:border-[#E6A500] shadow-sm p-7 space-y-4 flex flex-col justify-between transition rounded-xl"
                >
                  <div className="space-y-3">
                    {logoUrl ? (
                      <div className="h-16 w-full flex items-center justify-start bg-white rounded p-1">
                        <img src={logoUrl} alt={p.name} className="max-h-14 max-w-[220px] object-contain" />
                      </div>
                    ) : (
                      <div className="h-16 w-16 bg-[#F4F5F4] rounded-lg flex items-center justify-center">
                        <Handshake className="w-8 h-8 text-[#E6A500]" />
                      </div>
                    )}
                    <h3 className="font-extrabold text-[22px] text-black">{p.name}</h3>
                    <p className="text-[18px] text-black leading-relaxed">
                      {description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#F4F5F4]">
                    <span className="px-3 py-1 bg-[#E6A500] text-black font-bold uppercase text-[13px] rounded">
                      {categoryLabel}
                    </span>
                    {p.website_url && (
                      <a
                        href={p.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-black hover:text-[#E6A500] underline"
                      >
                        Visit Website ↗
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <SectionSeparator label="Volunteer & Practitioner Fellowship Application" />
      <section className="bg-white border border-gray-200 shadow-none p-8 lg:p-10 max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-[32px] font-extrabold text-black">
            Volunteer & Technical Fellowship Application
          </h2>
          <p className="text-[18px] text-black mt-1">
            All volunteers and fellows must adhere to the Babawatoto Child Safeguarding Code of
            Conduct.
          </p>
        </div>
        {statusMsg && (
          <div
            className={`p-4 text-[18px] font-bold ${statusMsg.isErr ? 'bg-red-50 text-red-700' : 'bg-[#E6A500]/20 text-black'
              }`}
          >
            {statusMsg.text}
          </div>
        )}
        <form onSubmit={handleVolunteerSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[17px] font-extrabold text-black mb-1.5">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Sarah Mwangi"
                className="w-full px-4 py-3.5 border-2 border-gray-400 rounded-xl bg-white text-[18px] text-black placeholder:text-gray-500 focus:border-black focus:ring-2 focus:ring-[#E6A500]/30 outline-hidden transition shadow-xs"
              />
            </div>
            <div>
              <label className="block text-[17px] font-extrabold text-black mb-1.5">
                Email Address <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sarah@example.com"
                className="w-full px-4 py-3.5 border-2 border-gray-400 rounded-xl bg-white text-[18px] text-black placeholder:text-gray-500 focus:border-black focus:ring-2 focus:ring-[#E6A500]/30 outline-hidden transition shadow-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[17px] font-extrabold text-black mb-1.5">
                Phone Number <span className="text-red-600">*</span>
              </label>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +255 784 712095"
                className="w-full px-4 py-3.5 border-2 border-gray-400 rounded-xl bg-white text-[18px] text-black placeholder:text-gray-500 focus:border-black focus:ring-2 focus:ring-[#E6A500]/30 outline-hidden transition shadow-xs"
              />
            </div>
            <div>
              <label className="block text-[17px] font-extrabold text-black mb-1.5">
                Area of Interest <span className="text-red-600">*</span>
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-4 py-3.5 border-2 border-gray-400 rounded-xl bg-white text-[18px] text-black focus:border-black focus:ring-2 focus:ring-[#E6A500]/30 outline-hidden transition shadow-xs font-medium"
              >
                <option>Child Protection & Social Work</option>
                <option>MEMKWA Catch-Up Education</option>
                <option>HEART Creative Arts & Theatre</option>
                <option>Youth Vocational Empowerment</option>
                <option>Research, MEL & Fundraising</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[17px] font-extrabold text-black mb-1.5">
              Relevant Skills & Qualifications <span className="text-red-600">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Relevant qualifications, languages spoken, and professional skills (min 10 chars)"
              className="w-full px-4 py-3.5 border-2 border-gray-400 rounded-xl bg-white text-[18px] text-black placeholder:text-gray-500 focus:border-black focus:ring-2 focus:ring-[#E6A500]/30 outline-hidden transition shadow-xs"
            />
          </div>
          <div>
            <label className="block text-[17px] font-extrabold text-black mb-1.5">
              Motivation Statement <span className="text-red-600">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Why do you wish to volunteer or partner with Babawatoto Organization? (min 20 chars)"
              className="w-full px-4 py-3.5 border-2 border-gray-400 rounded-xl bg-white text-[18px] text-black placeholder:text-gray-500 focus:border-black focus:ring-2 focus:ring-[#E6A500]/30 outline-hidden transition shadow-xs"
            />
          </div>
          <label className="flex items-start gap-3.5 text-[18px] text-black cursor-pointer p-4 bg-gray-50 border-2 border-gray-300 rounded-xl">
            <input
              type="checkbox"
              required
              checked={pledge}
              onChange={(e) => setPledge(e.target.checked)}
              className="mt-1 w-5 h-5 accent-[#E6A500]"
            />
            <span className="font-medium leading-relaxed">
              I pledge to uphold the Babawatoto Child Safeguarding Policy and consent to background
              verification prior to working with children or youth.
            </span>
          </label>
          <button
            type="submit"
            className="bao-btn px-8 py-4 text-black font-extrabold text-[18px] cursor-pointer"
          >
            Submit Volunteer Application
          </button>
        </form>
      </section>
      </div>
    </div>
  );
}
/**
 * Standalone Contact Us Page (/contact)
 */
export function ContactView({ lang, siteData, navigate }: { lang: LanguageCode; siteData: any; navigate?: (path: string) => void }) {
  const dict = UI_TRANSLATIONS[lang];
  const contact = siteData.settings?.contact_details || {};
  const contactSettings = siteData.settings?.contact_page_settings || {};
  const orgProfile = siteData.settings?.organization_profile || {};

  // Derive multiple items lists from settings
  const phonesList: Array<{ title?: string; number: string }> =
    Array.isArray(contactSettings.phones_list) && contactSettings.phones_list.length > 0
      ? contactSettings.phones_list
      : Array.isArray(contact.phones_list) && contact.phones_list.length > 0
      ? contact.phones_list
      : (contact.phones || ['+255 651 136502', '+255 651 136504']).map((p: string, i: number) => ({
          title: i === 0 ? 'Main Office' : 'Direct Helpline',
          number: p,
        }));

  const emailsList: Array<{ title?: string; email: string }> =
    Array.isArray(contactSettings.emails_list) && contactSettings.emails_list.length > 0
      ? contactSettings.emails_list
      : Array.isArray(contact.emails_list) && contact.emails_list.length > 0
      ? contact.emails_list
      : [
          {
            title: 'General Inquiries',
            email: contact.primary_email || contact.email_primary || orgProfile.primary_email || 'info@babawatoto.or.tz',
          },
        ];

  const addressesList: Array<{ title?: string; address: string }> =
    Array.isArray(contactSettings.addresses_list) && contactSettings.addresses_list.length > 0
      ? contactSettings.addresses_list
      : Array.isArray(contact.addresses_list) && contact.addresses_list.length > 0
      ? contact.addresses_list
      : [];

  const linksList: Array<{ title?: string; url: string }> =
    Array.isArray(contactSettings.links_list) && contactSettings.links_list.length > 0
      ? contactSettings.links_list
      : Array.isArray(contactSettings.links) && contactSettings.links.length > 0
      ? contactSettings.links
      : Array.isArray(contact.links) && contact.links.length > 0
      ? contact.links
      : [];

  const heroBadge = contactSettings.hero_badge || 'Headquarters & Community Inquiries';
  const heroTitle = contactSettings.hero_title || 'Contact Babawatoto';
  const heroImage = contactSettings.hero_image || contactSettings.hero_banner_image || '/media/public/images/organization/hero1.webp';
  const leadDesc = contactSettings.lead_description || 'We welcome inquiries from partners, donors, researchers, volunteers, and community members. Reach out to our central secretariat in Dar es Salaam.';

  const cmsPage = (siteData.pages || []).find((p: any) => p.page_key === 'contact' && p.status !== 'archived');
  const tr = (cmsPage?.page_translations || []).find((t: any) => t.language === lang) || (cmsPage?.page_translations || [])[0] || {};
  const pageTitle = tr.title || heroTitle;
  const pageBadge = tr.hero_tag || heroBadge;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; isErr?: boolean } | null>(null);
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          subject,
          message,
          honeypot: '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      setStatusMsg({ text: data.message });
      setFullName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setStatusMsg({ text: err.message, isErr: true });
    }
  };
  return (
    <div className="w-full space-y-12 pb-16">
      {/* 1. HERO BANNER: Full-width matching Home Hero Banner */}
      <section className="relative w-full bg-[#E6A500] text-black overflow-hidden">
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#E6A500] via-[#E6A500]/90 to-white/25" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="inline-block px-3.5 py-1.5 bg-black text-white text-xs font-black uppercase tracking-wider mb-2">
              {pageBadge}
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-black">
              {pageTitle}
            </h1>
            <p className="text-base sm:text-lg text-black max-w-2xl leading-relaxed font-medium">
              {leadDesc}
            </p>
          </div>
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-none border-4 border-white bg-black/10">
              <img
                src={heroImage}
                alt={pageTitle}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-gray-200 shadow-none p-8 space-y-6 text-[18px]">
            <h2 className="text-[28px] font-extrabold text-black">Our Office Details</h2>

            {/* Physical / Postal Addresses */}
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-[#E6A500] shrink-0 mt-1" />
              <div className="space-y-2 break-normal hyphens-none w-full">
                <div className="font-extrabold text-[20px] text-black">
                  Physical &amp; Postal Address
                </div>
                {addressesList.length > 0 ? (
                  <div className="space-y-3 pt-1">
                    {addressesList.map((ad, idx) => (
                      <div key={idx} className="space-y-0.5">
                        {ad.title && (
                          <div className="font-bold text-black text-sm uppercase tracking-wide">
                            {ad.title}
                          </div>
                        )}
                        <p className="leading-relaxed text-black text-base font-medium">
                          {ad.address}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-black mt-1 space-y-1 text-base font-medium leading-relaxed">
                    <p className="font-bold text-black text-sm uppercase tracking-wide">
                      Babawatoto Centre Head Office
                    </p>
                    <p className="leading-snug">
                      <span className="inline-block whitespace-nowrap">St. Anne Marie Street,</span>{' '}
                      <span className="inline-block whitespace-nowrap">House No. 27</span>
                    </p>
                    <p className="leading-snug">
                      <span className="inline-block whitespace-nowrap">Morogoro Road,</span>{' '}
                      <span className="inline-block whitespace-nowrap">Mbezi Kwa Msuguri</span>
                    </p>
                    <p className="leading-snug text-gray-700">
                      <span className="inline-block whitespace-nowrap">{contact.po_box || contact.postal_address || 'P.O. Box 8293'},</span>{' '}
                      <span className="inline-block whitespace-nowrap">{contact.city || 'Dar es Salaam'}, {contact.country || 'Tanzania'}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Official Emails (Multiple Support) */}
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-[#E6A500] shrink-0 mt-1" />
              <div className="w-full">
                <div className="font-extrabold text-[20px] text-black">Official Email</div>
                <div className="space-y-2 mt-1.5">
                  {emailsList.map((em, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-2">
                      {em.title && (
                        <span className="text-xs font-bold uppercase bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded">
                          {em.title}:
                        </span>
                      )}
                      <a
                        href={`mailto:${em.email}`}
                        className="text-black font-semibold hover:text-[#E6A500] transition"
                      >
                        {em.email}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Telephones (Multiple Support) */}
            <div className="flex items-start gap-4">
              <Phone className="w-6 h-6 text-[#E6A500] shrink-0 mt-1" />
              <div className="w-full">
                <div className="font-extrabold text-[20px] text-black">Telephone</div>
                <div className="space-y-2 mt-1.5">
                  {phonesList.map((p, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-2">
                      {p.title && (
                        <span className="text-xs font-bold uppercase bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">
                          {p.title}:
                        </span>
                      )}
                      <a
                        href={`tel:${p.number.replace(/\s+/g, '')}`}
                        className="text-black font-semibold hover:text-[#E6A500] transition"
                      >
                        {p.number}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-[#E6A500] shrink-0 mt-1" />
              <div>
                <div className="font-extrabold text-[20px] text-black">Office Hours</div>
                <div className="text-black mt-1">
                  {contactSettings.office_hours || contact.working_hours_en || contact.office_hours || 'Monday – Friday: 8:00 AM – 5:00 PM (EAT)'}
                </div>
              </div>
            </div>

            {/* Official Links (Multiple Support with Link Title & Link URL) */}
            {linksList.length > 0 && (
              <div className="flex items-start gap-4 pt-4 border-t border-gray-100">
                <Globe className="w-6 h-6 text-[#E6A500] shrink-0 mt-1" />
                <div className="w-full space-y-2">
                  <div className="font-extrabold text-[20px] text-black">Official Links &amp; Resources</div>
                  <div className="space-y-2 mt-1">
                    {linksList.map((lnk, idx) => (
                      <div key={idx}>
                        <a
                          href={lnk.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-bold text-black hover:text-[#E6A500] transition text-base"
                        >
                          <span>{lnk.title || lnk.url}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-7 bg-white border border-gray-200 shadow-none p-8 space-y-6">
          <h2 className="font-extrabold text-[30px] text-black">Send Us an Inquiry</h2>
          {statusMsg && (
            <div
              className={`p-4 text-[18px] font-bold ${statusMsg.isErr ? 'bg-red-50 text-red-700' : 'bg-[#E6A500]/20 text-black'
                }`}
            >
              {statusMsg.text}
            </div>
          )}
          <form onSubmit={handleContactSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[17px] font-extrabold text-black mb-1.5">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Juma Hamisi"
                  className="w-full px-4 py-3.5 border-2 border-gray-400 rounded-xl bg-white text-[18px] text-black placeholder:text-gray-500 focus:border-black focus:ring-2 focus:ring-[#E6A500]/30 outline-hidden transition shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[17px] font-extrabold text-black mb-1.5">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. juma@example.com"
                  className="w-full px-4 py-3.5 border-2 border-gray-400 rounded-xl bg-white text-[18px] text-black placeholder:text-gray-500 focus:border-black focus:ring-2 focus:ring-[#E6A500]/30 outline-hidden transition shadow-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[17px] font-extrabold text-black mb-1.5">
                  Phone Number (Optional)
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +255 784 712095"
                  className="w-full px-4 py-3.5 border-2 border-gray-400 rounded-xl bg-white text-[18px] text-black placeholder:text-gray-500 focus:border-black focus:ring-2 focus:ring-[#E6A500]/30 outline-hidden transition shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[17px] font-extrabold text-black mb-1.5">
                  Subject <span className="text-red-600">*</span>
                </label>
                <input
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Child Protection Partnership"
                  className="w-full px-4 py-3.5 border-2 border-gray-400 rounded-xl bg-white text-[18px] text-black placeholder:text-gray-500 focus:border-black focus:ring-2 focus:ring-[#E6A500]/30 outline-hidden transition shadow-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-[17px] font-extrabold text-black mb-1.5">
                Your Message <span className="text-red-600">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message, partnership inquiry, or safeguarding question..."
                className="w-full px-4 py-3.5 border-2 border-gray-400 rounded-xl bg-white text-[18px] text-black placeholder:text-gray-500 focus:border-black focus:ring-2 focus:ring-[#E6A500]/30 outline-hidden transition shadow-xs"
              />
            </div>
            <button
              type="submit"
              className="bao-btn px-8 py-4 text-black font-extrabold text-[18px] cursor-pointer"
            >
              {dict.common.submit}
            </button>
          </form>
        </div>
      </div>
      {/* Commemorative Contact Section */}
      <SectionSeparator label="Commemorative Partnership & Community Open Door" />
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-gray-200 shadow-none p-8 lg:p-12">
        <div className="lg:col-span-7 space-y-4">
          <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[15px] inline-block">
            Our Open Door Policy
          </span>
          <h3 className="text-[30px] font-extrabold text-black">
            Welcoming Partners, Donors, and Advocates for Tanzanian Children
          </h3>
          <p className="text-[18px] text-black leading-relaxed">
            Since opening our doors in Mburahati, Babawatoto Centre for Children and Youth Trust has welcomed
            community members, international partners, and government agencies to witness first-hand our
            grassroots rehabilitation and creative education model.
          </p>
          <p className="text-[18px] text-black leading-relaxed">
            We commemorate the enduring trust and goodwill shared with our neighbours, local leaders, and global
            supporters who join hands to ensure no child is left behind on the streets.
          </p>
        </div>
        <div className="lg:col-span-5">
          <figure className="border-4 border-white shadow-none overflow-hidden bg-[#F2F2F2]">
            <img
              src="/media/public/images/organization/hero3.webp"
              alt="Babawatoto Centre Open Door"
              className="w-full h-80 object-cover"
            />
            <figcaption className="p-3 bg-white text-xs font-semibold text-black/75">
              Community outreach centre and welcoming space at Mburahati Barafu, Dar es Salaam.
            </figcaption>
          </figure>
        </div>
      </section>
      </div>
    </div>
  );
}
export function PolicyView({ slug }: { slug?: string }) {
  const titleMap: Record<string, string> = {
    'child-safeguarding': 'Child Safeguarding & Protection Policy',
    'privacy-policy': 'Privacy & Data Protection Policy',
    accessibility: 'WCAG 2.1 AA Web Accessibility Statement',
    'terms-of-use': 'Terms of Use & Ethical Standards',
  };
  const title = titleMap[slug || 'child-safeguarding'] || 'Organizational Policy';
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      <div className="bg-[#E6A500] text-black p-8 lg:p-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-black text-[15px] font-extrabold uppercase">
          <ShieldCheck className="w-4 h-4 text-black" /> Babawatoto Governance & Compliance
        </div>
        <h1 className="text-[36px] sm:text-[44px] font-extrabold text-black">{title}</h1>
      </div>
      <SectionSeparator label="Policy Statement" />
      <div className="bg-white border border-gray-200 shadow-none p-8 space-y-4">
        <p className="text-[18px] text-black leading-relaxed">
          Babawatoto Centre for Children and Youth Trust (BAO) maintains zero tolerance for child
          abuse, exploitation, or neglect. Every programme activity, publication, story of change,
          and photograph published on this platform undergoes mandatory Child Safeguarding Officer
          verification and written informed consent clearance in accordance with Tanzaniaâs Law of
          the Child Act (2009) and international humanitarian standards.
        </p>
      </div>
    </div>
  );
}