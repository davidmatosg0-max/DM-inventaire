import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../../hooks/useBranding';
import { AdaptiveBrandLogo } from './shared/AdaptiveBrandLogo';
import { UserAvatar } from './shared/UserAvatar';
import { obtenerUsuarioSesion } from '../utils/sesionStorage';
import { 
  moduloDisponible, 
  esDesarrollador,
  tienePermiso,
  PERMISOS,
  obtenerNombreRol,
} from '../utils/permisos';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Building, 
  Truck, 
  FileText, 
  Users,
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
  ShoppingCart,
  Scale,
  Plus,
  Warehouse,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  ChefHat,
  Sparkles,
  BookOpen,
  Zap,
  Recycle
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { CentroNotificaciones } from './CentroNotificaciones';
import { SystemAlerts, AlertsSummary } from './SystemAlerts';
import { GlobalSearch } from './GlobalSearch';
import { GuideCompletModules } from './GuideCompletModules';
import { PWAFloatingButton } from './PWAInstallButton';
import { PWAInstallButton } from './PWAInstallButton';
import { ScrollToTopButton } from './shared/ScrollToTopButton';
import { savePendingEntrepotQuickAction } from '../utils/pendingEntrepotQuickAction';
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

interface MenuSection {
  id: string;
  label: string;
  itemIds: string[];
}

const MENU_PERMISSION_ALIASES: Record<string, string> = {
  'reportes-avanzado': 'reportes',
  'gestion-autenticacion': 'usuarios',
  'dashboard-predictivo': 'dashboard',
};

export function Layout({ children, currentPage, onNavigate, onLogout, hideSidebar = false }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>([]);
  const [showGuideComplete, setShowGuideComplete] = React.useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = React.useState(false);
  const mainStageRef = React.useRef<HTMLElement>(null);
  const appShellRef = React.useRef<HTMLDivElement>(null);
  
  // Estados para botón draggable del Guide Complet
  const [isDragging, setIsDragging] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dragThreshold = 5; // Umbral mínimo de movimiento para considerar que es un drag
  const [totalDragDistance, setTotalDragDistance] = React.useState(0);
  const [entrepotQuickActionsDragging, setEntrepotQuickActionsDragging] = React.useState(false);
  const [entrepotQuickActionsPosition, setEntrepotQuickActionsPosition] = React.useState({ x: 0, y: 0 });
  const [entrepotQuickActionsDragStart, setEntrepotQuickActionsDragStart] = React.useState({ x: 0, y: 0 });
  const [entrepotQuickActionsDragDistance, setEntrepotQuickActionsDragDistance] = React.useState(0);
  const entrepotQuickActionsRef = React.useRef<HTMLDivElement>(null);
  const topbarRef = React.useRef<HTMLElement>(null);
  const [topbarHeight, setTopbarHeight] = React.useState(68);
  
  const { t } = useTranslation();
  const branding = useBranding();

  // Verificar si el usuario actual es desarrollador
  const usuarioActual = obtenerUsuarioSesion();
  const esDesarrollador = usuarioActual?.permisos?.includes('desarrollador' as any) || false;

  // Obtener datos del usuario para mostrar en el header
  const nombreCompleto = usuarioActual
    ? [usuarioActual.nombre, usuarioActual.apellido].filter(Boolean).join(' ')
    : 'Utilisateur';
  
  // Usar el nombre de la empresa (branding.systemName) para mostrar en el header
  const nombreMostrar = branding.systemName || nombreCompleto;

  const rolTraducido = usuarioActual?.rol
    ? obtenerNombreRol(usuarioActual.rol)
    : 'Utilisateur';
  const hideCommunicationFloaters = currentPage === 'communication';
  const useCommunicationFullscreenShell = currentPage === 'communication';
  const useCommunicationCompactSidebar = currentPage === 'communication';
  const shellTopOffset = `${topbarHeight}px`;

  React.useEffect(() => {
    const topbarNode = topbarRef.current;
    if (!topbarNode) {
      return;
    }

    const syncTopbarHeight = () => {
      const measuredHeight = Math.ceil(topbarNode.getBoundingClientRect().height);
      if (measuredHeight > 0) {
        setTopbarHeight(measuredHeight);
      }
    };

    syncTopbarHeight();

    const resizeObserver = new ResizeObserver(syncTopbarHeight);
    resizeObserver.observe(topbarNode);
    window.addEventListener('resize', syncTopbarHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncTopbarHeight);
    };
  }, []);

  const professionalShellBadges = [
    t('layout.shellBadges.operationsSuite'),
    t('layout.shellBadges.realTime'),
    t('layout.shellBadges.secure'),
  ];

  React.useEffect(() => {
    window.scrollTo(0, 0);
    mainStageRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    appShellRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [currentPage]);
  
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

  const handleEntrepotQuickActionsMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setEntrepotQuickActionsDragging(true);
    setEntrepotQuickActionsDragDistance(0);

    const rect = entrepotQuickActionsRef.current?.getBoundingClientRect();
    if (rect) {
      setEntrepotQuickActionsDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setEntrepotQuickActionsPosition({
        x: rect.left,
        y: rect.top,
      });
    }
  };

  const handleEntrepotQuickActionsTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setEntrepotQuickActionsDragging(true);
    setEntrepotQuickActionsDragDistance(0);

    const touch = e.touches[0];
    const rect = entrepotQuickActionsRef.current?.getBoundingClientRect();
    if (rect) {
      setEntrepotQuickActionsDragStart({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
      setEntrepotQuickActionsPosition({
        x: rect.left,
        y: rect.top,
      });
    }
  };

  const handleEntrepotQuickActionsMouseMove = React.useCallback((e: MouseEvent) => {
    if (!entrepotQuickActionsDragging) return;

    e.preventDefault();
    const newX = e.clientX - entrepotQuickActionsDragStart.x;
    const newY = e.clientY - entrepotQuickActionsDragStart.y;
    const margin = 10;
    const maxX = window.innerWidth - (entrepotQuickActionsRef.current?.offsetWidth || 56) - margin;
    const maxY = window.innerHeight - (entrepotQuickActionsRef.current?.offsetHeight || 112) - margin;

    const boundedX = Math.max(margin, Math.min(newX, maxX));
    const boundedY = Math.max(margin, Math.min(newY, maxY));

    setEntrepotQuickActionsPosition({ x: boundedX, y: boundedY });

    const distance = Math.sqrt(
      Math.pow(boundedX - entrepotQuickActionsPosition.x, 2) +
      Math.pow(boundedY - entrepotQuickActionsPosition.y, 2)
    );
    setEntrepotQuickActionsDragDistance(prev => prev + distance);
  }, [entrepotQuickActionsDragging, entrepotQuickActionsDragStart, entrepotQuickActionsPosition]);

  const handleEntrepotQuickActionsTouchMove = React.useCallback((e: TouchEvent) => {
    if (!entrepotQuickActionsDragging) return;

    e.preventDefault();
    const touch = e.touches[0];
    const newX = touch.clientX - entrepotQuickActionsDragStart.x;
    const newY = touch.clientY - entrepotQuickActionsDragStart.y;
    const margin = 10;
    const maxX = window.innerWidth - (entrepotQuickActionsRef.current?.offsetWidth || 56) - margin;
    const maxY = window.innerHeight - (entrepotQuickActionsRef.current?.offsetHeight || 112) - margin;

    const boundedX = Math.max(margin, Math.min(newX, maxX));
    const boundedY = Math.max(margin, Math.min(newY, maxY));

    setEntrepotQuickActionsPosition({ x: boundedX, y: boundedY });

    const distance = Math.sqrt(
      Math.pow(boundedX - entrepotQuickActionsPosition.x, 2) +
      Math.pow(boundedY - entrepotQuickActionsPosition.y, 2)
    );
    setEntrepotQuickActionsDragDistance(prev => prev + distance);
  }, [entrepotQuickActionsDragging, entrepotQuickActionsDragStart, entrepotQuickActionsPosition]);

  const handleEntrepotQuickActionsDragEnd = React.useCallback(() => {
    setEntrepotQuickActionsDragging(false);
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

  React.useEffect(() => {
    if (entrepotQuickActionsDragging) {
      document.addEventListener('mousemove', handleEntrepotQuickActionsMouseMove);
      document.addEventListener('mouseup', handleEntrepotQuickActionsDragEnd);
      document.addEventListener('touchmove', handleEntrepotQuickActionsTouchMove, { passive: false });
      document.addEventListener('touchend', handleEntrepotQuickActionsDragEnd);

      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleEntrepotQuickActionsMouseMove);
        document.removeEventListener('mouseup', handleEntrepotQuickActionsDragEnd);
        document.removeEventListener('touchmove', handleEntrepotQuickActionsTouchMove);
        document.removeEventListener('touchend', handleEntrepotQuickActionsDragEnd);
        document.body.style.userSelect = '';
      };
    }
  }, [
    entrepotQuickActionsDragging,
    handleEntrepotQuickActionsMouseMove,
    handleEntrepotQuickActionsTouchMove,
    handleEntrepotQuickActionsDragEnd,
  ]);

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

  const isMenuItemActive = React.useCallback((item: MenuItem) => {
    return item.id === currentPage || item.children?.some(child => child.id === currentPage);
  }, [currentPage]);

  const menuItemDisponible = React.useCallback((itemId: string) => {
    return moduloDisponible(MENU_PERMISSION_ALIASES[itemId] || itemId);
  }, []);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: t('nav.mainDashboard'), icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'dashboard-metricas', label: t('nav.dashboardMetrics'), icon: <Sparkles className="w-5 h-5" /> },
    { id: 'dashboard-predictivo', label: t('nav.predictiveDashboard'), icon: <Zap className="w-5 h-5" /> },
    { 
      id: 'entrepot', 
      label: t('nav.warehouse'), 
      icon: <Warehouse className="w-5 h-5" />,
      children: [
        { id: 'inventario', label: t('nav.inventory'), icon: <Package className="w-4 h-4" /> },
        { id: 'comandas', label: t('nav.orders'), icon: <ClipboardList className="w-4 h-4" /> },
        { id: 'etiquetas', label: t('nav.labels'), icon: <Tag className="w-4 h-4" /> },
        { id: 'reportes', label: t('nav.reports'), icon: <FileText className="w-4 h-4" /> },
        { id: 'reportes-avanzado', label: t('nav.advancedReports'), icon: <Sparkles className="w-4 h-4" /> },
        { id: 'organismos', label: t('nav.organisms'), icon: <Building className="w-4 h-4" /> },
        { id: 'ofertas-organismo', label: t('nav.offers'), icon: <Tags className="w-4 h-4" /> },
        { id: 'transporte', label: t('nav.transport'), icon: <Truck className="w-4 h-4" /> },
        { id: 'dechets-compostage', label: t('nav.wasteComposting'), icon: <Recycle className="w-4 h-4" /> },
        { id: 'donateurs-fournisseurs', label: t('nav.partnersSuppliers'), icon: <Building className="w-4 h-4" /> },
        { id: 'contactos-almacen', label: t('nav.warehouseDirectory'), icon: <Users className="w-4 h-4" /> },
      ]
    },
    { id: 'cuisine', label: t('common.cuisine'), icon: <ChefHat className="w-5 h-5" /> },
    { id: 'achat', label: t('nav.purchase'), icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'id-digital', label: t('nav.digitalID'), icon: <Scale className="w-5 h-5" /> },
    { id: 'email-organismos', label: t('nav.liaison'), icon: <Users className="w-5 h-5" /> },
    { id: 'communication', label: t('nav.messaging'), icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'recrutement', label: t('nav.recruitment'), icon: <UserPlus className="w-5 h-5" /> },
    { id: 'usuarios', label: t('nav.users'), icon: <Users className="w-5 h-5" /> },
    { id: 'gestion-autenticacion', label: t('nav.authenticationManagement'), icon: <Key className="w-5 h-5" /> },
    { id: 'configuracion', label: t('nav.configuration'), icon: <Settings className="w-5 h-5" /> },
    { id: 'panel-marca', label: t('nav.visualIdentity'), icon: <Palette className="w-5 h-5" />, soloDesarrollador: true },
    { id: 'api-keys', label: t('nav.apiIntegrations'), icon: <Key className="w-5 h-5" />, soloDesarrollador: true },
  ];

  const currentMenuItem = React.useMemo(() => {
    const findRecursive = (items: MenuItem[]): MenuItem | null => {
      for (const item of items) {
        if (item.id === currentPage) {
          return item;
        }
        if (item.children) {
          const childMatch = findRecursive(item.children);
          if (childMatch) {
            return childMatch;
          }
        }
      }
      return null;
    };

    return findRecursive(menuItems);
  }, [currentPage, menuItems]);

  const currentWorkspaceLabel = currentMenuItem?.label || t('nav.mainDashboard');

  const entrepotModulePageIds = React.useMemo(
    () => menuItems.find(item => item.id === 'entrepot')?.children?.map(child => child.id) ?? [],
    [menuItems]
  );

  const showEntrepotQuickActions = entrepotModulePageIds.includes(currentPage) && currentPage !== 'inventario';

  const navigateToInventarioQuickAction = (action: 'open-scanner' | 'open-new-entry') => {
    savePendingEntrepotQuickAction(action);
    onNavigate('inventario');
  };

  const menuSections: MenuSection[] = [
    { id: 'overview', label: t('layout.sections.overview'), itemIds: ['dashboard', 'dashboard-metricas', 'dashboard-predictivo'] },
    { id: 'operations', label: t('layout.sections.operations'), itemIds: ['entrepot', 'cuisine', 'achat', 'id-digital'] },
    { id: 'coordination', label: t('layout.sections.coordination'), itemIds: ['email-organismos', 'communication', 'recrutement'] },
    { id: 'administration', label: t('layout.sections.administration'), itemIds: ['usuarios', 'gestion-autenticacion', 'configuracion'] },
    { id: 'advanced', label: t('layout.sections.advanced'), itemIds: ['panel-marca', 'api-keys'] },
  ];

  const filtrarMenuItem = React.useCallback((item: MenuItem): MenuItem | null => {
    if (item.soloDesarrollador && !esDesarrollador) {
      return null;
    }

    if (item.children) {
      const hijosFiltrados = item.children
        .map(filtrarMenuItem)
        .filter((child): child is MenuItem => child !== null);

      if (hijosFiltrados.length === 0) {
        return null;
      }

      return {
        ...item,
        children: hijosFiltrados,
      };
    }

    if (!menuItemDisponible(item.id)) {
      return null;
    }

    return item;
  }, [esDesarrollador, menuItemDisponible]);

  // Filtrar menú según permisos
  const menuItemsFiltrado = menuItems
    .map(filtrarMenuItem)
    .filter((item): item is MenuItem => item !== null);

  const menuSectionsFiltradas = menuSections
    .map(section => ({
      ...section,
      items: section.itemIds
        .map(itemId => menuItemsFiltrado.find(item => item.id === itemId))
        .filter((item): item is MenuItem => Boolean(item)),
    }))
    .filter(section => section.items.length > 0);

  const renderMenuItem = (item: MenuItem, nested = false) => {
    const itemActivo = isMenuItemActive(item);
    const itemExpandido = Boolean(item.children) && (expandedMenus.includes(item.id) || item.children?.some(child => child.id === currentPage));
    const baseClasses = nested
      ? `relative w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-200 text-[12px] leading-4 group overflow-hidden ${
          itemActivo
            ? 'bg-white text-slate-900 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.8)]'
            : 'text-white/84 hover:bg-white/10 hover:text-white hover:shadow-[0_14px_30px_-24px_rgba(15,23,42,0.55)]'
        }`
      : `relative w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl transition-all duration-200 text-[13px] leading-5 group overflow-hidden ${
          itemActivo
            ? 'bg-white text-slate-900 shadow-[0_18px_36px_-26px_rgba(15,23,42,0.85)]'
            : 'text-white/88 hover:bg-white/10 hover:text-white hover:translate-x-[1px] hover:shadow-[0_18px_36px_-28px_rgba(15,23,42,0.6)]'
        }`;
    const iconShellClasses = nested
      ? 'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border'
      : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border';
    const iconShellStyle = {
      backgroundColor: itemActivo ? `${branding.primaryColor}16` : 'rgba(255,255,255,0.06)',
      borderColor: itemActivo ? `${branding.primaryColor}24` : 'rgba(255,255,255,0.08)',
      color: itemActivo ? branding.primaryColor : 'inherit',
    };

    if (item.children) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleMenu(item.id)}
            className={baseClasses}
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: nested ? 500 : 600,
              color: itemActivo ? branding.primaryColor : undefined,
            }}
          >
            {itemActivo ? (
              <span
                className="absolute left-1 top-1 bottom-1 w-1 rounded-full"
                style={{
                  background: `linear-gradient(180deg, ${branding.secondaryColor} 0%, ${branding.primaryColor} 100%)`,
                }}
              />
            ) : null}
            <div
              className={`${iconShellClasses} transition-transform duration-200 group-hover:scale-[1.04] ${itemActivo ? 'scale-[1.02]' : ''}`}
              style={iconShellStyle}
            >
              {item.icon}
            </div>
            <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
            <div
              className={`ml-auto flex h-5 w-5 items-center justify-center rounded-full transition-colors ${itemActivo ? 'bg-slate-100' : 'bg-white/8 group-hover:bg-white/12'}`}
            >
              {itemExpandido ? <ChevronDown className="h-3.5 w-3.5 opacity-70" /> : <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
            </div>
          </button>
          <AnimatePresence>
            {itemExpandido && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-3 mt-1 space-y-0.5 border-l border-white/10 pl-2.5"
              >
                {item.children.map(child => renderMenuItem(child, true))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => {
          onNavigate(item.id);
          setSidebarOpen(false);
        }}
        className={baseClasses}
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: nested ? 500 : 600,
          color: itemActivo ? branding.primaryColor : undefined,
        }}
      >
        {itemActivo ? (
          <span
            className="absolute left-1 top-1 bottom-1 w-1 rounded-full"
            style={{
              background: `linear-gradient(180deg, ${branding.secondaryColor} 0%, ${branding.primaryColor} 100%)`,
            }}
          />
        ) : null}
        <div
          className={`${iconShellClasses} transition-transform duration-200 group-hover:scale-[1.04] ${itemActivo ? 'scale-[1.02]' : ''}`}
          style={iconShellStyle}
        >
          {item.icon}
        </div>
        <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
      </button>
    );
  };

  return (
    <div 
      className="app-professional-shell min-h-screen relative overflow-hidden" 
      style={{ 
        fontFamily: 'Roboto, sans-serif',
        background: `linear-gradient(135deg, ${branding.primaryColor}0d 0%, ${branding.secondaryColor}08 52%, rgba(255,255,255,0.9) 100%)`,
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
        ref={topbarRef}
        className="app-pro-topbar fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b"
        style={{ 
          background: `linear-gradient(140deg, ${branding.primaryColor}f4 0%, ${branding.primaryColor}ea 46%, ${branding.secondaryColor}d8 100%)`,
          borderColor: `${branding.primaryColor}26`,
          boxShadow: '0 16px 40px -28px rgba(6, 24, 44, 0.55)'
        }}
      >
        <div className="px-3 sm:px-4 py-2.5 sm:py-3.5">
          <div className="mb-2.5 hidden lg:flex items-center justify-between gap-4 text-white/78">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
              <Zap className="h-3.5 w-3.5 text-white/90" />
              {t('layout.professionalEnvironment')}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {professionalShellBadges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/18 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/80 backdrop-blur-md"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Primera fila: Menú, Logo/Nombre */}
          <div className="flex items-center justify-between gap-2 sm:gap-3.5">
            <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
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
                  <AdaptiveBrandLogo
                    src={branding.logo}
                    alt={t('common.logo')}
                    wrapperClassName="h-7 w-7 flex-shrink-0 sm:h-9 sm:w-9"
                    glowColor={branding.secondaryColor}
                    glowClassName="blur-md opacity-50"
                    containerClassName="relative z-10"
                    borderWidthClassName="border-2"
                    containerStyle={{
                      borderColor: 'rgba(255,255,255,0.9)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <h1 className="font-bold truncate text-sm sm:text-base md:text-xl lg:text-2xl text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {nombreMostrar}
                    </h1>
                    <Sparkles className="w-4 h-4 text-white/80 hidden sm:block" />
                  </div>
                  <div className="hidden md:flex items-center gap-2 mt-1.5 text-white/78">
                    <span className="rounded-full border border-white/16 bg-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] backdrop-blur-md" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
                      {currentWorkspaceLabel}
                    </span>
                    <span className="text-xs text-white/70">{t('layout.unifiedManagementPlatform')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Segunda parte: Búsqueda, Notificaciones, Idioma, Usuario */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
              <GlobalSearch onNavigate={onNavigate} />
              <CentroNotificaciones />
              <LanguageSelector />
              <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-white/16 bg-white/10 px-2.5 py-1.5 max-w-[220px] sm:max-w-[240px] shadow-[0_14px_28px_-24px_rgba(0,0,0,0.55)] backdrop-blur-md">
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-white font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {nombreCompleto}
                  </p>
                  <p className="text-xs text-white/75">{rolTraducido}</p>
                </div>
                <UserAvatar
                  userId={usuarioActual?.id}
                  displayName={nombreCompleto}
                  username={usuarioActual?.username}
                  photo={usuarioActual?.foto}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl shadow-lg border border-white/25"
                  fallbackClassName="text-xs sm:text-sm font-bold text-white"
                  fallbackStyle={{ backgroundColor: branding.secondaryColor }}
                />
              </div>
              {/* Usuario móvil compacto */}
              <div className="sm:hidden flex items-center gap-2 rounded-xl border border-white/16 bg-white/10 px-2 py-1 max-w-[150px] backdrop-blur-md">
                <div className="text-right min-w-0">
                  <p
                    className="text-[11px] text-white font-semibold truncate"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {nombreCompleto}
                  </p>
                  <p className="text-[10px] text-white/80 truncate">{rolTraducido}</p>
                </div>
                <UserAvatar
                  userId={usuarioActual?.id}
                  displayName={nombreCompleto}
                  username={usuarioActual?.username}
                  photo={usuarioActual?.foto}
                  className="w-8 h-8 rounded-full shadow-lg"
                  fallbackClassName="text-xs font-bold text-white"
                  fallbackStyle={{ backgroundColor: branding.secondaryColor }}
                />
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
          className={`app-pro-sidebar fixed left-0 bottom-0 ${useCommunicationCompactSidebar ? 'w-[212px] sm:w-[224px]' : 'w-[232px] sm:w-[248px]'} shadow-2xl transition-transform duration-300 z-40 overflow-y-auto backdrop-blur-xl border-r ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          style={{ 
            top: shellTopOffset,
            background: `linear-gradient(180deg, ${branding.primaryColor}fa 0%, ${branding.primaryColor}f3 58%, ${branding.primaryColor}ea 100%)`,
            borderColor: `${branding.primaryColor}30`
          }}
        >
          <nav className="p-2.5 sm:p-3 space-y-2.5">
            <div className="app-pro-sidebar-panel rounded-[18px] border border-white/10 bg-white/[0.07] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-white/72" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
                    {t('layout.mainNavigation')}
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-white/58">{t('layout.structuredByBusinessFunction')}</p>
                </div>
                <span className="rounded-full border border-white/12 bg-white/10 px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-white/76" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
                  Pro
                </span>
              </div>
              <div className="mt-2.5 rounded-xl border border-white/8 bg-black/10 px-3 py-2">
                <p className="text-[9px] uppercase tracking-[0.18em] text-white/50" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
                  {t('layout.activeModule')}
                </p>
                <p className="mt-1 truncate text-[13px] font-semibold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {currentWorkspaceLabel}
                </p>
              </div>
            </div>
            {menuSectionsFiltradas.map((section) => (
              <section
                key={section.id}
                className="rounded-[18px] px-2 py-1.5 transition-all duration-200"
                style={{
                  border: section.items.some(item => isMenuItemActive(item))
                    ? `1px solid ${branding.secondaryColor}30`
                    : '1px solid rgba(255,255,255,0.07)',
                  background: section.items.some(item => isMenuItemActive(item))
                    ? 'linear-gradient(180deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.05) 100%)'
                    : 'rgba(255,255,255,0.04)',
                  boxShadow: section.items.some(item => isMenuItemActive(item))
                    ? `0 20px 40px -34px ${branding.secondaryColor}80, inset 0 1px 0 rgba(255,255,255,0.08)`
                    : 'inset 0 1px 0 rgba(255,255,255,0.04)',
                }}
              >
                <div className="flex items-center justify-between px-2.5 pb-1.5">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-white/50" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
                    {section.label}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {section.items.some(item => isMenuItemActive(item)) ? (
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: branding.secondaryColor }}
                      />
                    ) : null}
                    <span className="rounded-full border border-white/10 bg-white/6 px-1.5 py-0.5 text-[9px] text-white/45">
                      {section.items.length}
                    </span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  {section.items.map(item => renderMenuItem(item))}
                </div>
              </section>
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
      <main
        ref={mainStageRef}
        className={`app-main-stage box-border ${!hideSidebar ? (useCommunicationCompactSidebar ? 'lg:pl-[220px] xl:pl-[232px]' : 'lg:pl-[244px] xl:pl-[264px]') : ''} relative z-10 overflow-x-hidden ${useCommunicationFullscreenShell ? 'overflow-hidden' : 'overflow-y-auto'}`}
        style={useCommunicationFullscreenShell
          ? { top: shellTopOffset, height: `calc(100vh - ${shellTopOffset})` }
          : { paddingTop: shellTopOffset, height: '100vh' }}
      >
        <div ref={appShellRef} data-app-shell className={`app-shell-content ${useCommunicationFullscreenShell ? 'h-full overflow-hidden px-0 py-0' : 'px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-4 xl:px-5 xl:py-5'}`}>
          {children}
        </div>
      </main>

      {/* Sistema de Alertas Automáticas */}
      <SystemAlerts />
      <AlertsSummary />

      {/* Botón flotante para acceso de organismos - Modernizado */}
      {!hideCommunicationFloaters && (
        <button
          onClick={() => onNavigate('acceso-organismo')}
          className={`app-floating-organism-access fixed bottom-4 sm:bottom-6 left-4 sm:left-6 ${!hideSidebar ? 'lg:left-[calc(244px+1.5rem)] xl:left-[calc(264px+1.5rem)]' : ''} text-white rounded-full p-3 sm:p-4 shadow-2xl transition-all hover:scale-110 z-40 flex items-center gap-2 backdrop-blur-xl border-2 border-white/30 group`}
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
      )}

      {showEntrepotQuickActions && (
        <div
          ref={entrepotQuickActionsRef}
          onMouseDown={handleEntrepotQuickActionsMouseDown}
          onTouchStart={handleEntrepotQuickActionsTouchStart}
          className={`app-floating-quick-actions fixed z-[60] flex flex-col items-end gap-3 ${entrepotQuickActionsDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{
            bottom: 'auto',
            right: entrepotQuickActionsPosition.x === 0 ? 'max(env(safe-area-inset-right), 1rem)' : 'auto',
            top: entrepotQuickActionsPosition.y === 0 ? '50%' : `${entrepotQuickActionsPosition.y}px`,
            left: entrepotQuickActionsPosition.x !== 0 ? `${entrepotQuickActionsPosition.x}px` : 'auto',
            transform: entrepotQuickActionsPosition.y === 0 ? 'translateY(-50%)' : 'none',
            transition: entrepotQuickActionsDragging ? 'none' : 'all 0.3s ease',
            userSelect: 'none',
            touchAction: 'none',
            WebkitTouchCallout: 'none'
          }}
        >
          <button
            onClick={() => {
              if (entrepotQuickActionsDragDistance < dragThreshold) {
                navigateToInventarioQuickAction('open-new-entry');
              }
            }}
            className="h-12 w-12 rounded-full text-white transition-all duration-300 hover:scale-105 shadow-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #1a4d7a 0%, #153d61 100%)',
              boxShadow: '0 10px 25px rgba(26, 77, 122, 0.35)'
            }}
            title="Nouvelle entrée"
            aria-label="Nouvelle entrée"
          >
            <Plus className="h-5 w-5" />
          </button>

          <button
            onClick={() => {
              if (entrepotQuickActionsDragDistance < dragThreshold) {
                navigateToInventarioQuickAction('open-scanner');
              }
            }}
            className="h-12 w-12 rounded-full text-white transition-all duration-300 hover:scale-105 shadow-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #0f8f6f 0%, #0b6e56 100%)',
              boxShadow: '0 10px 25px rgba(15, 143, 111, 0.3)'
            }}
            title="Scanner QR"
            aria-label="Scanner QR"
          >
            <QrCode className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Botón flotante de Guide Complet - DRAGGABLE */}
      {!hideCommunicationFloaters && (
        <button
          ref={buttonRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={(e) => {
            if (totalDragDistance < dragThreshold) {
              setShowGuideComplete(true);
            }
          }}
          className={`app-floating-guide text-white rounded-full shadow-2xl z-50 flex items-center justify-center backdrop-blur-xl border-2 border-white/30 group w-12 h-12 sm:w-14 sm:h-14 transition-all ${
            isDragging ? 'cursor-grabbing scale-110 shadow-[0_0_30px_rgba(26,77,122,0.5)]' : 'cursor-grab hover:scale-110'
          }`}
          style={{ 
            position: 'fixed',
            bottom: 'auto',
            right: position.y === 0 ? '1rem' : 'auto',
            top: position.y === 0 ? 'calc(50% + 7rem)' : `${position.y}px`,
            left: position.x !== 0 ? `${position.x}px` : 'auto',
            transform: position.y === 0 ? 'translateY(-50%)' : 'none',
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
      )}

      {/* Modal de Guide Complet */}
      {showGuideComplete && (
        <GuideCompletModules onClose={() => setShowGuideComplete(false)} />
      )}

      {/* Botón de instalación PWA flotante */}
      {!hideCommunicationFloaters && <PWAFloatingButton />}

      <ScrollToTopButton getScrollTarget={() => mainStageRef.current} />
    </div>
  );
}