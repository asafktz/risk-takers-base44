import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from '@/components/AppLayout';
import MiniPlayer from '@/components/MiniPlayer';
import WatchPage from '@/pages/Watch';
import AboutPage from '@/pages/About';
import ContactPage from '@/pages/Contact';
import ApplyPage from '@/pages/Apply';
import VendorsPage from '@/pages/Vendors';
import JoinPage from '@/pages/Join';
// PreviousEpisodesPage hidden until episode videos are uploaded — see /episodes route below.
// import PreviousEpisodesPage from '@/pages/PreviousEpisodes';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Admin without Navbar */}
      {Pages.Admin && (
        <Route path="/Admin" element={
          <LayoutWrapper currentPageName="Admin">
            <Pages.Admin />
          </LayoutWrapper>
        } />
      )}

      {/* All other pages with Navbar */}
      <Route element={<AppLayout />}>
        <Route path="/about" element={
          <LayoutWrapper currentPageName="About">
            <AboutPage />
          </LayoutWrapper>
        } />
        <Route path="/contact" element={
          <LayoutWrapper currentPageName="Contact">
            <ContactPage />
          </LayoutWrapper>
        } />
        <Route path="/apply" element={
          <LayoutWrapper currentPageName="Apply">
            <ApplyPage />
          </LayoutWrapper>
        } />
        <Route path="/vendors" element={
          <LayoutWrapper currentPageName="Vendors">
            <VendorsPage />
          </LayoutWrapper>
        } />
        <Route path="/Join" element={
          <LayoutWrapper currentPageName="Join">
            <JoinPage />
          </LayoutWrapper>
        } />
        {/* Previous Episodes hidden until episode videos are uploaded — redirects home for now.
            To restore: re-enable the import above and swap this back to <PreviousEpisodesPage />. */}
        <Route path="/episodes" element={<Navigate to="/" replace />} />
        <Route path="/episodes/:episodeSlug" element={
          <LayoutWrapper currentPageName="Episode">
            <Pages.Episode />
          </LayoutWrapper>
        } />
        <Route path="/register/:episodeSlug" element={
          <LayoutWrapper currentPageName="Register">
            <Pages.Register />
          </LayoutWrapper>
        } />
        {/* The show lives HERE: Showrunner invite/reminder/calendar links point at this page (the event's
            watch destination) — the full journey runs in the embed, attendees never leave risktakers.show. */}
        <Route path="/watch/:slug" element={
          <LayoutWrapper currentPageName="Watch">
            <WatchPage />
          </LayoutWrapper>
        } />
        <Route path="/" element={
          <LayoutWrapper currentPageName={mainPageKey}>
            <MainPage />
          </LayoutWrapper>
        } />
        {Object.entries(Pages).filter(([path]) => path !== 'Admin').map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            }
          />
        ))}
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
          {/* persistent mini player — the show follows visitors across the site (SPA: never reloads);
              hides itself on /watch and when dismissed. Config: src/config/liveEvent.js */}
          <MiniPlayer />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App