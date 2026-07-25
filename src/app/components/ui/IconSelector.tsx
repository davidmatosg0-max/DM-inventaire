import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { Input } from './input';
import { Label } from './label';
import {
  CATEGORIAS_NO_ALIMENTARIAS,
  FAMILIAS_OPERATIVAS_ICONOS_ALIMENTARIOS,
  ICONOS_CATEGORIAS,
  ICONOS_SECCIONES_ALIMENTARIAS,
  obtenerIconosRecomendadosPorFamilia,
} from '../../data/iconosAlimentos';

interface IconSelectorProps {
  value: string;
  onChange: (icono: string) => void;
  label?: string;
  contextoNombre?: string;
  iconosRecomendados?: string[];
  gridCols?: number;
  maxHeight?: string;
}

export function IconSelector({ 
  value, 
  onChange, 
  label,
  contextoNombre,
  iconosRecomendados,
  gridCols = 8,
  maxHeight = 'max-h-40'
}: IconSelectorProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categoryOptions = [
    { id: 'all', label: t('common.iconCategories.all') },
    ...FAMILIAS_OPERATIVAS_ICONOS_ALIMENTARIOS.map(familia => ({
      id: familia.id,
      label: familia.label,
    })),
    ...ICONOS_SECCIONES_ALIMENTARIAS.map(section => ({
      id: section.id,
      label: t(section.commonLabelKey),
    })),
    { id: 'non-food', label: t('common.iconCategories.nonFood') },
  ];

  const matchesSection = (emoji: string, categoria: string) => {
    if (selectedCategory === 'all') {
      return true;
    }

    if (selectedCategory === 'non-food') {
      return CATEGORIAS_NO_ALIMENTARIAS.includes(categoria);
    }

    const familiaOperativa = FAMILIAS_OPERATIVAS_ICONOS_ALIMENTARIOS.find(familia => familia.id === selectedCategory);
    if (familiaOperativa) {
      return familiaOperativa.iconos.includes(emoji);
    }

    const selectedSection = ICONOS_SECCIONES_ALIMENTARIAS.find(section => section.id === selectedCategory);
    return selectedSection ? selectedSection.iconos.includes(emoji) : false;
  };

  const iconosFiltrados = (() => {
    const filteredEntries = ICONOS_CATEGORIAS.filter(icono => {
      const matchSearch = searchTerm === '' || 
        icono.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        icono.categoria.toLowerCase().includes(searchTerm.toLowerCase());

      return matchSearch && matchesSection(icono.emoji, icono.categoria);
    });

    const uniqueEntries = new Map<string, { emoji: string; title: string }>();
    filteredEntries.forEach((icono) => {
      const existing = uniqueEntries.get(icono.emoji);
      if (existing) {
        existing.title = `${existing.title} • ${icono.nombre}`;
      } else {
        uniqueEntries.set(icono.emoji, { emoji: icono.emoji, title: icono.nombre });
      }
    });

    const recomendados = (iconosRecomendados && iconosRecomendados.length > 0)
      ? iconosRecomendados
      : obtenerIconosRecomendadosPorFamilia(contextoNombre || '');

    const prioridad = new Map(recomendados.map((emoji, index) => [emoji, index]));
    return Array.from(uniqueEntries.values()).sort((a, b) => {
      const indexA = prioridad.get(a.emoji);
      const indexB = prioridad.get(b.emoji);
      const prioridadA = indexA !== undefined ? indexA : Number.MAX_SAFE_INTEGER;
      const prioridadB = indexB !== undefined ? indexB : Number.MAX_SAFE_INTEGER;

      if (prioridadA !== prioridadB) {
        return prioridadA - prioridadB;
      }

      return a.title.localeCompare(b.title);
    });
  })();

  const iconosRecomendadosVisibles = (() => {
    const recomendados = (iconosRecomendados && iconosRecomendados.length > 0)
      ? iconosRecomendados
      : obtenerIconosRecomendadosPorFamilia(contextoNombre || '');

    const visibles = new Set(iconosFiltrados.map((icono) => icono.emoji));
    return recomendados.filter((emoji) => visibles.has(emoji)).slice(0, 8);
  })();

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
        {categoryOptions.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedCategory === cat.id 
                ? 'bg-[#1E73BE] text-white' 
                : 'bg-gray-100 text-[#666666] hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {iconosRecomendadosVisibles.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-2">
          <p className="mb-2 text-xs font-medium text-[#1E73BE]">Icônes recommandées</p>
          <div className="flex flex-wrap gap-1">
            {iconosRecomendadosVisibles.map((icono) => (
              <button
                key={`reco-${icono}`}
                type="button"
                onClick={() => onChange(icono)}
                className={`text-xl p-1.5 rounded hover:bg-blue-100 transition-colors ${
                  value === icono ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-white'
                }`}
                title="Icône recommandée"
              >
                {icono}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid de iconos */}
      <div className={`grid grid-cols-${gridCols} gap-2 p-4 border rounded-lg ${maxHeight} overflow-y-auto`}>
        {iconosFiltrados.map((icono, index) => (
          <button
            key={`${icono.emoji}-${index}`}
            type="button"
            onClick={() => onChange(icono.emoji)}
            className={`text-2xl p-2 rounded hover:bg-gray-100 transition-all ${
              value === icono.emoji ? 'bg-blue-100 ring-2 ring-blue-500 scale-110' : ''
            }`}
            title={icono.title}
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
