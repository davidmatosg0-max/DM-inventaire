import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Loader2,
  Package,
  ClipboardList,
  Building,
  Truck,
  Users,
  ArrowRight,
  Command,
} from 'lucide-react';
import { useGlobalSearch, useSearchShortcut, SearchResult } from '../hooks/useGlobalSearch';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useBranding } from '../../hooks/useBranding';

interface GlobalSearchProps {
  onNavigate: (page: string) => void;
  onClose?: () => void;
}

const CATEGORY_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  productos: {
    label: 'Produits',
    icon: <Package className="w-4 h-4" />,
    color: '#1a4d7a',
  },
  comandas: {
    label: 'Commandes',
    icon: <ClipboardList className="w-4 h-4" />,
    color: '#FFC107',
  },
  organismos: {
    label: 'Organismes',
    icon: <Building className="w-4 h-4" />,
    color: '#2d9561',
  },
  transporte: {
    label: 'Transport',
    icon: <Truck className="w-4 h-4" />,
    color: '#DC3545',
  },
  contactos: {
    label: 'Contacts',
    icon: <Users className="w-4 h-4" />,
    color: '#9C27B0',
  },
};

export function GlobalSearch({ onNavigate, onClose }: GlobalSearchProps) {
  const { t } = useTranslation();
  const branding = useBranding();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const {
    query,
    setQuery,
    results,
    loading,
    totalResults,
    clearSearch,
    resultsByCategory,
  } = useGlobalSearch({
    minChars: 2,
    debounceMs: 300,
    maxResults: 50,
  });

  // Manejar shortcut Ctrl+K
  useSearchShortcut(() => {
    setIsOpen(true);
  });

  // Focus en input cuando se abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Reset selected index cuando cambian los resultados
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Manejar navegación con teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleSelectResult(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Scroll al elemento seleccionado
  useEffect(() => {
    if (resultsRef.current && results[selectedIndex]) {
      const selectedElement = resultsRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      ) as HTMLElement;
      
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [selectedIndex, results]);

  const handleClose = () => {
    setIsOpen(false);
    clearSearch();
    setSelectedIndex(0);
    if (onClose) onClose();
  };

  const handleSelectResult = (result: SearchResult) => {
    if (result.route) {
      onNavigate(result.route);
    }
    handleClose();
  };

  const renderCategoryResults = (category: string, categoryResults: SearchResult[]) => {
    if (categoryResults.length === 0) return null;

    const categoryInfo = CATEGORY_LABELS[category];

    return (
      <div key={category} className="mb-4">
        <div className="flex items-center gap-2 px-4 py-2 text-sm font-semibold" style={{ color: categoryInfo.color }}>
          {categoryInfo.icon}
          <span>{categoryInfo.label}</span>
          <Badge variant="secondary" className="ml-auto text-xs">
            {categoryResults.length}
          </Badge>
        </div>
        <div className="space-y-1">
          {categoryResults.map((result, index) => {
            const globalIndex = results.findIndex((r) => r.id === result.id);
            const isSelected = globalIndex === selectedIndex;

            return (
              <motion.button
                key={result.id}
                data-index={globalIndex}
                onClick={() => handleSelectResult(result)}
                onMouseEnter={() => setSelectedIndex(globalIndex)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`w-full px-4 py-3 text-left transition-all rounded-lg mx-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4'
                    : 'hover:bg-gray-50'
                }`}
                style={{
                  borderLeftColor: isSelected ? categoryInfo.color : 'transparent',
                  borderLeftWidth: isSelected ? '4px' : '0',
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0 mt-0.5">{result.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-[#333333] truncate">
                        {result.title}
                      </p>
                      {isSelected && (
                        <ArrowRight className="w-4 h-4 text-[#1a4d7a] flex-shrink-0 animate-pulse" />
                      )}
                    </div>
                    {result.subtitle && (
                      <p className="text-xs text-[#666666] truncate mt-0.5">
                        {result.subtitle}
                      </p>
                    )}
                    {result.description && (
                      <p className="text-xs text-[#999999] truncate mt-1">
                        {result.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="hidden lg:flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm">Rechercher...</span>
        <kbd className="ml-2 px-2 py-0.5 text-xs bg-white/20 rounded border border-white/30">
          Ctrl+K
        </kbd>
      </Button>

      {/* Mobile Trigger */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="lg:hidden hover:bg-white/20"
      >
        <Search className="w-5 h-5 text-white" />
      </Button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[101] flex items-start justify-center p-4 pt-[10vh]">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl border border-white/20"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.90) 100%)',
                }}
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-[#666666] flex-shrink-0" />
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder={t('common.search') || 'Rechercher dans tout le système...'}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="flex-1 border-0 shadow-none focus-visible:ring-0 text-base"
                    />
                    {loading && <Loader2 className="w-5 h-5 text-[#1a4d7a] animate-spin" />}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClose}
                      className="flex-shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Stats */}
                  {query.length >= 2 && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-[#666666]">
                      <span>
                        {totalResults} {totalResults === 1 ? 'résultat trouvé' : 'résultats trouvés'}
                      </span>
                      {totalResults > results.length && (
                        <span className="text-[#999999]">
                          (affichage des {results.length} premiers)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Results */}
                <ScrollArea className="max-h-[60vh]">
                  <div ref={resultsRef} className="p-2">
                    {query.length === 0 && (
                      <div className="text-center py-12">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-[#666666] mb-2">
                          Recherchez dans tout le système
                        </p>
                        <p className="text-xs text-[#999999]">
                          Produits, commandes, organismes, transport et contacts
                        </p>
                      </div>
                    )}

                    {query.length > 0 && query.length < 2 && (
                      <div className="text-center py-12">
                        <Command className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-[#666666]">
                          Tapez au moins 2 caractères pour rechercher
                        </p>
                      </div>
                    )}

                    {query.length >= 2 && !loading && results.length === 0 && (
                      <div className="text-center py-12">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-[#666666] mb-2">
                          Aucun résultat trouvé pour "{query}"
                        </p>
                        <p className="text-xs text-[#999999]">
                          Essayez avec d'autres mots-clés
                        </p>
                      </div>
                    )}

                    {query.length >= 2 && results.length > 0 && (
                      <div className="space-y-2">
                        {Object.entries(resultsByCategory).map(([category, categoryResults]) =>
                          renderCategoryResults(category, categoryResults)
                        )}
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Footer */}
                <div className="p-3 border-t border-gray-200 bg-gray-50/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-xs text-[#666666]">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <kbd className="px-2 py-1 bg-white rounded border border-gray-300">↑</kbd>
                        <kbd className="px-2 py-1 bg-white rounded border border-gray-300">↓</kbd>
                        <span className="ml-1">naviguer</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <kbd className="px-2 py-1 bg-white rounded border border-gray-300">↵</kbd>
                        <span className="ml-1">sélectionner</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <kbd className="px-2 py-1 bg-white rounded border border-gray-300">ESC</kbd>
                        <span className="ml-1">fermer</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Command className="w-3 h-3" />
                      <span>Recherche globale</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
