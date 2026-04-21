import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import {
  Search,
  User,
  GraduationCap,
  X,
  LayoutDashboard,
  Users,
  DollarSign,
  ClipboardList,
  Newspaper,
  CalendarDays,
  MessageCircle,
  Settings as SettingsIcon,
  Building2,
  Shield,
  CreditCard,
  Bell,
  Globe,
  Palette,
  Trophy,
  MapPin,
  Plus,
  KeyRound,
} from 'lucide-react';
import { useMembers } from '@/features/members/useMembers';
import { useCoaches } from '@/features/coaches/useCoaches';

type NavResult = {
  id: string;
  labelKey: string;
  descriptionKey: string;
  path: string;
  icon: React.ElementType;
  keywords: string[];
  hash?: string;
};

const NAVIGATION_ITEMS: NavResult[] = [
  // Pages
  { id: 'nav-dashboard', labelKey: 'navigation.dashboard', descriptionKey: 'search.descDashboard', path: '/', icon: LayoutDashboard, keywords: ['dashboard', 'pocetna', 'početna', 'home', 'overview', 'pregled', 'start', 'statistika', 'kpi'] },
  { id: 'nav-club-members', labelKey: 'navigation.clubMembers', descriptionKey: 'search.descClubMembers', path: '/club-members', icon: Users, keywords: ['members', 'clanovi', 'članovi', 'coaches', 'treneri', 'group', 'grupa', 'team', 'tim', 'player', 'igrac', 'igrač'] },
  { id: 'nav-finances', labelKey: 'navigation.finances', descriptionKey: 'search.descFinances', path: '/finances', icon: DollarSign, keywords: ['finance', 'finansije', 'money', 'novac', 'transaction', 'transakcija', 'income', 'prihod', 'expense', 'rashod', 'profit', 'dobit', 'membership', 'clanarina', 'članarina'] },
  { id: 'nav-evidence', labelKey: 'navigation.evidence', descriptionKey: 'search.descEvidence', path: '/evidence', icon: ClipboardList, keywords: ['evidence', 'evidencija', 'payment', 'uplata', 'medical', 'lekarski', 'pregled', 'unpaid', 'neplaceno', 'neplaćeno', 'reminder', 'podsetnik'] },
  { id: 'nav-news', labelKey: 'navigation.news', descriptionKey: 'search.descNews', path: '/news', icon: Newspaper, keywords: ['news', 'novosti', 'post', 'objava', 'announcement', 'obavestenje', 'obaveštenje', 'vest'] },
  { id: 'nav-calendar', labelKey: 'navigation.calendar', descriptionKey: 'search.descCalendar', path: '/calendar', icon: CalendarDays, keywords: ['calendar', 'kalendar', 'event', 'dogadjaj', 'događaj', 'training', 'trening', 'match', 'utakmica', 'tournament', 'turnir'] },
  { id: 'nav-chat', labelKey: 'navigation.chat', descriptionKey: 'search.descChat', path: '/chat', icon: MessageCircle, keywords: ['chat', 'message', 'poruka', 'konverzacija', 'razgovor', 'discussion'] },
  { id: 'nav-settings', labelKey: 'navigation.settings', descriptionKey: 'search.descSettings', path: '/settings', icon: SettingsIcon, keywords: ['settings', 'podesavanja', 'podešavanja', 'configuration', 'konfiguracija', 'preferences', 'preferencije'] },
  { id: 'nav-club-profile', labelKey: 'sidebar.clubProfile', descriptionKey: 'search.descClubProfile', path: '/club-profile', icon: Building2, keywords: ['club', 'klub', 'profil', 'profile', 'logo', 'grb', 'history', 'istorija', 'stadium', 'stadion', 'social', 'drustvene', 'društvene'] },
  { id: 'nav-invites', labelKey: 'navigation.inviteCodes', descriptionKey: 'search.descInvites', path: '/invites', icon: KeyRound, keywords: ['invite', 'pozivni', 'kod', 'code', 'invitation', 'registracija'] },

  // Settings sub-actions
  { id: 'settings-club', labelKey: 'search.settingsClubInfo', descriptionKey: 'search.descSettingsClubInfo', path: '/settings', icon: Shield, keywords: ['club info', 'podaci kluba', 'ime kluba', 'adresa', 'telefon', 'email', 'club name', 'address', 'phone'] },
  { id: 'settings-profile', labelKey: 'search.settingsProfile', descriptionKey: 'search.descSettingsProfile', path: '/settings', icon: User, keywords: ['profile', 'profil', 'lozinka', 'password', 'promeni lozinku', 'change password', 'ime', 'phoneNumber', 'telefon'] },
  { id: 'settings-subscription', labelKey: 'search.settingsSubscription', descriptionKey: 'search.descSettingsSubscription', path: '/settings', icon: CreditCard, keywords: ['subscription', 'pretplata', 'plan', 'upgrade', 'nadogradi', 'trial', 'probni'] },
  { id: 'settings-language', labelKey: 'search.settingsLanguage', descriptionKey: 'search.descSettingsLanguage', path: '/settings', icon: Globe, keywords: ['language', 'jezik', 'srpski', 'english', 'deutsch', 'german', 'italiano', 'francais', 'arabic', 'arapski', 'nemacki', 'italijanski'] },
  { id: 'settings-theme', labelKey: 'search.settingsTheme', descriptionKey: 'search.descSettingsTheme', path: '/settings', icon: Palette, keywords: ['theme', 'tema', 'dark', 'tamna', 'light', 'svetla', 'mode'] },

  // Club-profile quick fields
  { id: 'profile-logo', labelKey: 'search.profileLogo', descriptionKey: 'search.descProfileLogo', path: '/club-profile', icon: Shield, keywords: ['logo', 'grb', 'slika kluba', 'club logo', 'upload'] },
  { id: 'profile-history', labelKey: 'search.profileHistory', descriptionKey: 'search.descProfileHistory', path: '/club-profile', icon: Trophy, keywords: ['history', 'istorija', 'osnovan', 'founded'] },
  { id: 'profile-achievements', labelKey: 'search.profileAchievements', descriptionKey: 'search.descProfileAchievements', path: '/club-profile', icon: Trophy, keywords: ['achievements', 'dostignuca', 'dostignuća', 'trofeji', 'trophies'] },
  { id: 'profile-location', labelKey: 'search.profileLocation', descriptionKey: 'search.descProfileLocation', path: '/club-profile', icon: MapPin, keywords: ['location', 'lokacija', 'adresa', 'address', 'stadion', 'stadium'] },

  // Common actions
  { id: 'action-add-event', labelKey: 'search.addEvent', descriptionKey: 'search.descAddEvent', path: '/calendar', icon: Plus, keywords: ['new event', 'nov dogadjaj', 'nov događaj', 'training', 'trening', 'match', 'utakmica', 'create', 'kreiraj'] },
  { id: 'action-add-post', labelKey: 'search.addPost', descriptionKey: 'search.descAddPost', path: '/news', icon: Plus, keywords: ['new post', 'nova objava', 'create post', 'napisi', 'napiši'] },
  { id: 'action-add-transaction', labelKey: 'search.addTransaction', descriptionKey: 'search.descAddTransaction', path: '/finances', icon: Plus, keywords: ['transaction', 'transakcija', 'income', 'prihod', 'expense', 'rashod', 'add', 'dodaj'] },
  { id: 'action-notifications', labelKey: 'notifications.title', descriptionKey: 'search.descNotifications', path: '/', icon: Bell, keywords: ['notifications', 'obavestenja', 'obaveštenja', 'alerts'] },
];

type ResultItem =
  | { kind: 'nav'; item: NavResult; label: string; description: string }
  | { kind: 'member'; id: string; name: string; subtitle: string }
  | { kind: 'coach'; id: string; name: string; subtitle: string };

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export function GlobalSearch() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: members } = useMembers({ search: debouncedQuery });
  const { data: coaches } = useCoaches();

  const navResults: ResultItem[] = useMemo(() => {
    if (!query.trim()) return [];
    const q = normalize(query.trim());
    const scored = NAVIGATION_ITEMS.map((item) => {
      const label = t(item.labelKey);
      const description = t(item.descriptionKey, { defaultValue: '' });
      const haystack = normalize(
        [label, description, ...item.keywords].join(' ')
      );
      let score = 0;
      if (haystack.includes(q)) score = 5;
      else {
        const words = q.split(/\s+/).filter(Boolean);
        const hits = words.filter((w) => haystack.includes(w)).length;
        score = hits / Math.max(words.length, 1) * 3;
      }
      return { item, label, description, score };
    })
      .filter((r) => r.score > 1)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map<ResultItem>((r) => ({
        kind: 'nav',
        item: r.item,
        label: r.label,
        description: r.description,
      }));
    return scored;
  }, [query, t]);

  const memberResults: ResultItem[] = useMemo(() => {
    if (!query.trim()) return [];
    const q = normalize(query);
    return (members || [])
      .filter((m) => normalize(m.fullName || '').includes(q))
      .slice(0, 4)
      .map<ResultItem>((m) => ({
        kind: 'member',
        id: m.id,
        name: m.fullName,
        subtitle: m.groupName || t('members.group'),
      }));
  }, [members, query, t]);

  const coachResults: ResultItem[] = useMemo(() => {
    if (!query.trim()) return [];
    const q = normalize(query);
    return (coaches || [])
      .filter((c) => normalize(c.fullName || '').includes(q))
      .slice(0, 4)
      .map<ResultItem>((c) => ({
        kind: 'coach',
        id: c.id,
        name: c.fullName,
        subtitle: c.email || '',
      }));
  }, [coaches, query]);

  const allResults = useMemo(
    () => [...navResults, ...memberResults, ...coachResults],
    [navResults, memberResults, coachResults]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goTo = (r: ResultItem) => {
    if (r.kind === 'nav') {
      navigate(r.item.path);
    } else if (r.kind === 'member') {
      navigate(`/profile/member/${r.id}`);
    } else if (r.kind === 'coach') {
      navigate(`/profile/${r.id}`);
    }
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || allResults.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = allResults[activeIndex];
      if (selected) goTo(selected);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
  };

  const hasResults = allResults.length > 0;
  const isAppLevelIndex = (globalIdx: number) => globalIdx === activeIndex;

  let running = 0;

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
          aria-label={t('search.placeholder')}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={t('common.close')}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && query && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg z-50 max-h-[28rem] overflow-y-auto">
          {hasResults ? (
            <div className="py-2">
              {navResults.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                    {t('search.sectionNavigation')}
                  </div>
                  {navResults.map((r) => {
                    const idx = running++;
                    const Icon = (r as Extract<ResultItem, { kind: 'nav' }>).item.icon;
                    return (
                      <button
                        key={(r as Extract<ResultItem, { kind: 'nav' }>).item.id}
                        onClick={() => goTo(r)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full px-3 py-2 flex items-center gap-3 transition-colors text-left ${
                          isAppLevelIndex(idx) ? 'bg-accent' : 'hover:bg-accent'
                        }`}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {(r as Extract<ResultItem, { kind: 'nav' }>).label}
                          </p>
                          {(r as Extract<ResultItem, { kind: 'nav' }>).description && (
                            <p className="text-sm text-muted-foreground truncate">
                              {(r as Extract<ResultItem, { kind: 'nav' }>).description}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {memberResults.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                    {t('search.sectionMembers')}
                  </div>
                  {memberResults.map((r) => {
                    const idx = running++;
                    const m = r as Extract<ResultItem, { kind: 'member' }>;
                    return (
                      <button
                        key={`m-${m.id}`}
                        onClick={() => goTo(r)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full px-3 py-2 flex items-center gap-3 transition-colors text-left ${
                          isAppLevelIndex(idx) ? 'bg-accent' : 'hover:bg-accent'
                        }`}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{m.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{m.subtitle}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {coachResults.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                    {t('search.sectionCoaches')}
                  </div>
                  {coachResults.map((r) => {
                    const idx = running++;
                    const c = r as Extract<ResultItem, { kind: 'coach' }>;
                    return (
                      <button
                        key={`c-${c.id}`}
                        onClick={() => goTo(r)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full px-3 py-2 flex items-center gap-3 transition-colors text-left ${
                          isAppLevelIndex(idx) ? 'bg-accent' : 'hover:bg-accent'
                        }`}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600/10">
                          <GraduationCap className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{c.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{c.subtitle}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="px-3 py-2 border-t border-border mt-1 text-[10px] text-muted-foreground/70 flex items-center justify-between">
                <span>↑ ↓ {t('search.hintNavigate')}</span>
                <span>↵ {t('search.hintOpen')}</span>
                <span>Esc {t('search.hintClose')}</span>
              </div>
            </div>
          ) : (
            <div className="px-3 py-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{t('search.noResults')}</p>
              <p className="text-sm">{t('search.noResultsHint')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
