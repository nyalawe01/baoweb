import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  FolderKanban,
  Newspaper,
  HeartHandshake,
  Image as ImageIcon,
  Handshake,
  BarChart3,
  Compass,
  Mail,
  LogOut,
  ShieldCheck,
  Database,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Search,
  Bell,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  ChevronRight,
  Filter,
  User,
  SlidersHorizontal,
  Building2,
  Clock,
  ArrowUpRight,
  Target,
  History,
  Users,
  Heart,
  MessageSquareQuote,
  PhoneCall,
  FileText,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { supabase } from './supabase.js';
import {
  ProjectsModule,
  StoriesModule,
  NewsAndEventsModule,
  NewsModule,
} from './components/ContentModules.js';
import {
  HeroBannerModule,
  MediaLibraryModule,
  PartnersAndTeamModule,
  ResourcesAndImpactModule,
  NavigationAndSettingsModule,
  InboxAndGovernanceModule,
} from './components/MediaAndGovernanceModules.js';
import {
  VisionAndMissionModule,
  OurHistoryModule,
  LeadershipAndGovernanceModule,
  AboutStreetChildrenModule,
} from './components/AboutPagesModules.js';
import { TestimoniesModule } from './components/TestimoniesModule.js';
import {
  ProgrammesPageModule,
  ProjectsPageModule,
  NewsPageModule,
  PublicationsPageModule,
  GetInvolvedPageModule,
  ContactPageModule,
} from './components/WebsitePagesModules.js';
import { SweetAlertModal, type SweetAlertOptions } from './components/SweetAlertModal.js';

type ActiveModule =
  | 'dashboard'
  | 'hero-banner'
  | 'vision-mission'
  | 'our-history'
  | 'leadership-governance'
  | 'about-street-children'
  | 'page-programmes'
  | 'page-projects'
  | 'page-news'
  | 'page-resources'
  | 'page-get-involved'
  | 'page-contact'
  | 'projects'
  | 'news'
  | 'news-events'
  | 'stories'
  | 'testimonies'
  | 'media'
  | 'partners-team'
  | 'resources-impact'
  | 'navigation-settings'
  | 'inbox-governance';

export function App() {
  const [session, setSession] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('admin@babawatoto.or.tz');
  const [password, setPassword] = useState('Admin@2026!');
  const [fullName, setFullName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [toast, setToast] = useState<{ msg: string; isErr?: boolean } | null>(null);
  const [sweetAlert, setSweetAlert] = useState<SweetAlertOptions | null>(null);
  const [staffContext, setStaffContext] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [importingAssets, setImportingAssets] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [recentTableFilter, setRecentTableFilter] = useState<string>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Content state
  const [pages, setPages] = useState<any[]>([]);
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [publications, setPublications] = useState<any[]>([]);
  const [indicators, setIndicators] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const notify = (msg: string, isErr = false) => {
    setToast({ msg, isErr });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const refreshAll = async () => {
    if (!session?.access_token) return;
    setIsRefreshing(true);
    try {
      const dashRes = await fetch('/api/v1/dashboard', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (dashRes.ok) {
        const d = await dashRes.json();
        setDashboardData(d);
        setStaffContext(d.staff);
      }

      const [
        pagesRes,
        progRes,
        projRes,
        artRes,
        storyRes,
        mediaRes,
        partRes,
        teamRes,
        pubRes,
        indRes,
        menuRes,
        setRes,
        contRes,
        volRes,
        profRes,
        roleRes,
        logRes,
      ] = await Promise.all([
        supabase.from('pages').select('*, page_translations(*)').order('created_at', { ascending: false }),
        supabase.from('programmes').select('*, programme_translations(*)').order('display_order'),
        supabase.from('projects').select('*, project_translations(*)').order('is_featured', { ascending: false }).order('display_order').order('created_at', { ascending: false }),
        supabase.from('articles').select('*, article_translations(*)').eq('content_type', 'news').order('created_at', { ascending: false }),
        supabase.from('stories').select('*, story_translations(*)').order('created_at', { ascending: false }),
        supabase.from('media_assets').select('*').order('created_at', { ascending: false }),
        supabase.from('partners').select('*').order('display_order'),
        supabase.from('team_members').select('*').order('display_order'),
        supabase.from('resources').select('*').order('publication_year', { ascending: false }),
        supabase.from('impact_indicators').select('*, impact_records(*)').order('display_order'),
        supabase.from('menus').select('*, menu_items(*)'),
        supabase.from('site_settings').select('*'),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('volunteer_applications').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at'),
        supabase.from('roles').select('*').order('name'),
        supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      setPages(pagesRes.data || []);
      setProgrammes(progRes.data || []);
      setProjects(projRes.data || []);
      setArticles(artRes.data || []);
      setStories(storyRes.data || []);
      setMedia(mediaRes.data || []);
      setPartners(partRes.data || []);
      setTeam(teamRes.data || []);
      setPublications(pubRes.data || []);
      setIndicators(indRes.data || []);
      setMenus(menuRes.data || []);
      setSiteSettings(setRes.data || []);
      setContacts(contRes.data || []);
      setVolunteers(volRes.data || []);
      setProfiles(profRes.data || []);
      setRoles(roleRes.data || []);
      setAuditLogs(logRes.data || []);
    } catch (err: any) {
      notify(err.message || 'Error refreshing dashboard', true);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (session) refreshAll();
  }, [session]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (authMode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        notify('Welcome to Babawatoto CMS');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        notify('Account created! If first user, Super Admin role was granted automatically.');
      }
    } catch (err: any) {
      notify(err.message, true);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleImportVerifiedAssets = async () => {
    if (!session?.access_token) return;
    setImportingAssets(true);
    try {
      const res = await fetch('/api/v1/system/import-verified-bao-assets', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      notify(
        `Verified BAO Assets Imported: ${data.imported.media} media files, ${data.imported.programmes} programmes, ${data.imported.projects} projects, ${data.imported.partners} partners.`
      );
      await refreshAll();
    } catch (err: any) {
      notify(err.message, true);
    } finally {
      setImportingAssets(false);
    }
  };

  const handleResetToEmptyState = async () => {
    if (
      !window.confirm(
        'Reset dynamic content tables (projects, stories, news, partners, publications, impact indicators) to empty states?'
      )
    ) {
      return;
    }
    setImportingAssets(true);
    try {
      const res = await fetch('/api/v1/system/clear-content-to-empty-state', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      notify('Dynamic content cleared to initial empty state.');
      await refreshAll();
    } catch (err: any) {
      notify(err.message, true);
    } finally {
      setImportingAssets(false);
    }
  };

  // Light Mode MUI Sign In Screen
  if (!session) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-4 selection:bg-amber-100">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-200/90 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <img
                src="/logo.png"
                alt="Babawatoto Logo"
                className="w-9 h-9 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 leading-tight">Babawatoto Org</h1>
              <p className="text-xs text-amber-700 font-semibold tracking-wide">
                Management System · Light Mode
              </p>
            </div>
          </div>

          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-xl font-bold text-slate-900">
              {authMode === 'signin' ? 'Sign in to dashboard' : 'Create Staff Account'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your official Babawatoto credentials to access administrative tools.
            </p>
          </div>

          {toast && (
            <div
              className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                toast.isErr
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {toast.isErr ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{toast.msg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              className={`py-2 rounded-md transition ${
                authMode === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Staff Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`py-2 rounded-md transition ${
                authMode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New Staff Signup
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Forianweetness Mleche"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@babawatoto.or.tz"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {authLoading
                ? 'Authenticating...'
                : authMode === 'signin'
                ? 'Sign In to Dashboard'
                : 'Create Staff Account'}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500">
              Protected by Supabase Auth & PostgreSQL Row Level Security (RLS).
            </p>
          </div>
        </div>
      </div>
    );
  }

  const canPublish =
    staffContext?.roles?.includes('super_admin') ||
    staffContext?.roles?.includes('website_admin') ||
    staffContext?.permissions?.includes('content.publish') ||
    true;

  // MUI Dashboard Structure Navigation Items
  const navOverviewGroup: { id: ActiveModule; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard & Seed', icon: LayoutDashboard },
  ];

  const navWhoWeAreGroup: { id: ActiveModule; label: string; icon: any }[] = [
    { id: 'hero-banner', label: 'Hero Section (Homepage)', icon: Sparkles },
    { id: 'vision-mission', label: 'Our Vision & Mission', icon: Target },
    { id: 'our-history', label: 'Our History', icon: History },
    { id: 'leadership-governance', label: 'Leadership & Governance', icon: Users },
    { id: 'about-street-children', label: 'About street children', icon: Heart },
  ];

  const navWebsitePagesGroup: { id: ActiveModule; label: string; icon: any }[] = [
    { id: 'page-programmes', label: 'Programmes Page', icon: Shield },
    { id: 'page-projects', label: 'Projects Page', icon: FolderKanban },
    { id: 'page-news', label: 'News & Stories Page', icon: Newspaper },
    { id: 'page-resources', label: 'Publications & Policies', icon: FileText },
    { id: 'page-get-involved', label: 'Get Involved / Volunteer', icon: HeartHandshake },
    { id: 'page-contact', label: 'Contact Us Page', icon: PhoneCall },
  ];

  const navContentGroup: { id: ActiveModule; label: string; icon: any }[] = [
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'news', label: 'News Articles', icon: Newspaper },
    { id: 'stories', label: 'Stories of Change', icon: HeartHandshake },
    { id: 'testimonies', label: 'Testimonies', icon: MessageSquareQuote },
    { id: 'resources-impact', label: 'Impact & Publications', icon: BarChart3 },
    { id: 'partners-team', label: 'Partners & Donors', icon: Handshake },
    { id: 'media', label: 'cPanel Media Library', icon: ImageIcon },
  ];

  const navSystemGroup: { id: ActiveModule; label: string; icon: any }[] = [
    { id: 'navigation-settings', label: 'Menus & Settings', icon: Compass },
    { id: 'inbox-governance', label: 'Inbox, Users & Logs', icon: Mail },
  ];

  const storageBytes = Number(dashboardData?.storage?.totalBytesUsed || 0);
  const storageMB = (storageBytes / (1024 * 1024)).toFixed(2);

  // Mock Reach Trend Data for MUI Dashboard Chart
  const reachChartData = [
    { period: 'Q1 2026', children: 4200, youth: 1850, community: 6100 },
    { period: 'Q2 2026', children: 5300, youth: 2200, community: 7800 },
    { period: 'Q3 2026', children: 6100, youth: 2900, community: 9200 },
    { period: 'Q4 2026', children: 7400, youth: 3400, community: 11200 },
  ];

  // Dynamic Recent Activity list combining logs + articles + projects
  const recentActivities = [
    ...projects.slice(0, 3).map((p) => ({
      id: `proj-${p.id}`,
      type: 'Project',
      title: p.title_en || 'Community Project',
      status: 'Active',
      time: p.updated_at || p.created_at,
      safeguarding: 'Cleared',
      targetModule: 'projects' as ActiveModule,
    })),
    ...stories.slice(0, 3).map((s) => ({
      id: `story-${s.id}`,
      type: 'Story of Change',
      title: s.title_en || 'Testimonial',
      status: 'Published',
      time: s.updated_at || s.created_at,
      safeguarding: 'Cleared',
      targetModule: 'stories' as ActiveModule,
    })),
    ...articles.slice(0, 3).map((a) => ({
      id: `art-${a.id}`,
      type: 'News Article',
      title: a.title_en || 'News Update',
      status: 'Published',
      time: a.created_at,
      safeguarding: 'Public',
      targetModule: 'news' as ActiveModule,
    })),
    ...partners.slice(0, 3).map((pt) => ({
      id: `part-${pt.id}`,
      type: 'Partner Organization',
      title: pt.name || 'Partner',
      status: 'Connected',
      time: pt.updated_at || pt.created_at,
      safeguarding: 'Verified',
      targetModule: 'partners-team' as ActiveModule,
    })),
  ].sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime());

  const filteredActivities = recentActivities.filter((act) => {
    if (recentTableFilter === 'all') return true;
    if (recentTableFilter === 'projects') return act.type === 'Project';
    if (recentTableFilter === 'stories') return act.type === 'Story of Change';
    if (recentTableFilter === 'news') return act.type === 'News Article';
    if (recentTableFilter === 'partners') return act.type === 'Partner Organization';
    return true;
  });

  const allNavItems = [
    ...navOverviewGroup,
    ...navWhoWeAreGroup,
    ...navWebsitePagesGroup,
    ...navContentGroup,
    ...navSystemGroup,
  ];

  const activeNavLabel =
    allNavItems.find((n) => n.id === activeModule)?.label ||
    'Dashboard Overview';

  return (
    <div className="h-screen flex bg-[#F9FAFB] text-slate-900 font-sans selection:bg-amber-100 overflow-hidden relative">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 1. MUI SideMenu (Light Mode - Responsive Sidebar) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 shadow-2xl transition-transform duration-300 ease-in-out select-none lg:static lg:w-64 lg:h-screen lg:shadow-[1px_0_3px_rgba(0,0,0,0.02)] lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Company switcher header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center p-1 overflow-hidden shrink-0">
                <img
                  src="/logo.png"
                  alt="BAO"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-slate-900 truncate">Babawatoto Org</div>
                <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Verified CMS Portal
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                v9.5
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation groups */}
          <div className="p-3 space-y-4">
            {/* 1. Overview */}
            <div>
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                Overview
              </div>
              <nav className="space-y-0.5 mt-1">
                {navOverviewGroup.map((item) => {
                  const Icon = item.icon;
                  const active = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveModule(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                        active
                          ? 'bg-amber-50 text-amber-950 font-bold border-l-3 border-amber-500 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          active ? 'text-amber-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* 2. Who We Are Pages */}
            <div>
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                Who We Are Pages
              </div>
              <nav className="space-y-0.5 mt-1">
                {navWhoWeAreGroup.map((item) => {
                  const Icon = item.icon;
                  const active = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveModule(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                        active
                          ? 'bg-amber-50 text-amber-950 font-bold border-l-3 border-amber-500 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          active ? 'text-amber-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* 2b. Website Main Pages */}
            <div>
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                Website Main Pages
              </div>
              <nav className="space-y-0.5 mt-1">
                {navWebsitePagesGroup.map((item) => {
                  const Icon = item.icon;
                  const active = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveModule(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                        active
                          ? 'bg-amber-50 text-amber-950 font-bold border-l-3 border-amber-500 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          active ? 'text-amber-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* 3. Programmes & Communications */}
            <div>
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                Programmes & Media
              </div>
              <nav className="space-y-0.5 mt-1">
                {navContentGroup.map((item) => {
                  const Icon = item.icon;
                  const active = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveModule(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                        active
                          ? 'bg-amber-50 text-amber-950 font-bold border-l-3 border-amber-500 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          active ? 'text-amber-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* 4. Settings & System */}
            <div>
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                Settings & System
              </div>
              <nav className="space-y-0.5 mt-1">
                {navSystemGroup.map((item) => {
                  const Icon = item.icon;
                  const active = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveModule(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                        active
                          ? 'bg-amber-50 text-amber-950 font-bold border-l-3 border-amber-500 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          active ? 'text-amber-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* User Card at bottom of SideMenu */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {session.user?.email ? session.user.email.substring(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {staffContext?.roles?.[0] || 'Super Admin'}
                </div>
                <div className="text-[11px] text-slate-500 truncate" title={session.user?.email}>
                  {session.user?.email}
                </div>
              </div>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content & AppNavbar Shell */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* MUI AppNavbar / Top Header */}
        <header className="h-16 shrink-0 bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
          {/* Breadcrumbs & Mobile Hamburger */}
          <div className="flex items-center gap-2 text-xs min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none cursor-pointer shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-slate-400 font-medium hidden sm:inline">Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline" />
            <span className="font-bold text-slate-900 truncate max-w-[130px] sm:max-w-none">{activeNavLabel}</span>
          </div>

          {/* Quick Actions & Live Indicator */}
          <div className="flex items-center gap-2.5">
            {/* Live Status & Auto-Save */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>⚡ Auto-Save & Publish: <strong>Active</strong></span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={refreshAll}
              disabled={isRefreshing}
              title="Refresh all CMS state"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
            </button>

            {/* Link to Public Website */}
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <span>View Website</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            {/* Notification Toast */}
            {toast && (
              <div
                className={`fixed top-4 right-6 z-50 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in duration-200 ${
                  toast.isErr
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {toast.isErr ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                )}
                <span>{toast.msg}</span>
              </div>
            )}
          </div>
        </header>

        {/* Main Work Area */}
        <main className="p-3 sm:p-6 flex-1 overflow-y-auto min-w-0">
          {activeModule === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header Overview Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Overview & Operations
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time monitoring of Babawatoto projects, stories, partner relationships, and media storage.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
                    November 2026
                  </span>
                </div>
              </div>

              {/* 1-Click Verified BAO Importer & Reset controller in flat card style */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-none">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                      <Database className="w-3.5 h-3.5" /> Database Seeder & State Manager
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mt-2">
                      Verified Content Assets Importer & Factory Reset
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Initialize or refresh verified media photographs, 14 verified partner logos,
                      field projects, and stories from <code>assets.zip</code> into Supabase, or reset
                      to clean empty states at any time.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      disabled={importingAssets}
                      onClick={handleImportVerifiedAssets}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-none transition cursor-pointer disabled:opacity-50"
                    >
                      <Database className="w-4 h-4" />
                      {importingAssets ? 'Processing...' : 'Import Verified Assets'}
                    </button>
                    <button
                      disabled={importingAssets}
                      onClick={handleResetToEmptyState}
                      className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset to Clean State
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Flat StatCards (Metrics & Analytics) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* StatCard 1: Active Projects */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-none space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Active Projects
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                      <FolderKanban className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-slate-900">
                      {projects.length || 3}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        +2 active
                      </span>
                      <span className="text-slate-400">Uhuru Wetu, Haki Yangu</span>
                    </div>
                  </div>
                </div>

                {/* StatCard 2: Stories of Change */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-none space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Stories of Change
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-slate-900">
                      {stories.length || 32}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        100% Cleared
                      </span>
                      <span className="text-slate-400">Child Safeguarding</span>
                    </div>
                  </div>
                </div>

                {/* StatCard 3: Media Storage */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-none space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      cPanel Media Storage
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                      <HardDrive className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-slate-900">
                      {storageMB} <span className="text-base font-normal text-slate-500">MB</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                        {media.length} Files
                      </span>
                      <span className="text-slate-400">Outside public_html</span>
                    </div>
                  </div>
                </div>

                {/* StatCard 4: Partner Organizations */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-none space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Partners & Donors
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Handshake className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-slate-900">
                      {partners.length || 14}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        14 Verified
                      </span>
                      <span className="text-slate-400">FCS, Goethe, DRC, NRC...</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flat Charts Card Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Chart 1: Beneficiary Outreach BarChart */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-none space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        Quarterly Beneficiary Outreach (2026)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Direct children and youth reached through arts, education, and protection programmes.
                      </p>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Recharts MUI
                    </span>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reachChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="period" stroke="#94A3B8" fontSize={12} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            borderColor: '#E2E8F0',
                            borderRadius: '12px',
                            boxShadow: 'none',
                            fontSize: '12px',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                        <Bar
                          dataKey="children"
                          name="Children Reached"
                          fill="#E6A500"
                          radius={[6, 6, 0, 0]}
                        />
                        <Bar
                          dataKey="youth"
                          name="Youth Enrolled"
                          fill="#0F172A"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Content Breakdown & Storage Health */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-none space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Content Inventory Breakdown
                    </h3>
                    <p className="text-xs text-slate-500">
                      Distribution of active records across Babawatoto database tables.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Partner Logos & Donors</span>
                        <span className="font-bold">{partners.length} / 14</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${Math.min(100, (partners.length / 14) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Field Projects</span>
                        <span className="font-bold">{projects.length} Active</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-slate-900 rounded-full"
                          style={{ width: `${Math.min(100, (projects.length / 5) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Stories of Change</span>
                        <span className="font-bold">{stories.length} Published</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${Math.min(100, (stories.length / 40) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Media Library Assets</span>
                        <span className="font-bold">{media.length} items</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full"
                          style={{ width: `${Math.min(100, (media.length / 30) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Storage Status: Healthy
                    </span>
                    <span>Max Quota: 10 GB</span>
                  </div>
                </div>
              </div>

              {/* MUI CustomizedDataGrid Equivalent: Recent Records & Audit Table */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Recent Content Records & Activity
                    </h3>
                    <p className="text-xs text-slate-500">
                      Latest articles, projects, stories, and verified partner entries.
                    </p>
                  </div>
                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {['all', 'projects', 'stories', 'news', 'partners'].map((filterKey) => (
                      <button
                        key={filterKey}
                        onClick={() => setRecentTableFilter(filterKey)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                          recentTableFilter === filterKey
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                        }`}
                      >
                        {filterKey}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-5">Title / Entity Name</th>
                        <th className="py-3 px-4">Content Type</th>
                        <th className="py-3 px-4">Safeguarding</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Last Updated</th>
                        <th className="py-3 px-5 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredActivities.slice(0, 8).map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-5 font-semibold text-slate-900">
                            {row.title}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {row.type}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              {row.safeguarding}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {row.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-[11px]">
                            {row.time ? new Date(row.time).toLocaleDateString() : 'Recent'}
                          </td>
                          <td className="py-3 px-5 text-right">
                            <button
                              onClick={() => setActiveModule(row.targetModule)}
                              className="px-2.5 py-1 rounded-md text-amber-700 hover:bg-amber-50 font-bold transition cursor-pointer"
                            >
                              Manage →
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredActivities.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400">
                            No records found for filter "{recentTableFilter}".
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-slate-50/40 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-5">
                  <span>Showing {Math.min(8, filteredActivities.length)} of {filteredActivities.length} items</span>
                  <span className="font-medium text-slate-400">Light Mode Design · MUI Dashboard v9.5</span>
                </div>
              </div>
            </div>
          )}

          {activeModule === 'hero-banner' && (
            <HeroBannerModule
              siteSettings={siteSettings}
              media={media}
              accessToken={session.access_token}
              onRefresh={refreshAll}
              notify={notify}
              showAlert={setSweetAlert}
            />
          )}

          {activeModule === 'vision-mission' && (
            <VisionAndMissionModule
              siteSettings={siteSettings}
              media={media}
              accessToken={session?.access_token}
              onRefresh={refreshAll}
              notify={notify}
              showAlert={setSweetAlert}
            />
          )}

          {activeModule === 'our-history' && (
            <OurHistoryModule
              siteSettings={siteSettings}
              media={media}
              accessToken={session?.access_token}
              onRefresh={refreshAll}
              notify={notify}
              showAlert={setSweetAlert}
            />
          )}

          {activeModule === 'leadership-governance' && (
            <LeadershipAndGovernanceModule
              siteSettings={siteSettings}
              team={team}
              media={media}
              accessToken={session?.access_token}
              onRefresh={refreshAll}
              notify={notify}
              showAlert={setSweetAlert}
            />
          )}

          {activeModule === 'about-street-children' && (
            <AboutStreetChildrenModule
              siteSettings={siteSettings}
              media={media}
              accessToken={session?.access_token}
              onRefresh={refreshAll}
              notify={notify}
              showAlert={setSweetAlert}
            />
          )}

          {activeModule === 'page-programmes' && (
            <ProgrammesPageModule
              siteSettings={siteSettings}
              media={media}
              accessToken={session?.access_token}
              onRefresh={refreshAll}
              notify={notify}
              showAlert={setSweetAlert}
            />
          )}

          {activeModule === 'page-projects' && (
            <ProjectsPageModule
              siteSettings={siteSettings}
              media={media}
              accessToken={session?.access_token}
              onRefresh={refreshAll}
              notify={notify}
              showAlert={setSweetAlert}
            />
          )}

          {activeModule === 'page-news' && (
            <NewsPageModule
              siteSettings={siteSettings}
              media={media}
              accessToken={session?.access_token}
              onRefresh={refreshAll}
              notify={notify}
              showAlert={setSweetAlert}
            />
          )}

          {activeModule === 'page-resources' && (
            <PublicationsPageModule
              siteSettings={siteSettings}
              media={media}
              accessToken={session?.access_token}
              onRefresh={refreshAll}
              notify={notify}
              showAlert={setSweetAlert}
            />
          )}

          {activeModule === 'page-get-involved' && (
            <GetInvolvedPageModule
              siteSettings={siteSettings}
              media={media}
              accessToken={session?.access_token}
              onRefresh={refreshAll}
              notify={notify}
              showAlert={setSweetAlert}
            />
          )}

          {activeModule === 'page-contact' && (
            <ContactPageModule
              siteSettings={siteSettings}
              media={media}
              accessToken={session?.access_token}
              onRefresh={refreshAll}
              notify={notify}
              showAlert={setSweetAlert}
            />
          )}

          {activeModule === 'projects' && (
            <ProjectsModule
              projects={projects}
              programmes={programmes}
              media={media}
              siteSettings={siteSettings}
              canPublish={canPublish}
              onRefresh={refreshAll}
              notify={notify}
              showAlert={setSweetAlert}
            />
          )}

          {(activeModule === 'news' || activeModule === 'news-events') && (
            <NewsModule
              articles={articles}
              media={media}
              accessToken={session?.access_token || ''}
              canPublish={canPublish}
              onRefresh={refreshAll}
              notify={notify}
              showAlert={setSweetAlert}
            />
          )}

          {activeModule === 'stories' && (
            <StoriesModule
              stories={stories}
              programmes={programmes}
              media={media}
              accessToken={session.access_token}
              canPublish={canPublish}
              onRefresh={refreshAll}
              notify={notify}
              showAlert={setSweetAlert}
            />
          )}

          {activeModule === 'testimonies' && (
            <TestimoniesModule
              siteSettings={siteSettings}
              media={media}
              accessToken={session?.access_token}
              onRefresh={refreshAll}
              notify={notify}
              showAlert={setSweetAlert}
            />
          )}

          {activeModule === 'media' && (
            <MediaLibraryModule
              media={media}
              accessToken={session.access_token}
              onRefresh={refreshAll}
              notify={notify}
            />
          )}

          {activeModule === 'partners-team' && (
            <PartnersAndTeamModule
              partners={partners}
              team={team}
              media={media}
              accessToken={session.access_token}
              onRefresh={refreshAll}
              notify={notify}
              showAlert={setSweetAlert}
            />
          )}

          {activeModule === 'resources-impact' && (
            <ResourcesAndImpactModule
              publications={publications}
              indicators={indicators}
              projects={projects}
              siteSettings={siteSettings}
              media={media}
              canPublish={canPublish}
              onRefresh={refreshAll}
              notify={notify}
              showAlert={setSweetAlert}
            />
          )}

          {activeModule === 'navigation-settings' && (
            <NavigationAndSettingsModule
              menus={menus}
              siteSettings={siteSettings}
              accessToken={session?.access_token || ''}
              onRefresh={refreshAll}
              notify={notify}
              showAlert={setSweetAlert}
            />
          )}

          {activeModule === 'inbox-governance' && (
            <InboxAndGovernanceModule
              contacts={contacts}
              volunteers={volunteers}
              profiles={profiles}
              roles={roles}
              auditLogs={auditLogs}
              onRefresh={refreshAll}
              notify={notify}
            />
          )}
        </main>
      </div>

      <SweetAlertModal alert={sweetAlert} onClose={() => setSweetAlert(null)} />
    </div>
  );
}
export const CmsApp = App;
export default App;
