import React, { useEffect, useState, useRef, Suspense } from 'react';
import { type LanguageCode } from '@bao/shared';
import { Header, Footer } from './components/HeaderAndFooter.js';
import { WebsiteSkeleton } from './components/WebsiteSkeleton.js';

// Lazy-load view components for minimal initial bundle size and instant loading speed
const HomeView = React.lazy(() => import('./components/HomeAndProgrammesViews.js').then((m) => ({ default: m.HomeView })));
const ProgrammesView = React.lazy(() => import('./components/HomeAndProgrammesViews.js').then((m) => ({ default: m.ProgrammesView })));
const AboutView = React.lazy(() => import('./components/InnerPagesViews.js').then((m) => ({ default: m.AboutView })));
const ProjectsView = React.lazy(() => import('./components/InnerPagesViews.js').then((m) => ({ default: m.ProjectsView })));
const ImpactView = React.lazy(() => import('./components/InnerPagesViews.js').then((m) => ({ default: m.ImpactView })));
const StoriesView = React.lazy(() => import('./components/InnerPagesViews.js').then((m) => ({ default: m.StoriesView })));
const NewsAndEventsView = React.lazy(() => import('./components/InnerPagesViews.js').then((m) => ({ default: m.NewsAndEventsView })));
const ResourcesView = React.lazy(() => import('./components/InnerPagesViews.js').then((m) => ({ default: m.ResourcesView })));
const GetInvolvedView = React.lazy(() => import('./components/InnerPagesViews.js').then((m) => ({ default: m.GetInvolvedView })));
const ContactView = React.lazy(() => import('./components/InnerPagesViews.js').then((m) => ({ default: m.ContactView })));
const PolicyView = React.lazy(() => import('./components/InnerPagesViews.js').then((m) => ({ default: m.PolicyView })));

const SITEDATA_CACHE_KEY = 'bao_cached_site_data';

function getCachedSiteData() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SITEDATA_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.settings) {
        return parsed;
      }
    }
  } catch {}
  return null;
}

function getInitialData() {
  if (typeof window !== 'undefined' && (window as any).__INITIAL_DATA__) {
    return (window as any).__INITIAL_DATA__;
  }
  return getCachedSiteData();
}

export function App() {
  const [lang, setLang] = useState<LanguageCode>('en');
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  
  const initialData = useRef(getInitialData()).current;
  const [siteData, setSiteData] = useState<any>(
    initialData || {
      settings: {},
      menus: [],
      pages: [],
      programmes: [],
      projects: [],
      stories: [],
      news: [],
      events: [],
      partners: [],
      team: [],
      publications: [],
      indicators: [],
      media: [],
    }
  );
  
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [isSyncing, setIsSyncing] = useState(false);
  const isFetchingRef = useRef(false);
  const lastFocusFetchRef = useRef<number>(Date.now());
  const lastDataHashRef = useRef<string>('');

  const loadFreshSiteData = (force = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsSyncing(true);

    fetch('/api/public/site-data' + (force ? '?_t=' + Date.now() : ''))
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          // Compare fingerprint to prevent unnecessary re-renders of the entire component tree
          const newHash = JSON.stringify({
            settings: data.settings,
            pagesCount: (data.pages || []).length,
            projectsCount: (data.projects || []).length,
            publicationsCount: (data.publications || []).length,
            newsCount: (data.news || []).length,
            mediaCount: (data.media || []).length,
            menus: data.menus,
          });

          if (force || newHash !== lastDataHashRef.current) {
            lastDataHashRef.current = newHash;
            setSiteData(data);
            try {
              sessionStorage.setItem(SITEDATA_CACHE_KEY, JSON.stringify(data));
            } catch {}
          }
        }
      })
      .catch((err) => {
        console.error('Failed to sync site data:', err);
      })
      .finally(() => {
        isFetchingRef.current = false;
        setLoading(false);
        setIsSyncing(false);
      });
  };

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    loadFreshSiteData();

    // Throttled sync on tab focus (minimum 30s interval to prevent CPU lag)
    const onWindowFocus = () => {
      const now = Date.now();
      if (now - lastFocusFetchRef.current > 30000) {
        lastFocusFetchRef.current = now;
        loadFreshSiteData();
      }
    };
    window.addEventListener('focus', onWindowFocus);

    // Cross-tab immediate sync via BroadcastChannel (instant update when published in CMS)
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      broadcastChannel = new BroadcastChannel('bao_live_sync');
      broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'CONTENT_UPDATED') {
          console.log('[Live Sync] Instant publish from CMS detected, refreshing site data...', event.data);
          loadFreshSiteData(true);
        }
      };
    } catch {
      // BroadcastChannel unsupported or restricted in browser
    }

    // Cross-tab immediate sync via localStorage storage event
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'bao_live_content_timestamp') {
        console.log('[Live Sync] LocalStorage publish trigger detected, refreshing site data...');
        loadFreshSiteData(true);
      }
    };
    window.addEventListener('storage', onStorage);

    // Light periodic background check (every 60 seconds instead of heavy 4s polling)
    const pollInterval = setInterval(() => {
      loadFreshSiteData();
    }, 60000);

    return () => {
      window.removeEventListener('focus', onWindowFocus);
      window.removeEventListener('storage', onStorage);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
      clearInterval(pollInterval);
    };
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const segments = currentPath.split('/').filter(Boolean);
  const firstSeg = segments[0] || '';
  const secondSeg = segments[1];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#000000]">
      <Header
        lang={lang}
        setLang={setLang}
        currentPath={currentPath}
        navigate={navigate}
        settings={siteData.settings}
        menus={siteData.menus}
        projects={siteData.projects}
      />

      <main className="flex-1">
        {loading ? (
          <WebsiteSkeleton />
        ) : (
          <Suspense fallback={<WebsiteSkeleton />}>
            {firstSeg === '' ? (
              <HomeView lang={lang} siteData={siteData} navigate={navigate} />
            ) : firstSeg === 'about' ? (
              <AboutView lang={lang} subpage={secondSeg || 'about-street-children'} siteData={siteData} navigate={navigate} />
            ) : firstSeg === 'about-street-children' || firstSeg === 'growing-up-on-the-streets' ? (
              <AboutView lang={lang} subpage="about-street-children" siteData={siteData} navigate={navigate} />
            ) : firstSeg === 'about-us' || firstSeg === 'who-we-are' ? (
              <AboutView lang={lang} subpage="who-we-are" siteData={siteData} navigate={navigate} />
            ) : firstSeg === 'mission-vision' || firstSeg === 'mission-and-vision' ? (
              <AboutView lang={lang} subpage="mission-and-vision" siteData={siteData} navigate={navigate} />
            ) : firstSeg === 'our-history' || firstSeg === 'history' ? (
              <AboutView lang={lang} subpage="our-history" siteData={siteData} navigate={navigate} />
            ) : firstSeg === 'leadership-governance' || firstSeg === 'governance' || firstSeg === 'our-team' || firstSeg === 'team' || firstSeg === 'meet-the-team' ? (
              <AboutView lang={lang} subpage="leadership-and-governance" siteData={siteData} navigate={navigate} />
            ) : firstSeg === 'gallery' ? (
              <ResourcesView lang={lang} subpage="gallery" siteData={siteData} navigate={navigate} />
            ) : firstSeg === 'documentation' ? (
              <ResourcesView lang={lang} subpage="documentation" siteData={siteData} navigate={navigate} />
            ) : firstSeg === 'policies-and-guidelines' ? (
              <ResourcesView lang={lang} subpage="policies-and-guidelines" siteData={siteData} navigate={navigate} />
            ) : firstSeg === 'publications' ? (
              <ResourcesView lang={lang} subpage="publications" siteData={siteData} navigate={navigate} />
            ) : firstSeg === 'programmes' ? (
              <ProgrammesView lang={lang} slug={secondSeg} siteData={siteData} navigate={navigate} />
            ) : firstSeg === 'projects' ? (
              <ProjectsView lang={lang} slug={secondSeg} siteData={siteData} navigate={navigate} />
            ) : firstSeg === 'impact' ? (
              <ImpactView lang={lang} siteData={siteData} navigate={navigate} />
            ) : firstSeg === 'stories' || firstSeg === 'news' || firstSeg === 'news-events' ? (
              <NewsAndEventsView lang={lang} slug={secondSeg} siteData={siteData} navigate={navigate} />
            ) : firstSeg === 'resources' ? (
              <ResourcesView lang={lang} subpage={secondSeg} siteData={siteData} navigate={navigate} />
            ) : firstSeg === 'get-involved' ? (
              <GetInvolvedView lang={lang} siteData={siteData} navigate={navigate} />
            ) : firstSeg === 'contact' ? (
              <ContactView lang={lang} siteData={siteData} navigate={navigate} />
            ) : firstSeg === 'policies' ? (
              <PolicyView slug={secondSeg} />
            ) : (
              <HomeView lang={lang} siteData={siteData} navigate={navigate} />
            )}
          </Suspense>
        )}
      </main>

      <Footer lang={lang} navigate={navigate} settings={siteData.settings} menus={siteData.menus} />
    </div>
  );
}
export default App;

