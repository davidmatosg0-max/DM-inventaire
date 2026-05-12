import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { applyLanguageToDocument, normalizeLanguageCode } from '../../../i18n/config';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const activeLanguageCode = normalizeLanguageCode(i18n.resolvedLanguage || i18n.language);

  const languages = [
    { code: 'es', name: 'Espagnol', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  const currentLanguage = languages.find(lang => lang.code === activeLanguageCode) || languages.find(lang => lang.code === 'fr') || languages[0];

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    applyLanguageToDocument(value);
  };

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow-md px-3 py-2">
      <Globe className="w-5 h-5 text-[#1E73BE]" />
      <Select value={activeLanguageCode} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[150px] h-9 border-0 focus:ring-0">
          <SelectValue>
            <span className="flex items-center gap-2">
              <span className="text-lg">{currentLanguage.flag}</span>
              <span className="text-sm font-medium text-[#333333]">{currentLanguage.name}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                <span className="text-lg">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}