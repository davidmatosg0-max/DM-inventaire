import React, { Suspense, lazy, useEffect, useState, useRef, useMemo } from 'react';
import '../i18n/config'; // Inicializar i18n
// Última actualización: 17/03/2026 - Actualización nombre completo en actividades
import { useTranslation } from 'react-i18next';
import '../utils/translationChecker'; // Verificador de sincronización de traducciones
import { Layout } from './components/Layout';
import { Toaster } from './components/ui/sonner';
import { PWAInstaller } from './components/PWAInstaller';
import { ErrorBoundary } from './components/ErrorBoundary';
import { cerrarSesionUsuario } from './utils/sesionStorage';
import { moduloDisponible } from './utils/permisos';
import { BalanceProvider } from '../contexts/BalanceContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useUpdateNotifications } from '../hooks/useUpdateNotifications';
import { useVersionCheck } from '../hooks/useVersionCheck';
import { suppressFigmaWarningsConditional } from './utils/suppressFigmaWarnings';
import { loadLazyNamedModule } from './utils/lazyImportRecovery';

// Suprimir warnings internos de Figma Make al inicio
suppressFigmaWarningsConditional();

function lazyNamed<T extends React.ComponentType<any>>(
  factory: () => Promise<Record<string, unknown>>,
  exportName: string
) {
  return lazy(() => loadLazyNamedModule<T>(factory, exportName, `app:${exportName}`));
}

const Dashboard = lazyNamed(() => import('./components/pages/Dashboard'), 'Dashboard');
const DashboardMetricas = lazyNamed(() => import('./components/pages/DashboardMetricas'), 'DashboardMetricas');
const DashboardPredictivo = lazyNamed(() => import('./components/pages/DashboardPredictivo'), 'DashboardPredictivo');
const Inventario = lazyNamed(() => import('./components/pages/Inventario'), 'Inventario');
const Etiquetas = lazyNamed(() => import('./components/pages/Etiquetas'), 'Etiquetas');
const Comandas = lazyNamed(() => import('./components/pages/Comandas'), 'Comandas');
const Organismos = lazyNamed(() => import('./components/pages/Organismos'), 'Organismos');
const OfertasOrganismo = lazyNamed(() => import('./components/pages/OfertasOrganismo'), 'OfertasOrganismo');
const Transporte = lazyNamed(() => import('./components/pages/Transporte'), 'Transporte');
const Reportes = lazyNamed(() => import('./components/pages/Reportes'), 'Reportes');
const ReportesAvanzado = lazyNamed(() => import('./components/pages/ReportesAvanzado'), 'ReportesAvanzado');
const Usuarios = lazyNamed(() => import('./components/pages/Usuarios'), 'Usuarios');
const IDDigital = lazyNamed(() => import('./components/pages/IDDigital'), 'IDDigital');
const APIKeysPage = lazyNamed(() => import('./components/pages/APIKeysPage'), 'APIKeysPage');
const GestionAutenticacion = lazyNamed(() => import('./components/pages/GestionAutenticacion'), 'GestionAutenticacion');
const PanelMarca = lazyNamed(() => import('./components/pages/PanelMarca'), 'PanelMarca');
const Configuracion = lazyNamed(() => import('./components/pages/Configuracion'), 'Configuracion');
const AccesoOrganismo = lazyNamed(() => import('./components/pages/AccesoOrganismo'), 'AccesoOrganismo');
const Departamentos = lazyNamed(() => import('./components/pages/Departamentos'), 'Departamentos');
const Recrutement = lazyNamed(() => import('./components/pages/Recrutement'), 'Recrutement');
const AchatPage = lazyNamed(() => import('./components/pages/AchatPage'), 'AchatPage');
const EmailOrganismos = lazyNamed(() => import('./components/pages/EmailOrganismos'), 'EmailOrganismos');
const Contact = lazyNamed(() => import('./components/pages/Contact'), 'Contact');
const Login = lazyNamed(() => import('./components/pages/Login'), 'Login');
const CuisinePage = lazyNamed(() => import('./components/pages/CuisinePage'), 'CuisinePage');
const ContactosAlmacenPage = lazyNamed(() => import('./components/pages/ContactosAlmacenPage'), 'ContactosAlmacenPage');
const DechetsCompostage = lazyNamed(() => import('./components/pages/DechetsCompostage'), 'DechetsCompostage');
const CommunicationInterne = lazyNamed(() => import('./components/CommunicationInterne'), 'CommunicationInterne');
const GestionDonateursFournisseurs = lazyNamed(
  () => import('./components/entrepot/GestionDonateursFournisseurs'),
  'GestionDonateursFournisseurs'
);

function PageLoadingState() {
  return (
    <div className="flex min-h-[240px] items-center justify-center text-sm text-[#666666]">
      Chargement...
    </div>
  );
}

const PUBLIC_PAGE_IDS = new Set(['acceso-organismo', 'benevoles-public', 'recrutement-public']);
const AUTH_UTILITY_PAGE_IDS = new Set(['contact', 'departamentos']);
const REMOVED_PAGE_IDS = new Set(['benevoles', 'usuarios-internos']);
const CURRENT_PAGE_STORAGE_KEY = 'banque_aliments_current_page';
const PAGE_PERMISSION_ALIASES: Record<string, string> = {
  liaison: 'email-organismos',
  'reportes-avanzado': 'reportes',
  'gestion-autenticacion': 'usuarios',
  'dashboard-predictivo': 'dashboard',
  'dechets-compostage': 'inventario',
};

function obtenerModuloProtegido(pageId: string): string | null {
  if (PUBLIC_PAGE_IDS.has(pageId) || AUTH_UTILITY_PAGE_IDS.has(pageId)) {
    return null;
  }

  return PAGE_PERMISSION_ALIASES[pageId] || pageId;
}

// Componente interno que usa el contexto de autenticación
function AppContent() {
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window === 'undefined') {
      return 'dashboard';
    }

    const pageFromUrl = new URLSearchParams(window.location.search).get('page');
    if (pageFromUrl) {
      return pageFromUrl;
    }

    return localStorage.getItem(CURRENT_PAGE_STORAGE_KEY) || 'dashboard';
  });
  const [mountedPages, setMountedPages] = useState<Set<string>>(new Set([currentPage]));
  const { isAuthenticated, isLoading, logout: logoutAuth } = useAuth();
  const { i18n } = useTranslation();

  // 🔔 Inicializar sistema de notificaciones de actualizaciones
  useUpdateNotifications();

  // 🔄 Verificar versión de la aplicación y mostrar notificación de actualización
  useVersionCheck();

  // Inicializar dirección RTL si el idioma es árabe
  useEffect(() => {
    if (i18n.language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = i18n.language;
    }
  }, [i18n.language]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(CURRENT_PAGE_STORAGE_KEY, currentPage);

    const url = new URL(window.location.href);
    if (url.searchParams.get('page') !== currentPage) {
      url.searchParams.set('page', currentPage);
      window.history.replaceState({}, '', url.toString());
    }
  }, [currentPage]);

  useEffect(() => {
    if (!REMOVED_PAGE_IDS.has(currentPage)) {
      return;
    }

    setCurrentPage('dashboard');

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('page', 'dashboard');
      window.history.replaceState({}, '', url.toString());
    }
  }, [currentPage]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const moduloProtegido = obtenerModuloProtegido(currentPage);

    if (!moduloProtegido || moduloDisponible(moduloProtegido)) {
      return;
    }

    setCurrentPage('dashboard');

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('page', 'dashboard');
      window.history.replaceState({}, '', url.toString());
    }
  }, [currentPage, isAuthenticated]);

  // Actualizar páginas montadas cuando se navega a una nueva
  useEffect(() => {
    setMountedPages(prev => new Set([...prev, currentPage]));
  }, [currentPage]);

  const renderWithSuspense = (content: React.ReactNode, pageId: string) => {
    const isActive = currentPage === pageId;
    return (
      <div
        key={pageId}
        style={{
          display: isActive ? 'block' : 'none',
          width: '100%',
          height: '100%'
        }}
      >
        <Suspense fallback={<PageLoadingState />}>
          {content}
        </Suspense>
      </div>
    );
  };

  // Renderizar solo las páginas que han sido visitadas (mantenerlas en caché)
  const renderPage = useMemo(() => {
    const pages: React.ReactNode[] = [];

    // Solo renderizar páginas que han sido montadas
    if (mountedPages.has('dashboard')) {
      pages.push(renderWithSuspense(<Dashboard />, 'dashboard'));
    }
    if (mountedPages.has('dashboard-metricas')) {
      pages.push(renderWithSuspense(<DashboardMetricas />, 'dashboard-metricas'));
    }
    if (mountedPages.has('dashboard-predictivo')) {
      pages.push(renderWithSuspense(<DashboardPredictivo />, 'dashboard-predictivo'));
    }
    if (mountedPages.has('inventario')) {
      pages.push(renderWithSuspense(
        <ErrorBoundary
          title="Impossible d'ouvrir l'inventaire"
          description="Le module a rencontré une erreur de chargement. Vous pouvez réessayer ou réinitialiser les données locales de l'inventaire."
          recoveryLabel="Réinitialiser l'inventaire"
          recoveryAction={() => {
            if (typeof window === 'undefined') {
              return;
            }

            const inventoryStorageKeys = [
              'banco_alimentos_productos',
              'banco_alimentos_entradas_inventario',
              'banco_alimentos_categorias',
              'banco_alimentos_movimientos',
              'banco_alimentos_comandas',
            ];

            inventoryStorageKeys.forEach((key) => window.localStorage.removeItem(key));
          }}
        >
          <Inventario />
        </ErrorBoundary>,
        'inventario'
      ));
    }
    if (mountedPages.has('etiquetas')) {
      pages.push(renderWithSuspense(<Etiquetas />, 'etiquetas'));
    }
    if (mountedPages.has('comandas')) {
      pages.push(renderWithSuspense(<Comandas />, 'comandas'));
    }
    if (mountedPages.has('organismos')) {
      pages.push(renderWithSuspense(<Organismos />, 'organismos'));
    }
    if (mountedPages.has('ofertas-organismo')) {
      pages.push(renderWithSuspense(<OfertasOrganismo />, 'ofertas-organismo'));
    }
    if (mountedPages.has('transporte')) {
      pages.push(renderWithSuspense(<Transporte />, 'transporte'));
    }
    if (mountedPages.has('reportes')) {
      pages.push(renderWithSuspense(<Reportes />, 'reportes'));
    }
    if (mountedPages.has('reportes-avanzado')) {
      pages.push(renderWithSuspense(<ReportesAvanzado />, 'reportes-avanzado'));
    }
    if (mountedPages.has('usuarios')) {
      pages.push(renderWithSuspense(<Usuarios />, 'usuarios'));
    }
    if (mountedPages.has('id-digital')) {
      pages.push(renderWithSuspense(<IDDigital />, 'id-digital'));
    }
    if (mountedPages.has('api-keys')) {
      pages.push(renderWithSuspense(<APIKeysPage />, 'api-keys'));
    }
    if (mountedPages.has('gestion-autenticacion')) {
      pages.push(renderWithSuspense(<GestionAutenticacion />, 'gestion-autenticacion'));
    }
    if (mountedPages.has('panel-marca')) {
      pages.push(renderWithSuspense(<PanelMarca />, 'panel-marca'));
    }
    if (mountedPages.has('configuracion')) {
      pages.push(renderWithSuspense(<Configuracion />, 'configuracion'));
    }
    if (mountedPages.has('acceso-organismo')) {
      pages.push(renderWithSuspense(<AccesoOrganismo />, 'acceso-organismo'));
    }
    if (mountedPages.has('departamentos')) {
      pages.push(renderWithSuspense(<Departamentos onNavigate={setCurrentPage} />, 'departamentos'));
    }
    if (mountedPages.has('recrutement')) {
      pages.push(renderWithSuspense(<Recrutement />, 'recrutement'));
    }
    if (mountedPages.has('achat')) {
      pages.push(renderWithSuspense(<AchatPage onNavigate={setCurrentPage} />, 'achat'));
    }
    if (mountedPages.has('liaison')) {
      pages.push(renderWithSuspense(<EmailOrganismos onNavigate={setCurrentPage} />, 'liaison'));
    }
    if (mountedPages.has('email-organismos')) {
      pages.push(renderWithSuspense(<EmailOrganismos onNavigate={setCurrentPage} />, 'email-organismos'));
    }
    if (mountedPages.has('contact')) {
      pages.push(renderWithSuspense(<Contact />, 'contact'));
    }
    if (mountedPages.has('communication')) {
      pages.push(renderWithSuspense(<CommunicationInterne />, 'communication'));
    }
    if (mountedPages.has('cuisine')) {
      pages.push(renderWithSuspense(<CuisinePage onNavigate={setCurrentPage} />, 'cuisine'));
    }
    if (mountedPages.has('donateurs-fournisseurs')) {
      pages.push(renderWithSuspense(<GestionDonateursFournisseurs onNavigate={setCurrentPage} />, 'donateurs-fournisseurs'));
    }
    if (mountedPages.has('contactos-almacen')) {
      pages.push(renderWithSuspense(<ContactosAlmacenPage onNavigate={setCurrentPage} />, 'contactos-almacen'));
    }
    if (mountedPages.has('dechets-compostage')) {
      pages.push(renderWithSuspense(<DechetsCompostage />, 'dechets-compostage'));
    }

    return pages;
  }, [mountedPages, currentPage]);

  // Si está en vista pública, mostrar directamente sin Layout
  if (currentPage === 'acceso-organismo') {
    return (
      <>
        <Suspense fallback={<PageLoadingState />}>
          <AccesoOrganismo />
        </Suspense>
        <Toaster position="top-right" />
      </>
    );
  }

  // Compatibilidad: la ruta pública heredada ahora usa el flujo de Recrutement
  if (currentPage === 'benevoles-public' || currentPage === 'recrutement-public') {
    return (
      <>
        <Suspense fallback={<PageLoadingState />}>
          <Recrutement isPublicAccess={true} />
        </Suspense>
        <Toaster position="top-right" />
      </>
    );
  }

  // Si no está autenticado, mostrar página de login
  if (!isAuthenticated) {
    return (
      <>
        <Suspense fallback={<PageLoadingState />}>
          <Login 
            onLogin={(page) => {
              setCurrentPage(page || 'dashboard');
            }}
            onAccessPublic={(page) => {
              setCurrentPage(page);
            }}
          />
        </Suspense>
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <BalanceProvider>
      <Layout 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        onLogout={() => {
          logoutAuth();
          cerrarSesionUsuario();
        }}
        hideSidebar={currentPage === 'departamentos'}
      >
        {renderPage}
      </Layout>
      <Toaster position="top-right" />
      {currentPage !== 'communication' && <PWAInstaller />}
    </BalanceProvider>
  );
}

// Sistema Integral de Gestión - Banque Alimentaire v5.0 PRO (JWT + API Keys)
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}