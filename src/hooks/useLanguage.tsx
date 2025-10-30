import { useTranslation } from 'react-i18next';
import { languages, type LanguageCode } from '../i18n/config';

/**
 * Custom hook for language management
 * Provides easy access to translations and language switching
 */
export const useLanguage = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = async (languageCode: LanguageCode) => {
    await i18n.changeLanguage(languageCode);
    localStorage.setItem('dreamwell_language', languageCode);

    // Update HTML lang attribute for accessibility
    document.documentElement.lang = languageCode;
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return {
    t,
    currentLanguage,
    languages,
    changeLanguage,
    isRTL: i18n.dir() === 'rtl',
  };
};
