import React, { useState, useEffect, useRef } from 'react';
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
  Phone,
  MapPin,
  Mail,
  Clock,
  Image as ImageIcon,
  Plus,
  Trash2,
  Link as LinkIcon,
  Globe,
} from 'lucide-react';
import { supabase } from '../supabase.js';
import { type SweetAlertOptions } from './SweetAlertModal.js';
import { HeroBannerImageUploader } from './HeroBannerImageUploader.js';
import { broadcastLivePublish, AutoSaveStatusBadge, type AutoSaveStatus } from '../lib/liveSync.js';

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
  const [autoStatus, setAutoStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isLoadedRef = useRef(false);
  const autoSaveTimerRef = useRef<any>(null);

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

  const handleSave = async (e?: React.FormEvent, isManual = true) => {
    if (e) e.preventDefault();
    if (isManual) {
      setIsSaving(true);
      showAlert?.({
        type: 'loading',
        title: 'Saving Programmes Page Content...',
        message: 'Persisting changes to Supabase database...',
      });
    } else {
      setAutoStatus('saving');
    }

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

      broadcastLivePublish({ module: 'programmes_page_settings', key: 'programmes_page_settings' });
      setAutoStatus('saved');
      setLastSaved(new Date());

      if (isManual) {
        showAlert?.({
          type: 'success',
          title: 'Programmes Page Saved',
          message: 'Content updated and live on website.',
          websiteUrl: 'http://localhost:3000/programmes',
          websiteLabel: 'View Programmes Page',
        });
        notify('Programmes page updated.');
        await onRefresh();
      }
    } catch (err: any) {
      if (isManual) {
        showAlert?.({
          type: 'error',
          title: 'Save Failed',
          message: err.message || 'Error occurred while saving.',
        });
        notify(err.message, true);
      } else {
        setAutoStatus('error');
      }
    } finally {
      if (isManual) setIsSaving(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      isLoadedRef.current = true;
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    setAutoStatus('saving');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(undefined, false);
    }, 1200);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [heroBadge, heroTitle, heroImage, leadTitle, leadDescription]);

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
        <div className="flex items-center gap-3 flex-wrap">
          <AutoSaveStatusBadge status={autoStatus} lastSaved={lastSaved} />
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

        <div className="pt-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-3">
          <AutoSaveStatusBadge status={autoStatus} lastSaved={lastSaved} />
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
  const [autoStatus, setAutoStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isLoadedRef = useRef(false);
  const autoSaveTimerRef = useRef<any>(null);

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

  const handleSave = async (e?: React.FormEvent, isManual = true) => {
    if (e) e.preventDefault();
    if (isManual) {
      setIsSaving(true);
      showAlert?.({
        type: 'loading',
        title: 'Saving Projects Page Content...',
        message: 'Persisting changes to Supabase database...',
      });
    } else {
      setAutoStatus('saving');
    }

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

      broadcastLivePublish({ module: 'projects_page_settings', key: 'projects_page_settings' });
      setAutoStatus('saved');
      setLastSaved(new Date());

      if (isManual) {
        showAlert?.({
          type: 'success',
          title: 'Projects Page Saved',
          message: 'Content updated and live on website.',
          websiteUrl: 'http://localhost:3000/projects',
          websiteLabel: 'View Projects Page',
        });
        notify('Projects page updated.');
        await onRefresh();
      }
    } catch (err: any) {
      if (isManual) {
        showAlert?.({
          type: 'error',
          title: 'Save Failed',
          message: err.message || 'Error occurred while saving.',
        });
        notify(err.message, true);
      } else {
        setAutoStatus('error');
      }
    } finally {
      if (isManual) setIsSaving(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      isLoadedRef.current = true;
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    setAutoStatus('saving');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(undefined, false);
    }, 1200);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [heroBadge, heroTitle, heroImage, leadTitle, leadDescription]);

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
        <div className="flex items-center gap-3 flex-wrap">
          <AutoSaveStatusBadge status={autoStatus} lastSaved={lastSaved} />
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

        <div className="pt-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-3">
          <AutoSaveStatusBadge status={autoStatus} lastSaved={lastSaved} />
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
  const [autoStatus, setAutoStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isLoadedRef = useRef(false);
  const autoSaveTimerRef = useRef<any>(null);

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

  const handleSave = async (e?: React.FormEvent, isManual = true) => {
    if (e) e.preventDefault();
    if (isManual) {
      setIsSaving(true);
      showAlert?.({
        type: 'loading',
        title: 'Saving News Page Content...',
        message: 'Persisting changes to Supabase database...',
      });
    } else {
      setAutoStatus('saving');
    }

    try {
      const payload = {
        ...val,
        hero_badge: heroBadge.trim(),
        hero_title: heroTitle.trim(),
        hero_banner_image: heroImage.trim(),
        hero_image: heroImage.trim(),
        lead_description: leadDescription.trim(),
      };

      const [res1, res2] = await Promise.all([
        supabase.from('site_settings').upsert(
          { key: 'news_events_settings', value: payload, is_public: true },
          { onConflict: 'key' }
        ),
        supabase.from('site_settings').upsert(
          { key: 'news_page_settings', value: payload, is_public: true },
          { onConflict: 'key' }
        ),
      ]);
      if (res1.error) throw res1.error;
      if (res2.error) throw res2.error;

      broadcastLivePublish({ module: 'news_page_settings', key: 'news_page_settings' });
      setAutoStatus('saved');
      setLastSaved(new Date());

      if (isManual) {
        showAlert?.({
          type: 'success',
          title: 'News Page Saved',
          message: 'Content updated and live on website.',
          websiteUrl: 'http://localhost:3000/news',
          websiteLabel: 'View News Page',
        });
        notify('News page updated.');
        await onRefresh();
      }
    } catch (err: any) {
      if (isManual) {
        showAlert?.({
          type: 'error',
          title: 'Save Failed',
          message: err.message || 'Error occurred while saving.',
        });
        notify(err.message, true);
      } else {
        setAutoStatus('error');
      }
    } finally {
      if (isManual) setIsSaving(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      isLoadedRef.current = true;
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    setAutoStatus('saving');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(undefined, false);
    }, 1200);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [heroBadge, heroTitle, heroImage, leadDescription]);

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
        <div className="flex items-center gap-3 flex-wrap">
          <AutoSaveStatusBadge status={autoStatus} lastSaved={lastSaved} />
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

        <div className="pt-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-3">
          <AutoSaveStatusBadge status={autoStatus} lastSaved={lastSaved} />
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
  const [autoStatus, setAutoStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isLoadedRef = useRef(false);
  const autoSaveTimerRef = useRef<any>(null);

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

  const handleSave = async (e?: React.FormEvent, isManual = true) => {
    if (e) e.preventDefault();
    if (isManual) {
      setIsSaving(true);
      showAlert?.({
        type: 'loading',
        title: 'Saving Publications Page Content...',
        message: 'Persisting changes to Supabase database...',
      });
    } else {
      setAutoStatus('saving');
    }

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

      broadcastLivePublish({ module: 'resources_page_settings', key: 'resources_page_settings' });
      setAutoStatus('saved');
      setLastSaved(new Date());

      if (isManual) {
        showAlert?.({
          type: 'success',
          title: 'Publications Page Saved',
          message: 'Content updated and live on website.',
          websiteUrl: 'http://localhost:3000/resources',
          websiteLabel: 'View Resources Page',
        });
        notify('Publications page updated.');
        await onRefresh();
      }
    } catch (err: any) {
      if (isManual) {
        showAlert?.({
          type: 'error',
          title: 'Save Failed',
          message: err.message || 'Error occurred while saving.',
        });
        notify(err.message, true);
      } else {
        setAutoStatus('error');
      }
    } finally {
      if (isManual) setIsSaving(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      isLoadedRef.current = true;
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    setAutoStatus('saving');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(undefined, false);
    }, 1200);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [heroBadge, heroTitle, heroImage, leadTitle, leadDescription]);

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
        <div className="flex items-center gap-3 flex-wrap">
          <AutoSaveStatusBadge status={autoStatus} lastSaved={lastSaved} />
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

        <div className="pt-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-3">
          <AutoSaveStatusBadge status={autoStatus} lastSaved={lastSaved} />
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
  const [autoStatus, setAutoStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isLoadedRef = useRef(false);
  const autoSaveTimerRef = useRef<any>(null);

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

  const handleSave = async (e?: React.FormEvent, isManual = true) => {
    if (e) e.preventDefault();
    if (isManual) {
      setIsSaving(true);
      showAlert?.({
        type: 'loading',
        title: 'Saving Get Involved Page Content...',
        message: 'Persisting changes to Supabase database...',
      });
    } else {
      setAutoStatus('saving');
    }

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

      broadcastLivePublish({ module: 'get_involved_page_settings', key: 'get_involved_page_settings' });
      setAutoStatus('saved');
      setLastSaved(new Date());

      if (isManual) {
        showAlert?.({
          type: 'success',
          title: 'Get Involved Page Saved',
          message: 'Content updated and live on website.',
          websiteUrl: 'http://localhost:3000/get-involved',
          websiteLabel: 'View Get Involved Page',
        });
        notify('Get Involved page updated.');
        await onRefresh();
      }
    } catch (err: any) {
      if (isManual) {
        showAlert?.({
          type: 'error',
          title: 'Save Failed',
          message: err.message || 'Error occurred while saving.',
        });
        notify(err.message, true);
      } else {
        setAutoStatus('error');
      }
    } finally {
      if (isManual) setIsSaving(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      isLoadedRef.current = true;
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    setAutoStatus('saving');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(undefined, false);
    }, 1200);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [heroBadge, heroTitle, heroImage, leadTitle, leadDescription]);

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
        <div className="flex items-center gap-3 flex-wrap">
          <AutoSaveStatusBadge status={autoStatus} lastSaved={lastSaved} />
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

        <div className="pt-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-3">
          <AutoSaveStatusBadge status={autoStatus} lastSaved={lastSaved} />
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

  // Contact Details & Multiple Items Lists
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

  // Multi-item phone numbers list
  const [phonesList, setPhonesList] = useState<Array<{ title: string; number: string }>>(() => {
    if (Array.isArray(val.phones_list) && val.phones_list.length > 0) return val.phones_list;
    if (Array.isArray(contactDetails.phones_list) && contactDetails.phones_list.length > 0) return contactDetails.phones_list;
    const initial = [];
    if (org.primary_phone || contactDetails.primary_phone) {
      initial.push({ title: 'Main Office', number: org.primary_phone || contactDetails.primary_phone });
    } else {
      initial.push({ title: 'Main Office', number: '+255 754 282 474' });
    }
    if (val.emergency_phone || contactDetails.emergency_phone) {
      initial.push({ title: 'Child Protection Helpline', number: val.emergency_phone || contactDetails.emergency_phone });
    }
    return initial;
  });
  const [newPhoneTitle, setNewPhoneTitle] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');

  // Multi-item emails / contact departments list
  const [emailsList, setEmailsList] = useState<Array<{ title: string; email: string }>>(() => {
    if (Array.isArray(val.emails_list) && val.emails_list.length > 0) return val.emails_list;
    if (Array.isArray(contactDetails.emails_list) && contactDetails.emails_list.length > 0) return contactDetails.emails_list;
    const initial = [];
    if (org.primary_email || contactDetails.primary_email) {
      initial.push({ title: 'General Inquiries', email: org.primary_email || contactDetails.primary_email });
    } else {
      initial.push({ title: 'General Inquiries', email: 'info@babawatoto.or.tz' });
    }
    return initial;
  });
  const [newEmailTitle, setNewEmailTitle] = useState('');
  const [newEmailAddress, setNewEmailAddress] = useState('');

  // Multi-item physical addresses list
  const [addressesList, setAddressesList] = useState<Array<{ title: string; address: string }>>(() => {
    if (Array.isArray(val.addresses_list) && val.addresses_list.length > 0) return val.addresses_list;
    if (Array.isArray(contactDetails.addresses_list) && contactDetails.addresses_list.length > 0) return contactDetails.addresses_list;
    return [
      {
        title: 'Head Office & Centre',
        address: org.physical_address || contactDetails.street_address || contactDetails.physical_address_en || 'St. Anne Marie Street, House No. 27, Morogoro Road, Mbezi Kwa Msuguri, Dar es Salaam, Tanzania',
      },
    ];
  });
  const [newAddressTitle, setNewAddressTitle] = useState('');
  const [newAddressText, setNewAddressText] = useState('');

  // Multi-item links list (Link Title & Link URL)
  const [linksList, setLinksList] = useState<Array<{ title: string; url: string }>>(() => {
    if (Array.isArray(val.links_list) && val.links_list.length > 0) return val.links_list;
    if (Array.isArray(contactDetails.links) && contactDetails.links.length > 0) return contactDetails.links;
    return [
      { title: 'Babawatoto Official Portal', url: 'https://babawatoto.or.tz' },
      { title: 'Child Safeguarding Policy', url: 'https://babawatoto.or.tz/safeguarding' },
    ];
  });
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [autoStatus, setAutoStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isLoadedRef = useRef(false);
  const autoSaveTimerRef = useRef<any>(null);

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
        if (Array.isArray(v.phones_list)) setPhonesList(v.phones_list);
        if (Array.isArray(v.emails_list)) setEmailsList(v.emails_list);
        if (Array.isArray(v.addresses_list)) setAddressesList(v.addresses_list);
        if (Array.isArray(v.links_list)) setLinksList(v.links_list);
      }
    }
  }, [siteSettings]);

  const handleAddPhone = () => {
    if (!newPhoneNumber.trim()) {
      notify('Please enter a phone number', true);
      return;
    }
    const updated = [...phonesList, { title: newPhoneTitle.trim() || 'Office Phone', number: newPhoneNumber.trim() }];
    setPhonesList(updated);
    setNewPhoneTitle('');
    setNewPhoneNumber('');
  };

  const handleRemovePhone = (index: number) => {
    setPhonesList(phonesList.filter((_, i) => i !== index));
  };

  const handleAddEmail = () => {
    if (!newEmailAddress.trim()) {
      notify('Please enter an email address', true);
      return;
    }
    const updated = [...emailsList, { title: newEmailTitle.trim() || 'General Department', email: newEmailAddress.trim() }];
    setEmailsList(updated);
    setNewEmailTitle('');
    setNewEmailAddress('');
  };

  const handleRemoveEmail = (index: number) => {
    setEmailsList(emailsList.filter((_, i) => i !== index));
  };

  const handleAddAddress = () => {
    if (!newAddressText.trim()) {
      notify('Please enter address details', true);
      return;
    }
    const updated = [...addressesList, { title: newAddressTitle.trim() || 'Office Location', address: newAddressText.trim() }];
    setAddressesList(updated);
    setNewAddressTitle('');
    setNewAddressText('');
  };

  const handleRemoveAddress = (index: number) => {
    setAddressesList(addressesList.filter((_, i) => i !== index));
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) {
      notify('Please enter a link URL', true);
      return;
    }
    const updated = [...linksList, { title: newLinkTitle.trim() || newLinkUrl.trim(), url: newLinkUrl.trim() }];
    setLinksList(updated);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (index: number) => {
    setLinksList(linksList.filter((_, i) => i !== index));
  };

  const handleSave = async (e?: React.FormEvent, isManual = true) => {
    if (e) e.preventDefault();
    if (isManual) {
      setIsSaving(true);
      showAlert?.({
        type: 'loading',
        title: 'Saving Contact Page Content...',
        message: 'Persisting changes to Supabase database...',
      });
    } else {
      setAutoStatus('saving');
    }

    try {
      const primaryPhoneVal = phonesList[0]?.number || phone.trim();
      const primaryEmailVal = emailsList[0]?.email || email.trim();
      const primaryAddressVal = addressesList[0]?.address || address.trim();

      const contactPayload = {
        ...val,
        hero_badge: heroBadge.trim(),
        hero_title: heroTitle.trim(),
        hero_image: heroImage.trim(),
        hero_banner_image: heroImage.trim(),
        lead_title: leadTitle.trim(),
        lead_description: leadDescription.trim(),
        office_hours: hours.trim(),
        emergency_phone: phonesList[1]?.number || emergencyPhone.trim(),
        phones_list: phonesList,
        emails_list: emailsList,
        addresses_list: addressesList,
        links_list: linksList,
        links: linksList,
      };

      const orgPayload = {
        ...org,
        physical_address: primaryAddressVal,
        primary_phone: primaryPhoneVal,
        primary_email: primaryEmailVal,
        phones_list: phonesList,
        emails_list: emailsList,
        addresses_list: addressesList,
        links: linksList,
      };

      const detailsPayload = {
        ...contactDetails,
        street_address: primaryAddressVal,
        physical_address_en: primaryAddressVal,
        primary_phone: primaryPhoneVal,
        primary_email: primaryEmailVal,
        office_hours: hours.trim(),
        emergency_phone: phonesList[1]?.number || emergencyPhone.trim(),
        phones: phonesList.map((p) => p.number),
        phones_list: phonesList,
        emails_list: emailsList,
        addresses_list: addressesList,
        links: linksList,
        links_list: linksList,
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

      broadcastLivePublish({ module: 'contact_page_settings', key: 'contact_page_settings' });
      setAutoStatus('saved');
      setLastSaved(new Date());

      if (isManual) {
        showAlert?.({
          type: 'success',
          title: 'Contact Page Saved',
          message: 'Contact details and page content updated and live on website.',
          websiteUrl: 'http://localhost:3000/contact',
          websiteLabel: 'View Contact Page',
        });
        notify('Contact page updated.');
        await onRefresh();
      }
    } catch (err: any) {
      if (isManual) {
        showAlert?.({
          type: 'error',
          title: 'Save Failed',
          message: err.message || 'Error occurred while saving.',
        });
        notify(err.message, true);
      } else {
        setAutoStatus('error');
      }
    } finally {
      if (isManual) setIsSaving(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      isLoadedRef.current = true;
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    setAutoStatus('saving');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(undefined, false);
    }, 1200);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [heroBadge, heroTitle, heroImage, leadTitle, leadDescription, hours, emergencyPhone, phonesList, emailsList, addressesList, linksList]);

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
            Manage contact channels, multiple phone numbers, department emails, physical locations, and official links.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <AutoSaveStatusBadge status={autoStatus} lastSaved={lastSaved} />
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
      </div>

      <form onSubmit={handleSave} className="bg-white border border-gray-200 p-6 rounded-xl space-y-6">
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

        {/* 1. MULTIPLE PHONE NUMBERS SECTION */}
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-900 uppercase flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-[#E6A500]" />
              Phone Numbers ({phonesList.length})
            </label>
            <span className="text-[11px] text-gray-500">You can add multiple phone numbers with labels</span>
          </div>

          {/* Add Phone Form */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end bg-white p-3 rounded-lg border border-gray-200">
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Phone Title / Label *</label>
              <input
                type="text"
                placeholder="e.g. Main Office, Helpline, Executive Line"
                value={newPhoneTitle}
                onChange={(e) => setNewPhoneTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Phone Number *</label>
              <input
                type="text"
                placeholder="e.g. +255 754 282 474"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-mono"
              />
            </div>
            <div className="sm:col-span-3">
              <button
                type="button"
                onClick={handleAddPhone}
                className="w-full py-2 bg-[#E6A500] hover:bg-[#d49700] text-black font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Phone
              </button>
            </div>
          </div>

          {/* Phone Numbers List */}
          {phonesList.length > 0 ? (
            <div className="space-y-2 pt-1">
              {phonesList.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-2.5 bg-white border border-gray-200 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Phone className="w-3.5 h-3.5 text-[#E6A500] shrink-0" />
                    <span className="font-bold text-gray-900 bg-amber-50 text-amber-900 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                      {p.title}
                    </span>
                    <span className="font-mono text-gray-800">{p.number}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePhone(idx)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded transition"
                    title="Remove phone number"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic py-1">No phone numbers added yet. Add at least one above.</p>
          )}
        </div>

        {/* 2. MULTIPLE CONTACT EMAILS SECTION */}
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-900 uppercase flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-[#E6A500]" />
              Official Emails &amp; Contact Departments ({emailsList.length})
            </label>
            <span className="text-[11px] text-gray-500">You can add multiple department or contact emails</span>
          </div>

          {/* Add Email Form */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end bg-white p-3 rounded-lg border border-gray-200">
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Contact Title / Department *</label>
              <input
                type="text"
                placeholder="e.g. General Inquiries, Partnerships, Welfare Desk"
                value={newEmailTitle}
                onChange={(e) => setNewEmailTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Email Address *</label>
              <input
                type="email"
                placeholder="e.g. info@babawatoto.or.tz"
                value={newEmailAddress}
                onChange={(e) => setNewEmailAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-mono"
              />
            </div>
            <div className="sm:col-span-3">
              <button
                type="button"
                onClick={handleAddEmail}
                className="w-full py-2 bg-[#E6A500] hover:bg-[#d49700] text-black font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Email
              </button>
            </div>
          </div>

          {/* Emails List */}
          {emailsList.length > 0 ? (
            <div className="space-y-2 pt-1">
              {emailsList.map((em, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-2.5 bg-white border border-gray-200 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-[#E6A500] shrink-0" />
                    <span className="font-bold text-gray-900 bg-blue-50 text-blue-900 px-2 py-0.5 rounded text-[11px] border border-blue-200">
                      {em.title}
                    </span>
                    <span className="font-mono text-gray-800">{em.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(idx)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded transition"
                    title="Remove email"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic py-1">No contact emails added yet. Add at least one above.</p>
          )}
        </div>

        {/* 3. MULTIPLE PHYSICAL ADDRESSES SECTION */}
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-900 uppercase flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#E6A500]" />
              Office &amp; Centre Locations ({addressesList.length})
            </label>
            <span className="text-[11px] text-gray-500">You can add multiple physical or field office locations</span>
          </div>

          {/* Add Address Form */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end bg-white p-3 rounded-lg border border-gray-200">
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Location Title *</label>
              <input
                type="text"
                placeholder="e.g. Head Office, Mburahati Children Centre"
                value={newAddressTitle}
                onChange={(e) => setNewAddressTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Address Details *</label>
              <input
                type="text"
                placeholder="e.g. St. Anne Marie Street, House No. 27, Morogoro Road"
                value={newAddressText}
                onChange={(e) => setNewAddressText(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div className="sm:col-span-3">
              <button
                type="button"
                onClick={handleAddAddress}
                className="w-full py-2 bg-[#E6A500] hover:bg-[#d49700] text-black font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Location
              </button>
            </div>
          </div>

          {/* Addresses List */}
          {addressesList.length > 0 ? (
            <div className="space-y-2 pt-1">
              {addressesList.map((ad, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-2.5 bg-white border border-gray-200 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-[#E6A500] shrink-0" />
                    <span className="font-bold text-gray-900 bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded text-[11px] border border-emerald-200 shrink-0">
                      {ad.title}
                    </span>
                    <span className="text-gray-800 truncate">{ad.address}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAddress(idx)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded transition shrink-0"
                    title="Remove address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic py-1">No office locations added yet. Add at least one above.</p>
          )}
        </div>

        {/* 4. MULTIPLE OFFICIAL LINKS SECTION (Link Title & Link URL) */}
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-900 uppercase flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-[#E6A500]" />
              Official Links, Policies &amp; Resources ({linksList.length})
            </label>
            <span className="text-[11px] text-gray-500">Add Link Title and Link URL for public reference</span>
          </div>

          {/* Add Link Form: Link Title first, then Link URL */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end bg-white p-3 rounded-lg border border-gray-200">
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Link Title *</label>
              <input
                type="text"
                placeholder="e.g. Child Safeguarding Policy (PDF), Ministry Portal"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-semibold"
              />
            </div>
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Link URL *</label>
              <input
                type="text"
                placeholder="https://example.org/resource"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={handleAddLink}
                className="w-full py-2 bg-[#E6A500] hover:bg-[#d49700] text-black font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Link
              </button>
            </div>
          </div>

          {/* Links List */}
          {linksList.length > 0 ? (
            <div className="space-y-2 pt-1">
              {linksList.map((lnk, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-2.5 bg-white border border-gray-200 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ExternalLink className="w-3.5 h-3.5 text-[#E6A500] shrink-0" />
                    <span className="font-bold text-gray-900 truncate">{lnk.title}</span>
                    <a
                      href={lnk.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-gray-500 hover:text-black hover:underline truncate text-[11px]"
                    >
                      {lnk.url}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(idx)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded transition shrink-0"
                    title="Remove link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic py-1">No links added yet. Add links using the form above.</p>
          )}
        </div>

        {/* Working Hours */}
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

        {/* Lead Description */}
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

        <div className="pt-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-3">
          <AutoSaveStatusBadge status={autoStatus} lastSaved={lastSaved} />
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

