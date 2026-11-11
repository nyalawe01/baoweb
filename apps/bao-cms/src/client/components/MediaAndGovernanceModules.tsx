import React, { useState, useRef } from 'react';
import {
  Upload,
  Trash2,
  Save,
  RefreshCw,
  Download,
  Lock,
  Globe,
  Search,
  BarChart3,
  FileText,
  Handshake,
  Users,
  Settings,
  Compass,
  Mail,
  ShieldCheck,
  Activity,
  Plus,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
  Edit3,
  Check,
  X,
  LayoutGrid,
  BookOpen,
  FolderKanban,
  Share2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ChevronRight,
  Link2,
  Phone,
  MapPin,
  Layers,
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
import {
  MEDIA_CATEGORIES,
  PUBLICATION_STATUSES,
  SYSTEM_ROLES,
  type MediaCategory,
  type PublicationStatus,
} from '@bao/shared';
import { supabase } from '../supabase.js';
import { type SweetAlertOptions } from './SweetAlertModal.js';
import { stripHtmlForEditing, plainTextToFormattedHtml } from './ContentModules.js';
import { HeroBannerImageUploader } from './HeroBannerImageUploader.js';

export function MediaLibraryModule({
  media,
  accessToken,
  onRefresh,
  notify,
}: {
  media: any[];
  accessToken: string;
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<MediaCategory>('organization');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [title, setTitle] = useState('');
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [filterCat, setFilterCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceId, setReplaceId] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!selectedFile) {
      notify('Please choose a file to upload.', true);
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', category);
      formData.append('visibility', visibility);
      formData.append('title', title || selectedFile.name);
      formData.append('alt_text', altText || title || selectedFile.name);
      formData.append('caption', caption);

      const endpoint = replaceId
        ? `/api/v1/media/${replaceId}/replace`
        : '/api/v1/media/upload';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      notify(replaceId ? 'Media file replaced cleanly.' : 'Media uploaded and verified.');
      setSelectedFile(null);
      setTitle('');
      setAltText('');
      setCaption('');
      setReplaceId(null);
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this media item from cPanel storage and database?')) return;
    try {
      const res = await fetch(`/api/v1/media/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      notify('Media file deleted.');
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  const handleDownloadPrivate = async (id: string, filename: string) => {
    try {
      const res = await fetch(`/api/v1/media/${id}/download-private`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Unauthorized or missing private file');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  const filtered = media.filter((m) => {
    if (filterCat !== 'all' && m.category !== filterCat) return false;
    if (
      searchQuery &&
      !`${m.title || ''} ${m.original_filename || ''} ${m.alt_text || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Row 1: Upload / Replace Media File Card (Full Width) */}
      <div className="w-full bg-white rounded-xl border border-[#E5E7E5] p-5 space-y-4 shadow-xs">
        <h3 className="font-bold text-[#000000] flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#E6A500]" />
          {replaceId ? 'Replace Existing Media File' : 'Upload to cPanel Storage'}
        </h3>
        {replaceId && (
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs flex items-center justify-between">
            <span>Replacing media ID: {replaceId.slice(0, 8)}...</span>
            <button onClick={() => setReplaceId(null)} className="font-bold underline">
              Cancel
            </button>
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold mb-1">Select File</label>
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="w-full text-xs border border-[#E5E7E5] rounded-lg p-2"
          />
          <p className="text-[11px] text-[#555B57] mt-1">
            Magic-byte signature validated server-side (JPEG, PNG, WebP, GIF, PDF, DOCX, XLSX, MP4).
          </p>
        </div>

        {!replaceId && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MediaCategory)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-xs"
              >
                {MEDIA_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-xs"
              >
                <option value="public">Public (/media/public)</option>
                <option value="private">Private (Auth Only)</option>
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Descriptive media title"
            className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">
            Accessibility Alt Text (WCAG 2.1 AA)
          </label>
          <input
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Describe image for screen readers"
            className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Caption</label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
          />
        </div>

        <button
          disabled={uploading}
          onClick={handleUpload}
          className="w-full py-2.5 rounded-lg bg-[#E6A500] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#cc9200] disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Validating & Uploading...' : replaceId ? 'Replace File' : 'Upload File'}
        </button>
      </div>

      {/* Row 2: Media Asset Browser & Search (Full Width) */}
      <div className="w-full bg-white rounded-xl border border-[#E5E7E5] p-6 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#555B57] absolute left-3 top-2.5" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search media by title, filename, or alt text..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E5E7E5] text-xs"
            />
          </div>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#E5E7E5] text-xs"
          >
            <option value="all">All Categories ({media.length})</option>
            {MEDIA_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[640px] overflow-y-auto pr-1">
          {filtered.map((item) => {
            const isImg = item.mime_type?.startsWith('image/');
            const imgUrl =
              item.visibility === 'public' ? `/media/${item.storage_key}` : undefined;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-[#E5E7E5] overflow-hidden bg-[#FFFFFF]/40 flex flex-col justify-between"
              >
                <div>
                  <div className="h-36 bg-[#E6A500]/10 flex items-center justify-center overflow-hidden relative">
                    {isImg && imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={item.alt_text || item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-10 h-10 text-[#555B57]" />
                    )}
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#E6A500] text-black flex items-center gap-1">
                      {item.visibility === 'private' ? (
                        <Lock className="w-2.5 h-2.5" />
                      ) : (
                        <Globe className="w-2.5 h-2.5" />
                      )}
                      {item.category}
                    </span>
                  </div>
                  <div className="p-3">
                    <div className="font-semibold text-xs text-[#000000] truncate">
                      {item.title || item.original_filename}
                    </div>
                    <div className="text-[11px] text-[#555B57] truncate mt-0.5">
                      Alt: {item.alt_text || 'None'}
                    </div>
                    <div className="text-[10px] text-[#555B57] mt-1 font-mono">
                      {(Number(item.file_size || 0) / 1024).toFixed(1)} KB · {item.file_extension}
                    </div>
                  </div>
                </div>
                <div className="px-3 pb-3 pt-1 flex items-center justify-between border-t border-[#E5E7E5] text-[11px]">
                  <button
                    onClick={() => {
                      setReplaceId(item.id);
                      setTitle(item.title || '');
                      setAltText(item.alt_text || '');
                    }}
                    className="text-[#E6A500] font-semibold flex items-center gap-1 hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" /> Replace
                  </button>
                  {item.visibility === 'private' && (
                    <button
                      onClick={() =>
                        handleDownloadPrivate(item.id, item.original_filename || 'document.pdf')
                      }
                      className="text-[#000000] font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Download className="w-3 h-3" /> Download
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs text-[#555B57]">
              No media items match the selected filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PartnersAndTeamModule({
  partners,
  team,
  media,
  accessToken,
  onRefresh,
  notify,
  showAlert,
}: {
  partners: any[];
  team: any[];
  media: any[];
  accessToken?: string;
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
  showAlert?: (opts: SweetAlertOptions) => void;
}) {
  const [tab, setTab] = useState<'partners' | 'team'>('partners');
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Partner State (Edit, Add, Direct Logo Upload)
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [partnerCategory, setPartnerCategory] = useState<
    'institutional_donor' | 'foundation' | 'implementing' | 'government' | 'corporate' | 'network'
  >('institutional_donor');
  const [partnerWebsite, setPartnerWebsite] = useState('');
  const [partnerDescEn, setPartnerDescEn] = useState('');
  const [partnerFocusEn, setPartnerFocusEn] = useState('');
  const [partnerLogoId, setPartnerLogoId] = useState('');
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Team Member State
  const [memberName, setMemberName] = useState('');
  const [memberGroup, setMemberGroup] = useState<'board' | 'executive' | 'programme_lead' | 'staff'>(
    'executive'
  );
  const [memberPhotoId, setMemberPhotoId] = useState('');
  const [memberRoleEn, setMemberRoleEn] = useState('');
  const [memberBioEn, setMemberBioEn] = useState('');

  const resolvePartnerLogoUrl = (logoMediaId?: string | null) => {
    if (!logoMediaId) return null;
    if (logoMediaId.startsWith('/') || logoMediaId.startsWith('http')) return logoMediaId;
    const m = media.find((item) => item.id === logoMediaId);
    if (!m) return null;
    return m.public_url || (m.storage_key ? `/media/${m.storage_key}` : null);
  };

  const handleSelectPartner = (p: any) => {
    setEditingPartnerId(p.id);
    setPartnerName(p.name || '');
    setPartnerCategory(
      (p.partner_type || p.partner_category || 'institutional_donor') as any
    );
    setPartnerWebsite(p.website_url || '');
    setPartnerDescEn(p.description_en || p.partnership_description_en || '');
    setPartnerFocusEn(p.partnership_focus_en || '');
    setPartnerLogoId(p.logo_media_id || '');
    setPendingLogoFile(null);
    const existingUrl = resolvePartnerLogoUrl(p.logo_media_id) || p.logo_url || null;
    setLogoPreview(existingUrl);
    if (logoFileInputRef.current) logoFileInputRef.current.value = '';
  };

  const handleResetPartnerForm = () => {
    setEditingPartnerId(null);
    setPartnerName('');
    setPartnerCategory('institutional_donor');
    setPartnerWebsite('');
    setPartnerDescEn('');
    setPartnerFocusEn('');
    setPartnerLogoId('');
    setPendingLogoFile(null);
    setLogoPreview(null);
    if (logoFileInputRef.current) logoFileInputRef.current.value = '';
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingLogoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);
  };

  const handleRemoveLogo = () => {
    setPendingLogoFile(null);
    setLogoPreview(null);
    setPartnerLogoId('');
    if (logoFileInputRef.current) logoFileInputRef.current.value = '';
  };

  const savePartner = async () => {
    if (!partnerName.trim()) {
      notify('Partner / Donor organization name is required.', true);
      showAlert?.({
        type: 'warning',
        title: 'Partner Name Required',
        message: 'Please provide the partner organization or donor name.',
      });
      return;
    }

    setSaving(true);
    showAlert?.({
      type: 'loading',
      title: editingPartnerId ? 'Updating Partner...' : 'Saving Partner...',
      message: pendingLogoFile
        ? 'Uploading partner logo to media storage and updating database...'
        : 'Writing partner record to database...',
    });

    try {
      let finalLogoMediaId = partnerLogoId || null;

      // 1. If a new logo file was chosen, upload it to the server
      if (pendingLogoFile) {
        setUploadingLogo(true);
        const formData = new FormData();
        formData.append('file', pendingLogoFile);
        formData.append('category', 'partners');
        formData.append('visibility', 'public');
        formData.append('title', `${partnerName.trim()} Logo`);
        formData.append('alt_text', `${partnerName.trim()} Official Logo`);

        const uploadRes = await fetch('/api/v1/media/upload', {
          method: 'POST',
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Failed to upload partner logo image.');
        }

        finalLogoMediaId = uploadData.media.id;
      }

      // 2. Insert or update in Supabase partners table
      if (editingPartnerId) {
        const { error } = await supabase
          .from('partners')
          .update({
            name: partnerName.trim(),
            partner_type: partnerCategory,
            logo_media_id: finalLogoMediaId,
            website_url: partnerWebsite.trim() || null,
            description_en: partnerDescEn.trim(),
            description_sw: partnerDescEn.trim(),
            partnership_focus_en: partnerFocusEn.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingPartnerId);

        if (error) throw error;
        notify('Partner updated successfully.');
        showAlert?.({
          type: 'success',
          title: 'Partner Updated Successfully!',
          message: `Partner "${partnerName}" has been updated in the database and is live on the website!`,
          websiteUrl: 'http://localhost:3000/get-involved',
          websiteLabel: 'View on Website ↗',
        });
      } else {
        const { error } = await supabase.from('partners').insert({
          name: partnerName.trim(),
          partner_type: partnerCategory,
          logo_media_id: finalLogoMediaId,
          website_url: partnerWebsite.trim() || null,
          description_en: partnerDescEn.trim(),
          description_sw: partnerDescEn.trim(),
          partnership_focus_en: partnerFocusEn.trim() || null,
          display_order: partners.length + 1,
          is_active: true,
        });

        if (error) throw error;
        notify('Partner saved successfully.');
        showAlert?.({
          type: 'success',
          title: 'Partner Saved Successfully!',
          message: `Partner "${partnerName}" with uploaded logo has been added to the database and is live on the website!`,
          websiteUrl: 'http://localhost:3000/get-involved',
          websiteLabel: 'View on Website ↗',
        });
      }

      handleResetPartnerForm();
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
      showAlert?.({
        type: 'error',
        title: 'Could Not Save Partner',
        message: err.message || 'Failed to save partner record.',
      });
    } finally {
      setSaving(false);
      setUploadingLogo(false);
    }
  };

  const saveTeamMember = async () => {
    if (!memberName || !memberRoleEn) {
      notify('Full name and role title are required.', true);
      showAlert?.({
        type: 'warning',
        title: 'Details Required',
        message: 'Please provide both full name and role title for this team member.',
      });
      return;
    }
    setSaving(true);
    showAlert?.({
      type: 'loading',
      title: 'Saving Team Member...',
      message: 'Storing staff/leadership profile in database...',
    });
    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          full_name: memberName,
          group_type: memberGroup,
          role_title_en: memberRoleEn,
          role_title_sw: memberRoleEn,
          bio_en: memberBioEn,
          bio_sw: memberBioEn,
          photo_media_id: memberPhotoId || null,
          display_order: team.length + 1,
          status: 'published',
        });
      if (error) throw error;
      notify('Team profile saved.');
      await onRefresh();
      showAlert?.({
        type: 'success',
        title: 'Team Profile Saved!',
        message: `Leadership/team profile for "${memberName}" has been saved and is live on the website!`,
        websiteUrl: 'http://localhost:3000/about/leadership',
        websiteLabel: 'View Team on Website ↗',
      });
      setMemberName('');
      setMemberRoleEn('');
      setMemberBioEn('');
    } catch (err: any) {
      notify(err.message, true);
      showAlert?.({
        type: 'error',
        title: 'Could Not Save Team Profile',
        message: err.message || 'Failed to save team member.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setTab('partners')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${tab === 'partners' ? 'bg-[#E6A500] text-black' : 'bg-white border border-[#E5E7E5] text-black'
            }`}
        >
          <Handshake className="w-4 h-4" /> Partners & Institutional Donors ({partners.length})
        </button>
        <button
          onClick={() => setTab('team')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${tab === 'team' ? 'bg-[#E6A500] text-black' : 'bg-white border border-[#E5E7E5] text-black'
            }`}
        >
          <Users className="w-4 h-4" /> Leadership & Team ({team.length})
        </button>
      </div>

      {tab === 'partners' ? (
        <div className="space-y-6">
          {/* Row 1: Registered Partners List (Full Width) */}
          <div className="w-full bg-white rounded-xl border border-[#E5E7E5] p-5 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7E5] pb-3">
              <div>
                <h4 className="font-extrabold text-base text-[#000000]">
                  Registered Partners & Institutional Donors ({partners.length})
                </h4>
                <p className="text-xs text-[#555B57]">
                  Stored live in database table <code>partners</code>. Click any partner card to edit its details or change its logo.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetPartnerForm}
                className="px-3.5 py-1.5 rounded-lg bg-[#E6A500] text-black text-xs font-bold hover:bg-[#d49700] transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add New Partner
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[420px] overflow-y-auto pr-1">
              {partners.map((p) => {
                const logoUrl = resolvePartnerLogoUrl(p.logo_media_id) || p.logo_url;
                const isSelected = editingPartnerId === p.id;
                const categoryLabel = (p.partner_type || p.partner_category || 'institutional_donor').replace(/_/g, ' ');
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPartner(p)}
                    className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'border-[#E6A500] ring-2 ring-[#E6A500] bg-amber-50/20 shadow-md'
                        : 'border-[#E5E7E5] bg-white hover:border-[#E6A500]/60 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-14 rounded-lg border border-[#E5E7E5] bg-white flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={p.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-[#555B57]/40" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm text-[#000000] line-clamp-1">{p.name}</div>
                        <div className="text-[11px] uppercase text-[#E6A500] font-extrabold tracking-wide">
                          {categoryLabel}
                        </div>
                        <p className="text-xs text-[#555B57] mt-1 line-clamp-2">
                          {p.description_en || p.partnership_focus_en || p.partnership_description_en || 'Partner supporting BAO programmes.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#F4F5F4] text-xs">
                      <span className="font-bold text-[#E6A500] flex items-center gap-1 hover:underline">
                        <Edit3 className="w-3.5 h-3.5" /> Edit / Change Logo
                      </span>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete partner "${p.name}" from database?`)) {
                            await supabase.from('partners').delete().eq('id', p.id);
                            if (editingPartnerId === p.id) handleResetPartnerForm();
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
              {partners.length === 0 && (
                <p className="col-span-full text-xs text-[#555B57] py-6 text-center">No partners registered yet.</p>
              )}
            </div>
          </div>

          {/* Row 2: Add / Edit Partner Form (Full Width) */}
          <div className="w-full bg-white rounded-xl border border-[#E5E7E5] p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E5E7E5] pb-3">
              <div>
                <h4 className="font-bold text-base text-[#000000] flex items-center gap-2">
                  <Handshake className="w-4 h-4 text-[#E6A500]" />
                  {editingPartnerId ? `Edit Partner: ${partnerName}` : 'Add New Partner / Institutional Donor'}
                </h4>
                <p className="text-xs text-[#555B57]">
                  {editingPartnerId
                    ? 'Updating existing database partner record and logo.'
                    : 'The logo will be uploaded and stored directly in database storage, live on the website.'}
                </p>
              </div>
              {editingPartnerId && (
                <button
                  type="button"
                  onClick={handleResetPartnerForm}
                  className="text-xs font-bold text-[#E6A500] hover:underline cursor-pointer"
                >
                  + Add New Partner Instead
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#000000] mb-1">Organization / Partner Name *</label>
              <input
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="e.g. UNICEF, USAID, World Vision Tanzania"
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm text-black font-semibold"
              />
            </div>

            {/* Direct Image / Logo Upload Section (NO DROPDOWN) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#000000]">
                Partner Logo / Emblem (Direct File Upload) *
              </label>

              <input
                ref={logoFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoFileChange}
                className="hidden"
              />

              {logoPreview ? (
                <div className="p-4 rounded-xl border border-[#E5E7E5] bg-[#F4F5F4]/50 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-20 rounded-lg border border-[#E5E7E5] bg-white p-2 flex items-center justify-center shrink-0">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-black flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        {pendingLogoFile
                          ? `New file selected: ${pendingLogoFile.name}`
                          : 'Current database logo active'}
                      </div>
                      <div className="text-[11px] text-[#555B57] mt-0.5">
                        {pendingLogoFile
                          ? `${Math.round(pendingLogoFile.size / 1024)} KB · Will be uploaded on save`
                          : 'Linked to media assets library'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => logoFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg border border-[#E5E7E5] bg-white text-xs font-bold hover:bg-neutral-50 text-black cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#E6A500]" /> Upload / Replace Logo
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 cursor-pointer flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => logoFileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E5E7E5] hover:border-[#E6A500] rounded-xl p-6 text-center cursor-pointer transition bg-[#F4F5F4]/40 hover:bg-[#F4F5F4]"
                >
                  <Upload className="w-8 h-8 text-[#E6A500] mx-auto mb-2" />
                  <div className="text-sm font-bold text-black">
                    Click to Choose or Drag & Drop Partner Logo File
                  </div>
                  <p className="text-xs text-[#555B57] mt-1">
                    Accepts WebP, PNG, JPEG, SVG (transparent or white background recommended)
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#000000] mb-1">Official Website URL (Optional)</label>
              <input
                value={partnerWebsite}
                onChange={(e) => setPartnerWebsite(e.target.value)}
                placeholder="https://www.unicef.org/tanzania/"
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm font-mono text-black"
              />
            </div>

            <button
              onClick={savePartner}
              disabled={saving || uploadingLogo}
              className="w-full py-3 rounded-lg bg-[#E6A500] hover:bg-[#d49700] text-black font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-xs disabled:opacity-50"
            >
              {saving || uploadingLogo ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploadingLogo ? 'Uploading Logo...' : 'Saving to Database...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editingPartnerId ? 'Save & Update Partner' : 'Add Partner & Publish to Website'}
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Row 1: Team Profiles List (Full Width) */}
          <div className="w-full bg-white rounded-xl border border-[#E5E7E5] p-5 space-y-3 shadow-xs">
            <h4 className="font-bold text-base text-[#000000]">Team Profiles ({team.length})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {team.map((m) => {
                const enT = (m.team_member_translations || []).find((t: any) => t.language === 'en');
                return (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl border border-[#E5E7E5] flex items-center justify-between bg-white"
                  >
                    <div>
                      <div className="font-bold text-sm text-[#000000]">{m.full_name}</div>
                      <div className="text-xs text-[#E6A500] font-semibold">
                        {enT?.role_title} ({m.leadership_group})
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        await supabase.from('team_members').delete().eq('id', m.id);
                        await onRefresh();
                      }}
                      className="text-red-600 text-xs hover:underline cursor-pointer shrink-0 font-bold"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
              {team.length === 0 && (
                <p className="col-span-full text-xs text-[#555B57] py-6 text-center">No team members registered yet.</p>
              )}
            </div>
          </div>

          {/* Row 2: Add Leadership / Team Member Form (Full Width) */}
          <div className="w-full bg-white rounded-xl border border-[#E5E7E5] p-6 space-y-4 shadow-xs">
            <h4 className="font-bold text-base text-[#000000]">Add Leadership / Team Member</h4>
            <input
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="Full Name"
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
            />
            <input
              value={memberRoleEn}
              onChange={(e) => setMemberRoleEn(e.target.value)}
              placeholder="Role Title (e.g. Executive Director)"
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
            />
            <select
              value={memberGroup}
              onChange={(e) => setMemberGroup(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
            >
              <option value="board">Board of Directors</option>
              <option value="executive">Executive Leadership</option>
              <option value="programme_lead">Programme Lead</option>
              <option value="staff">Staff</option>
            </select>
            <select
              value={memberPhotoId}
              onChange={(e) => setMemberPhotoId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
            >
              <option value="">-- Select Portrait Photo --</option>
              {media
                .filter((m) => m.mime_type?.startsWith('image/'))
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title || m.original_filename}
                  </option>
                ))}
            </select>
            <textarea
              rows={3}
              value={memberBioEn}
              onChange={(e) => setMemberBioEn(e.target.value)}
              placeholder="Biography summary"
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
            />
            <button
              onClick={saveTeamMember}
              className="w-full py-2.5 rounded-lg bg-[#E6A500] text-white text-xs font-semibold"
            >
              Save Team Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ResourcesAndImpactModule({
  publications,
  indicators,
  media,
  canPublish,
  onRefresh,
  notify,
  showAlert,
}: {
  publications: any[];
  indicators: any[];
  media: any[];
  canPublish: boolean;
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
  showAlert?: (opts: SweetAlertOptions) => void;
}) {
  const [tab, setTab] = useState<'impact' | 'publications'>('impact');
  const [saving, setSaving] = useState(false);
  const [editingIndicatorId, setEditingIndicatorId] = useState<string | null>(null);
  const [indKey, setIndKey] = useState('');
  const [labelEn, setLabelEn] = useState('');
  const [labelSw, setLabelSw] = useState('');
  const [unit, setUnit] = useState('children');
  const [periodLabel, setPeriodLabel] = useState('Cumulative Verified');
  const [numericValue, setNumericValue] = useState('');
  const [sourceNote, setSourceNote] = useState('BAO MEL Records');

  const [pubTitle, setPubTitle] = useState('');
  const [pubSlug, setPubSlug] = useState('');
  const [pubSummary, setPubSummary] = useState('');
  const [pubCategory, setPubCategory] = useState<
    'annual_report' | 'policy' | 'research' | 'guideline' | 'newsletter' | 'manual'
  >('annual_report');
  const [pubYear, setPubYear] = useState(new Date().getFullYear());
  const [pubFileId, setPubFileId] = useState('');

  const saveIndicator = async () => {
    if (!labelEn.trim()) {
      notify('Indicator English label is required.', true);
      showAlert?.({
        type: 'warning',
        title: 'Indicator Label Required',
        message: 'Please provide an English label for this indicator.',
      });
      return;
    }
    setSaving(true);
    showAlert?.({
      type: 'loading',
      title: editingIndicatorId ? 'Updating MEL Indicator...' : 'Saving MEL Indicator...',
      message: 'Writing impact indicator and verification records to database...',
    });
    try {
      const cleanKey = (indKey || labelEn)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(^_|_$)/g, '') || `ind_${Date.now()}`;

      let indId = editingIndicatorId;

      if (editingIndicatorId) {
        const { error: updErr } = await supabase
          .from('impact_indicators')
          .update({
            code: cleanKey,
            name_en: labelEn.trim(),
            name_sw: (labelSw || labelEn).trim(),
            description_en: sourceNote.trim() || 'BAO MEL Records',
            description_sw: sourceNote.trim() || 'BAO MEL Records',
            measurement_unit_en: unit.trim() || 'children',
            measurement_unit_sw: unit.trim() || 'watoto',
            value_suffix: unit.trim() === '%' ? '%' : '+',
            status: 'published',
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingIndicatorId);
        if (updErr) throw updErr;
      } else {
        const { data, error: insErr } = await supabase
          .from('impact_indicators')
          .upsert(
            {
              code: cleanKey,
              name_en: labelEn.trim(),
              name_sw: (labelSw || labelEn).trim(),
              description_en: sourceNote.trim() || 'BAO MEL Records',
              description_sw: sourceNote.trim() || 'BAO MEL Records',
              measurement_unit_en: unit.trim() || 'children',
              measurement_unit_sw: unit.trim() || 'watoto',
              value_suffix: unit.trim() === '%' ? '%' : '+',
              chart_type: 'stat_card',
              display_order: indicators.length + 1,
              is_featured_on_home: true,
              status: 'published',
            },
            { onConflict: 'code' }
          )
          .select('id')
          .single();
        if (insErr) throw insErr;
        indId = data.id;
      }

      if (indId) {
        await supabase.from('impact_records').delete().eq('indicator_id', indId);
        const { error: recErr } = await supabase.from('impact_records').insert({
          indicator_id: indId,
          reporting_period: periodLabel.trim() || 'Cumulative Verified',
          numeric_value: Number(numericValue || 0),
          verification_source: sourceNote.trim() || 'BAO MEL Records',
          status: 'published',
        });
        if (recErr) throw recErr;
      }

      notify(editingIndicatorId ? 'Impact indicator updated.' : 'Impact indicator and record saved.');
      await onRefresh();
      showAlert?.({
        type: 'success',
        title: editingIndicatorId ? 'Indicator Updated!' : 'MEL Indicator Saved!',
        message: `Indicator "${labelEn}" with verified value ${numericValue || 0} ${unit} has been saved and is live on the website!`,
        websiteUrl: 'http://localhost:3000/impact',
        websiteLabel: 'View Impact on Website ↗',
      });
      setEditingIndicatorId(null);
      setIndKey('');
      setLabelEn('');
      setLabelSw('');
      setNumericValue('');
      setPeriodLabel('Cumulative Verified');
      setSourceNote('BAO MEL Records');
    } catch (err: any) {
      notify(err.message, true);
      showAlert?.({
        type: 'error',
        title: 'Could Not Save Indicator',
        message: err.message || 'Failed to save indicator record.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteIndicator = async (id: string, name: string) => {
    if (!window.confirm(`Delete indicator "${name}" from database?`)) return;
    try {
      await supabase.from('impact_records').delete().eq('indicator_id', id);
      const { error } = await supabase.from('impact_indicators').delete().eq('id', id);
      if (error) throw error;
      notify(`Indicator "${name}" deleted.`);
      await onRefresh();
    } catch (err: any) {
      notify(err.message || 'Failed to delete indicator.', true);
    }
  };

  const savePublication = async () => {
    if (!pubTitle || !pubSlug) {
      notify('Publication title and slug required.', true);
      showAlert?.({
        type: 'warning',
        title: 'Title & Slug Required',
        message: 'Please provide both Title and Slug for the publication.',
      });
      return;
    }
    setSaving(true);
    showAlert?.({
      type: 'loading',
      title: 'Saving Publication...',
      message: 'Storing document resource in Supabase and publishing live...',
    });
    try {
      const { error } = await supabase
        .from('resources')
        .insert({
          resource_category: pubCategory,
          publication_year: pubYear,
          file_media_id: pubFileId || null,
          title_en: pubTitle,
          title_sw: pubTitle,
          slug: pubSlug,
          description_en: pubSummary || pubTitle,
          description_sw: pubSummary || pubTitle,
          status: canPublish ? 'published' : 'pending_review',
          published_at: canPublish ? new Date().toISOString() : null,
        });
      if (error) throw error;

      notify('Resource publication saved.');
      await onRefresh();
      showAlert?.({
        type: 'success',
        title: 'Publication Saved!',
        message: `Resource publication "${pubTitle}" has been saved and is live on the website!`,
        websiteUrl: 'http://localhost:3000/resources/publications',
        websiteLabel: 'View Publications on Website ↗',
      });
      setPubTitle('');
      setPubSlug('');
      setPubSummary('');
    } catch (err: any) {
      notify(err.message, true);
      showAlert?.({
        type: 'error',
        title: 'Could Not Save Publication',
        message: err.message || 'Failed to save publication record.',
      });
    } finally {
      setSaving(false);
    }
  };

  const chartData = indicators.map((ind) => {
    const enT = (ind.impact_indicator_translations || []).find((t: any) => t.language === 'en');
    const latestRec = (ind.impact_records || [])[0];
    return {
      name: (ind.name_en || enT?.label || ind.code || ind.indicator_key || '').slice(0, 22),
      value: Number(latestRec?.numeric_value || 0),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setTab('impact')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${tab === 'impact' ? 'bg-[#E6A500] text-black' : 'bg-white border border-[#E5E7E5] text-black'
            }`}
        >
          <BarChart3 className="w-4 h-4" /> MEL Impact & Statistics ({indicators.length})
        </button>
        <button
          onClick={() => setTab('publications')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${tab === 'publications' ? 'bg-[#E6A500] text-black' : 'bg-white border border-[#E5E7E5] text-black'
            }`}
        >
          <FileText className="w-4 h-4" /> Resources & Publications ({publications.length})
        </button>
      </div>

      {tab === 'impact' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-xl border border-[#E5E7E5] p-5 space-y-3 shadow-none">
            <div className="flex items-center justify-between border-b border-[#E5E7E5] pb-2">
              <h4 className="font-bold text-sm text-[#000000]">
                {editingIndicatorId ? 'Edit MEL Impact Indicator' : 'Add MEL Impact Indicator'}
              </h4>
              {editingIndicatorId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingIndicatorId(null);
                    setIndKey('');
                    setLabelEn('');
                    setLabelSw('');
                    setNumericValue('');
                  }}
                  className="text-xs text-[#E6A500] hover:underline font-bold cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-black">Indicator Label (EN) *</label>
              <input
                value={labelEn}
                onChange={(e) => {
                  setLabelEn(e.target.value);
                  if (!editingIndicatorId && !indKey) {
                    setIndKey(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_'));
                  }
                }}
                placeholder="e.g. Street Children Reunited"
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm text-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-black">Indicator Label (SW - Optional)</label>
              <input
                value={labelSw}
                onChange={(e) => setLabelSw(e.target.value)}
                placeholder="e.g. Watoto wa Mitaani Waliounganishwa"
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm text-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-black">
                  Verified Number (Type numbers) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={numericValue}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    setNumericValue(clean);
                  }}
                  placeholder="e.g. 1500"
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm text-black font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-black">Measurement Unit</label>
                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. children, youth, %"
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-black">Reporting Period</label>
                <input
                  value={periodLabel}
                  onChange={(e) => setPeriodLabel(e.target.value)}
                  placeholder="e.g. Cumulative 2024 - 2026"
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm text-black"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-black">Verification Source</label>
                <input
                  value={sourceNote}
                  onChange={(e) => setSourceNote(e.target.value)}
                  placeholder="e.g. BAO MEL Records"
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm text-black"
                />
              </div>
            </div>

            <button
              onClick={saveIndicator}
              disabled={saving}
              className="w-full py-2.5 rounded-lg bg-[#E6A500] hover:bg-[#d49700] text-black text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-2 shadow-none"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingIndicatorId ? 'Update MEL Metric' : 'Save Verified MEL Metric'}
            </button>
          </div>

          {/* Right Column: Existing Indicators List */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-[#E5E7E5] p-5 space-y-3 shadow-none">
            <div className="flex items-center justify-between border-b border-[#E5E7E5] pb-2">
              <h4 className="font-bold text-sm text-[#000000]">
                Saved MEL Indicators ({indicators.length})
              </h4>
              <span className="text-xs text-[#555B57]">Live on Public Website</span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {indicators.map((ind) => {
                const rec = (ind.impact_records || [])[0];
                const val = rec?.numeric_value ?? ind.current_value ?? ind.target_value ?? 0;
                return (
                  <div
                    key={ind.id}
                    className="p-3.5 rounded-xl border border-[#E5E7E5] bg-[#F4F5F4]/40 flex items-center justify-between gap-3 hover:border-[#E6A500] transition"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-[#E6A500] text-black text-xs font-extrabold rounded">
                          {Number(val).toLocaleString()} {ind.measurement_unit_en || ind.value_suffix || ''}
                        </span>
                        <span className="font-bold text-sm text-black truncate">
                          {ind.name_en || ind.code}
                        </span>
                      </div>
                      <div className="text-xs text-[#555B57]">
                        Period: {rec?.reporting_period || 'Cumulative Verified'} · Source: {rec?.verification_source || ind.description_en || 'BAO MEL'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingIndicatorId(ind.id);
                          setIndKey(ind.code || '');
                          setLabelEn(ind.name_en || '');
                          setLabelSw(ind.name_sw || '');
                          setNumericValue(String(val || ''));
                          setUnit(ind.measurement_unit_en || 'children');
                          setPeriodLabel(rec?.reporting_period || 'Cumulative Verified');
                          setSourceNote(rec?.verification_source || ind.description_en || 'BAO MEL Records');
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-black bg-white border border-[#E5E7E5] hover:border-black rounded cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteIndicator(ind.id, ind.name_en || ind.code)}
                        className="p-1 text-red-600 hover:text-red-800 cursor-pointer"
                        title="Delete Indicator"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {indicators.length === 0 && (
                <p className="text-xs text-[#555B57] py-8 text-center">
                  No impact indicators created yet. Fill out the form on the left to add one!
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-xl border border-[#E5E7E5] p-5 space-y-3">
            <h4 className="font-bold text-sm text-[#000000]">Publish Resource / Report</h4>
            <input
              value={pubTitle}
              onChange={(e) => {
                setPubTitle(e.target.value);
                setPubSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '')
                );
              }}
              placeholder="Publication Title (EN)"
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={pubCategory}
                onChange={(e) => setPubCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
              >
                <option value="annual_report">Annual Report</option>
                <option value="policy">Organizational Policy</option>
                <option value="research">Research & Evaluation</option>
                <option value="guideline">Safeguarding Guideline</option>
                <option value="newsletter">Newsletter</option>
                <option value="manual">Training Manual</option>
              </select>
              <input
                type="number"
                value={pubYear}
                onChange={(e) => setPubYear(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
              />
            </div>
            <select
              value={pubFileId}
              onChange={(e) => setPubFileId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
            >
              <option value="">-- Attach Uploaded PDF/Document --</option>
              {media.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title || m.original_filename}
                </option>
              ))}
            </select>
            <textarea
              rows={3}
              value={pubSummary}
              onChange={(e) => setPubSummary(e.target.value)}
              placeholder="Executive summary of publication"
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] text-sm"
            />
            <button
              onClick={savePublication}
              className="w-full py-2.5 rounded-lg bg-[#E6A500] text-white text-xs font-semibold"
            >
              Save Publication
            </button>
          </div>
          <div className="lg:col-span-7 bg-white rounded-xl border border-[#E5E7E5] p-5 space-y-2.5">
            {publications.map((pub) => {
              const enT = (pub.publication_translations || []).find(
                (t: any) => t.language === 'en'
              );
              return (
                <div
                  key={pub.id}
                  className="p-3.5 rounded-xl border border-[#E5E7E5] flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-sm text-[#000000]">
                      {pub.title_en || enT?.title || 'Untitled Document'}
                    </div>
                    <div className="text-xs text-[#555B57]">
                      {pub.resource_category || pub.publication_category} · {pub.publication_year} · {pub.status}
                    </div>
                  </div>
                </div>
              );
            })}
            {publications.length === 0 && (
              <p className="text-xs text-[#555B57] py-12 text-center">
                No publications uploaded yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


export function HeroBannerModule({
  siteSettings,
  media = [],
  accessToken,
  onRefresh,
  notify,
  showAlert,
}: {
  siteSettings: any[];
  media?: any[];
  accessToken?: string;
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
  showAlert?: (opts: SweetAlertOptions) => void;
}) {
  const getSettingKey = (s: any) => s?.key || s?.setting_key;
  const getSettingValue = (s: any) => s?.value ?? s?.setting_value;

  const existingBannersSetting = siteSettings.find((s) => getSettingKey(s) === 'hero_banners');
  const currentBanners: any[] = getSettingValue(existingBannersSetting)?.banners || [];

  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerTitle, setBannerTitle] = useState(currentBanners[0]?.title || '');
  const [bannerSubtitle, setBannerSubtitle] = useState(stripHtmlForEditing(currentBanners[0]?.subtitle || ''));
  const [bannerBadge, setBannerBadge] = useState(currentBanners[0]?.badge || '');
  const [bannerImage, setBannerImage] = useState(
    currentBanners[0]?.image_url || '/media/public/images/organization/hero1.webp'
  );
  const [bannerPrimaryLabel, setBannerPrimaryLabel] = useState(
    currentBanners[0]?.primary_cta_label || 'Explore Our Work'
  );
  const [bannerPrimaryHref, setBannerPrimaryHref] = useState(
    currentBanners[0]?.primary_cta_href === '/programmes' ? '/projects' : (currentBanners[0]?.primary_cta_href || '/projects')
  );
  const [bannerSecondaryLabel, setBannerSecondaryLabel] = useState(
    currentBanners[0]?.secondary_cta_label || 'Partner With Us'
  );
  const [bannerSecondaryHref, setBannerSecondaryHref] = useState(
    currentBanners[0]?.secondary_cta_href || '/get-involved'
  );
  const [savingHeroBanner, setSavingHeroBanner] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectBanner = (banner: any) => {
    setEditingBannerId(banner.id);
    setBannerBadge(banner.badge || '');
    setBannerTitle(banner.title || '');
    setBannerSubtitle(stripHtmlForEditing(banner.subtitle || ''));
    setBannerImage(banner.image_url || '/media/public/images/organization/hero1.webp');
    setBannerPrimaryLabel(banner.primary_cta_label || 'Explore Our Work');
    setBannerPrimaryHref(
      banner.primary_cta_href === '/programmes' ? '/projects' : (banner.primary_cta_href || '/projects')
    );
    setBannerSecondaryLabel(banner.secondary_cta_label || 'Partner With Us');
    setBannerSecondaryHref(banner.secondary_cta_href || '/get-involved');
  };

  const handleResetBannerForm = () => {
    setEditingBannerId(null);
    setBannerBadge('');
    setBannerTitle('');
    setBannerSubtitle('');
    setBannerImage('/media/public/images/organization/hero1.webp');
    setBannerPrimaryLabel('Explore Our Work');
    setBannerPrimaryHref('/projects');
    setBannerSecondaryLabel('Partner With Us');
    setBannerSecondaryHref('/get-involved');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    showAlert?.({
      type: 'loading',
      title: 'Uploading Hero Image...',
      message: `Uploading ${file.name} to server media storage...`,
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'organization');
      formData.append('visibility', 'public');
      formData.append('title', `Hero Banner Background`);
      formData.append('alt_text', `Babawatoto Homepage Hero Banner`);

      const res = await fetch('/api/v1/media/upload', {
        method: 'POST',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload hero image.');
      }

      const uploadedUrl =
        data.media?.public_url || (data.media?.storage_key ? `/media/${data.media.storage_key}` : null);
      if (uploadedUrl) {
        setBannerImage(uploadedUrl);
        notify('Hero image uploaded successfully!');
        showAlert?.({
          type: 'success',
          title: 'Hero Image Uploaded!',
          message: 'The image has been uploaded and set as the hero background. Click Save to publish.',
        });
      }
    } catch (err: any) {
      notify(err.message || 'Image upload failed.', true);
      showAlert?.({
        type: 'error',
        title: 'Image Upload Failed',
        message: err.message || 'Could not upload hero background image.',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const saveHeroBannersList = async (nextBanners: any[]) => {
    const { error } = await supabase.from('site_settings').upsert(
      {
        key: 'hero_banners',
        value: { banners: nextBanners },
        is_public: true,
      },
      { onConflict: 'key' }
    );
    if (error) throw error;
    await onRefresh();
  };

  const handleSaveBanner = async () => {
    if (!bannerTitle.trim()) {
      notify('Hero headline title is required.', true);
      showAlert?.({
        type: 'warning',
        title: 'Headline Title Required',
        message: 'Please provide a headline title for the hero banner.',
      });
      return;
    }
    setSavingHeroBanner(true);
    showAlert?.({
      type: 'loading',
      title: editingBannerId ? 'Updating Hero Banner...' : 'Saving Hero Banner...',
      message: 'Writing hero banner content to PostgreSQL database site_settings...',
    });

    try {
      const bannerPayload = {
        id: editingBannerId || `banner-${Date.now()}`,
        badge: stripHtmlForEditing(bannerBadge.trim()),
        title: stripHtmlForEditing(bannerTitle.trim()),
        subtitle: stripHtmlForEditing(bannerSubtitle.trim()),
        image_url: bannerImage.trim() || '/media/public/images/organization/hero1.webp',
        primary_cta_label: 'Explore Our Work',
        primary_cta_href: '/projects',
        secondary_cta_label: 'Partner With Us',
        secondary_cta_href: '/get-involved',
      };

      let next: any[];
      if (editingBannerId) {
        next = currentBanners.map((b) => (b.id === editingBannerId ? bannerPayload : b));
      } else {
        next = [bannerPayload, ...currentBanners];
      }

      await saveHeroBannersList(next);

      // Sync to pages table where page_key === 'home'
      try {
        const { data: homePage } = await supabase.from('pages').select('id').eq('page_key', 'home').maybeSingle();
        if (homePage) {
          const { data: homeTr } = await supabase
            .from('page_translations')
            .select('id')
            .eq('page_id', homePage.id)
            .eq('language', 'en')
            .maybeSingle();
          if (homeTr) {
            await supabase
              .from('page_translations')
              .update({
                title: stripHtmlForEditing(bannerTitle.trim()),
                hero_tag: stripHtmlForEditing(bannerBadge.trim()),
                subtitle: stripHtmlForEditing(bannerSubtitle.trim()),
              })
              .eq('id', homeTr.id);
          }
        }
      } catch (homeSyncErr) {
        console.warn('Home page sync notice:', homeSyncErr);
      }

      notify(editingBannerId ? 'Hero banner updated successfully!' : 'New hero banner added successfully!');
      showAlert?.({
        type: 'success',
        title: editingBannerId ? 'Hero Banner Updated!' : 'Hero Banner Created!',
        message: 'The homepage hero section has been saved to the database and is live on the website!',
        websiteUrl: 'http://localhost:3000/',
        websiteLabel: 'View Homepage Hero ↗',
      });
      if (!editingBannerId) {
        handleResetBannerForm();
      }
    } catch (err: any) {
      notify(err.message || 'Error saving hero banner', true);
      showAlert?.({
        type: 'error',
        title: 'Could Not Save Hero Banner',
        message: err.message || 'An error occurred while saving the hero banner.',
      });
    } finally {
      setSavingHeroBanner(false);
    }
  };

  const handleRemoveBanner = async (id: string) => {
    const next = currentBanners.filter((b) => b.id !== id);
    await saveHeroBannersList(next);
    if (editingBannerId === id) {
      handleResetBannerForm();
    }
    notify('Hero banner removed from database.');
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner Header & Status */}
      <div className="bg-white rounded-xl border border-[#E5E7E5] p-6 space-y-2 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7E5] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E6A500]" />
              <h3 className="font-extrabold text-lg text-[#000000]">
                Homepage Hero Section Manager ({currentBanners.length}{' '}
                {currentBanners.length === 1 ? 'Banner — Single Static Mode' : 'Banners — Scrollable Carousel Mode'})
              </h3>
            </div>
            <p className="text-xs text-[#555B57] mt-1">
              Controls the topmost headline, narrative content, background image, and action buttons on the Babawatoto homepage.
              When 1 banner is present, it displays a single static hero banner. When 2+ banners are configured, it switches to an animated carousel.
            </p>
          </div>
          <span className="px-3.5 py-1.5 rounded-lg bg-[#E6A500]/15 text-[#E6A500] text-xs font-bold uppercase tracking-wider border border-[#E6A500]/30">
            {currentBanners.length > 1 ? 'Carousel Mode Active' : 'Single Static Banner Active'}
          </span>
        </div>

        {/* Row 1: Hero Banners List & Selection (Full Width) */}
        <div className="w-full bg-[#F4F5F4]/40 rounded-xl border border-[#E5E7E5] p-4 space-y-3 mt-4">
          <div className="flex items-center justify-between border-b border-[#E5E7E5] pb-2">
            <div>
              <h4 className="font-bold text-sm text-[#000000]">
                Configured Hero Banners ({currentBanners.length})
              </h4>
              <p className="text-xs text-[#555B57]">Click any banner card below to edit its text, buttons, or background image.</p>
            </div>
            <button
              type="button"
              onClick={handleResetBannerForm}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#E6A500] text-black hover:bg-[#d49700] transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Create New Banner
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[360px] overflow-y-auto pr-1">
            {currentBanners.map((b, idx) => {
              const isSelected = editingBannerId === b.id || (!editingBannerId && idx === 0);
              return (
                <div
                  key={b.id}
                  onClick={() => handleSelectBanner(b)}
                  className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col gap-3 ${
                    isSelected
                      ? 'border-[#E6A500] bg-white shadow-md ring-2 ring-[#E6A500]/20'
                      : 'border-[#E5E7E5] bg-white hover:border-[#E6A500]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#E6A500] text-black text-[11px] font-extrabold rounded">
                        Banner #{idx + 1}
                      </span>
                      {b.badge && (
                        <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase rounded line-clamp-1">
                          {b.badge}
                        </span>
                      )}
                    </div>
                    {currentBanners.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this hero banner from database?')) {
                            handleRemoveBanner(b.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-xs font-bold p-1 cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src={b.image_url || '/media/public/images/organization/hero1.webp'}
                      alt={b.title}
                      className="w-24 h-16 object-cover rounded border border-[#E5E7E5] shrink-0"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="font-extrabold text-sm text-[#000000] line-clamp-2">{b.title}</div>
                      <div className="text-xs text-[#555B57] line-clamp-2">{b.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-semibold text-[#555B57] pt-1 border-t border-[#F4F5F4]">
                    <span>Primary: <strong>{b.primary_cta_label || 'Explore Our Work'}</strong></span>
                    <span>·</span>
                    <span>Secondary: <strong>{b.secondary_cta_label || 'Partner With Us'}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 2: Comprehensive Hero Banner Editor Form (Full Width) */}
        <div className="w-full bg-white p-6 rounded-xl border border-[#E5E7E5] space-y-4 shadow-xs mt-4">
          <div className="flex items-center justify-between border-b border-[#E5E7E5] pb-3">
            <div>
              <h4 className="font-extrabold text-base text-[#000000] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#E6A500]" />
                {editingBannerId ? 'Edit Selected Hero Banner' : 'Create New Hero Banner'}
              </h4>
              <p className="text-xs text-[#555B57]">
                Fill out the fields in normal text. No HTML code required.
              </p>
            </div>
            {editingBannerId && (
              <button
                type="button"
                onClick={handleResetBannerForm}
                className="text-xs font-bold text-[#E6A500] hover:underline cursor-pointer"
              >
                + Create New Banner Instead
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 text-black">
              Top Badge / Eyebrow Tagline (Normal Text)
            </label>
            <input
              value={bannerBadge}
              onChange={(e) => setBannerBadge(e.target.value)}
              placeholder="e.g. Babawatoto Centre for Children & Youth"
              className="w-full px-3 py-2 bg-white rounded-lg border border-[#E5E7E5] text-sm text-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 text-black">
              Hero Headline Title (Normal Text) *
            </label>
            <input
              value={bannerTitle}
              onChange={(e) => setBannerTitle(e.target.value)}
              placeholder="e.g. Protecting Children, Restoring Families, and Empowering Youth in Tanzania"
              className="w-full px-3 py-2 bg-white rounded-lg border border-[#E5E7E5] text-sm font-bold text-black"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-black">
                Hero Content / Narrative Description (Normal Text)
              </label>
              <span className="text-[11px] text-[#555B57]">Plain Text (Auto-formatted into styled paragraphs)</span>
            </div>
            <textarea
              rows={5}
              value={bannerSubtitle}
              onChange={(e) => setBannerSubtitle(e.target.value)}
              placeholder="Type the hero description here in normal text. Paragraphs and blank lines are formatted automatically on the website..."
              className="w-full px-3 py-2 bg-white rounded-lg border border-[#E5E7E5] text-sm leading-relaxed text-black"
            />
          </div>

          {/* Background Image Upload */}
          <div className="space-y-3 p-4 rounded-xl border border-[#E5E7E5] bg-[#F4F5F4]/40">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-black">
                  Hero Background Image
                </label>
                <p className="text-[11px] text-[#555B57]">
                  Upload a photo from your computer (PNG, JPG, or WebP).
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="px-4 py-2 rounded-lg bg-[#E6A500] text-black text-xs font-bold hover:bg-[#d49700] transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Upload className="w-4 h-4" />
                {uploadingImage ? 'Uploading Image...' : bannerImage ? 'Upload / Replace Image' : 'Upload Image'}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />

            {bannerImage ? (
              <div className="relative h-48 rounded-xl overflow-hidden border border-[#E5E7E5] bg-black/5 group">
                <img src={bannerImage} alt="Hero Banner Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-between p-4">
                  <div className="text-white text-xs font-semibold">
                    <span className="px-2 py-0.5 bg-[#E6A500] text-black font-bold rounded mr-2">Preview</span>
                    {bannerTitle || 'Hero Title Preview'}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-3 py-1 bg-black/70 hover:bg-black text-white text-xs font-semibold rounded backdrop-blur-sm transition cursor-pointer flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    Change Image
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-32 border-2 border-dashed border-[#E5E7E5] hover:border-[#E6A500] rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white transition gap-2"
              >
                <Upload className="w-6 h-6 text-[#555B57]" />
                <span className="text-xs font-semibold text-[#555B57]">Click to upload hero background image</span>
              </div>
            )}
          </div>



          <div className="flex items-center justify-between pt-4 border-t border-[#E5E7E5]">
            <button
              type="button"
              onClick={handleResetBannerForm}
              className="px-4 py-2 border border-[#E5E7E5] text-xs font-bold text-[#555B57] hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              Cancel / Reset
            </button>
            <button
              type="button"
              onClick={handleSaveBanner}
              disabled={savingHeroBanner}
              className="px-6 py-2.5 bg-[#E6A500] hover:bg-[#d49700] text-black text-xs font-extrabold rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              {savingHeroBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingBannerId ? 'Update Hero Banner in Database' : 'Save Hero Banner to Database'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NavigationAndSettingsModule({
  menus,
  siteSettings,
  accessToken,
  onRefresh,
  notify,
  showAlert,
}: {
  menus: any[];
  siteSettings: any[];
  accessToken?: string;
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
  showAlert?: (opts: SweetAlertOptions) => void;
}) {
  const getSettingKey = (s: any) => s?.key || s?.setting_key;
  const getSettingValue = (s: any) => s?.value ?? s?.setting_value;

  // Active sub-tab
  const [subTab, setSubTab] = useState<
    'menus' | 'sections' | 'about-pages' | 'projects-page' | 'contact-social' | 'advanced-json'
  >('menus');

  // Navigation Menus Manager state
  const [selectedMenuId, setSelectedMenuId] = useState<string>(menus[0]?.id || '');
  const activeMenu = menus.find((m) => m.id === selectedMenuId) || menus[0];

  useEffect(() => {
    if ((!selectedMenuId || !menus.find((m) => m.id === selectedMenuId)) && menus.length > 0) {
      setSelectedMenuId(menus[0].id);
    }
  }, [menus, selectedMenuId]);

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemLabelEn, setItemLabelEn] = useState('');
  const [itemLabelSw, setItemLabelSw] = useState('');
  const [itemUrlPath, setItemUrlPath] = useState('');
  const [itemParentId, setItemParentId] = useState<string>('');
  const [itemDisplayOrder, setItemDisplayOrder] = useState<number>(1);
  const [itemIsActive, setItemIsActive] = useState<boolean>(true);
  const [itemOpenInNewTab, setItemOpenInNewTab] = useState<boolean>(false);
  const [savingMenuItem, setSavingMenuItem] = useState(false);

  const [selectedSettingKey, setSelectedSettingKey] = useState('who_we_are_section');
  const currentSetting = siteSettings.find((s) => getSettingKey(s) === selectedSettingKey);
  const [jsonText, setJsonText] = useState(
    JSON.stringify(getSettingValue(currentSetting) || {}, null, 2)
  );

  useEffect(() => {
    const found = siteSettings.find((s) => getSettingKey(s) === selectedSettingKey);
    if (found) {
      setJsonText(JSON.stringify(getSettingValue(found) || {}, null, 2));
    }
  }, [siteSettings, selectedSettingKey]);

  // Who We Are / About Us Section state (loaded from database)
  const existingWhoWeAreSetting = siteSettings.find(
    (s) => getSettingKey(s) === 'who_we_are_section'
  );
  const existingOrgProfileSetting = siteSettings.find(
    (s) => getSettingKey(s) === 'organization_profile'
  );
  const whoWeAreVal = getSettingValue(existingWhoWeAreSetting) || {};
  const orgProfileVal = getSettingValue(existingOrgProfileSetting) || {};

  const [whoBadgeEn, setWhoBadgeEn] = useState(
    whoWeAreVal.badge_en || orgProfileVal.about_badge || 'Who We Are · About Babawatoto'
  );
  const [whoTitleEn, setWhoTitleEn] = useState(
    whoWeAreVal.title_en ||
      orgProfileVal.full_name ||
      'Babawatoto Centre for Children and Youth Trust (BAO)'
  );
  const [whoSummaryEn, setWhoSummaryEn] = useState(
    stripHtmlForEditing(
      whoWeAreVal.summary_en ||
        orgProfileVal.about_summary ||
        orgProfileVal.history_summary_en ||
        'Founded in 2007 in Mburahati Barafu, Dar es Salaam, Babawatoto Centre for Children and Youth Trust (BAO) is a registered Tanzanian Non-Governmental Organization dedicated to protecting vulnerable children, reuniting street-connected youth with their families, and empowering communities through Child Protection, MEMKWA Catch-Up Education, HEART Creative Arts, and Youth Vocational Livelihoods.'
    )
  );
  const [whoCtaLabelEn, setWhoCtaLabelEn] = useState(
    whoWeAreVal.cta_label_en || orgProfileVal.about_cta_label || 'Read More'
  );
  const [whoCtaHref, setWhoCtaHref] = useState(
    whoWeAreVal.cta_href || orgProfileVal.about_cta_href || '/about/who-we-are'
  );

  useEffect(() => {
    const s = siteSettings.find((st) => getSettingKey(st) === 'who_we_are_section');
    const val = getSettingValue(s) || {};
    const orgS = siteSettings.find((st) => getSettingKey(st) === 'organization_profile');
    const orgV = getSettingValue(orgS) || {};
    if (val.badge_en || orgV.about_badge) setWhoBadgeEn(val.badge_en || orgV.about_badge);
    if (val.title_en || orgV.full_name) setWhoTitleEn(val.title_en || orgV.full_name);
    if (val.summary_en || orgV.about_summary || orgV.history_summary_en) {
      setWhoSummaryEn(stripHtmlForEditing(val.summary_en || orgV.about_summary || orgV.history_summary_en));
    }
    if (val.cta_label_en || orgV.about_cta_label) setWhoCtaLabelEn(val.cta_label_en || orgV.about_cta_label);
    if (val.cta_href || orgV.about_cta_href) setWhoCtaHref(val.cta_href || orgV.about_cta_href);
  }, [siteSettings]);

  const handleSaveWhoWeAreSection = async () => {
    showAlert?.({
      type: 'loading',
      title: 'Saving "Who We Are" Section...',
      message: 'Writing section copy to Supabase site_settings and updating homepage...',
    });
    try {
      const nextWhoWeAre = {
        ...whoWeAreVal,
        badge_en: whoBadgeEn.trim(),
        title_en: whoTitleEn.trim(),
        summary_en: whoSummaryEn.trim(),
        cta_label_en: whoCtaLabelEn.trim() || 'Read More',
        cta_href: whoCtaHref.trim() || '/about/who-we-are',
      };
      const nextOrgProfile = {
        ...orgProfileVal,
        full_name: whoTitleEn.trim(),
        about_badge: whoBadgeEn.trim(),
        about_summary: whoSummaryEn.trim(),
        about_cta_label: whoCtaLabelEn.trim() || 'Read More',
        about_cta_href: whoCtaHref.trim() || '/about/who-we-are',
      };

      const { error: err1 } = await supabase.from('site_settings').upsert(
        {
          key: 'who_we_are_section',
          value: nextWhoWeAre,
          is_public: true,
        },
        { onConflict: 'key' }
      );
      if (err1) throw err1;

      const { error: err2 } = await supabase.from('site_settings').upsert(
        {
          key: 'organization_profile',
          value: nextOrgProfile,
          is_public: true,
        },
        { onConflict: 'key' }
      );
      if (err2) throw err2;

      // Sync to pages table for who-we-are
      try {
        const { data: wwaPage } = await supabase.from('pages').select('id').eq('page_key', 'who-we-are').maybeSingle();
        if (wwaPage) {
          const { data: enTr } = await supabase.from('page_translations').select('id').eq('page_id', wwaPage.id).eq('language', 'en').maybeSingle();
          if (enTr) {
            await supabase.from('page_translations').update({
              hero_tag: whoBadgeEn.trim(),
              title: whoTitleEn.trim(),
              subtitle: whoSummaryEn.trim(),
            }).eq('id', enTr.id);
          }
        }
      } catch (wwaSyncErr) {
        console.warn('WWA sync notice:', wwaSyncErr);
      }

      notify('Homepage "Who We Are" section saved to database.');
      await onRefresh();
      showAlert?.({
        type: 'success',
        title: 'Who We Are Section Saved!',
        message: 'The Who We Are / About Us section has been saved to the database and updated on the homepage!',
        websiteUrl: 'http://localhost:3000/#who-we-are',
        websiteLabel: 'View on Homepage ↗',
      });
    } catch (err: any) {
      notify(err.message || 'Failed to save Who We Are section', true);
      showAlert?.({
        type: 'error',
        title: 'Could Not Save Section',
        message: err.message || 'An error occurred while saving the section.',
      });
    }
  };

  // Vision, Mission, Core Values & Commitment Manager state (site_settings.vision_and_mission)
  const existingVisionMissionSetting = siteSettings.find(
    (s) => getSettingKey(s) === 'vision_and_mission'
  );
  const rawVmVal = getSettingValue(existingVisionMissionSetting);
  const isVmConfigured = rawVmVal !== undefined && rawVmVal !== null && typeof rawVmVal === 'object';
  const vmVal = isVmConfigured ? rawVmVal : {};

  const [vmVision, setVmVision] = useState(
    isVmConfigured
      ? stripHtmlForEditing(vmVal.vision ?? '')
      : stripHtmlForEditing(
          orgProfileVal.vision_en ||
            'A society where children and youth enjoy their rights and live in dignity, free from all forms of abuse and exploitation.'
        )
  );
  const [vmMission, setVmMission] = useState(
    isVmConfigured
      ? stripHtmlForEditing(vmVal.mission ?? '')
      : stripHtmlForEditing(
          orgProfileVal.mission_en ||
            'To promote and protect the rights of children and youth through advocacy, education, and community empowerment programs that address the root causes of vulnerability and create sustainable change.'
        )
  );
  const [vmValuesText, setVmValuesText] = useState(
    isVmConfigured
      ? (vmVal.core_values_text ?? (Array.isArray(vmVal.core_values) ? vmVal.core_values.map((v: any) => v.title).join('\n') : ''))
      : 'Child Safeguarding & Dignity First\nCommunity Ownership & Inclusion\nCreative Empowerment (HEART)\nTransparency & Accountability\nEvidence-Based Social Work\nYouth Livelihoods & Autonomy'
  );
  const [vmCommitmentTitle, setVmCommitmentTitle] = useState(
    isVmConfigured ? (vmVal.commitment_title ?? '') : 'Our Unwavering Commitment to Tanzanian Children'
  );
  const [vmCommitmentText, setVmCommitmentText] = useState(
    isVmConfigured
      ? stripHtmlForEditing(vmVal.commitment_text ?? '')
      : stripHtmlForEditing(
          'At Babawatoto Centre for Children and Youth Trust (BAO), our commitment goes far beyond immediate humanitarian aid. Since 2007, we have remained on the frontlines of Dar es Salaam\'s most vulnerable communities—listening, mentoring, educating, and rebuilding broken family ties. We pledge to maintain safe spaces, uphold transparent governance, and advocate relentlessly until every street-connected child in Tanzania has a safe pathway home, quality education, and the dignity they deserve.'
        )
  );
  const [vmCommitmentImageUrl, setVmCommitmentImageUrl] = useState(
    isVmConfigured ? (vmVal.commitment_image_url ?? '') : '/media/public/images/organization/abouts.webp'
  );

  const handleSaveVisionAndMission = async () => {
    showAlert?.({
      type: 'loading',
      title: 'Saving Vision & Mission...',
      message: 'Updating vision, mission, core values and commitment in database...',
    });
    try {
      const defaultImgs = [
        '/media/public/images/projects/WATOTO.webp',
        '/media/public/images/projects/ahadi.webp',
        '/media/public/images/programmes/arts1.webp',
        '/media/public/images/organization/hero3.webp',
        '/media/public/images/programmes/IMG_1087.JPG',
        '/media/public/images/projects/vocation.JPG',
      ];
      const defaultDescs = [
        'Every child deserves absolute safety, emotional security, and unconditional respect across all settings.',
        'Grassroots families and community leaders actively co-create sustainable protection interventions.',
        'Transforming trauma into resilience and joy through acrobatics, theatre, and expressive arts.',
        'High humanitarian ethics, verified monitoring, and audited accountability to our stakeholders.',
        'Rigorous individual case management, family tracing, and sustainable home reintegration.',
        'Equipping vulnerable youth and young mothers with apprentice skills and micro-enterprise capital.',
      ];

      const lines = vmValuesText.split('\n').map((l: string) => l.trim()).filter(Boolean);
      const parsedValues = lines.map((title: string, idx: number) => {
        const existing = Array.isArray(vmVal.core_values) ? vmVal.core_values[idx] : null;
        return {
          title,
          description: existing?.description || defaultDescs[idx % defaultDescs.length] || 'Core guiding principle steering our field social work.',
          image_url: existing?.image_url || defaultImgs[idx % defaultImgs.length],
        };
      });

      const nextData = {
        heading: 'Our Vision, Mission & Core Values',
        vision: vmVision.trim(),
        mission: vmMission.trim(),
        core_values_text: vmValuesText.trim(),
        core_values: parsedValues,
        commitment_title: vmCommitmentTitle.trim(),
        commitment_text: vmCommitmentText.trim(),
        commitment_image_url: vmCommitmentImageUrl.trim() || '/media/public/images/organization/abouts.webp',
      };

      const { error: err1 } = await supabase.from('site_settings').upsert(
        {
          key: 'vision_and_mission',
          value: nextData,
          is_public: true,
        },
        { onConflict: 'key' }
      );
      if (err1) throw err1;

      // Keep organization_profile synced as well
      const { error: err2 } = await supabase.from('site_settings').upsert(
        {
          key: 'organization_profile',
          value: {
            ...orgProfileVal,
            vision_en: vmVision.trim(),
            mission_en: vmMission.trim(),
          },
          is_public: true,
        },
        { onConflict: 'key' }
      );
      if (err2) throw err2;

      notify('Vision, Mission, Core Values & Commitment successfully saved to database!');
      await onRefresh();
      showAlert?.({
        type: 'success',
        title: 'Vision & Mission Saved!',
        message: 'Vision, mission, core values, and organizational commitment have been saved to the database and updated on the website!',
        websiteUrl: 'http://localhost:3000/about/mission-and-vision',
        websiteLabel: 'View on Website ↗',
      });
    } catch (err: any) {
      notify(err.message || 'Failed to save Vision and Mission', true);
      showAlert?.({
        type: 'error',
        title: 'Could Not Save Vision & Mission',
        message: err.message || 'An error occurred while saving to the database.',
      });
    }
  };

  // Our History Page Manager state (site_settings.our_history)
  const existingHistorySetting = siteSettings.find(
    (s) => getSettingKey(s) === 'our_history'
  );
  const rawHistVal = getSettingValue(existingHistorySetting);
  const isHistConfigured = rawHistVal !== undefined && rawHistVal !== null && typeof rawHistVal === 'object';
  const historyVal = isHistConfigured ? rawHistVal : {};

  const [histTitle, setHistTitle] = useState(
    isHistConfigured ? (historyVal.title ?? '') : 'Nearly Two Decades of Grassroots Transformation'
  );
  const [histText, setHistText] = useState(
    isHistConfigured
      ? stripHtmlForEditing(historyVal.history_text ?? '')
      : stripHtmlForEditing(
          orgProfileVal.history_summary_en ||
            'Founded in 2007 in Mburahati Barafu, Dar es Salaam, Babawatoto Centre for Children and Youth Trust (BAO) is a registered Tanzanian Non-Governmental Organization dedicated to protecting vulnerable children, reuniting street-connected youth with their families, and empowering communities.\n\nWhat started as a grassroots sanctuary offering hot meals, emergency medical aid, and basic care has evolved into a nationally recognized model of community-based child protection. Over the past 17 years, Babawatoto has developed integrated programs spanning MEMKWA Catch-Up Primary Education, HEART Creative Arts Therapy, Youth Vocational Livelihoods, and legal advocacy.'
        )
  );
  const [histHeroImage, setHistHeroImage] = useState(
    isHistConfigured ? (historyVal.hero_image ?? '') : '/media/public/images/organization/hero1.webp'
  );
  const [histBlockImage, setHistBlockImage] = useState(
    isHistConfigured ? (historyVal.block_image ?? '') : '/media/public/images/organization/abouts.webp'
  );
  const [histBlockImageCaption, setHistBlockImageCaption] = useState(
    isHistConfigured ? (historyVal.block_image_caption ?? '') : 'Babawatoto community empowerment & child protection activities in Dar es Salaam.'
  );
  const [histBlockBadge, setHistBlockBadge] = useState(
    isHistConfigured ? (historyVal.block_badge ?? '') : 'Milestones in the Community'
  );
  const [histBlockTitle, setHistBlockTitle] = useState(
    isHistConfigured ? (historyVal.block_title ?? '') : 'Building Hope, Restoring Dignity & Reconnecting Families'
  );
  const [histBlockText, setHistBlockText] = useState(
    isHistConfigured
      ? stripHtmlForEditing(historyVal.block_text ?? '')
      : 'Throughout our grassroots history, Babawatoto has prioritized direct street outreach, family reunification, and community-led safeguarding. By partnering with local social welfare offices, municipal health centres, and dedicated caregivers, we have successfully restored hundreds of street-connected children to secure homes and provided adolescent youth with viable pathways out of extreme poverty.'
  );

  const handleSaveOurHistory = async () => {
    showAlert?.({
      type: 'loading',
      title: 'Saving Our History Page...',
      message: 'Writing narrative and milestones block to the database...',
    });
    try {
      const nextData = {
        title: histTitle.trim(),
        history_text: histText.trim(),
        hero_image: histHeroImage.trim() || '/media/public/images/organization/hero1.webp',
        hero_badge: histBlockBadge.trim() || 'Our Journey Since 2007',
        block_image: histBlockImage.trim() || '/media/public/images/organization/abouts.webp',
        block_image_caption: histBlockImageCaption.trim(),
        block_badge: histBlockBadge.trim() || 'Milestones in the Community',
        block_title: histBlockTitle.trim() || 'Building Hope, Restoring Dignity & Reconnecting Families',
        block_text: histBlockText.trim(),
      };

      const { error } = await supabase.from('site_settings').upsert(
        {
          key: 'our_history',
          value: nextData,
          is_public: true,
        },
        { onConflict: 'key' }
      );
      if (error) throw error;

      notify('Our History page successfully saved to database!');
      await onRefresh();
      showAlert?.({
        type: 'success',
        title: 'Our History Saved!',
        message: 'Our History page narrative and milestone components have been saved to the database and updated live on the website!',
        websiteUrl: 'http://localhost:3000/our-history',
        websiteLabel: 'View Our History on Website ↗',
      });
    } catch (err: any) {
      notify(err.message || 'Failed to save Our History', true);
      showAlert?.({
        type: 'error',
        title: 'Could Not Save Our History',
        message: err.message || 'Failed to write history settings to the database.',
      });
    }
  };

  // Leadership & Governance Page Manager state (site_settings.leadership_and_governance)
  const existingGovSetting = siteSettings.find(
    (s) => getSettingKey(s) === 'leadership_and_governance'
  );
  const govVal = getSettingValue(existingGovSetting) || {};

  const [govHeroTitle, setGovHeroTitle] = useState(
    govVal.hero_title || 'Leadership & Governance'
  );
  const [govHeroBadge, setGovHeroBadge] = useState(
    govVal.hero_badge || 'Babawatoto Governance & Oversight'
  );
  const [govHeroImage, setGovHeroImage] = useState(
    govVal.hero_image || '/media/public/images/organization/hero1.webp'
  );
  const [govSectionTitle, setGovSectionTitle] = useState(
    govVal.section_title || 'Accountable Leadership Committed to Child Protection'
  );
  const [govNarrative, setGovNarrative] = useState(
    stripHtmlForEditing(
      govVal.narrative_text ||
        'Babawatoto Centre for Children and Youth Trust (BAO) is governed by a dedicated Board of Trustees, an Executive Leadership Council, and multidisciplinary field practitioners who maintain strict safeguarding oversight and humanitarian accountability.\n\nOur leadership combines decades of experience across child welfare social work, accelerated education, creative arts therapy, and human rights advocacy. Together, we ensure every Tanzanian shilling and donor grant directly advances the protection and empowerment of vulnerable children.'
    )
  );

  const defaultGovMembers = [
    {
      id: 'staff-1',
      name: 'Mgunga Mwamnyenyelwa',
      role: 'Founder & Executive Director',
      department: 'Executive Leadership',
      photo_url: '/media/public/images/staff/mgunga.webp',
      bio: 'Pioneered Babawatoto in 2007, championing community child protection, MEMKWA schooling, and expressive arts therapy.',
    },
    {
      id: 'staff-2',
      name: 'Lugano Mwakisambwe',
      role: 'Senior Social Welfare Officer',
      department: 'Child Protection & Reintegration',
      photo_url: '/media/public/images/staff/lugano.webp',
      bio: 'Oversees field intake assessment, crisis mediation, and family reunification across Dar es Salaam.',
    },
    {
      id: 'staff-3',
      name: 'Amina Salum',
      role: 'MEMKWA Education Coordinator',
      department: 'Non-Formal Education',
      photo_url: '/media/public/images/staff/mgunga.webp',
      bio: 'Coordinates accelerated primary curriculum enabling out-of-school children to re-enter formal schooling.',
    },
    {
      id: 'staff-4',
      name: 'Juma Ramadhani',
      role: 'HEART Creative Arts Mentor',
      department: 'Psychosocial Arts',
      photo_url: '/media/public/images/staff/lugano.webp',
      bio: 'Leads acrobatic workshops, music therapy, and stage performance building youth self-worth.',
    },
  ];

  const [govMembers, setGovMembers] = useState<any[]>(
    Array.isArray(govVal.members) && govVal.members.length > 0 ? govVal.members : defaultGovMembers
  );

  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('');
  const [newStaffPhoto, setNewStaffPhoto] = useState('/media/public/images/staff/mgunga.webp');
  const [newStaffDept, setNewStaffDept] = useState('Executive Leadership');
  const [newStaffBio, setNewStaffBio] = useState('');

  const handleAddStaffMember = () => {
    if (!newStaffName.trim() || !newStaffRole.trim()) {
      notify('Staff name and role title are required.', true);
      return;
    }
    const newMember = {
      id: `staff-${Date.now()}`,
      name: newStaffName.trim(),
      role: newStaffRole.trim(),
      department: newStaffDept.trim(),
      photo_url: newStaffPhoto.trim() || '/media/public/images/staff/mgunga.webp',
      bio: newStaffBio.trim(),
    };
    setGovMembers([...govMembers, newMember]);
    setNewStaffName('');
    setNewStaffRole('');
    setNewStaffBio('');
    notify(`Added ${newMember.name} to staff list.`);
  };

  const handleRemoveStaffMember = (id: string) => {
    setGovMembers(govMembers.filter((m) => m.id !== id));
    notify('Staff member removed.');
  };

  const [editingGovMemberId, setEditingGovMemberId] = useState<string | null>(null);
  const [editGovName, setEditGovName] = useState('');
  const [editGovRole, setEditGovRole] = useState('');
  const [editGovDept, setEditGovDept] = useState('');
  const [editGovPhoto, setEditGovPhoto] = useState('');
  const [editGovBio, setEditGovBio] = useState('');
  const [uploadingGovPhoto, setUploadingGovPhoto] = useState(false);

  const startEditGovMember = (member: any) => {
    setEditingGovMemberId(member.id);
    setEditGovName(member.name || '');
    setEditGovRole(member.role || '');
    setEditGovDept(member.department || 'Executive Leadership');
    setEditGovPhoto(member.photo_url || '/media/public/images/staff/mgunga.webp');
    setEditGovBio(member.bio || '');
  };

  const saveGovMemberEdit = () => {
    if (!editingGovMemberId) return;
    if (!editGovName.trim()) {
      notify('Please enter full name.', true);
      return;
    }
    setGovMembers(
      govMembers.map((m) =>
        m.id === editingGovMemberId
          ? {
              ...m,
              name: editGovName.trim(),
              role: editGovRole.trim() || 'Staff Practitioner',
              department: editGovDept.trim() || 'Executive Leadership',
              photo_url: editGovPhoto.trim() || '/media/public/images/staff/mgunga.webp',
              bio: editGovBio.trim(),
            }
          : m
      )
    );
    setEditingGovMemberId(null);
    notify(`Updated ${editGovName.trim()} details.`);
  };

  const handleSaveLeadershipAndGovernance = async () => {
    showAlert?.({
      type: 'loading',
      title: 'Saving Leadership & Governance...',
      message: 'Updating mandate narrative and staff list in database...',
    });
    try {
      const nextData = {
        hero_title: govHeroTitle.trim() || 'Leadership & Governance',
        hero_badge: govHeroBadge.trim() || 'Babawatoto Governance & Oversight',
        hero_image: govHeroImage.trim() || '/media/public/images/organization/hero1.webp',
        section_title: govSectionTitle.trim() || 'Accountable Leadership Committed to Child Protection',
        narrative_text: govNarrative.trim(),
        members: govMembers,
      };

      const { error } = await supabase.from('site_settings').upsert(
        {
          key: 'leadership_and_governance',
          value: nextData,
          is_public: true,
        },
        { onConflict: 'key' }
      );
      if (error) throw error;

      notify('Leadership & Governance page successfully saved to database!');
      await onRefresh();
      showAlert?.({
        type: 'success',
        title: 'Leadership & Governance Saved!',
        message: 'Leadership and Governance mandate narrative and staff members have been saved and updated live on the website!',
        websiteUrl: 'http://localhost:3000/leadership-governance',
        websiteLabel: 'View Leadership on Website ↗',
      });
    } catch (err: any) {
      notify(err.message || 'Failed to save Leadership & Governance', true);
      showAlert?.({
        type: 'error',
        title: 'Could Not Save Leadership & Governance',
        message: err.message || 'An error occurred while saving.',
      });
    }
  };

  // Projects Pages & Achievements Manager state (site_settings.projects_page_settings)
  const existingProjectsSettings = siteSettings.find(
    (s) => getSettingKey(s) === 'projects_page_settings'
  );
  const projSettingsVal = getSettingValue(existingProjectsSettings) || {};

  const [projHeroTitle, setProjHeroTitle] = useState(
    projSettingsVal.hero_title || 'Our Projects & Field Initiatives'
  );
  const [projHeroBadge, setProjHeroBadge] = useState(
    projSettingsVal.hero_badge || 'What We Do'
  );
  const [projHeroImage, setProjHeroImage] = useState(
    projSettingsVal.hero_banner_image || '/media/public/images/projects/ahadi.webp'
  );
  const [projAboutTitle, setProjAboutTitle] = useState(
    projSettingsVal.about_title || 'About Our Community Projects'
  );
  const [projAboutHeading, setProjAboutHeading] = useState(
    projSettingsVal.about_heading || 'Holistic, Community-Led Interventions Across Dar es Salaam'
  );
  const [projAboutText, setProjAboutText] = useState(
    stripHtmlForEditing(
      projSettingsVal.about_text ||
        'Babawatoto Centre for Children and Youth Trust (BAO) designs and implements targeted grassroots projects that safeguard street-connected youth, advance non-formal education through MEMKWA, foster psychological healing through creative performing arts (HEART), and establish sustainable livelihoods.\n\nOur initiatives operate in direct partnership with local government authorities, Municipal Social Welfare Desks, community leaders, and international development agencies to ensure every intervention creates long-term systemic transformation.'
    )
  );
  const [projAboutImageUrl, setProjAboutImageUrl] = useState(
    projSettingsVal.about_image_url || '/media/public/images/projects/WATOTO.webp'
  );

  // Metrics state (User chooses between: youth reached, locations, emergency respondent, beneficiaries, hospitals, partners)
  const [projMetrics, setProjMetrics] = useState<
    Array<{
      type: 'youth reached' | 'locations' | 'emergency respondent' | 'beneficiaries' | 'hospitals' | 'partners';
      number: number;
      suffix: string;
    }>
  >(
    Array.isArray(projSettingsVal.metrics) && projSettingsVal.metrics.length > 0
      ? projSettingsVal.metrics
      : [
          { type: 'youth reached', number: 12500, suffix: '+' },
          { type: 'locations', number: 24, suffix: ' Wards' },
          { type: 'emergency respondent', number: 380, suffix: '+' },
          { type: 'beneficiaries', number: 28400, suffix: '+' },
          { type: 'hospitals', number: 8, suffix: ' Referral Units' },
          { type: 'partners', number: 26, suffix: ' Orgs' },
        ]
  );

  const [newMetricType, setNewMetricType] = useState<
    'youth reached' | 'locations' | 'emergency respondent' | 'beneficiaries' | 'hospitals' | 'partners'
  >('youth reached');
  const [newMetricNumber, setNewMetricNumber] = useState(1000);
  const [newMetricSuffix, setNewMetricSuffix] = useState('+');

  const handleAddMetric = () => {
    setProjMetrics((prev) => [
      ...prev,
      {
        type: newMetricType,
        number: Number(newMetricNumber) || 0,
        suffix: newMetricSuffix.trim(),
      },
    ]);
  };

  const handleRemoveMetric = (idx: number) => {
    setProjMetrics((prev) => prev.filter((_, i) => i !== idx));
  };

  // Gallery preview state
  const [projGallery, setProjGallery] = useState<Array<{ url: string; title: string; caption: string }>>(
    Array.isArray(projSettingsVal.gallery_preview) && projSettingsVal.gallery_preview.length > 0
      ? projSettingsVal.gallery_preview
      : [
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
        ]
  );

  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryTitle, setNewGalleryTitle] = useState('');
  const [newGalleryCaption, setNewGalleryCaption] = useState('');

  const handleAddGalleryItem = () => {
    if (!newGalleryUrl.trim()) {
      notify('Image URL is required for gallery preview', true);
      return;
    }
    setProjGallery((prev) => [
      ...prev,
      {
        url: newGalleryUrl.trim(),
        title: newGalleryTitle.trim() || 'Project Moment',
        caption: newGalleryCaption.trim() || 'Verified field photograph from Dar es Salaam.',
      },
    ]);
    setNewGalleryUrl('');
    setNewGalleryTitle('');
    setNewGalleryCaption('');
  };

  const handleRemoveGalleryItem = (idx: number) => {
    setProjGallery((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveProjectsPageSettings = async () => {
    showAlert?.({
      type: 'loading',
      title: 'Saving Projects Page Layout...',
      message: 'Updating projects banner, achievements metrics, and gallery preview in database...',
    });
    try {
      const payload = {
        hero_title: projHeroTitle.trim() || 'Our Projects & Field Initiatives',
        hero_badge: projHeroBadge.trim() || 'What We Do',
        hero_banner_image: projHeroImage.trim() || '/media/public/images/projects/ahadi.webp',
        about_title: projAboutTitle.trim() || 'About Our Community Projects',
        about_heading: projAboutHeading.trim() || 'Holistic, Community-Led Interventions Across Dar es Salaam',
        about_text: projAboutText.trim(),
        about_image_url: projAboutImageUrl.trim() || '/media/public/images/projects/WATOTO.webp',
        metrics: projMetrics,
        gallery_preview: projGallery,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('site_settings').upsert(
        {
          key: 'projects_page_settings',
          value: payload,
          is_public: true,
        },
        { onConflict: 'key' }
      );
      if (error) throw error;

      notify('Projects page layout, about section, achievements metrics & gallery saved successfully!');
      await onRefresh();
      showAlert?.({
        type: 'success',
        title: 'Projects Settings Saved!',
        message: 'Projects page layout, banner, metrics, and gallery preview have been saved and updated live on the website!',
        websiteUrl: 'http://localhost:3000/projects',
        websiteLabel: 'View Projects on Website ↗',
      });
    } catch (err: any) {
      notify(err.message || 'Failed to save Projects page settings', true);
      showAlert?.({
        type: 'error',
        title: 'Could Not Save Projects Page Settings',
        message: err.message || 'An error occurred while saving.',
      });
    }
  };

  // Testimonials Manager state (site_settings.testimonials)
  const existingTestimonialsSetting = siteSettings.find(
    (s) => getSettingKey(s) === 'testimonials'
  );
  const testimonialsVal = getSettingValue(existingTestimonialsSetting) || {};
  const currentTestimonials: any[] = Array.isArray(testimonialsVal.items)
    ? testimonialsVal.items
    : [];
  const [tHeading, setTHeading] = useState(testimonialsVal.heading_en || '');
  const [tName, setTName] = useState('');
  const [tRole, setTRole] = useState('');
  const [tQuote, setTQuote] = useState('');
  const [tAvatar, setTAvatar] = useState('');
  const [tDate, setTDate] = useState('');

  const saveTestimonials = async (nextItems: any[], nextHeading?: string) => {
    try {
      const { error } = await supabase.from('site_settings').upsert(
        {
          key: 'testimonials',
          value: {
            ...testimonialsVal,
            heading_en: nextHeading ?? tHeading,
            items: nextItems,
          },
          is_public: true,
        },
        { onConflict: 'key' }
      );
      if (error) throw error;
      notify('Testimonials saved to database.');
      await onRefresh();
    } catch (err: any) {
      notify(err.message || 'Failed to save testimonials', true);
    }
  };

  const handleAddTestimonial = async () => {
    if (!tName.trim() || !tQuote.trim()) {
      notify('Name and testimonial text are required.', true);
      return;
    }
    await saveTestimonials([
      ...currentTestimonials,
      {
        id: `t-${Date.now()}`,
        name: tName.trim(),
        role: tRole.trim(),
        quote: tQuote.trim(),
        avatar_url: tAvatar.trim() || null,
        date_label: tDate.trim(),
        is_published: true,
      },
    ]);
    setTName('');
    setTRole('');
    setTQuote('');
    setTAvatar('');
    setTDate('');
  };

  // Navigation Menu Items Management handlers
  const handleEditMenuItem = (item: any) => {
    setEditingItemId(item.id);
    setItemLabelEn(item.label_en || '');
    setItemLabelSw(item.label_sw || '');
    setItemUrlPath(item.url_path || '');
    setItemParentId(item.parent_id || '');
    setItemDisplayOrder(item.display_order ?? 1);
    setItemIsActive(item.is_active !== false);
    setItemOpenInNewTab(Boolean(item.open_in_new_tab));
  };

  const handleResetMenuItemForm = () => {
    setEditingItemId(null);
    setItemLabelEn('');
    setItemLabelSw('');
    setItemUrlPath('');
    setItemParentId('');
    const currentItems = activeMenu?.menu_items || [];
    setItemDisplayOrder((currentItems.length || 0) + 1);
    setItemIsActive(true);
    setItemOpenInNewTab(false);
  };

  const handleSaveMenuItem = async () => {
    if (!itemLabelEn.trim() || !itemUrlPath.trim()) {
      notify('English label and destination URL path are required.', true);
      return;
    }
    if (!activeMenu?.id) {
      notify('Please select a navigation menu first.', true);
      return;
    }
    setSavingMenuItem(true);
    showAlert?.({
      type: 'loading',
      title: editingItemId ? 'Updating Menu Item...' : 'Adding Menu Item...',
      message: 'Saving navigation link to Supabase database...',
    });
    try {
      const payload = {
        menu_id: activeMenu.id,
        parent_id: itemParentId ? itemParentId : null,
        label_en: itemLabelEn.trim(),
        label_sw: itemLabelSw.trim() || itemLabelEn.trim(),
        url_path: itemUrlPath.trim(),
        display_order: Number(itemDisplayOrder) || 1,
        is_active: itemIsActive,
        open_in_new_tab: itemOpenInNewTab,
      };

      if (editingItemId) {
        const { error } = await supabase.from('menu_items').update(payload).eq('id', editingItemId);
        if (error) throw error;
        notify('Menu item updated successfully.');
      } else {
        const { error } = await supabase.from('menu_items').insert(payload);
        if (error) throw error;
        notify('New menu item created successfully.');
      }
      await onRefresh();
      showAlert?.({
        type: 'success',
        title: editingItemId ? 'Menu Item Updated!' : 'Menu Item Created!',
        message: `"${itemLabelEn.trim()}" has been saved to the ${activeMenu.name || 'navigation'} menu.`,
      });
      handleResetMenuItemForm();
    } catch (err: any) {
      notify(err.message || 'Failed to save menu item', true);
      showAlert?.({
        type: 'error',
        title: 'Could Not Save Menu Item',
        message: err.message || 'An error occurred while saving.',
      });
    } finally {
      setSavingMenuItem(false);
    }
  };

  const handleDeleteMenuItem = async (id: string, label: string) => {
    showAlert?.({
      type: 'confirm',
      title: 'Delete Menu Item?',
      message: `Are you sure you want to remove "${label}" from the navigation menu?`,
      onConfirm: async () => {
        try {
          await supabase.from('menu_items').update({ parent_id: null }).eq('parent_id', id);
          const { error } = await supabase.from('menu_items').delete().eq('id', id);
          if (error) throw error;
          notify(`Menu item "${label}" deleted.`);
          await onRefresh();
          if (editingItemId === id) handleResetMenuItemForm();
          showAlert?.({
            type: 'success',
            title: 'Deleted!',
            message: `"${label}" was successfully removed from the menu.`,
          });
        } catch (err: any) {
          notify(err.message || 'Failed to delete menu item', true);
          showAlert?.({
            type: 'error',
            title: 'Could Not Delete',
            message: err.message || 'An error occurred while deleting.',
          });
        }
      },
    });
  };

  const handleToggleItemActive = async (item: any) => {
    try {
      const nextState = !(item.is_active !== false);
      const { error } = await supabase.from('menu_items').update({ is_active: nextState }).eq('id', item.id);
      if (error) throw error;
      notify(`"${item.label_en}" is now ${nextState ? 'visible' : 'hidden'} on the website.`);
      await onRefresh();
    } catch (err: any) {
      notify(err.message || 'Could not update status', true);
    }
  };

  const handleMoveOrder = async (item: any, direction: 'up' | 'down') => {
    const currentOrder = item.display_order ?? 1;
    const newOrder = direction === 'up' ? Math.max(1, currentOrder - 1) : currentOrder + 1;
    try {
      const { error } = await supabase.from('menu_items').update({ display_order: newOrder }).eq('id', item.id);
      if (error) throw error;
      await onRefresh();
    } catch (err: any) {
      notify(err.message || 'Could not update order', true);
    }
  };

  // Contact Details & Social Media Links State
  const existingContactSetting = siteSettings.find((s) => getSettingKey(s) === 'contact_details');
  const existingSocialSetting = siteSettings.find((s) => getSettingKey(s) === 'social_links');
  const contactVal = getSettingValue(existingContactSetting) || {};
  const socialVal = getSettingValue(existingSocialSetting) || {};

  const [contactEmail, setContactEmail] = useState(contactVal.primary_email || 'info@babawatoto.or.tz');
  const [contactSafeguardingEmail, setContactSafeguardingEmail] = useState(contactVal.safeguarding_email || 'info@babawatoto.or.tz');
  const [contactPhones, setContactPhones] = useState(
    Array.isArray(contactVal.phones) ? contactVal.phones.join(', ') : '+255 (0) 784 712095, +255 651 136502'
  );
  const [contactAddress, setContactAddress] = useState(contactVal.street_address || 'Mburahati Barafu, Dar es Salaam, Tanzania');
  const [contactCity, setContactCity] = useState(contactVal.city || 'Dar es Salaam');
  const [contactPoBox, setContactPoBox] = useState(contactVal.po_box || 'P.O. Box 8293');
  const [contactHours, setContactHours] = useState(contactVal.working_hours_en || 'Mon – Fri: 8:00 AM – 5:00 PM');

  const [socialInstagram, setSocialInstagram] = useState(socialVal.instagram || 'https://www.instagram.com/babawatotocentre/');
  const [socialFacebook, setSocialFacebook] = useState(socialVal.facebook || 'https://www.facebook.com/babawatotocentre/');
  const [socialYoutube, setSocialYoutube] = useState(socialVal.youtube || 'https://www.youtube.com/@babawatotoorganization');
  const [socialTiktok, setSocialTiktok] = useState(socialVal.tiktok || 'https://www.tiktok.com/@babawatoto');
  const [socialTwitter, setSocialTwitter] = useState(socialVal.twitter || '');
  const [socialLinkedin, setSocialLinkedin] = useState(socialVal.linkedin || '');
  const [savingContactSocial, setSavingContactSocial] = useState(false);

  useEffect(() => {
    const c = siteSettings.find((s) => getSettingKey(s) === 'contact_details');
    const cV = getSettingValue(c) || {};
    if (cV.primary_email) setContactEmail(cV.primary_email);
    if (cV.safeguarding_email) setContactSafeguardingEmail(cV.safeguarding_email);
    if (cV.phones) setContactPhones(Array.isArray(cV.phones) ? cV.phones.join(', ') : cV.phones);
    if (cV.street_address) setContactAddress(cV.street_address);
    if (cV.city) setContactCity(cV.city);
    if (cV.po_box) setContactPoBox(cV.po_box);
    if (cV.working_hours_en) setContactHours(cV.working_hours_en);

    const s = siteSettings.find((st) => getSettingKey(st) === 'social_links');
    const sV = getSettingValue(s) || {};
    if (sV.instagram) setSocialInstagram(sV.instagram);
    if (sV.facebook) setSocialFacebook(sV.facebook);
    if (sV.youtube) setSocialYoutube(sV.youtube);
    if (sV.tiktok) setSocialTiktok(sV.tiktok);
    if (sV.twitter) setSocialTwitter(sV.twitter);
    if (sV.linkedin) setSocialLinkedin(sV.linkedin);
  }, [siteSettings]);

  const handleSaveContactSocial = async () => {
    setSavingContactSocial(true);
    showAlert?.({
      type: 'loading',
      title: 'Saving Contact & Social Info...',
      message: 'Writing updated contact details and social media channels to database...',
    });
    try {
      const parsedPhones = contactPhones.split(',').map((p: string) => p.trim()).filter(Boolean);
      const nextContact = {
        ...contactVal,
        primary_email: contactEmail.trim(),
        safeguarding_email: contactSafeguardingEmail.trim(),
        phones: parsedPhones,
        street_address: contactAddress.trim(),
        city: contactCity.trim(),
        po_box: contactPoBox.trim(),
        country: 'Tanzania',
        working_hours_en: contactHours.trim(),
      };

      const nextSocial = {
        ...socialVal,
        instagram: socialInstagram.trim(),
        facebook: socialFacebook.trim(),
        youtube: socialYoutube.trim(),
        tiktok: socialTiktok.trim(),
        twitter: socialTwitter.trim(),
        linkedin: socialLinkedin.trim(),
      };

      const { error: err1 } = await supabase.from('site_settings').upsert(
        { key: 'contact_details', value: nextContact, is_public: true },
        { onConflict: 'key' }
      );
      if (err1) throw err1;

      const { error: err2 } = await supabase.from('site_settings').upsert(
        { key: 'social_links', value: nextSocial, is_public: true },
        { onConflict: 'key' }
      );
      if (err2) throw err2;

      notify('Contact details and social media links successfully updated!');
      await onRefresh();
      showAlert?.({
        type: 'success',
        title: 'Contact & Social Saved!',
        message: 'Headquarters contact info and social media channels have been saved to the database and updated across the website header and footer!',
      });
    } catch (err: any) {
      notify(err.message || 'Failed to save contact and social info', true);
      showAlert?.({
        type: 'error',
        title: 'Could Not Save',
        message: err.message || 'An error occurred while saving to the database.',
      });
    } finally {
      setSavingContactSocial(false);
    }
  };

  const handleSelectSetting = (key: string) => {
    setSelectedSettingKey(key);
    const found = siteSettings.find((s) => getSettingKey(s) === key);
    setJsonText(JSON.stringify(getSettingValue(found) || {}, null, 2));
  };

  const handleSaveSetting = async () => {
    try {
      const parsed = JSON.parse(jsonText);
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          { key: selectedSettingKey, value: parsed, is_public: true },
          { onConflict: 'key' }
        );
      if (error) throw error;
      notify(`Setting "${selectedSettingKey}" updated.`);
      await onRefresh();
    } catch (err: any) {
      notify(err.message || 'Invalid JSON format', true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200/90 shadow-2xs">
        <button
          onClick={() => setSubTab('menus')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            subTab === 'menus'
              ? 'bg-amber-500 text-black shadow-xs font-extrabold'
              : 'text-slate-600 hover:text-black hover:bg-white/70'
          }`}
        >
          <Compass className="w-4 h-4" /> Navigation Menus ({menus.length})
        </button>
        <button
          onClick={() => setSubTab('sections')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            subTab === 'sections'
              ? 'bg-amber-500 text-black shadow-xs font-extrabold'
              : 'text-slate-600 hover:text-black hover:bg-white/70'
          }`}
        >
          <LayoutGrid className="w-4 h-4" /> Homepage Sections
        </button>
        <button
          onClick={() => setSubTab('about-pages')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            subTab === 'about-pages'
              ? 'bg-amber-500 text-black shadow-xs font-extrabold'
              : 'text-slate-600 hover:text-black hover:bg-white/70'
          }`}
        >
          <BookOpen className="w-4 h-4" /> About Pages Content
        </button>
        <button
          onClick={() => setSubTab('projects-page')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            subTab === 'projects-page'
              ? 'bg-amber-500 text-black shadow-xs font-extrabold'
              : 'text-slate-600 hover:text-black hover:bg-white/70'
          }`}
        >
          <FolderKanban className="w-4 h-4" /> Projects Page Layout
        </button>
        <button
          onClick={() => setSubTab('contact-social')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            subTab === 'contact-social'
              ? 'bg-amber-500 text-black shadow-xs font-extrabold'
              : 'text-slate-600 hover:text-black hover:bg-white/70'
          }`}
        >
          <Share2 className="w-4 h-4" /> Contact & Social Links
        </button>
        <button
          onClick={() => setSubTab('advanced-json')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            subTab === 'advanced-json'
              ? 'bg-amber-500 text-black shadow-xs font-extrabold'
              : 'text-slate-600 hover:text-black hover:bg-white/70'
          }`}
        >
          <Settings className="w-4 h-4" /> Raw JSON Settings
        </button>
      </div>

      {/* Sub-tab 1: Navigation Menus */}
      {subTab === 'menus' && (
        <div className="space-y-6">
          {/* Menu Selector Pills */}
          <div className="bg-white rounded-xl border border-[#E5E7E5] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-none">
            <div>
              <h3 className="font-bold text-sm text-[#000000] flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-600" /> Select Menu to Manage
              </h3>
              <p className="text-xs text-[#555B57] mt-0.5">
                Manage website links for header navigation, footer quick links, and footer policies.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {menus.map((m) => {
                const isSelected = m.id === selectedMenuId;
                const itemsCount = (m.menu_items || []).length;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMenuId(m.id);
                      handleResetMenuItemForm();
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-black shadow-xs font-extrabold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{m.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        isSelected ? 'bg-black text-white' : 'bg-white text-slate-600'
                      }`}
                    >
                      {itemsCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Menu Items Editor & Tree */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Add / Edit Menu Item Form */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-[#E5E7E5] p-5 space-y-4 shadow-none">
              <div className="flex items-center justify-between border-b border-[#E5E7E5] pb-3">
                <h4 className="font-bold text-sm text-[#000000] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-600" />
                  {editingItemId ? 'Edit Menu Item' : `Add Item to ${activeMenu?.name || 'Menu'}`}
                </h4>
                {editingItemId && (
                  <button
                    onClick={handleResetMenuItemForm}
                    className="text-xs text-slate-500 hover:text-black font-semibold underline cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
                    Label (English) *
                  </label>
                  <input
                    type="text"
                    value={itemLabelEn}
                    onChange={(e) => setItemLabelEn(e.target.value)}
                    placeholder="e.g. About Us, Projects, Contact"
                    className="w-full px-3 py-2 border border-[#E5E7E5] rounded-lg text-xs font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
                    Label (Swahili)
                  </label>
                  <input
                    type="text"
                    value={itemLabelSw}
                    onChange={(e) => setItemLabelSw(e.target.value)}
                    placeholder="e.g. Kuhusu Sisi, Miradi, Wasiliana Nasi"
                    className="w-full px-3 py-2 border border-[#E5E7E5] rounded-lg text-xs font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
                    Destination URL Path *
                  </label>
                  <input
                    type="text"
                    value={itemUrlPath}
                    onChange={(e) => setItemUrlPath(e.target.value)}
                    placeholder="e.g. /projects, /mission-vision, /contact or https://..."
                    className="w-full px-3 py-2 border border-[#E5E7E5] rounded-lg text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Internal pages start with &quot;/&quot; (e.g. /our-history, /projects, /contact). External links start with https://.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
                    Parent Menu Item (Dropdown / Grouping)
                  </label>
                  <select
                    value={itemParentId}
                    onChange={(e) => setItemParentId(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7E5] rounded-lg text-xs font-medium bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">None (Top-Level Menu Item)</option>
                    {(activeMenu?.menu_items || [])
                      .filter((i: any) => !i.parent_id && i.id !== editingItemId)
                      .map((p: any) => (
                        <option key={p.id} value={p.id}>
                          Under: {p.label_en} ({p.url_path})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={itemDisplayOrder}
                      onChange={(e) => setItemDisplayOrder(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-[#E5E7E5] rounded-lg text-xs font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex flex-col justify-end space-y-2 pb-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={itemIsActive}
                        onChange={(e) => setItemIsActive(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      Active (Visible)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
                      <input
                        type="checkbox"
                        checked={itemOpenInNewTab}
                        onChange={(e) => setItemOpenInNewTab(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      Open in new tab
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveMenuItem}
                    disabled={savingMenuItem}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {savingMenuItem
                      ? 'Saving...'
                      : editingItemId
                      ? 'Update Menu Item'
                      : 'Add Menu Item'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Menu Items List */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-[#E5E7E5] p-5 space-y-4 shadow-none">
              <div className="flex items-center justify-between border-b border-[#E5E7E5] pb-3">
                <div>
                  <h4 className="font-bold text-sm text-[#000000]">
                    Current Items in &quot;{activeMenu?.name}&quot; ({(activeMenu?.menu_items || []).length})
                  </h4>
                  <p className="text-xs text-[#555B57]">
                    Reorder, edit, hide, or remove items. Changes sync directly to the live website.
                  </p>
                </div>
                <button
                  onClick={handleResetMenuItemForm}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> New Item
                </button>
              </div>

              {(!activeMenu?.menu_items || activeMenu.menu_items.length === 0) && (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  No items configured for this menu yet. Use the form on the left to add items.
                </div>
              )}

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {(activeMenu?.menu_items || [])
                  .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
                  .map((item: any) => {
                    const isChild = Boolean(item.parent_id);
                    const parentItem = (activeMenu?.menu_items || []).find((p: any) => p.id === item.parent_id);
                    const isEditing = editingItemId === item.id;
                    const isActive = item.is_active !== false;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                          isEditing
                            ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20'
                            : isChild
                            ? 'bg-slate-50/70 border-slate-200 ml-6'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          {/* Order badge & reorder buttons */}
                          <div className="flex flex-col items-center shrink-0">
                            <button
                              onClick={() => handleMoveOrder(item, 'up')}
                              title="Move Up"
                              className="p-0.5 text-slate-400 hover:text-black cursor-pointer"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <span className="text-[10px] font-mono font-bold text-slate-500 px-1 rounded bg-slate-100">
                              #{item.display_order ?? 1}
                            </span>
                            <button
                              onClick={() => handleMoveOrder(item, 'down')}
                              title="Move Down"
                              className="p-0.5 text-slate-400 hover:text-black cursor-pointer"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              {isChild && (
                                <span className="text-[10px] text-amber-700 font-bold bg-amber-100/60 px-1.5 py-0.2 rounded">
                                  ↳ Sub of {parentItem?.label_en || 'Parent'}
                                </span>
                              )}
                              <span className="font-bold text-xs text-slate-900 truncate">
                                {item.label_en}
                              </span>
                              {item.label_sw && item.label_sw !== item.label_en && (
                                <span className="text-[11px] text-slate-500 italic truncate">
                                  ({item.label_sw})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <a
                                href={item.url_path}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-[11px] text-amber-700 hover:underline truncate flex items-center gap-1"
                              >
                                {item.url_path}
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Status badge & action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleToggleItemActive(item)}
                            title={isActive ? 'Click to hide on website' : 'Click to show on website'}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition cursor-pointer flex items-center gap-1 ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {isActive ? 'Visible' : 'Hidden'}
                          </button>

                          <button
                            onClick={() => handleEditMenuItem(item)}
                            className="p-1.5 text-slate-600 hover:text-black hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteMenuItem(item.id, item.label_en)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Homepage Sections */}
      {subTab === 'sections' && (
        <div className="space-y-6">
          {/* Helpful Link to Hero Module */}
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <h4 className="font-bold text-xs text-amber-950">
                  Homepage Top Hero Banner & Carousel
                </h4>
                <p className="text-xs text-amber-800/80">
                  Looking to configure the hero banner carousel slides? Use the dedicated &quot;Hero Section (Homepage)&quot; module in the sidebar.
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-md bg-amber-200/70 text-amber-900 shrink-0">
              Dedicated Module Active
            </span>
          </div>

          {/* Homepage Who We Are / About Us Section Editor */}
          <div className="bg-white rounded-xl border border-[#E5E7E5] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7E5] pb-3">
          <div>
            <h3 className="font-bold text-base text-[#000000]">
              Homepage &quot;Who We Are&quot; Section Editor (Database-Driven)
            </h3>
            <p className="text-xs text-[#555B57]">
              Edit the badge, headline title, summary paragraph, and Read More button shown in the
              centered &quot;Who We Are&quot; section right below the homepage hero banner.
            </p>
          </div>
          <span className="px-3 py-1 bg-[#E6A500]/15 text-[#E6A500] text-xs font-bold uppercase">
            Live in Database (`who_we_are_section`)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
              Section Badge Label
            </label>
            <input
              value={whoBadgeEn}
              onChange={(e) => setWhoBadgeEn(e.target.value)}
              placeholder="Who We Are · About Babawatoto"
              className="w-full px-3 py-2 border border-[#E5E7E5] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
              Section Headline Title
            </label>
            <input
              value={whoTitleEn}
              onChange={(e) => setWhoTitleEn(e.target.value)}
              placeholder="Babawatoto Centre for Children and Youth Trust (BAO)"
              className="w-full px-3 py-2 border border-[#E5E7E5] text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
              Who We Are Summary Paragraph
            </label>
            <textarea
              rows={3}
              value={whoSummaryEn}
              onChange={(e) => setWhoSummaryEn(e.target.value)}
              placeholder="Write the Who We Are summary paragraph..."
              className="w-full px-3 py-2 border border-[#E5E7E5] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
              Button Label
            </label>
            <input
              value={whoCtaLabelEn}
              onChange={(e) => setWhoCtaLabelEn(e.target.value)}
              placeholder="Read More"
              className="w-full px-3 py-2 border border-[#E5E7E5] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
              Button Target Page Link
            </label>
            <input
              value={whoCtaHref}
              onChange={(e) => setWhoCtaHref(e.target.value)}
              placeholder="/about/who-we-are"
              className="w-full px-3 py-2 border border-[#E5E7E5] text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSaveWhoWeAreSection}
            className="px-5 py-2.5 bg-[#E6A500] text-[#000000] text-xs font-bold uppercase flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Who We Are Section
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Sub-tab 3: About Pages Content */}
  {subTab === 'about-pages' && (
    <div className="space-y-6">
      {/* Vision, Mission, Core Values & Commitment Editor (Database-Driven) */}
      <div className="bg-white rounded-xl border-2 border-[#E6A500] p-6 space-y-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7E5] pb-3">
          <div>
            <h3 className="font-bold text-lg text-[#000000] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E6A500]" />
              Vision, Mission, Core Values & Commitment Manager
            </h3>
            <p className="text-xs text-[#555B57]">
              Dedicated text areas for Vision, Mission, Core Values (cards with images on the website), and Our Commitment.
            </p>
          </div>
          <span className="px-3 py-1 bg-[#E6A500] text-black text-xs font-extrabold uppercase rounded">
            Live in Database (`vision_and_mission`)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Vision Textarea */}
          <div className="bg-[#F4F5F4]/60 p-4 rounded-xl border border-[#E5E7E5] space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold uppercase text-[#000000]">
                1. Our Vision (Text Area)
              </label>
              <span className="text-[11px] font-bold text-[#E6A500] uppercase">Long-Term Goal</span>
            </div>
            <textarea
              rows={4}
              value={vmVision}
              onChange={(e) => setVmVision(e.target.value)}
              placeholder="Type the organization's vision here in normal English..."
              className="w-full p-3 border border-[#E5E7E5] rounded-lg text-sm bg-white focus:outline-none focus:border-[#E6A500]"
            />
            <p className="text-[11px] text-[#555B57]">
              Defines the society Babawatoto aims to create for children and youth.
            </p>
          </div>

          {/* 2. Mission Textarea */}
          <div className="bg-[#F4F5F4]/60 p-4 rounded-xl border border-[#E5E7E5] space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold uppercase text-[#000000]">
                2. Our Mission (Text Area)
              </label>
              <span className="text-[11px] font-bold text-[#E6A500] uppercase">Daily Purpose</span>
            </div>
            <textarea
              rows={4}
              value={vmMission}
              onChange={(e) => setVmMission(e.target.value)}
              placeholder="Type the organization's mission here in normal English..."
              className="w-full p-3 border border-[#E5E7E5] rounded-lg text-sm bg-white focus:outline-none focus:border-[#E6A500]"
            />
            <p className="text-[11px] text-[#555B57]">
              Specifies how Babawatoto protects, educates, and empowers children every day.
            </p>
          </div>

          {/* 3. Core Values Textarea */}
          <div className="md:col-span-2 bg-[#F4F5F4]/60 p-4 rounded-xl border border-[#E5E7E5] space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold uppercase text-[#000000]">
                3. Our Core Values (Separate Text Area — Type one value per line)
              </label>
              <span className="text-[11px] font-bold text-[#E6A500] uppercase">
                Rendered as Interactive Image Cards
              </span>
            </div>
            <textarea
              rows={5}
              value={vmValuesText}
              onChange={(e) => setVmValuesText(e.target.value)}
              placeholder="Child Safeguarding & Dignity First&#10;Community Ownership & Inclusion&#10;Creative Empowerment (HEART)&#10;Transparency & Accountability&#10;Evidence-Based Social Work&#10;Youth Livelihoods & Autonomy"
              className="w-full p-3 border border-[#E5E7E5] rounded-lg text-sm font-medium bg-white focus:outline-none focus:border-[#E6A500]"
            />
            <p className="text-[11px] text-[#555B57]">
              Each line becomes a distinct core value card with a high-resolution image and title that animates when hovered on the website.
            </p>
          </div>

          {/* 4. Our Commitment Area */}
          <div className="md:col-span-2 bg-[#F4F5F4]/60 p-4 rounded-xl border border-[#E5E7E5] space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold uppercase text-[#000000]">
                4. Our Commitment Area (Image on Left, Text on Right)
              </label>
              <span className="text-[11px] font-bold text-[#E6A500] uppercase">Split Two-Column Layout</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4 space-y-2">
                <label className="block text-xs font-bold text-[#000000]">
                  Left-Side Image Placeholder / URL
                </label>
                <input
                  type="text"
                  value={vmCommitmentImageUrl}
                  onChange={(e) => setVmCommitmentImageUrl(e.target.value)}
                  placeholder="/media/public/images/organization/abouts.webp"
                  className="w-full p-2.5 border border-[#E5E7E5] rounded text-xs bg-white focus:outline-none focus:border-[#E6A500]"
                />
                {vmCommitmentImageUrl && (
                  <div className="h-32 rounded-lg overflow-hidden border border-[#E5E7E5]">
                    <img
                      src={vmCommitmentImageUrl}
                      alt="Commitment Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="md:col-span-8 space-y-2">
                <label className="block text-xs font-bold text-[#000000]">
                  Right-Side Commitment Headline
                </label>
                <input
                  type="text"
                  value={vmCommitmentTitle}
                  onChange={(e) => setVmCommitmentTitle(e.target.value)}
                  placeholder="Our Unwavering Commitment to Tanzanian Children"
                  className="w-full p-2.5 border border-[#E5E7E5] rounded text-sm bg-white font-bold focus:outline-none focus:border-[#E6A500]"
                />
                <label className="block text-xs font-bold text-[#000000]">
                  Right-Side Commitment Statement (Text Area)
                </label>
                <textarea
                  rows={4}
                  value={vmCommitmentText}
                  onChange={(e) => setVmCommitmentText(e.target.value)}
                  placeholder="Type the full commitment text here in normal English..."
                  className="w-full p-3 border border-[#E5E7E5] rounded-lg text-sm bg-white focus:outline-none focus:border-[#E6A500]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveVisionAndMission}
            className="px-6 py-3 bg-[#E6A500] text-black text-sm font-extrabold uppercase rounded shadow hover:bg-black hover:text-white transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Vision, Mission, Values & Commitment
          </button>
        </div>
      </div>

      {/* Our History Page Manager (Database-Driven) */}
      <div className="bg-white rounded-xl border-2 border-[#E6A500] p-6 space-y-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7E5] pb-3">
          <div>
            <h3 className="font-bold text-lg text-[#000000] flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#E6A500]" />
              Our History Page Manager
            </h3>
            <p className="text-xs text-[#555B57]">
              Configure the history narrative paragraph and the featured component block (image on the left, text on the right) for the /our-history page.
            </p>
          </div>
          <span className="px-3 py-1 bg-[#E6A500] text-black text-xs font-extrabold uppercase rounded">
            Live in Database (`our_history`)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-extrabold uppercase text-[#000000] mb-1">
              History Headline Title
            </label>
            <input
              type="text"
              value={histTitle}
              onChange={(e) => setHistTitle(e.target.value)}
              placeholder="Nearly Two Decades of Grassroots Transformation"
              className="w-full p-2.5 border border-[#E5E7E5] rounded text-sm bg-white font-bold focus:outline-none focus:border-[#E6A500]"
            />
          </div>
          <div className="md:col-span-2">
            <HeroBannerImageUploader
              imageUrl={histHeroImage}
              onImageChange={setHistHeroImage}
              pageName="Our History"
              supabase={supabase}
              showAlert={showAlert}
              notify={notify}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-extrabold uppercase text-[#000000] mb-1">
              History Narrative Paragraph (Write history in normal English)
            </label>
            <textarea
              rows={6}
              value={histText}
              onChange={(e) => setHistText(e.target.value)}
              placeholder="Write the full history of the organization here. Separate paragraphs with an empty line..."
              className="w-full p-3 border border-[#E5E7E5] rounded-lg text-sm bg-white focus:outline-none focus:border-[#E6A500] leading-relaxed"
            />
            <p className="text-[11px] text-[#555B57] mt-1">
              This text appears directly beneath the banner on the /our-history page.
            </p>
          </div>

          {/* Component Block: Image Left, Text Right */}
          <div className="md:col-span-2 bg-[#F4F5F4]/60 p-4 rounded-xl border border-[#E5E7E5] space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold uppercase text-[#000000]">
                Featured Milestone Block (Image on Left, Text on Right)
              </label>
              <span className="text-[11px] font-bold text-[#E6A500] uppercase">
                Final Component Before Footer
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4 space-y-2">
                <label className="block text-xs font-bold text-[#000000]">
                  Left-Side Image URL
                </label>
                <input
                  type="text"
                  value={histBlockImage}
                  onChange={(e) => setHistBlockImage(e.target.value)}
                  placeholder="/media/public/images/organization/abouts.webp"
                  className="w-full p-2.5 border border-[#E5E7E5] rounded text-xs bg-white focus:outline-none focus:border-[#E6A500]"
                />
                <label className="block text-xs font-bold text-[#000000]">
                  Image Caption
                </label>
                <input
                  type="text"
                  value={histBlockImageCaption}
                  onChange={(e) => setHistBlockImageCaption(e.target.value)}
                  placeholder="Babawatoto community empowerment activities"
                  className="w-full p-2 border border-[#E5E7E5] rounded text-xs bg-white"
                />
                {histBlockImage && (
                  <div className="h-32 rounded-lg overflow-hidden border border-[#E5E7E5] mt-1">
                    <img
                      src={histBlockImage}
                      alt="Block Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="md:col-span-8 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#000000]">Badge</label>
                    <input
                      type="text"
                      value={histBlockBadge}
                      onChange={(e) => setHistBlockBadge(e.target.value)}
                      placeholder="Milestones in the Community"
                      className="w-full p-2 border border-[#E5E7E5] rounded text-xs bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#000000]">Headline</label>
                    <input
                      type="text"
                      value={histBlockTitle}
                      onChange={(e) => setHistBlockTitle(e.target.value)}
                      placeholder="Building Hope, Restoring Dignity & Reconnecting Families"
                      className="w-full p-2 border border-[#E5E7E5] rounded text-xs bg-white font-bold"
                    />
                  </div>
                </div>
                <label className="block text-xs font-bold text-[#000000]">
                  Right-Side Statement Text (Text Area)
                </label>
                <textarea
                  rows={4}
                  value={histBlockText}
                  onChange={(e) => setHistBlockText(e.target.value)}
                  placeholder="Type the statement describing this milestone in normal English..."
                  className="w-full p-3 border border-[#E5E7E5] rounded-lg text-sm bg-white focus:outline-none focus:border-[#E6A500]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveOurHistory}
            className="px-6 py-3 bg-[#E6A500] text-black text-sm font-extrabold uppercase rounded shadow hover:bg-black hover:text-white transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Our History Page
          </button>
        </div>
      </div>

      {/* Leadership & Governance Page Manager (Database-Driven) */}
      <div className="bg-white rounded-xl border-2 border-[#E6A500] p-6 space-y-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7E5] pb-3">
          <div>
            <h3 className="font-bold text-lg text-[#000000] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#E6A500]" />
              Leadership & Governance Page Manager
            </h3>
            <p className="text-xs text-[#555B57]">
              Configure the governance narrative paragraph and staff members with circle image holders on the /leadership-governance page. Add or remove as many staff members as you want.
            </p>
          </div>
          <span className="px-3 py-1 bg-[#E6A500] text-black text-xs font-extrabold uppercase rounded">
            Live in Database (`leadership_and_governance`)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-extrabold uppercase text-[#000000] mb-1">
              Page Headline
            </label>
            <input
              type="text"
              value={govSectionTitle}
              onChange={(e) => setGovSectionTitle(e.target.value)}
              placeholder="Accountable Leadership Committed to Child Protection"
              className="w-full p-2.5 border border-[#E5E7E5] rounded text-sm bg-white font-bold focus:outline-none focus:border-[#E6A500]"
            />
          </div>
          <div className="md:col-span-2">
            <HeroBannerImageUploader
              imageUrl={govHeroImage}
              onImageChange={setGovHeroImage}
              pageName="Leadership & Governance"
              supabase={supabase}
              showAlert={showAlert}
              notify={notify}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-extrabold uppercase text-[#000000] mb-1">
              Governance Narrative Paragraph (Write text in normal English)
            </label>
            <textarea
              rows={5}
              value={govNarrative}
              onChange={(e) => setGovNarrative(e.target.value)}
              placeholder="Type the leadership & governance narrative here..."
              className="w-full p-3 border border-[#E5E7E5] rounded-lg text-sm bg-white focus:outline-none focus:border-[#E6A500] leading-relaxed"
            />
            <p className="text-[11px] text-[#555B57] mt-1">
              This narrative appears directly below the top banner on the Leadership & Governance page.
            </p>
          </div>

          {/* Add Staff / Leadership Member Form */}
          <div className="md:col-span-2 bg-[#F4F5F4]/60 p-5 rounded-xl border border-[#E5E7E5] space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold uppercase text-[#000000]">
                Add Staff / Leadership Member (With Circle Image & Titles)
              </label>
              <span className="text-[11px] font-bold text-[#E6A500] uppercase">
                {govMembers.length} Staff Member{govMembers.length === 1 ? '' : 's'} on Page
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#000000] mb-1">Full Name</label>
                <input
                  type="text"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Mgunga Mwamnyenyelwa"
                  className="w-full p-2 border border-[#E5E7E5] rounded text-xs bg-white font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#000000] mb-1">Role / Title</label>
                <input
                  type="text"
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  placeholder="e.g. Executive Director"
                  className="w-full p-2 border border-[#E5E7E5] rounded text-xs bg-white font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#000000] mb-1">Department</label>
                <input
                  type="text"
                  value={newStaffDept}
                  onChange={(e) => setNewStaffDept(e.target.value)}
                  placeholder="e.g. Executive Leadership"
                  className="w-full p-2 border border-[#E5E7E5] rounded text-xs bg-white font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#000000] mb-1">Photo URL</label>
                <input
                  type="text"
                  value={newStaffPhoto}
                  onChange={(e) => setNewStaffPhoto(e.target.value)}
                  placeholder="/media/public/images/staff/mgunga.webp"
                  className="w-full p-2 border border-[#E5E7E5] rounded text-xs bg-white font-medium"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-[#000000] mb-1">Biography / Summary (Optional)</label>
                <input
                  type="text"
                  value={newStaffBio}
                  onChange={(e) => setNewStaffBio(e.target.value)}
                  placeholder="Brief practitioner bio or credentials..."
                  className="w-full p-2 border border-[#E5E7E5] rounded text-xs bg-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddStaffMember}
                  className="w-full py-2 bg-[#E6A500] text-black text-xs font-extrabold uppercase rounded shadow hover:bg-black hover:text-white transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Staff Member
                </button>
              </div>
            </div>

            {/* List of current staff members with circle preview & remove button */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-[#000000] mb-2">
                Current Staff Members (Click &quot;Remove&quot; to delete any member):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {govMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 bg-white border border-[#E5E7E5] rounded-xl flex items-center gap-3 justify-between shadow-2xs group hover:border-[#E6A500]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#E6A500] shrink-0">
                        <img
                          src={member.photo_url || '/media/public/images/staff/mgunga.webp'}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-[#000000] truncate">
                          {member.name}
                        </div>
                        <div className="text-[11px] text-[#E6A500] font-bold truncate">
                          {member.role}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditGovMember(member)}
                        className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveStaffMember(member.id)}
                        className="text-red-600 hover:text-red-800 text-xs font-bold px-1.5 py-1 shrink-0 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Modal for Governance Member */}
              {editingGovMemberId && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <h3 className="font-extrabold text-sm text-slate-900">
                        Edit Staff Member / Practitioner
                      </h3>
                      <button
                        type="button"
                        onClick={() => setEditingGovMemberId(null)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500 bg-white shrink-0">
                          <img
                            src={editGovPhoto || '/media/public/images/staff/mgunga.webp'}
                            alt={editGovName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <label className="block text-xs font-bold text-slate-900 uppercase">
                            Profile Photo
                          </label>
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-lg cursor-pointer transition">
                              {uploadingGovPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                              <span>{uploadingGovPhoto ? 'Uploading...' : 'Upload New Photo'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingGovPhoto}
                                onChange={async (e) => {
                                  const f = e.target.files?.[0];
                                  if (!f) return;
                                  setUploadingGovPhoto(true);
                                  try {
                                    const { data: sD } = await supabase.auth.getSession();
                                    const token = sD?.session?.access_token;
                                    const fd = new FormData();
                                    fd.append('file', f);
                                    fd.append('category', 'staff');
                                    fd.append('visibility', 'public');
                                    const res = await fetch('/api/v1/media/upload', {
                                      method: 'POST',
                                      headers: token ? { Authorization: `Bearer ${token}` } : {},
                                      body: fd,
                                    });
                                    const resJson = await res.json();
                                    const u = resJson.media?.public_url || (resJson.media?.storage_key ? `/media/${resJson.media.storage_key}` : null);
                                    if (u) {
                                      setEditGovPhoto(u);
                                      notify('Staff photo updated.');
                                    }
                                  } catch (err: any) {
                                    notify(err.message || 'Upload failed', true);
                                  } finally {
                                    setUploadingGovPhoto(false);
                                  }
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => setEditGovPhoto('/media/public/images/staff/mgunga.webp')}
                              className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-black text-xs font-semibold rounded-lg transition"
                            >
                              Reset
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
                          value={editGovName}
                          onChange={(e) => setEditGovName(e.target.value)}
                          placeholder="e.g. Mgunga Mwamnyenyelwa"
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-black font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-900 uppercase mb-1">
                            Role / Title *
                          </label>
                          <input
                            type="text"
                            value={editGovRole}
                            onChange={(e) => setEditGovRole(e.target.value)}
                            placeholder="e.g. Founder & Executive Director"
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-black font-semibold focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-900 uppercase mb-1">
                            Department
                          </label>
                          <input
                            type="text"
                            value={editGovDept}
                            onChange={(e) => setEditGovDept(e.target.value)}
                            placeholder="e.g. Executive Leadership"
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-black focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-900 uppercase mb-1">
                          Biography / Summary (Optional)
                        </label>
                        <textarea
                          rows={3}
                          value={editGovBio}
                          onChange={(e) => setEditGovBio(e.target.value)}
                          placeholder="Brief bio or credentials..."
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-black focus:outline-none focus:border-amber-500 leading-relaxed"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setEditingGovMemberId(null)}
                          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={saveGovMemberEdit}
                          className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
                        >
                          Apply Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveLeadershipAndGovernance}
            className="px-6 py-3 bg-[#E6A500] text-black text-sm font-extrabold uppercase rounded shadow hover:bg-black hover:text-white transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Leadership & Governance Page
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Sub-tab 4: Projects Page Settings */}
  {subTab === 'projects-page' && (
    <div className="space-y-6">
      {/* Projects Pages & Achievements Manager (Database-Driven) */}
      <div className="bg-white rounded-xl border border-[#E5E7E5] p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7E5] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#E6A500] text-black text-xs font-bold uppercase rounded">
                Live CMS Module
              </span>
              <h3 className="font-bold text-base text-[#000000]">
                Projects Pages, About Section, Achievements Metrics & Gallery Preview
              </h3>
            </div>
            <p className="text-xs text-[#555B57] mt-1">
              Configure the top single-image banner, about the project section (text on left, image on right),
              achievement metrics counters (choose from youth reached, locations, emergency respondent, beneficiaries, hospitals, partners),
              and gallery preview with view more button.
            </p>
          </div>
        </div>

        {/* 1. Hero Banner Settings */}
        <div className="p-4 bg-[#F9FAF9] rounded-lg border border-[#E5E7E5] space-y-4">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#000000] border-b border-[#E5E7E5] pb-1">
            1. Hero Banner & Floating Title Card
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#000000] uppercase mb-1">
                Banner Title
              </label>
              <input
                type="text"
                value={projHeroTitle}
                onChange={(e) => setProjHeroTitle(e.target.value)}
                placeholder="Our Projects & Field Initiatives"
                className="w-full px-3 py-2 text-sm border border-[#CCCCCC] rounded bg-white font-medium text-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#000000] uppercase mb-1">
                Banner Badge / Tag
              </label>
              <input
                type="text"
                value={projHeroBadge}
                onChange={(e) => setProjHeroBadge(e.target.value)}
                placeholder="What We Do"
                className="w-full px-3 py-2 text-sm border border-[#CCCCCC] rounded bg-white font-medium text-black"
              />
            </div>
            <div className="md:col-span-2">
              <HeroBannerImageUploader
                imageUrl={projHeroImage}
                onImageChange={setProjHeroImage}
                pageName="Projects & Field Initiatives"
                supabase={supabase}
                showAlert={showAlert}
                notify={notify}
              />
            </div>
          </div>
        </div>

        {/* 2. About the Project Section Settings (Text Left, Image Right) */}
        <div className="p-4 bg-[#F9FAF9] rounded-lg border border-[#E5E7E5] space-y-4">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#000000] border-b border-[#E5E7E5] pb-1">
            2. "About the Project" Section (Text Left, Image Right)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#000000] uppercase mb-1">
                Small Section Title
              </label>
              <input
                type="text"
                value={projAboutTitle}
                onChange={(e) => setProjAboutTitle(e.target.value)}
                placeholder="About Our Community Projects"
                className="w-full px-3 py-2 text-sm border border-[#CCCCCC] rounded bg-white font-medium text-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#000000] uppercase mb-1">
                Section Heading
              </label>
              <input
                type="text"
                value={projAboutHeading}
                onChange={(e) => setProjAboutHeading(e.target.value)}
                placeholder="Holistic, Community-Led Interventions Across Dar es Salaam"
                className="w-full px-3 py-2 text-sm border border-[#CCCCCC] rounded bg-white font-medium text-black"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#000000] uppercase mb-1">
              About Project Narrative (Paragraphs on Left)
            </label>
            <textarea
              rows={4}
              value={projAboutText}
              onChange={(e) => setProjAboutText(e.target.value)}
              placeholder="Type the full narrative description of the projects here in normal English..."
              className="w-full px-3 py-2 text-sm border border-[#CCCCCC] rounded bg-white font-medium text-black"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#000000] uppercase mb-1">
              Project Image on Right Side (URL)
            </label>
            <input
              type="text"
              value={projAboutImageUrl}
              onChange={(e) => setProjAboutImageUrl(e.target.value)}
              placeholder="/media/public/images/projects/WATOTO.webp"
              className="w-full px-3 py-2 text-sm border border-[#CCCCCC] rounded bg-white font-medium text-black"
            />
          </div>
        </div>

        {/* 3. Achievements Metrics Component Settings */}
        <div className="p-4 bg-[#F9FAF9] rounded-lg border border-[#E5E7E5] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7E5] pb-1">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#000000]">
              3. Achievements Metrics (Choose from 6 Categories)
            </h4>
            <span className="text-xs text-[#555B57]">
              Options: youth reached, locations, emergency respondent, beneficiaries, hospitals, partners
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end p-3 bg-white border border-[#E5E7E5] rounded">
            <div>
              <label className="block text-xs font-bold text-[#000000] uppercase mb-1">
                Metric Category
              </label>
              <select
                value={newMetricType}
                onChange={(e: any) => setNewMetricType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#CCCCCC] rounded bg-white font-bold text-black"
              >
                <option value="youth reached">youth reached</option>
                <option value="locations">locations</option>
                <option value="emergency respondent">emergency respondent</option>
                <option value="beneficiaries">beneficiaries</option>
                <option value="hospitals">hospitals</option>
                <option value="partners">partners</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#000000] uppercase mb-1">
                Target Number
              </label>
              <input
                type="number"
                value={newMetricNumber}
                onChange={(e) => setNewMetricNumber(Number(e.target.value))}
                placeholder="12500"
                className="w-full px-3 py-2 text-sm border border-[#CCCCCC] rounded bg-white font-medium text-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#000000] uppercase mb-1">
                Suffix (e.g. +, Wards, Orgs)
              </label>
              <input
                type="text"
                value={newMetricSuffix}
                onChange={(e) => setNewMetricSuffix(e.target.value)}
                placeholder="+"
                className="w-full px-3 py-2 text-sm border border-[#CCCCCC] rounded bg-white font-medium text-black"
              />
            </div>
            <div>
              <button
                type="button"
                onClick={handleAddMetric}
                className="w-full px-4 py-2 bg-[#E6A500] text-black font-extrabold text-sm uppercase rounded hover:bg-black hover:text-white transition"
              >
                + Add Metric
              </button>
            </div>
          </div>

          {/* List of active metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {projMetrics.map((met, idx) => (
              <div
                key={idx}
                className="p-3 bg-white border border-[#E6A500] rounded flex items-center justify-between"
              >
                <div>
                  <span className="px-2 py-0.5 bg-[#E6A500] text-black text-[11px] font-extrabold uppercase rounded block w-fit">
                    {met.type}
                  </span>
                  <div className="font-extrabold text-lg text-black mt-1">
                    {met.number.toLocaleString()}{met.suffix || '+'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMetric(idx)}
                  className="px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Gallery Preview Settings */}
        <div className="p-4 bg-[#F9FAF9] rounded-lg border border-[#E5E7E5] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7E5] pb-1">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#000000]">
              4. Gallery Preview Items ({projGallery.length} Images)
            </h4>
            <span className="text-xs text-[#555B57]">
              Shown above the "View More" button that opens the full gallery
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end p-3 bg-white border border-[#E5E7E5] rounded">
            <div>
              <label className="block text-xs font-bold text-[#000000] uppercase mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={newGalleryUrl}
                onChange={(e) => setNewGalleryUrl(e.target.value)}
                placeholder="/media/public/images/projects/ahadi.webp"
                className="w-full px-3 py-2 text-sm border border-[#CCCCCC] rounded bg-white font-medium text-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#000000] uppercase mb-1">
                Image Title
              </label>
              <input
                type="text"
                value={newGalleryTitle}
                onChange={(e) => setNewGalleryTitle(e.target.value)}
                placeholder="AHADI Field Outreach"
                className="w-full px-3 py-2 text-sm border border-[#CCCCCC] rounded bg-white font-medium text-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#000000] uppercase mb-1">
                Image Caption
              </label>
              <input
                type="text"
                value={newGalleryCaption}
                onChange={(e) => setNewGalleryCaption(e.target.value)}
                placeholder="Mobile teams identifying children in Temeke."
                className="w-full px-3 py-2 text-sm border border-[#CCCCCC] rounded bg-white font-medium text-black"
              />
            </div>
            <div>
              <button
                type="button"
                onClick={handleAddGalleryItem}
                className="w-full px-4 py-2 bg-[#E6A500] text-black font-extrabold text-sm uppercase rounded hover:bg-black hover:text-white transition"
              >
                + Add Image
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {projGallery.map((img, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E5E7E5] rounded overflow-hidden flex flex-col justify-between"
              >
                <div className="h-28 overflow-hidden bg-gray-100">
                  <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-2 space-y-1">
                  <div className="font-bold text-xs text-black truncate">{img.title}</div>
                  <div className="text-[11px] text-gray-500 line-clamp-1">{img.caption}</div>
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryItem(idx)}
                    className="w-full mt-1 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveProjectsPageSettings}
            className="px-6 py-3 bg-[#E6A500] text-black text-sm font-extrabold uppercase rounded shadow hover:bg-black hover:text-white transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Projects Page Layout & Achievements
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Sub-tab 5: Contact & Social Links */}
  {subTab === 'contact-social' && (
    <div className="bg-white rounded-xl border border-[#E5E7E5] p-6 space-y-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7E5] pb-3">
        <div>
          <h3 className="font-bold text-base text-[#000000] flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-500" />
            Contact Details & Social Media Links Manager
          </h3>
          <p className="text-xs text-[#555B57]">
            Controls the headquarters email address, telephone numbers, physical office location, and social media channels displayed in the header and footer across the entire website.
          </p>
        </div>
        <span className="px-3 py-1 bg-amber-500 text-black text-xs font-extrabold uppercase rounded">
          Live in Database (`contact_details` & `social_links`)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Office Contact Information */}
        <div className="space-y-4 p-5 bg-[#F9FAF9] rounded-xl border border-[#E5E7E5]">
          <h4 className="font-bold text-xs uppercase text-black tracking-wider border-b border-[#E5E7E5] pb-2 flex items-center gap-2">
            <Phone className="w-4 h-4 text-amber-600" /> Office Contact Information
          </h4>

          <div>
            <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
              Primary Contact Email *
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="info@babawatoto.or.tz"
              className="w-full px-3 py-2 border border-[#CCCCCC] rounded-lg text-sm bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
              Child Safeguarding Inquiries Email
            </label>
            <input
              type="email"
              value={contactSafeguardingEmail}
              onChange={(e) => setContactSafeguardingEmail(e.target.value)}
              placeholder="info@babawatoto.or.tz"
              className="w-full px-3 py-2 border border-[#CCCCCC] rounded-lg text-sm bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
              Office Phone Numbers (comma-separated)
            </label>
            <input
              type="text"
              value={contactPhones}
              onChange={(e) => setContactPhones(e.target.value)}
              placeholder="+255 (0) 784 712095, +255 651 136502"
              className="w-full px-3 py-2 border border-[#CCCCCC] rounded-lg text-sm bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
              Physical Street Address
            </label>
            <input
              type="text"
              value={contactAddress}
              onChange={(e) => setContactAddress(e.target.value)}
              placeholder="Mburahati Barafu, Morogoro Road, Dar es Salaam"
              className="w-full px-3 py-2 border border-[#CCCCCC] rounded-lg text-sm bg-white font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
                City / Region
              </label>
              <input
                type="text"
                value={contactCity}
                onChange={(e) => setContactCity(e.target.value)}
                placeholder="Dar es Salaam"
                className="w-full px-3 py-2 border border-[#CCCCCC] rounded-lg text-sm bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
                P.O. Box
              </label>
              <input
                type="text"
                value={contactPoBox}
                onChange={(e) => setContactPoBox(e.target.value)}
                placeholder="P.O. Box 8293"
                className="w-full px-3 py-2 border border-[#CCCCCC] rounded-lg text-sm bg-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
              Working Hours Label
            </label>
            <input
              type="text"
              value={contactHours}
              onChange={(e) => setContactHours(e.target.value)}
              placeholder="Mon – Fri: 8:00 AM – 5:00 PM"
              className="w-full px-3 py-2 border border-[#CCCCCC] rounded-lg text-sm bg-white font-medium"
            />
          </div>
        </div>

        {/* 2. Social Media Links */}
        <div className="space-y-4 p-5 bg-[#F9FAF9] rounded-xl border border-[#E5E7E5]">
          <h4 className="font-bold text-xs uppercase text-black tracking-wider border-b border-[#E5E7E5] pb-2 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-amber-600" /> Social Media Channels
          </h4>

          <div>
            <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
              Instagram URL
            </label>
            <input
              type="url"
              value={socialInstagram}
              onChange={(e) => setSocialInstagram(e.target.value)}
              placeholder="https://www.instagram.com/babawatotocentre/"
              className="w-full px-3 py-2 border border-[#CCCCCC] rounded-lg text-sm bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
              Facebook URL
            </label>
            <input
              type="url"
              value={socialFacebook}
              onChange={(e) => setSocialFacebook(e.target.value)}
              placeholder="https://www.facebook.com/babawatotocentre/"
              className="w-full px-3 py-2 border border-[#CCCCCC] rounded-lg text-sm bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
              YouTube Channel URL
            </label>
            <input
              type="url"
              value={socialYoutube}
              onChange={(e) => setSocialYoutube(e.target.value)}
              placeholder="https://www.youtube.com/@babawatotoorganization"
              className="w-full px-3 py-2 border border-[#CCCCCC] rounded-lg text-sm bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
              TikTok URL
            </label>
            <input
              type="url"
              value={socialTiktok}
              onChange={(e) => setSocialTiktok(e.target.value)}
              placeholder="https://www.tiktok.com/@babawatoto"
              className="w-full px-3 py-2 border border-[#CCCCCC] rounded-lg text-sm bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
              Twitter / X URL
            </label>
            <input
              type="url"
              value={socialTwitter}
              onChange={(e) => setSocialTwitter(e.target.value)}
              placeholder="https://twitter.com/babawatotoorga1"
              className="w-full px-3 py-2 border border-[#CCCCCC] rounded-lg text-sm bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#000000] mb-1">
              LinkedIn URL (Optional)
            </label>
            <input
              type="url"
              value={socialLinkedin}
              onChange={(e) => setSocialLinkedin(e.target.value)}
              placeholder="https://www.linkedin.com/company/babawatoto"
              className="w-full px-3 py-2 border border-[#CCCCCC] rounded-lg text-sm bg-white font-medium"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSaveContactSocial}
          disabled={savingContactSocial}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black text-xs font-extrabold uppercase rounded-lg shadow transition flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {savingContactSocial ? 'Saving...' : 'Save Contact & Social Details'}
        </button>
      </div>
    </div>
  )}

  {/* Sub-tab 6: Advanced JSON Settings */}
  {subTab === 'advanced-json' && (
    <div className="w-full bg-white rounded-xl border border-[#E5E7E5] p-6 space-y-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7E5] pb-3">
        <div>
          <h3 className="font-bold text-[#000000] flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-600" /> Global Website Settings (Raw JSON Config)
          </h3>
          <p className="text-xs text-[#555B57]">
            Advanced configuration: view or fine-tune raw JSON settings stored in the database.
          </p>
        </div>
        <select
          value={selectedSettingKey}
          onChange={(e) => handleSelectSetting(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-[#E5E7E5] text-xs font-semibold bg-white cursor-pointer"
        >
          {siteSettings.map((s) => {
            const k = getSettingKey(s);
            return (
              <option key={k} value={k}>
                {k}
              </option>
            );
          })}
        </select>
      </div>
      <textarea
        rows={16}
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        className="w-full p-3 rounded-xl border border-[#E5E7E5] font-mono text-xs bg-slate-50/50 focus:outline-none focus:border-amber-500"
      />
      <div className="flex justify-end">
        <button
          onClick={handleSaveSetting}
          className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold uppercase flex items-center gap-2 transition cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Website Setting
        </button>
      </div>
    </div>
  )}
    </div>
  );
}

export function InboxAndGovernanceModule({
  contacts,
  volunteers,
  profiles,
  roles,
  auditLogs,
  onRefresh,
  notify,
}: {
  contacts: any[];
  volunteers: any[];
  profiles: any[];
  roles: any[];
  auditLogs: any[];
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
}) {
  const [subTab, setSubTab] = useState<'inbox' | 'users' | 'roles' | 'logs'>('inbox');

  const updateContactStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
    if (error) notify(error.message, true);
    else {
      notify('Inquiry status updated.');
      await onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSubTab('inbox')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${subTab === 'inbox' ? 'bg-[#E6A500] text-black' : 'bg-white border border-[#E5E7E5] text-black'
            }`}
        >
          <Mail className="w-4 h-4" /> Inquiries & Volunteers ({contacts.length + volunteers.length})
        </button>
        <button
          onClick={() => setSubTab('users')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${subTab === 'users' ? 'bg-[#E6A500] text-black' : 'bg-white border border-[#E5E7E5] text-black'
            }`}
        >
          <Users className="w-4 h-4" /> Staff Users ({profiles.length})
        </button>
        <button
          onClick={() => setSubTab('roles')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${subTab === 'roles' ? 'bg-[#E6A500] text-black' : 'bg-white border border-[#E5E7E5] text-black'
            }`}
        >
          <ShieldCheck className="w-4 h-4" /> RBAC Roles ({roles.length})
        </button>
        <button
          onClick={() => setSubTab('logs')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${subTab === 'logs' ? 'bg-[#E6A500] text-black' : 'bg-white border border-[#E5E7E5] text-black'
            }`}
        >
          <Activity className="w-4 h-4" /> Audit Logs ({auditLogs.length})
        </button>
      </div>

      {subTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#E5E7E5] p-5 space-y-3">
            <h4 className="font-bold text-sm text-[#000000]">
              Contact Messages ({contacts.length})
            </h4>
            {contacts.map((c) => (
              <div key={c.id} className="p-3.5 rounded-xl border border-[#E5E7E5] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#000000]">
                    {c.sender_name || c.full_name} ({c.sender_email || c.email})
                  </span>
                  <select
                    value={c.status}
                    onChange={(e) => updateContactStatus(c.id, e.target.value)}
                    className="text-[11px] border border-[#E5E7E5] rounded px-2 py-0.5"
                  >
                    <option value="unread">unread</option>
                    <option value="read">read</option>
                    <option value="responded">responded</option>
                    <option value="archived">archived</option>
                  </select>
                </div>
                <div className="text-xs font-semibold text-[#E6A500]">{c.subject}</div>
                <p className="text-xs text-[#555B57]">{c.message}</p>
              </div>
            ))}
            {contacts.length === 0 && (
              <p className="text-xs text-[#555B57] py-8 text-center">No contact inquiries yet.</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7E5] p-5 space-y-3">
            <h4 className="font-bold text-sm text-[#000000]">
              Volunteer & Partnership Applications ({volunteers.length})
            </h4>
            {volunteers.map((v) => (
              <div key={v.id} className="p-3.5 rounded-xl border border-[#E5E7E5] space-y-1">
                <div className="font-bold text-xs text-[#000000]">
                  {v.full_name} — {v.area_of_interest}
                </div>
                <div className="text-[11px] text-[#555B57]">
                  {v.email} · {v.phone} · Status: {v.status}
                </div>
                <p className="text-xs text-[#555B57] mt-1">{v.motivation}</p>
              </div>
            ))}
            {volunteers.length === 0 && (
              <p className="text-xs text-[#555B57] py-8 text-center">
                No volunteer applications submitted yet.
              </p>
            )}
          </div>
        </div>
      )}

      {subTab === 'users' && (
        <div className="bg-white rounded-xl border border-[#E5E7E5] p-5 space-y-3">
          <h4 className="font-bold text-sm text-[#000000]">Authorized CMS Staff Profiles</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E7E5] text-[#555B57]">
                  <th className="py-2">Full Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Title</th>
                  <th className="py-2">Active</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-b border-[#F4F5F4]">
                    <td className="py-2.5 font-semibold">{p.full_name}</td>
                    <td className="py-2.5">{p.email}</td>
                    <td className="py-2.5">{p.job_title || 'BAO Staff'}</td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {p.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'roles' && (
        <div className="bg-white rounded-xl border border-[#E5E7E5] p-5 space-y-3">
          <h4 className="font-bold text-sm text-[#000000]">
            6 System Roles & Granular Permission Matrix
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((r) => (
              <div key={r.id} className="p-4 rounded-xl border border-[#E5E7E5]">
                <div className="font-bold text-sm text-[#000000]">{r.display_name}</div>
                <div className="text-[11px] font-mono text-[#E6A500]">{r.name}</div>
                <p className="text-xs text-[#555B57] mt-1.5">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'logs' && (
        <div className="bg-white rounded-xl border border-[#E5E7E5] p-5 space-y-3">
          <h4 className="font-bold text-sm text-[#000000]">Immutable Security & Audit Trail</h4>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg border border-[#E5E7E5] flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-[#000000]">{log.action}</span> on{' '}
                  <span className="font-mono text-[#E6A500]">{log.entity_type}</span>{' '}
                  {log.entity_title ? `(${log.entity_title})` : ''}
                </div>
                <span className="text-[11px] text-[#555B57]">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

