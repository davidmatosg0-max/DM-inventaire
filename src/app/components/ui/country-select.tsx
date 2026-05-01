import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { Button } from './button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from './utils';

interface Country {
  code: string;
  flag: string;
  nameEn: string;
  nameFr: string;
  nameEs: string;
  nameAr: string;
}

const countries: Country[] = [
  { code: 'ca', flag: '🇨🇦', nameEn: 'Canada', nameFr: 'Canada', nameEs: 'Canadá', nameAr: 'كندا' },
  { code: 'us', flag: '🇺🇸', nameEn: 'United States', nameFr: 'États-Unis', nameEs: 'Estados Unidos', nameAr: 'الولايات المتحدة' },
  { code: 'mx', flag: '🇲🇽', nameEn: 'Mexico', nameFr: 'Mexique', nameEs: 'México', nameAr: 'المكسيك' },
  { code: 'ht', flag: '🇭🇹', nameEn: 'Haiti', nameFr: 'Haïti', nameEs: 'Haití', nameAr: 'هايتي' },
  { code: 'fr', flag: '🇫🇷', nameEn: 'France', nameFr: 'France', nameEs: 'Francia', nameAr: 'فرنسا' },
  { code: 'dz', flag: '🇩🇿', nameEn: 'Algeria', nameFr: 'Algérie', nameEs: 'Argelia', nameAr: 'الجزائر' },
  { code: 'ma', flag: '🇲🇦', nameEn: 'Morocco', nameFr: 'Maroc', nameEs: 'Marruecos', nameAr: 'المغرب' },
  { code: 'tn', flag: '🇹🇳', nameEn: 'Tunisia', nameFr: 'Tunisie', nameEs: 'Túnez', nameAr: 'تونس' },
  { code: 'lb', flag: '🇱🇧', nameEn: 'Lebanon', nameFr: 'Liban', nameEs: 'Líbano', nameAr: 'لبنان' },
  { code: 'sy', flag: '🇸🇾', nameEn: 'Syria', nameFr: 'Syrie', nameEs: 'Siria', nameAr: 'سوريا' },
  { code: 'eg', flag: '🇪🇬', nameEn: 'Egypt', nameFr: 'Égypte', nameEs: 'Egipto', nameAr: 'مصر' },
  { code: 'cn', flag: '🇨🇳', nameEn: 'China', nameFr: 'Chine', nameEs: 'China', nameAr: 'الصين' },
  { code: 'in', flag: '🇮🇳', nameEn: 'India', nameFr: 'Inde', nameEs: 'India', nameAr: 'الهند' },
  { code: 'pk', flag: '🇵🇰', nameEn: 'Pakistan', nameFr: 'Pakistan', nameEs: 'Pakistán', nameAr: 'باكستان' },
  { code: 'ph', flag: '🇵🇭', nameEn: 'Philippines', nameFr: 'Philippines', nameEs: 'Filipinas', nameAr: 'الفلبين' },
  { code: 'vn', flag: '🇻🇳', nameEn: 'Vietnam', nameFr: 'Vietnam', nameEs: 'Vietnam', nameAr: 'فيتنام' },
  { code: 'co', flag: '🇨🇴', nameEn: 'Colombia', nameFr: 'Colombie', nameEs: 'Colombia', nameAr: 'كولومبيا' },
  { code: 've', flag: '🇻🇪', nameEn: 'Venezuela', nameFr: 'Venezuela', nameEs: 'Venezuela', nameAr: 'فنزويلا' },
  { code: 'br', flag: '🇧🇷', nameEn: 'Brazil', nameFr: 'Brésil', nameEs: 'Brasil', nameAr: 'ال��رازيل' },
  { code: 'ua', flag: '🇺🇦', nameEn: 'Ukraine', nameFr: 'Ukraine', nameEs: 'Ucrania', nameAr: 'أوكرانيا' },
  { code: 'ru', flag: '🇷🇺', nameEn: 'Russia', nameFr: 'Russie', nameEs: 'Rusia', nameAr: 'روسيا' },
  { code: 'ir', flag: '🇮🇷', nameEn: 'Iran', nameFr: 'Iran', nameEs: 'Irán', nameAr: 'إيران' },
  { code: 'af', flag: '🇦🇫', nameEn: 'Afghanistan', nameFr: 'Afghanistan', nameEs: 'Afganistán', nameAr: 'أفغانستان' },
  { code: 'iq', flag: '🇮🇶', nameEn: 'Iraq', nameFr: 'Irak', nameEs: 'Irak', nameAr: 'العراق' },
  { code: 'sa', flag: '🇸🇦', nameEn: 'Saudi Arabia', nameFr: 'Arabie Saoudite', nameEs: 'Arabia Saudita', nameAr: 'المملكة العربية السعودية' },
  { code: 'ye', flag: '🇾🇪', nameEn: 'Yemen', nameFr: 'Yémen', nameEs: 'Yemen', nameAr: 'اليمن' },
  { code: 'jo', flag: '🇯🇴', nameEn: 'Jordan', nameFr: 'Jordanie', nameEs: 'Jordania', nameAr: 'الأردن' },
  { code: 'ps', flag: '🇵🇸', nameEn: 'Palestine', nameFr: 'Palestine', nameEs: 'Palestina', nameAr: 'فلسطين' },
  { code: 'ae', flag: '🇦🇪', nameEn: 'United Arab Emirates', nameFr: 'Émirats Arabes Unis', nameEs: 'Emiratos Árabes Unidos', nameAr: 'الإمارات العربية المتحدة' },
  { code: 'kw', flag: '🇰🇼', nameEn: 'Kuwait', nameFr: 'Koweït', nameEs: 'Kuwait', nameAr: 'الكويت' },
  { code: 'qa', flag: '🇶🇦', nameEn: 'Qatar', nameFr: 'Qatar', nameEs: 'Catar', nameAr: 'قطر' },
  { code: 'om', flag: '🇴🇲', nameEn: 'Oman', nameFr: 'Oman', nameEs: 'Omán', nameAr: 'عمان' },
  { code: 'bh', flag: '🇧🇭', nameEn: 'Bahrain', nameFr: 'Bahreïn', nameEs: 'Baréin', nameAr: 'البحرين' },
  { code: 'ly', flag: '🇱🇾', nameEn: 'Libya', nameFr: 'Libye', nameEs: 'Libia', nameAr: 'ليبيا' },
  { code: 'sd', flag: '🇸🇩', nameEn: 'Sudan', nameFr: 'Soudan', nameEs: 'Sudán', nameAr: 'السودان' },
  { code: 'so', flag: '🇸🇴', nameEn: 'Somalia', nameFr: 'Somalie', nameEs: 'Somalia', nameAr: 'الصومال' },
  { code: 'et', flag: '🇪🇹', nameEn: 'Ethiopia', nameFr: 'Éthiopie', nameEs: 'Etiopía', nameAr: 'إثيوبيا' },
  { code: 'ke', flag: '🇰🇪', nameEn: 'Kenya', nameFr: 'Kenya', nameEs: 'Kenia', nameAr: 'كينيا' },
  { code: 'tz', flag: '🇹🇿', nameEn: 'Tanzania', nameFr: 'Tanzanie', nameEs: 'Tanzania', nameAr: 'تنزانيا' },
  { code: 'ug', flag: '🇺🇬', nameEn: 'Uganda', nameFr: 'Ouganda', nameEs: 'Uganda', nameAr: 'أوغندا' },
  { code: 'rw', flag: '🇷🇼', nameEn: 'Rwanda', nameFr: 'Rwanda', nameEs: 'Ruanda', nameAr: 'رواندا' },
  { code: 'bi', flag: '🇧🇮', nameEn: 'Burundi', nameFr: 'Burundi', nameEs: 'Burundi', nameAr: 'بوروندي' },
  { code: 'cd', flag: '🇨🇩', nameEn: 'DR Congo', nameFr: 'RD Congo', nameEs: 'RD Congo', nameAr: 'جمهورية الكونغو الديمقراطية' },
  { code: 'cg', flag: '🇨🇬', nameEn: 'Congo', nameFr: 'Congo', nameEs: 'Congo', nameAr: 'الكونغو' },
  { code: 'cm', flag: '🇨🇲', nameEn: 'Cameroon', nameFr: 'Cameroun', nameEs: 'Camerún', nameAr: 'الكاميرون' },
  { code: 'ng', flag: '🇳🇬', nameEn: 'Nigeria', nameFr: 'Nigéria', nameEs: 'Nigeria', nameAr: 'نيجيريا' },
  { code: 'gh', flag: '🇬🇭', nameEn: 'Ghana', nameFr: 'Ghana', nameEs: 'Ghana', nameAr: 'غانا' },
  { code: 'ci', flag: '🇨🇮', nameEn: 'Ivory Coast', nameFr: 'Côte d\'Ivoire', nameEs: 'Costa de Marfil', nameAr: 'ساحل العاج' },
  { code: 'sn', flag: '🇸🇳', nameEn: 'Senegal', nameFr: 'Sénégal', nameEs: 'Senegal', nameAr: 'السنغال' },
  { code: 'ml', flag: '🇲🇱', nameEn: 'Mali', nameFr: 'Mali', nameEs: 'Malí', nameAr: 'مالي' },
  { code: 'bf', flag: '🇧🇫', nameEn: 'Burkina Faso', nameFr: 'Burkina Faso', nameEs: 'Burkina Faso', nameAr: 'بوركينا فاسو' },
  { code: 'ne', flag: '🇳🇪', nameEn: 'Niger', nameFr: 'Niger', nameEs: 'Níger', nameAr: 'النيجر' },
  { code: 'td', flag: '🇹🇩', nameEn: 'Chad', nameFr: 'Tchad', nameEs: 'Chad', nameAr: 'تشاد' },
  { code: 'za', flag: '🇿🇦', nameEn: 'South Africa', nameFr: 'Afrique du Sud', nameEs: 'Sudáfrica', nameAr: 'جنوب أفريقيا' },
  { code: 'zw', flag: '🇿🇼', nameEn: 'Zimbabwe', nameFr: 'Zimbabwe', nameEs: 'Zimbabue', nameAr: 'زيمبابوي' },
  { code: 'mz', flag: '🇲🇿', nameEn: 'Mozambique', nameFr: 'Mozambique', nameEs: 'Mozambique', nameAr: 'موزمبيق' },
  { code: 'gb', flag: '🇬🇧', nameEn: 'United Kingdom', nameFr: 'Royaume-Uni', nameEs: 'Reino Unido', nameAr: 'المملكة المتحدة' },
  { code: 'de', flag: '🇩🇪', nameEn: 'Germany', nameFr: 'Allemagne', nameEs: 'Alemania', nameAr: 'ألمانيا' },
  { code: 'it', flag: '🇮🇹', nameEn: 'Italy', nameFr: 'Italie', nameEs: 'Italia', nameAr: 'إيطاليا' },
  { code: 'es', flag: '🇪🇸', nameEn: 'Spain', nameFr: 'Espagne', nameEs: 'España', nameAr: 'إسبانيا' },
  { code: 'pt', flag: '🇵🇹', nameEn: 'Portugal', nameFr: 'Portugal', nameEs: 'Portugal', nameAr: 'البرتغال' },
  { code: 'nl', flag: '🇳🇱', nameEn: 'Netherlands', nameFr: 'Pays-Bas', nameEs: 'Países Bajos', nameAr: 'هولندا' },
  { code: 'be', flag: '🇧🇪', nameEn: 'Belgium', nameFr: 'Belgique', nameEs: 'Bélgica', nameAr: 'بلجيكا' },
  { code: 'ch', flag: '🇨🇭', nameEn: 'Switzerland', nameFr: 'Suisse', nameEs: 'Suiza', nameAr: 'سويسرا' },
  { code: 'at', flag: '🇦🇹', nameEn: 'Austria', nameFr: 'Autriche', nameEs: 'Austria', nameAr: 'النمسا' },
  { code: 'se', flag: '🇸🇪', nameEn: 'Sweden', nameFr: 'Suède', nameEs: 'Suecia', nameAr: 'السويد' },
  { code: 'no', flag: '🇳🇴', nameEn: 'Norway', nameFr: 'Norvège', nameEs: 'Noruega', nameAr: 'النرويج' },
  { code: 'dk', flag: '🇩🇰', nameEn: 'Denmark', nameFr: 'Danemark', nameEs: 'Dinamarca', nameAr: 'الدنمارك' },
  { code: 'fi', flag: '🇫🇮', nameEn: 'Finland', nameFr: 'Finlande', nameEs: 'Finlandia', nameAr: 'فنلندا' },
  { code: 'pl', flag: '🇵🇱', nameEn: 'Poland', nameFr: 'Pologne', nameEs: 'Polonia', nameAr: 'بولندا' },
  { code: 'cz', flag: '🇨🇿', nameEn: 'Czech Republic', nameFr: 'République Tchèque', nameEs: 'República Checa', nameAr: 'التشيك' },
  { code: 'sk', flag: '🇸🇰', nameEn: 'Slovakia', nameFr: 'Slovaquie', nameEs: 'Eslovaquia', nameAr: 'سلوفاكيا' },
  { code: 'hu', flag: '🇭🇺', nameEn: 'Hungary', nameFr: 'Hongrie', nameEs: 'Hungría', nameAr: 'المجر' },
  { code: 'ro', flag: '🇷🇴', nameEn: 'Romania', nameFr: 'Roumanie', nameEs: 'Rumania', nameAr: 'رومانيا' },
  { code: 'bg', flag: '🇧🇬', nameEn: 'Bulgaria', nameFr: 'Bulgarie', nameEs: 'Bulgaria', nameAr: 'بلغاريا' },
  { code: 'gr', flag: '🇬🇷', nameEn: 'Greece', nameFr: 'Grèce', nameEs: 'Grecia', nameAr: 'اليونان' },
  { code: 'tr', flag: '🇹🇷', nameEn: 'Turkey', nameFr: 'Turquie', nameEs: 'Turquía', nameAr: 'تركيا' },
  { code: 'jp', flag: '🇯🇵', nameEn: 'Japan', nameFr: 'Japon', nameEs: 'Japón', nameAr: 'اليابان' },
  { code: 'kr', flag: '🇰🇷', nameEn: 'South Korea', nameFr: 'Corée du Sud', nameEs: 'Corea del Sur', nameAr: 'كوريا الجنوبية' },
  { code: 'kp', flag: '🇰🇵', nameEn: 'North Korea', nameFr: 'Corée du Nord', nameEs: 'Corea del Norte', nameAr: 'كوريا الشمالية' },
  { code: 'th', flag: '🇹🇭', nameEn: 'Thailand', nameFr: 'Thaïlande', nameEs: 'Tailandia', nameAr: 'تايلاند' },
  { code: 'mm', flag: '🇲🇲', nameEn: 'Myanmar', nameFr: 'Myanmar', nameEs: 'Myanmar', nameAr: 'ميانمار' },
  { code: 'la', flag: '🇱🇦', nameEn: 'Laos', nameFr: 'Laos', nameEs: 'Laos', nameAr: 'لاوس' },
  { code: 'kh', flag: '🇰🇭', nameEn: 'Cambodia', nameFr: 'Cambodge', nameEs: 'Camboya', nameAr: 'كمبوديا' },
  { code: 'my', flag: '🇲🇾', nameEn: 'Malaysia', nameFr: 'Malaisie', nameEs: 'Malasia', nameAr: 'ماليزيا' },
  { code: 'sg', flag: '🇸🇬', nameEn: 'Singapore', nameFr: 'Singapour', nameEs: 'Singapur', nameAr: 'سنغافورة' },
  { code: 'id', flag: '🇮🇩', nameEn: 'Indonesia', nameFr: 'Indonésie', nameEs: 'Indonesia', nameAr: 'إندونيسيا' },
  { code: 'bn', flag: '🇧🇳', nameEn: 'Brunei', nameFr: 'Brunei', nameEs: 'Brunéi', nameAr: 'بروناي' },
  { code: 'bd', flag: '🇧🇩', nameEn: 'Bangladesh', nameFr: 'Bangladesh', nameEs: 'Bangladés', nameAr: 'بنغلاديش' },
  { code: 'np', flag: '🇳🇵', nameEn: 'Nepal', nameFr: 'Népal', nameEs: 'Nepal', nameAr: 'نيبال' },
  { code: 'lk', flag: '🇱🇰', nameEn: 'Sri Lanka', nameFr: 'Sri Lanka', nameEs: 'Sri Lanka', nameAr: 'سريلانكا' },
  { code: 'mv', flag: '🇲🇻', nameEn: 'Maldives', nameFr: 'Maldives', nameEs: 'Maldivas', nameAr: 'المالديف' },
  { code: 'au', flag: '🇦🇺', nameEn: 'Australia', nameFr: 'Australie', nameEs: 'Australia', nameAr: 'أستراليا' },
  { code: 'nz', flag: '🇳🇿', nameEn: 'New Zealand', nameFr: 'Nouvelle-Zélande', nameEs: 'Nueva Zelanda', nameAr: 'نيوزيلندا' },
  { code: 'pg', flag: '🇵🇬', nameEn: 'Papua New Guinea', nameFr: 'Papouasie-Nouvelle-Guinée', nameEs: 'Papúa Nueva Guinea', nameAr: 'بابوا غينيا الجديدة' },
  { code: 'fj', flag: '🇫🇯', nameEn: 'Fiji', nameFr: 'Fidji', nameEs: 'Fiyi', nameAr: 'فيجي' },
  { code: 'ar', flag: '🇦🇷', nameEn: 'Argentina', nameFr: 'Argentine', nameEs: 'Argentina', nameAr: 'الأرجنتين' },
  { code: 'cl', flag: '🇨🇱', nameEn: 'Chile', nameFr: 'Chili', nameEs: 'Chile', nameAr: 'تشيلي' },
  { code: 'pe', flag: '🇵🇪', nameEn: 'Peru', nameFr: 'Pérou', nameEs: 'Perú', nameAr: 'بيرو' },
  { code: 'ec', flag: '🇪🇨', nameEn: 'Ecuador', nameFr: 'Équateur', nameEs: 'Ecuador', nameAr: 'الإكوادور' },
  { code: 'bo', flag: '🇧🇴', nameEn: 'Bolivia', nameFr: 'Bolivie', nameEs: 'Bolivia', nameAr: 'بوليفيا' },
  { code: 'py', flag: '🇵🇾', nameEn: 'Paraguay', nameFr: 'Paraguay', nameEs: 'Paraguay', nameAr: 'باراغواي' },
  { code: 'uy', flag: '🇺🇾', nameEn: 'Uruguay', nameFr: 'Uruguay', nameEs: 'Uruguay', nameAr: 'أوروغواي' },
  { code: 'gy', flag: '🇬🇾', nameEn: 'Guyana', nameFr: 'Guyana', nameEs: 'Guyana', nameAr: 'غيانا' },
  { code: 'sr', flag: '🇸🇷', nameEn: 'Suriname', nameFr: 'Suriname', nameEs: 'Surinam', nameAr: 'سورينام' },
  { code: 'gf', flag: '🇬🇫', nameEn: 'French Guiana', nameFr: 'Guyane Française', nameEs: 'Guayana Francesa', nameAr: 'غويانا الفرنسية' },
  { code: 'gt', flag: '🇬🇹', nameEn: 'Guatemala', nameFr: 'Guatemala', nameEs: 'Guatemala', nameAr: 'غواتيمالا' },
  { code: 'hn', flag: '🇭🇳', nameEn: 'Honduras', nameFr: 'Honduras', nameEs: 'Honduras', nameAr: 'هندوراس' },
  { code: 'sv', flag: '🇸🇻', nameEn: 'El Salvador', nameFr: 'Salvador', nameEs: 'El Salvador', nameAr: 'السلفادور' },
  { code: 'ni', flag: '🇳🇮', nameEn: 'Nicaragua', nameFr: 'Nicaragua', nameEs: 'Nicaragua', nameAr: 'نيكاراغوا' },
  { code: 'cr', flag: '🇨🇷', nameEn: 'Costa Rica', nameFr: 'Costa Rica', nameEs: 'Costa Rica', nameAr: 'كوستاريكا' },
  { code: 'pa', flag: '🇵🇦', nameEn: 'Panama', nameFr: 'Panama', nameEs: 'Panamá', nameAr: 'بنما' },
  { code: 'bz', flag: '🇧🇿', nameEn: 'Belize', nameFr: 'Belize', nameEs: 'Belice', nameAr: 'بليز' },
  { code: 'jm', flag: '🇯🇲', nameEn: 'Jamaica', nameFr: 'Jamaïque', nameEs: 'Jamaica', nameAr: 'جامايكا' },
  { code: 'tt', flag: '🇹🇹', nameEn: 'Trinidad and Tobago', nameFr: 'Trinité-et-Tobago', nameEs: 'Trinidad y Tobago', nameAr: 'ترينيداد وتوباغو' },
  { code: 'bs', flag: '🇧🇸', nameEn: 'Bahamas', nameFr: 'Bahamas', nameEs: 'Bahamas', nameAr: 'الباهاما' },
  { code: 'bb', flag: '🇧🇧', nameEn: 'Barbados', nameFr: 'Barbade', nameEs: 'Barbados', nameAr: 'بربادوس' },
  { code: 'cu', flag: '🇨🇺', nameEn: 'Cuba', nameFr: 'Cuba', nameEs: 'Cuba', nameAr: 'كوبا' },
  { code: 'do', flag: '🇩🇴', nameEn: 'Dominican Republic', nameFr: 'République Dominicaine', nameEs: 'República Dominicana', nameAr: 'جمهورية الدومينيكان' },
  { code: 'pr', flag: '🇵🇷', nameEn: 'Puerto Rico', nameFr: 'Porto Rico', nameEs: 'Puerto Rico', nameAr: 'بورتوريكو' },
  { code: 'ie', flag: '🇮🇪', nameEn: 'Ireland', nameFr: 'Irlande', nameEs: 'Irlanda', nameAr: 'أيرلندا' },
  { code: 'is', flag: '🇮🇸', nameEn: 'Iceland', nameFr: 'Islande', nameEs: 'Islandia', nameAr: 'أيسلندا' },
  { code: 'lu', flag: '🇱🇺', nameEn: 'Luxembourg', nameFr: 'Luxembourg', nameEs: 'Luxemburgo', nameAr: 'لوكسمبورغ' },
  { code: 'mt', flag: '🇲🇹', nameEn: 'Malta', nameFr: 'Malte', nameEs: 'Malta', nameAr: 'مالطا' },
  { code: 'cy', flag: '🇨🇾', nameEn: 'Cyprus', nameFr: 'Chypre', nameEs: 'Chipre', nameAr: 'قبرص' },
  { code: 'ee', flag: '🇪🇪', nameEn: 'Estonia', nameFr: 'Estonie', nameEs: 'Estonia', nameAr: 'إستونيا' },
  { code: 'lv', flag: '🇱🇻', nameEn: 'Latvia', nameFr: 'Lettonie', nameEs: 'Letonia', nameAr: 'لاتفيا' },
  { code: 'lt', flag: '🇱🇹', nameEn: 'Lithuania', nameFr: 'Lituanie', nameEs: 'Lituania', nameAr: 'ليتوانيا' },
  { code: 'by', flag: '🇧🇾', nameEn: 'Belarus', nameFr: 'Biélorussie', nameEs: 'Bielorrusia', nameAr: 'بيلاروسيا' },
  { code: 'md', flag: '🇲🇩', nameEn: 'Moldova', nameFr: 'Moldavie', nameEs: 'Moldavia', nameAr: 'مولدوفا' },
  { code: 'al', flag: '🇦🇱', nameEn: 'Albania', nameFr: 'Albanie', nameEs: 'Albania', nameAr: 'ألبانيا' },
  { code: 'mk', flag: '🇲🇰', nameEn: 'North Macedonia', nameFr: 'Macédoine du Nord', nameEs: 'Macedonia del Norte', nameAr: 'مقدونيا الشمالية' },
  { code: 'rs', flag: '🇷🇸', nameEn: 'Serbia', nameFr: 'Serbie', nameEs: 'Serbia', nameAr: 'صربيا' },
  { code: 'hr', flag: '🇭🇷', nameEn: 'Croatia', nameFr: 'Croatie', nameEs: 'Croacia', nameAr: 'كرواتيا' },
  { code: 'ba', flag: '🇧🇦', nameEn: 'Bosnia and Herzegovina', nameFr: 'Bosnie-Herzégovine', nameEs: 'Bosnia y Herzegovina', nameAr: 'البوسنة والهرسك' },
  { code: 'me', flag: '🇲🇪', nameEn: 'Montenegro', nameFr: 'Monténégro', nameEs: 'Montenegro', nameAr: 'الجبل الأسود' },
  { code: 'si', flag: '🇸🇮', nameEn: 'Slovenia', nameFr: 'Slovénie', nameEs: 'Eslovenia', nameAr: 'سلوفينيا' },
  { code: 'xk', flag: '🇽🇰', nameEn: 'Kosovo', nameFr: 'Kosovo', nameEs: 'Kosovo', nameAr: 'كوسوفو' },
  { code: 'ge', flag: '🇬🇪', nameEn: 'Georgia', nameFr: 'Géorgie', nameEs: 'Georgia', nameAr: 'جورجيا' },
  { code: 'am', flag: '🇦🇲', nameEn: 'Armenia', nameFr: 'Arménie', nameEs: 'Armenia', nameAr: 'أرمينيا' },
  { code: 'az', flag: '🇦🇿', nameEn: 'Azerbaijan', nameFr: 'Azerbaïdjan', nameEs: 'Azerbaiyán', nameAr: 'أذربيجان' },
  { code: 'kz', flag: '🇰🇿', nameEn: 'Kazakhstan', nameFr: 'Kazakhstan', nameEs: 'Kazajistán', nameAr: 'كازاخستان' },
  { code: 'uz', flag: '🇺🇿', nameEn: 'Uzbekistan', nameFr: 'Ouzbékistan', nameEs: 'Uzbekistán', nameAr: 'أوزبكستان' },
  { code: 'tm', flag: '🇹🇲', nameEn: 'Turkmenistan', nameFr: 'Turkménistan', nameEs: 'Turkmenistán', nameAr: 'تركمانستان' },
  { code: 'kg', flag: '🇰🇬', nameEn: 'Kyrgyzstan', nameFr: 'Kirghizistan', nameEs: 'Kirguistán', nameAr: 'قيرغيزستان' },
  { code: 'tj', flag: '🇹🇯', nameEn: 'Tajikistan', nameFr: 'Tadjikistan', nameEs: 'Tayikistán', nameAr: 'طاجيكستان' },
  { code: 'mn', flag: '🇲🇳', nameEn: 'Mongolia', nameFr: 'Mongolie', nameEs: 'Mongolia', nameAr: 'منغوليا' },
];

interface CountrySelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function CountrySelect({ value, onValueChange, disabled, className }: CountrySelectProps) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getCountryName = (country: Country) => {
    switch (i18n.language) {
      case 'fr': return country.nameFr;
      case 'es': return country.nameEs;
      case 'ar': return country.nameAr;
      default: return country.nameEn;
    }
  };

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;
    
    const query = searchQuery.toLowerCase();
    return countries.filter(country => 
      country.nameEn.toLowerCase().includes(query) ||
      country.nameFr.toLowerCase().includes(query) ||
      country.nameEs.toLowerCase().includes(query) ||
      country.nameAr.includes(query) ||
      country.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const selectedCountry = countries.find(c => c.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between',
            !value && 'text-muted-foreground',
            disabled && 'bg-[#F4F4F4]',
            className
          )}
        >
          {selectedCountry ? (
            <div className="flex items-center gap-2">
              <span>{selectedCountry.flag}</span>
              <span>{getCountryName(selectedCountry)}</span>
            </div>
          ) : (
            <span>Sélectionnez un pays...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Rechercher un pays..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList className="max-h-[300px] overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Aucun pays trouvé
              </div>
            ) : (
              <CommandGroup>
                {filteredCountries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={country.code}
                    onSelect={(currentValue) => {
                      onValueChange?.(currentValue === value ? '' : currentValue);
                      setOpen(false);
                      setSearchQuery('');
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === country.code ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span className="mr-2">{country.flag}</span>
                    <span>{getCountryName(country)}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}