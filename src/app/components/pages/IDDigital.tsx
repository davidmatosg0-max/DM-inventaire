import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Package, 
  FileText,
  ArrowLeft,
  Menu,
  ClipboardList,
  Settings
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useBranding } from '../../../hooks/useBranding';
import { ComptoirDashboard } from '../comptoir/ComptoirDashboard';
import { ListeBeneficiaires } from '../comptoir/ListeBeneficiaires';
import { FicheBeneficiaire } from '../comptoir/FicheBeneficiaire';
import { RendezVous } from '../comptoir/RendezVous';
import { AideAlimentaire } from '../comptoir/AideAlimentaire';
import { DemandesAide } from '../comptoir/DemandesAide';
import { TypesAide } from '../comptoir/TypesAide';
import { Rapports } from '../comptoir/Rapports';
import { GestionContactosDepartamento } from '../departamentos/GestionContactosDepartamento';
import { BoutonRetourHeader } from '../shared/BoutonRetour';
import { ModulePageHeader } from '../shared/ModulePageHeader';
import {
  comptoirStorageEvents,
  comptoirStorageKeys,
  obtenirDemandesAideComptoir,
  obtenirTypesAidePersonnalises,
  sauvegarderDemandesAideComptoir,
  sauvegarderTypesAidePersonnalises,
} from '../../utils/comptoirStorage';

type ComptoirView = 'dashboard' | 'beneficiaires' | 'fiche-beneficiaire' | 'rendez-vous' | 'aide-alimentaire' | 'demandes-aide' | 'types-aide' | 'rapports' | 'contactos';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export interface AidType {
  id: string;
  name: string;
  description?: string;
  defaultValue?: number;
  color: string;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  usageCount?: number;
}

export interface AidRequest {
  id: number;
  beneficiaire: string;
  beneficiaireId: string;
  type: string;
  quantite: number;
  dateRequested: string;
  status: 'pending' | 'approved' | 'rejected';
  processedDate?: string;
  processedBy?: string;
  notes?: string;
  rejectionReason?: string;
  estimatedValue?: number;
  appointmentDate?: string;
  appointmentTime?: string;
}

export function IDDigital() {
  const { t } = useTranslation();
  const branding = useBranding();
  const contactsViewLabel = 'Gestion des contacts';
  const [currentView, setCurrentView] = useState<ComptoirView>('dashboard');
  const [selectedBeneficiaireId, setSelectedBeneficiaireId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tipos de ayuda del sistema (no modificables) - CONTADORES EN CERO PARA PRODUCCIÓN
  const systemAidTypes: AidType[] = [
    {
      id: 'system-1',
      name: t('comptoir.completeBasket'),
      description: 'Panier alimentaire complet pour une semaine',
      defaultValue: 45.00,
      color: '#1E73BE',
      isActive: true,
      isSystem: true,
      createdAt: '2024-01-01',
      usageCount: 0
    },
    {
      id: 'system-2',
      name: t('comptoir.familyBasket'),
      description: 'Panier familial pour 4 personnes',
      defaultValue: 60.00,
      color: '#4CAF50',
      isActive: true,
      isSystem: true,
      createdAt: '2024-01-01',
      usageCount: 0
    },
    {
      id: 'system-3',
      name: t('comptoir.emergencyAid'),
      description: 'Aide alimentaire d\'urgence',
      defaultValue: 30.00,
      color: '#DC3545',
      isActive: true,
      isSystem: true,
      createdAt: '2024-01-01',
      usageCount: 0
    },
    {
      id: 'system-4',
      name: t('comptoir.essentialGoods'),
      description: 'Denrées essentielles de base',
      defaultValue: 25.00,
      color: '#FFC107',
      isActive: true,
      isSystem: true,
      createdAt: '2024-01-01',
      usageCount: 0
    },
    {
      id: 'system-5',
      name: t('comptoir.freshProducts'),
      description: 'Produits frais (fruits et légumes)',
      defaultValue: 35.00,
      color: '#4CAF50',
      isActive: true,
      isSystem: true,
      createdAt: '2024-01-01',
      usageCount: 0
    },
  ];

  // Estado compartido para tipos de ayuda personalizados - VACÍO PARA PRODUCCIÓN
  const [customAidTypes, setCustomAidTypes] = useState<AidType[]>(() => obtenirTypesAidePersonnalises());

  // Combinar todos los tipos de ayuda (sistema + personalizados)
  const allAidTypes = [...systemAidTypes, ...customAidTypes];

  // Estado compartido para demandas de ayuda - VACÍO PARA PRODUCCIÓN
  const [aidRequests, setAidRequests] = useState<AidRequest[]>(() => obtenirDemandesAideComptoir());

  useEffect(() => {
    sauvegarderTypesAidePersonnalises(customAidTypes);
  }, [customAidTypes]);

  useEffect(() => {
    sauvegarderDemandesAideComptoir(aidRequests);
  }, [aidRequests]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === comptoirStorageKeys.customAidTypes) {
        setCustomAidTypes(obtenirTypesAidePersonnalises());
      }

      if (event.key === comptoirStorageKeys.aidRequests) {
        setAidRequests(obtenirDemandesAideComptoir());
      }
    };

    const handleComptoirStorageUpdated = (event: Event) => {
      const { detail } = event as CustomEvent<{ key?: string }>;

      if (detail?.key === comptoirStorageKeys.customAidTypes) {
        setCustomAidTypes(obtenirTypesAidePersonnalises());
      }

      if (detail?.key === comptoirStorageKeys.aidRequests) {
        setAidRequests(obtenirDemandesAideComptoir());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(comptoirStorageEvents.updated, handleComptoirStorageUpdated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(comptoirStorageEvents.updated, handleComptoirStorageUpdated);
    };
  }, []);

  const handleNavigate = (view: string, id?: string) => {
    setCurrentView(view as ComptoirView);
    setSelectedBeneficiaireId(id);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: t('comptoir.dashboard'), icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'beneficiaires', label: t('comptoir.beneficiaries'), icon: <Users className="w-5 h-5" /> },
    { id: 'rendez-vous', label: t('comptoir.appointments'), icon: <Calendar className="w-5 h-5" /> },
    { id: 'aide-alimentaire', label: t('comptoir.foodAid'), icon: <Package className="w-5 h-5" /> },
    { id: 'demandes-aide', label: t('comptoir.aidRequests'), icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'types-aide', label: t('comptoir.aidTypes'), icon: <Settings className="w-5 h-5" /> },
    { id: 'rapports', label: t('comptoir.reports'), icon: <FileText className="w-5 h-5" /> },
    { id: 'contactos', label: contactsViewLabel, icon: <Users className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <ComptoirDashboard onNavigate={handleNavigate} />;
      case 'beneficiaires':
        return <ListeBeneficiaires onNavigate={handleNavigate} />;
      case 'fiche-beneficiaire':
        return <FicheBeneficiaire beneficiaireId={selectedBeneficiaireId} onNavigate={handleNavigate} />;
      case 'rendez-vous':
        return <RendezVous onNavigate={handleNavigate} aidRequests={aidRequests} aidTypes={allAidTypes} />;
      case 'aide-alimentaire':
        return <AideAlimentaire onNavigate={handleNavigate} aidTypes={allAidTypes} />;
      case 'demandes-aide':
        return <DemandesAide onNavigate={handleNavigate} aidRequests={aidRequests} setAidRequests={setAidRequests} />;
      case 'types-aide':
        return <TypesAide onNavigate={handleNavigate} aidTypes={customAidTypes} setAidTypes={setCustomAidTypes} systemAidTypes={systemAidTypes} />;
      case 'rapports':
        return <Rapports aidRequests={aidRequests} aidTypes={allAidTypes} />;
      case 'contactos':
        return (
          <GestionContactosDepartamento 
            departamentoId="4"
            departamentoNombre="Comptoir"
          />
        );
      default:
        return <ComptoirDashboard onNavigate={handleNavigate} />;
    }
  };

  const getCurrentTitle = () => {
    switch (currentView) {
      case 'dashboard': return t('comptoir.dashboard');
      case 'beneficiaires': return t('comptoir.beneficiaries');
      case 'fiche-beneficiaire': 
        return selectedBeneficiaireId === 'new' 
          ? t('comptoir.newBeneficiary') 
          : t('comptoir.beneficiaryRecord');
      case 'rendez-vous': return t('comptoir.appointments');
      case 'aide-alimentaire': return t('comptoir.foodAid');
      case 'demandes-aide': return t('comptoir.aidRequests');
      case 'types-aide': return t('comptoir.aidTypes');
      case 'rapports': return t('comptoir.reports');
      case 'contactos': return contactsViewLabel;
      default: return t('comptoir.dashboard');
    }
  };

  const getCurrentHeaderIcon = () => {
    switch (currentView) {
      case 'dashboard':
        return <LayoutDashboard className="h-6 w-6 text-white sm:h-7 sm:w-7" />;
      case 'beneficiaires':
      case 'contactos':
      case 'fiche-beneficiaire':
        return <Users className="h-6 w-6 text-white sm:h-7 sm:w-7" />;
      case 'rendez-vous':
        return <Calendar className="h-6 w-6 text-white sm:h-7 sm:w-7" />;
      case 'aide-alimentaire':
        return <Package className="h-6 w-6 text-white sm:h-7 sm:w-7" />;
      case 'demandes-aide':
        return <ClipboardList className="h-6 w-6 text-white sm:h-7 sm:w-7" />;
      case 'types-aide':
        return <Settings className="h-6 w-6 text-white sm:h-7 sm:w-7" />;
      case 'rapports':
        return <FileText className="h-6 w-6 text-white sm:h-7 sm:w-7" />;
      default:
        return <LayoutDashboard className="h-6 w-6 text-white sm:h-7 sm:w-7" />;
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:block w-64 bg-white border-r min-h-screen sticky top-0">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 flex-shrink-0"
              style={{ borderColor: branding.primaryColor }}
            >
              {branding.logo ? (
                <img 
                  src={branding.logo} 
                  alt="Logo" 
                  className="h-full w-full rounded-full" 
                  style={{ 
                    objectFit: 'cover',
                    objectPosition: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1) inset'
                  }}
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  <span style={{ fontFamily: 'Montserrat, sans-serif' }}>BA</span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: branding.primaryColor, fontFamily: 'Montserrat, sans-serif' }}>
                Comptoir
              </h1>
              <p className="text-xs text-[#666666]">{t('comptoir.managementSystem')}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === item.id
                  ? 'text-white'
                  : 'text-[#666666] hover:bg-[#F4F4F4]'
              }`}
              style={{
                backgroundColor: currentView === item.id ? branding.primaryColor : 'transparent',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: currentView === item.id ? 500 : 400
              }}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Sidebar Mobile (Overlay) */}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 lg:hidden overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                  Comptoir
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                >
                  ✕
                </Button>
              </div>
            </div>

            <nav className="p-4 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentView === item.id
                      ? 'text-white'
                      : 'text-[#666666] hover:bg-[#F4F4F4]'
                  }`}
                  style={{
                    backgroundColor: currentView === item.id ? branding.primaryColor : 'transparent',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: currentView === item.id ? 500 : 400
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen bg-[#F4F4F4]">
        {/* Header */}
        <div className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-xl">
          <div className="p-4 lg:p-6">
            <ModulePageHeader
              title={getCurrentTitle()}
              subtitle={currentView === 'dashboard' ? t('comptoir.welcomeMessage') : t('comptoir.managementSystem')}
              icon={getCurrentHeaderIcon()}
              accentColor={branding.primaryColor}
              secondaryColor={branding.secondaryColor}
              className="border-none bg-transparent px-0 py-0 shadow-none"
              actions={(
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                  {currentView !== 'dashboard' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNavigate('dashboard')}
                    >
                      <ArrowLeft className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">{t('common.back')}</span>
                    </Button>
                  )}
                </>
              )}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 lg:p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}