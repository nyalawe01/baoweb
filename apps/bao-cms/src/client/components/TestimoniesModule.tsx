import React, { useState, useEffect } from 'react';
import {
  MessageSquareQuote,
  Plus,
  Trash2,
  Edit3,
  Save,
  Check,
  X,
  Eye,
  EyeOff,
  Search,
  Filter,
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
  User,
  Calendar,
  Tag,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Upload,
  Loader2,
} from 'lucide-react';
import { supabase } from '../supabase.js';
import { type SweetAlertOptions } from './SweetAlertModal.js';

export interface TestimonialItem {
  id: string;
  name: string;
  role?: string;
  role_sw?: string;
  quote: string;
  quote_sw?: string;
  avatar_url?: string | null;
  date_label?: string;
  category?: string;
  rating?: number;
  is_published: boolean;
}

export interface TestimoniesSettingValue {
  heading_en?: string;
  heading_sw?: string;
  subtitle_en?: string;
  subtitle_sw?: string;
  items?: TestimonialItem[];
}

interface TestimoniesModuleProps {
  siteSettings: any[];
  media: any[];
  accessToken?: string;
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
  showAlert?: (opts: SweetAlertOptions | null) => void;
}

const getSettingKey = (s: any) => s?.key || s?.setting_key;
const getSettingValue = (s: any) => s?.value ?? s?.setting_value;

export const DEFAULT_PRESET_CATEGORIES = [
  'Youth Graduate',
  'Caregiver & Community Leader',
  'HEART Arts Performer',
  'Street Outreach Participant',
  'Community Champion',
  'Development Partner / Donor',
  'Volunteer Mentor',
];

const DEFAULT_VERIFIED_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 't-default-1',
    name: 'Juma Said',
    role: 'MEMKWA Accelerated Learning Graduate & Tailoring Apprentice',
    role_sw: 'Mhitimu wa MEMKWA na Mwanafunzi wa Ufundi Cherehani',
    quote:
      'Babawatoto met me when I had lost hope on the streets of Dar es Salaam. Through their outreach team and safe center, I completed primary catch-up education and discovered my talent in tailoring. Today I provide for myself with dignity.',
    quote_sw:
      'Babawatoto walinikuta nikiwa nimekata tamaa mitaani Dar es Salaam. Kupitia kituo chao salama, nilikamilisha elimu ya msingi na kugundua kipaji changu cha ushonaji. Leo najitegemea kwa heshima.',
    avatar_url: '/media/public/images/projects/WATOTO.webp',
    date_label: 'Class of 2023',
    category: 'Youth Graduate',
    rating: 5,
    is_published: true,
  },
  {
    id: 't-default-2',
    name: 'Rehema Mwangi',
    role: 'Community Mother & Child Protection Committee Leader',
    role_sw: 'Kiongozi wa Kamati ya Ulinzi wa Mtoto ya Jamii',
    quote:
      'The parenting and child safeguarding workshops opened our eyes as a community. We now look after every child in our neighborhood and ensure children at risk are referred early before they end up on the streets.',
    quote_sw:
      'Mafunzo ya malezi na ulinzi wa mtoto yalifungua macho yetu kama jamii. Sasa tunalinda kila mtoto katika mtaa wetu na kuhakikisha watoto walio hatarini wanapata msaada mapema.',
    avatar_url: '/media/public/images/organization/hero3.webp',
    date_label: 'Kigogo Center',
    category: 'Caregiver & Community Leader',
    rating: 5,
    is_published: true,
  },
  {
    id: 't-default-3',
    name: 'Kelvin Bakari',
    role: 'HEART Arts & Acrobatics Performer',
    role_sw: 'Msanii wa Sarakasi na Maonyesho ya HEART',
    quote:
      'Through expressive theatre and acrobatic arts with Babawatoto, I healed from trauma and found a family. The discipline I learned on stage gave me the strength to rebuild my life and inspire younger children.',
    quote_sw:
      'Kupitia sanaa za maonyesho na sarakasi na Babawatoto, nilipona maumivu ya kisaikolojia na nikapata familia. Nidhamu niliyojifunza imenisaidia kujenga maisha mapya na kuhamasisha watoto wadogo.',
    avatar_url: '/media/public/images/programmes/arts1.webp',
    date_label: 'HEART Project',
    category: 'HEART Arts Performer',
    rating: 5,
    is_published: true,
  },
];

export function TestimoniesModule({
  siteSettings,
  media,
  onRefresh,
  notify,
  showAlert,
}: TestimoniesModuleProps) {
  const existingSetting = siteSettings.find((s) => getSettingKey(s) === 'testimonials');
  const rawSettingVal = getSettingValue(existingSetting);
  const isConfigured = rawSettingVal !== undefined && rawSettingVal !== null && typeof rawSettingVal === 'object';
  const settingVal: TestimoniesSettingValue = isConfigured ? rawSettingVal : {};

  const currentItems: TestimonialItem[] = isConfigured
    ? (Array.isArray(settingVal.items) ? settingVal.items : [])
    : DEFAULT_VERIFIED_TESTIMONIALS;

  // Headings state
  const [headingEn, setHeadingEn] = useState(
    isConfigured ? (settingVal.heading_en ?? '') : 'Voices of Hope & Transformation'
  );
  const [headingSw, setHeadingSw] = useState(
    isConfigured ? (settingVal.heading_sw ?? '') : 'Sauti za Mabadiliko na Ushuhuda'
  );
  const [subtitleEn, setSubtitleEn] = useState(
    isConfigured
      ? (settingVal.subtitle_en ?? '')
      : 'Authentic experiences and reflections from children, youth graduates, caregivers, and community partners empowered through Babawatoto Organization.'
  );
  const [subtitleSw, setSubtitleSw] = useState(
    isConfigured
      ? (settingVal.subtitle_sw ?? '')
      : 'Ushuhuda na simulizi halisi kutoka kwa watoto, vijana waliohitimu, walezi na washirika waliowezeshwa na Babawatoto.'
  );

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'hidden'>('all');

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isHeadingSettingsOpen, setIsHeadingSettingsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Testimony Form Fields
  const [formName, setFormName] = useState('');
  const [formQuoteEn, setFormQuoteEn] = useState('');
  const [formQuoteSw, setFormQuoteSw] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formDateLabel, setFormDateLabel] = useState('');
  const [formCategory, setFormCategory] = useState('Youth Graduate');
  const [isManualCategory, setIsManualCategory] = useState(false);
  const [manualCategoryText, setManualCategoryText] = useState('');
  const [formIsPublished, setFormIsPublished] = useState(true);

  // Sync state if setting changes
  useEffect(() => {
    if (existingSetting) {
      const v = getSettingValue(existingSetting);
      if (v && typeof v === 'object') {
        if (v.heading_en !== undefined) setHeadingEn(v.heading_en);
        if (v.heading_sw !== undefined) setHeadingSw(v.heading_sw);
        if (v.subtitle_en !== undefined) setSubtitleEn(v.subtitle_en);
        if (v.subtitle_sw !== undefined) setSubtitleSw(v.subtitle_sw);
      }
    }
  }, [existingSetting]);

  // Save to database
  const saveToDatabase = async (
    nextItems: TestimonialItem[],
    nextHeadings?: {
      heading_en?: string;
      heading_sw?: string;
      subtitle_en?: string;
      subtitle_sw?: string;
    }
  ) => {
    setIsSaving(true);
    showAlert?.({
      type: 'loading',
      title: 'Saving Testimonies...',
      message: 'Persisting changes to Supabase database...',
    });

    try {
      const payloadValue: TestimoniesSettingValue = {
        ...settingVal,
        heading_en: nextHeadings?.heading_en ?? headingEn,
        heading_sw: nextHeadings?.heading_sw ?? headingSw,
        subtitle_en: nextHeadings?.subtitle_en ?? subtitleEn,
        subtitle_sw: nextHeadings?.subtitle_sw ?? subtitleSw,
        items: nextItems,
      };

      const { error } = await supabase.from('site_settings').upsert(
        {
          key: 'testimonials',
          value: payloadValue,
          is_public: true,
        },
        { onConflict: 'key' }
      );

      if (error) throw error;

      showAlert?.({
        type: 'success',
        title: 'Testimonies Saved',
        message: 'The website and database have been updated successfully.',
        websiteUrl: 'http://localhost:3000',
        websiteLabel: 'View on Website',
      });
      notify('Testimonies saved successfully.');
      await onRefresh();
      return true;
    } catch (err: any) {
      console.error('Failed to save testimonials:', err);
      showAlert?.({
        type: 'error',
        title: 'Failed to Save Testimonies',
        message: err.message || 'An error occurred while saving to database.',
      });
      notify(err.message || 'Failed to save testimonials', true);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Open Form for Adding New
  const handleOpenAddForm = () => {
    setEditingId(null);
    setFormName('');
    setFormQuoteEn('');
    setFormQuoteSw('');
    setFormAvatar('');
    setFormDateLabel('');
    setFormCategory('Youth Graduate');
    setIsManualCategory(false);
    setManualCategoryText('');
    setFormIsPublished(true);
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleOpenEditForm = (item: TestimonialItem) => {
    setEditingId(item.id);
    setFormName(item.name || '');
    setFormQuoteEn(item.quote || '');
    setFormQuoteSw(item.quote_sw || '');
    setFormAvatar(item.avatar_url || '');
    setFormDateLabel(item.date_label || '');
    const itemCat = item.category?.trim() || item.role?.trim() || 'Youth Graduate';
    if (DEFAULT_PRESET_CATEGORIES.includes(itemCat)) {
      setFormCategory(itemCat);
      setIsManualCategory(false);
      setManualCategoryText('');
    } else {
      setFormCategory('__custom__');
      setIsManualCategory(true);
      setManualCategoryText(itemCat);
    }
    setFormIsPublished(item.is_published !== false);
    setIsFormOpen(true);
  };

  // Upload Avatar / Photograph
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    showAlert?.({
      type: 'loading',
      title: 'Uploading Photograph...',
      message: `Uploading ${file.name} to server media storage...`,
    });

    try {
      const { data: sD } = await supabase.auth.getSession();
      const token = sD?.session?.access_token || accessToken;

      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', 'testimonials');
      fd.append('visibility', 'public');
      fd.append('title', `Testimony Photo - ${formName || 'Beneficiary'}`);
      fd.append('alt_text', `Testimony Photo - ${formName || 'Beneficiary'}`);

      const res = await fetch('/api/v1/media/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload photograph.');
      }

      const uploadedUrl =
        data.media?.public_url || (data.media?.storage_key ? `/media/${data.media.storage_key}` : null);
      if (uploadedUrl) {
        setFormAvatar(uploadedUrl);
        notify('Photograph uploaded successfully!');
        showAlert?.({
          type: 'success',
          title: 'Photograph Uploaded!',
          message: 'The photograph has been uploaded and attached to this testimony.',
        });
      }
    } catch (err: any) {
      notify(err.message || 'Image upload failed.', true);
      showAlert?.({
        type: 'error',
        title: 'Upload Failed',
        message: err.message || 'Could not upload testimony photograph.',
      });
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  // Submit Add / Edit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formQuoteEn.trim()) {
      notify('Person name and English testimony quote are required.', true);
      return;
    }

    const effectiveCategory = isManualCategory
      ? (manualCategoryText.trim() || 'Beneficiary Participant')
      : (formCategory === '__custom__' ? (manualCategoryText.trim() || 'Beneficiary Participant') : formCategory.trim());

    let nextItems: TestimonialItem[];
    if (editingId) {
      // Update existing
      nextItems = currentItems.map((item) => {
        if (item.id === editingId) {
          return {
            ...item,
            name: formName.trim(),
            category: effectiveCategory,
            quote: formQuoteEn.trim(),
            quote_sw: formQuoteSw.trim() || formQuoteEn.trim(),
            avatar_url: formAvatar.trim() || null,
            date_label: formDateLabel.trim(),
            is_published: formIsPublished,
          };
        }
        return item;
      });
    } else {
      // Add new
      const newItem: TestimonialItem = {
        id: `t-${Date.now()}`,
        name: formName.trim(),
        category: effectiveCategory,
        quote: formQuoteEn.trim(),
        quote_sw: formQuoteSw.trim() || formQuoteEn.trim(),
        avatar_url: formAvatar.trim() || null,
        date_label: formDateLabel.trim(),
        is_published: formIsPublished,
      };
      nextItems = [newItem, ...currentItems];
    }

    const ok = await saveToDatabase(nextItems);
    if (ok) {
      setIsFormOpen(false);
      setEditingId(null);
    }
  };

  // Delete Testimony
  const handleDeleteTestimonial = (item: TestimonialItem) => {
    showAlert?.({
      type: 'warning',
      title: `Delete Testimony?`,
      message: `Are you sure you want to permanently delete the testimony from "${item.name}"? This action will remove it from the public website.`,
      showCancel: true,
      confirmLabel: 'Yes, Delete',
      onConfirm: async () => {
        const nextItems = currentItems.filter((i) => i.id !== item.id);
        await saveToDatabase(nextItems);
      },
    });
  };

  // Quick Toggle Publish
  const handleTogglePublish = async (item: TestimonialItem) => {
    const nextItems = currentItems.map((i) =>
      i.id === item.id ? { ...i, is_published: !i.is_published } : i
    );
    await saveToDatabase(nextItems);
  };

  // Reorder Item (Move Up/Down)
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentItems.length) return;
    const nextItems = [...currentItems];
    const [moved] = nextItems.splice(index, 1);
    nextItems.splice(targetIndex, 0, moved);
    await saveToDatabase(nextItems);
  };

  // Save Headings
  const handleSaveHeadings = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await saveToDatabase(currentItems, {
      heading_en: headingEn,
      heading_sw: headingSw,
      subtitle_en: subtitleEn,
      subtitle_sw: subtitleSw,
    });
    if (ok) {
      setIsHeadingSettingsOpen(false);
    }
  };

  // Filtered List
  const filteredItems = currentItems.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.quote?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && item.is_published !== false) ||
      (statusFilter === 'hidden' && item.is_published === false);

    return matchesSearch && matchesStatus;
  });

  const publishedCount = currentItems.filter((i) => i.is_published !== false).length;
  const hiddenCount = currentItems.filter((i) => i.is_published === false).length;

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-white border border-gray-200 p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-xs uppercase tracking-wider rounded">
              Website Testimonies
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {currentItems.length} Total ({publishedCount} Live, {hiddenCount} Hidden)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquareQuote className="w-6 h-6 text-[#E6A500]" />
            Testimonies & Voices of Impact
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Manage beneficiary, youth, parent, community, and partner testimonies displayed on
            the public Babawatoto website right where stories of change were previously located.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsHeadingSettingsOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#E6A500]" />
            Section Heading
          </button>
          <button
            type="button"
            onClick={handleOpenAddForm}
            className="px-4 py-2 text-xs font-bold text-black bg-[#E6A500] hover:bg-[#d49700] rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Testimony
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, quote or tag..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-500 font-medium">Status:</span>
          {(['all', 'published', 'hidden'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Testimonies Grid / Cards */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center space-y-3">
          <MessageSquareQuote className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No Testimonies Found</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {searchQuery
              ? `No testimony matched your search query "${searchQuery}".`
              : 'No testimonies have been added yet.'}
          </p>
          <button
            type="button"
            onClick={handleOpenAddForm}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#E6A500] text-black font-bold text-xs rounded-lg cursor-pointer mt-2"
          >
            <Plus className="w-4 h-4" />
            Add First Testimony
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item, idx) => {
            const originalIndex = currentItems.findIndex((i) => i.id === item.id);
            return (
              <div
                key={item.id}
                className={`bg-white border rounded-xl p-5 flex flex-col justify-between transition relative ${
                  item.is_published !== false
                    ? 'border-gray-200 hover:border-black'
                    : 'border-gray-200 bg-gray-50/50 opacity-80'
                }`}
              >
                <div>
                  {/* Top Header Row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {item.avatar_url ? (
                        <img
                          src={item.avatar_url}
                          alt={item.name}
                          className="w-12 h-12 rounded-full object-cover border border-amber-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-sm">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                        {item.category && (
                          <p className="text-xs text-[#d49700] font-semibold line-clamp-1">
                            {item.category}
                          </p>
                        )}
                        {item.date_label && (
                          <span className="text-[11px] text-gray-400 block">{item.date_label}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          item.is_published !== false
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {item.is_published !== false ? 'Live' : 'Hidden'}
                      </span>
                    </div>
                  </div>

                  {/* Quote English */}
                  <blockquote className="text-xs text-gray-700 italic border-l-2 border-[#E6A500] pl-2.5 py-0.5 mb-2 line-clamp-4 leading-relaxed">
                    "{item.quote}"
                  </blockquote>

                  {/* Swahili Quote (if present) */}
                  {item.quote_sw && item.quote_sw !== item.quote && (
                    <blockquote className="text-[11px] text-gray-500 italic pl-2.5 border-l-2 border-gray-200 mb-3 line-clamp-2 leading-relaxed">
                      "{item.quote_sw}"
                    </blockquote>
                  )}
                </div>

                {/* Bottom Actions Bar */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs mt-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Move Up"
                      disabled={originalIndex === 0}
                      onClick={() => handleMove(originalIndex, 'up')}
                      className="p-1 text-gray-400 hover:text-black disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Move Down"
                      disabled={originalIndex === currentItems.length - 1}
                      onClick={() => handleMove(originalIndex, 'down')}
                      className="p-1 text-gray-400 hover:text-black disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      title={item.is_published !== false ? 'Hide from Website' : 'Publish to Website'}
                      onClick={() => handleTogglePublish(item)}
                      className="p-1.5 text-gray-600 hover:text-black rounded hover:bg-gray-100 transition cursor-pointer"
                    >
                      {item.is_published !== false ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      title="Edit Testimony"
                      onClick={() => handleOpenEditForm(item)}
                      className="p-1.5 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Delete Testimony"
                      onClick={() => handleDeleteTestimonial(item)}
                      className="p-1.5 text-red-600 hover:text-red-800 rounded hover:bg-red-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Testimony Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquareQuote className="w-5 h-5 text-[#E6A500]" />
                  {editingId ? 'Edit Testimony' : 'Add New Testimony'}
                </h3>
                <p className="text-xs text-gray-500">
                  Fill in the beneficiary, youth, parent or partner testimony details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Row 1: Name and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Person Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Amina Juma"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Beneficiary / Contributor Category
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isManualCategory) {
                          setIsManualCategory(true);
                          if (!manualCategoryText) {
                            setManualCategoryText(formCategory !== '__custom__' ? formCategory : '');
                          }
                        } else {
                          setIsManualCategory(false);
                          if (DEFAULT_PRESET_CATEGORIES.includes(manualCategoryText.trim())) {
                            setFormCategory(manualCategoryText.trim());
                          } else {
                            setFormCategory(DEFAULT_PRESET_CATEGORIES[0]);
                          }
                        }
                      }}
                      className="text-[11px] font-semibold text-[#b88000] hover:text-black underline cursor-pointer"
                    >
                      {isManualCategory ? '← Choose from Preset List' : '✍ Write Manually'}
                    </button>
                  </div>

                  {isManualCategory ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={manualCategoryText}
                        onChange={(e) => setManualCategoryText(e.target.value)}
                        placeholder="e.g. Young Mother, Vocational Trainee, Foster Caregiver"
                        className="w-full px-3 py-2 text-xs border border-[#E6A500] bg-amber-50/20 rounded-lg focus:outline-none focus:border-black font-medium"
                        autoFocus
                      />
                      <p className="text-[10px] text-gray-500">
                        Type any custom category name. This will display on the testimony badge.
                      </p>
                    </div>
                  ) : (
                    <select
                      value={formCategory}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__custom__') {
                          setIsManualCategory(true);
                          setFormCategory('__custom__');
                          if (!manualCategoryText) {
                            setManualCategoryText('');
                          }
                        } else {
                          setFormCategory(val);
                        }
                      }}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
                    >
                      {DEFAULT_PRESET_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__custom__">✍ Write Custom Category Manually...</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Row 2: Date / Cohort / Center Tag */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Date / Cohort / Center Tag (Optional)
                </label>
                <input
                  type="text"
                  value={formDateLabel}
                  onChange={(e) => setFormDateLabel(e.target.value)}
                  placeholder="e.g. Class of 2023, Kigogo Center, October 2024"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              {/* Avatar / Photograph Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Avatar / Photograph
                </label>
                <div className="flex items-center gap-4 p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#E6A500] bg-white shrink-0 flex items-center justify-center shadow-sm">
                    {formAvatar ? (
                      <img
                        src={formAvatar}
                        alt={formName || 'Avatar preview'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-lg">
                        {formName ? formName.charAt(0).toUpperCase() : <User className="w-7 h-7 text-amber-600/60" />}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E6A500] hover:bg-[#d49700] text-black text-xs font-bold rounded-lg cursor-pointer transition">
                        {uploadingAvatar ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{uploadingAvatar ? 'Uploading Photo...' : 'Upload Photograph'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingAvatar}
                          onChange={handleAvatarUpload}
                        />
                      </label>
                      {formAvatar && (
                        <button
                          type="button"
                          onClick={() => setFormAvatar('')}
                          className="px-2.5 py-1.5 bg-white border border-gray-300 text-gray-600 hover:text-red-600 text-xs font-semibold rounded-lg transition cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 truncate">
                      {formAvatar
                        ? formAvatar
                        : 'No photo uploaded. Click "Upload Photograph" to select a photo from your device.'}
                    </p>
                  </div>
                </div>

                {media && media.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    <span className="text-[11px] text-gray-400 whitespace-nowrap">Or choose from Media Library:</span>
                    {media.slice(0, 6).map((m: any) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setFormAvatar(m.file_path || m.public_url || '')}
                        className="px-2 py-0.5 text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded truncate max-w-[120px] cursor-pointer"
                      >
                        {m.original_filename || 'image'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quote English * */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Testimony Quote (English) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formQuoteEn}
                  onChange={(e) => setFormQuoteEn(e.target.value)}
                  placeholder="Share the full spoken or written testimony of the beneficiary or partner..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black leading-relaxed"
                />
              </div>

              {/* Quote Swahili */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Testimony Quote (Swahili - Optional)
                </label>
                <textarea
                  rows={3}
                  value={formQuoteSw}
                  onChange={(e) => setFormQuoteSw(e.target.value)}
                  placeholder="Weka ushuhuda kwa lugha ya Kiswahili..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black leading-relaxed"
                />
              </div>

              {/* Published switch */}
              <div className="pt-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="formIsPublished"
                  checked={formIsPublished}
                  onChange={(e) => setFormIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                />
                <label htmlFor="formIsPublished" className="text-xs font-bold text-gray-800 cursor-pointer">
                  Publish this testimony immediately on the public website
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-black bg-[#E6A500] hover:bg-[#d49700] rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : editingId ? 'Update Testimony' : 'Save Testimony'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configure Section Headings Modal */}
      {isHeadingSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-gray-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#E6A500]" />
                  Configure Section Headings
                </h3>
                <p className="text-xs text-gray-500">
                  Customize the title and subtitle shown above testimonies on the homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHeadingSettingsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHeadings} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Section Heading (English)
                </label>
                <input
                  type="text"
                  required
                  value={headingEn}
                  onChange={(e) => setHeadingEn(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Section Heading (Swahili)
                </label>
                <input
                  type="text"
                  required
                  value={headingSw}
                  onChange={(e) => setHeadingSw(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Subtitle (English)
                </label>
                <textarea
                  rows={2}
                  value={subtitleEn}
                  onChange={(e) => setSubtitleEn(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Subtitle (Swahili)
                </label>
                <textarea
                  rows={2}
                  value={subtitleSw}
                  onChange={(e) => setSubtitleSw(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsHeadingSettingsOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-black bg-[#E6A500] hover:bg-[#d49700] rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Headings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

