import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../locales/en.json';
import pt from '../locales/pt.json';
import es from '../locales/es.json';
import sk from '../locales/sk.json';

// Language resources
const resources = {
  en: { translation: en },
  pt: { translation: pt },
  es: { translation: es },
  sk: { translation: sk },
};

// Initialize i18next
i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Default language
    lng: localStorage.getItem('dreamwell_language') || undefined, // Use stored language

    // Supported languages
    supportedLngs: ['en', 'pt', 'es', 'sk'],

    // Debug mode (disable in production)
    debug: import.meta.env.DEV,

    interpolation: {
      escapeValue: false, // React already escapes
    },

    // Detection options
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'dreamwell_language',
    },
  });

export default i18n;

// Language metadata
export const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
] as const;

export type LanguageCode = (typeof languages)[number]['code'];
