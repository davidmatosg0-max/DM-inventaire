import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales/es.json';
import fr from './locales/fr.json';
import en from './locales/en.json';
import ar from './locales/ar.json';

// Obtener idioma guardado del localStorage o usar francés como predeterminado
const getSavedLanguage = () => {
  try {
    return localStorage.getItem('language') || 'fr';
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
  try {
    localStorage.setItem('language', lng);
  } catch (error) {
    console.warn('No se pudo guardar el idioma en localStorage', error);
  }
});

export default i18n;