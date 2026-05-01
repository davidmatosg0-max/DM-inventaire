import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { Input } from './input';
import { Label } from './label';
import { ICONOS_CATEGORIAS, ICONOS_POR_CATEGORIA } from '../../data/iconosAlimentos';

interface IconSelectorProps {
  value: string;
  onChange: (icono: string) => void;
  label?: string;
  gridCols?: number;
  maxHeight?: string;
}

export function IconSelector({ 
  value, 
  onChange, 
  label,
  gridCols = 8,
  maxHeight = 'max-h-40'
}: IconSelectorProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Mapeo de categorías a claves de traducción
  const categoryMapping: Record<string, string> = {
    'Todos': 'all',
    'Granos y Cereales': 'grainsAndCereals',
    'Legumbres': 'legumes',
    'Conservas': 'canned',
    'Lácteos': 'dairy',
    'Frutas': 'fruits',
    'Verduras': 'vegetables',
    'Aceites': 'oils',
    'Carnes': 'meat',
    'Pescados y Mariscos': 'fish',
    'Snacks': 'snacks',
    'Dulces': 'sweets',
    'Bebidas': 'drinks',
    'Condimentos y Salsas': 'condiments',
    'Panadería': 'bakery',
    'Platos Preparados': 'prepared',
    'Alimentos para Bebés': 'babyFood',
    'Higiene Personal': 'hygiene',
    'Limpieza': 'cleaning',
    'General': 'general',
    'Varios': 'various'
  };

  const categorias = ['Todos', ...Object.keys(ICONOS_POR_CATEGORIA)];

  const iconosFiltrados = searchTerm || selectedCategory !== 'Todos'
    ? ICONOS_CATEGORIAS.filter(icono => {
        const matchSearch = searchTerm === '' || 
          icono.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          icono.categoria.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = selectedCategory === 'Todos' || icono.categoria === selectedCategory;
        return matchSearch && matchCategory;
      })
    : ICONOS_CATEGORIAS;

  return (
    <div className="space-y-2">
      <Label>{label || t('common.iconSelector.label')}</Label>
      
      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666]" />
        <Input
          type="text"
          placeholder={t('common.iconSelector.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtro por categoría */}
      <div className="flex flex-wrap gap-2">
        {categorias.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedCategory === cat 
                ? 'bg-[#1E73BE] text-white' 
                : 'bg-gray-100 text-[#666666] hover:bg-gray-200'
            }`}
          >
            {t(`common.iconCategories.${categoryMapping[cat] || 'all'}`)}
          </button>
        ))}
      </div>

      {/* Grid de iconos */}
      <div className={`grid grid-cols-${gridCols} gap-2 p-4 border rounded-lg ${maxHeight} overflow-y-auto`}>
        {iconosFiltrados.map(icono => (
          <button
            key={icono.emoji}
            type="button"
            onClick={() => onChange(icono.emoji)}
            className={`text-2xl p-2 rounded hover:bg-gray-100 transition-all ${
              value === icono.emoji ? 'bg-blue-100 ring-2 ring-blue-500 scale-110' : ''
            }`}
            title={icono.nombre}
          >
            {icono.emoji}
          </button>
        ))}
      </div>

      {/* Contador */}
      <p className="text-xs text-[#666666] text-center">
        {iconosFiltrados.length} {t('common.iconSelector.iconsAvailable')}
      </p>
    </div>
  );
}
