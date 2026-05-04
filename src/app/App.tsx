import React, { Suspense, lazy, useEffect, useState } from 'react';
import '../i18n/config'; // Inicializar i18n
// Última actualización: 17/03/2026 - Actualización nombre completo en actividades
import { useTranslation } from 'react-i18next';
import '../utils/translationChecker'; // Verificador de sincronización de traducciones
import { Layout } from './components/Layout';
import { Toaster } from './components/ui/sonner';
import { PWAInstaller } from './components/PWAInstaller';
import { cerrarSesionUsuario } from './utils/sesionStorage';
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
const UsuariosInternos = lazyNamed(() => import('./components/pages/UsuariosInternos'), 'UsuariosInternos');
const IDDigital = lazyNamed(() => import('./components/pages/IDDigital'), 'IDDigital');
const APIKeysPage = lazyNamed(() => import('./components/pages/APIKeysPage'), 'APIKeysPage');
const GestionAutenticacion = lazyNamed(() => import('./components/pages/GestionAutenticacion'), 'GestionAutenticacion');
const PanelMarca = lazyNamed(() => import('./components/pages/PanelMarca'), 'PanelMarca');
const Configuracion = lazyNamed(() => import('./components/pages/Configuracion'), 'Configuracion');
const AccesoOrganismo = lazyNamed(() => import('./components/pages/AccesoOrganismo'), 'AccesoOrganismo');
const Departamentos = lazyNamed(() => import('./components/pages/Departamentos'), 'Departamentos');
const Benevoles = lazyNamed(() => import('./components/pages/Benevoles'), 'Benevoles');
const Recrutement = lazyNamed(() => import('./components/pages/Recrutement'), 'Recrutement');
const EmailOrganismos = lazyNamed(() => import('./components/pages/EmailOrganismos'), 'EmailOrganismos');
const Contact = lazyNamed(() => import('./components/pages/Contact'), 'Contact');
const Login = lazyNamed(() => import('./components/pages/Login'), 'Login');
const CuisinePage = lazyNamed(() => import('./components/pages/CuisinePage'), 'CuisinePage');
const ContactosAlmacenPage = lazyNamed(() => import('./components/pages/ContactosAlmacenPage'), 'ContactosAlmacenPage');
const CommunicationInterne = lazyNamed(() => import('./components/CommunicationInterne'), 'CommunicationInterne');
const SystemDiagnostics = lazyNamed(() => import('./components/SystemDiagnostics'), 'SystemDiagnostics');
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

// Componente interno que usa el contexto de autenticación
function AppContent() {
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window === 'undefined') {
      return 'dashboard';
    }

    return new URLSearchParams(window.location.search).get('page') || 'dashboard';
  });
  const { isAuthenticated, isLoading, logout: logoutAuth } = useAuth();
  const { i18n } = useTranslation();

  // 🔔 Inicializar sistema de notificaciones de actualizaciones
  useUpdateNotifications();

  // 🔄 Verificar versión de la aplicación y mostrar notificación de actualización
  useVersionCheck();

  // Crear ofertas de ejemplo e inicializar unidades al cargar la app
  useEffect(() => {
    void import('./utils/appBootstrap').then(({ runAppBootstrap }) => runAppBootstrap());
  }, []);

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

  const renderWithSuspense = (content: React.ReactNode) => (
    <Suspense fallback={<PageLoadingState />}>
      {content}
    </Suspense>
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderWithSuspense(<Dashboard />);
      case 'dashboard-metricas':
        return renderWithSuspense(<DashboardMetricas />);
      case 'dashboard-predictivo':
        return renderWithSuspense(<DashboardPredictivo />);
      case 'inventario':
        return renderWithSuspense(<Inventario />);
      case 'etiquetas':
        return renderWithSuspense(<Etiquetas />);
      case 'comandas':
        return renderWithSuspense(<Comandas />);
      case 'organismos':
        return renderWithSuspense(<Organismos />);
      case 'ofertas-organismo':
        return renderWithSuspense(<OfertasOrganismo />);
      case 'transporte':
        return renderWithSuspense(<Transporte />);
      case 'reportes':
        return renderWithSuspense(<Reportes />);
      case 'reportes-avanzado':
        return renderWithSuspense(<ReportesAvanzado />);
      case 'usuarios':
        return renderWithSuspense(<Usuarios />);
      case 'usuarios-internos':
        return renderWithSuspense(<UsuariosInternos />);
      case 'id-digital':
        return renderWithSuspense(<IDDigital />);
      case 'api-keys':
        return renderWithSuspense(<APIKeysPage />);
      case 'gestion-autenticacion':
        return renderWithSuspense(<GestionAutenticacion />);
      case 'panel-marca':
        return renderWithSuspense(<PanelMarca />);
      case 'configuracion':
        return renderWithSuspense(<Configuracion />);
      case 'acceso-organismo':
        return renderWithSuspense(<AccesoOrganismo />);
      case 'departamentos':
        return renderWithSuspense(<Departamentos onNavigate={setCurrentPage} />);
      case 'recrutement':
        return renderWithSuspense(<Recrutement />);
      case 'benevoles':
        return renderWithSuspense(<Benevoles />);
      case 'liaison':
        return renderWithSuspense(<EmailOrganismos onNavigate={setCurrentPage} />);
      case 'email-organismos':
        return renderWithSuspense(<EmailOrganismos onNavigate={setCurrentPage} />);
      case 'contact':
        return renderWithSuspense(<Contact />);
      case 'communication':
        return renderWithSuspense(<CommunicationInterne />);
      case 'cuisine':
        return renderWithSuspense(<CuisinePage onNavigate={setCurrentPage} />);
      case 'donateurs-fournisseurs':
        return renderWithSuspense(<GestionDonateursFournisseurs />);
      case 'contactos-almacen':
        return renderWithSuspense(<ContactosAlmacenPage onNavigate={setCurrentPage} />);
      case 'diagnosticos':
        return renderWithSuspense(<SystemDiagnostics />);
      default:
        return renderWithSuspense(<Dashboard />);
    }
  };

  // Si está en vista pública, mostrar directamente sin Layout
  if (currentPage === 'acceso-organismo') {
    return (
      <>
        {renderWithSuspense(<AccesoOrganismo />)}
        <Toaster position="top-right" />
      </>
    );
  }

  // Compatibilidad: la ruta pública heredada ahora usa el flujo de Recrutement
  if (currentPage === 'benevoles-public' || currentPage === 'recrutement-public') {
    return (
      <>
        {renderWithSuspense(<Recrutement isPublicAccess={true} />)}
        <Toaster position="top-right" />
      </>
    );
  }

  // Si no está autenticado, mostrar página de login
  if (!isAuthenticated) {
    return (
      <>
        {renderWithSuspense(
          <Login 
            onLogin={() => {
              setCurrentPage('dashboard');
            }}
            onAccessPublic={(page) => {
              setCurrentPage(page);
            }}
          />
        )}
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
        {renderPage()}
      </Layout>
      <Toaster position="top-right" />
      <PWAInstaller />
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