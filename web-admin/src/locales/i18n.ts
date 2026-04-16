import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en';
import sr from './sr';
import de from './de';
import fr from './fr';
import it from './it';
import ar from './ar';

export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
  sr: { name: 'Serbian', nativeName: 'Srpski', flag: '🇷🇸' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      sr: { translation: sr },
      de: { translation: de },
      fr: { translation: fr },
      it: { translation: it },
      ar: { translation: ar },
    },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: '4sports_language',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
