import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Define pages and their tooltips
export interface TooltipConfig {
  id: string;
  targetSelector: string;
  titleKey: string;
  descriptionKey: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface PageTutorial {
  pageKey: string;
  pageNameKey: string;
  descriptionKey: string;
  tooltips: TooltipConfig[];
}

// Tutorial configurations for each page — values are i18n keys
export const PAGE_TUTORIALS: Record<string, PageTutorial> = {
  dashboard: {
    pageKey: 'dashboard',
    pageNameKey: 'navigation.dashboard',
    descriptionKey: 'onboarding.dashboard.description',
    tooltips: [
      {
        id: 'dashboard-stats',
        targetSelector: '[data-tour="stats-cards"]',
        titleKey: 'onboarding.dashboard.stats.title',
        descriptionKey: 'onboarding.dashboard.stats.description',
        position: 'bottom',
      },
      {
        id: 'dashboard-charts',
        targetSelector: '[data-tour="charts"]',
        titleKey: 'onboarding.dashboard.charts.title',
        descriptionKey: 'onboarding.dashboard.charts.description',
        position: 'top',
      },
    ],
  },
  members: {
    pageKey: 'members',
    pageNameKey: 'navigation.members',
    descriptionKey: 'onboarding.members.description',
    tooltips: [
      {
        id: 'members-add',
        targetSelector: '[data-tour="add-member"]',
        titleKey: 'onboarding.members.add.title',
        descriptionKey: 'onboarding.members.add.description',
        position: 'bottom',
      },
      {
        id: 'members-filters',
        targetSelector: '[data-tour="filters"]',
        titleKey: 'onboarding.members.filters.title',
        descriptionKey: 'onboarding.members.filters.description',
        position: 'bottom',
      },
      {
        id: 'members-table',
        targetSelector: '[data-tour="members-table"]',
        titleKey: 'onboarding.members.table.title',
        descriptionKey: 'onboarding.members.table.description',
        position: 'top',
      },
    ],
  },
  coaches: {
    pageKey: 'coaches',
    pageNameKey: 'navigation.coaches',
    descriptionKey: 'onboarding.coaches.description',
    tooltips: [
      {
        id: 'coaches-invite',
        targetSelector: '[data-tour="invite-coach"]',
        titleKey: 'onboarding.coaches.invite.title',
        descriptionKey: 'onboarding.coaches.invite.description',
        position: 'bottom',
      },
      {
        id: 'coaches-table',
        targetSelector: '[data-tour="coaches-table"]',
        titleKey: 'onboarding.coaches.table.title',
        descriptionKey: 'onboarding.coaches.table.description',
        position: 'top',
      },
    ],
  },
  finances: {
    pageKey: 'finances',
    pageNameKey: 'navigation.finances',
    descriptionKey: 'onboarding.finances.description',
    tooltips: [
      {
        id: 'finances-add',
        targetSelector: '[data-tour="add-entry"]',
        titleKey: 'onboarding.finances.add.title',
        descriptionKey: 'onboarding.finances.add.description',
        position: 'bottom',
      },
      {
        id: 'finances-summary',
        targetSelector: '[data-tour="summary-cards"]',
        titleKey: 'onboarding.finances.summary.title',
        descriptionKey: 'onboarding.finances.summary.description',
        position: 'bottom',
      },
      {
        id: 'finances-chart',
        targetSelector: '[data-tour="finance-chart"]',
        titleKey: 'onboarding.finances.chart.title',
        descriptionKey: 'onboarding.finances.chart.description',
        position: 'left',
      },
    ],
  },
  settings: {
    pageKey: 'settings',
    pageNameKey: 'navigation.settings',
    descriptionKey: 'onboarding.settings.description',
    tooltips: [
      {
        id: 'settings-club',
        targetSelector: '[data-tour="club-settings"]',
        titleKey: 'onboarding.settings.club.title',
        descriptionKey: 'onboarding.settings.club.description',
        position: 'right',
      },
      {
        id: 'settings-profile',
        targetSelector: '[data-tour="profile-settings"]',
        titleKey: 'onboarding.settings.profile.title',
        descriptionKey: 'onboarding.settings.profile.description',
        position: 'right',
      },
      {
        id: 'settings-subscription',
        targetSelector: '[data-tour="subscription"]',
        titleKey: 'onboarding.settings.subscription.title',
        descriptionKey: 'onboarding.settings.subscription.description',
        position: 'right',
      },
    ],
  },
  calendar: {
    pageKey: 'calendar',
    pageNameKey: 'navigation.calendar',
    descriptionKey: 'onboarding.calendar.description',
    tooltips: [
      {
        id: 'calendar-new-event',
        targetSelector: '[data-tour="new-event"]',
        titleKey: 'onboarding.calendar.newEvent.title',
        descriptionKey: 'onboarding.calendar.newEvent.description',
        position: 'bottom',
      },
      {
        id: 'calendar-grid',
        targetSelector: '[data-tour="calendar-grid"]',
        titleKey: 'onboarding.calendar.grid.title',
        descriptionKey: 'onboarding.calendar.grid.description',
        position: 'top',
      },
      {
        id: 'calendar-upcoming',
        targetSelector: '[data-tour="upcoming-events"]',
        titleKey: 'onboarding.calendar.upcoming.title',
        descriptionKey: 'onboarding.calendar.upcoming.description',
        position: 'left',
      },
    ],
  },
  chat: {
    pageKey: 'chat',
    pageNameKey: 'navigation.chat',
    descriptionKey: 'onboarding.chat.description',
    tooltips: [
      {
        id: 'chat-new',
        targetSelector: '[data-tour="new-chat"]',
        titleKey: 'onboarding.chat.newChat.title',
        descriptionKey: 'onboarding.chat.newChat.description',
        position: 'bottom',
      },
      {
        id: 'chat-conversations',
        targetSelector: '[data-tour="conversations"]',
        titleKey: 'onboarding.chat.conversations.title',
        descriptionKey: 'onboarding.chat.conversations.description',
        position: 'right',
      },
    ],
  },
  news: {
    pageKey: 'news',
    pageNameKey: 'navigation.news',
    descriptionKey: 'onboarding.news.description',
    tooltips: [
      {
        id: 'news-create',
        targetSelector: '[data-tour="create-post"]',
        titleKey: 'onboarding.news.create.title',
        descriptionKey: 'onboarding.news.create.description',
        position: 'bottom',
      },
      {
        id: 'news-feed',
        targetSelector: '[data-tour="news-feed"]',
        titleKey: 'onboarding.news.feed.title',
        descriptionKey: 'onboarding.news.feed.description',
        position: 'top',
      },
    ],
  },
  evidence: {
    pageKey: 'evidence',
    pageNameKey: 'navigation.evidence',
    descriptionKey: 'onboarding.evidence.description',
    tooltips: [
      {
        id: 'evidence-tabs',
        targetSelector: '[data-tour="evidence-tabs"]',
        titleKey: 'onboarding.evidence.tabs.title',
        descriptionKey: 'onboarding.evidence.tabs.description',
        position: 'bottom',
      },
      {
        id: 'evidence-search',
        targetSelector: '[data-tour="evidence-search"]',
        titleKey: 'onboarding.evidence.search.title',
        descriptionKey: 'onboarding.evidence.search.description',
        position: 'bottom',
      },
      {
        id: 'evidence-remind-all',
        targetSelector: '[data-tour="remind-all"]',
        titleKey: 'onboarding.evidence.remindAll.title',
        descriptionKey: 'onboarding.evidence.remindAll.description',
        position: 'left',
      },
    ],
  },
  clubProfile: {
    pageKey: 'clubProfile',
    pageNameKey: 'sidebar.clubProfile',
    descriptionKey: 'onboarding.clubProfile.description',
    tooltips: [
      {
        id: 'club-hero',
        targetSelector: '[data-tour="club-hero"]',
        titleKey: 'onboarding.clubProfile.hero.title',
        descriptionKey: 'onboarding.clubProfile.hero.description',
        position: 'bottom',
      },
      {
        id: 'club-edit',
        targetSelector: '[data-tour="edit-profile"]',
        titleKey: 'onboarding.clubProfile.edit.title',
        descriptionKey: 'onboarding.clubProfile.edit.description',
        position: 'left',
      },
      {
        id: 'club-contact',
        targetSelector: '[data-tour="contact-info"]',
        titleKey: 'onboarding.clubProfile.contact.title',
        descriptionKey: 'onboarding.clubProfile.contact.description',
        position: 'right',
      },
      {
        id: 'club-social',
        targetSelector: '[data-tour="social-media"]',
        titleKey: 'onboarding.clubProfile.social.title',
        descriptionKey: 'onboarding.clubProfile.social.description',
        position: 'right',
      },
    ],
  },
  clubMembers: {
    pageKey: 'clubMembers',
    pageNameKey: 'navigation.clubMembers',
    descriptionKey: 'onboarding.clubMembers.description',
    tooltips: [
      {
        id: 'club-members-tabs',
        targetSelector: '[data-tour="cm-tabs"]',
        titleKey: 'onboarding.clubMembers.tabs.title',
        descriptionKey: 'onboarding.clubMembers.tabs.description',
        position: 'bottom',
      },
      {
        id: 'club-members-new-group',
        targetSelector: '[data-tour="new-group"]',
        titleKey: 'onboarding.clubMembers.newGroup.title',
        descriptionKey: 'onboarding.clubMembers.newGroup.description',
        position: 'left',
      },
      {
        id: 'club-members-invites',
        targetSelector: '[data-tour="invite-codes"]',
        titleKey: 'onboarding.clubMembers.invites.title',
        descriptionKey: 'onboarding.clubMembers.invites.description',
        position: 'left',
      },
    ],
  },
};

interface OnboardingContextType {
  // State
  completedTutorials: Set<string>;
  currentTutorial: PageTutorial | null;
  currentTooltipIndex: number;
  isShowingTutorial: boolean;
  helpModeEnabled: boolean;

  // Actions
  startTutorial: (pageKey: string) => void;
  nextTooltip: () => void;
  prevTooltip: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  resetTutorial: (pageKey: string) => void;
  resetAllTutorials: () => void;
  toggleHelpMode: () => void;
  hasSeenTutorial: (pageKey: string) => boolean;
  checkAndStartTutorial: (pageKey: string) => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

const STORAGE_KEY = '4sports_completed_tutorials';

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set());
  const [currentTutorial, setCurrentTutorial] = useState<PageTutorial | null>(null);
  const [currentTooltipIndex, setCurrentTooltipIndex] = useState(0);
  const [isShowingTutorial, setIsShowingTutorial] = useState(false);
  const [helpModeEnabled, setHelpModeEnabled] = useState(false);

  // Load completed tutorials from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCompletedTutorials(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('Failed to load tutorial state:', error);
    }
  }, []);

  // Save completed tutorials to localStorage
  const saveCompletedTutorials = useCallback((tutorials: Set<string>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(tutorials)));
    } catch (error) {
      console.error('Failed to save tutorial state:', error);
    }
  }, []);

  const hasSeenTutorial = useCallback((pageKey: string) => {
    return completedTutorials.has(pageKey);
  }, [completedTutorials]);

  const startTutorial = useCallback((pageKey: string) => {
    const tutorial = PAGE_TUTORIALS[pageKey];
    if (tutorial) {
      setCurrentTutorial(tutorial);
      setCurrentTooltipIndex(0);
      setIsShowingTutorial(true);
    }
  }, []);

  const checkAndStartTutorial = useCallback((pageKey: string) => {
    if (!hasSeenTutorial(pageKey) && PAGE_TUTORIALS[pageKey]) {
      // Small delay to allow page to render
      setTimeout(() => startTutorial(pageKey), 500);
    }
  }, [hasSeenTutorial, startTutorial]);

  const nextTooltip = useCallback(() => {
    if (currentTutorial && currentTooltipIndex < currentTutorial.tooltips.length - 1) {
      setCurrentTooltipIndex(prev => prev + 1);
    } else {
      // Tutorial complete
      completeTutorial();
    }
  }, [currentTutorial, currentTooltipIndex]);

  const prevTooltip = useCallback(() => {
    if (currentTooltipIndex > 0) {
      setCurrentTooltipIndex(prev => prev - 1);
    }
  }, [currentTooltipIndex]);

  const skipTutorial = useCallback(() => {
    if (currentTutorial) {
      const newCompleted = new Set(completedTutorials);
      newCompleted.add(currentTutorial.pageKey);
      setCompletedTutorials(newCompleted);
      saveCompletedTutorials(newCompleted);
    }
    setCurrentTutorial(null);
    setCurrentTooltipIndex(0);
    setIsShowingTutorial(false);
  }, [currentTutorial, completedTutorials, saveCompletedTutorials]);

  const completeTutorial = useCallback(() => {
    if (currentTutorial) {
      const newCompleted = new Set(completedTutorials);
      newCompleted.add(currentTutorial.pageKey);
      setCompletedTutorials(newCompleted);
      saveCompletedTutorials(newCompleted);
    }
    setCurrentTutorial(null);
    setCurrentTooltipIndex(0);
    setIsShowingTutorial(false);
  }, [currentTutorial, completedTutorials, saveCompletedTutorials]);

  const resetTutorial = useCallback((pageKey: string) => {
    const newCompleted = new Set(completedTutorials);
    newCompleted.delete(pageKey);
    setCompletedTutorials(newCompleted);
    saveCompletedTutorials(newCompleted);
  }, [completedTutorials, saveCompletedTutorials]);

  const resetAllTutorials = useCallback(() => {
    setCompletedTutorials(new Set());
    saveCompletedTutorials(new Set());
  }, [saveCompletedTutorials]);

  const toggleHelpMode = useCallback(() => {
    setHelpModeEnabled(prev => !prev);
  }, []);

  const value: OnboardingContextType = {
    completedTutorials,
    currentTutorial,
    currentTooltipIndex,
    isShowingTutorial,
    helpModeEnabled,
    startTutorial,
    nextTooltip,
    prevTooltip,
    skipTutorial,
    completeTutorial,
    resetTutorial,
    resetAllTutorials,
    toggleHelpMode,
    hasSeenTutorial,
    checkAndStartTutorial,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
