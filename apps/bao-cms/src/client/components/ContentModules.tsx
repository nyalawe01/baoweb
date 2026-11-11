import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  Save,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Edit3,
  Briefcase,
  FolderKanban,
  Newspaper,
  Calendar,
  HeartHandshake,
  Users,
  Upload,
  Image as ImageIcon,
  Loader2,
  Check,
  X,
  FileText,
  File,
  Link as LinkIcon,
  ExternalLink,
  Download,
} from 'lucide-react';
import { PUBLICATION_STATUSES, type LanguageCode, type PublicationStatus } from '@bao/shared';
import { supabase } from '../supabase.js';
import { broadcastLivePublish } from '../lib/liveSync.js';
import { type SweetAlertOptions } from './SweetAlertModal.js';
export function stripHtmlForEditing(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function plainTextToFormattedHtml(text: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  if (!trimmed) return '';
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;
  const paragraphs = trimmed
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) return '';
  return paragraphs
    .map((p) => `<p>${p.replace(/\n/g, '<br />')}</p>`)
    .join('\n');
}


export function ProgrammesModule({
  programmes,
  media,
  canPublish,
  onRefresh,
  notify,
  showAlert,
}: {
  programmes: any[];
  media: any[];
  canPublish: boolean;
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
  showAlert?: (opts: SweetAlertOptions) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lang, setLang] = useState<LanguageCode>('en');
  const [categoryKey, setCategoryKey] = useState('child-protection');
  const [iconName, setIconName] = useState('Shield');
  const [featuredImageId, setFeaturedImageId] = useState<string>('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isFeatured, setIsFeatured] = useState(true);
  const [status, setStatus] = useState<PublicationStatus>('published');
  const [saving, setSaving] = useState(false);
  const [translations, setTranslations] = useState({
    en: {
      title: '',
      slug: '',
      summary: '',
      overview_html: '',
      objectives: '',
      key_focus_areas: '',
      target_groups: '',
      geographic_areas: 'Dar es Salaam, Tanzania',
      impact_summary: '',
      showcase_video_ids: '',
      seo_title: '',
      seo_description: '',
    },
    sw: {
      title: '',
      slug: '',
      summary: '',
      overview_html: '',
      objectives: '',
      key_focus_areas: '',
      target_groups: '',
      geographic_areas: 'Dar es Salaam, Tanzania',
      impact_summary: '',
      showcase_video_ids: '',
      seo_title: '',
      seo_description: '',
    },
  });

  const selectProgramme = (prog: any) => {
    setEditingId(prog.id);
    setCategoryKey(prog.category_key || 'child-protection');
    setIconName(prog.icon_name || 'Shield');
    setFeaturedImageId(prog.featured_image_id || '');
    setDisplayOrder(prog.display_order || 1);
    setIsFeatured(Boolean(prog.is_featured));
    setStatus(prog.status || 'draft');
    const enT = (prog.programme_translations || []).find((t: any) => t.language === 'en') || {};
    const swT = (prog.programme_translations || []).find((t: any) => t.language === 'sw') || {};
    setTranslations({
      en: {
        title: enT.title || '',
        slug: enT.slug || '',
        summary: enT.summary || '',
        overview_html: stripHtmlForEditing(enT.overview_html || enT.full_description || ''),
        objectives: (enT.objectives || []).join('\n'),
        key_focus_areas: (enT.key_focus_areas || []).join('\n'),
        target_groups: enT.target_groups || '',
        geographic_areas: enT.geographic_areas || 'Dar es Salaam, Tanzania',
        impact_summary: enT.impact_summary || '',
        showcase_video_ids: (enT.showcase_video_ids || []).join(', '),
        seo_title: enT.seo_title || '',
        seo_description: enT.seo_description || '',
      },
      sw: {
        title: swT.title || '',
        slug: swT.slug || '',
        summary: swT.summary || '',
        overview_html: stripHtmlForEditing(swT.overview_html || swT.full_description || ''),
        objectives: (swT.objectives || []).join('\n'),
        key_focus_areas: (swT.key_focus_areas || []).join('\n'),
        target_groups: swT.target_groups || '',
        geographic_areas: swT.geographic_areas || 'Dar es Salaam, Tanzania',
        impact_summary: swT.impact_summary || '',
        showcase_video_ids: (swT.showcase_video_ids || []).join(', '),
        seo_title: swT.seo_title || '',
        seo_description: swT.seo_description || '',
      },
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setCategoryKey('child-protection');
    setIconName('Shield');
    setFeaturedImageId('');
    setDisplayOrder(programmes.length + 1);
    setIsFeatured(true);
    setStatus('published');
    setTranslations({
      en: {
        title: '',
        slug: '',
        summary: '',
        overview_html: '',
        objectives: '',
        key_focus_areas: '',
        target_groups: '',
        geographic_areas: 'Dar es Salaam, Tanzania',
        impact_summary: '',
        showcase_video_ids: '',
        seo_title: '',
        seo_description: '',
      },
      sw: {
        title: '',
        slug: '',
        summary: '',
        overview_html: '',
        objectives: '',
        key_focus_areas: '',
        target_groups: '',
        geographic_areas: 'Dar es Salaam, Tanzania',
        impact_summary: '',
        showcase_video_ids: '',
        seo_title: '',
        seo_description: '',
      },
    });
  };

  const handleSave = async () => {
    if (!translations.en.title || !translations.en.slug) {
      notify('English title and slug are required.', true);
      showAlert?.({
        type: 'warning',
        title: 'Title & Slug Required',
        message: 'Please provide both English Programme Title and Slug before saving.',
      });
      return;
    }
    const finalStatus = status === 'published' && !canPublish ? 'pending_review' : (status || 'published');
    setSaving(true);
    showAlert?.({
      type: 'loading',
      title: 'Saving Programme to Database...',
      message: 'Writing programme records to Supabase and syncing live website data...',
    });
    try {
      let progId = editingId;
      const codeKey = `BAO-PRG-${(categoryKey || 'core').toUpperCase().replace(/[^A-Z0-9]/g, '-')}`;
      const progPayload = {
        code: codeKey,
        category_tag: categoryKey || 'Core Programme',
        icon_name: iconName || 'Briefcase',
        featured_media_id: featuredImageId || null,
        display_order: displayOrder,
        is_featured: isFeatured,
        status: finalStatus,
        published_at: finalStatus === 'published' ? new Date().toISOString() : null,
      };

      if (!progId) {
        const { data, error } = await supabase
          .from('programmes')
          .insert(progPayload)
          .select('id')
          .single();
        if (error) throw error;
        progId = data.id;
      } else {
        const { error } = await supabase
          .from('programmes')
          .update(progPayload)
          .eq('id', progId);
        if (error) throw error;
      }

      for (const l of ['en', 'sw'] as LanguageCode[]) {
        const t = translations[l];
        // If Swahili title is not provided, fallback to English to satisfy translations constraint
        const effectiveTitle = t.title || (l === 'sw' ? translations.en.title : '');
        const effectiveSlug = t.slug || (l === 'sw' ? translations.en.slug : '');
        if (!effectiveTitle || !effectiveSlug) continue;

        const { error: tErr } = await supabase.from('programme_translations').upsert(
          {
            programme_id: progId,
            language: l,
            title: effectiveTitle,
            slug: effectiveSlug,
            short_description: t.summary || translations.en.summary || effectiveTitle,
            full_description: plainTextToFormattedHtml(t.overview_html || translations.en.overview_html || t.summary || effectiveTitle),
            objectives: (t.objectives || translations.en.objectives || '')
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean),
            key_focus_areas: (t.key_focus_areas || translations.en.key_focus_areas || '')
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean),
            target_beneficiaries: t.target_groups || translations.en.target_groups || 'Vulnerable children and youth in Tanzania',
            geographic_coverage: t.geographic_areas || 'Dar es Salaam, Tanzania',
            primary_outcomes: t.impact_summary || '',
            seo_title: t.seo_title || effectiveTitle,
            seo_description: t.seo_description || t.summary || effectiveTitle,
            translation_status: finalStatus,
          },
          { onConflict: 'programme_id,language' }
        );
        if (tErr) throw tErr;
      }

      notify('Programme saved successfully.');
      broadcastLivePublish({ module: 'programmes' });
      await onRefresh();
      showAlert?.({
        type: 'success',
        title: 'Programme Saved Successfully!',
        message: `Programme "${translations.en.title}" has been saved to the Supabase database and is now live on the public website.`,
        details: `Code: ${codeKey} · Status: ${finalStatus}`,
        websiteUrl: `http://localhost:3000/programmes/${translations.en.slug}`,
        websiteLabel: 'View Programme on Website ↗',
      });
      resetForm();
    } catch (err: any) {
      notify(err.message || 'Failed to save programme', true);
      showAlert?.({
        type: 'error',
        title: 'Could Not Save Programme',
        message: err.message || 'An error occurred while saving to the database.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this programme?')) return;
    const { error } = await supabase.from('programmes').delete().eq('id', id);
    if (error) notify(error.message, true);
    else {
      notify('Programme deleted.');
      broadcastLivePublish({ module: 'programmes' });
      await onRefresh();
    }
  };

  const cur = translations[lang];

  return (
    <div className="space-y-6">
      {/* Row 1: Core Programmes Selector (Full Width) */}
      <div className="w-full bg-white rounded-xl border border-[#E5E7E5] p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E5E7E5] pb-3">
          <div>
            <h3 className="font-bold text-base text-[#000000] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#E6A500]" /> Core Programmes ({programmes.length})
            </h3>
            <p className="text-xs text-[#555B57]">Click any programme to edit its details below, or click "+ New Programme" to create one.</p>
          </div>
          <button
            onClick={resetForm}
            className="text-xs px-4 py-2 rounded-lg bg-[#E6A500] text-black font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> + New Programme
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[320px] overflow-y-auto pr-1">
          {programmes.map((p) => {
            const enT = (p.programme_translations || []).find((t: any) => t.language === 'en');
            return (
              <div
                key={p.id}
                onClick={() => selectProgramme(p)}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  editingId === p.id
                    ? 'border-[#E6A500] bg-[#E6A500]/5'
                    : 'border-[#E5E7E5] hover:bg-[#FFFFFF]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[#000000]">
                    {enT?.title || p.category_key}
                  </span>
                  <span className="text-[11px] uppercase font-semibold px-2 py-0.5 rounded bg-[#FFFFFF] text-[#555B57]">
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-[#555B57] mt-1 line-clamp-2">{enT?.summary}</p>
                <div className="flex items-center justify-between mt-2 text-[11px] text-[#555B57]">
                  <span>Key: {p.category_key}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(p.id);
                    }}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
          {programmes.length === 0 && (
            <p className="text-xs text-[#555B57] py-8 text-center">
              No programmes yet. Create one or import verified BAO programmes from the Dashboard.
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Programme Editor Form (Full Width) */}
      <div className="w-full bg-white rounded-xl border border-[#E5E7E5] p-6 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7E5] pb-4">
          <h3 className="font-bold text-lg text-[#000000]">
            {editingId ? 'Edit Programme' : 'Create Programme'}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-[#E6A500] hover:bg-[#d49700] disabled:opacity-50 text-black text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-xs transition"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Programme...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Programme
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Category Key</label>
            <select
              value={categoryKey}
              onChange={(e) => setCategoryKey(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
            >
              <option value="child-protection">child-protection</option>
              <option value="education">education</option>
              <option value="heart-and-creative-arts">heart-and-creative-arts</option>
              <option value="youth-empowerment">youth-empowerment</option>
              <option value="behaviour-change-communication">behaviour-change-communication</option>
              <option value="advocacy-and-consultancy">advocacy-and-consultancy</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Lucide Icon</label>
            <input
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              placeholder="Shield, GraduationCap, Drama..."
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Featured Image</label>
            <select
              value={featuredImageId}
              onChange={(e) => setFeaturedImageId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
            >
              <option value="">-- None --</option>
              {media
                .filter((m) => m.mime_type?.startsWith('image/'))
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title || m.title_en || m.original_filename}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Publication Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PublicationStatus)}
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
            >
              {PUBLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">
              Programme Title ({lang.toUpperCase()})
            </label>
            <input
              value={cur.title}
              onChange={(e) => {
                const title = e.target.value;
                const slug =
                  cur.slug ||
                  title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
                setTranslations((prev) => ({
                  ...prev,
                  [lang]: { ...prev[lang], title, slug },
                }));
              }}
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              URL Slug ({lang.toUpperCase()})
            </label>
            <input
              value={cur.slug}
              onChange={(e) =>
                setTranslations((prev) => ({
                  ...prev,
                  [lang]: { ...prev[lang], slug: e.target.value },
                }))
              }
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">
            Short Summary ({lang.toUpperCase()})
          </label>
          <textarea
            rows={2}
            value={cur.summary}
            onChange={(e) =>
              setTranslations((prev) => ({
                ...prev,
                [lang]: { ...prev[lang], summary: e.target.value },
              }))
            }
            className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-black">
              Programme Overview & Details ({lang.toUpperCase()})
            </label>
            <span className="text-[11px] text-[#555B57]">Plain Text (Auto-styled paragraphs)</span>
          </div>
          <textarea
            rows={5}
            value={cur.overview_html}
            onChange={(e) =>
              setTranslations((prev) => ({
                ...prev,
                [lang]: { ...prev[lang], overview_html: e.target.value },
              }))
            }
            placeholder="Type the programme overview here in normal language. Paragraphs separated by blank lines will be styled automatically..."
            className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">
              Objectives (1 per line, {lang.toUpperCase()})
            </label>
            <textarea
              rows={4}
              value={cur.objectives}
              onChange={(e) =>
                setTranslations((prev) => ({
                  ...prev,
                  [lang]: { ...prev[lang], objectives: e.target.value },
                }))
              }
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Key Focus Areas (1 per line, {lang.toUpperCase()})
            </label>
            <textarea
              rows={4}
              value={cur.key_focus_areas}
              onChange={(e) =>
                setTranslations((prev) => ({
                  ...prev,
                  [lang]: { ...prev[lang], key_focus_areas: e.target.value },
                }))
              }
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">
              Impact Summary ({lang.toUpperCase()})
            </label>
            <input
              value={cur.impact_summary}
              onChange={(e) =>
                setTranslations((prev) => ({
                  ...prev,
                  [lang]: { ...prev[lang], impact_summary: e.target.value },
                }))
              }
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              YouTube Video IDs (comma-separated)
            </label>
            <input
              value={cur.showcase_video_ids}
              onChange={(e) =>
                setTranslations((prev) => ({
                  ...prev,
                  [lang]: { ...prev[lang], showcase_video_ids: e.target.value },
                }))
              }
              placeholder="_k00dd-yyxU, eQ1s_i-w5rA"
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectsModule({
  projects,
  programmes,
  media,
  canPublish,
  onRefresh,
  notify,
  showAlert,
}: {
  projects: any[];
  programmes: any[];
  media: any[];
  canPublish: boolean;
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
  showAlert?: (opts: SweetAlertOptions) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lang, setLang] = useState<LanguageCode>('en');
  const [programmeId, setProgrammeId] = useState<string>('');
  const [featuredImageId, setFeaturedImageId] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [projectStatus, setProjectStatus] = useState<'active' | 'completed' | 'upcoming'>('active');
  const [status, setStatus] = useState<PublicationStatus>('published');
  const [isFeatured, setIsFeatured] = useState<boolean>(true);
  const [location, setLocation] = useState('Dar es Salaam, Tanzania');
  const [implementingPartners, setImplementingPartners] = useState('');
  const [supportingDonors, setSupportingDonors] = useState('');
  const [translations, setTranslations] = useState({
    en: {
      title: '',
      slug: '',
      summary: '',
      background_html: '',
      objectives: '',
      activities_html: '',
      beneficiary_summary: '',
      outcomes_html: '',
    },
    sw: {
      title: '',
      slug: '',
      summary: '',
      background_html: '',
      objectives: '',
      activities_html: '',
      beneficiary_summary: '',
      outcomes_html: '',
    },
  });

  const selectProject = (proj: any) => {
    setEditingId(proj.id);
    setProgrammeId(proj.programme_id || '');
    setFeaturedImageId(proj.featured_image_id || proj.featured_media_id || '');
    setProjectStatus(proj.project_status || 'active');
    setStatus(proj.status || 'draft');
    setIsFeatured(Boolean(proj.is_featured));
    setLocation(proj.location || 'Dar es Salaam, Tanzania');
    setImplementingPartners((proj.implementing_partners || []).join(', '));
    setSupportingDonors((proj.supporting_donors || proj.donors || []).join(', '));
    const enT = (proj.project_translations || []).find((t: any) => t.language === 'en') || {};
    const swT = (proj.project_translations || []).find((t: any) => t.language === 'sw') || {};
    setTranslations({
      en: {
        title: enT.title || '',
        slug: enT.slug || '',
        summary: enT.summary || enT.short_description || '',
        background_html: stripHtmlForEditing(enT.background_html || enT.full_description || ''),
        objectives: (enT.objectives || []).join('\n'),
        activities_html: stripHtmlForEditing(enT.activities_html || ''),
        beneficiary_summary: enT.beneficiary_summary || enT.public_beneficiary_summary || '',
        outcomes_html: stripHtmlForEditing(enT.outcomes_html || ''),
      },
      sw: {
        title: swT.title || '',
        slug: swT.slug || '',
        summary: swT.summary || swT.short_description || '',
        background_html: stripHtmlForEditing(swT.background_html || swT.full_description || ''),
        objectives: (swT.objectives || []).join('\n'),
        activities_html: stripHtmlForEditing(swT.activities_html || ''),
        beneficiary_summary: swT.beneficiary_summary || swT.public_beneficiary_summary || '',
        outcomes_html: stripHtmlForEditing(swT.outcomes_html || ''),
      },
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setProgrammeId('');
    setFeaturedImageId('');
    setProjectStatus('active');
    setStatus('published');
    setIsFeatured(true);
    setLocation('Dar es Salaam, Tanzania');
    setImplementingPartners('');
    setSupportingDonors('');
    setTranslations({
      en: {
        title: '',
        slug: '',
        summary: '',
        background_html: '',
        objectives: '',
        activities_html: '',
        beneficiary_summary: '',
        outcomes_html: '',
      },
      sw: {
        title: '',
        slug: '',
        summary: '',
        background_html: '',
        objectives: '',
        activities_html: '',
        beneficiary_summary: '',
        outcomes_html: '',
      },
    });
  };

  const handleTogglePriority = async (e: React.MouseEvent, proj: any) => {
    e.stopPropagation();
    const nextPriority = !proj.is_featured;
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_featured: nextPriority })
        .eq('id', proj.id);
      if (error) throw error;
      if (editingId === proj.id) {
        setIsFeatured(nextPriority);
      }
      notify(
        nextPriority
          ? 'Marked as Priority Project (shown in Homepage Top 3 Flip Cards).'
          : 'Removed from Priority Projects.'
      );
      await onRefresh();
    } catch (err: any) {
      notify(err.message || 'Failed to update priority status', true);
    }
  };

  const handleDirectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'projects');
      formData.append('visibility', 'public');
      formData.append('title_en', translations.en.title || file.name);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch('/api/v1/media/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Failed to upload project image');
      const newMedia = resJson.media;
      setFeaturedImageId(newMedia.id);
      notify(`Dedicated project image "${file.name}" uploaded successfully!`);
      await onRefresh();
    } catch (err: any) {
      notify(err.message || 'Image upload failed', true);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!translations.en.title || !translations.en.slug) {
      notify('English project title and slug are required.', true);
      showAlert?.({
        type: 'warning',
        title: 'Title & Slug Required',
        message: 'Please provide both English Project Title and URL Slug before saving.',
      });
      return;
    }
    const finalStatus = status === 'published' && !canPublish ? 'pending_review' : (status || 'published');
    setSaving(true);
    showAlert?.({
      type: 'loading',
      title: 'Saving Project to Database...',
      message: 'Writing project details, dedicated image and translations to Supabase database...',
    });
    try {
      let projId = editingId;
      const parsedDonors = supportingDonors
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const projCode = `BAO-PRJ-${(translations.en.slug || 'PROJECT').toUpperCase().replace(/[^A-Z0-9]/g, '-')}`;
      const payload = {
        project_code: projCode,
        programme_id: programmeId || null,
        featured_image_id: featuredImageId || null,
        featured_media_id: featuredImageId || null,
        project_status: projectStatus,
        status: finalStatus,
        is_featured: isFeatured,
        location,
        implementing_partners: implementingPartners
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        supporting_donors: parsedDonors,
        donors: parsedDonors,
        published_at: finalStatus === 'published' ? new Date().toISOString() : null,
      };
      if (!projId) {
        const { data, error } = await supabase
          .from('projects')
          .insert(payload)
          .select('id')
          .single();
        if (error) throw error;
        projId = data.id;
      } else {
        const { error } = await supabase.from('projects').update(payload).eq('id', projId);
        if (error) throw error;
      }

      for (const l of ['en', 'sw'] as LanguageCode[]) {
        const t = translations[l];
        const effectiveTitle = t.title || (l === 'sw' ? translations.en.title : '');
        const effectiveSlug = t.slug || (l === 'sw' ? translations.en.slug : '');
        if (!effectiveTitle || !effectiveSlug) continue;

        const effectiveShortDesc = t.summary || translations.en.summary || effectiveTitle || 'Babawatoto Community Project';
        const effectiveFullDesc = plainTextToFormattedHtml(t.background_html || translations.en.background_html || effectiveShortDesc);

        const { error: tErr } = await supabase.from('project_translations').upsert(
          {
            project_id: projId,
            language: l,
            title: effectiveTitle,
            slug: effectiveSlug,
            summary: effectiveShortDesc,
            short_description: effectiveShortDesc,
            background_html: effectiveFullDesc,
            full_description: effectiveFullDesc,
            objectives: (t.objectives || translations.en.objectives || '')
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean),
            activities_html: plainTextToFormattedHtml(t.activities_html || translations.en.activities_html || ''),
            beneficiary_summary: t.beneficiary_summary || translations.en.beneficiary_summary || 'Out-of-school children, vulnerable youth, and community families',
            public_beneficiary_summary: t.beneficiary_summary || translations.en.beneficiary_summary || 'Out-of-school children, vulnerable youth, and community families',
            location,
            outcomes_html: plainTextToFormattedHtml(t.outcomes_html || translations.en.outcomes_html || ''),
            seo_title: t.title || effectiveTitle,
            seo_description: t.summary || effectiveShortDesc,
            translation_status: 'published',
          },
          { onConflict: 'project_id,language' }
        );
        if (tErr) throw tErr;
      }

      notify('Project saved successfully.');
      broadcastLivePublish({ module: 'projects' });
      await onRefresh();
      showAlert?.({
        type: 'success',
        title: 'Project Saved Successfully!',
        message: `Project "${translations.en.title}" has been saved to the database and is now live on the website!`,
        details: `Project Code: ${projCode} · Status: ${finalStatus}`,
        websiteUrl: `http://localhost:3000/projects/${translations.en.slug}`,
        websiteLabel: 'View Project Live on Website ↗',
      });
      resetForm();
    } catch (err: any) {
      notify(err.message || 'Failed to save project', true);
      showAlert?.({
        type: 'error',
        title: 'Project Save Failed',
        message: err.message || 'An error occurred while saving the project to the database.',
      });
    } finally {
      setSaving(false);
    }
  };

  const cur = translations[lang];
  const priorityCount = projects.filter((p) => p.is_featured).length;

  return (
    <div className="space-y-6">
      {/* Row 1: Recorded Projects (Full Width) */}
      <div className="w-full bg-white rounded-xl border border-[#E6A500] p-5 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6A500]/30 pb-3">
          <div>
            <h3 className="font-bold text-base text-[#000000] flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#E6A500]" /> Projects ({projects.length})
            </h3>
            <p className="text-xs text-[#555B57]">Click any project to load into editor below. Star up to 3 projects to display on the Homepage.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-[#E6A500]/15 border border-[#E6A500] text-xs font-bold text-black flex items-center gap-2 rounded-lg">
              <span>Homepage Priority:</span>
              <span className="px-2 py-0.5 bg-[#E6A500] text-black font-extrabold rounded">
                {priorityCount} / 3 Selected
              </span>
            </div>
            <button
              onClick={resetForm}
              className="text-xs px-4 py-2 rounded-lg bg-[#E6A500] text-black font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> + New Project
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[320px] overflow-y-auto pr-1">
          {projects.map((p) => {
            const enT = (p.project_translations || []).find((t: any) => t.language === 'en');
            return (
              <div
                key={p.id}
                onClick={() => selectProject(p)}
                className={`p-3 rounded-lg border cursor-pointer transition space-y-2 ${
                  editingId === p.id
                    ? 'border-2 border-[#E6A500] bg-[#E6A500]/10'
                    : 'border-[#E6A500]/40 hover:border-[#E6A500] bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-[#000000]">
                    {enT?.title || 'Untitled Project'}
                  </span>
                  <span className="text-[11px] uppercase font-bold px-2 py-0.5 rounded bg-[#E6A500]/20 text-black">
                    {p.project_status} · {p.status}
                  </span>
                </div>
                <p className="text-xs text-black/80 line-clamp-2">
                  {enT?.summary || enT?.short_description}
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => handleTogglePriority(e, p)}
                    className={`text-xs font-extrabold px-2.5 py-1 border transition cursor-pointer ${
                      p.is_featured
                        ? 'bg-[#E6A500] border-[#E6A500] text-black'
                        : 'bg-white border-[#E6A500] text-black hover:bg-[#E6A500]/20'
                    }`}
                  >
                    {p.is_featured ? '★ Priority Project (Top 3)' : '☆ Set as Priority Project'}
                  </button>
                </div>
              </div>
            );
          })}
          {projects.length === 0 && (
            <p className="text-xs text-black/75 py-8 text-center">
              No projects recorded yet. Click "+ New" or use "System & Seed" to load the 3 verified
              priority projects.
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Project Editor Form (Full Width) */}
      <div className="w-full bg-white rounded-xl border border-[#E6A500] p-6 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6A500]/40 pb-4">
          <h3 className="font-bold text-lg text-[#000000]">
            {editingId ? 'Edit Project' : 'Create Project'}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-[#E6A500] hover:bg-[#d49700] disabled:opacity-50 text-black text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-xs transition"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Project...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Project
                </>
              )}
            </button>
          </div>
        </div>

        {/* Priority Project Toggle Banner */}
        <div className="p-4 bg-[#E6A500]/15 border-2 border-[#E6A500] flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-extrabold text-sm text-black">
              ★ Priority Project (Show in Homepage 3 Hover-Flip Cards)
            </div>
            <div className="text-xs text-black/80">
              Enable this to feature this project as one of the 3 flipping priority project cards on
              the public homepage right below the About Us summary.
            </div>
          </div>
          <label className="inline-flex items-center gap-2.5 px-4 py-2 bg-white border-2 border-[#E6A500] font-extrabold text-sm text-black cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 accent-[#E6A500]"
            />
            <span>{isFeatured ? 'Priority Project: YES' : 'Priority Project: NO'}</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Project Lifecycle</label>
            <select
              value={projectStatus}
              onChange={(e) => setProjectStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
            >
              <option value="active">active</option>
              <option value="completed">completed</option>
              <option value="upcoming">upcoming</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Featured Image</label>
            <select
              value={featuredImageId}
              onChange={(e) => setFeaturedImageId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
            >
              <option value="">-- None --</option>
              {media
                .filter((m) => m.mime_type?.startsWith('image/'))
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title || m.title_en || m.original_filename}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Publish Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PublicationStatus)}
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
            >
              {PUBLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dedicated Project Image Card */}
        {(() => {
          const selectedMedia = media.find((m) => m.id === featuredImageId);
          const previewUrl = selectedMedia?.public_url || (selectedMedia?.storage_path ? `/media/${selectedMedia.storage_path}` : '');
          return (
            <div className="p-4 rounded-xl border-2 border-[#E6A500] bg-amber-50/40 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-extrabold text-sm text-black flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#E6A500]" />
                    Dedicated Project Image (Upload Unique Photo)
                  </div>
                  <div className="text-xs text-black/70">
                    Upload a dedicated, high-resolution photo for this project. Images must not be shared between different projects.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleDirectImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-3.5 py-2 rounded-lg bg-[#E6A500] hover:bg-[#d49700] text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingImage ? 'Uploading...' : 'Upload Dedicated Image'}
                  </button>
                  {featuredImageId && (
                    <button
                      type="button"
                      onClick={() => setFeaturedImageId('')}
                      className="px-2.5 py-2 rounded-lg bg-white border border-gray-300 text-xs text-red-600 hover:bg-red-50 font-semibold cursor-pointer"
                    >
                      Clear Image
                    </button>
                  )}
                </div>
              </div>

              {previewUrl ? (
                <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                  <img
                    src={previewUrl}
                    alt="Project dedicated preview"
                    className="w-24 h-20 object-cover rounded-lg border border-gray-300 shadow-xs"
                  />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-black">{selectedMedia?.title || selectedMedia?.original_filename || 'Uploaded Dedicated Image'}</p>
                    <p className="text-gray-500 font-mono text-[11px]">ID: {featuredImageId}</p>
                    <p className="text-emerald-700 font-semibold">✓ Unique dedicated image attached to this project</p>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-amber-900 bg-amber-100/60 p-2.5 rounded-lg border border-amber-300 flex items-center gap-2">
                  <span>ℹ No dedicated image assigned yet. Click <strong>"Upload Dedicated Image"</strong> to upload a unique photo directly from your device.</span>
                </div>
              )}
            </div>
          );
        })()}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Title ({lang.toUpperCase()})</label>
            <input
              value={cur.title}
              onChange={(e) => {
                const title = e.target.value;
                const slug =
                  cur.slug ||
                  title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
                setTranslations((prev) => ({
                  ...prev,
                  [lang]: { ...prev[lang], title, slug },
                }));
              }}
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Slug ({lang.toUpperCase()})</label>
            <input
              value={cur.slug}
              onChange={(e) =>
                setTranslations((prev) => ({
                  ...prev,
                  [lang]: { ...prev[lang], slug: e.target.value },
                }))
              }
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Summary ({lang.toUpperCase()})</label>
          <textarea
            rows={2}
            value={cur.summary}
            onChange={(e) =>
              setTranslations((prev) => ({
                ...prev,
                [lang]: { ...prev[lang], summary: e.target.value },
              }))
            }
            className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-black">
              Project Background & Context ({lang.toUpperCase()})
            </label>
            <span className="text-[11px] text-[#555B57]">Plain Text</span>
          </div>
          <textarea
            rows={4}
            value={cur.background_html}
            onChange={(e) =>
              setTranslations((prev) => ({
                ...prev,
                [lang]: { ...prev[lang], background_html: e.target.value },
              }))
            }
            placeholder="Enter background and context in normal text..."
            className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm leading-relaxed"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-black">
              Key Activities & Implementation ({lang.toUpperCase()})
            </label>
            <span className="text-[11px] text-[#555B57]">Plain Text</span>
          </div>
          <textarea
            rows={4}
            value={cur.activities_html}
            onChange={(e) =>
              setTranslations((prev) => ({
                ...prev,
                [lang]: { ...prev[lang], activities_html: e.target.value },
              }))
            }
            placeholder="Enter key activities in normal text..."
            className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm leading-relaxed"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-black">
              Measurable Outcomes & Results ({lang.toUpperCase()})
            </label>
            <span className="text-[11px] text-[#555B57]">Plain Text</span>
          </div>
          <textarea
            rows={3}
            value={cur.outcomes_html}
            onChange={(e) =>
              setTranslations((prev) => ({
                ...prev,
                [lang]: { ...prev[lang], outcomes_html: e.target.value },
              }))
            }
            placeholder="Enter project outcomes and measurable achievements in normal text..."
            className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">
            Partners (comma-separated)
          </label>
          <input
            value={implementingPartners}
            onChange={(e) => setImplementingPartners(e.target.value)}
            placeholder="e.g. Municipal Social Welfare, Foundation for Civil Society, UNICEF"
            className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
          />
        </div>

        <div className="pt-4 border-t border-[#E6A500]/30 flex items-center justify-between">
          <p className="text-xs text-black/70">
            Click <strong>Save Project</strong> to store all changes in Supabase and publish live to the public website.
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-[#E6A500] hover:bg-[#d49700] disabled:opacity-50 text-black text-sm font-extrabold flex items-center gap-2 cursor-pointer shadow-md transition"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving to Database...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Project & Publish Live
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function StoriesModule({
  stories,
  programmes,
  media,
  accessToken,
  canPublish,
  onRefresh,
  notify,
  showAlert,
}: {
  stories: any[];
  programmes: any[];
  media: any[];
  accessToken: string;
  canPublish: boolean;
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
  showAlert?: (opts: SweetAlertOptions) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [featuredMediaId, setFeaturedMediaId] = useState('');
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const resolveStoryImageUrl = (mediaId?: string | null) => {
    if (!mediaId) return null;
    if (mediaId.startsWith('/') || mediaId.startsWith('http')) return mediaId;
    const m = media.find((item) => item.id === mediaId);
    if (!m) return null;
    return m.public_url || (m.storage_key ? `/media/${m.storage_key}` : null);
  };

  const handleSelectStory = (s: any) => {
    const enT =
      (s.story_translations || []).find((t: any) => t.language === 'en') ||
      (s.story_translations || [])[0] ||
      {};
    setEditingId(s.id);
    setTitle(enT?.title || '');
    setDescription(
      stripHtmlForEditing(enT?.full_story || enT?.body_html || enT?.summary || enT?.excerpt || '')
    );
    setFeaturedMediaId(s.featured_media_id || s.featured_image_id || '');
    setPendingImageFile(null);
    const existingUrl =
      resolveStoryImageUrl(s.featured_media_id || s.featured_image_id) || s.image_url || null;
    setImagePreview(existingUrl);
    if (imageFileInputRef.current) imageFileInputRef.current.value = '';
  };

  const handleResetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setFeaturedMediaId('');
    setPendingImageFile(null);
    setImagePreview(null);
    if (imageFileInputRef.current) imageFileInputRef.current.value = '';
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const handleRemoveImage = () => {
    setPendingImageFile(null);
    setImagePreview(null);
    setFeaturedMediaId('');
    if (imageFileInputRef.current) imageFileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!title.trim()) {
      notify('Please enter a story title.', true);
      showAlert?.({
        type: 'warning',
        title: 'Story Title Required',
        message: 'Please provide a title for the story of change.',
      });
      return;
    }
    if (!description.trim()) {
      notify('Please enter the story description.', true);
      showAlert?.({
        type: 'warning',
        title: 'Story Description Required',
        message: 'Please write the story description or beneficiary journey.',
      });
      return;
    }

    setSaving(true);
    showAlert?.({
      type: 'loading',
      title: editingId ? 'Updating Story of Change...' : 'Saving Story of Change...',
      message: pendingImageFile
        ? 'Uploading story image to media storage and publishing story...'
        : 'Storing story narrative in database and publishing to website...',
    });

    try {
      let finalMediaId = featuredMediaId || null;

      // 1. Upload story image if chosen
      if (pendingImageFile) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('file', pendingImageFile);
        formData.append('category', 'stories');
        formData.append('visibility', 'public');
        formData.append('title', `${title.trim()} Image`);
        formData.append('alt_text', `${title.trim()} Story Photo`);

        const uploadRes = await fetch('/api/v1/media/upload', {
          method: 'POST',
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Failed to upload story image.');
        }

        finalMediaId = uploadData.media.id;
      }

      // Generate slug and formatted text
      const slug =
        title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || `story-${Date.now()}`;
      const summary = description.trim().split('\n')[0].slice(0, 280);
      const formattedHtml = plainTextToFormattedHtml(description.trim());

      // 2. Upsert story into Supabase
      if (editingId) {
        const { error: sErr } = await supabase
          .from('stories')
          .update({
            featured_media_id: finalMediaId,
            has_written_consent: true,
            uses_pseudonym: true,
            safeguarding_review_status: 'approved',
            status: 'published',
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (sErr) throw sErr;

        for (const lang of ['en', 'sw']) {
          await supabase.from('story_translations').upsert(
            {
              story_id: editingId,
              language: lang,
              title: title.trim(),
              slug,
              summary,
              full_story: formattedHtml,
              translation_status: 'published',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'story_id,language' }
          );
        }

        notify('Story of Change updated successfully.');
        broadcastLivePublish({ module: 'stories' });
        showAlert?.({
          type: 'success',
          title: 'Story Updated Successfully!',
          message: `Story "${title.trim()}" has been updated in the database and is live on the website!`,
          websiteUrl: `http://localhost:3000/stories/${slug}`,
          websiteLabel: 'View Story on Website ↗',
        });
      } else {
        const { data: newStory, error: sErr } = await supabase
          .from('stories')
          .insert({
            featured_media_id: finalMediaId,
            has_written_consent: true,
            uses_pseudonym: true,
            safeguarding_review_status: 'approved',
            status: 'published',
            published_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (sErr) throw sErr;

        for (const lang of ['en', 'sw']) {
          await supabase.from('story_translations').insert({
            story_id: newStory.id,
            language: lang,
            title: title.trim(),
            slug,
            summary,
            full_story: formattedHtml,
            translation_status: 'published',
          });
        }

        notify('Story of Change published successfully.');
        broadcastLivePublish({ module: 'stories' });
        showAlert?.({
          type: 'success',
          title: 'Story Published Successfully!',
          message: `Story "${title.trim()}" has been saved in the database and published live to the website!`,
          websiteUrl: `http://localhost:3000/stories/${slug}`,
          websiteLabel: 'View Story on Website ↗',
        });
      }

      handleResetForm();
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
      showAlert?.({
        type: 'error',
        title: 'Could Not Save Story',
        message: err.message || 'An error occurred while saving the story.',
      });
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Row 1: Stories of Change List (Full Width) */}
      <div className="w-full bg-white rounded-xl border border-[#E5E7E5] p-5 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7E5] pb-3">
          <div>
            <h3 className="font-bold text-base text-[#000000] flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-[#E6A500]" /> Stories of Change ({stories.length})
            </h3>
            <p className="text-xs text-[#555B57]">
              Real beneficiary journeys and impact narratives published to the website. Click any story card to edit.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetForm}
            className="px-3.5 py-1.5 rounded-lg bg-[#E6A500] text-black text-xs font-bold hover:bg-[#d49700] transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add New Story
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[360px] overflow-y-auto pr-1">
          {stories.map((s) => {
            const enT =
              (s.story_translations || []).find((t: any) => t.language === 'en') ||
              (s.story_translations || [])[0] ||
              {};
            const imgUrl = resolveStoryImageUrl(s.featured_media_id || s.featured_image_id) || s.image_url;
            const isSelected = editingId === s.id;
            return (
              <div
                key={s.id}
                onClick={() => handleSelectStory(s)}
                className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-[#E6A500] ring-2 ring-[#E6A500] bg-amber-50/20 shadow-md'
                    : 'border-[#E5E7E5] bg-white hover:border-[#E6A500]/60 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-20 h-16 rounded-lg border border-[#E5E7E5] bg-neutral-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {imgUrl ? (
                      <img src={imgUrl} alt={enT?.title || 'Story'} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#555B57]/40" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="font-bold text-sm text-[#000000] line-clamp-1">
                      {enT?.title || 'Untitled Story'}
                    </span>
                    <p className="text-xs text-[#555B57] line-clamp-2">
                      {stripHtmlForEditing(enT?.full_story || enT?.body_html || enT?.summary || enT?.excerpt || '')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#F4F5F4] text-xs">
                  <span className="font-bold text-[#E6A500] flex items-center gap-1 hover:underline">
                    <Edit3 className="w-3.5 h-3.5" /> Edit Story
                  </span>
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete story "${enT?.title || 'this story'}" from database?`)) {
                        await supabase.from('stories').delete().eq('id', s.id);
                        if (editingId === s.id) handleResetForm();
                        await onRefresh();
                      }
                    }}
                    className="text-red-600 text-xs hover:underline cursor-pointer font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            );
          })}
          {stories.length === 0 && (
            <p className="col-span-full text-xs text-[#555B57] py-8 text-center">
              No stories published yet. Fill in the form below to create your first Story of Change.
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Add / Edit Story Form (ONLY Image Upload, Title, and Bigger Description Area) */}
      <div className="w-full bg-white rounded-xl border border-[#E5E7E5] p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E5E7E5] pb-3">
          <div>
            <h4 className="font-bold text-base text-[#000000] flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-[#E6A500]" />
              {editingId ? `Edit Story: ${title}` : 'Add New Story of Change'}
            </h4>
            <p className="text-xs text-[#555B57]">
              {editingId
                ? 'Updating story details and image in the database.'
                : 'Upload the image, enter the title, and write the full story description.'}
            </p>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={handleResetForm}
              className="text-xs font-bold text-[#E6A500] hover:underline cursor-pointer"
            >
              + Add New Story Instead
            </button>
          )}
        </div>

        {/* 1. UPLOAD IMAGE / IMAGES AREA */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-[#000000]">
            Story Image (Upload File) *
          </label>

          <input
            ref={imageFileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleImageFileChange}
            className="hidden"
          />

          {imagePreview ? (
            <div className="p-4 rounded-xl border border-[#E5E7E5] bg-[#F4F5F4]/50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-28 h-20 rounded-lg border border-[#E5E7E5] bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Story preview"
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-black flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    {pendingImageFile
                      ? `New image selected: ${pendingImageFile.name}`
                      : 'Current story image active'}
                  </div>
                  <div className="text-[11px] text-[#555B57] mt-0.5">
                    {pendingImageFile
                      ? `${Math.round(pendingImageFile.size / 1024)} KB · Will be uploaded on save`
                      : 'Linked to story in database'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => imageFileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-lg border border-[#E5E7E5] bg-white text-xs font-bold hover:bg-neutral-50 text-black cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-[#E6A500]" /> Upload / Replace Image
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-3.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 cursor-pointer flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" /> Remove Image
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => imageFileInputRef.current?.click()}
              className="border-2 border-dashed border-[#E5E7E5] hover:border-[#E6A500] rounded-xl p-8 text-center cursor-pointer transition bg-[#F4F5F4]/40 hover:bg-[#F4F5F4]"
            >
              <Upload className="w-9 h-9 text-[#E6A500] mx-auto mb-2" />
              <div className="text-sm font-bold text-black">
                Click to Choose or Drag & Drop Story Image
              </div>
              <p className="text-xs text-[#555B57] mt-1">
                Upload beneficiary photo, programme impact picture, or event photograph (WebP, PNG, JPEG, SVG)
              </p>
            </div>
          )}
        </div>

        {/* 2. TITLE */}
        <div>
          <label className="block text-sm font-bold text-[#000000] mb-1.5">
            Story Title *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. From the Streets to Secondary School: Rehema's Journey of Hope"
            className="w-full px-4 py-3 rounded-xl border border-[#E5E7E5] text-base font-bold text-black"
          />
        </div>

        {/* 3. DESCRIPTION (BIGGER TEXT AREA) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-bold text-[#000000]">
              Story Description / Narrative (Normal Text) *
            </label>
            <span className="text-xs text-[#555B57]">Plain Text (Blank lines create styled paragraphs)</span>
          </div>
          <textarea
            rows={16}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Type the full story here in normal text. Blank lines between paragraphs will automatically be formatted as clean, styled paragraphs on the website..."
            className="w-full p-4 rounded-xl border border-[#E5E7E5] text-base leading-relaxed text-black"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || uploadingImage}
          className="w-full py-3.5 rounded-xl bg-[#E6A500] hover:bg-[#d49700] text-black font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-xs disabled:opacity-50"
        >
          {saving || uploadingImage ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {uploadingImage ? 'Uploading Image...' : 'Saving Story...'}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {editingId ? 'Save & Update Story' : 'Add Story of Change & Publish'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function NewsAndEventsModule({
  articles,
  events,
  media,
  accessToken,
  canPublish,
  onRefresh,
  notify,
  showAlert,
  initialTab = 'news',
  hideTabSwitcher = false,
}: {
  articles: any[];
  events: any[];
  media: any[];
  accessToken?: string;
  canPublish: boolean;
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
  showAlert?: (opts: SweetAlertOptions) => void;
  initialTab?: 'news' | 'events';
  hideTabSwitcher?: boolean;
}) {
  const [subTab, setSubTab] = useState<'news' | 'events'>(initialTab);
  const [editingId, setEditingId] = useState<string | null>(null);

  // News Form State: ONLY Upload Image or Document, Title, Sub Title, Description, and Add Links
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [description, setDescription] = useState('');
  const [links, setLinks] = useState<Array<{ url: string; label: string }>>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');

  // Media / Document state
  const [featuredMediaId, setFeaturedMediaId] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<{
    url: string | null;
    isImage: boolean;
    name: string;
    size?: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Events Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventSlug, setEventSlug] = useState('');
  const [eventLocation, setEventLocation] = useState('Dar es Salaam, Tanzania');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [eventSummary, setEventSummary] = useState('');
  const [eventBodyHtml, setEventBodyHtml] = useState('');
  const [eventImageId, setEventImageId] = useState('');

  const resolveMediaItem = (mediaId?: string | null) => {
    if (!mediaId) return null;
    return media.find((item) => item.id === mediaId) || null;
  };

  const resolveMediaUrl = (mediaId?: string | null) => {
    if (!mediaId) return null;
    if (mediaId.startsWith('/') || mediaId.startsWith('http')) return mediaId;
    const m = media.find((item) => item.id === mediaId);
    if (!m) return null;
    return m.public_url || (m.storage_key ? `/media/${m.storage_key}` : null);
  };

  const getArticleDetails = (a: any) => {
    const enT =
      (a.article_translations || a.news_article_translations || []).find((t: any) => t.language === 'en') ||
      (a.article_translations || a.news_article_translations || [])[0] ||
      {};
    const m = resolveMediaItem(a.featured_media_id);
    const url = resolveMediaUrl(a.featured_media_id) || a.image_url || null;
    const isDoc =
      m?.mime_type === 'application/pdf' ||
      m?.mime_type?.includes('word') ||
      m?.media_type === 'document' ||
      m?.original_filename?.match(/\.(pdf|docx?|txt)$/i);
    return {
      title: enT.title || 'Untitled Article',
      subTitle: enT.excerpt || '',
      description: stripHtmlForEditing(enT.body || ''),
      mediaItem: m,
      mediaUrl: url,
      isDoc: Boolean(isDoc),
      linksJson: enT.event_registration_info || '',
      mainLink: a.event_registration_url || '',
    };
  };

  const handleSelectArticle = (a: any) => {
    const details = getArticleDetails(a);
    setEditingId(a.id);
    setTitle(details.title);
    setSubTitle(details.subTitle);
    setDescription(details.description);
    setFeaturedMediaId(a.featured_media_id || '');
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    let parsedLinks: Array<{ url: string; label: string }> = [];
    if (details.linksJson) {
      try {
        const parsed = JSON.parse(details.linksJson);
        if (Array.isArray(parsed)) parsedLinks = parsed;
      } catch {}
    }
    if (parsedLinks.length === 0 && details.mainLink) {
      parsedLinks.push({ url: details.mainLink, label: 'Official Link' });
    }
    setLinks(parsedLinks);

    if (details.mediaUrl) {
      setFilePreview({
        url: details.mediaUrl,
        isImage: !details.isDoc,
        name: details.mediaItem?.original_filename || (details.isDoc ? 'Attached Document' : 'Attached Image'),
        size: details.mediaItem?.file_size_bytes,
      });
    } else {
      setFilePreview(null);
    }
  };

  const handleResetNewsForm = () => {
    setEditingId(null);
    setTitle('');
    setSubTitle('');
    setDescription('');
    setLinks([]);
    setNewLinkUrl('');
    setNewLinkLabel('');
    setFeaturedMediaId('');
    setPendingFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    const isImg = file.type.startsWith('image/');
    const previewUrl = isImg ? URL.createObjectURL(file) : null;
    setFilePreview({
      url: previewUrl,
      isImage: isImg,
      name: file.name,
      size: file.size,
    });
  };

  const handleRemoveFile = () => {
    setPendingFile(null);
    setFilePreview(null);
    setFeaturedMediaId('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) {
      notify('Please enter a link URL.', true);
      return;
    }
    let formattedUrl = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl) && !formattedUrl.startsWith('/')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    setLinks((prev) => [
      ...prev,
      { url: formattedUrl, label: newLinkLabel.trim() || formattedUrl },
    ]);
    setNewLinkUrl('');
    setNewLinkLabel('');
  };

  const handleRemoveLink = (idx: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveNews = async () => {
    if (!title.trim()) {
      notify('Please enter an article title.', true);
      showAlert?.({
        type: 'warning',
        title: 'Title Required',
        message: 'Please provide an article title before saving.',
      });
      return;
    }
    if (!description.trim()) {
      notify('Please enter the article description.', true);
      showAlert?.({
        type: 'warning',
        title: 'Description Required',
        message: 'Please provide the article narrative or description.',
      });
      return;
    }

    setSaving(true);
    showAlert?.({
      type: 'loading',
      title: editingId ? 'Updating News Article...' : 'Publishing News Article...',
      message: pendingFile
        ? 'Uploading file to media storage and publishing article...'
        : 'Storing news article in database and syncing with website...',
    });

    try {
      let finalMediaId = featuredMediaId || null;

      if (pendingFile) {
        setUploadingFile(true);
        const formData = new FormData();
        formData.append('file', pendingFile);
        formData.append('category', 'organization');
        formData.append('visibility', 'public');
        formData.append('title_en', `${title.trim()} Attachment`);
        formData.append('alt_text_en', `${title.trim()} Media`);

        const uploadRes = await fetch('/api/v1/media/upload', {
          method: 'POST',
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Failed to upload media file.');
        }
        finalMediaId = uploadData.media.id;
      }

      const slug =
        title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || `news-${Date.now()}`;

      const effectiveSubtitle = subTitle.trim() || description.trim().split('\n')[0].slice(0, 200);

      let formattedHtml = plainTextToFormattedHtml(description.trim());

      if (links.length > 0) {
        const linksHtml = `\n<div class="news-links-section mt-6 pt-4 border-t border-gray-200">\n  <p class="font-bold text-sm text-black mb-2">Related Links &amp; Resources:</p>\n  <ul class="space-y-1.5 list-none p-0">\n${links.map((l) => `    <li><a href="${l.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 font-bold text-[#E6A500] hover:underline">${l.label || l.url} &nearr;</a></li>`).join('\n')}\n  </ul>\n</div>`;
        formattedHtml += linksHtml;
      }

      const primaryUrl = links[0]?.url || null;
      const linksJson = JSON.stringify(links);

      if (editingId) {
        const { error: aErr } = await supabase
          .from('articles')
          .update({
            featured_media_id: finalMediaId,
            event_registration_url: primaryUrl,
            status: 'published',
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (aErr) throw aErr;

        for (const lang of ['en', 'sw']) {
          await supabase.from('article_translations').upsert(
            {
              article_id: editingId,
              language: lang,
              title: title.trim(),
              slug,
              excerpt: effectiveSubtitle,
              body: formattedHtml,
              event_registration_info: linksJson,
              translation_status: 'published',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'article_id,language' }
          );
        }

        notify('News article updated successfully.');
        broadcastLivePublish({ module: 'articles' });
        showAlert?.({
          type: 'success',
          title: 'News Article Updated!',
          message: `Article "${title.trim()}" has been updated in the database and is live on the website!`,
          websiteUrl: 'http://localhost:3000/news',
          websiteLabel: 'View on Website ↗',
        });
      } else {
        const { data: newArt, error: aErr } = await supabase
          .from('articles')
          .insert({
            content_type: 'news',
            featured_media_id: finalMediaId,
            event_registration_url: primaryUrl,
            status: 'published',
            published_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (aErr) throw aErr;

        for (const lang of ['en', 'sw']) {
          await supabase.from('article_translations').insert({
            article_id: newArt.id,
            language: lang,
            title: title.trim(),
            slug,
            excerpt: effectiveSubtitle,
            body: formattedHtml,
            event_registration_info: linksJson,
            translation_status: 'published',
          });
        }

        notify('News article published successfully.');
        broadcastLivePublish({ module: 'articles' });
        showAlert?.({
          type: 'success',
          title: 'News Article Published!',
          message: `Article "${title.trim()}" has been saved in the database and published live to the website!`,
          websiteUrl: 'http://localhost:3000/news',
          websiteLabel: 'View on Website ↗',
        });
      }

      handleResetNewsForm();
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
      showAlert?.({
        type: 'error',
        title: 'Could Not Save News Article',
        message: err.message || 'An error occurred while saving the news article.',
      });
    } finally {
      setSaving(false);
      setUploadingFile(false);
    }
  };

  const handleSaveEvent = async () => {
    if (!eventTitle.trim()) {
      notify('Event title required.', true);
      showAlert?.({
        type: 'warning',
        title: 'Title Required',
        message: 'Please provide an event title before saving.',
      });
      return;
    }
    const finalSlug =
      eventSlug.trim() ||
      eventTitle
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    setSaving(true);
    showAlert?.({
      type: 'loading',
      title: 'Saving Event...',
      message: 'Writing event to database and publishing live to website...',
    });
    try {
      const { data, error } = await supabase
        .from('articles')
        .insert({
          content_type: 'event',
          featured_media_id: eventImageId || null,
          event_location: eventLocation,
          event_start_at: new Date(startDate).toISOString(),
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) throw error;

      for (const lang of ['en', 'sw']) {
        await supabase.from('article_translations').insert({
          article_id: data.id,
          language: lang,
          title: eventTitle.trim(),
          slug: finalSlug,
          excerpt: eventSummary.trim() || eventTitle.trim(),
          body: plainTextToFormattedHtml(eventBodyHtml || eventSummary || eventTitle),
          translation_status: 'published',
        });
      }

      notify('Event published successfully.');
      broadcastLivePublish({ module: 'events' });
      await onRefresh();
      showAlert?.({
        type: 'success',
        title: 'Event Published Successfully!',
        message: `Event "${eventTitle}" has been saved and is now live on the public website!`,
        websiteUrl: 'http://localhost:3000/news-events',
        websiteLabel: 'View on Website ↗',
      });
      setEventTitle('');
      setEventSlug('');
      setEventSummary('');
      setEventBodyHtml('');
      setEventImageId('');
    } catch (err: any) {
      notify(err.message, true);
      showAlert?.({
        type: 'error',
        title: 'Could Not Save Event',
        message: err.message || 'An error occurred while saving the event.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab navigation */}
      {!hideTabSwitcher && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSubTab('news')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition ${
              subTab === 'news'
                ? 'bg-[#E6A500] text-black shadow-xs'
                : 'bg-white border border-[#E5E7E5] text-black hover:bg-neutral-50'
            }`}
          >
            <Newspaper className="w-4 h-4" /> News Articles ({articles.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('events')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition ${
              subTab === 'events'
                ? 'bg-[#E6A500] text-black shadow-xs'
                : 'bg-white border border-[#E5E7E5] text-black hover:bg-neutral-50'
            }`}
          >
            <Calendar className="w-4 h-4" /> Events ({events.length})
          </button>
        </div>
      )}

      {subTab === 'news' ? (
        <div className="space-y-6">
          {/* Row 1: Published News Articles List (Full Width) */}
          <div className="w-full bg-white rounded-xl border border-[#E5E7E5] p-5 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7E5] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#000000] flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-[#E6A500]" /> Published News Articles ({articles.length})
                </h3>
                <p className="text-xs text-[#555B57]">
                  Articles, press releases, and documents published live to the website. Click any article card to edit.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetNewsForm}
                className="px-3.5 py-1.5 rounded-lg bg-[#E6A500] text-black text-xs font-bold hover:bg-[#d49700] transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add New Article
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[360px] overflow-y-auto pr-1">
              {articles.map((a) => {
                const details = getArticleDetails(a);
                const isSelected = editingId === a.id;
                return (
                  <div
                    key={a.id}
                    onClick={() => handleSelectArticle(a)}
                    className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'border-[#E6A500] ring-2 ring-[#E6A500] bg-amber-50/20 shadow-md'
                        : 'border-[#E5E7E5] bg-white hover:border-[#E6A500]/60 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-20 h-16 rounded-lg border border-[#E5E7E5] bg-neutral-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {details.mediaUrl ? (
                          details.isDoc ? (
                            <FileText className="w-7 h-7 text-amber-600" />
                          ) : (
                            <img src={details.mediaUrl} alt={details.title} className="w-full h-full object-cover" />
                          )
                        ) : (
                          <Newspaper className="w-6 h-6 text-[#555B57]/40" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="uppercase font-extrabold text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                            {details.isDoc ? 'Document' : 'News'}
                          </span>
                          <span className="text-[11px] text-[#555B57]">
                            {a.published_at ? new Date(a.published_at).toLocaleDateString() : 'Live'}
                          </span>
                        </div>
                        <span className="font-bold text-sm text-[#000000] line-clamp-1">
                          {details.title}
                        </span>
                        {details.subTitle && (
                          <p className="text-xs text-[#555B57] line-clamp-1 italic">
                            {details.subTitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#F4F5F4] text-xs">
                      <span className="font-bold text-[#E6A500] flex items-center gap-1 hover:underline">
                        <Edit3 className="w-3.5 h-3.5" /> Edit Article
                      </span>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete news article "${details.title}" from database?`)) {
                            await supabase.from('articles').delete().eq('id', a.id);
                            if (editingId === a.id) handleResetNewsForm();
                            await onRefresh();
                          }
                        }}
                        className="text-red-600 text-xs hover:underline cursor-pointer font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
              {articles.length === 0 && (
                <p className="col-span-full text-xs text-[#555B57] py-8 text-center">
                  No news articles published yet. Fill in the form below to create your first news article.
                </p>
              )}
            </div>
          </div>

          {/* Row 2: News Form (Full Width - ONLY Upload Image or Document, Title, Sub Title, Description, and Add Links) */}
          <div className="w-full bg-white rounded-xl border border-[#E5E7E5] p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E5E7E5] pb-3">
              <div>
                <h4 className="font-bold text-base text-[#000000] flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-[#E6A500]" />
                  {editingId ? `Edit News Article: ${title}` : 'Add New News Article'}
                </h4>
                <p className="text-xs text-[#555B57]">
                  {editingId
                    ? 'Updating news article record, image/document, and links in database.'
                    : 'Upload image or document, enter title, sub title, description narrative, and add links.'}
                </p>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetNewsForm}
                  className="text-xs font-bold text-[#E6A500] hover:underline cursor-pointer"
                >
                  + Add New Article Instead
                </button>
              )}
            </div>

            {/* 1. UPLOAD IMAGE OR DOCUMENT */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#000000]">
                Upload Image or Document (PDF, Word, PNG, JPEG, WebP, SVG)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={handleFileChange}
                className="hidden"
              />

              {filePreview ? (
                <div className="p-4 rounded-xl border border-[#E5E7E5] bg-[#F4F5F4]/50 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {filePreview.isImage && filePreview.url ? (
                      <div className="w-28 h-20 rounded-lg border border-[#E5E7E5] bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={filePreview.url}
                          alt="News preview"
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    ) : (
                      <div className="w-28 h-20 rounded-lg border border-amber-300 bg-amber-50 p-2 flex flex-col items-center justify-center shrink-0 text-center">
                        <FileText className="w-8 h-8 text-amber-600 mb-1" />
                        <span className="text-[10px] font-extrabold uppercase text-amber-900">Document</span>
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-black flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        {filePreview.name}
                      </div>
                      <div className="text-[11px] text-[#555B57] mt-0.5">
                        {filePreview.size ? `${Math.round(filePreview.size / 1024)} KB · ` : ''}
                        {pendingFile ? 'Ready to upload on save' : 'Linked in database'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-lg border border-[#E5E7E5] bg-white text-xs font-bold hover:bg-neutral-50 text-black cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#E6A500]" /> Upload / Replace File
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="px-3.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 cursor-pointer flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" /> Remove File
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E5E7E5] hover:border-[#E6A500] rounded-xl p-8 text-center cursor-pointer transition bg-[#F4F5F4]/40 hover:bg-[#F4F5F4]"
                >
                  <Upload className="w-9 h-9 text-[#E6A500] mx-auto mb-2" />
                  <div className="text-sm font-bold text-black">
                    Click to Choose or Drag &amp; Drop Image or Document
                  </div>
                  <p className="text-xs text-[#555B57] mt-1">
                    Upload photograph, banner, or document file (PDF, Word, WebP, PNG, JPEG)
                  </p>
                </div>
              )}
            </div>

            {/* 2. TITLE */}
            <div>
              <label className="block text-sm font-bold text-[#000000] mb-1.5">
                Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Babawatoto Expands Community Catch-Up Education in Dar es Salaam"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7E5] text-base font-bold text-black"
              />
            </div>

            {/* 3. SUB TITLE */}
            <div>
              <label className="block text-sm font-bold text-[#000000] mb-1.5">
                Sub Title *
              </label>
              <input
                value={subTitle}
                onChange={(e) => setSubTitle(e.target.value)}
                placeholder="e.g. Empowering over 350 vulnerable children through accelerated learning and family reintegration"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7E5] text-sm text-black"
              />
            </div>

            {/* 4. DESCRIPTION (BIGGER TEXT AREA) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-bold text-[#000000]">
                  Description / Full Narrative (Normal Text) *
                </label>
                <span className="text-xs text-[#555B57]">Plain Text (Blank lines create styled paragraphs)</span>
              </div>
              <textarea
                rows={14}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write the full article description here in normal text. Paragraphs separated by blank lines will automatically be styled on the website..."
                className="w-full p-4 rounded-xl border border-[#E5E7E5] text-base leading-relaxed text-black"
              />
            </div>

            {/* 5. ADD LINKS */}
            <div className="space-y-3 p-4 rounded-xl border border-[#E5E7E5] bg-[#F4F5F4]/40">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-[#000000] flex items-center gap-1.5">
                  <LinkIcon className="w-4 h-4 text-[#E6A500]" /> Add Links (Press Releases, External Articles, Registrations)
                </label>
                <span className="text-xs text-[#555B57]">{links.length} link(s) added</span>
              </div>

              {/* Input row to add new link */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end">
                <div className="md:col-span-6">
                  <label className="block text-[11px] font-bold text-[#555B57] mb-1">Link URL *</label>
                  <input
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="https://example.com/press-release or https://..."
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-xs text-black bg-white"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-[11px] font-bold text-[#555B57] mb-1">Link Label / Title (Optional)</label>
                  <input
                    value={newLinkLabel}
                    onChange={(e) => setNewLinkLabel(e.target.value)}
                    placeholder="e.g. Read Full Report ↗"
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-xs text-black bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="w-full py-2 rounded-lg bg-[#E6A500] hover:bg-[#d49700] text-black text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Link
                  </button>
                </div>
              </div>

              {/* Display existing added links */}
              {links.length > 0 && (
                <div className="space-y-2 pt-2">
                  {links.map((lnk, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-[#E5E7E5] text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <ExternalLink className="w-3.5 h-3.5 text-[#E6A500] shrink-0" />
                        <span className="font-bold text-black truncate">{lnk.label || lnk.url}</span>
                        <span className="text-[#555B57] truncate font-mono text-[11px]">({lnk.url})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(idx)}
                        className="text-red-600 hover:text-red-800 cursor-pointer p-1"
                        title="Remove link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 6. SAVE BUTTON */}
            <button
              onClick={handleSaveNews}
              disabled={saving || uploadingFile}
              className="w-full py-3.5 rounded-xl bg-[#E6A500] hover:bg-[#d49700] text-black font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-xs disabled:opacity-50"
            >
              {saving || uploadingFile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploadingFile ? 'Uploading File...' : 'Saving Article...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editingId ? 'Save & Update Article' : 'Save News Article & Publish'}
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Events View & Form */
        <div className="space-y-6">
          <div className="w-full bg-white rounded-xl border border-[#E5E7E5] p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E5E7E5] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#000000] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#E6A500]" /> Scheduled Community Events ({events.length})
                </h3>
                <p className="text-xs text-[#555B57]">Forums, stakeholder meetings, and cultural showcases.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[300px] overflow-y-auto pr-1">
              {events.map((ev) => {
                const enT =
                  (ev.article_translations || ev.event_translations || []).find((t: any) => t.language === 'en') ||
                  (ev.article_translations || ev.event_translations || [])[0] ||
                  {};
                return (
                  <div
                    key={ev.id}
                    className="p-4 rounded-xl border border-[#E5E7E5] hover:border-[#E6A500] transition bg-white space-y-2"
                  >
                    <div className="font-bold text-sm text-[#000000] truncate">{enT?.title || 'Untitled Event'}</div>
                    <div className="text-xs text-[#555B57] flex items-center justify-between">
                      <span className="uppercase font-semibold text-[10px] px-2 py-0.5 rounded bg-neutral-100">{ev.status}</span>
                      <span>{new Date(ev.event_start_at || ev.start_date || ev.created_at).toLocaleDateString()}</span>
                    </div>
                    {ev.event_location && <div className="text-xs text-[#555B57]">📍 {ev.event_location}</div>}
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm(`Delete event "${enT?.title || 'this event'}"?`)) {
                          await supabase.from('articles').delete().eq('id', ev.id);
                          await onRefresh();
                        }
                      }}
                      className="text-red-600 text-xs hover:underline cursor-pointer font-bold flex items-center gap-1 pt-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                );
              })}
              {events.length === 0 && (
                <p className="col-span-full text-xs text-[#555B57] py-6 text-center">
                  No events scheduled. Use the form below to create one.
                </p>
              )}
            </div>
          </div>

          <div className="w-full bg-white rounded-xl border border-[#E5E7E5] p-6 space-y-4 shadow-xs">
            <h4 className="font-bold text-base text-[#000000]">Create Community Event</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Event Title *</label>
                <input
                  value={eventTitle}
                  onChange={(e) => {
                    setEventTitle(e.target.value);
                    setEventSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '')
                    );
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm text-black"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Event Slug</label>
                <input
                  value={eventSlug}
                  onChange={(e) => setEventSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm font-mono text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Start Date &amp; Time</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm text-black"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Location</label>
                <input
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm text-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Event Summary</label>
              <textarea
                rows={2}
                value={eventSummary}
                onChange={(e) => setEventSummary(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm text-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Event Details &amp; Agenda</label>
              <textarea
                rows={6}
                value={eventBodyHtml}
                onChange={(e) => setEventBodyHtml(e.target.value)}
                placeholder="Write event details in normal language..."
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm leading-relaxed text-black"
              />
            </div>

            <button
              onClick={handleSaveEvent}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-[#E6A500] hover:bg-[#d49700] disabled:opacity-50 text-black text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-xs transition"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Event...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Event &amp; Publish
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Dedicated News Module
 * Standalone page for News, Press Releases & Field Dispatches
 */
export function NewsModule(
  props: Omit<Parameters<typeof NewsAndEventsModule>[0], 'events'> & { events?: any[] }
) {
  return (
    <NewsAndEventsModule
      {...props}
      events={props.events || []}
      initialTab="news"
      hideTabSwitcher={true}
    />
  );
}

/**
 * Dedicated Events Module
 * Standalone page for Events & Community Gatherings
 */
export function EventsModule(
  props: Omit<Parameters<typeof NewsAndEventsModule>[0], 'articles'> & { articles?: any[] }
) {
  return (
    <NewsAndEventsModule
      {...props}
      articles={props.articles || []}
      initialTab="events"
      hideTabSwitcher={true}
    />
  );
}


