import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Save,
  Loader2,
  ExternalLink,
  Plus,
  Trash2,
  Image as ImageIcon,
  History,
  Users,
  Heart,
  Edit3,
  ShieldCheck,
  Check,
  X,
  Layers,
  ArrowUp,
  ArrowDown,
  Upload,
} from 'lucide-react';
import { supabase } from '../supabase.js';
import { HeroBannerImageUploader } from './HeroBannerImageUploader.js';
import { broadcastLivePublish, AutoSaveStatusBadge, type AutoSaveStatus } from '../lib/liveSync.js';

export interface SweetAlertOptions {
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  message: string;
  websiteUrl?: string;
  websiteLabel?: string;
  confirmLabel?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

const getSettingKey = (s: any) => s?.key || s?.setting_key;
const getSettingValue = (s: any) => s?.value ?? s?.setting_value;

const stripHtmlForEditing = (val: string) => {
  if (!val) return '';
  return val.replace(/<[^>]+>/g, '').trim();
};

/**
 * 1. OUR VISION & MISSION MODULE
 * "Our driving purpose, core institutional values, and commitment to children"
 */
export function VisionAndMissionModule({
  siteSettings,
  media,
  accessToken,
  onRefresh,
  notify,
  showAlert,
}: {
  siteSettings: any[];
  media: any[];
  accessToken?: string;
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
  showAlert?: (opts: SweetAlertOptions) => void;
}) {
  const existingSetting = siteSettings.find((s) => getSettingKey(s) === 'vision_and_mission');
  const orgSetting = siteSettings.find((s) => getSettingKey(s) === 'organization_profile');
  const rawVmVal = getSettingValue(existingSetting);
  const isConfigured = rawVmVal !== undefined && rawVmVal !== null && typeof rawVmVal === 'object';
  const vmVal = isConfigured ? rawVmVal : {};
  const orgVal = getSettingValue(orgSetting) || {};

  const [saving, setSaving] = useState(false);
  const [autoStatus, setAutoStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isLoadedRef = useRef(false);
  const autoSaveTimerRef = useRef<any>(null);

  // 1. Page Banner
  const [heroBadge, setHeroBadge] = useState(
    isConfigured ? (vmVal.hero_badge ?? '') : 'Babawatoto Strategic Framework'
  );
  const [heading, setHeading] = useState(
    isConfigured ? (vmVal.heading ?? '') : 'Our Mission, Vision & Core Values'
  );
  const [heroImage, setHeroImage] = useState(
    isConfigured ? (vmVal.hero_image ?? '') : '/media/public/images/organization/hero1.webp'
  );

  // 2. Vision & Mission statements
  const [vision, setVision] = useState(
    isConfigured
      ? stripHtmlForEditing(vmVal.vision ?? '')
      : stripHtmlForEditing(
          orgVal.vision_en ||
            'A society where children and youth enjoy their rights and live in dignity, free from all forms of abuse and exploitation.'
        )
  );
  const [mission, setMission] = useState(
    isConfigured
      ? stripHtmlForEditing(vmVal.mission ?? '')
      : stripHtmlForEditing(
          orgVal.mission_en ||
            'To promote and protect the rights of children and youth through advocacy, education, and community empowerment programs that address the root causes of vulnerability and create sustainable change.'
        )
  );

  // 3. Core Values
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

  const [coreValues, setCoreValues] = useState<Array<{ title: string; description: string; image_url: string }>>(
    isConfigured
      ? (Array.isArray(vmVal.core_values) ? vmVal.core_values : [])
      : defaultCoreValues
  );

  const [newValTitle, setNewValTitle] = useState('');
  const [newValDesc, setNewValDesc] = useState('');
  const [newValImage, setNewValImage] = useState('/media/public/images/projects/WATOTO.webp');

  // 4. Our Commitment / Institutional Pledge
  const [commitmentTitle, setCommitmentTitle] = useState(
    isConfigured ? (vmVal.commitment_title ?? '') : 'Our Unwavering Commitment to Tanzanian Children'
  );
  const [commitmentText, setCommitmentText] = useState(
    isConfigured
      ? stripHtmlForEditing(vmVal.commitment_text ?? '')
      : stripHtmlForEditing(
          "At Babawatoto Centre for Children and Youth Trust (BAO), our commitment goes far beyond immediate humanitarian aid. Since 2007, we have remained on the frontlines of Dar es Salaam's most vulnerable communities—listening, mentoring, educating, and rebuilding broken family ties. We pledge to maintain safe spaces, uphold transparent governance, and advocate relentlessly until every street-connected child in Tanzania has a safe pathway home, quality education, and the dignity they deserve."
        )
  );
  const [commitmentImageUrl, setCommitmentImageUrl] = useState(
    isConfigured ? (vmVal.commitment_image_url ?? '') : '/media/public/images/organization/abouts.webp'
  );

  useEffect(() => {
    if (existingSetting) {
      const v = getSettingValue(existingSetting);
      if (v && typeof v === 'object') {
        if (v.hero_badge !== undefined) setHeroBadge(v.hero_badge);
        if (v.heading !== undefined) setHeading(v.heading);
        if (v.hero_image !== undefined) setHeroImage(v.hero_image);
        if (v.vision !== undefined) setVision(stripHtmlForEditing(v.vision));
        if (v.mission !== undefined) setMission(stripHtmlForEditing(v.mission));
        if (Array.isArray(v.core_values)) setCoreValues(v.core_values);
        if (v.commitment_title !== undefined) setCommitmentTitle(v.commitment_title);
        if (v.commitment_text !== undefined) setCommitmentText(stripHtmlForEditing(v.commitment_text));
        if (v.commitment_image_url !== undefined) setCommitmentImageUrl(v.commitment_image_url);
      }
    }
  }, [siteSettings]);

  const handleAddCoreValue = () => {
    if (!newValTitle.trim()) {
      notify('Please enter a core value title.', true);
      return;
    }
    setCoreValues([
      ...coreValues,
      {
        title: newValTitle.trim(),
        description: newValDesc.trim(),
        image_url: newValImage.trim() || '/media/public/images/projects/WATOTO.webp',
      },
    ]);
    setNewValTitle('');
    setNewValDesc('');
    setNewValImage('/media/public/images/projects/WATOTO.webp');
  };

  const handleRemoveCoreValue = (idx: number) => {
    setCoreValues(coreValues.filter((_, i) => i !== idx));
  };

  const handleMoveCoreValue = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= coreValues.length) return;
    const next = [...coreValues];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    setCoreValues(next);
  };

  const handleSave = async (isManual = true) => {
    if (isManual) {
      setSaving(true);
      showAlert?.({
        type: 'loading',
        title: 'Saving Our Vision & Mission...',
        message: 'Updating vision, mission, core values cards, and institutional commitment...',
      });
    } else {
      setAutoStatus('saving');
    }

    try {
      const payload = {
        hero_badge: heroBadge.trim(),
        heading: heading.trim(),
        hero_image: heroImage.trim(),
        vision: vision.trim(),
        mission: mission.trim(),
        core_values: coreValues,
        commitment_title: commitmentTitle.trim(),
        commitment_text: commitmentText.trim(),
        commitment_image_url: commitmentImageUrl.trim(),
      };

      const { error: err1 } = await supabase.from('site_settings').upsert(
        {
          key: 'vision_and_mission',
          value: payload,
          is_public: true,
        },
        { onConflict: 'key' }
      );
      if (err1) throw err1;

      // Sync organization_profile
      await supabase.from('site_settings').upsert(
        {
          key: 'organization_profile',
          value: {
            ...orgVal,
            vision_en: vision.trim(),
            mission_en: mission.trim(),
          },
          is_public: true,
        },
        { onConflict: 'key' }
      );

      // Instant live push to website
      broadcastLivePublish({ module: 'vision_and_mission', key: 'vision_and_mission' });
      setAutoStatus('saved');
      setLastSaved(new Date());

      if (isManual) {
        await onRefresh();
        setSaving(false);
        notify('Our Vision & Mission successfully updated and live!');
        showAlert?.({
          type: 'success',
          title: 'Our Vision & Mission Saved!',
          message: 'Vision, mission statements, core values, and institutional commitment have been published to the live website.',
          websiteUrl: 'http://localhost:3000/mission-vision',
          websiteLabel: 'View Live Page ↗',
        });
      }
    } catch (err: any) {
      if (isManual) {
        setSaving(false);
        notify(err.message || 'Failed to save Vision & Mission', true);
        showAlert?.({
          type: 'error',
          title: 'Error Saving Settings',
          message: err.message || 'An error occurred while saving to the database.',
        });
      } else {
        setAutoStatus('error');
      }
    }
  };

  // Skip auto-save on initial mount, then auto-save on subsequent changes
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
      handleSave(false);
    }, 1200);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [heroBadge, heading, heroImage, vision, mission, coreValues, commitmentTitle, commitmentText, commitmentImageUrl]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-900 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Standalone Public Page
          </div>
          <h2 className="text-xl font-extrabold text-black">Our Vision & Mission</h2>
          <p className="text-xs text-slate-500 mt-1">
            Our driving purpose, core institutional values, and commitment to children
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <AutoSaveStatusBadge status={autoStatus} lastSaved={lastSaved} />
          <a
            href="http://localhost:3000/mission-vision"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Live Page
          </a>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-extrabold flex items-center gap-2 shadow-none transition cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save & Publish
          </button>
        </div>
      </div>

      {/* 1. Page Banner Settings */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-none">
        <h3 className="font-bold text-sm text-black border-b border-slate-100 pb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-600" /> 1. Hero Banner Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Hero Badge Tag</label>
            <input
              type="text"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              placeholder="e.g. Babawatoto Strategic Framework"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Page Title Heading</label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g. Our Mission, Vision & Core Values"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white font-bold"
            />
          </div>
        </div>
        <HeroBannerImageUploader
          imageUrl={heroImage}
          onImageChange={setHeroImage}
          pageName="Vision & Mission"
          supabase={supabase}
          showAlert={showAlert}
          notify={notify}
        />
      </div>

      {/* 2. Vision & Mission Statements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-none">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 bg-amber-500 text-black text-xs font-extrabold uppercase rounded">
              Our Vision
            </span>
            <span className="text-xs text-slate-400">The Future We Seek</span>
          </div>
          <label className="block text-xs font-bold text-black">Vision Statement (Text Area)</label>
          <textarea
            rows={5}
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            placeholder="Type our driving vision statement here..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white leading-relaxed font-medium"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-none">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 bg-amber-500 text-black text-xs font-extrabold uppercase rounded">
              Our Mission
            </span>
            <span className="text-xs text-slate-400">Our Daily Commitment</span>
          </div>
          <label className="block text-xs font-bold text-black">Mission Statement (Text Area)</label>
          <textarea
            rows={5}
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            placeholder="Type our organizational mission statement here..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white leading-relaxed font-medium"
          />
        </div>
      </div>

      {/* 3. Core Values Cards Manager */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-black flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" /> 3. Core Values Cards ({coreValues.length} Values)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These display as interactive cards on the website that reveal practical field meaning on hover.
            </p>
          </div>
        </div>

        {/* Add New Value Card */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="text-xs font-extrabold text-black uppercase">Add New Core Value</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Value Title *</label>
              <input
                type="text"
                value={newValTitle}
                onChange={(e) => setNewValTitle(e.target.value)}
                placeholder="e.g. Integrity & Transparency"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-black font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Card Background Image URL</label>
              <input
                type="text"
                value={newValImage}
                onChange={(e) => setNewValImage(e.target.value)}
                placeholder="/media/public/images/projects/WATOTO.webp"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-black"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Value Meaning / Action</label>
              <input
                type="text"
                value={newValDesc}
                onChange={(e) => setNewValDesc(e.target.value)}
                placeholder="How this value is practiced in the field..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-black"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddCoreValue}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-black text-xs font-extrabold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Core Value Card
            </button>
          </div>
        </div>

        {/* Core Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coreValues.map((val, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 flex flex-col justify-between shadow-none hover:border-black transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                    Value #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveCoreValue(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-black disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveCoreValue(idx, 'down')}
                      disabled={idx === coreValues.length - 1}
                      className="p-1 text-slate-400 hover:text-black disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCoreValue(idx)}
                      className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="h-24 w-full rounded-lg overflow-hidden border border-slate-100 relative">
                  <img src={val.image_url} alt={val.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                    <span className="text-white text-xs font-bold truncate">{val.title}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{val.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Our Commitment / Institutional Pledge */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-none">
        <h3 className="font-bold text-sm text-black border-b border-slate-100 pb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600" /> 4. Institutional Pledge & Commitment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Commitment Heading</label>
            <input
              type="text"
              value={commitmentTitle}
              onChange={(e) => setCommitmentTitle(e.target.value)}
              placeholder="Our Unwavering Commitment to Tanzanian Children"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Commitment Photo Image URL</label>
            <input
              type="text"
              value={commitmentImageUrl}
              onChange={(e) => setCommitmentImageUrl(e.target.value)}
              placeholder="/media/public/images/organization/abouts.webp"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-black uppercase mb-1">Commitment Narrative (Text Area)</label>
          <textarea
            rows={4}
            value={commitmentText}
            onChange={(e) => setCommitmentText(e.target.value)}
            placeholder="Type the full commitment and institutional pledge text..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white leading-relaxed font-medium"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * 2. OUR HISTORY MODULE
 * "Over 17 years of empowering street-connected children and families in Tanzania"
 */
export function OurHistoryModule({
  siteSettings,
  media,
  accessToken,
  onRefresh,
  notify,
  showAlert,
}: {
  siteSettings: any[];
  media: any[];
  accessToken?: string;
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
  showAlert?: (opts: SweetAlertOptions) => void;
}) {
  const existingSetting = siteSettings.find((s) => getSettingKey(s) === 'our_history');
  const orgSetting = siteSettings.find((s) => getSettingKey(s) === 'organization_profile');
  const rawHistVal = getSettingValue(existingSetting);
  const isConfigured = rawHistVal !== undefined && rawHistVal !== null && typeof rawHistVal === 'object';
  const histVal = isConfigured ? rawHistVal : {};
  const orgVal = getSettingValue(orgSetting) || {};

  const [saving, setSaving] = useState(false);
  const [autoStatus, setAutoStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isLoadedRef = useRef(false);
  const autoSaveTimerRef = useRef<any>(null);

  // 1. Page Banner
  const [heroBadge, setHeroBadge] = useState(
    isConfigured ? (histVal.hero_badge ?? '') : 'Our Journey Since 2007'
  );
  const [title, setTitle] = useState(
    isConfigured ? (histVal.title ?? '') : 'Our History'
  );
  const [heroImage, setHeroImage] = useState(
    isConfigured ? (histVal.hero_image ?? '') : '/media/public/images/organization/hero1.webp'
  );

  // 2. Multi-paragraph History Narrative
  const [historyText, setHistoryText] = useState(
    isConfigured
      ? stripHtmlForEditing(histVal.history_text ?? '')
      : stripHtmlForEditing(
          orgVal.history_summary_en ||
            'Founded in 2007 in Mburahati Barafu, Dar es Salaam, Babawatoto Centre for Children and Youth Trust (BAO) is a registered Tanzanian Non-Governmental Organization dedicated to protecting vulnerable children, reuniting street-connected youth with their families, and empowering communities.\n\nWhat started as a grassroots sanctuary offering hot meals, emergency medical aid, and basic care has evolved into a nationally recognized model of community-based child protection. Over the past 17 years, Babawatoto has developed integrated programs spanning MEMKWA Catch-Up Primary Education, HEART Creative Arts Therapy, Youth Vocational Livelihoods, and legal advocacy.'
        )
  );

  // 3. Milestones & Community Impact Block
  const [blockBadge, setBlockBadge] = useState(
    isConfigured ? (histVal.block_badge ?? '') : 'Milestones in the Community'
  );
  const [blockTitle, setBlockTitle] = useState(
    isConfigured ? (histVal.block_title ?? '') : 'Building Hope, Restoring Dignity & Reconnecting Families'
  );
  const [blockText, setBlockText] = useState(
    isConfigured
      ? stripHtmlForEditing(histVal.block_text ?? '')
      : 'Throughout our grassroots history, Babawatoto has prioritized direct street outreach, family reunification, and community-led safeguarding. By partnering with local social welfare offices, municipal health centres, and dedicated caregivers, we have successfully restored hundreds of street-connected children to secure homes and provided adolescent youth with viable pathways out of extreme poverty.'
  );
  const [blockImage, setBlockImage] = useState(
    isConfigured ? (histVal.block_image ?? '') : '/media/public/images/organization/abouts.webp'
  );
  const [blockImageCaption, setBlockImageCaption] = useState(
    isConfigured ? (histVal.block_image_caption ?? '') : 'Babawatoto community empowerment & child protection activities in Dar es Salaam.'
  );

  useEffect(() => {
    if (existingSetting) {
      const v = getSettingValue(existingSetting);
      if (v && typeof v === 'object') {
        if (v.hero_badge !== undefined) setHeroBadge(v.hero_badge);
        if (v.title !== undefined) setTitle(v.title);
        if (v.hero_image !== undefined) setHeroImage(v.hero_image);
        if (v.history_text !== undefined) setHistoryText(stripHtmlForEditing(v.history_text));
        if (v.block_badge !== undefined) setBlockBadge(v.block_badge);
        if (v.block_title !== undefined) setBlockTitle(v.block_title);
        if (v.block_text !== undefined) setBlockText(stripHtmlForEditing(v.block_text));
        if (v.block_image !== undefined) setBlockImage(v.block_image);
        if (v.block_image_caption !== undefined) setBlockImageCaption(v.block_image_caption);
      }
    }
  }, [siteSettings]);

  const handleSave = async (isManual = true) => {
    if (isManual) {
      setSaving(true);
      showAlert?.({
        type: 'loading',
        title: 'Saving Our History Page...',
        message: 'Writing narrative and milestones to the database...',
      });
    } else {
      setAutoStatus('saving');
    }

    try {
      const payload = {
        hero_badge: heroBadge.trim(),
        title: title.trim(),
        hero_image: heroImage.trim(),
        history_text: historyText.trim(),
        block_badge: blockBadge.trim(),
        block_title: blockTitle.trim(),
        block_text: blockText.trim(),
        block_image: blockImage.trim(),
        block_image_caption: blockImageCaption.trim(),
      };

      const { error: err1 } = await supabase.from('site_settings').upsert(
        {
          key: 'our_history',
          value: payload,
          is_public: true,
        },
        { onConflict: 'key' }
      );
      if (err1) throw err1;

      // Also sync organization_profile.history_summary_en
      await supabase.from('site_settings').upsert(
        {
          key: 'organization_profile',
          value: {
            ...orgVal,
            history_summary_en: historyText.slice(0, 300).trim(),
          },
          is_public: true,
        },
        { onConflict: 'key' }
      );

      broadcastLivePublish({ module: 'our_history', key: 'our_history' });
      setAutoStatus('saved');
      setLastSaved(new Date());

      if (isManual) {
        await onRefresh();
        setSaving(false);
        notify('Our History successfully saved and published!');
        showAlert?.({
          type: 'success',
          title: 'Our History Saved!',
          message: 'The history narrative, milestones block, and hero banner are now updated live on the website.',
          websiteUrl: 'http://localhost:3000/our-history',
          websiteLabel: 'View Live Page ↗',
        });
      }
    } catch (err: any) {
      if (isManual) {
        setSaving(false);
        notify(err.message || 'Failed to save Our History', true);
        showAlert?.({
          type: 'error',
          title: 'Error Saving History',
          message: err.message || 'An error occurred while saving to the database.',
        });
      } else {
        setAutoStatus('error');
      }
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
      handleSave(false);
    }, 1200);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [heroBadge, title, heroImage, historyText, blockBadge, blockTitle, blockText, blockImage, blockImageCaption]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-900 text-xs font-bold mb-2">
            <History className="w-3.5 h-3.5 text-amber-600" /> Standalone Public Page
          </div>
          <h2 className="text-xl font-extrabold text-black">Our History</h2>
          <p className="text-xs text-slate-500 mt-1">
            Over 17 years of empowering street-connected children and families in Tanzania
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <AutoSaveStatusBadge status={autoStatus} lastSaved={lastSaved} />
          <a
            href="http://localhost:3000/our-history"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Live Page
          </a>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-extrabold flex items-center gap-2 shadow-none transition cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save & Publish
          </button>
        </div>
      </div>

      {/* 1. Page Banner Settings */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-none">
        <h3 className="font-bold text-sm text-black border-b border-slate-100 pb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-600" /> 1. Hero Banner Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Hero Badge Tag</label>
            <input
              type="text"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              placeholder="e.g. Our Journey Since 2007"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Page Title Heading</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Our History"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white font-bold"
            />
          </div>
        </div>
        <HeroBannerImageUploader
          imageUrl={heroImage}
          onImageChange={setHeroImage}
          pageName="Vision & Mission"
          supabase={supabase}
          showAlert={showAlert}
          notify={notify}
        />
      </div>

      {/* 2. The Babawatoto Story (History Narrative) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-none">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-bold text-sm text-black flex items-center gap-2">
            <History className="w-4 h-4 text-amber-600" /> 2. The Babawatoto Story (History Narrative Text)
          </h3>
          <span className="text-xs text-slate-400">Separate paragraphs with a blank line</span>
        </div>
        <p className="text-xs text-slate-500">
          Write the complete history of Babawatoto Centre for Children and Youth Trust (BAO)—from founding in Mburahati Barafu in 2007 to modern community interventions.
        </p>
        <textarea
          rows={10}
          value={historyText}
          onChange={(e) => setHistoryText(e.target.value)}
          placeholder="Type the full history narrative here..."
          className="w-full px-3.5 py-3 text-sm border border-slate-200 rounded-lg text-black bg-white leading-relaxed font-medium"
        />
      </div>

      {/* 3. Milestones & Community Impact Block */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-none">
        <h3 className="font-bold text-sm text-black border-b border-slate-100 pb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600" /> 3. Milestones & Community Impact Section
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Section Badge</label>
            <input
              type="text"
              value={blockBadge}
              onChange={(e) => setBlockBadge(e.target.value)}
              placeholder="Milestones in the Community"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Section Heading</label>
            <input
              type="text"
              value={blockTitle}
              onChange={(e) => setBlockTitle(e.target.value)}
              placeholder="Building Hope, Restoring Dignity & Reconnecting Families"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-black uppercase mb-1">Narrative Text (Text Area)</label>
          <textarea
            rows={4}
            value={blockText}
            onChange={(e) => setBlockText(e.target.value)}
            placeholder="Type milestone narrative here..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white leading-relaxed font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Block Feature Image URL</label>
            <input
              type="text"
              value={blockImage}
              onChange={(e) => setBlockImage(e.target.value)}
              placeholder="/media/public/images/organization/abouts.webp"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Image Caption</label>
            <input
              type="text"
              value={blockImageCaption}
              onChange={(e) => setBlockImageCaption(e.target.value)}
              placeholder="Babawatoto community empowerment & child protection activities."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. LEADERSHIP & GOVERNANCE MODULE
 * "Board of trustees, executive leadership, and multidisciplinary staff practitioners"
 */
export function LeadershipAndGovernanceModule({
  siteSettings,
  team = [],
  media,
  accessToken,
  onRefresh,
  notify,
  showAlert,
}: {
  siteSettings: any[];
  team?: any[];
  media: any[];
  accessToken?: string;
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
  showAlert?: (opts: SweetAlertOptions) => void;
}) {
  const existingSetting = siteSettings.find((s) => getSettingKey(s) === 'leadership_and_governance');
  const rawGovVal = getSettingValue(existingSetting);
  const isConfigured = rawGovVal !== undefined && rawGovVal !== null && typeof rawGovVal === 'object';
  const govVal = isConfigured ? rawGovVal : {};

  const [saving, setSaving] = useState(false);
  const [autoStatus, setAutoStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isLoadedRef = useRef(false);
  const autoSaveTimerRef = useRef<any>(null);

  // 1. Page Banner
  const [heroBadge, setHeroBadge] = useState(
    isConfigured ? (govVal.hero_badge ?? '') : 'Babawatoto Governance & Oversight'
  );
  const [heroTitle, setHeroTitle] = useState(
    isConfigured ? (govVal.hero_title ?? '') : 'Leadership & Governance'
  );
  const [heroImage, setHeroImage] = useState(
    isConfigured ? (govVal.hero_image ?? '') : '/media/public/images/organization/hero1.webp'
  );

  // 2. Institutional Mandate / Narrative
  const [sectionBadge, setSectionBadge] = useState(
    isConfigured ? (govVal.section_badge ?? '') : 'Institutional Mandate'
  );
  const [sectionTitle, setSectionTitle] = useState(
    isConfigured ? (govVal.section_title ?? '') : 'Accountable Leadership Committed to Child Protection'
  );
  const [narrativeText, setNarrativeText] = useState(
    isConfigured
      ? stripHtmlForEditing(govVal.narrative_text ?? '')
      : 'Babawatoto Centre for Children and Youth Trust (BAO) is governed by a dedicated Board of Trustees, an Executive Leadership Council, and multidisciplinary field practitioners who maintain strict safeguarding oversight and humanitarian accountability.\n\nOur leadership combines decades of experience across child welfare social work, accelerated education, creative arts therapy, and human rights advocacy. Together, we ensure every Tanzanian shilling and donor grant directly advances the protection and empowerment of vulnerable children.'
  );

  // 3. Staff Header
  const [staffBadge, setStaffBadge] = useState(
    isConfigured ? (govVal.staff_badge ?? '') : 'Our People & Practitioners'
  );
  const [staffTitle, setStaffTitle] = useState(
    isConfigured ? (govVal.staff_title ?? '') : 'Leadership, Educators & Social Work Mentors'
  );

  // 4. Team Members List (Circular photos on website)
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

  const [members, setMembers] = useState<Array<{
    id?: string;
    name: string;
    role: string;
    department: string;
    photo_url: string;
    bio: string;
  }>>(
    isConfigured
      ? (Array.isArray(govVal.members) ? govVal.members : [])
      : defaultStaff
  );

  // Add Member State
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberDept, setMemberDept] = useState('Executive Leadership');
  const [memberPhoto, setMemberPhoto] = useState('/media/public/images/staff/mgunga.webp');
  const [memberBio, setMemberBio] = useState('');

  // Edit Member Modal State
  const [editingMemberIdx, setEditingMemberIdx] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editDept, setEditDept] = useState('Executive Leadership');
  const [editPhoto, setEditPhoto] = useState('/media/public/images/staff/mgunga.webp');
  const [editBio, setEditBio] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleUploadStaffPhoto = async (file: File, onSuccess: (url: string) => void) => {
    if (!file.type.startsWith('image/')) {
      notify('Please select an image file (PNG, JPG, WEBP).', true);
      return;
    }
    setUploadingPhoto(true);
    showAlert?.({
      type: 'loading',
      title: 'Uploading Staff Photo...',
      message: `Uploading ${file.name} to media storage...`,
    });
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'staff');
      formData.append('visibility', 'public');
      formData.append('title_en', 'Staff Profile Photo');
      formData.append('alt_text_en', 'Staff Member Portrait');

      const res = await fetch('/api/v1/media/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      const url =
        data.media?.public_url ||
        (data.media?.storage_key ? `/media/${data.media.storage_key}` : null);
      if (url) {
        onSuccess(url);
        notify('Staff photo uploaded successfully!');
        showAlert?.({
          type: 'success',
          title: 'Photo Uploaded!',
          message: 'Profile photograph was successfully updated.',
        });
      }
    } catch (err: any) {
      notify(err.message || 'Failed to upload photo.', true);
      showAlert?.({
        type: 'error',
        title: 'Upload Failed',
        message: err.message || 'Could not upload staff photo.',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const startEditMember = (idx: number) => {
    const m = members[idx];
    if (!m) return;
    setEditingMemberIdx(idx);
    setEditName(m.name || '');
    setEditRole(m.role || '');
    setEditDept(m.department || 'Executive Leadership');
    setEditPhoto(m.photo_url || '/media/public/images/staff/mgunga.webp');
    setEditBio(m.bio || '');
  };

  const handleSaveMemberEdit = () => {
    if (editingMemberIdx === null) return;
    if (!editName.trim()) {
      notify('Please enter the team member full name.', true);
      return;
    }
    const updated = [...members];
    updated[editingMemberIdx] = {
      ...updated[editingMemberIdx],
      name: editName.trim(),
      role: editRole.trim() || 'Staff Practitioner',
      department: editDept.trim() || 'Operations',
      photo_url: editPhoto.trim() || '/media/public/images/staff/mgunga.webp',
      bio: editBio.trim(),
    };
    setMembers(updated);
    setEditingMemberIdx(null);
    notify(`Updated ${editName.trim()} details! Auto-saved and published to live website.`);
  };

  useEffect(() => {
    if (existingSetting) {
      const v = getSettingValue(existingSetting);
      if (v && typeof v === 'object') {
        if (v.hero_badge !== undefined) setHeroBadge(v.hero_badge);
        if (v.hero_title !== undefined) setHeroTitle(v.hero_title);
        if (v.hero_image !== undefined) setHeroImage(v.hero_image);
        if (v.section_badge !== undefined) setSectionBadge(v.section_badge);
        if (v.section_title !== undefined) setSectionTitle(v.section_title);
        if (v.narrative_text !== undefined) setNarrativeText(stripHtmlForEditing(v.narrative_text));
        if (v.staff_badge !== undefined) setStaffBadge(v.staff_badge);
        if (v.staff_title !== undefined) setStaffTitle(v.staff_title);
        if (Array.isArray(v.members)) setMembers(v.members);
      }
    }
  }, [siteSettings]);

  const handleAddMember = () => {
    if (!memberName.trim()) {
      notify('Please enter the team member full name.', true);
      return;
    }
    setMembers([
      ...members,
      {
        id: `mem-${Date.now()}`,
        name: memberName.trim(),
        role: memberRole.trim() || 'Staff Practitioner',
        department: memberDept.trim() || 'Operations',
        photo_url: memberPhoto.trim() || '/media/public/images/staff/mgunga.webp',
        bio: memberBio.trim(),
      },
    ]);
    setMemberName('');
    setMemberRole('');
    setMemberBio('');
  };

  const handleRemoveMember = (idx: number) => {
    setMembers(members.filter((_, i) => i !== idx));
  };

  const handleSave = async (isManual = true) => {
    if (isManual) {
      setSaving(true);
      showAlert?.({
        type: 'loading',
        title: 'Saving Leadership & Governance...',
        message: 'Writing governance mandate and leadership team roster to database...',
      });
    } else {
      setAutoStatus('saving');
    }

    try {
      const payload = {
        hero_badge: heroBadge.trim(),
        hero_title: heroTitle.trim(),
        hero_image: heroImage.trim(),
        section_badge: sectionBadge.trim(),
        section_title: sectionTitle.trim(),
        narrative_text: narrativeText.trim(),
        staff_badge: staffBadge.trim(),
        staff_title: staffTitle.trim(),
        members: members,
      };

      const { error } = await supabase.from('site_settings').upsert(
        {
          key: 'leadership_and_governance',
          value: payload,
          is_public: true,
        },
        { onConflict: 'key' }
      );
      if (error) throw error;

      broadcastLivePublish({ module: 'leadership_and_governance', key: 'leadership_and_governance' });
      setAutoStatus('saved');
      setLastSaved(new Date());

      if (isManual) {
        await onRefresh();
        setSaving(false);
        notify('Leadership & Governance successfully saved and published!');
        showAlert?.({
          type: 'success',
          title: 'Leadership & Governance Saved!',
          message: 'The governance mandate, staff directory, and leadership roster are live on the website.',
          websiteUrl: 'http://localhost:3000/leadership-governance',
          websiteLabel: 'View Live Page ↗',
        });
      }
    } catch (err: any) {
      if (isManual) {
        setSaving(false);
        notify(err.message || 'Failed to save Leadership & Governance', true);
        showAlert?.({
          type: 'error',
          title: 'Error Saving Settings',
          message: err.message || 'An error occurred while saving to the database.',
        });
      } else {
        setAutoStatus('error');
      }
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
      handleSave(false);
    }, 1200);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [heroBadge, heroTitle, heroImage, sectionBadge, sectionTitle, narrativeText, staffBadge, staffTitle, members]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-900 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5 text-amber-600" /> Standalone Public Page
          </div>
          <h2 className="text-xl font-extrabold text-black">Leadership & Governance</h2>
          <p className="text-xs text-slate-500 mt-1">
            Board of trustees, executive leadership, and multidisciplinary staff practitioners
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <AutoSaveStatusBadge status={autoStatus} lastSaved={lastSaved} />
          <a
            href="http://localhost:3000/leadership-governance"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Live Page
          </a>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-extrabold flex items-center gap-2 shadow-none transition cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save & Publish
          </button>
        </div>
      </div>

      {/* 1. Page Banner Settings */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-none">
        <h3 className="font-bold text-sm text-black border-b border-slate-100 pb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-600" /> 1. Hero Banner Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Hero Badge Tag</label>
            <input
              type="text"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              placeholder="e.g. Babawatoto Governance & Oversight"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Page Title Heading</label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              placeholder="e.g. Leadership & Governance"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white font-bold"
            />
          </div>
        </div>
        <HeroBannerImageUploader
          imageUrl={heroImage}
          onImageChange={setHeroImage}
          pageName="Vision & Mission"
          supabase={supabase}
          showAlert={showAlert}
          notify={notify}
        />
      </div>

      {/* 2. Institutional Mandate / Governance Narrative */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-none">
        <h3 className="font-bold text-sm text-black border-b border-slate-100 pb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600" /> 2. Institutional Mandate & Governance Narrative
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Section Badge</label>
            <input
              type="text"
              value={sectionBadge}
              onChange={(e) => setSectionBadge(e.target.value)}
              placeholder="Institutional Mandate"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Section Heading</label>
            <input
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Accountable Leadership Committed to Child Protection"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-black uppercase mb-1">Mandate Narrative (Text Area)</label>
          <textarea
            rows={5}
            value={narrativeText}
            onChange={(e) => setNarrativeText(e.target.value)}
            placeholder="Type governance mandate paragraphs here..."
            className="w-full px-3.5 py-3 text-sm border border-slate-200 rounded-lg text-black bg-white leading-relaxed font-medium"
          />
        </div>
      </div>

      {/* 3. Team & Leadership Roster */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-black flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" /> 3. Leadership & Practitioners Directory ({members.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Team members render on the website with circular image holders, full names, roles, and bio profiles.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Directory Section Badge</label>
            <input
              type="text"
              value={staffBadge}
              onChange={(e) => setStaffBadge(e.target.value)}
              placeholder="Our People & Practitioners"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Directory Section Title</label>
            <input
              type="text"
              value={staffTitle}
              onChange={(e) => setStaffTitle(e.target.value)}
              placeholder="Leadership, Educators & Social Work Mentors"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white font-bold"
            />
          </div>
        </div>

        {/* Add Member Form */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="text-xs font-extrabold text-black uppercase">Add New Practitioner / Board Member</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Full Name *</label>
              <input
                type="text"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="e.g. Mgunga Mwamnyenyelwa"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-black font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Role / Position *</label>
              <input
                type="text"
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value)}
                placeholder="e.g. Founder & Executive Director"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-black"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Category / Group</label>
              <select
                value={memberDept}
                onChange={(e) => setMemberDept(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-black font-medium"
              >
                <option value="Board of Trustees">Board of Trustees</option>
                <option value="Executive Leadership">Executive Leadership</option>
                <option value="Child Protection & Reintegration">Child Protection & Reintegration</option>
                <option value="Non-Formal Education">Non-Formal Education (MEMKWA)</option>
                <option value="Psychosocial Arts">Psychosocial Arts (HEART)</option>
                <option value="Operations & Finance">Operations & Finance</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Profile Photo</label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-500 shrink-0 bg-white">
                  <img src={memberPhoto} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <label className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition">
                  {uploadingPhoto ? <Loader2 className="w-3 h-3 animate-spin text-amber-500" /> : <Upload className="w-3 h-3 text-amber-600" />}
                  <span>{uploadingPhoto ? 'Uploading...' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingPhoto}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUploadStaffPhoto(f, setMemberPhoto);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Brief Bio / Profile</label>
            <input
              type="text"
              value={memberBio}
              onChange={(e) => setMemberBio(e.target.value)}
              placeholder="Brief summary of experience and role in child protection..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-black"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddMember}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-black text-xs font-extrabold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Team Member
            </button>
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {members.map((m, idx) => (
            <div
              key={m.id || idx}
              className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col items-center text-center space-y-3 relative group hover:border-black transition"
            >
              <div className="flex items-center gap-1 absolute top-2 right-2">
                <button
                  type="button"
                  onClick={() => startEditMember(idx)}
                  className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer transition"
                  title="Edit Member Details (Title, Name, Photo, Bio)"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(idx)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition"
                  title="Remove Member"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-500 p-0.5 bg-white">
                <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover rounded-full" />
              </div>

              <div>
                <h4 className="font-bold text-xs text-black leading-snug">{m.name}</h4>
                <div className="text-[11px] text-amber-600 font-semibold mt-0.5">{m.role}</div>
                <div className="text-[10px] text-slate-500 font-medium">{m.department}</div>
              </div>

              {m.bio && <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{m.bio}</p>}

              <button
                type="button"
                onClick={() => startEditMember(idx)}
                className="w-full mt-2 py-1.5 px-3 bg-slate-50 hover:bg-amber-500 hover:text-black text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" /> Edit Profile
              </button>
            </div>
          ))}
        </div>

        {/* Edit Member Modal */}
        {editingMemberIdx !== null && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Edit Team Member / Practitioner
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Update profile image, job title, name, and bio for the website directory
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingMemberIdx(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Photo & Upload */}
                <div className="flex items-center gap-4 p-3 bg-amber-50/50 rounded-xl border border-amber-200/60">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500 bg-white shrink-0 shadow-xs">
                    <img
                      src={editPhoto || '/media/public/images/staff/mgunga.webp'}
                      alt={editName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <label className="block text-xs font-bold text-slate-900 uppercase">
                      Profile Photograph
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-lg cursor-pointer transition">
                        {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>{uploadingPhoto ? 'Uploading...' : 'Upload New Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingPhoto}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleUploadStaffPhoto(f, setEditPhoto);
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditPhoto('/media/public/images/staff/mgunga.webp')}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-black text-xs font-semibold rounded-lg transition cursor-pointer"
                      >
                        Reset Photo
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Mgunga Mwamnyenyelwa"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-black font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 uppercase mb-1">
                      Role / Position (Title) *
                    </label>
                    <input
                      type="text"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      placeholder="e.g. Founder & Executive Director"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-black font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 uppercase mb-1">
                      Category / Department
                    </label>
                    <input
                      type="text"
                      value={editDept}
                      onChange={(e) => setEditDept(e.target.value)}
                      placeholder="e.g. Executive Leadership"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-black focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase mb-1">
                    Bio / Summary (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Pioneered Babawatoto in 2007, championing community child protection..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-black focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingMemberIdx(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMemberEdit}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
                  >
                    Apply Member Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 4. ABOUT STREET CHILDREN MODULE
 * "Understanding the realities, rights, and potential of street-connected children"
 */
export function AboutStreetChildrenModule({
  siteSettings,
  media,
  accessToken,
  onRefresh,
  notify,
  showAlert,
}: {
  siteSettings: any[];
  media: any[];
  accessToken?: string;
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
  showAlert?: (opts: SweetAlertOptions) => void;
}) {
  const existingSetting = siteSettings.find((s) => getSettingKey(s) === 'about_street_children');
  const rawAscVal = getSettingValue(existingSetting);
  const isConfigured = rawAscVal !== undefined && rawAscVal !== null && typeof rawAscVal === 'object';
  const ascVal = isConfigured ? rawAscVal : {};

  const [saving, setSaving] = useState(false);
  const [autoStatus, setAutoStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isLoadedRef = useRef(false);
  const autoSaveTimerRef = useRef<any>(null);

  // 1. Hero Banner
  const [heroBadge, setHeroBadge] = useState(
    isConfigured ? (ascVal.hero_badge ?? '') : 'Child Rights & Protection'
  );
  const [title, setTitle] = useState(
    isConfigured ? (ascVal.title ?? '') : 'About Street-Connected Children'
  );
  const [heroImage, setHeroImage] = useState(
    isConfigured ? (ascVal.hero_image ?? '') : '/media/public/images/organization/abouts.webp'
  );
  const [leadTitle, setLeadTitle] = useState(
    isConfigured ? (ascVal.lead_title ?? '') : 'Understanding Realities, Rights & Potential of Children on the Streets'
  );
  const [leadDescription, setLeadDescription] = useState(
    isConfigured
      ? stripHtmlForEditing(ascVal.lead_description ?? '')
      : 'Street-connected children and youth in Tanzania are children for whom the street has become a central reference point—whether for daily survival, temporary shelter, or informal livelihood. At Babawatoto Centre for Children and Youth Trust (BAO), we recognize that every street-connected child possesses inherent human dignity and full legal rights under Tanzania’s Law of the Child Act (2009) and the UN Convention on the Rights of the Child. Rather than viewing street-connected children as passive victims, BAO’s social workers, educators, and creative arts mentors meet children where they are—providing daily street outreach, trauma-informed psychosocial counselling, safe family tracing, and accelerated catch-up education.'
  );

  // 2. Context Section
  const [contextHeading, setContextHeading] = useState(
    isConfigured ? (ascVal.context_heading ?? '') : ''
  );
  const [contextText, setContextText] = useState(
    isConfigured
      ? stripHtmlForEditing(ascVal.context_text ?? '')
      : ''
  );
  const [contextImage, setContextImage] = useState(
    isConfigured ? (ascVal.context_image ?? '') : ''
  );

  // 3. Three Protection Pillars
  const [pillars, setPillars] = useState<Array<{ title: string; body: string; img: string }>>(
    isConfigured && Array.isArray(ascVal.pillars) ? ascVal.pillars : []
  );

  // 4. Commemorative Spotlight
  const [spotlightBadge, setSpotlightBadge] = useState(
    isConfigured ? (ascVal.spotlight_badge ?? '') : ''
  );
  const [spotlightHeading, setSpotlightHeading] = useState(
    isConfigured ? (ascVal.spotlight_heading ?? '') : ''
  );
  const [spotlightText, setSpotlightText] = useState(
    isConfigured
      ? stripHtmlForEditing(ascVal.spotlight_text ?? '')
      : ''
  );
  const [spotlightImage, setSpotlightImage] = useState(
    isConfigured ? (ascVal.spotlight_image ?? '') : ''
  );
  const [spotlightCaption, setSpotlightCaption] = useState(
    isConfigured ? (ascVal.spotlight_caption ?? '') : ''
  );

  useEffect(() => {
    if (existingSetting) {
      const v = getSettingValue(existingSetting);
      if (v && typeof v === 'object') {
        if (v.hero_badge !== undefined) setHeroBadge(v.hero_badge);
        if (v.title !== undefined) setTitle(v.title);
        if (v.hero_image !== undefined) setHeroImage(v.hero_image);
        if (v.lead_title !== undefined) setLeadTitle(v.lead_title);
        if (v.lead_description !== undefined) setLeadDescription(stripHtmlForEditing(v.lead_description));
        if (v.context_heading !== undefined) setContextHeading(v.context_heading);
        if (v.context_text !== undefined) setContextText(stripHtmlForEditing(v.context_text));
        if (v.context_image !== undefined) setContextImage(v.context_image);
        if (Array.isArray(v.pillars)) setPillars(v.pillars);
        if (v.spotlight_badge !== undefined) setSpotlightBadge(v.spotlight_badge);
        if (v.spotlight_heading !== undefined) setSpotlightHeading(v.spotlight_heading);
        if (v.spotlight_text !== undefined) setSpotlightText(stripHtmlForEditing(v.spotlight_text));
        if (v.spotlight_image !== undefined) setSpotlightImage(v.spotlight_image);
        if (v.spotlight_caption !== undefined) setSpotlightCaption(v.spotlight_caption);
      }
    }
  }, [siteSettings]);

  const handleUpdatePillar = (idx: number, field: 'title' | 'body' | 'img', val: string) => {
    const next = [...pillars];
    next[idx] = { ...next[idx], [field]: val };
    setPillars(next);
  };

  const handleSave = async (isManual = true) => {
    if (isManual) {
      setSaving(true);
      showAlert?.({
        type: 'loading',
        title: 'Saving About Street Children...',
        message: 'Writing narrative, pillars, and protection context to database...',
      });
    } else {
      setAutoStatus('saving');
    }

    try {
      const payload = {
        hero_badge: heroBadge.trim(),
        title: title.trim(),
        hero_image: heroImage.trim(),
        lead_title: leadTitle.trim(),
        lead_description: leadDescription.trim(),
        context_heading: contextHeading.trim(),
        context_text: contextText.trim(),
        context_image: contextImage.trim(),
        pillars: pillars,
        spotlight_badge: spotlightBadge.trim(),
        spotlight_heading: spotlightHeading.trim(),
        spotlight_text: spotlightText.trim(),
        spotlight_image: spotlightImage.trim(),
        spotlight_caption: spotlightCaption.trim(),
      };

      const { error } = await supabase.from('site_settings').upsert(
        {
          key: 'about_street_children',
          value: payload,
          is_public: true,
        },
        { onConflict: 'key' }
      );
      if (error) throw error;

      broadcastLivePublish({ module: 'about_street_children', key: 'about_street_children' });
      setAutoStatus('saved');
      setLastSaved(new Date());

      if (isManual) {
        await onRefresh();
        setSaving(false);
        notify('About Street Children successfully saved and published!');
        showAlert?.({
          type: 'success',
          title: 'About Street Children Saved!',
          message: 'Child protection narrative, rights context, and core pillars are now live on the website.',
          websiteUrl: 'http://localhost:3000/about-street-children',
          websiteLabel: 'View Live Page ↗',
        });
      }
    } catch (err: any) {
      if (isManual) {
        setSaving(false);
        notify(err.message || 'Failed to save About Street Children', true);
        showAlert?.({
          type: 'error',
          title: 'Error Saving Settings',
          message: err.message || 'An error occurred while saving to the database.',
        });
      } else {
        setAutoStatus('error');
      }
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
      handleSave(false);
    }, 1200);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [
    heroBadge,
    title,
    heroImage,
    leadTitle,
    leadDescription,
    contextHeading,
    contextText,
    contextImage,
    pillars,
    spotlightBadge,
    spotlightHeading,
    spotlightText,
    spotlightImage,
    spotlightCaption,
  ]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-900 text-xs font-bold mb-2">
            <Heart className="w-3.5 h-3.5 text-amber-600" /> Standalone Public Page
          </div>
          <h2 className="text-xl font-extrabold text-black">About Street Children</h2>
          <p className="text-xs text-slate-500 mt-1">
            Understanding the realities, rights, and potential of street-connected children
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <AutoSaveStatusBadge status={autoStatus} lastSaved={lastSaved} />
          <a
            href="http://localhost:3000/about-street-children"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Live Page
          </a>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-extrabold flex items-center gap-2 shadow-none transition cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save & Publish
          </button>
        </div>
      </div>

      {/* 1. Page Banner Settings */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-none">
        <h3 className="font-bold text-sm text-black border-b border-slate-100 pb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-600" /> 1. Hero Banner Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Hero Badge Tag</label>
            <input
              type="text"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              placeholder="e.g. Child Rights & Protection"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Page Title Heading</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. About Street-Connected Children"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white font-bold"
            />
          </div>
        </div>

        <HeroBannerImageUploader
          imageUrl={heroImage}
          onImageChange={setHeroImage}
          pageName="About Street Children"
          supabase={supabase}
          showAlert={showAlert}
          notify={notify}
        />

        <div>
          <label className="block text-xs font-bold text-black uppercase mb-1">Lead Narrative Subtitle</label>
          <textarea
            rows={3}
            value={leadDescription}
            onChange={(e) => setLeadDescription(e.target.value)}
            placeholder="Lead context paragraph on child protection..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white leading-relaxed font-medium"
          />
        </div>
      </div>

      {/* 2. Context Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-none">
        <h3 className="font-bold text-sm text-black border-b border-slate-100 pb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600" /> 2. Understanding the Context (Dignity & Rights)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Context Heading</label>
            <input
              type="text"
              value={contextHeading}
              onChange={(e) => setContextHeading(e.target.value)}
              placeholder="Dignity, Rights & Child-Centred Social Work"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Context Image URL</label>
            <input
              type="text"
              value={contextImage}
              onChange={(e) => setContextImage(e.target.value)}
              placeholder="/media/public/images/programmes/IMG_1087.JPG"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-black uppercase mb-1">Context Narrative Text (Text Area)</label>
          <textarea
            rows={5}
            value={contextText}
            onChange={(e) => setContextText(e.target.value)}
            placeholder="Type context paragraphs here..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white leading-relaxed font-medium"
          />
        </div>
      </div>

      {/* 3. Three Protection Pillars */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-none">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="font-bold text-sm text-black flex items-center gap-2">
            <Heart className="w-4 h-4 text-amber-600" /> 3. Core Protection Pillars (3 Cards)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            These render as 3 key pillar cards illustrating Babawatoto's direct intervention model.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pillars.map((pil, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-none">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                Pillar #{idx + 1}
              </span>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Pillar Title</label>
                <input
                  type="text"
                  value={pil.title}
                  onChange={(e) => handleUpdatePillar(idx, 'title', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-black bg-white font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Image URL</label>
                <input
                  type="text"
                  value={pil.img}
                  onChange={(e) => handleUpdatePillar(idx, 'img', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-black bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={pil.body}
                  onChange={(e) => handleUpdatePillar(idx, 'body', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-black bg-white leading-relaxed"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Commemorative Spotlight */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-none">
        <h3 className="font-bold text-sm text-black border-b border-slate-100 pb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" /> 4. Commemorative Story & Impact Spotlight
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Spotlight Badge</label>
            <input
              type="text"
              value={spotlightBadge}
              onChange={(e) => setSpotlightBadge(e.target.value)}
              placeholder="Commemorative Spotlight"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Spotlight Heading</label>
            <input
              type="text"
              value={spotlightHeading}
              onChange={(e) => setSpotlightHeading(e.target.value)}
              placeholder="Restoring Hope, Upholding Inherent Human Dignity"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-black uppercase mb-1">Spotlight Narrative (Text Area)</label>
          <textarea
            rows={4}
            value={spotlightText}
            onChange={(e) => setSpotlightText(e.target.value)}
            placeholder="Type commemorative narrative here..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white leading-relaxed font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Spotlight Image URL</label>
            <input
              type="text"
              value={spotlightImage}
              onChange={(e) => setSpotlightImage(e.target.value)}
              placeholder="/media/public/images/organization/hero1.webp"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">Image Caption</label>
            <input
              type="text"
              value={spotlightCaption}
              onChange={(e) => setSpotlightCaption(e.target.value)}
              placeholder="Children gathered in community reflection and empowerment sessions."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-black bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

