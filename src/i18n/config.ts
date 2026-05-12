import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales/es.json';
import fr from './locales/fr.json';
import en from './locales/en.json';
import ar from './locales/ar.json';

export const LANGUAGE_STORAGE_KEY = 'language';
export const LEGACY_LANGUAGE_STORAGE_KEY = 'banque_alimentaire_language';
export const SUPPORTED_LANGUAGE_CODES = ['fr', 'es', 'en', 'ar'] as const;

export function normalizeLanguageCode(language?: string | null): string {
  const normalized = String(language || '')
    .trim()
    .toLowerCase()
    .split('-')[0];

  return SUPPORTED_LANGUAGE_CODES.includes(normalized as typeof SUPPORTED_LANGUAGE_CODES[number])
    ? normalized
    : 'fr';
}

export function applyLanguageToDocument(language: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  const normalized = normalizeLanguageCode(language);
  document.documentElement.dir = normalized === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = normalized;
}

// Obtener idioma guardado del localStorage o usar francés como predeterminado
const getSavedLanguage = () => {
  try {
    return normalizeLanguageCode(
      localStorage.getItem(LANGUAGE_STORAGE_KEY)
      || localStorage.getItem(LEGACY_LANGUAGE_STORAGE_KEY)
      || 'fr'
    );
  } catch (error) {
    return 'fr';
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      fr: { translation: fr },
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: getSavedLanguage(), // idioma guardado o predeterminado (francés)
    supportedLngs: [...SUPPORTED_LANGUAGE_CODES],
    nonExplicitSupportedLngs: true,
    fallbackLng: 'fr', // francés como idioma de respaldo
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Desactivar suspense porque recursos se cargan síncronamente
    },
    // Habilitar modo debug temporal para verificar traducciones
    debug: false,
    // Asegurar que se actualicen las traducciones
    returnEmptyString: false,
    returnNull: false,
  });

// Guardar idioma cuando cambie
i18n.on('languageChanged', (lng) => {
  const normalized = normalizeLanguageCode(lng);

  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
    localStorage.setItem(LEGACY_LANGUAGE_STORAGE_KEY, normalized);
  } catch (error) {
    console.warn('No se pudo guardar el idioma en localStorage', error);
  }

  applyLanguageToDocument(normalized);
});

applyLanguageToDocument(i18n.resolvedLanguage || i18n.language);

export default i18n;