import React, { Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { ToastContainer } from './components/common/Toast';
import { AirSaathiAssistant } from './components/assistant/AirSaathiAssistant';

// Eagerly loaded for instant Home LCP
import { AQIHeroCard } from './components/dashboard/AQIHeroCard';
import { RecommendationsRow } from './components/dashboard/RecommendationsRow';

// Lazily loaded tab views & onboarding for production code splitting
const OnboardingView = lazy(() =>
  import('./components/onboarding/OnboardingView').then((m) => ({ default: m.OnboardingView }))
);
const SmartTipsView = lazy(() =>
  import('./components/tips/SmartTipsView').then((m) => ({ default: m.SmartTipsView }))
);
const IndoorAirView = lazy(() =>
  import('./components/indoor/IndoorAirView').then((m) => ({ default: m.IndoorAirView }))
);
const SustainabilityView = lazy(() =>
  import('./components/sustainability/SustainabilityView').then((m) => ({
    default: m.SustainabilityView,
  }))
);
const AirGuideView = lazy(() =>
  import('./components/assistant/AirGuideView').then((m) => ({ default: m.AirGuideView }))
);
const SettingsView = lazy(() =>
  import('./components/settings/SettingsView').then((m) => ({ default: m.SettingsView }))
);

const ViewSkeleton: React.FC = () => (
  <div className="w-full max-w-[1040px] mx-auto space-y-4 animate-pulse">
    <div className="h-10 w-48 bg-slate-200/80 dark:bg-slate-800 rounded-xl" />
    <div className="h-[220px] bg-white/70 dark:bg-[#182228] border border-brand-border/60 dark:border-slate-800 rounded-2xl" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="h-28 bg-white/70 dark:bg-[#182228] rounded-xl" />
      <div className="h-28 bg-white/70 dark:bg-[#182228] rounded-xl" />
      <div className="h-28 bg-white/70 dark:bg-[#182228] rounded-xl" />
    </div>
  </div>
);

// Dynamic greeting calculated according to Indian Standard Time (IST, UTC+5:30)
const getISTGreeting = (): string => {
  try {
    const now = new Date();
    const istHourStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      hour12: false,
    }).format(now);
    const hour = parseInt(istHourStr, 10);

    if (hour >= 4 && hour < 12) {
      return 'Good morning!';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon!';
    } else {
      return 'Good evening!';
    }
  } catch {
    return 'Good morning!';
  }
};

const MainContent: React.FC = () => {
  const { activePage, isOnboardingActive } = useApp();

  // ROUTE PROTECTION: Mandatory Onboarding Before Dashboard Access
  if (isOnboardingActive) {
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F4FAF8] dark:bg-[#0D1619] font-sans">
        <Suspense fallback={<ViewSkeleton />}>
          <OnboardingView />
        </Suspense>
        <ToastContainer />
        <AirSaathiAssistant />
      </div>
    );
  }

const HomeDashboardView: React.FC = () => (
  <div className="w-full max-w-[1040px] mx-auto flex flex-col">
    <div className="mb-3.5 sm:mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-brand-border/50 dark:border-slate-800">
      <div>
        <h1 className="font-heading font-extrabold text-[22px] sm:text-[24px] md:text-[26px] text-brand-text dark:text-white tracking-tight leading-tight">
          {getISTGreeting()}
        </h1>
        <p className="text-[12.5px] sm:text-[13px] md:text-[14px] font-normal text-brand-text-secondary dark:text-slate-400 mt-0.5 sm:mt-1 leading-normal">
          Here's your air-quality update and clean-air plan for today.
        </p>
      </div>
      <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#182228] border border-brand-border dark:border-slate-700 text-[11.5px] font-semibold text-brand-text dark:text-slate-200 shadow-xs self-start sm:self-auto">
        <span
          className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse motion-reduce:animate-none"
          aria-hidden="true"
        />
        <span>Live Dashboard</span>
      </div>
    </div>
    <div className="mb-3.5 md:mb-4">
      <AQIHeroCard />
    </div>
    <div className="mb-2 md:mb-3">
      <RecommendationsRow />
    </div>
  </div>
);

const renderActiveView = (page: string) => {
  switch (page) {
    case 'home':
      return <HomeDashboardView />;
    case 'tips':
      return <SmartTipsView />;
    case 'indoor':
      return <IndoorAirView />;
    case 'sustainability':
      return <SustainabilityView />;
    case 'guide':
      return <AirGuideView />;
    case 'settings':
      return <SettingsView />;
    default:
      return null;
  }
};

  return (
    <div className="h-screen w-full max-w-full bg-[#F6F9FB] dark:bg-[#0F171B] flex flex-col md:flex-row overflow-hidden font-sans">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#087C73] focus:text-white focus:rounded-lg focus:shadow-lg focus:font-semibold focus:outline-none"
      >
        Skip to main content
      </a>

      <div className="hidden md:block my-3 ml-3 md:my-3.5 md:ml-3.5 h-[calc(100vh-28px)] shrink-0 z-20">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-full min-w-0 min-h-0 overflow-hidden">
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 min-h-0 min-w-0 overflow-y-auto px-3.5 sm:px-6 md:px-8 lg:px-10 pt-3 md:pt-4 pb-24 md:pb-8 focus:outline-none"
        >
          <Suspense fallback={<ViewSkeleton />}>{renderActiveView(activePage)}</Suspense>
        </main>

        <MobileNav />
      </div>

      <ToastContainer />
      <AirSaathiAssistant />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;
