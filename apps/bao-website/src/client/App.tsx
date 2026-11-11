import React, { useEffect, useState } from 'react';
import { type LanguageCode } from '@bao/shared';
import { Header, Footer } from './components/HeaderAndFooter.js';
import { HomeView, ProgrammesView } from './components/HomeAndProgrammesViews.js';
import {
  AboutView,
  ProjectsView,
  ImpactView,
  StoriesView,
  NewsAndEventsView,
  ResourcesView,
  GetInvolvedView,
  ContactView,
  PolicyView,
} from './components/InnerPagesViews.js';

export function App() {
  const [lang, setLang] = useState<LanguageCode>('en');
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [siteData, setSiteData] = useState<any>({
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
  });
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadFreshSiteData = () => {
    setIsSyncing(true);
    fetch('/api/public/site-data?_t=' + Date.now())
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setSiteData(data);
        }
      })
      .catch((err) => {
        console.error('Failed to sync site data:', err);
      })
      .finally(() => {
        setLoading(false);
        setIsSyncing(false);
      });
  };

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      loadFreshSiteData();
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    loadFreshSiteData();

    // Auto-sync whenever user focuses the website window/tab (e.g. returning from Admin Dashboard)
    const onWindowFocus = () => {
      loadFreshSiteData();
    };
    window.addEventListener('focus', onWindowFocus);

    // Cross-tab immediate sync via BroadcastChannel
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      broadcastChannel = new BroadcastChannel('bao_live_sync');
      broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'CONTENT_UPDATED') {
          console.log('[Live Sync] Instant publish from CMS detected, refreshing site data...', event.data);
          loadFreshSiteData();
        }
      };
    } catch {
      // BroadcastChannel unsupported or restricted in browser
    }

    // Cross-tab immediate sync via localStorage storage event
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'bao_live_content_timestamp') {
        console.log('[Live Sync] LocalStorage publish trigger detected, refreshing site data...');
        loadFreshSiteData();
      }
    };
    window.addEventListener('storage', onStorage);

    // Live auto-poll every 4 seconds so changes reflect live without manual reload
    const pollInterval = setInterval(() => {
      loadFreshSiteData();
    }, 4000);

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
    loadFreshSiteData();
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
          <div className="max-w-7xl mx-auto px-4 py-24 text-center text-xs text-[#555B57]">
            Loading Babawatoto Organization content...
          </div>
        ) : firstSeg === '' ? (
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
        ) : firstSeg === 'stories' || firstSeg === 'news-events' || firstSeg === 'news' || firstSeg === 'events' ? (
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
      </main>

      <Footer lang={lang} navigate={navigate} settings={siteData.settings} menus={siteData.menus} />


    </div>
  );
}
export default App;

