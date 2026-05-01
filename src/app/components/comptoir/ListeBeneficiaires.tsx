import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Plus, Eye, Edit2, History, AlertCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  comptoirStorageEvents,
  comptoirStorageKeys,
  obtenirBeneficiairesComptoir,
  type ComptoirBeneficiary,
} from '../../utils/comptoirStorage';

interface ListeBeneficiairesProps {
  onNavigate: (view: string, id?: string) => void;
}

export function ListeBeneficiaires({ onNavigate }: ListeBeneficiairesProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('all');
  const [filterPriorite, setFilterPriorite] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [beneficiaires, setBeneficiaires] = useState<ComptoirBeneficiary[]>(() => obtenirBeneficiairesComptoir());

  useEffect(() => {
    const refreshBeneficiaires = () => {
      setBeneficiaires(obtenirBeneficiairesComptoir());
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === comptoirStorageKeys.beneficiaries) {
        refreshBeneficiaires();
      }
    };

    const handleComptoirStorageUpdated = (event: Event) => {
      const { detail } = event as CustomEvent<{ key?: string }>;
      if (detail?.key === comptoirStorageKeys.beneficiaries) {
        refreshBeneficiaires();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(comptoirStorageEvents.updated, handleComptoirStorageUpdated);
    window.addEventListener('focus', refreshBeneficiaires);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(comptoirStorageEvents.updated, handleComptoirStorageUpdated);
      window.removeEventListener('focus', refreshBeneficiaires);
    };
  }, []);

  // Filtrage amélioré avec recherche par ID
  const beneficiairesFiltres = beneficiaires.filter((b) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = !searchTerm || 
                       b.nom.toLowerCase().includes(searchLower) ||
                       b.id.toLowerCase().includes(searchLower) ||
                       b.email.toLowerCase().includes(searchLower) ||
                       b.telephone.includes(searchTerm);
    const matchStatut = filterStatut === 'all' || b.statut === filterStatut;
    const matchPriorite = filterPriorite === 'all' || b.priorite === filterPriorite;
    return matchSearch && matchStatut && matchPriorite;
  });

  // Fonction pour effacer la recherche
  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Fonction pour réinitialiser tous les filtres
  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterStatut('all');
    setFilterPriorite('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || filterStatut !== 'all' || filterPriorite !== 'all';

  // Pagination
  const totalPages = Math.ceil(beneficiairesFiltres.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = beneficiairesFiltres.slice(startIndex, startIndex + itemsPerPage);

  const getStatutBadge = (statut: ComptoirBeneficiary['statut']) => {
    if (statut === 'actif') {
      return <Badge className="bg-[#4CAF50] hover:bg-[#4CAF50]">{t('common.active')}</Badge>;
    }
    return <Badge className="bg-[#666666] hover:bg-[#666666]">{t('common.inactive')}</Badge>;
  };

  const getPrioriteBadge = (priorite: ComptoirBeneficiary['priorite']) => {
    switch (priorite) {
      case 'haute':
        return <Badge className="bg-[#DC3545] hover:bg-[#DC3545]">{t('comptoir.highPriority')}</Badge>;
      case 'normale':
        return <Badge className="bg-[#1E73BE] hover:bg-[#1E73BE]">{t('comptoir.normalPriority')}</Badge>;
      case 'basse':
        return <Badge className="bg-[#999999] hover:bg-[#999999]">{t('comptoir.lowPriority')}</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Barre supérieure */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666] w-4 h-4" />
              <Input
                placeholder={t('comptoir.searchBeneficiaries')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
              {searchTerm && (
                <X
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666666] w-4 h-4 cursor-pointer"
                  onClick={clearSearch}
                />
              )}
            </div>

            {/* Filtres */}
            <div className="flex gap-2 flex-wrap">
              <Select value={filterStatut} onValueChange={setFilterStatut}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t('common.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="actif">{t('common.active')}</SelectItem>
                  <SelectItem value="inactif">{t('common.inactive')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriorite} onValueChange={setFilterPriorite}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t('comptoir.priority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="haute">{t('comptoir.highPriority')}</SelectItem>
                  <SelectItem value="normale">{t('comptoir.normalPriority')}</SelectItem>
                  <SelectItem value="basse">{t('comptoir.lowPriority')}</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                className="bg-[#4CAF50] hover:bg-[#45a049]"
                onClick={() => onNavigate('fiche-beneficiaire', 'new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{t('comptoir.newBeneficiary')}</span>
                <span className="sm:hidden">{t('common.add')}</span>
              </Button>
            </div>
          </div>

          {/* Info résultats */}
          <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
            <div className="text-sm text-[#666666]">
              <span className="font-medium text-[#333333]">{beneficiairesFiltres.length}</span> {t('comptoir.resultsFound')}
              {searchTerm && (
                <span className="ml-2">
                  pour "<span className="font-medium text-[#1E73BE]">{searchTerm}</span>"
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-[#DC3545] hover:text-[#DC3545] hover:bg-[#DC354510]"
              >
                <X className="w-4 h-4 mr-1" />
                {t('comptoir.clearSearch')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tableau - Version mobile et desktop */}
      <Card>
        <CardContent className="p-0">
          {/* Version Desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F4F4F4] border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('comptoir.name')}
                  </th>
                  <th className="text-left p-4 font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('comptoir.fileNumber')}
                  </th>
                  <th className="text-left p-4 font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('common.status')}
                  </th>
                  <th className="text-left p-4 font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('comptoir.lastAid')}
                  </th>
                  <th className="text-left p-4 font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('comptoir.priority')}
                  </th>
                  <th className="text-left p-4 font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedData.map((beneficiaire) => (
                  <tr key={beneficiaire.id} className="hover:bg-[#F4F4F4] transition-colors">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-[#333333]">{beneficiaire.nom}</div>
                        <div className="text-sm text-[#666666]">{beneficiaire.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-sm font-medium text-[#1E73BE] bg-[#1E73BE10] px-2 py-1 rounded inline-block">
                        {beneficiaire.id}
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatutBadge(beneficiaire.statut)}
                    </td>
                    <td className="p-4 text-[#666666]">
                      {beneficiaire.derniereAide}
                    </td>
                    <td className="p-4">
                      {getPrioriteBadge(beneficiaire.priorite)}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onNavigate('fiche-beneficiaire', beneficiaire.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onNavigate('fiche-beneficiaire', beneficiaire.id)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onNavigate('fiche-beneficiaire', beneficiaire.id)}
                        >
                          <History className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Version Mobile */}
          <div className="lg:hidden divide-y">
            {paginatedData.map((beneficiaire) => (
              <div 
                key={beneficiaire.id} 
                className="p-4 hover:bg-[#F4F4F4] transition-colors"
                onClick={() => onNavigate('fiche-beneficiaire', beneficiaire.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-[#333333] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {beneficiaire.nom}
                    </div>
                    <div className="font-mono text-xs font-medium text-[#1E73BE] bg-[#1E73BE10] px-2 py-0.5 rounded inline-block mb-1">
                      {beneficiaire.id}
                    </div>
                    <div className="text-sm text-[#666666]">{beneficiaire.email}</div>
                  </div>
                  {getStatutBadge(beneficiaire.statut)}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-[#666666]">
                    {t('comptoir.lastAid')}: {beneficiaire.derniereAide}
                  </div>
                  {getPrioriteBadge(beneficiaire.priorite)}
                </div>
              </div>
            ))}
          </div>

          {/* Aucun résultat */}
          {beneficiairesFiltres.length === 0 && (
            <div className="text-center py-12 px-4">
              <Search className="w-16 h-16 text-[#CCCCCC] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#333333] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {t('comptoir.noResultsFound')}
              </h3>
              <p className="text-[#666666] mb-4">
                {searchTerm ? (
                  <>
                    {t('comptoir.noResultsDesc')} "<span className="font-medium">{searchTerm}</span>"
                  </>
                ) : (
                  t('comptoir.noResultsDesc')
                )}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white"
                >
                  <X className="w-4 h-4 mr-2" />
                  {t('comptoir.clearSearch')}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[#666666]">
                Page {currentPage} {t('common.of')} {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">{t('common.previous')}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <span className="hidden sm:inline mr-2">{t('common.next')}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}