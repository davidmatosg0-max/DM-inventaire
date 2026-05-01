/**
 * Selector de Idioma Mejorado
 * 
 * Componente para cambiar el idioma del sistema con:
 * - Banderas visuales
 * - Soporte RTL automático
 * - Persistencia de preferencia
 * - Animaciones suaves
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Check } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { toast } from 'sonner';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isRTL: boolean;
}

const LANGUAGES: Language[] = [
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    isRTL: false
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    isRTL: false
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇨🇦',
    isRTL: false
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    isRTL: true
  }
];

const LANGUAGE_STORAGE_KEY = 'banque_alimentaire_language';

export function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLanguage = LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0];
  
  const changeLanguage = async (langCode: string) => {
    try {
      // Cambiar idioma en i18n
      await i18n.changeLanguage(langCode);
      
      // Guardar preferencia
      localStorage.setItem(LANGUAGE_STORAGE_KEY, langCode);
      
      // Aplicar dirección RTL si es necesario
      const language = LANGUAGES.find(lang => lang.code === langCode);
      if (language) {
        document.documentElement.dir = language.isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = langCode;
      }
      
      // Notificación de éxito
      toast.success(
        t('settings.languageChanged', 'Idioma cambiado exitosamente'),
        {
          description: language?.nativeName,
          icon: language?.flag
        }
      );
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error al cambiar idioma:', error);
      toast.error(t('settings.languageChangeError', 'Error al cambiar el idioma'));
    }
  };
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 hover:bg-gray-50 transition-all"
        >
          <span className="text-xl">{currentLanguage.flag}</span>
          <Languages className="w-4 h-4" />
          <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Languages className="w-4 h-4" />
          {t('settings.selectLanguage', 'Seleccionar Idioma')}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {LANGUAGES.map((language) => {
          const isActive = language.code === i18n.language;
          
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`cursor-pointer flex items-center justify-between gap-3 ${
                isActive ? 'bg-blue-50 font-medium' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{language.flag}</span>
                <div className="flex flex-col">
                  <span className="text-sm">{language.nativeName}</span>
                  <span className="text-xs text-gray-500">{language.name}</span>
                </div>
              </div>
              
              {isActive && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5 text-xs text-gray-500">
          {t('settings.languageNote', 'El sistema se adaptará automáticamente')}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Hook para obtener el idioma actual
 */
export function useCurrentLanguage() {
  const { i18n } = useTranslation();
  return LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0];
}

/**
 * Hook para verificar si el idioma actual es RTL
 */
export function useIsRTL() {
  const currentLang = useCurrentLanguage();
  return currentLang.isRTL;
}

/**
 * Inicializar idioma desde localStorage
 */
export function initializeLanguage() {
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  
  if (savedLanguage) {
    const language = LANGUAGES.find(lang => lang.code === savedLanguage);
    if (language) {
      document.documentElement.dir = language.isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLanguage;
    }
  }
}

// Inicializar al cargar el módulo
if (typeof window !== 'undefined') {
  initializeLanguage();
}
