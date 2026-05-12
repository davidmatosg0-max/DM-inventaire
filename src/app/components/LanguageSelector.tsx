import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { applyLanguageToDocument, normalizeLanguageCode } from '../../i18n/config';

const languages = [
  { code: 'es', name: 'Espagnol', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const activeLanguageCode = normalizeLanguageCode(i18n.resolvedLanguage || i18n.language);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    applyLanguageToDocument(langCode);
  };

  const currentLanguage = languages.find(lang => lang.code === activeLanguageCode) || languages.find(lang => lang.code === 'fr') || languages[0];

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white hidden sm:block" />
      <Select value={activeLanguageCode} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[100px] sm:w-[140px] md:w-[160px] bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors text-xs sm:text-sm">
          <SelectValue>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-base sm:text-lg">{currentLanguage.flag}</span>
              <span className="font-medium hidden sm:inline">{currentLanguage.name}</span>
              <span className="font-medium sm:hidden">{currentLanguage.code.toUpperCase()}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}