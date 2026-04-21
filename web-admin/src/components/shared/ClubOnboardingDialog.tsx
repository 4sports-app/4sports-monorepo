import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LocationAutocomplete } from '@/components/shared/LocationAutocomplete';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  Check,
  Loader2,
  Building2,
  Dumbbell,
  FileImage,
  Wallet,
  Sparkles,
  Trophy,
  MapPin,
  Phone,
  Globe,
  Image,
  Plus,
} from 'lucide-react';

// ─── Sport definitions ───────────────────────────────────────────
const SPORTS = [
  { key: 'football', emoji: '\u26BD' },
  { key: 'basketball', emoji: '\uD83C\uDFC0' },
  { key: 'volleyball', emoji: '\uD83C\uDFD0' },
  { key: 'handball', emoji: '\uD83E\uDD3E' },
  { key: 'rugby', emoji: '\uD83C\uDFC9' },
  { key: 'hockey', emoji: '\uD83C\uDFD2' },
  { key: 'waterpolo', emoji: '\uD83E\uDD3D' },
  { key: 'american_football', emoji: '\uD83C\uDFC8' },
  { key: 'tennis', emoji: '\uD83C\uDFBE' },
  { key: 'athletics', emoji: '\uD83C\uDFC3' },
  { key: 'swimming', emoji: '\uD83C\uDFCA' },
  { key: 'judo', emoji: '\uD83E\uDD4B' },
  { key: 'karate', emoji: '\uD83E\uDD4B' },
  { key: 'gymnastics', emoji: '\uD83E\uDD38' },
  { key: 'boxing', emoji: '\uD83E\uDD4A' },
  { key: 'cycling', emoji: '\uD83D\uDEB4' },
  { key: 'skiing', emoji: '\u26F7\uFE0F' },
] as const;

// ─── Currency definitions ────────────────────────────────────────
const CURRENCIES = [
  { code: 'RSD', symbol: 'RSD' },
  { code: 'EUR', symbol: '\u20AC' },
  { code: 'USD', symbol: '$' },
  { code: 'GBP', symbol: '\u00A3' },
  { code: 'CHF', symbol: 'CHF' },
  { code: 'BAM', symbol: 'KM' },
  { code: 'HRK', symbol: 'kn' },
  { code: 'TRY', symbol: '\u20BA' },
  { code: 'SAR', symbol: '\uFDFC' },
  { code: 'AED', symbol: 'AED' },
] as const;

const TOTAL_STEPS = 5;

// Lucide icons for steps (rendered as React elements)
const STEP_ICON_COMPONENTS = [
  null,
  Building2,   // 1: club name
  Dumbbell,    // 2: sport
  FileImage,   // 3: details
  Wallet,      // 4: currency
  Sparkles,    // 5: extras
];

const STEP_TITLE_KEYS = ['', 'clubSetup.clubName', 'clubSetup.chooseSport', 'clubSetup.clubDetails', 'clubSetup.chooseCurrency', 'clubSetup.extraInfo'];

interface OnboardingData {
  clubName: string;
  sport: string;
  customSport: string;
  logoUrl: string;
  phoneNumber: string;
  address: string;
  currency: string;
  foundedYear: string;
  achievements: string;
  website: string;
  instagram: string;
  facebook: string;
}

interface ClubOnboardingDialogProps {
  open: boolean;
  onComplete: () => void;
  existingClubName?: string;
}

export function ClubOnboardingDialog({ open, onComplete, existingClubName }: ClubOnboardingDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [data, setData] = useState<OnboardingData>({
    clubName: existingClubName || '',
    sport: '',
    customSport: '',
    logoUrl: '',
    phoneNumber: '',
    address: '',
    currency: 'RSD',
    foundedYear: '',
    achievements: '',
    website: '',
    instagram: '',
    facebook: '',
  });

  useEffect(() => {
    if (existingClubName && !data.clubName) {
      setData(prev => ({ ...prev, clubName: existingClubName }));
    }
  }, [existingClubName]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('images', file);
      const response = await api.post<{ success: boolean; data: { urls: string[] } }>(
        '/upload/post-images',
        formData
      );
      return response.data.data.urls[0];
    },
    onSuccess: (url) => {
      setData(prev => ({ ...prev, logoUrl: url }));
    },
    onError: () => {
      toast({ title: t('clubSetup.uploadError'), variant: 'destructive' });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const response = await api.put('/settings/club', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club-settings'] });
      queryClient.invalidateQueries({ queryKey: ['club-settings-onboarding'] });
      toast({ title: t('clubSetup.success'), variant: 'default' });
      onComplete();
    },
    onError: () => {
      toast({ title: t('clubSetup.saveError'), variant: 'destructive' });
    },
  });

  const update = (field: keyof OnboardingData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, logo: t('clubSetup.invalidImage') }));
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logo: t('clubSetup.imageTooLarge') }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
    uploadMutation.mutate(file);
  };

  const removeLogo = () => {
    setPreviewUrl(null);
    setData(prev => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!data.clubName.trim() || data.clubName.trim().length < 2) {
        newErrors.clubName = t('clubSetup.errors.clubNameRequired');
      }
      if (data.clubName.trim().length > 100) {
        newErrors.clubName = t('clubSetup.errors.clubNameTooLong');
      }
    }
    if (step === 2) {
      if (!data.sport && !data.customSport.trim()) {
        newErrors.sport = t('clubSetup.errors.sportRequired');
      }
    }
    if (step === 3 && data.phoneNumber.trim()) {
      const digitsOnly = data.phoneNumber.replace(/\D/g, '');
      if (digitsOnly.length < 8) {
        newErrors.phoneNumber = t('clubSetup.errors.phoneInvalid');
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  };

  const goBack = () => setStep(prev => Math.max(prev - 1, 1));

  const handleFinish = () => {
    const sportValue = data.sport === 'custom' ? data.customSport.trim() : data.sport;
    const payload: Record<string, any> = {
      name: data.clubName.trim(),
      sport: sportValue,
      currency: data.currency,
      onboardingCompleted: true,
    };
    if (data.logoUrl) payload.logoUrl = data.logoUrl;
    if (data.phoneNumber.trim()) payload.phoneNumber = data.phoneNumber.replace(/\D/g, '');
    if (data.address.trim()) payload.address = data.address.trim();
    if (data.foundedYear.trim()) payload.foundedYear = data.foundedYear.trim();
    if (data.achievements.trim()) payload.achievements = data.achievements.trim();
    if (data.website.trim()) payload.website = data.website.trim();
    if (data.instagram.trim()) payload.instagram = data.instagram.trim();
    if (data.facebook.trim()) payload.facebook = data.facebook.trim();
    saveMutation.mutate(payload);
  };

  if (!open) return null;

  const stepTitles = STEP_TITLE_KEYS.map(key => key ? t(key) : '');

  return (
    <div className="fixed inset-0 z-[100] bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-green-500/[0.03]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-green-500/[0.02]" />
      </div>

      <div className="relative h-full flex flex-col">
        {/* ─── Top header ───────────────────────────────────── */}
        <div className="w-full px-8 lg:px-16 pt-6 pb-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">4S</span>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">4Sports</span>
            </div>

            {/* Step indicators */}
            <div className="flex items-center">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
                const stepNum = i + 1;
                const isActive = stepNum === step;
                const isDone = stepNum < step;
                const IconComp = STEP_ICON_COMPONENTS[stepNum]!;
                return (
                  <div key={i} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                            : isDone
                              ? 'bg-green-500/15 text-green-500'
                              : 'bg-muted/60 text-muted-foreground/40'
                        }`}
                      >
                        {isDone ? <Check className="h-4 w-4" /> : <IconComp className="h-4 w-4" />}
                      </div>
                      <span className={`text-xs font-medium transition-colors hidden sm:block ${
                        isActive ? 'text-foreground' : isDone ? 'text-muted-foreground' : 'text-muted-foreground/40'
                      }`}>
                        {stepTitles[stepNum]}
                      </span>
                    </div>
                    {stepNum < TOTAL_STEPS && (
                      <div className={`flex-1 h-px mx-3 mb-7 transition-colors duration-300 ${
                        isDone ? 'bg-green-500/30' : 'bg-border'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Main content ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-8 lg:px-16">
          <div className="max-w-5xl mx-auto py-6 lg:py-10">

            {/* STEP 1 ──────────────────────────────────────── */}
            {step === 1 && (
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                    {t('clubSetup.welcome')}
                  </h1>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {t('clubSetup.welcomeDesc')}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border/50 bg-card p-6 lg:p-8 space-y-5">
                    <Label htmlFor="clubName" className="text-sm font-medium">
                      {t('clubSetup.clubName')} <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="clubName"
                      value={data.clubName}
                      onChange={e => update('clubName', e.target.value)}
                      placeholder={t('clubSetup.clubNamePlaceholder')}
                      maxLength={100}
                      className="h-14 text-lg px-4 bg-muted/30 border-border/50 focus:border-green-500 focus:ring-green-500/20"
                    />
                    {errors.clubName && (
                      <p className="text-sm text-red-400 flex items-center gap-1.5">
                        <X className="h-3.5 w-3.5" /> {errors.clubName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 ──────────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-8">
                <div className="max-w-xl">
                  <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">{t('clubSetup.chooseSport')}</h1>
                  <p className="text-lg text-muted-foreground mt-3">{t('clubSetup.chooseSportDesc')}</p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {SPORTS.map(s => {
                    const isSelected = data.sport === s.key;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => {
                          update('sport', s.key);
                          setData(prev => ({ ...prev, customSport: '' }));
                        }}
                        className={`group relative flex flex-col items-center gap-2.5 p-4 lg:p-5 rounded-2xl border transition-all duration-200 ${
                          isSelected
                            ? 'border-green-500 bg-green-500/10 shadow-md shadow-green-500/10'
                            : 'border-border/50 bg-card hover:bg-muted/60 hover:border-border'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <span className="text-3xl lg:text-4xl group-hover:scale-110 transition-transform">{s.emoji}</span>
                        <span className="text-xs font-medium leading-tight text-center text-muted-foreground group-hover:text-foreground transition-colors">
                          {t(`sports.${s.key}`)}
                        </span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => update('sport', 'custom')}
                    className={`group relative flex flex-col items-center gap-2.5 p-4 lg:p-5 rounded-2xl border transition-all duration-200 ${
                      data.sport === 'custom'
                        ? 'border-green-500 bg-green-500/10 shadow-md shadow-green-500/10'
                        : 'border-border/50 bg-card hover:bg-muted/60 hover:border-border'
                    }`}
                  >
                    {data.sport === 'custom' && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <Plus className="h-8 w-8 lg:h-9 lg:w-9 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {t('clubSetup.otherSport')}
                    </span>
                  </button>
                </div>
                {data.sport === 'custom' && (
                  <div className="max-w-md">
                    <Input
                      value={data.customSport}
                      onChange={e => update('customSport', e.target.value)}
                      placeholder={t('clubSetup.customSportPlaceholder')}
                      maxLength={50}
                      className="h-14 text-lg px-4 bg-muted/30 border-border/50 focus:border-green-500"
                    />
                  </div>
                )}
                {errors.sport && (
                  <p className="text-sm text-red-400 flex items-center gap-1.5">
                    <X className="h-3.5 w-3.5" /> {errors.sport}
                  </p>
                )}
              </div>
            )}

            {/* STEP 3 ──────────────────────────────────────── */}
            {step === 3 && (
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">{t('clubSetup.clubDetails')}</h1>
                  <p className="text-lg text-muted-foreground leading-relaxed">{t('clubSetup.clubDetailsDesc')}</p>
                </div>
                <div className="space-y-5">
                  {/* Logo upload */}
                  <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Image className="h-4 w-4" />
                      {t('clubSetup.clubLogo')}
                    </div>
                    <div className="flex items-center gap-5">
                      {previewUrl || data.logoUrl ? (
                        <div className="relative">
                          <img
                            src={previewUrl || data.logoUrl}
                            alt="Logo"
                            className="w-24 h-24 rounded-2xl object-cover border-2 border-green-500/30"
                          />
                          <button
                            type="button"
                            onClick={removeLogo}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-24 h-24 rounded-2xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center gap-1.5 hover:border-green-500/40 hover:bg-green-500/5 transition-all"
                        >
                          {uploadMutation.isPending ? (
                            <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                          ) : (
                            <>
                              <Upload className="h-5 w-5 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">Upload</span>
                            </>
                          )}
                        </button>
                      )}
                      <p className="text-sm text-muted-foreground">{t('clubSetup.logoHint')}</p>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    {errors.logo && <p className="text-sm text-red-400">{errors.logo}</p>}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="onb-phone" className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {t('clubSetup.phoneNumber')}
                    </Label>
                    <Input
                      id="onb-phone"
                      type="tel"
                      value={data.phoneNumber}
                      onChange={e => update('phoneNumber', e.target.value)}
                      placeholder={t('clubSetup.phonePlaceholder')}
                      className="h-12 text-base px-4 bg-muted/30 border-border/50 focus:border-green-500"
                    />
                    {errors.phoneNumber && <p className="text-sm text-red-400">{errors.phoneNumber}</p>}
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {t('clubSetup.location')}
                    </Label>
                    <LocationAutocomplete
                      value={data.address}
                      onChange={val => update('address', val)}
                      placeholder={t('clubSetup.locationPlaceholder')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4 ──────────────────────────────────────── */}
            {step === 4 && (
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">{t('clubSetup.chooseCurrency')}</h1>
                  <p className="text-lg text-muted-foreground leading-relaxed">{t('clubSetup.chooseCurrencyDesc')}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {CURRENCIES.map(c => {
                    const isSelected = data.currency === c.code;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => update('currency', c.code)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 text-left ${
                          isSelected
                            ? 'border-green-500 bg-green-500/10 shadow-md shadow-green-500/10'
                            : 'border-border/50 bg-card hover:bg-muted/60 hover:border-border'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          isSelected ? 'bg-green-500/20 text-green-400' : 'bg-muted/60 text-muted-foreground'
                        }`}>
                          {c.symbol}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">{c.code}</div>
                          <div className="text-xs text-muted-foreground truncate">{t(`currencies.${c.code}`)}</div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-green-500 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 5 ──────────────────────────────────────── */}
            {step === 5 && (
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">{t('clubSetup.extraInfo')}</h1>
                  <p className="text-lg text-muted-foreground leading-relaxed">{t('clubSetup.extraInfoDesc')}</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="onb-foundedYear" className="text-sm font-medium flex items-center gap-2">
                      <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
                      {t('clubSetup.foundedYear')}
                    </Label>
                    <Input
                      id="onb-foundedYear"
                      value={data.foundedYear}
                      onChange={e => update('foundedYear', e.target.value)}
                      placeholder={t('clubSetup.foundedYearPlaceholder')}
                      maxLength={4}
                      className="h-12 text-base px-4 bg-muted/30 border-border/50 focus:border-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="onb-achievements" className="text-sm font-medium">
                      {t('clubSetup.achievements')}
                    </Label>
                    <Textarea
                      id="onb-achievements"
                      value={data.achievements}
                      onChange={e => update('achievements', e.target.value)}
                      placeholder={t('clubSetup.achievementsPlaceholder')}
                      rows={3}
                      maxLength={2000}
                      className="text-base px-4 py-3 bg-muted/30 border-border/50 focus:border-green-500 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="onb-website" className="text-sm font-medium flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      {t('clubSetup.website')}
                    </Label>
                    <Input
                      id="onb-website"
                      value={data.website}
                      onChange={e => update('website', e.target.value)}
                      placeholder="https://..."
                      className="h-12 text-base px-4 bg-muted/30 border-border/50 focus:border-green-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="onb-instagram" className="text-sm font-medium">Instagram</Label>
                      <Input
                        id="onb-instagram"
                        value={data.instagram}
                        onChange={e => update('instagram', e.target.value)}
                        placeholder="@club_handle"
                        className="h-12 text-base px-4 bg-muted/30 border-border/50 focus:border-green-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="onb-facebook" className="text-sm font-medium">Facebook</Label>
                      <Input
                        id="onb-facebook"
                        value={data.facebook}
                        onChange={e => update('facebook', e.target.value)}
                        placeholder="facebook.com/..."
                        className="h-12 text-base px-4 bg-muted/30 border-border/50 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Bottom bar ───────────────────────────────────── */}
        <div className="w-full border-t border-border/50 bg-background/80 backdrop-blur-sm px-8 lg:px-16 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            {step > 1 ? (
              <Button variant="ghost" size="lg" onClick={goBack} className="text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t('clubSetup.back')}
              </Button>
            ) : (
              <div />
            )}

            {step < TOTAL_STEPS ? (
              <div className="flex gap-3">
                {step >= 3 && (
                  <Button variant="ghost" size="lg" onClick={() => setStep(prev => prev + 1)} className="text-muted-foreground hover:text-foreground">
                    {t('clubSetup.skip')}
                  </Button>
                )}
                <Button size="lg" className="bg-green-600 hover:bg-green-700 px-10 shadow-lg shadow-green-600/20" onClick={goNext}>
                  {t('clubSetup.next')}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button variant="ghost" size="lg" onClick={handleFinish} disabled={saveMutation.isPending} className="text-muted-foreground hover:text-foreground">
                  {t('clubSetup.skipAndFinish')}
                </Button>
                <Button size="lg" className="bg-green-600 hover:bg-green-700 px-10 shadow-lg shadow-green-600/20" onClick={handleFinish} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                  {t('clubSetup.finish')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
