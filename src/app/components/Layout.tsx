import React from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../../hooks/useBranding';
import { obtenerUsuarioSesion } from '../utils/sesionStorage';
import { 
  moduloDisponible, 
  esDesarrollador,
  tienePermiso,
  PERMISOS
} from '../utils/permisos';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Building, 
  Truck, 
  FileText, 
  Users,
  UserCog,
  QrCode,
  Menu,
  X,
  Settings,
  Key,
  Palette,
  Tag,
  Tags,
  Home,
  LogOut,
  Apple,
  UserPlus,
  Scale,
  Warehouse,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  ChefHat,
  Sparkles,
  Activity,
  BookOpen,
  Brain,
  Zap
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { CentroNotificaciones } from './CentroNotificaciones';
import { SystemAlerts, AlertsSummary } from './SystemAlerts';
import { GlobalSearch } from './GlobalSearch';
import { GuideCompletModules } from './GuideCompletModules';
import { PWAFloatingButton } from './PWAInstallButton';
import { PWAInstallButton } from './PWAInstallButton';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
  hideSidebar?: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: MenuItem[];
  soloDesarrollador?: boolean;
}

export function Layout({ children, currentPage, onNavigate, onLogout, hideSidebar = false }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>([]);
  const [showGuideComplete, setShowGuideComplete] = React.useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = React.useState(false);
  
  // Estados para botón draggable del Guide Complet
  const [isDragging, setIsDragging] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dragThreshold = 5; // Umbral mínimo de movimiento para considerar que es un drag
  const [totalDragDistance, setTotalDragDistance] = React.useState(0);
  
  const { t } = useTranslation();
  const branding = useBranding();

  // Verificar si el usuario actual es desarrollador
  const usuarioActual = obtenerUsuarioSesion();
  const esDesarrollador = usuarioActual?.permisos?.includes('desarrollador' as any) || false;

  // Obtener datos del usuario para mostrar en el header
  const nombreCompleto = usuarioActual 
    ? `${usuarioActual.nombre} ${usuarioActual.apellido}` 
    : 'Usuario';
  
  // Usar el nombre de la empresa (branding.systemName) para mostrar en el header
  const nombreMostrar = branding.systemName || nombreCompleto;
  
  const iniciales = usuarioActual 
    ? `${usuarioActual.nombre[0]}${usuarioActual.apellido?.[0] || ''}`.toUpperCase() 
    : 'U';
  
  // Mapeo de roles a francés
  const rolesTraduccion: Record<string, string> = {
    'administrador': 'Administrateur',
    'coordinador': 'Coordinateur',
    'usuario': 'Utilisateur',
    'almacenista': 'Magasinier',
    'transportista': 'Transporteur'
  };
  
  const rolTraducido = usuarioActual?.rol 
    ? rolesTraduccion[usuarioActual.rol] || usuarioActual.rol 
    : 'Utilisateur';
  
  // Funciones para drag del botón Guide Complet
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return; // Solo botón izquierdo
    e.preventDefault();
    setIsDragging(true);
    setTotalDragDistance(0);
    
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setPosition({
        x: rect.left,
        y: rect.top
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setTotalDragDistance(0);
    
    const touch = e.touches[0];
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
      setPosition({
        x: rect.left,
        y: rect.top
      });
    }
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Límites de la ventana con margen de 10px
    const margin = 10;
    const maxX = window.innerWidth - (buttonRef.current?.offsetWidth || 56) - margin;
    const maxY = window.innerHeight - (buttonRef.current?.offsetHeight || 56) - margin;
    
    const boundedX = Math.max(margin, Math.min(newX, maxX));
    const boundedY = Math.max(margin, Math.min(newY, maxY));
    
    setPosition({
      x: boundedX,
      y: boundedY
    });
    
    // Calcular distancia total de drag
    const distance = Math.sqrt(
      Math.pow(boundedX - position.x, 2) + 
      Math.pow(boundedY - position.y, 2)
    );
    setTotalDragDistance(prev => prev + distance);
  }, [isDragging, dragStart, position]);

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    
    // Límites de la ventana con margen de 10px
    const margin = 10;
    const maxX = window.innerWidth - (buttonRef.current?.offsetWidth || 56) - margin;
    const maxY = window.innerHeight - (buttonRef.current?.offsetHeight || 56) - margin;
    
    const boundedX = Math.max(margin, Math.min(newX, maxX));
    const boundedY = Math.max(margin, Math.min(newY, maxY));
    
    setPosition({
      x: boundedX,
      y: boundedY
    });
    
    // Calcular distancia total de drag
    const distance = Math.sqrt(
      Math.pow(boundedX - position.x, 2) + 
      Math.pow(boundedY - position.y, 2)
    );
    setTotalDragDistance(prev => prev + distance);
  }, [isDragging, dragStart, position]);

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchEnd = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  // Agregar event listeners para mouse y touch
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      // Prevenir selección de texto durante el drag
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const handleLogout = () => {
    if (onLogout) {
      // Limpiar todas las sesiones guardadas
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('authTimestamp');
      sessionStorage.removeItem('isAuthenticated');
      
      toast.success(t('auth.sessionClosed') || 'Sesión cerrada correctamente');
      setTimeout(() => {
        onLogout();
      }, 500);
    }
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const menuItems: MenuItem[] = [
    { 
      id: 'dashboard', 
      label: t('nav.mainDashboard'), 
      icon: <LayoutDashboard className="w-5 h-5" />,
      children: [
        { id: 'dashboard', label: 'Tableau de bord standard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'dashboard-metricas', label: 'Métriques en Temps Réel', icon: <Activity className="w-4 h-4" /> },
        { id: 'dashboard-predictivo', label: '🚀 Tableau de bord prédictif IA', icon: <Brain className="w-4 h-4" /> },
      ]
    },
    { 
      id: 'entrepot', 
      label: t('nav.warehouse'), 
      icon: <Warehouse className="w-5 h-5" />,
      children: [
        { id: 'inventario', label: t('nav.inventory'), icon: <Package className="w-4 h-4" /> },
        { id: 'etiquetas', label: t('nav.labels'), icon: <Tag className="w-4 h-4" /> },
        { id: 'comandas', label: t('nav.orders'), icon: <ClipboardList className="w-4 h-4" /> },
        { id: 'organismos', label: t('nav.organisms'), icon: <Building className="w-4 h-4" /> },
        { id: 'ofertas-organismo', label: t('nav.offers'), icon: <Tags className="w-4 h-4" /> },
        { id: 'transporte', label: t('nav.transport'), icon: <Truck className="w-4 h-4" /> },
        { id: 'reportes', label: t('nav.reports'), icon: <FileText className="w-4 h-4" /> },
        { id: 'donateurs-fournisseurs', label: 'Donateurs & Fournisseurs', icon: <Building className="w-4 h-4" /> },
        { id: 'contactos-almacen', label: 'Contacts Entrepôt', icon: <Users className="w-4 h-4" /> },
      ]
    },
    { id: 'cuisine', label: t('common.cuisine'), icon: <ChefHat className="w-5 h-5" /> },
    { id: 'email-organismos', label: t('nav.liaison'), icon: <Users className="w-5 h-5" /> },
    { id: 'communication', label: 'Messagerie', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'recrutement', label: t('nav.recruitment'), icon: <UserPlus className="w-5 h-5" /> },
    { id: 'usuarios', label: t('nav.users'), icon: <Users className="w-5 h-5" /> },
    { id: 'id-digital', label: t('nav.digitalID'), icon: <Scale className="w-5 h-5" /> },
    { id: 'api-keys', label: '🚀 API Keys PRO', icon: <Key className="w-5 h-5" />, soloDesarrollador: true },
    { id: 'panel-marca', label: t('nav.branding'), icon: <Palette className="w-5 h-5" />, soloDesarrollador: true },
    { id: 'configuracion', label: t('nav.configuration'), icon: <Settings className="w-5 h-5" /> }
  ];

  // Filtrar menú según permisos
  const menuItemsFiltrado = menuItems.map(item => {
    // Si el item es solo para desarrollador y el usuario no lo es, no mostrarlo
    if (item.soloDesarrollador && !esDesarrollador) {
      return null;
    }
    
    // Si tiene hijos, filtrar los hijos según permisos
    if (item.children) {
      const hijosFiltrados = item.children.filter(child => moduloDisponible(child.id));
      
      // Si no hay hijos disponibles, no mostrar el padre
      if (hijosFiltrados.length === 0) {
        return null;
      }
      
      return {
        ...item,
        children: hijosFiltrados
      };
    }
    
    // Verificar si el módulo está disponible para el usuario
    if (!moduloDisponible(item.id)) {
      return null;
    }
    
    return item;
  }).filter((item): item is MenuItem => item !== null);

  return (
    <div 
      className="min-h-screen relative overflow-hidden" 
      style={{ 
        fontFamily: 'Roboto, sans-serif',
        background: `linear-gradient(135deg, ${branding.primaryColor}08 0%, ${branding.secondaryColor}05 100%)`,
      }}
    >
      {/* Formas decorativas de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: branding.primaryColor }}
        />
        <div 
          className="absolute top-1/2 -right-32 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: branding.secondaryColor }}
        />
      </div>

      {/* Header con glassmorphism */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b"
        style={{ 
          background: `linear-gradient(135deg, ${branding.primaryColor}f5 0%, ${branding.primaryColor}e8 100%)`,
          borderColor: `${branding.primaryColor}30`,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="px-3 sm:px-4 py-3 sm:py-4">
          {/* Primera fila: Menú, Logo/Nombre */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              {!hideSidebar && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-1.5 sm:p-2 hover:bg-white/20 rounded-xl transition-all hover:scale-105 flex-shrink-0 backdrop-blur-sm"
                >
                  {sidebarOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                </button>
              )}
              {/* Botón Casa - Dashboard */}
              <button
                onClick={() => onNavigate('departamentos')}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-xl transition-all hover:scale-105 flex-shrink-0 group"
                title={t('common.departments')}
              >
                <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-12 transition-transform" />
              </button>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {branding.logo && (
                  <div className="relative">
                    <div 
                      className="absolute inset-0 rounded-full blur-md opacity-50"
                      style={{ backgroundColor: branding.secondaryColor }}
                    />
                    <img 
                      src={branding.logo} 
                      alt={t('common.logo')}
                      className="h-7 sm:h-9 w-7 sm:w-9 flex-shrink-0 relative z-10 rounded-full"
                      style={{ 
                        objectFit: 'cover',
                        objectPosition: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        border: '2px solid rgba(255,255,255,0.9)'
                      }}
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <h1 className="font-bold truncate text-sm sm:text-base md:text-xl lg:text-2xl text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {nombreMostrar}
                  </h1>
                  <Sparkles className="w-4 h-4 text-white/80 hidden sm:block" />
                </div>
              </div>
            </div>
            
            {/* Segunda parte: Búsqueda, Notificaciones, Idioma, Usuario */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              <GlobalSearch onNavigate={onNavigate} />
              <CentroNotificaciones />
              <LanguageSelector />
              <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2">
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-white font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {branding.systemName}
                  </p>
                  <p className="text-xs text-white/80">{rolTraducido}</p>
                </div>
                <div 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 shadow-lg"
                  style={{ backgroundColor: branding.secondaryColor }}
                >
                  {iniciales}
                </div>
              </div>
              {/* Avatar móvil (sin nombre) */}
              <div 
                className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-lg"
                style={{ backgroundColor: branding.secondaryColor }}
              >
                {iniciales}
              </div>
              {onLogout && (
                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 hover:bg-white/20 rounded-xl transition-all hover:scale-105 flex-shrink-0 group"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-12 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar con glassmorphism */}
      {!hideSidebar && (
        <aside
          className={`fixed top-[56px] sm:top-[64px] left-0 bottom-0 w-64 sm:w-72 shadow-2xl transition-transform duration-300 z-40 overflow-y-auto backdrop-blur-xl border-r ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          style={{ 
            background: `linear-gradient(180deg, ${branding.primaryColor}f8 0%, ${branding.primaryColor}f0 100%)`,
            borderColor: `${branding.primaryColor}30`
          }}
        >
          <nav className="p-3 sm:p-4 space-y-1.5 sm:space-y-2">
            {menuItemsFiltrado.map((item) => (
              <div key={item.id}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className={`w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all text-sm sm:text-base group ${
                        currentPage === item.id
                          ? 'bg-white/95 shadow-lg backdrop-blur-sm'
                          : 'hover:bg-white/10 text-white'
                      }`}
                      style={{ 
                        fontFamily: 'Montserrat, sans-serif', 
                        fontWeight: 500,
                        color: currentPage === item.id ? branding.primaryColor : undefined
                      }}
                    >
                      <div className={`transition-transform group-hover:scale-110 ${currentPage === item.id ? 'scale-110' : ''}`}>
                        {item.icon}
                      </div>
                      <span className="truncate">{item.label}</span>
                      {expandedMenus.includes(item.id) ? <ChevronDown className="w-4 h-4 ml-auto" /> : <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                    <AnimatePresence>
                      {expandedMenus.includes(item.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-5 mt-1"
                        >
                          {item.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => {
                                onNavigate(child.id);
                                setSidebarOpen(false);
                              }}
                              className={`w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all text-sm sm:text-base group ${
                                currentPage === child.id
                                  ? 'bg-white/95 shadow-lg backdrop-blur-sm'
                                  : 'hover:bg-white/10 text-white'
                              }`}
                              style={{ 
                                fontFamily: 'Montserrat, sans-serif', 
                                fontWeight: 500,
                                color: currentPage === child.id ? branding.primaryColor : undefined
                              }}
                            >
                              <div className={`transition-transform group-hover:scale-110 ${currentPage === child.id ? 'scale-110' : ''}`}>
                                {child.icon}
                              </div>
                              <span className="truncate">{child.label}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onNavigate(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all text-sm sm:text-base group ${
                      currentPage === item.id
                        ? 'bg-white/95 shadow-lg backdrop-blur-sm'
                        : 'hover:bg-white/10 text-white'
                    }`}
                    style={{ 
                      fontFamily: 'Montserrat, sans-serif', 
                      fontWeight: 500,
                      color: currentPage === item.id ? branding.primaryColor : undefined
                    }}
                  >
                    <div className={`transition-transform group-hover:scale-110 ${currentPage === item.id ? 'scale-110' : ''}`}>
                      {item.icon}
                    </div>
                    <span className="truncate">{item.label}</span>
                  </button>
                )}
              </div>
            ))}
          </nav>
        </aside>
      )}

      {/* Mobile overlay con blur */}
      {sidebarOpen && !hideSidebar && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden transition-all"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className={`pt-[56px] sm:pt-[64px] ${!hideSidebar ? 'lg:pl-64 xl:pl-72' : ''} min-h-screen relative z-10`}>
        <div className="p-3 sm:p-4 lg:p-6">
          {children}
        </div>
      </main>

      {/* Sistema de Alertas Automáticas */}
      <SystemAlerts />
      <AlertsSummary />

      {/* Botón flotante para acceso de organismos - Modernizado */}
      <button
        onClick={() => onNavigate('acceso-organismo')}
        className={`fixed bottom-4 sm:bottom-6 left-4 sm:left-6 ${!hideSidebar ? 'lg:left-[calc(256px+1.5rem)] xl:left-[calc(288px+1.5rem)]' : ''} text-white rounded-full p-3 sm:p-4 shadow-2xl transition-all hover:scale-110 z-40 flex items-center gap-2 backdrop-blur-xl border-2 border-white/30 group`}
        style={{ 
          background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`
        }}
        title={t('common.organismAccess')}
      >
        <Key className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />
        <span className="hidden md:inline text-sm font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {t('nav.organismAccess')}
        </span>
      </button>

      {/* Botón flotante de Guide Complet - DRAGGABLE */}
      <button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={(e) => {
          // Solo abrir el modal si no se ha arrastrado (movimiento menor al umbral)
          if (totalDragDistance < dragThreshold) {
            setShowGuideComplete(true);
          }
        }}
        className={`text-white rounded-full shadow-2xl z-40 flex items-center justify-center backdrop-blur-xl border-2 border-white/30 group w-12 h-12 sm:w-14 sm:h-14 transition-all ${
          isDragging ? 'cursor-grabbing scale-110 shadow-[0_0_30px_rgba(26,77,122,0.5)]' : 'cursor-grab hover:scale-110'
        }`}
        style={{ 
          position: 'fixed',
          bottom: position.y === 0 ? '20rem' : 'auto',
          right: position.y === 0 ? '1rem' : 'auto',
          top: position.y !== 0 ? `${position.y}px` : 'auto',
          left: position.x !== 0 ? `${position.x}px` : 'auto',
          background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)`,
          transition: isDragging ? 'none' : 'all 0.3s ease',
          userSelect: 'none',
          touchAction: 'none',
          WebkitTouchCallout: 'none'
        }}
        title="📖 Guide Complet - Glissez pour déplacer"
      >
        <BookOpen className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform pointer-events-none ${
          isDragging ? '' : 'group-hover:rotate-12'
        }`} />
      </button>

      {/* Modal de Guide Complet */}
      {showGuideComplete && (
        <GuideCompletModules onClose={() => setShowGuideComplete(false)} />
      )}

      {/* Botón de instalación PWA flotante */}
      <PWAFloatingButton />
    </div>
  );
}