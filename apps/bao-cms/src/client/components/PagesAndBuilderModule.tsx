import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  Eye,
  FileText,
  Layers,
  Globe,
  CheckCircle2,
  Clock,
  Loader2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  PAGE_BLOCK_TYPES,
  PUBLICATION_STATUSES,
  type LanguageCode,
  type PageBlock,
  type PublicationStatus,
} from '@bao/shared';
import { supabase } from '../supabase.js';
import { type SweetAlertOptions } from './SweetAlertModal.js';
import { stripHtmlForEditing, plainTextToFormattedHtml } from './ContentModules.js';

export function PagesAndBuilderModule({
  pages,
  media,
  staffId,
  canPublish,
  onRefresh,
  notify,
  showAlert,
}: {
  pages: any[];
  media: any[];
  staffId: string;
  canPublish: boolean;
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
  showAlert?: (opts: SweetAlertOptions) => void;
}) {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [pageKey, setPageKey] = useState('about-street-children');
  const [template, setTemplate] = useState<'home' | 'standard' | 'programme' | 'contact' | 'policy'>('standard');
  const [status, setStatus] = useState<PublicationStatus>('published');
  const [activeLang, setActiveLang] = useState<LanguageCode>('en');

  const [translations, setTranslations] = useState<
    Record<
      LanguageCode,
      {
        title: string;
        slug: string;
        subtitle: string;
        hero_tag: string;
        seo_title: string;
        seo_description: string;
        translation_status: PublicationStatus;
        blocks: PageBlock[];
      }
    >
  >({
    en: {
      title: '',
      slug: '',
      subtitle: '',
      hero_tag: '',
      seo_title: '',
      seo_description: '',
      translation_status: 'draft',
      blocks: [],
    },
    sw: {
      title: '',
      slug: '',
      subtitle: '',
      hero_tag: '',
      seo_title: '',
      seo_description: '',
      translation_status: 'draft',
      blocks: [],
    },
  });

  const [versions, setVersions] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const selectPage = async (page: any) => {
    setSelectedPageId(page.id);
    setPageKey(page.page_key);
    setTemplate(page.template || 'standard');
    setStatus(page.status);

    const { data: trs } = await supabase
      .from('page_translations')
      .select('*')
      .eq('page_id', page.id);

    const nextTr = {
      en: {
        title: '',
        slug: page.page_key,
        subtitle: '',
        hero_tag: '',
        seo_title: '',
        seo_description: '',
        translation_status: 'draft' as PublicationStatus,
        blocks: [] as PageBlock[],
      },
      sw: {
        title: '',
        slug: page.page_key,
        subtitle: '',
        hero_tag: '',
        seo_title: '',
        seo_description: '',
        translation_status: 'draft' as PublicationStatus,
        blocks: [] as PageBlock[],
      },
    };

    for (const row of trs || []) {
      const lang = row.language as LanguageCode;
      nextTr[lang] = {
        title: row.title || '',
        slug: row.slug || '',
        subtitle: row.subtitle || '',
        hero_tag: row.hero_tag || '',
        seo_title: row.seo_title || '',
        seo_description: row.seo_description || '',
        translation_status: row.translation_status || 'draft',
        blocks: Array.isArray(row.blocks) ? row.blocks : [],
      };
    }
    setTranslations(nextTr);

    const { data: vers } = await supabase
      .from('page_versions')
      .select('*')
      .eq('page_id', page.id)
      .order('created_at', { ascending: false })
      .limit(10);
    setVersions(vers || []);
  };

  const resetNewPage = () => {
    setSelectedPageId(null);
    setPageKey('');
    setTemplate('standard');
    setStatus('published');
    setVersions([]);
    setTranslations({
      en: {
        title: '',
        slug: '',
        subtitle: '',
        hero_tag: '',
        seo_title: '',
        seo_description: '',
        translation_status: 'published',
        blocks: [],
      },
      sw: {
        title: '',
        slug: '',
        subtitle: '',
        hero_tag: '',
        seo_title: '',
        seo_description: '',
        translation_status: 'published',
        blocks: [],
      },
    });
  };

  const currentTr = translations[activeLang];

  const updateCurrentTr = (patch: Partial<typeof currentTr>) => {
    setTranslations((prev) => ({
      ...prev,
      [activeLang]: {
        ...prev[activeLang],
        ...patch,
      },
    }));
  };

  const addBlock = (type: PageBlock['type']) => {
    const newBlock: PageBlock = {
      id: `blk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      data:
        type === 'heading'
          ? { text: 'Section Heading', subtitle: '', level: 'h2', align: 'left' }
          : type === 'rich_text'
          ? { html: '<p>Enter paragraph text here...</p>', text: 'Enter paragraph text here...' }
          : type === 'single_image'
          ? { image_url: media[0]?.public_url || '', caption: '', badge_text: '' }
          : type === 'image_and_text'
          ? {
              heading: 'Section Title',
              body: 'Detailed narrative content...',
              image_url: media[0]?.public_url || '',
              image_position: 'right',
              cta_label: 'Learn More',
              cta_url: '/contact',
            }
          : type === 'two_column_layout'
          ? {
              left_title: 'Our Vision',
              left_body: '',
              right_title: 'Our Mission',
              right_body: '',
            }
          : type === 'three_column_layout'
          ? {
              col1_title: 'Pillar 1',
              col1_body: '',
              col2_title: 'Pillar 2',
              col2_body: '',
              col3_title: 'Pillar 3',
              col3_body: '',
            }
          : type === 'video_embed'
          ? { youtube_id: 'FgXXMyMLF9k', title: 'Documentary Video' }
          : type === 'call_to_action'
          ? {
              heading: 'Join Us in Making a Difference',
              subtext: 'Partner with Babawatoto Organization to protect and empower children and youth.',
              primary_label: 'Partner With Us',
              primary_url: '/contact',
              style: 'charcoal',
            }
          : {},
    };

    updateCurrentTr({
      blocks: [...currentTr.blocks, newBlock],
    });
  };

  const updateBlockData = (blockId: string, patch: Record<string, any>) => {
    updateCurrentTr({
      blocks: currentTr.blocks.map((b) =>
        b.id === blockId ? { ...b, data: { ...b.data, ...patch } } : b
      ),
    });
  };

  const moveBlock = (idx: number, dir: -1 | 1) => {
    const next = [...currentTr.blocks];
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= next.length) return;
    const [item] = next.splice(idx, 1);
    next.splice(targetIdx, 0, item);
    updateCurrentTr({ blocks: next });
  };

  const removeBlock = (blockId: string) => {
    updateCurrentTr({
      blocks: currentTr.blocks.filter((b) => b.id !== blockId),
    });
  };

  const handleSavePage = async () => {
    if (!pageKey.trim() || !translations.en.title.trim()) {
      notify('Page key and English title are required.', true);
      showAlert?.({
        type: 'warning',
        title: 'Missing Required Information',
        message: 'Please provide both a Page Route Key and at least an English Page Title before saving.',
      });
      return;
    }

    const effectiveStatus = 'published';
    setSaving(true);
    showAlert?.({
      type: 'loading',
      title: 'Saving Page & Publishing...',
      message: `Writing "${translations.en.title.trim()}" to the database and publishing live...`,
    });

    try {
      const { data: savedPage, error: pageErr } = await supabase
        .from('pages')
        .upsert(
          {
            ...(selectedPageId ? { id: selectedPageId } : {}),
            page_key: pageKey.trim().toLowerCase(),
            template,
            status: effectiveStatus,
            published_at: new Date().toISOString(),
            updated_by: staffId,
          },
          { onConflict: 'page_key' }
        )
        .select()
        .single();

      if (pageErr || !savedPage) throw new Error(pageErr?.message || 'Failed to save page');

      for (const lang of ['en', 'sw'] as const) {
        const t = translations[lang];
        const effectiveTitle = t.title.trim() || translations.en.title.trim();
        const effectiveSlug = (t.slug || pageKey).trim().toLowerCase();
        const effectiveSubtitle = t.subtitle?.trim() || translations.en.subtitle?.trim() || null;
        const effectiveHeroTag = t.hero_tag?.trim() || translations.en.hero_tag?.trim() || null;
        const effectiveBlocks = t.blocks && t.blocks.length > 0 ? t.blocks : translations.en.blocks;

        const { error: tErr } = await supabase.from('page_translations').upsert(
          {
            page_id: savedPage.id,
            language: lang,
            title: effectiveTitle,
            slug: effectiveSlug,
            subtitle: effectiveSubtitle,
            hero_tag: effectiveHeroTag,
            blocks: effectiveBlocks,
            seo_title: t.seo_title?.trim() || effectiveTitle,
            seo_description: t.seo_description?.trim() || effectiveSubtitle || '',
            translation_status: 'published',
            updated_by: staffId,
          },
          { onConflict: 'page_id,language' }
        );
        if (tErr) throw tErr;

        await supabase.from('page_versions').insert({
          page_id: savedPage.id,
          language: lang,
          version_number: versions.length + 1,
          title: effectiveTitle,
          blocks_snapshot: effectiveBlocks,
          status_at_snapshot: 'published',
          change_note: `Saved and published live (${lang.toUpperCase()})`,
          created_by: staffId,
        });
      }

      
      // If Homepage is being saved, keep site_settings.hero_banners in full sync
      if (pageKey.trim().toLowerCase() === 'home') {
        try {
          const { data: curSetting } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'hero_banners')
            .maybeSingle();
          const existingBanners = curSetting?.value?.banners || [];
          const heroImg = existingBanners[0]?.image_url || '/media/public/images/organization/hero1.webp';
          const updatedHeroBanner = {
            id: existingBanners[0]?.id || 'banner-home-1',
            badge: translations.en.hero_tag?.trim() || 'Babawatoto Centre for Children & Youth',
            title: translations.en.title.trim(),
            subtitle: translations.en.subtitle?.trim() || '',
            image_url: heroImg,
            primary_cta_label: existingBanners[0]?.primary_cta_label || 'Explore Our Work',
            primary_cta_href: existingBanners[0]?.primary_cta_href === '/programmes' ? '/projects' : (existingBanners[0]?.primary_cta_href || '/projects'),
            secondary_cta_label: existingBanners[0]?.secondary_cta_label || 'Partner With Us',
            secondary_cta_href: existingBanners[0]?.secondary_cta_href || '/get-involved',
            badge_sw: translations.sw.hero_tag?.trim() || '',
            title_sw: translations.sw.title?.trim() || '',
            subtitle_sw: translations.sw.subtitle?.trim() || '',
          };
          const nextBanners = existingBanners.length > 0 ? [updatedHeroBanner, ...existingBanners.slice(1)] : [updatedHeroBanner];
          await supabase.from('site_settings').upsert({
            key: 'hero_banners',
            value: { banners: nextBanners },
            is_public: true,
          }, { onConflict: 'key' });
        } catch (syncErr) {
          console.warn('Hero banner sync note:', syncErr);
        }
      }

      // If Who We Are is being saved, keep site_settings.who_we_are_section in full sync
      if (pageKey.trim().toLowerCase() === 'who-we-are') {
        try {
          const { data: curWho } = await supabase.from('site_settings').select('value').eq('key', 'who_we_are_section').maybeSingle();
          const whoVal = curWho?.value || {};
          await supabase.from('site_settings').upsert({
            key: 'who_we_are_section',
            value: {
              ...whoVal,
              badge_en: translations.en.hero_tag?.trim() || whoVal.badge_en,
              title_en: translations.en.title?.trim() || whoVal.title_en,
              summary_en: translations.en.subtitle?.trim() || whoVal.summary_en,
              badge_sw: translations.sw.hero_tag?.trim() || whoVal.badge_sw,
              title_sw: translations.sw.title?.trim() || whoVal.title_sw,
              summary_sw: translations.sw.subtitle?.trim() || whoVal.summary_sw,
            },
            is_public: true,
          }, { onConflict: 'key' });
        } catch (wwaSyncErr) {
          console.warn('WWA sync note:', wwaSyncErr);
        }
      }

      notify('Page and blocks saved and published live.');
      await onRefresh();
      await selectPage(savedPage);

      const pageTargetUrl = pageKey.trim().toLowerCase() === 'home'
        ? 'http://localhost:3000/'
        : `http://localhost:3000/${pageKey.trim().toLowerCase()}`;

      showAlert?.({
        type: 'success',
        title: 'Page Saved & Published Live!',
        message: `Page "${translations.en.title.trim()}" has been saved in the database and is immediately live on the website!`,
        websiteUrl: pageTargetUrl,
        websiteLabel: 'View Page on Website ↗',
      });
    } catch (err: any) {
      notify(err?.message || 'Error saving page', true);
      showAlert?.({
        type: 'error',
        title: 'Could Not Save Page',
        message: err?.message || 'An unexpected error occurred while saving the page.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Row 1: Existing Pages Selector & Management (Dedicated Full-Width Row) */}
      <div className="w-full bg-white border border-[#E5E7E5] rounded-xl p-5 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7E5] pb-3">
          <div>
            <h3 className="font-bold text-base text-[#000000] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#E6A500]" /> Website Pages ({pages.length})
            </h3>
            <p className="text-xs text-[#555B57]">Click any page card to load its content, category badge, and blocks below.</p>
          </div>
          <button
            onClick={resetNewPage}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-[#E6A500] text-black hover:bg-[#E6A500]/85 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> + New Page
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-1">
          {pages.length === 0 && (
            <p className="col-span-full text-xs text-[#555B57] py-6 text-center border border-dashed border-[#E5E7E5] rounded">
              No custom pages created yet.
            </p>
          )}
          {pages.map((p) => {
            const isSelected = selectedPageId === p.id;
            const pTitle = (p.page_translations || []).find((t: any) => t.language === 'en')?.title || p.page_key;
            return (
              <button
                key={p.id}
                onClick={() => selectPage(p)}
                className={`text-left p-3.5 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'border-[#E6A500] bg-[#E6A500]/10 shadow-sm'
                    : 'border-[#E5E7E5] hover:border-[#E6A500]/50 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-sm text-[#000000] truncate">/{p.page_key}</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded shrink-0 ${
                      p.status === 'published'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-[#555B57] truncate font-medium">{pTitle}</p>
                <div className="text-[11px] text-[#555B57]/80">Template: <span className="font-mono text-black font-semibold">{p.template}</span></div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2: Page Metadata + Controlled 16-Block Page Builder (Dedicated Full-Width Row) */}
      <div className="w-full bg-white border border-[#E5E7E5] rounded-xl p-6 space-y-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E7E5] pb-4">
          <div>
            <h3 className="font-bold text-lg text-[#000000]">
              {selectedPageId ? `Editing Page: /${pageKey}` : 'Create Dynamic Page & Blocks'}
            </h3>
            <p className="text-xs text-[#555B57]">
              Configure page content, SEO metadata, and controlled page-builder blocks.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {pageKey && (
              <a
                href={pageKey === 'home' ? 'http://localhost:3000/' : `http://localhost:3000/${pageKey}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded bg-neutral-100 hover:bg-neutral-200 text-black font-semibold text-xs flex items-center gap-1.5 border border-neutral-300 transition"
              >
                <span>View on Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={handleSavePage}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded font-extrabold text-xs transition cursor-pointer shadow-sm ${
                saving
                  ? 'bg-neutral-400 text-white cursor-not-allowed opacity-75'
                  : 'bg-[#E6A500] text-black hover:bg-[#E6A500]/85'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-black" />
                  <span>Save Page & Publish</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Homepage Hero Notice */}
        {pageKey.trim().toLowerCase() === 'home' && (
          <div className="p-4 rounded-xl border border-[#E6A500]/40 bg-amber-50/50 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#E6A500] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-black">
                Looking to manage the Homepage Hero Banner (headline title, narrative description, background photo, and CTA buttons)?
              </div>
              <div className="text-xs text-[#555B57] mt-0.5">
                The dedicated <strong>Hero Section (Homepage)</strong> tab on the left sidebar provides direct photo upload and full carousel controls. Any changes saved here on the Homepage will also update the hero banner in real-time.
              </div>
            </div>
          </div>
        )}

        {/* Core Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#000000] mb-1">
              Page Route Key
            </label>
            <input
              type="text"
              value={pageKey}
              onChange={(e) => setPageKey(e.target.value)}
              placeholder="e.g. about-who-we-are"
              className="w-full border border-[#E5E7E5] rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#000000] mb-1">
              Page Template
            </label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as any)}
              className="w-full border border-[#E5E7E5] rounded px-3 py-2 text-sm bg-white"
            >
              <option value="standard">Standard Information Page</option>
              <option value="home">Homepage</option>
              <option value="project">Project Page</option>
              <option value="contact">Contact Page</option>
              <option value="policy">Policy / Safeguarding Document Page</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#000000] mb-1">
              Overall Page Workflow Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PublicationStatus)}
              className="w-full border border-[#E5E7E5] rounded px-3 py-2 text-sm bg-white"
            >
              {PUBLICATION_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-2 border-b border-[#E5E7E5] pb-2">
          <span className="text-xs font-bold text-[#000000] uppercase">Language:</span>
          {(['en', 'sw'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setActiveLang(l)}
              className={`px-3 py-1 rounded text-xs font-bold uppercase transition ${
                activeLang === l
                  ? 'bg-[#E6A500] text-black shadow-xs'
                  : 'bg-white border border-[#E5E7E5] text-[#555B57] hover:bg-[#F2F2F2]'
              }`}
            >
              {l === 'en' ? 'English (EN)' : 'Kiswahili (SW)'}
            </button>
          ))}
        </div>

        {/* Language-Specific Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FFFFFF] p-4 rounded border border-[#E5E7E5]">
          <div>
            <label className="block text-xs font-semibold text-[#000000] mb-1">
              Page Title ({activeLang.toUpperCase()}) *
            </label>
            <input
              type="text"
              value={currentTr.title}
              onChange={(e) =>
                updateCurrentTr({
                  title: e.target.value,
                  slug: currentTr.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                })
              }
              placeholder={activeLang === 'en' ? 'Who We Are' : 'Sisi ni Nani'}
              className="w-full border border-[#E5E7E5] bg-white rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#000000] mb-1">
              URL Slug ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={currentTr.slug}
              onChange={(e) => updateCurrentTr({ slug: e.target.value })}
              placeholder="who-we-are"
              className="w-full border border-[#E5E7E5] bg-white rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#000000] mb-1">
              Category Badge / Hero Tag ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={currentTr.hero_tag || ''}
              onChange={(e) => updateCurrentTr({ hero_tag: e.target.value })}
              placeholder="e.g. Child Rights & Protection"
              className="w-full border border-[#E5E7E5] bg-white rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#000000] mb-1">
              Hero Subtitle / Introductory Lead ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={currentTr.subtitle}
              onChange={(e) => updateCurrentTr({ subtitle: e.target.value })}
              className="w-full border border-[#E5E7E5] bg-white rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#000000] mb-1">
              SEO Meta Title ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={currentTr.seo_title}
              onChange={(e) => updateCurrentTr({ seo_title: e.target.value })}
              className="w-full border border-[#E5E7E5] bg-white rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#000000] mb-1">
              Translation Status ({activeLang.toUpperCase()})
            </label>
            <select
              value={currentTr.translation_status}
              onChange={(e) =>
                updateCurrentTr({ translation_status: e.target.value as PublicationStatus })
              }
              className="w-full border border-[#E5E7E5] bg-white rounded px-3 py-2 text-sm"
            >
              {PUBLICATION_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Controlled Page Builder Palette (16 Validated Block Types) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-sm text-[#000000] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#E6A500]" /> Controlled Page Builder Blocks (
              {currentTr.blocks.length})
            </h4>
            <span className="text-[11px] text-[#555B57]">
              Add, reorder, or remove structured content sections
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4 p-3 bg-[#FFFFFF] rounded border border-[#E5E7E5]">
            {PAGE_BLOCK_TYPES.map((bType) => (
              <button
                key={bType}
                type="button"
                onClick={() => addBlock(bType)}
                className="text-xs px-2.5 py-1 rounded bg-white border border-[#E5E7E5] hover:border-[#E6A500] text-[#000000] font-medium transition cursor-pointer"
              >
                + {bType.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {currentTr.blocks.map((blk, idx) => (
              <div
                key={blk.id}
                className="border border-[#E5E7E5] rounded p-4 bg-white space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[#E5E7E5] pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E6A500]">
                    Block #{idx + 1}: {blk.type.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveBlock(idx, -1)}
                      className="p-1 hover:bg-[#FFFFFF] rounded cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(idx, 1)}
                      className="p-1 hover:bg-[#FFFFFF] rounded cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(blk.id)}
                      className="p-1 hover:bg-red-50 text-red-600 rounded cursor-pointer"
                      title="Remove Block"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {blk.type === 'heading' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={blk.data.text || ''}
                      onChange={(e) => updateBlockData(blk.id, { text: e.target.value })}
                      placeholder="Section Heading Text"
                      className="border border-[#E5E7E5] rounded px-3 py-1.5 text-sm"
                    />
                    <input
                      type="text"
                      value={blk.data.subtitle || ''}
                      onChange={(e) => updateBlockData(blk.id, { subtitle: e.target.value })}
                      placeholder="Optional Uppercase Eyebrow / Subtitle"
                      className="border border-[#E5E7E5] rounded px-3 py-1.5 text-sm"
                    />
                  </div>
                )}

                {blk.type === 'rich_text' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-black">
                        Text / Narrative Paragraphs (Normal Text)
                      </label>
                      <span className="text-[11px] text-[#555B57]">Plain Text (Auto-styled on website)</span>
                    </div>
                    <textarea
                      rows={5}
                      value={stripHtmlForEditing(blk.data.text || blk.data.html || '')}
                      onChange={(e) =>
                        updateBlockData(blk.id, {
                          html: plainTextToFormattedHtml(e.target.value),
                          text: e.target.value,
                          body: e.target.value,
                        })
                      }
                      placeholder="Type paragraph text in normal language. Separate paragraphs with Enter. The website will apply full styling automatically..."
                      className="w-full border border-[#E5E7E5] rounded px-3 py-2 text-sm leading-relaxed"
                    />
                  </div>
                )}

                {blk.type === 'image_and_text' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={blk.data.heading || ''}
                      onChange={(e) => updateBlockData(blk.id, { heading: e.target.value })}
                      placeholder="Split Section Heading"
                      className="border border-[#E5E7E5] rounded px-3 py-1.5 text-sm"
                    />
                    <select
                      value={blk.data.image_url || ''}
                      onChange={(e) => updateBlockData(blk.id, { image_url: e.target.value })}
                      className="border border-[#E5E7E5] rounded px-3 py-1.5 text-sm bg-white"
                    >
                      <option value="">Select Image from Media Library...</option>
                      {media.map((m) => (
                        <option key={m.id} value={m.public_url}>
                          {m.title_en || m.original_filename}
                        </option>
                      ))}
                    </select>
                    <textarea
                      rows={3}
                      value={blk.data.body || ''}
                      onChange={(e) => updateBlockData(blk.id, { body: e.target.value })}
                      placeholder="Narrative text..."
                      className="md:col-span-2 border border-[#E5E7E5] rounded px-3 py-1.5 text-sm"
                    />
                  </div>
                )}

                {blk.type === 'single_image' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select
                      value={blk.data.image_url || ''}
                      onChange={(e) => updateBlockData(blk.id, { image_url: e.target.value })}
                      className="border border-[#E5E7E5] rounded px-3 py-1.5 text-sm bg-white"
                    >
                      <option value="">Select Image from Media Library...</option>
                      {media.map((m) => (
                        <option key={m.id} value={m.public_url}>
                          {m.title_en || m.original_filename}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={blk.data.caption || ''}
                      onChange={(e) => updateBlockData(blk.id, { caption: e.target.value })}
                      placeholder="Image Caption / Alt Context"
                      className="border border-[#E5E7E5] rounded px-3 py-1.5 text-sm"
                    />
                  </div>
                )}

                {blk.type === 'video_embed' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={blk.data.youtube_id || ''}
                      onChange={(e) => updateBlockData(blk.id, { youtube_id: e.target.value })}
                      placeholder="YouTube Video ID (e.g. FgXXMyMLF9k)"
                      className="border border-[#E5E7E5] rounded px-3 py-1.5 text-sm"
                    />
                    <input
                      type="text"
                      value={blk.data.title || ''}
                      onChange={(e) => updateBlockData(blk.id, { title: e.target.value })}
                      placeholder="Video Title"
                      className="border border-[#E5E7E5] rounded px-3 py-1.5 text-sm"
                    />
                  </div>
                )}

                {blk.type === 'call_to_action' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={blk.data.heading || ''}
                      onChange={(e) => updateBlockData(blk.id, { heading: e.target.value })}
                      placeholder="CTA Headline"
                      className="border border-[#E5E7E5] rounded px-3 py-1.5 text-sm"
                    />
                    <input
                      type="text"
                      value={blk.data.subtext || ''}
                      onChange={(e) => updateBlockData(blk.id, { subtext: e.target.value })}
                      placeholder="Supporting Description"
                      className="border border-[#E5E7E5] rounded px-3 py-1.5 text-sm"
                    />
                  </div>
                )}

                {blk.type === 'two_column_layout' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 p-3 bg-[#F4F5F4]/60 rounded-lg border border-[#E5E7E5]">
                      <label className="block text-xs font-bold text-black">Left Column Title</label>
                      <input
                        type="text"
                        value={blk.data.left_title || ''}
                        onChange={(e) => updateBlockData(blk.id, { left_title: e.target.value })}
                        placeholder="e.g. Our Vision"
                        className="w-full border border-[#E5E7E5] rounded px-3 py-1.5 text-sm bg-white"
                      />
                      <label className="block text-xs font-bold text-black">Left Column Text (Normal Text)</label>
                      <textarea
                        rows={4}
                        value={stripHtmlForEditing(blk.data.left_body || '')}
                        onChange={(e) =>
                          updateBlockData(blk.id, {
                            left_body: e.target.value,
                            left_body_html: plainTextToFormattedHtml(e.target.value),
                          })
                        }
                        placeholder="Type left column narrative in normal text..."
                        className="w-full border border-[#E5E7E5] rounded px-3 py-2 text-sm bg-white leading-relaxed"
                      />
                    </div>
                    <div className="space-y-2 p-3 bg-[#F4F5F4]/60 rounded-lg border border-[#E5E7E5]">
                      <label className="block text-xs font-bold text-black">Right Column Title</label>
                      <input
                        type="text"
                        value={blk.data.right_title || ''}
                        onChange={(e) => updateBlockData(blk.id, { right_title: e.target.value })}
                        placeholder="e.g. Our Mission"
                        className="w-full border border-[#E5E7E5] rounded px-3 py-1.5 text-sm bg-white"
                      />
                      <label className="block text-xs font-bold text-black">Right Column Text (Normal Text)</label>
                      <textarea
                        rows={4}
                        value={stripHtmlForEditing(blk.data.right_body || '')}
                        onChange={(e) =>
                          updateBlockData(blk.id, {
                            right_body: e.target.value,
                            right_body_html: plainTextToFormattedHtml(e.target.value),
                          })
                        }
                        placeholder="Type right column narrative in normal text..."
                        className="w-full border border-[#E5E7E5] rounded px-3 py-2 text-sm bg-white leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {blk.type === 'three_column_layout' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[1, 2, 3].map((colNum) => {
                      const titleKey = `col${colNum}_title`;
                      const bodyKey = `col${colNum}_body`;
                      return (
                        <div key={colNum} className="space-y-2 p-3 bg-[#F4F5F4]/60 rounded-lg border border-[#E5E7E5]">
                          <label className="block text-xs font-bold text-black">Column {colNum} Title</label>
                          <input
                            type="text"
                            value={blk.data[titleKey] || ''}
                            onChange={(e) => updateBlockData(blk.id, { [titleKey]: e.target.value })}
                            placeholder={`Column ${colNum} Title`}
                            className="w-full border border-[#E5E7E5] rounded px-3 py-1.5 text-sm bg-white"
                          />
                          <label className="block text-xs font-bold text-black">Column {colNum} Text (Normal Text)</label>
                          <textarea
                            rows={3}
                            value={stripHtmlForEditing(blk.data[bodyKey] || '')}
                            onChange={(e) =>
                              updateBlockData(blk.id, {
                                [bodyKey]: e.target.value,
                                [`${bodyKey}_html`]: plainTextToFormattedHtml(e.target.value),
                              })
                            }
                            placeholder="Normal text..."
                            className="w-full border border-[#E5E7E5] rounded px-3 py-1.5 text-sm bg-white leading-relaxed"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {[
                  'statistics',
                  'project_cards',
                  'programme_cards',
                  'partner_logos',
                  'downloadable_documents',
                  'image_gallery',
                  'divider',
                  'spacer',
                ].includes(blk.type) && (
                  <p className="text-xs text-[#555B57]">
                    Dynamic database-connected block (<code>{blk.type}</code>) — automatically renders live published records on the public website.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#E5E7E5]">
          <div className="text-xs text-[#555B57]">
            {versions.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {versions.length} saved version snapshots
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={handleSavePage}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded font-extrabold text-sm transition cursor-pointer shadow-md ${
              saving
                ? 'bg-neutral-400 text-white cursor-not-allowed opacity-75'
                : 'bg-[#E6A500] text-black hover:bg-[#E6A500]/85'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Saving Page & Publishing...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-black" />
                <span>Save Page & Publish Live</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

