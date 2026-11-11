import React, { useState, useEffect } from 'react';
import {
  Save,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Shield,
  FolderKanban,
  Newspaper,
  Calendar,
  FileText,
  HeartHandshake,
  PhoneCall,
  MapPin,
  Mail,
  Clock,
  Image as ImageIcon,
} from 'lucide-react';
import { supabase } from '../supabase.js';
import { type SweetAlertOptions } from './SweetAlertModal.js';
import { HeroBannerImageUploader } from './HeroBannerImageUploader.js';

interface PageModuleBaseProps {
  siteSettings: any[];
  media: any[];
  accessToken?: string;
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
  showAlert?: (opts: SweetAlertOptions | null) => void;
}

const getSettingKey = (s: any) => s?.key || s?.setting_key;
const getSettingValue = (s: any) => s?.value ?? s?.setting_value;

// =============================================================================
// 1. PROGRAMMES PAGE EDITOR MODULE (/programmes)
// =============================================================================
export function ProgrammesPageModule({
  siteSettings,
  media,
  onRefresh,
  notify,
  showAlert,
}: PageModuleBaseProps) {
  const existingSetting = siteSettings.find((s) => getSettingKey(s) === 'programmes_page_settings');
  const rawVal = getSettingValue(existingSetting);
  const isConfigured = rawVal !== undefined && rawVal !== null && typeof rawVal === 'object';
  const val = isConfigured ? rawVal : {};

  const [heroBadge, setHeroBadge] = useState(
    isConfigured ? (val.hero_badge ?? '') : 'Strategic Framework'
  );
  const [heroTitle, setHeroTitle] = useState(
    isConfigured ? (val.hero_title ?? '') : 'Core Thematic Programmes'
  );
  const [heroImage, setHeroImage] = useState(
    isConfigured
      ? (val.hero_image || val.hero_banner_image || '')
      : '/media/public/images/programmes/arts1.webp'
  );
  const [leadTitle, setLeadTitle] = useState(
    isConfigured ? (val.lead_title ?? '') : 'Comprehensive Child Protection & Youth Empowerment Framework'
  );
  const [leadDescription, setLeadDescription] = useState(
    isConfigured
      ? (val.lead_description ?? '')
      : 'Babawatoto Organization executes six core strategic programmes in Tanzania: Child Protection & Street Outreach, Catch-up MEMKWA Education, Creative Arts (HEART), Youth Livelihoods & Vocational Training, Community Advocacy, and Human Rights & Reintegration.'
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existingSetting) {
      const v = getSettingValue(existingSetting);
      if (v && typeof v === 'object') {
        if (v.hero_badge !== undefined) setHeroBadge(v.hero_badge);
        if (v.hero_title !== undefined) setHeroTitle(v.hero_title);
        if (v.hero_image !== undefined || v.hero_banner_image !== undefined) {
          setHeroImage(v.hero_image || v.hero_banner_image || '');
        }
        if (v.lead_title !== undefined) setLeadTitle(v.lead_title);
        if (v.lead_description !== undefined) setLeadDescription(v.lead_description);
      }
    }
  }, [siteSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    showAlert?.({
      type: 'loading',
      title: 'Saving Programmes Page Content...',
      message: 'Persisting changes to Supabase database...',
    });

    try {
      const payload = {
        ...val,
        hero_badge: heroBadge.trim(),
        hero_title: heroTitle.trim(),
        hero_image: heroImage.trim(),
        hero_banner_image: heroImage.trim(),
        lead_title: leadTitle.trim(),
        lead_description: leadDescription.trim(),
      };

      const { error } = await supabase.from('site_settings').upsert(
        { key: 'programmes_page_settings', value: payload, is_public: true },
        { onConflict: 'key' }
      );
      if (error) throw error;

      showAlert?.({
        type: 'success',
        title: 'Programmes Page Saved',
        message: 'Content updated and live on website.',
        websiteUrl: 'http://localhost:3000/programmes',
        websiteLabel: 'View Programmes Page',
      });
      notify('Programmes page updated.');
      await onRefresh();
    } catch (err: any) {
      showAlert?.({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Error occurred while saving.',
      });
      notify(err.message, true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 p-6 rounded-xl flex items-center justify-between">
        <div>
          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-xs uppercase tracking-wider rounded">
            Website Page Editor
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#E6A500]" />
            Programmes Page Content
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Edit the hero banner, titles, and lead narrative for the /programmes page.
          </p>
        </div>
        <a
          href="http://localhost:3000/programmes"
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1.5"
        >
          <ExternalLink className="w-4 h-4" />
          Preview Live Page
        </a>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-gray-200 p-6 rounded-xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Hero Badge / Tag
            </label>
            <input
              type="text"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Hero Page Title
            </label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-bold"
            />
          </div>
        </div>

        <HeroBannerImageUploader
          imageUrl={heroImage}
          onImageChange={setHeroImage}
          supabase={supabase}
          showAlert={showAlert}
          notify={notify}
        />

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Lead Section Title
          </label>
          <input
            type="text"
            value={leadTitle}
            onChange={(e) => setLeadTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Lead Narrative Description
          </label>
          <textarea
            rows={4}
            value={leadDescription}
            onChange={(e) => setLeadDescription(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black leading-relaxed"
          />
        </div>

        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 text-xs font-bold text-black bg-[#E6A500] hover:bg-[#d49700] rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Programmes Page'}
          </button>
        </div>
      </form>
    </div>
  );
}

// =============================================================================
// 2. PROJECTS PAGE EDITOR MODULE (/projects)
// =============================================================================
export function ProjectsPageModule({
  siteSettings,
  media,
  onRefresh,
  notify,
  showAlert,
}: PageModuleBaseProps) {
  const existingSetting = siteSettings.find((s) => getSettingKey(s) === 'projects_page_settings');
  const rawVal = getSettingValue(existingSetting);
  const isConfigured = rawVal !== undefined && rawVal !== null && typeof rawVal === 'object';
  const val = isConfigured ? rawVal : {};

  const [heroBadge, setHeroBadge] = useState(
    isConfigured ? (val.hero_badge ?? '') : 'Active Interventions'
  );
  const [heroTitle, setHeroTitle] = useState(
    isConfigured ? (val.hero_title ?? '') : 'Community Projects & Interventions'
  );
  const [heroImage, setHeroImage] = useState(
    isConfigured
      ? (val.hero_image || val.hero_banner_image || '')
      : '/media/public/images/projects/WATOTO.webp'
  );
  const [leadTitle, setLeadTitle] = useState(
    isConfigured ? (val.lead_title ?? '') : 'Empowering Vulnerable Children and Families Across Dar es Salaam'
  );
  const [leadDescription, setLeadDescription] = useState(
    isConfigured
      ? (val.lead_description ?? '')
      : 'Babawatoto Centre executes structured humanitarian and development projects targeting street-connected children, vulnerable adolescents, young mothers, and at-risk families.'
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existingSetting) {
      const v = getSettingValue(existingSetting);
      if (v && typeof v === 'object') {
        if (v.hero_badge !== undefined) setHeroBadge(v.hero_badge);
        if (v.hero_title !== undefined) setHeroTitle(v.hero_title);
        if (v.hero_image !== undefined || v.hero_banner_image !== undefined) {
          setHeroImage(v.hero_image || v.hero_banner_image || '');
        }
        if (v.lead_title !== undefined) setLeadTitle(v.lead_title);
        if (v.lead_description !== undefined) setLeadDescription(v.lead_description);
      }
    }
  }, [siteSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    showAlert?.({
      type: 'loading',
      title: 'Saving Projects Page Content...',
      message: 'Persisting changes to Supabase database...',
    });

    try {
      const payload = {
        ...val,
        hero_badge: heroBadge.trim(),
        hero_title: heroTitle.trim(),
        hero_image: heroImage.trim(),
        hero_banner_image: heroImage.trim(),
        lead_title: leadTitle.trim(),
        lead_description: leadDescription.trim(),
      };

      const { error } = await supabase.from('site_settings').upsert(
        { key: 'projects_page_settings', value: payload, is_public: true },
        { onConflict: 'key' }
      );
      if (error) throw error;

      showAlert?.({
        type: 'success',
        title: 'Projects Page Saved',
        message: 'Content updated and live on website.',
        websiteUrl: 'http://localhost:3000/projects',
        websiteLabel: 'View Projects Page',
      });
      notify('Projects page updated.');
      await onRefresh();
    } catch (err: any) {
      showAlert?.({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Error occurred while saving.',
      });
      notify(err.message, true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 p-6 rounded-xl flex items-center justify-between">
        <div>
          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-xs uppercase tracking-wider rounded">
            Website Page Editor
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-[#E6A500]" />
            Projects Page Content
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Edit the hero banner, titles, and lead narrative for the /projects page.
          </p>
        </div>
        <a
          href="http://localhost:3000/projects"
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1.5"
        >
          <ExternalLink className="w-4 h-4" />
          Preview Live Page
        </a>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-gray-200 p-6 rounded-xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Hero Badge / Tag
            </label>
            <input
              type="text"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Hero Page Title
            </label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-bold"
            />
          </div>
        </div>

        <HeroBannerImageUploader
          imageUrl={heroImage}
          onImageChange={setHeroImage}
          supabase={supabase}
          showAlert={showAlert}
          notify={notify}
        />

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Lead Section Title
          </label>
          <input
            type="text"
            value={leadTitle}
            onChange={(e) => setLeadTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Lead Narrative Description
          </label>
          <textarea
            rows={4}
            value={leadDescription}
            onChange={(e) => setLeadDescription(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black leading-relaxed"
          />
        </div>

        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 text-xs font-bold text-black bg-[#E6A500] hover:bg-[#d49700] rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Projects Page'}
          </button>
        </div>
      </form>
    </div>
  );
}

// =============================================================================
// 3. NEWS PAGE EDITOR MODULE (/news / /news-events)
// =============================================================================
export function NewsPageModule({
  siteSettings,
  media,
  onRefresh,
  notify,
  showAlert,
}: PageModuleBaseProps) {
  const existingSetting = siteSettings.find((s) => getSettingKey(s) === 'news_events_settings');
  const rawVal = getSettingValue(existingSetting);
  const isConfigured = rawVal !== undefined && rawVal !== null && typeof rawVal === 'object';
  const val = isConfigured ? rawVal : {};

  const [heroBadge, setHeroBadge] = useState(
    isConfigured ? (val.hero_badge ?? '') : 'Field Updates & Dispatches'
  );
  const [heroTitle, setHeroTitle] = useState(
    isConfigured ? (val.hero_title ?? '') : 'News & Stories of Change'
  );
  const [heroImage, setHeroImage] = useState(
    isConfigured
      ? (val.hero_banner_image || val.hero_image || '')
      : '/media/public/images/programmes/arts1.webp'
  );
  const [leadDescription, setLeadDescription] = useState(
    isConfigured
      ? (val.lead_description ?? '')
      : 'Stay up to date with Babawatoto Organization field updates, child safeguarding interventions, community outreach dispatches, and inspiring lived experiences from across Tanzania.'
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existingSetting) {
      const v = getSettingValue(existingSetting);
      if (v && typeof v === 'object') {
        if (v.hero_badge !== undefined) setHeroBadge(v.hero_badge);
        if (v.hero_title !== undefined) setHeroTitle(v.hero_title);
        if (v.hero_banner_image !== undefined || v.hero_image !== undefined) {
          setHeroImage(v.hero_banner_image || v.hero_image || '');
        }
        if (v.lead_description !== undefined) setLeadDescription(v.lead_description);
      }
    }
  }, [siteSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    showAlert?.({
      type: 'loading',
      title: 'Saving News Page Content...',
      message: 'Persisting changes to Supabase database...',
    });

    try {
      const payload = {
        ...val,
        hero_badge: heroBadge.trim(),
        hero_title: heroTitle.trim(),
        hero_banner_image: heroImage.trim(),
        hero_image: heroImage.trim(),
        lead_description: leadDescription.trim(),
      };

      const { error } = await supabase.from('site_settings').upsert(
        { key: 'news_events_settings', value: payload, is_public: true },
        { onConflict: 'key' }
      );
      if (error) throw error;

      showAlert?.({
        type: 'success',
        title: 'News Page Saved',
        message: 'Content updated and live on website.',
        websiteUrl: 'http://localhost:3000/news',
        websiteLabel: 'View News Page',
      });
      notify('News page updated.');
      await onRefresh();
    } catch (err: any) {
      showAlert?.({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Error occurred while saving.',
      });
      notify(err.message, true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 p-6 rounded-xl flex items-center justify-between">
        <div>
          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-xs uppercase tracking-wider rounded">
            Website Page Editor
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-[#E6A500]" />
            News & Stories Page Content
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Edit the hero banner, titles, and introduction for the /news page.
          </p>
        </div>
        <a
          href="http://localhost:3000/news"
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1.5"
        >
          <ExternalLink className="w-4 h-4" />
          Preview Live Page
        </a>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-gray-200 p-6 rounded-xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Hero Badge / Tag
            </label>
            <input
              type="text"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Hero Page Title
            </label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-bold"
            />
          </div>
        </div>

        <HeroBannerImageUploader
          imageUrl={heroImage}
          onImageChange={setHeroImage}
          supabase={supabase}
          showAlert={showAlert}
          notify={notify}
        />

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Lead Introduction Description
          </label>
          <textarea
            rows={4}
            value={leadDescription}
            onChange={(e) => setLeadDescription(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black leading-relaxed"
          />
        </div>

        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 text-xs font-bold text-black bg-[#E6A500] hover:bg-[#d49700] rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save News Page Content'}
          </button>
        </div>
      </form>
    </div>
  );
}

// =============================================================================
// 4. PUBLICATIONS & POLICIES PAGE EDITOR MODULE (/resources)
// =============================================================================
export function PublicationsPageModule({
  siteSettings,
  media,
  onRefresh,
  notify,
  showAlert,
}: PageModuleBaseProps) {
  const existingSetting =
    siteSettings.find((s) => getSettingKey(s) === 'resources_page_settings') ||
    siteSettings.find((s) => getSettingKey(s) === 'publications_page_settings');
  const rawVal = getSettingValue(existingSetting);
  const isConfigured = rawVal !== undefined && rawVal !== null && typeof rawVal === 'object';
  const val = isConfigured ? rawVal : {};

  const [heroBadge, setHeroBadge] = useState(
    isConfigured ? (val.hero_badge ?? '') : 'Accountability & Learning'
  );
  const [heroTitle, setHeroTitle] = useState(
    isConfigured ? (val.hero_title ?? '') : 'Resources, Reports & Policies'
  );
  const [heroImage, setHeroImage] = useState(
    isConfigured
      ? (val.hero_image || val.hero_banner_image || '')
      : '/media/public/images/organization/hero3.webp'
  );
  const [leadTitle, setLeadTitle] = useState(
    isConfigured ? (val.lead_title ?? '') : 'Institutional Transparency, Safeguarding Policies & Field Publications'
  );
  const [leadDescription, setLeadDescription] = useState(
    isConfigured
      ? (val.lead_description ?? '')
      : 'Babawatoto Centre for Children and Youth Trust (BAO) is committed to absolute governance transparency and child safeguarding integrity. Browse and download verified annual reports, child protection guidelines, and MEL evaluations.'
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existingSetting) {
      const v = getSettingValue(existingSetting);
      if (v && typeof v === 'object') {
        if (v.hero_badge !== undefined) setHeroBadge(v.hero_badge);
        if (v.hero_title !== undefined) setHeroTitle(v.hero_title);
        if (v.hero_image !== undefined || v.hero_banner_image !== undefined) {
          setHeroImage(v.hero_image || v.hero_banner_image || '');
        }
        if (v.lead_title !== undefined) setLeadTitle(v.lead_title);
        if (v.lead_description !== undefined) setLeadDescription(v.lead_description);
      }
    }
  }, [siteSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    showAlert?.({
      type: 'loading',
      title: 'Saving Publications Page Content...',
      message: 'Persisting changes to Supabase database...',
    });

    try {
      const payload = {
        ...val,
        hero_badge: heroBadge.trim(),
        hero_title: heroTitle.trim(),
        hero_image: heroImage.trim(),
        hero_banner_image: heroImage.trim(),
        lead_title: leadTitle.trim(),
        lead_description: leadDescription.trim(),
      };

      // Upsert to both keys so any consumer finds it
      const [r1, r2] = await Promise.all([
        supabase.from('site_settings').upsert(
          { key: 'resources_page_settings', value: payload, is_public: true },
          { onConflict: 'key' }
        ),
        supabase.from('site_settings').upsert(
          { key: 'publications_page_settings', value: payload, is_public: true },
          { onConflict: 'key' }
        ),
      ]);
      if (r1.error) throw r1.error;
      if (r2.error) throw r2.error;

      showAlert?.({
        type: 'success',
        title: 'Publications Page Saved',
        message: 'Content updated and live on website.',
        websiteUrl: 'http://localhost:3000/resources',
        websiteLabel: 'View Resources Page',
      });
      notify('Publications page updated.');
      await onRefresh();
    } catch (err: any) {
      showAlert?.({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Error occurred while saving.',
      });
      notify(err.message, true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 p-6 rounded-xl flex items-center justify-between">
        <div>
          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-xs uppercase tracking-wider rounded">
            Website Page Editor
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#E6A500]" />
            Publications & Policies Page Content
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Edit the hero banner, titles, and lead narrative for the /resources page.
          </p>
        </div>
        <a
          href="http://localhost:3000/resources"
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1.5"
        >
          <ExternalLink className="w-4 h-4" />
          Preview Live Page
        </a>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-gray-200 p-6 rounded-xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Hero Badge / Tag
            </label>
            <input
              type="text"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Hero Page Title
            </label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-bold"
            />
          </div>
        </div>

        <HeroBannerImageUploader
          imageUrl={heroImage}
          onImageChange={setHeroImage}
          supabase={supabase}
          showAlert={showAlert}
          notify={notify}
        />

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Lead Section Title
          </label>
          <input
            type="text"
            value={leadTitle}
            onChange={(e) => setLeadTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Lead Narrative Description
          </label>
          <textarea
            rows={4}
            value={leadDescription}
            onChange={(e) => setLeadDescription(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black leading-relaxed"
          />
        </div>

        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 text-xs font-bold text-black bg-[#E6A500] hover:bg-[#d49700] rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Publications Page'}
          </button>
        </div>
      </form>
    </div>
  );
}

// =============================================================================
// 5. GET INVOLVED / VOLUNTEER PAGE EDITOR MODULE (/get-involved)
// =============================================================================
export function GetInvolvedPageModule({
  siteSettings,
  media,
  onRefresh,
  notify,
  showAlert,
}: PageModuleBaseProps) {
  const existingSetting =
    siteSettings.find((s) => getSettingKey(s) === 'get_involved_settings') ||
    siteSettings.find((s) => getSettingKey(s) === 'get_involved_page_settings');
  const rawVal = getSettingValue(existingSetting);
  const isConfigured = rawVal !== undefined && rawVal !== null && typeof rawVal === 'object';
  const val = isConfigured ? rawVal : {};

  const [heroBadge, setHeroBadge] = useState(
    isConfigured ? (val.hero_badge ?? '') : 'Take Action With Us'
  );
  const [heroTitle, setHeroTitle] = useState(
    isConfigured ? (val.hero_title ?? '') : 'Get Involved & Volunteer'
  );
  const [heroImage, setHeroImage] = useState(
    isConfigured
      ? (val.hero_image || val.hero_banner_image || '')
      : '/media/public/images/projects/WATOTO.webp'
  );
  const [leadTitle, setLeadTitle] = useState(
    isConfigured ? (val.lead_title ?? '') : 'Join Our Mission to Protect and Empower Tanzanian Children'
  );
  const [leadDescription, setLeadDescription] = useState(
    isConfigured
      ? (val.lead_description ?? '')
      : 'Whether you are an individual volunteer, community mentor, educator, or institutional donor, your contribution makes a direct difference in restoring dignity to street-connected children.'
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existingSetting) {
      const v = getSettingValue(existingSetting);
      if (v && typeof v === 'object') {
        if (v.hero_badge !== undefined) setHeroBadge(v.hero_badge);
        if (v.hero_title !== undefined) setHeroTitle(v.hero_title);
        if (v.hero_image !== undefined || v.hero_banner_image !== undefined) {
          setHeroImage(v.hero_image || v.hero_banner_image || '');
        }
        if (v.lead_title !== undefined) setLeadTitle(v.lead_title);
        if (v.lead_description !== undefined) setLeadDescription(v.lead_description);
      }
    }
  }, [siteSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    showAlert?.({
      type: 'loading',
      title: 'Saving Get Involved Page Content...',
      message: 'Persisting changes to Supabase database...',
    });

    try {
      const payload = {
        ...val,
        hero_badge: heroBadge.trim(),
        hero_title: heroTitle.trim(),
        hero_image: heroImage.trim(),
        hero_banner_image: heroImage.trim(),
        lead_title: leadTitle.trim(),
        lead_description: leadDescription.trim(),
      };

      const [r1, r2] = await Promise.all([
        supabase.from('site_settings').upsert(
          { key: 'get_involved_page_settings', value: payload, is_public: true },
          { onConflict: 'key' }
        ),
        supabase.from('site_settings').upsert(
          { key: 'get_involved_settings', value: payload, is_public: true },
          { onConflict: 'key' }
        ),
      ]);
      if (r1.error) throw r1.error;
      if (r2.error) throw r2.error;
      if (error) throw error;

      showAlert?.({
        type: 'success',
        title: 'Get Involved Page Saved',
        message: 'Content updated and live on website.',
        websiteUrl: 'http://localhost:3000/get-involved',
        websiteLabel: 'View Get Involved Page',
      });
      notify('Get Involved page updated.');
      await onRefresh();
    } catch (err: any) {
      showAlert?.({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Error occurred while saving.',
      });
      notify(err.message, true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 p-6 rounded-xl flex items-center justify-between">
        <div>
          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-xs uppercase tracking-wider rounded">
            Website Page Editor
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-[#E6A500]" />
            Get Involved / Volunteer Page Content
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Edit the hero banner, titles, and introduction narrative for the /get-involved page.
          </p>
        </div>
        <a
          href="http://localhost:3000/get-involved"
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1.5"
        >
          <ExternalLink className="w-4 h-4" />
          Preview Live Page
        </a>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-gray-200 p-6 rounded-xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Hero Badge / Tag
            </label>
            <input
              type="text"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Hero Page Title
            </label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-bold"
            />
          </div>
        </div>

        <HeroBannerImageUploader
          imageUrl={heroImage}
          onImageChange={setHeroImage}
          supabase={supabase}
          showAlert={showAlert}
          notify={notify}
        />

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Lead Section Title
          </label>
          <input
            type="text"
            value={leadTitle}
            onChange={(e) => setLeadTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Lead Narrative Description
          </label>
          <textarea
            rows={4}
            value={leadDescription}
            onChange={(e) => setLeadDescription(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black leading-relaxed"
          />
        </div>

        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 text-xs font-bold text-black bg-[#E6A500] hover:bg-[#d49700] rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Get Involved Page'}
          </button>
        </div>
      </form>
    </div>
  );
}

// =============================================================================
// 6. CONTACT US PAGE EDITOR MODULE (/contact)
// =============================================================================
export function ContactPageModule({
  siteSettings,
  media,
  onRefresh,
  notify,
  showAlert,
}: PageModuleBaseProps) {
  const existingOrgSetting = siteSettings.find((s) => getSettingKey(s) === 'organization_profile');
  const org = getSettingValue(existingOrgSetting) || {};

  const existingContactSetting = siteSettings.find((s) => getSettingKey(s) === 'contact_page_settings');
  const rawContactVal = getSettingValue(existingContactSetting);
  const isConfigured = rawContactVal !== undefined && rawContactVal !== null && typeof rawContactVal === 'object';
  const val = isConfigured ? rawContactVal : {};

  const existingContactDetailsSetting = siteSettings.find((s) => getSettingKey(s) === 'contact_details');
  const contactDetails = getSettingValue(existingContactDetailsSetting) || {};

  const [heroBadge, setHeroBadge] = useState(
    isConfigured ? (val.hero_badge ?? '') : 'Get in Touch'
  );
  const [heroTitle, setHeroTitle] = useState(
    isConfigured ? (val.hero_title ?? '') : 'Contact Babawatoto Organization'
  );
  const [heroImage, setHeroImage] = useState(
    isConfigured
      ? (val.hero_image || val.hero_banner_image || '')
      : '/media/public/images/organization/hero2.webp'
  );
  const [leadTitle, setLeadTitle] = useState(
    isConfigured ? (val.lead_title ?? '') : 'Reach Our Social Welfare Team, Project Office & Management'
  );
  const [leadDescription, setLeadDescription] = useState(
    isConfigured
      ? (val.lead_description ?? '')
      : 'We welcome inquiries from community members, families needing safeguarding assistance, prospective volunteers, and institutional partners.'
  );

  // Contact Details
  const [address, setAddress] = useState(
    org.physical_address || contactDetails.street_address || contactDetails.physical_address_en || 'Mburahati Barafu, Ubungo, Dar es Salaam, Tanzania'
  );
  const [phone, setPhone] = useState(
    org.primary_phone || contactDetails.primary_phone || '+255 754 282 474'
  );
  const [email, setEmail] = useState(
    org.primary_email || contactDetails.primary_email || 'info@babawatoto.or.tz'
  );
  const [hours, setHours] = useState(
    val.office_hours || contactDetails.office_hours || 'Monday – Friday: 8:00 AM – 5:00 PM (EAT)'
  );
  const [emergencyPhone, setEmergencyPhone] = useState(
    val.emergency_phone || contactDetails.emergency_phone || '+255 784 555 123'
  );

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existingContactSetting) {
      const v = getSettingValue(existingContactSetting);
      if (v && typeof v === 'object') {
        if (v.hero_badge !== undefined) setHeroBadge(v.hero_badge);
        if (v.hero_title !== undefined) setHeroTitle(v.hero_title);
        if (v.hero_image !== undefined || v.hero_banner_image !== undefined) {
          setHeroImage(v.hero_image || v.hero_banner_image || '');
        }
        if (v.lead_title !== undefined) setLeadTitle(v.lead_title);
        if (v.lead_description !== undefined) setLeadDescription(v.lead_description);
        if (v.office_hours !== undefined) setHours(v.office_hours);
        if (v.emergency_phone !== undefined) setEmergencyPhone(v.emergency_phone);
      }
    }
  }, [siteSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    showAlert?.({
      type: 'loading',
      title: 'Saving Contact Page Content...',
      message: 'Persisting changes to Supabase database...',
    });

    try {
      const contactPayload = {
        ...val,
        hero_badge: heroBadge.trim(),
        hero_title: heroTitle.trim(),
        hero_image: heroImage.trim(),
        hero_banner_image: heroImage.trim(),
        lead_title: leadTitle.trim(),
        lead_description: leadDescription.trim(),
        office_hours: hours.trim(),
        emergency_phone: emergencyPhone.trim(),
      };

      const orgPayload = {
        ...org,
        physical_address: address.trim(),
        primary_phone: phone.trim(),
        primary_email: email.trim(),
      };

      const detailsPayload = {
        ...contactDetails,
        street_address: address.trim(),
        physical_address_en: address.trim(),
        primary_phone: phone.trim(),
        primary_email: email.trim(),
        office_hours: hours.trim(),
        emergency_phone: emergencyPhone.trim(),
      };

      const [res1, res2, res3] = await Promise.all([
        supabase.from('site_settings').upsert(
          { key: 'contact_page_settings', value: contactPayload, is_public: true },
          { onConflict: 'key' }
        ),
        supabase.from('site_settings').upsert(
          { key: 'organization_profile', value: orgPayload, is_public: true },
          { onConflict: 'key' }
        ),
        supabase.from('site_settings').upsert(
          { key: 'contact_details', value: detailsPayload, is_public: true },
          { onConflict: 'key' }
        ),
      ]);

      if (res1.error) throw res1.error;
      if (res2.error) throw res2.error;
      if (res3.error) throw res3.error;

      showAlert?.({
        type: 'success',
        title: 'Contact Page Saved',
        message: 'Contact details and page content updated and live on website.',
        websiteUrl: 'http://localhost:3000/contact',
        websiteLabel: 'View Contact Page',
      });
      notify('Contact page updated.');
      await onRefresh();
    } catch (err: any) {
      showAlert?.({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Error occurred while saving.',
      });
      notify(err.message, true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 p-6 rounded-xl flex items-center justify-between">
        <div>
          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-xs uppercase tracking-wider rounded">
            Website Page Editor
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
            <PhoneCall className="w-6 h-6 text-[#E6A500]" />
            Contact Us Page Content
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Edit office address, phone numbers, email, hours, and banner narrative for /contact.
          </p>
        </div>
        <a
          href="http://localhost:3000/contact"
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1.5"
        >
          <ExternalLink className="w-4 h-4" />
          Preview Live Page
        </a>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-gray-200 p-6 rounded-xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Hero Badge / Tag
            </label>
            <input
              type="text"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Hero Page Title
            </label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-bold"
            />
          </div>
        </div>

        <HeroBannerImageUploader
          imageUrl={heroImage}
          onImageChange={setHeroImage}
          supabase={supabase}
          showAlert={showAlert}
          notify={notify}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#E6A500]" />
              Physical Office Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-[#E6A500]" />
              Primary Contact Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#E6A500]" />
              Official Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#E6A500]" />
              Working Hours
            </label>
            <input
              type="text"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Lead Narrative Description
          </label>
          <textarea
            rows={4}
            value={leadDescription}
            onChange={(e) => setLeadDescription(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black leading-relaxed"
          />
        </div>

        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 text-xs font-bold text-black bg-[#E6A500] hover:bg-[#d49700] rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Contact Details'}
          </button>
        </div>
      </form>
    </div>
  );
}

