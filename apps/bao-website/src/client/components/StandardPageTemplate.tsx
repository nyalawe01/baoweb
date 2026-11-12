import React, { useState, useEffect } from 'react';
import {
  Users,
  MapPin,
  Ambulance,
  HeartHandshake,
  HeartPulse,
  Handshake,
  ArrowRight,
  BarChart3,
  Newspaper,
} from 'lucide-react';
import { resolveMediaUrl } from './HomeAndProgrammesViews.js';

/**
 * Animated Counter Component for Impact Metrics
 */
export function MetricAnimatedCounter({ target }: { target: number }) {
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
    type: 'youth reached' | 'locations' | 'emergency respondent' | 'beneficiaries' | 'hospitals' | 'partners' | string;
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
    type: 'youth reached' | 'locations' | 'emergency respondent' | 'beneficiaries' | 'hospitals' | 'partners' | string;
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

  // Resolve individual metrics for this specific page from site settings
  const resolvedPageMetrics = pageKey
    ? (siteData?.settings?.page_metrics?.[pageKey] ||
       siteData?.settings?.[`${pageKey}_page_settings`]?.metrics ||
       siteData?.settings?.[`${pageKey}_settings`]?.metrics ||
       siteData?.settings?.[pageKey]?.metrics)
    : undefined;

  const activeMetrics = (metrics && metrics.length > 0)
    ? metrics
    : (Array.isArray(resolvedPageMetrics) && resolvedPageMetrics.length > 0
        ? resolvedPageMetrics
        : defaultMetrics);
  const newsList: any[] = ((siteData && siteData.news) || []).slice(0, 3);

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
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-black/10">
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
          <section className="bg-white border border-gray-200 p-8 lg:p-10 space-y-4">
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
        <section className="bg-white border border-gray-200 p-8 lg:p-10 space-y-4">
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
                const image = resolveMediaUrl(item.featured_image_id || item.featured_media_id, (siteData && siteData.media) || []) || '/media/public/images/programmes/arts1.webp';
                const targetUrl = '/news/' + (tr.slug || item.slug || item.id);

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col justify-between group hover:border-black transition"
                  >
                    <div
                      onClick={() => navigate?.(targetUrl)}
                      className="h-48 overflow-hidden bg-[#E6A500]/15 cursor-pointer"
                    >
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
                        <h3
                          onClick={() => navigate?.(targetUrl)}
                          className="font-extrabold text-[20px] text-black leading-snug line-clamp-2 cursor-pointer hover:underline"
                        >
                          {title}
                        </h3>
                        <p className="text-[16px] text-black/80 mt-1 line-clamp-3 leading-relaxed">
                          {excerpt}
                        </p>
                      </div>
                      {navigate && (
                        <div className="pt-2">
                          <button
                            onClick={() => navigate(targetUrl)}
                            className="text-[15px] font-bold text-black inline-flex items-center gap-1 group-hover:translate-x-1 transition cursor-pointer"
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
            <div className="p-6 bg-white border border-gray-200 rounded-xl text-center space-y-2">
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

