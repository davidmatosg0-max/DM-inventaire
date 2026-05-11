// 🆕 FORMULARIO DE ENTRADA DON/ACHAT - VERSIÓN OPTIMIZADA Y FUNCIONAL
// Completamente reescrito para máxima funcionalidad y claridad
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../../hooks/useBranding';
import { 
  Gift, Package, Building2, Plus, Check, ChevronsUpDown, Save, X, 
  Thermometer, Snowflake, Wind, ChevronDown, ChevronUp, Settings, 
  Package2, Printer, AlertTriangle, Info, Search, Trash2
} from 'lucide-react';
import { printStandardLabel, type ProductLabelData } from './etiquetas/StandardProductLabel';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { toast } from 'sonner';
import { cn } from './ui/utils';
import { IconSelector } from './ui/IconSelector';
import { obtenerProductosActivos, obtenerProductos, guardarProducto, actualizarProducto, type ProductoCreado } from '../utils/productStorage';
import { guardarEntrada } from '../utils/entradaInventarioStorage';
import { type Categoria } from '../data/configuracionData';
import { obtenerProgramasActivos, type ProgramaEntrada } from '../utils/programaEntradaStorage';
import { filterByThreeLetters } from '../utils/searchUtils';
import { generarIconoAutomatico } from '../utils/iconoUtils';
import { formatMoney, formatQuantity } from '../utils/formatUtils';
import { 
  actualizarPesoUnitarioSubcategoria, 
  actualizarPesoUnitarioVariante, 
  obtenerCategorias, 
  obtenerPesoUnitario, 
  obtenerPesoPorUnidad, 
  agregarSubcategoria,
  agregarVariante,
  guardarCategorias 
} from '../utils/categoriaStorage';
import { obtenerUnidades, type Unidad } from '../utils/unidadStorage';
import { type Variante } from '../data/configuracionData';
import { 
  obtenerContactosDepartamento, 
  type ContactoDepartamento, 
  sincronizarDonateursFournisseurs 
} from '../utils/contactosDepartamentoStorage';

// ==================== TIPOS ====================
type TipoTemperatura = 'ambiente' | 'refrigerado' | 'congelado' | '';

interface FormDataDonAchat {
  tipoEntrada: string;
  donadorId: string;
  participantePRSId?: string;
  
  // Sistema en cascada: Categoría → Subcategoría → Variante
  categoriaId: string;
  categoriaNombre: string;
  subcategoriaId: string;
  subcategoriaNombre: string;
  varianteId: string;
  varianteNombre: string;
  
  // Campos legacy (mantener por compatibilidad)
  productoId: string;
  nombreProducto: string;
  productoCustom: string;
  categoria: string;
  subcategoria: string;
  productoIcono?: string;
  
  cantidad: number;
  unidad: string;
  pesoUnitario: number;
  peso: number;
  valorUnitario: number; // Valor monetario por unidad en CAD$
  temperatura: TipoTemperatura;
  fechaCaducidad: string;
  lote: string;
  detallesEmpaque: string;
  observaciones: string;
}

interface ProductoAgregado {
  productoId?: string;
  nombreProducto: string; // Nombre con sufijo para mostrar/etiquetas (ej: "Producto - Paleta 1/2")
  nombreProductoBase?: string; // Nombre base sin sufijo para inventario (ej: "Producto")
  productoIcono: string;
  cantidad: number;
  unidad: string;
  pesoTotal: number;
  pesoUnidad?: number; // Peso de la unidad/contenedor (tara) en kg
  temperatura: string;
  categoria?: string;
  subcategoria?: string;
  variante?: string;
  categoriaId?: string;
  subcategoriaId?: string;
  varianteId?: string;
  lote?: string;
  fechaCaducidad?: string;
  detallesEmpaque?: string;
  valorUnitario?: number; // Valor monetario por unidad en CAD$
  valorTotal?: number; // Valor monetario total en CAD$
}

interface FormSubcategoria {
  codigo: string;
  nombre: string;
  unidad: string;
  stockMinimo: number;
  icono: string;
  pesoUnitario: number;
  pesoPLT: number;
  pesoCJA: number;
  pesoUND: number;
  pesoSAC: number;
  pesoBN: number;
  pesoKg: number;
  descripcion: string;
}

interface FormVariante {
  nombre: string;
  codigo: string;
  icono: string;
  unidad: string;
  valorPorKg: string;
  pesoUnitario: string;
  descripcion: string;
}

interface EntradaDonAchatProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

// ==================== DATOS INICIALES ====================
const FORM_DATA_INICIAL: FormDataDonAchat = {
  tipoEntrada: '',
  donadorId: '',
  participantePRSId: '',
  
  // Sistema en cascada
  categoriaId: '',
  categoriaNombre: '',
  subcategoriaId: '',
  subcategoriaNombre: '',
  varianteId: '',
  varianteNombre: '',
  
  // Legacy
  productoId: '',
  nombreProducto: '',
  productoCustom: '',
  categoria: '',
  subcategoria: '',
  productoIcono: '',
  
  cantidad: 0,
  unidad: '',
  pesoUnitario: 0,
  peso: 0,
  valorUnitario: 0,
  temperatura: '',
  fechaCaducidad: '',
  lote: '',
  detallesEmpaque: '',
  observaciones: '',
};

const FORM_SUBCATEGORIA_INICIAL: FormSubcategoria = {
  codigo: '',
  nombre: '',
  unidad: '',
  stockMinimo: 0,
  icono: '',
  pesoUnitario: 0,
  pesoPLT: 0,
  pesoCJA: 0,
  pesoUND: 0,
  pesoSAC: 0,
  pesoBN: 0,
  pesoKg: 0,
  descripcion: ''
};

const FORM_VARIANTE_INICIAL: FormVariante = {
  nombre: '',
  codigo: '',
  icono: '📦',
  unidad: '',
  valorPorKg: '',
  pesoUnitario: '',
  descripcion: ''
};

// ==================== COMPONENTE PRINCIPAL ====================
export function EntradaDonAchat({ open: controlledOpen, onOpenChange, hideTrigger = false }: EntradaDonAchatProps = {}) {
  const { t } = useTranslation();
  const branding = useBranding();
  const printRef = useRef<HTMLDivElement>(null);
  
  // ========== Estados principales ==========
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const handleOpenChange = onOpenChange ?? setInternalOpen;
  const [formData, setFormData] = useState<FormDataDonAchat>(FORM_DATA_INICIAL);
  const [productosAgregados, setProductosAgregados] = useState<ProductoAgregado[]>([]);
  
  // ========== Estados de datos ==========
  const [productosDB, setProductosDB] = useState<ProductoCreado[]>([]);
  const [categoriasDB, setCategoriasDB] = useState<Categoria[]>([]);
  const [programasDB, setProgramasDB] = useState<ProgramaEntrada[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [contactosAlmacen, setContactosAlmacen] = useState<ContactoDepartamento[]>([]);
  
  // ========== Estados de UI ==========
  const [comboboxCategoriaOpen, setComboboxCategoriaOpen] = useState(false);
  const [comboboxSubcategoriaOpen, setComboboxSubcategoriaOpen] = useState(false);
  const [comboboxVarianteOpen, setComboboxVarianteOpen] = useState(false);
  const [searchCategoriaQuery, setSearchCategoriaQuery] = useState('');
  const [searchSubcategoriaQuery, setSearchSubcategoriaQuery] = useState('');
  const [searchVarianteQuery, setSearchVarianteQuery] = useState('');
  const [selectContactoOpen, setSelectContactoOpen] = useState(false);
  const [searchContactoQuery, setSearchContactoQuery] = useState('');
  const [detallesOpcionalesAbiertos, setDetallesOpcionalesAbiertos] = useState(true); // Siempre visible por defecto
  const [imprimirAutomaticamente, setImprimirAutomaticamente] = useState(true);
  
  // 🎯 Estados específicos para productos PRS
  const [comboboxProductoPRSOpen, setComboboxProductoPRSOpen] = useState(false);
  const [searchProductoPRSQuery, setSearchProductoPRSQuery] = useState('');
  
  // ========== Estados de diálogos ==========
  const [subcategoriaDialogOpen, setSubcategoriaDialogOpen] = useState(false);
  const [nuevaSubcategoriaDialogOpen, setNuevaSubcategoriaDialogOpen] = useState(false);
  const [nuevaVarianteDialogOpen, setNuevaVarianteDialogOpen] = useState(false);
  const [ayudaImpresionOpen, setAyudaImpresionOpen] = useState(false);
  const [dialogConfirmacion, setDialogConfirmacion] = useState(false);
  
  // ========== Estados de formularios secundarios ==========
  const [formSubcategoria, setFormSubcategoria] = useState<FormSubcategoria>(FORM_SUBCATEGORIA_INICIAL);
  const [formVariante, setFormVariante] = useState<FormVariante>(FORM_VARIANTE_INICIAL);
  const [categoriaSeleccionadaParaNueva, setCategoriaSeleccionadaParaNueva] = useState('');
  const [categoriaBase, setCategoriaBase] = useState<Categoria | null>(null);

  const cargarDatosIniciales = useCallback(() => {
    try {
      // 1. Sincronizar donateurs/fournisseurs
      const resultado = sincronizarDonateursFournisseurs();
      console.log(`✅ Sincronización: ${resultado.sincronizados} donateurs/fournisseurs`);
      
      // 2. Cargar productos
      const productosActivos = obtenerProductosActivos();
      setProductosDB(productosActivos);
      console.log(`📦 ${productosActivos.length} productos cargados`);
      
      // 3. Cargar categorías
      const categoriasGuardadas = obtenerCategorias();
      setCategoriasDB(categoriasGuardadas);
      console.log(`🏷️ ${categoriasGuardadas.length} categorías cargadas`);
      
      // 4. Cargar programas
      const programasActivos = obtenerProgramasActivos();
      setProgramasDB(programasActivos);
      console.log(`🎯 ${programasActivos.length} programas cargados`);
      
      // 5. Cargar unidades
      const unidadesCargadas = obtenerUnidades();
      setUnidades(unidadesCargadas);
      console.log(`📏 ${unidadesCargadas.length} unidades cargadas`);
      
      // 6. Cargar contactos donadores/fournisseurs
      const todosContactos = obtenerContactosDepartamento();
      const contactosFiltrados = todosContactos.filter(c => 
        (c.isDonateur || c.isFournisseur || c.participaPRS) && c.activo
      );
      setContactosAlmacen(contactosFiltrados);
      console.log(`👥 ${contactosFiltrados.length} contactos cargados`);
      
      // 7. Cargar programa predeterminado
      const programaPredeterminado = localStorage.getItem('programaPredeterminado');
      if (programaPredeterminado) {
        setFormData(prev => ({ ...prev, tipoEntrada: programaPredeterminado }));
      }
      
      console.log('✅ Carga de datos completada');
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      toast.error('Error al cargar los datos del sistema');
    }
  }, []);

  // ==================== CARGA DE DATOS INICIAL ====================
  useEffect(() => {
    if (open) {
      console.log('🚪 Diálogo abierto - Cargando datos...');
      cargarDatosIniciales();
    } else {
      // Limpiar al cerrar
      setProductosAgregados([]);
    }
  }, [open, cargarDatosIniciales]);

  // ==================== LISTENERS DE EVENTOS ====================
  useEffect(() => {
    const handleContactosActualizados = () => {
      console.log('🔄 Contactos actualizados');
      const todosContactos = obtenerContactosDepartamento();
      const contactosFiltrados = todosContactos.filter(c => 
        (c.isDonateur || c.isFournisseur || c.participaPRS) && c.activo
      );
      setContactosAlmacen(contactosFiltrados);
    };

    const handleProductosActualizados = () => {
      console.log('🔄 Productos actualizados');
      const productosActivos = obtenerProductosActivos();
      setProductosDB(productosActivos);
    };

    const handleCategoriasActualizadas = () => {
      console.log('🔄 Categorías actualizadas');
      const categoriasActualizadas = obtenerCategorias();
      setCategoriasDB(categoriasActualizadas);
    };

    const handleUnidadesActualizadas = () => {
      console.log('🔄 Unidades actualizadas');
      const unidadesCargadas = obtenerUnidades();
      setUnidades(unidadesCargadas);
    };

    const handleProgramasActualizados = () => {
      console.log('🔄 Programas de entrada actualizados');
      const programasActivos = obtenerProgramasActivos();
      setProgramasDB(programasActivos);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'contactos_departamentos' || e.key === null) {
        handleContactosActualizados();
      }
      if (e.key === 'banco_alimentos_productos' || e.key === null) {
        handleProductosActualizados();
      }
      if (e.key === 'bancoAlimentos_categorias' || e.key === null) {
        handleCategoriasActualizadas();
      }
      if (e.key === 'bancoAlimentos_programasEntrada' || e.key === null) {
        handleProgramasActualizados();
      }
    };

    window.addEventListener('contactos-actualizados', handleContactosActualizados);
    window.addEventListener('productos-actualizados', handleProductosActualizados);
    window.addEventListener('categorias-actualizadas', handleCategoriasActualizadas);
    window.addEventListener('unidadesActualizadas', handleUnidadesActualizadas);
    window.addEventListener('programas-actualizados', handleProgramasActualizados);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('contactos-actualizados', handleContactosActualizados);
      window.removeEventListener('productos-actualizados', handleProductosActualizados);
      window.removeEventListener('categorias-actualizadas', handleCategoriasActualizadas);
      window.removeEventListener('unidadesActualizadas', handleUnidadesActualizadas);
      window.removeEventListener('programas-actualizados', handleProgramasActualizados);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // ==================== EFECTOS DE SINCRONIZACIÓN ====================
  
  // Limpiar productos agregados cuando cambia el donador
  useEffect(() => {
    setProductosAgregados([]);
  }, [formData.donadorId]);

  // Limpiar producto seleccionado cuando cambia el programa
  useEffect(() => {
    if (formData.productoId) {
      const productoActual = productosDB.find(p => p.id === formData.productoId);
      const esProgramaPRS = formData.tipoEntrada === 'prs';
      
      if (productoActual) {
        const esProductoPRS = productoActual.esPRS === true;
        if (esProgramaPRS !== esProductoPRS) {
          setFormData(prev => ({
            ...prev,
            productoId: '',
            nombreProducto: '',
            productoCustom: '',
            productoIcono: '',
            categoria: '',
            subcategoria: '',
            varianteId: undefined
          }));
          toast.info(
            esProgramaPRS 
              ? '💡 Programme PRS sélectionné - Seuls les produits PRS sont disponibles'
              : '💡 Programme changé - Seuls les produits non-PRS sont disponibles',
            { duration: 4000 }
          );
        }
      }
    }
  }, [formData.tipoEntrada, formData.productoId, productosDB]);

  // ==================== DATOS COMPUTADOS ====================
  
  const programasActivos = useMemo(() => programasDB, [programasDB]);
  
  const programaSeleccionado = useMemo(() => 
    programasActivos.find(p => p.codigo.toLowerCase() === formData.tipoEntrada),
    [programasActivos, formData.tipoEntrada]
  );

  const contactosDisponibles = useMemo(() => {
    if (!formData.tipoEntrada) return [];
    
    const programa = formData.tipoEntrada.toLowerCase();
    
    // 🐛 DEBUG: Ver datos antes de filtrar
    console.log('🔍 DEBUG contactosAlmacen:', contactosAlmacen.map(c => ({
      nombre: c.nombreEmpresa || `${c.nombre} ${c.apellido}`,
      isDonateur: c.isDonateur,
      isFournisseur: c.isFournisseur
    })));
    
    // 🎯 FILTRADO POR PROGRAMA (códigos en minúsculas):
    // don = TODOS los donadores (isDonateur=true)
    // ach = TODOS los proveedores (isFournisseur=true)
    // occ = TODOS los partenaires (isDonateur=true OR isFournisseur=true)
    // prs = Solo participantes PRS (participaPRS=true)
    //
    // LÓGICA: Si un partenaire es DUAL (donateur + fournisseur):
    //   - Aparece en DON porque puede donar
    //   - Aparece en ACHAT porque puedo comprarle
    //   - Aparece en OCC porque es un contacto disponible (ocasional acepta a todos)
    
    let filtrados: ContactoDepartamento[] = [];
    
    console.log(`🎯 FILTRO: Programa="${programa}" (tipo: ${typeof programa})`);
    
    switch (programa) {
      case 'don':
        // DON: Mostrar TODOS los donadores (exclusivos + duales)
        filtrados = contactosAlmacen.filter(c => 
          c.isDonateur === true
        );
        console.log(`✅ DON: Filtrando TODOS los donadores (isDonateur=true, incluye duales)`);
        break;
        
      case 'ach':
        // ACHAT: Mostrar TODOS los proveedores (exclusivos + duales)
        filtrados = contactosAlmacen.filter(c => 
          c.isFournisseur === true
        );
        console.log(`✅ ACHAT: Filtrando TODOS los proveedores (isFournisseur=true, incluye duales)`);
        break;
        
      case 'prs':
        // PRS: Mostrar solo participantes del Programa de Récupération en Supermarchés
        filtrados = contactosAlmacen.filter(c => 
          c.participaPRS === true
        );
        console.log(`✅ PRS: Filtrando solo participantes PRS`);
        break;
        
      case 'occ':
        // OCC: Mostrar TODOS los partenaires (donadores + proveedores + duales)
        filtrados = contactosAlmacen.filter(c => 
          c.isDonateur === true || c.isFournisseur === true
        );
        console.log(`✅ OCC: Filtrando TODOS los partenaires (isDonateur=true OR isFournisseur=true)`);
        break;
        
      default:
        // Para cualquier otro programa, mostrar donadores
        filtrados = contactosAlmacen.filter(c => 
          c.isDonateur === true
        );
        console.log(`⚠️ DEFAULT: Filtrando TODOS los donadores (isDonateur=true, incluye duales)`);
    }
    
    console.log(`🔍 DEBUG Programa: ${programa}, Filtrados: ${filtrados.length}`, filtrados.map(c => ({
      nombre: c.nombreEmpresa || `${c.nombre} ${c.apellido}`,
      isDonateur: c.isDonateur,
      isFournisseur: c.isFournisseur
    })));
    
    return filtrados;
  }, [contactosAlmacen, formData.tipoEntrada]);

  const contactosFiltrados = useMemo(() => {
    if (!searchContactoQuery || searchContactoQuery.length < 3) {
      return contactosDisponibles;
    }
    return filterByThreeLetters(searchContactoQuery, contactosDisponibles, [
      'nombre', 
      'apellido', 
      'nombreEmpresa', 
      'telefono', 
      'email', 
      'direccion',
      'notas'
    ]);
  }, [searchContactoQuery, contactosDisponibles]);

  // ========== FILTROS EN CASCADA: CATEGORÍA → SUBCATEGORÍA → VARIANTE ==========
  
  // 1. Filtrar categorías según si es PRS o no
  const categoriasFiltradas = useMemo(() => {
    const esProgramaPRS = formData.tipoEntrada === 'prs';
    return categoriasDB.filter(cat => cat.activa);
  }, [categoriasDB, formData.tipoEntrada]);

  // 2. Obtener subcategorías de la categoría seleccionada
  const subcategoriasDisponibles = useMemo(() => {
    if (!formData.categoriaId) return [];
    const categoria = categoriasDB.find(c => c.id === formData.categoriaId);
    return categoria?.subcategorias?.filter(sub => sub.activa) || [];
  }, [categoriasDB, formData.categoriaId]);

  // 3. Obtener variantes de la subcategoría seleccionada
  const variantesDisponibles = useMemo(() => {
    if (!formData.subcategoriaId) return [];
    const categoria = categoriasDB.find(c => c.id === formData.categoriaId);
    const subcategoria = categoria?.subcategorias?.find(s => s.id === formData.subcategoriaId);
    return subcategoria?.variantes || [];
  }, [categoriasDB, formData.categoriaId, formData.subcategoriaId]);

  const categoriaSeleccionada = useMemo(() => 
    categoriasDB.find(c => c.id === formData.categoriaId),
    [categoriasDB, formData.categoriaId]
  );

  const subcategoriaSeleccionada = useMemo(() => 
    categoriaSeleccionada?.subcategorias?.find(s => s.id === formData.subcategoriaId),
    [categoriaSeleccionada, formData.subcategoriaId]
  );

  const varianteSeleccionada = useMemo(() => 
    subcategoriaSeleccionada?.variantes?.find(v => v.id === formData.varianteId),
    [subcategoriaSeleccionada, formData.varianteId]
  );

  // ==================== FUNCIONES DE CÁLCULO ====================
  
  const calcularPesoTotal = useCallback(() => {
    if (!formData.unidad || formData.cantidad <= 0) {
      setFormData(prev => ({ ...prev, peso: 0 }));
      return;
    }

    let pesoCalculado = 0;

    // Prioridad 1: Si el usuario ingresó peso unitario manualmente
    if (formData.pesoUnitario > 0) {
      pesoCalculado = formData.cantidad * formData.pesoUnitario;
    }
    // Prioridad 2: Si hay variante seleccionada, usar su peso
    else if (varianteSeleccionada?.pesoUnitario) {
      pesoCalculado = formData.cantidad * varianteSeleccionada.pesoUnitario;
    }
    // Prioridad 3: Si no hay variante pero hay subcategoría, usar su peso
    else if (subcategoriaSeleccionada) {
      const pesoUnitario = obtenerPesoPorUnidad(subcategoriaSeleccionada, formData.unidad);
      pesoCalculado = formData.cantidad * (pesoUnitario || 0);
    }

    setFormData(prev => ({ ...prev, peso: parseFloat(pesoCalculado.toFixed(3)) }));
  }, [formData.cantidad, formData.unidad, formData.pesoUnitario, varianteSeleccionada, subcategoriaSeleccionada]);

  // Calcular peso automáticamente - SIEMPRE ACTIVO
  useEffect(() => {
    if (formData.cantidad > 0 && formData.unidad) {
      calcularPesoTotal();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.cantidad, formData.unidad, formData.pesoUnitario]);

  // ==================== FUNCIONES HELPER ====================
  
  const obtenerTipoContactoBadge = (contacto: ContactoDepartamento) => {
    const esAmbos = (contacto.isDonateur || contacto.tipo === 'donador') && 
                    (contacto.isFournisseur || contacto.tipo === 'fournisseur');
    const esPRS = contacto.participaPRS;
    
    if (esAmbos) {
      return { label: 'Donateur/Fournisseur', color: '#9333ea', bgColor: '#9333ea20' }; // Púrpura
    } else if (esPRS) {
      return { label: 'PRS', color: '#f59e0b', bgColor: '#f59e0b20' }; // Naranja
    } else if (contacto.isFournisseur || contacto.tipo === 'fournisseur') {
      return { label: 'Fournisseur', color: '#1a4d7a', bgColor: '#1a4d7a20' }; // Azul
    } else {
      return { label: 'Donateur', color: '#2d9561', bgColor: '#2d956120' }; // Verde
    }
  };
  
  // ==================== HANDLERS ====================
  
  const handleFieldChange = useCallback((field: keyof FormDataDonAchat, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // ========== HANDLERS EN CASCADA ==========
  
  const handleCategoriaSelect = useCallback((categoriaId: string) => {
    const categoria = categoriasDB.find(c => c.id === categoriaId);
    if (!categoria) return;

    setFormData(prev => ({
      ...prev,
      categoriaId: categoria.id,
      categoriaNombre: categoria.nombre,
      categoria: categoria.nombre, // Legacy
      subcategoriaId: '',
      subcategoriaNombre: '',
      subcategoria: '', // Legacy
      varianteId: '',
      varianteNombre: '',
      nombreProducto: '',
      productoIcono: categoria.icono || '📦',
    }));

    setComboboxCategoriaOpen(false);
    setSearchCategoriaQuery('');
    toast.success(`Catégorie sélectionnée: ${categoria.nombre}`);
  }, [categoriasDB]);

  const handleSubcategoriaSelect = useCallback((subcategoriaId: string) => {
    const categoria = categoriasDB.find(c => c.id === formData.categoriaId);
    const subcategoria = categoria?.subcategorias?.find(s => s.id === subcategoriaId);
    if (!subcategoria) return;

    // Obtener peso unitario de la subcategoría
    const pesoUnitarioSubcat = subcategoria.pesoUnitario || 0;

    setFormData(prev => ({
      ...prev,
      subcategoriaId: subcategoria.id,
      subcategoriaNombre: subcategoria.nombre,
      subcategoria: subcategoria.nombre, // Legacy
      varianteId: '',
      varianteNombre: '',
      nombreProducto: subcategoria.nombre,
      productoIcono: subcategoria.icono || prev.productoIcono,
      unidad: subcategoria.unidad || '',
      pesoUnitario: pesoUnitarioSubcat,
    }));

    setComboboxSubcategoriaOpen(false);
    setSearchSubcategoriaQuery('');
    toast.success(`Sous-catégorie sélectionnée: ${subcategoria.nombre}`);
  }, [categoriasDB, formData.categoriaId, formData.categoriaNombre]);

  const handleVarianteSelect = useCallback((varianteId: string) => {
    const categoria = categoriasDB.find(c => c.id === formData.categoriaId);
    const subcategoria = categoria?.subcategorias?.find(s => s.id === formData.subcategoriaId);
    const variante = subcategoria?.variantes?.find(v => v.id === varianteId);
    if (!variante) return;

    const nombreVariante = formData.subcategoriaNombre.trim() &&
      formData.subcategoriaNombre.trim().toLowerCase() !== variante.nombre.trim().toLowerCase()
        ? `${formData.subcategoriaNombre} - ${variante.nombre}`
        : variante.nombre;

    // Obtener peso unitario de la variante
    const pesoUnitarioVariante = variante.pesoUnitario || 0;

    setFormData(prev => ({
      ...prev,
      varianteId: variante.id,
      varianteNombre: variante.nombre,
      nombreProducto: nombreVariante,
      productoIcono: variante.icono || prev.productoIcono,
      unidad: variante.unidad || prev.unidad,
      pesoUnitario: pesoUnitarioVariante,
    }));

    setComboboxVarianteOpen(false);
    setSearchVarianteQuery('');
    toast.success(`Variante sélectionnée: ${variante.nombre}`);
  }, [categoriasDB, formData.categoriaId, formData.subcategoriaId, formData.categoriaNombre, formData.subcategoriaNombre]);

  const handleContactoSelect = useCallback((contactoId: string) => {
    const contacto = contactosDisponibles.find(c => c.id === contactoId);
    if (!contacto) return;

    setFormData(prev => ({
      ...prev,
      donadorId: contactoId,
    }));

    setSelectContactoOpen(false);
    toast.success(`Contact sélectionné: ${contacto.nombre} ${contacto.apellido}`);
  }, [contactosDisponibles]);

  const handleCategoriaChange = useCallback((categoriaId: string) => {
    setFormData(prev => ({
      ...prev,
      categoria: categoriaId,
      subcategoria: '',
      varianteId: undefined,
      unidad: '',
    }));
  }, []);

  const handleSubcategoriaChange = useCallback((subcategoriaId: string) => {
    const categoria = categoriasDB.find(c => c.codigo === formData.categoria);
    const subcategoria = categoria?.subcategorias?.find(s => s.codigo === subcategoriaId);

    setFormData(prev => ({
      ...prev,
      subcategoria: subcategoriaId,
      varianteId: undefined,
      unidad: subcategoria?.unidad || prev.unidad,
    }));

    if (formData.cantidad > 0) {
      setTimeout(calcularPesoTotal, 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriasDB, formData.categoria, formData.cantidad]);

  const handleVarianteChange = useCallback((varianteId: string) => {
    setFormData(prev => ({ ...prev, varianteId }));

    if (formData.cantidad > 0) {
      setTimeout(calcularPesoTotal, 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.cantidad]);

  const handleGuardarNuevaVariante = useCallback(() => {
    // Validaciones
    if (!formData.categoriaId) {
      toast.error('Sélectionnez d\'abord une catégorie');
      return;
    }

    if (!formData.subcategoriaId) {
      toast.error('Sélectionnez d\'abord une sous-catégorie');
      return;
    }

    if (!formVariante.nombre.trim()) {
      toast.error('Le nom de la variante est requis');
      return;
    }

    try {
      const varianteCreada = agregarVariante(
        formData.categoriaId,
        formData.subcategoriaId,
        {
          nombre: formVariante.nombre,
          codigo: formVariante.codigo,
          icono: formVariante.icono || '🏷️',
          unidad: formVariante.unidad,
          valorPorKg: formVariante.valorPorKg ? parseFloat(formVariante.valorPorKg) : undefined,
          pesoUnitario: formVariante.pesoUnitario ? parseFloat(formVariante.pesoUnitario) : undefined,
          descripcion: formVariante.descripcion,
        }
      );

      if (varianteCreada) {
        toast.success(`✅ Variante créée: ${varianteCreada.nombre}`);
        
        // Recargar categorías
        const categoriasActualizadas = obtenerCategorias();
        setCategoriasDB(categoriasActualizadas);
        
        // Seleccionar automáticamente la variante recién creada
        const nombreVariante = formData.subcategoriaNombre.trim() &&
          formData.subcategoriaNombre.trim().toLowerCase() !== varianteCreada.nombre.trim().toLowerCase()
            ? `${formData.subcategoriaNombre} - ${varianteCreada.nombre}`
            : varianteCreada.nombre;

        setFormData(prev => ({
          ...prev,
          varianteId: varianteCreada.id,
          varianteNombre: varianteCreada.nombre,
          productoIcono: varianteCreada.icono || prev.productoIcono,
          nombreProducto: nombreVariante,
        }));
        
        // Limpiar formulario y cerrar diálogo
        setFormVariante(FORM_VARIANTE_INICIAL);
        setNuevaVarianteDialogOpen(false);
      } else {
        toast.error('Erreur lors de la création de la variante');
      }
    } catch (error) {
      console.error('Error creando variante:', error);
      toast.error('Erreur lors de la création de la variante');
    }
  }, [formData.categoriaId, formData.subcategoriaId, formData.categoriaNombre, formData.subcategoriaNombre, formVariante]);

  // ========== Función: Guardar Nueva Subcategoría ==========
  const handleGuardarNuevaSubcategoria = useCallback(() => {
    // Validaciones
    if (!formData.categoriaId) {
      toast.error('Sélectionnez d\'abord une catégorie');
      return;
    }

    if (!formSubcategoria.nombre.trim()) {
      toast.error('Le nom de la sous-catégorie est requis');
      return;
    }

    try {
      const subcategoriaCreada = agregarSubcategoria(
        formData.categoriaId,
        {
          nombre: formSubcategoria.nombre,
          icono: formSubcategoria.icono || '📦',
          activa: true,
          unidad: formSubcategoria.unidad,
          pesoUnitario: formSubcategoria.pesoUnitario > 0 ? formSubcategoria.pesoUnitario : undefined,
          pesosUnidad: {
            PLT: formSubcategoria.pesoPLT > 0 ? formSubcategoria.pesoPLT : undefined,
            CJA: formSubcategoria.pesoCJA > 0 ? formSubcategoria.pesoCJA : undefined,
            UND: formSubcategoria.pesoUND > 0 ? formSubcategoria.pesoUND : undefined,
            SAC: formSubcategoria.pesoSAC > 0 ? formSubcategoria.pesoSAC : undefined,
            BN: formSubcategoria.pesoBN > 0 ? formSubcategoria.pesoBN : undefined,
            kg: formSubcategoria.pesoKg > 0 ? formSubcategoria.pesoKg : undefined,
          },
          descripcion: formSubcategoria.descripcion,
          stockMinimo: formSubcategoria.stockMinimo > 0 ? formSubcategoria.stockMinimo : undefined,
        }
      );

      if (subcategoriaCreada) {
        toast.success(`✅ Sous-catégorie créée: ${subcategoriaCreada.nombre}`);
        
        // Recargar categorías
        const categoriasActualizadas = obtenerCategorias();
        setCategoriasDB(categoriasActualizadas);
        
        // Seleccionar automáticamente la subcategoría recién creada
        setFormData(prev => ({
          ...prev,
          subcategoriaId: subcategoriaCreada.id,
          subcategoriaNombre: subcategoriaCreada.nombre,
          varianteId: '',
          varianteNombre: '',
          productoIcono: subcategoriaCreada.icono || prev.productoIcono,
          nombreProducto: subcategoriaCreada.nombre,
        }));
        
        // Limpiar formulario y cerrar diálogo
        setFormSubcategoria(FORM_SUBCATEGORIA_INICIAL);
        setNuevaSubcategoriaDialogOpen(false);
      } else {
        toast.error('Erreur lors de la création de la sous-catégorie');
      }
    } catch (error) {
      console.error('Error creando subcategoría:', error);
      toast.error('Erreur lors de la création de la sous-catégorie');
    }
  }, [formData.categoriaId, formData.categoriaNombre, formSubcategoria]);

  // 🎯 Función: Seleccionar Producto PRS
  const handleSeleccionarProductoPRS = useCallback((producto: ProductoCreado) => {
    console.log('🎯 Producto PRS seleccionado:', producto);
    
    // Buscar la categoría y subcategoría en categoriasDB
    const categoria = categoriasDB.find(c => c.nombre === producto.categoria);
    const subcategoria = categoria?.subcategorias?.find(s => s.nombre === producto.subcategoria);
    
    // Auto-rellenar TODOS los campos desde el producto PRS
    setFormData(prev => ({
      ...prev,
      // IDs y nombres
      categoriaId: categoria?.id || '',
      categoriaNombre: producto.categoria,
      subcategoriaId: subcategoria?.id || '',
      subcategoriaNombre: producto.subcategoria,
      
      // Campos legacy
      categoria: producto.categoria,
      subcategoria: producto.subcategoria,
      productoId: producto.id,
      nombreProducto: producto.nombre,
      productoIcono: producto.icono,
      
      // Unidad y peso
      unidad: producto.unidad,
      pesoUnitario: producto.pesoUnitario || 0,
    }));
    
    // Cerrar el popover y limpiar búsqueda
    setComboboxProductoPRSOpen(false);
    setSearchProductoPRSQuery('');
    
    // Mostrar notificación de éxito
    toast.success('💡 Produit PRS sélectionné - Champs auto-remplis', {
      description: `${producto.categoria} → ${producto.subcategoria} (${producto.unidad})`,
      duration: 3000
    });
  }, [categoriasDB]);

  // Función para imprimir etiqueta de un producto
  const imprimirEtiquetaProducto = useCallback(async (producto: ProductoAgregado) => {
    try {
      const contacto = contactosDisponibles.find(c => c.id === formData.donadorId);
      if (!contacto) {
        console.error('❌ Contacto no encontrado para impresión de etiqueta');
        toast.error("Impossible de trouver le contact pour l'impression");
        return;
      }

      // Construir nombre completo del donador
      // Prioridad: nombreEmpresa > nombre+apellido > nombre > apellido > email
      let nombreCompleto = '';
      if (contacto.nombreEmpresa) {
        nombreCompleto = contacto.nombreEmpresa;
      } else if (contacto.nombre && contacto.apellido) {
        nombreCompleto = `${contacto.nombre} ${contacto.apellido}`.trim();
      } else if (contacto.nombre) {
        nombreCompleto = contacto.nombre;
      } else if (contacto.apellido) {
        nombreCompleto = contacto.apellido;
      } else {
        nombreCompleto = contacto.email || 'Donateur inconnu';
      }

      console.log('📋 Datos del contacto para etiqueta:', {
        id: contacto.id,
        nombreEmpresa: contacto.nombreEmpresa,
        nombre: contacto.nombre,
        apellido: contacto.apellido,
        nombreCompleto,
        tipo: contacto.tipo,
        isDonateur: contacto.isDonateur,
        isFournisseur: contacto.isFournisseur
      });

      // Calcular peso neto (restando tara si existe)
      let pesoNeto = producto.pesoTotal || 0;
      if (producto.pesoUnidad && producto.pesoUnidad > 0 && producto.cantidad) {
        const pesoTaraTotal = producto.pesoUnidad * producto.cantidad;
        pesoNeto = Math.max(0, pesoNeto - pesoTaraTotal);
        console.log(`⚖️ Peso bruto: ${producto.pesoTotal}kg - Tara (${producto.cantidad} × ${producto.pesoUnidad}kg): ${pesoTaraTotal}kg = Peso neto: ${pesoNeto}kg`);
      }

      const labelData: ProductLabelData = {
        id: `PROD-${Date.now()}`,
        nombreProducto: producto.nombreProducto,
        productoIcono: producto.productoIcono,
        categoria: producto.categoria,
        subcategoria: producto.subcategoria,
        cantidad: producto.cantidad,
        unidad: producto.unidad,
        pesoTotal: pesoNeto, // Usar peso neto (sin tara)
        pesoUnidad: producto.pesoUnidad, // Guardar tara para referencia
        temperatura: producto.temperatura as 'ambiente' | 'refrigerado' | 'congelado',
        donadorNombre: nombreCompleto,
        fechaEntrada: new Date().toISOString(),
        lote: producto.lote,
        fechaCaducidad: producto.fechaCaducidad,
        detallesEmpaque: producto.detallesEmpaque,
        systemName: branding.systemName,
        systemLogo: branding.logo,
      };

      console.log('🖨️ Imprimiendo etiqueta con datos:', labelData);

      // Imprimir en modo silencioso (sin diálogo de vista previa)
      await printStandardLabel(labelData, true);
      console.log('✅ Étiquette imprimée');
    } catch (error) {
      console.error('Erreur impression:', error);
      toast.error("Erreur lors de l'impression de l'étiquette");
    }
  }, [formData.donadorId, contactosDisponibles, branding]);

  // Función auxiliar que procesa el guardado real del producto
  const procesarAgregarProducto = useCallback(async () => {

    try {
      const nombreFinal = formData.nombreProducto || formData.productoCustom;
      const iconoFinal = formData.productoIcono || generarIconoAutomatico(formData.categoria);

      // Obtener peso de la unidad (tara) si está registrado
      const unidades = obtenerUnidades();
      const unidadSeleccionada = formData.unidad ? unidades.find(u => 
        u.abreviatura.toUpperCase() === formData.unidad.toUpperCase() ||
        u.nombre.toLowerCase().includes(formData.unidad.toLowerCase())
      ) : undefined;
      const pesoTara = unidadSeleccionada?.pesoUnidad || 0;
      
      if (pesoTara > 0) {
        console.log(`📦 Unidad: ${formData.unidad} - Tara: ${pesoTara}kg`);
      }

      // Verificar si es paleta, benne o bac noir con cantidad > 1
      console.log(`🔍 DEBUG REGISTRO INDIVIDUAL:`);
      console.log(`   - Unidad: "${formData.unidad}"`);
      console.log(`   - Cantidad: ${formData.cantidad}`);
      console.log(`   - Unidad lowercase: "${formData.unidad.toLowerCase()}"`);
      
      const unidadLower = (formData.unidad || '').toLowerCase();
      const unidadUpper = (formData.unidad || '').toUpperCase();
      
      const esPaletaMultiple = (
        unidadUpper === 'PLT' || 
        unidadLower.includes('paleta') ||
        unidadLower.includes('palette')
      ) && formData.cantidad >= 2;
      
      const esBenneMultiple = (
        unidadUpper === 'BN' || 
        unidadUpper === 'BNN-P' ||
        unidadUpper === 'BNN-B' ||
        unidadUpper === 'BP' ||  // Benne Plastique (legacy)
        unidadUpper === 'BB' ||  // Benne Bois (legacy)
        unidadLower.includes('benne') ||
        unidadLower.includes('bac noir') ||
        unidadLower.includes('plastique') ||
        unidadLower.includes('bois')
      ) && formData.cantidad >= 2;
      
      console.log(`   - Es paleta múltiple: ${esPaletaMultiple}`);
      console.log(`   - Es benne múltiple: ${esBenneMultiple}`);
      
      const esUnidadMultipleIndividual = esPaletaMultiple || esBenneMultiple;
      console.log(`   - Registro individual: ${esUnidadMultipleIndividual}`);
      
      if (esUnidadMultipleIndividual) {
        // MODO INDIVIDUAL: Crear una entrada separada para cada unidad (paleta o benne)
        const productosNuevos: ProductoAgregado[] = [];
        
        // Determinar el tipo y nombre de la unidad
        let tipoUnidad = 'Unidad';
        let prefijoLote = 'U';
        if (esPaletaMultiple) {
          tipoUnidad = 'Paleta';
          prefijoLote = 'P';
        } else if (esBenneMultiple) {
          tipoUnidad = 'Benne';
          prefijoLote = 'B';
        }
        
        // 🎯 CORRECCIÓN: Calcular peso unitario (peso por cada paleta/benne)
        const pesoUnitarioIndividual = formData.peso / formData.cantidad;
        
        for (let i = 1; i <= formData.cantidad; i++) {
          const productoIndividual: ProductoAgregado = {
            nombreProducto: `${nombreFinal} - ${tipoUnidad} ${i}/${formData.cantidad}`, // Para etiquetas
            nombreProductoBase: nombreFinal, // 🎯 Nombre base SIN sufijo para inventario
            productoIcono: iconoFinal,
            cantidad: 1,
            unidad: formData.unidad,
            pesoTotal: pesoUnitarioIndividual, // ✅ Peso de UNA unidad (peso total ÷ cantidad)
            pesoUnidad: pesoTara, // Guardar tara
            temperatura: formData.temperatura,
            categoriaId: formData.categoriaId,
            subcategoriaId: formData.subcategoriaId,
            varianteId: formData.varianteId,
            categoria: formData.categoriaNombre || formData.categoria,
            subcategoria: formData.subcategoriaNombre || formData.subcategoria,
            variante: formData.varianteNombre,
            lote: formData.lote ? `${formData.lote}-${prefijoLote}${i}` : `${prefijoLote}${i}`,
            fechaCaducidad: formData.fechaCaducidad,
            detallesEmpaque: formData.detallesEmpaque,
            valorUnitario: formData.valorUnitario || 0,
            valorTotal: (formData.valorUnitario || 0) * 1, // ✅ Una unidad individual = valorUnitario × 1
          };
          
          productosNuevos.push(productoIndividual);
        }
        
        setProductosAgregados(prev => [...prev, ...productosNuevos]);
        
        // Si está activa la impresión automática, imprimir todas las etiquetas
        if (imprimirAutomaticamente) {
          console.log(`🖨️ Imprimiendo ${productosNuevos.length} etiquetas de ${tipoUnidad.toLowerCase()}s...`);
          for (let i = 0; i < productosNuevos.length; i++) {
            console.log(`🖨️ Imprimiendo etiqueta ${i + 1}/${productosNuevos.length}`);
            try {
              await imprimirEtiquetaProducto(productosNuevos[i]);
              // Pequeño delay entre impresiones para evitar problemas
              if (i < productosNuevos.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            } catch (error) {
              console.error(`❌ Error imprimiendo etiqueta ${i + 1}:`, error);
            }
          }
          console.log(`✅ ${productosNuevos.length} etiquetas enviadas a impresión`);
        }
        
        toast.success(`✅ ${formData.cantidad} ${tipoUnidad.toLowerCase()}s ajoutées (enregistrement individuel)`);
      } else {
        // MODO NORMAL: Un solo producto
        const nuevoProducto: ProductoAgregado = {
          productoId: formData.productoId || undefined,
          nombreProducto: nombreFinal,
          productoIcono: iconoFinal,
          cantidad: formData.cantidad,
          unidad: formData.unidad,
          pesoTotal: formData.peso,
          pesoUnidad: pesoTara, // Guardar tara
          temperatura: formData.temperatura,
          categoriaId: formData.categoriaId,
          subcategoriaId: formData.subcategoriaId,
          varianteId: formData.varianteId,
          categoria: formData.categoriaNombre || formData.categoria,
          subcategoria: formData.subcategoriaNombre || formData.subcategoria,
          variante: formData.varianteNombre,
          lote: formData.lote,
          fechaCaducidad: formData.fechaCaducidad,
          detallesEmpaque: formData.detallesEmpaque,
          valorUnitario: formData.valorUnitario || 0,
          valorTotal: (formData.valorUnitario || 0) * formData.cantidad,
        };

        setProductosAgregados(prev => [...prev, nuevoProducto]);

        // Si está activa la impresión automática, imprimir etiqueta
        if (imprimirAutomaticamente) {
          await imprimirEtiquetaProducto(nuevoProducto);
        }
      }

      // Limpiar campos del producto
      setFormData(prev => ({
        ...prev,
        // Resetear sistema en cascada
        categoriaId: '',
        categoriaNombre: '',
        subcategoriaId: '',
        subcategoriaNombre: '',
        varianteId: '',
        varianteNombre: '',
        // Resetear legacy
        productoId: '',
        nombreProducto: '',
        productoCustom: '',
        productoIcono: '',
        categoria: '',
        subcategoria: '',
        cantidad: 0,
        unidad: '',
        peso: 0,
        valorUnitario: 0,
        fechaCaducidad: '',
        lote: '',
        detallesEmpaque: '',
        observaciones: '',
      }));

      toast.success(`✅ Produit ajouté: ${nombreFinal}`);
    } catch (error) {
      console.error('Error agregando producto:', error);
      toast.error("Erreur lors de l'ajout du produit");
    }
  }, [formData, imprimirAutomaticamente, imprimirEtiquetaProducto]);

  // Función que confirma y procede con el guardado
  const confirmarYAgregar = useCallback(() => {
    setDialogConfirmacion(false);
    procesarAgregarProducto();
  }, [procesarAgregarProducto]);

  // Función principal que valida y decide si mostrar el diálogo de confirmación
  const agregarProductoALista = useCallback(async () => {
    // Validaciones básicas
    if (!formData.tipoEntrada) {
      toast.error("Sélectionnez un type d'entrée");
      return;
    }

    if (!formData.donadorId) {
      toast.error("Sélectionnez un donateur/fournisseur");
      return;
    }

    // Validar que al menos tenga categoría y subcategoría
    if (!formData.categoriaId || !formData.categoriaNombre) {
      toast.error("Sélectionnez une catégorie");
      return;
    }

    if (!formData.subcategoriaId || !formData.subcategoriaNombre) {
      toast.error("Sélectionnez une sous-catégorie");
      return;
    }

    if (formData.cantidad <= 0) {
      toast.error("La quantité doit être supérieure à 0");
      return;
    }

    if (!formData.unidad) {
      toast.error("L'unité est requise");
      return;
    }

    if (!formData.temperatura) {
      toast.error("La température est requise");
      return;
    }

    // ⚠️ VERIFICAR CAMPOS OPCIONALES IMPORTANTES: Fecha de Caducidad y Número de Lote
    const faltaFechaCaducidad = !formData.fechaCaducidad || formData.fechaCaducidad.trim() === '';
    const faltaLote = !formData.lote || formData.lote.trim() === '';
    
    // 🐛 DEBUG: Mostrar valores de los campos
    console.log('🔍 VALORES DE CAMPOS OPCIONALES:', {
      fechaCaducidad: formData.fechaCaducidad,
      lote: formData.lote,
      faltaFechaCaducidad,
      faltaLote
    });
    
    if (faltaFechaCaducidad || faltaLote) {
      console.log('🔔 Mostrando alerta de campos faltantes:', { faltaFechaCaducidad, faltaLote });
      // Mostrar diálogo de confirmación
      setDialogConfirmacion(true);
      console.log('🔔 dialogConfirmacion establecido a true');
      return;
    }

    // Si llegamos aquí, todos los campos opcionales están completos, proceder normalmente
    await procesarAgregarProducto();
  }, [formData, procesarAgregarProducto]);

  const finalizarEntrada = useCallback(async () => {
    if (productosAgregados.length === 0) {
      toast.error("Ajoutez au moins un produit avant de finaliser");
      return;
    }

    try {
      const contacto = contactosDisponibles.find(c => c.id === formData.donadorId);
      if (!contacto) {
        toast.error("Contact introuvable");
        return;
      }

      // 🎯 PROTECCIÓN CONTRA VALORES UNDEFINED
      // Construir nombre completo del donador
      let nombreCompleto = 'Sans nom';
      try {
        if (contacto?.nombreEmpresa && String(contacto.nombreEmpresa).trim()) {
          nombreCompleto = String(contacto.nombreEmpresa).trim();
        } else if (contacto?.nombre && contacto?.apellido) {
          const nombre = String(contacto.nombre || '').trim();
          const apellido = String(contacto.apellido || '').trim();
          if (nombre && apellido) {
            nombreCompleto = `${nombre} ${apellido}`;
          } else if (nombre) {
            nombreCompleto = nombre;
          } else if (apellido) {
            nombreCompleto = apellido;
          }
        } else if (contacto?.nombre) {
          nombreCompleto = String(contacto.nombre).trim();
        } else if (contacto?.apellido) {
          nombreCompleto = String(contacto.apellido).trim();
        }
      } catch (error) {
        console.error('Error construyendo nombre del contacto:', error);
        nombreCompleto = 'Sans nom';
      }

      // Obtener información del programa
      const programa = programaSeleccionado;
      const programaNombre = programa?.nombre || 'Don';
      const programaCodigo = programa?.codigo?.toUpperCase() || 'DON';
      const programaColor = programa?.color || '#2d9561';
      const programaIcono = programa?.icono || '🎁';

      console.log(`📝 Finalizando entrada de ${productosAgregados.length} producto(s)...`);

      // Guardar cada producto agregado como una entrada separada
      // CADA entrada en productosAgregados genera:
      // 1. Una entrada en el historial (localStorage entradas_inventario)
      // 2. Un producto nuevo o actualización de stock (localStorage productos)
      // 3. Un movimiento de inventario (localStorage movimientos)
      let entradasRegistradas = 0;
      for (const prod of productosAgregados) {
        // 🎯 CORRECCIÓN: Calcular peso unitario NETO (restando tara si existe)
        // prod.pesoTotal = peso bruto total (ej: 200kg para 1 paleta)
        // prod.pesoUnidad = tara por unidad (ej: 30kg por paleta)
        // prod.cantidad = número de unidades (ej: 1 paleta)
        
        // Paso 1: Calcular peso NETO total (restar tara total)
        const taraTotalProducto = (prod.pesoUnidad || 0) * prod.cantidad;
        const pesoNetoTotal = prod.pesoTotal - taraTotalProducto;
        
        // Paso 2: Calcular peso unitario NETO
        const pesoUnitarioEntrante = prod.cantidad > 0 ? pesoNetoTotal / prod.cantidad : 0;
        
        console.log(`📝 Registrando entrada ${entradasRegistradas + 1}/${productosAgregados.length}: ${prod.nombreProducto}`);
        console.log(`   ⚖️ Peso bruto: ${prod.pesoTotal}kg - Tara (${prod.cantidad} × ${prod.pesoUnidad || 0}kg): ${taraTotalProducto}kg = Peso neto: ${pesoNetoTotal}kg`);
        console.log(`   📊 Peso unitario neto: ${pesoUnitarioEntrante}kg`);
        
        // 🎯 USAR NOMBRE BASE para inventario (sin sufijo "Paleta 1/2")
        // Esto permite que productos con mismo nombre, peso y unidad se SUMEN
        const nombreParaInventario = prod.nombreProductoBase || prod.nombreProducto;
        console.log(`   📝 Nombre para inventario: ${nombreParaInventario}`);
        
        // 📝 Registrar entrada en historial
        // ⚠️ IMPORTANTE: guardarEntrada() se encarga de:
        // - Crear/actualizar el producto en localStorage
        // - Registrar el movimiento de inventario
        // - Guardar la entrada en el historial
        // NO es necesario hacer registro manual adicional
        guardarEntrada({
          fecha: new Date().toISOString(),
          tipoEntrada: formData.tipoEntrada,
          programaNombre: programaNombre,
          programaCodigo: programaCodigo,
          programaColor: programaColor,
          programaIcono: programaIcono,
          donadorId: formData.donadorId,
          donadorNombre: nombreCompleto,
          donadorEsCustom: false,
          productoId: prod.productoId || `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Temporal, se actualizará automáticamente
          nombreProducto: nombreParaInventario, // 🎯 Usar nombre base sin sufijo
          productoIcono: prod.productoIcono,
          categoria: prod.categoria || '',
          subcategoria: prod.subcategoria || '',
          varianteId: prod.varianteId,
          variante: prod.variante ? {
            id: prod.varianteId || '',
            nombre: prod.variante,
          } : undefined,
          cantidad: prod.cantidad,
          unidad: prod.unidad,
          pesoUnidad: pesoUnitarioEntrante,
          pesoTotal: prod.pesoTotal,
          temperatura: (prod.temperatura as any) || 'ambiente',
          lote: prod.lote,
          fechaCaducidad: prod.fechaCaducidad,
          detallesEmpaque: prod.detallesEmpaque,
          observaciones: formData.observaciones,
          valorUnitario: prod.valorUnitario || 0,
          valorTotal: prod.valorTotal || 0,
        });
        
        entradasRegistradas++;
      }

      console.log(`✅ ${entradasRegistradas} entrada(s) registrada(s) exitosamente`);

      // 📊 Mensaje de éxito
      toast.success(`✅ ${entradasRegistradas} entrée(s) enregistrée(s)!`, {
        duration: 4000
      });
      
      // Disparar evento de actualización
      window.dispatchEvent(new Event('productos-actualizados'));

      // Resetear formulario y cerrar ventana
      setFormData(FORM_DATA_INICIAL);
      setProductosAgregados([]);
      
      // ✅ Cerrar la ventana inmediatamente después de finalizar
      handleOpenChange(false);
    } catch (error) {
      console.error('Error finalizando entrada:', error);
      toast.error("Erreur lors de la finalisation de l'entrée");
    }
  }, [handleOpenChange, productosAgregados, formData, contactosDisponibles, programaSeleccionado]);

  const eliminarProductoAgregado = useCallback((index: number) => {
    setProductosAgregados(prev => prev.filter((_, i) => i !== index));
    toast.info('Produit retiré de la liste');
  }, []);

  // ==================== RENDER ====================
  
  const getTemperatureIcon = (temp: string) => {
    switch (temp) {
      case 'ambiente': return <Wind className="w-4 h-4" />;
      case 'refrigerado': return <Thermometer className="w-4 h-4" />;
      case 'congelado': return <Snowflake className="w-4 h-4" />;
      default: return null;
    }
  };

  const getTemperatureColor = (temp: string) => {
    switch (temp) {
      case 'ambiente': return 'bg-amber-100 text-amber-700';
      case 'refrigerado': return 'bg-blue-100 text-blue-700';
      case 'congelado': return 'bg-cyan-100 text-cyan-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const contactoSeleccionado = formData.donadorId
    ? contactosDisponibles.find(contacto => contacto.id === formData.donadorId)
    : undefined;
  const checkpointsCompletados = [
    Boolean(formData.tipoEntrada),
    Boolean(formData.donadorId),
    Boolean(formData.nombreProducto),
    formData.cantidad > 0,
    Boolean(formData.unidad),
    Boolean(formData.temperatura),
  ].filter(Boolean).length;
  const progressionFormulaire = Math.round((checkpointsCompletados / 6) * 100);
  const totalPesoNetoAgregado = productosAgregados.reduce((sum, producto) => {
    const pesoTaraTotal = producto.pesoUnidad && producto.pesoUnidad > 0
      ? producto.pesoUnidad * producto.cantidad
      : 0;
    const pesoNeto = pesoTaraTotal > 0
      ? Math.max(0, producto.pesoTotal - pesoTaraTotal)
      : producto.pesoTotal;
    return sum + pesoNeto;
  }, 0);
  const totalMonetarioAgregado = productosAgregados.reduce((sum, producto) => sum + (producto.valorTotal || 0), 0);
  const poidsEstimeCourant = formData.cantidad > 0 && formData.pesoUnitario > 0
    ? formData.cantidad * formData.pesoUnitario
    : formData.peso || 0;
  const etiquetteTemperature = formData.temperatura === 'ambiente'
    ? 'Ambiante'
    : formData.temperatura === 'refrigerado'
      ? 'Réfrigéré'
      : formData.temperatura === 'congelado'
        ? 'Congelé'
        : 'À définir';
    const comboboxTriggerClass = 'min-h-[54px] w-full justify-between rounded-2xl border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.92)_100%)] px-4 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.45)] transition-all hover:border-slate-300';
    const floatingPanelClass = 'rounded-[24px] border border-slate-200/90 bg-white/98 p-0 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.38)] backdrop-blur-sm';
    const selectTriggerClass = 'mt-2 min-h-[54px] rounded-2xl border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.92)_100%)] px-4 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.35)]';
    const selectContentClass = 'rounded-[24px] border border-slate-200/90 bg-white/98 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.38)] backdrop-blur-sm';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button 
            className="bg-[#2d9561] hover:bg-[#267d50] text-white shadow-md"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Registrer Entrée
          </Button>
        </DialogTrigger>
      )}
      
      <DialogContent className="w-[min(96vw,1320px)] max-w-[1320px] max-h-[92vh] overflow-hidden border-0 bg-white/98 p-0 shadow-[0_36px_90px_-42px_rgba(15,23,42,0.55)]" aria-describedby="entry-form-description">
        <div className="flex max-h-[92vh] flex-col overflow-hidden rounded-[28px] bg-white">
          <DialogHeader className="relative overflow-hidden border-b border-slate-200/80 px-5 py-4 sm:px-6">
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, rgba(26,77,122,0.10) 0%, rgba(45,149,97,0.08) 55%, rgba(255,255,255,0.96) 100%)'
              }}
            />
            <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1a4d7a] text-white shadow-lg shadow-[#1a4d7a]/20">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-left text-[1.3rem] font-bold tracking-tight text-slate-900 sm:text-[1.38rem]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Registrer Entrée
                  </DialogTitle>
                  <DialogDescription id="entry-form-description" className="mt-0.5 max-w-2xl text-[0.95rem] leading-6 text-slate-600">
                    Sélectionnez le type d'entrée, ajoutez les produits et finalisez l'enregistrement dans une interface plus large et plus claire.
                  </DialogDescription>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Inventaire
                </div>
                <div className="rounded-full border border-[#2d9561]/20 bg-[#2d9561]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2d9561]">
                  Saisie guidée
                </div>
                <div className="rounded-full border border-[#1a4d7a]/15 bg-[#1a4d7a]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1a4d7a]">
                  Progression {progressionFormulaire}%
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-7 sm:py-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)] lg:items-start xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(145deg,#ffffff_0%,#f8fbfd_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.38)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Programme</p>
                    <p className="mt-2 text-lg font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {programaSeleccionado?.nombre || 'À sélectionner'}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {programaSeleccionado?.descripcion || 'Choisissez un flux d’entrée pour adapter le formulaire.'}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(145deg,#ffffff_0%,#f7fbf8_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.38)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Contact</p>
                    <p className="mt-2 text-lg font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {contactoSeleccionado?.nombreEmpresa || (contactoSeleccionado ? `${contactoSeleccionado.nombre} ${contactoSeleccionado.apellido}` : 'Aucun contact')}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {contactoSeleccionado?.telefono || contactoSeleccionado?.email || 'La fiche du contact s’affiche ici dès la sélection.'}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(145deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.38)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Lot en préparation</p>
                    <p className="mt-2 text-lg font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {productosAgregados.length} produit{productosAgregados.length > 1 ? 's' : ''}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatQuantity(totalPesoNetoAgregado)} kg net • {totalMonetarioAgregado > 0 ? `CAD$ ${formatMoney(totalMonetarioAgregado)}` : 'Valeur non renseignée'}
                    </p>
                  </div>
                </div>
          {/* SECTION 1: Type d'entrée - DINÁMICO desde configuración */}
          <div className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 shadow-[0_18px_40px_-36px_rgba(15,23,42,0.45)]">
            <Label className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Type d'Entrée *
            </Label>
            
            {programasActivos.length === 0 ? (
              <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Aucun programme d'entrée configuré</p>
                  <p className="text-sm">Créez des programmes d'entrée dans Configuration</p>
                </div>
              </div>
            ) : (
              <div className={cn(
                "grid gap-3",
                programasActivos.length === 1 ? "grid-cols-1" :
                programasActivos.length === 2 ? "grid-cols-2" :
                programasActivos.length === 3 ? "grid-cols-3" :
                "grid-cols-2 lg:grid-cols-3"
              )}>
                {programasActivos.map((programa) => (
                  <button
                    key={programa.id}
                    type="button"
                    onClick={() => handleFieldChange('tipoEntrada', programa.codigo.toLowerCase())}
                    className={cn(
                      "rounded-2xl border px-3 py-3 transition-all hover:shadow-sm text-left",
                      formData.tipoEntrada === programa.codigo.toLowerCase()
                        ? "border-current bg-opacity-10"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                    style={{
                      borderColor: formData.tipoEntrada === programa.codigo.toLowerCase() ? programa.color : undefined,
                      backgroundColor: formData.tipoEntrada === programa.codigo.toLowerCase() ? `${programa.color}10` : undefined
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{programa.icono || '📦'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{programa.nombre}</p>
                        <p className="text-xs text-gray-500 truncate">{programa.descripcion}</p>
                      </div>
                      {formData.tipoEntrada === programa.codigo.toLowerCase() && (
                        <Check className="w-5 h-5 flex-shrink-0" style={{ color: programa.color }} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {formData.tipoEntrada && (
            <>
              {/* SECTION 2: Contact (Donateur/Fournisseur) */}
              <div className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 shadow-[0_18px_40px_-36px_rgba(15,23,42,0.45)]">
                <Label className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {formData.tipoEntrada === 'achat' ? '📦 Fournisseur *' : 
                   formData.tipoEntrada === 'prs' ? '🚚 Participant PRS *' :
                   formData.tipoEntrada === 'occ' ? '🔄 Donateur/Fournisseur *' : 
                   '🎁 Donateur *'}
                </Label>
                
                <Popover open={selectContactoOpen} onOpenChange={setSelectContactoOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={selectContactoOpen}
                      className={comboboxTriggerClass}
                    >
                      {formData.donadorId ? (
                        <div className="flex-1 text-left">
                          {(() => {
                            const contacto = contactosDisponibles.find(c => c.id === formData.donadorId);
                            if (!contacto) return <span className="text-gray-500">Contact introuvable</span>;
                            
                            return (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-slate-900">
                                    {contacto.nombreEmpresa || `${contacto.nombre} ${contacto.apellido}`}
                                  </span>
                                  {(() => {
                                    const tipoBadge = obtenerTipoContactoBadge(contacto);
                                    return (
                                      <Badge 
                                        variant="secondary" 
                                        className="text-xs"
                                        style={{
                                          backgroundColor: tipoBadge.bgColor,
                                          color: tipoBadge.color
                                        }}
                                      >
                                        {tipoBadge.label}
                                      </Badge>
                                    );
                                  })()}
                                </div>
                                {contacto.nombreEmpresa && (
                                  <div className="text-sm text-gray-600">
                                    👤 {contacto.nombre} {contacto.apellido}
                                  </div>
                                )}
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  {contacto.telefono && (
                                    <span>📞 {contacto.telefono}</span>
                                  )}
                                  {contacto.email && (
                                    <span>📧 {contacto.email}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <span className="text-gray-500">
                          {formData.tipoEntrada === 'achat' 
                            ? 'Sélectionner un fournisseur...' 
                            : formData.tipoEntrada === 'prs'
                            ? 'Sélectionner un participant PRS...'
                            : formData.tipoEntrada === 'occ'
                            ? 'Sélectionner un donateur/fournisseur...'
                            : 'Sélectionner un donateur...'}
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className={`w-[min(92vw,560px)] ${floatingPanelClass}`}>
                    <Command>
                      <CommandInput
                        placeholder="Rechercher par nom, entreprise, téléphone, email..."
                        value={searchContactoQuery}
                        onValueChange={setSearchContactoQuery}
                      />
                      <CommandEmpty>Aucun contact trouvé</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {contactosFiltrados.map((contacto) => (
                            <CommandItem
                              key={contacto.id}
                              value={contacto.id}
                              onSelect={() => handleContactoSelect(contacto.id)}
                              className="py-2.5"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 flex-shrink-0",
                                  formData.donadorId === contacto.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-sm text-slate-900">
                                    {contacto.nombreEmpresa || `${contacto.nombre} ${contacto.apellido}`}
                                  </p>
                                  {(() => {
                                    const tipoBadge = obtenerTipoContactoBadge(contacto);
                                    return (
                                      <Badge 
                                        variant="secondary" 
                                        className="text-xs flex-shrink-0"
                                        style={{
                                          backgroundColor: tipoBadge.bgColor,
                                          color: tipoBadge.color
                                        }}
                                      >
                                        {tipoBadge.label}
                                      </Badge>
                                    );
                                  })()}
                                </div>
                                
                                {contacto.nombreEmpresa && (
                                  <p className="text-sm text-gray-600 mb-1">
                                    👤 {contacto.nombre} {contacto.apellido}
                                  </p>
                                )}
                                
                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                                  {contacto.telefono && (
                                    <span className="flex items-center gap-1">
                                      📞 {contacto.telefono}
                                    </span>
                                  )}
                                  {contacto.email && (
                                    <span className="flex items-center gap-1 truncate">
                                      📧 {contacto.email}
                                    </span>
                                  )}
                                  {contacto.direccion && (
                                    <span className="flex items-center gap-1 truncate">
                                      📍 {contacto.direccion}
                                    </span>
                                  )}
                                </div>
                                
                                {contacto.notas && (
                                  <p className="text-xs text-gray-400 mt-1 italic truncate">
                                    💬 {contacto.notas}
                                  </p>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {contactosDisponibles.length === 0 && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                    <AlertTriangle className="w-4 h-4" />
                    <p>
                      Aucun {formData.tipoEntrada === 'achat' ? 'fournisseur' : 
                              formData.tipoEntrada === 'prs' ? 'participant PRS' :
                              formData.tipoEntrada === 'occ' ? 'donateur/fournisseur' :
                              'donateur'} trouvé. 
                      Créez-en un dans Contacts.
                    </p>
                  </div>
                )}
              </div>

              {/* SECTION 3: Sélection Produit en Cascada */}
              <div className="space-y-4 rounded-[24px] border border-slate-200 bg-[linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.92)_100%)] p-4 shadow-[0_18px_40px_-36px_rgba(15,23,42,0.45)]">
                <div className="flex flex-col gap-3 rounded-[22px] border border-slate-200 bg-white/90 p-4 shadow-[0_18px_32px_-30px_rgba(15,23,42,0.28)] lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <Label className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      📦 Sélection du produit *
                    </Label>
                    <p className="mt-2 max-w-2xl text-sm text-slate-500">
                      Configurez le produit avec un parcours plus lisible: sélection, paramètres logistiques et validation avant ajout au lot.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:max-w-[280px] lg:justify-end">
                    <Badge className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 hover:bg-slate-100">
                      {formData.nombreProducto ? 'Produit prêt' : 'Sélection requise'}
                    </Badge>
                    <Badge className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 hover:bg-emerald-50">
                      {formatQuantity(poidsEstimeCourant)} kg estimés
                    </Badge>
                  </div>
                </div>

                <div>
                  <div className="space-y-4">
                {/* 🎯 SI ES TIPO PRS: Mostrar selector de productos PRS */}
                {formData.tipoEntrada === 'prs' && (
                  <div className="space-y-3 rounded-[22px] border border-violet-200 bg-[linear-gradient(145deg,#fcfaff_0%,#f7f1ff_100%)] p-4 shadow-[0_14px_30px_-28px_rgba(91,33,182,0.35)]">
                    <div className="flex items-center gap-2">
                      <Label>⚡ Produit PRS *</Label>
                      <Badge variant="destructive" className="text-xs animate-pulse">
                        OBLIGATOIRE
                      </Badge>
                    </div>
                    
                    <Popover open={comboboxProductoPRSOpen} onOpenChange={setComboboxProductoPRSOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={comboboxProductoPRSOpen}
                          className={cn(
                            comboboxTriggerClass,
                            formData.categoriaNombre 
                              ? "border-purple-500 bg-purple-50 hover:bg-purple-100" 
                              : "border-purple-400 border-2"
                          )}
                        >
                          {formData.categoriaNombre ? (
                            <span className="flex items-center gap-2">
                              <span>{formData.productoIcono}</span>
                              <span className="font-medium">{formData.nombreProducto}</span>
                            </span>
                          ) : (
                            <span className="text-purple-600 font-medium">🔍 Sélectionner un produit PRS...</span>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className={`w-[min(92vw,560px)] ${floatingPanelClass}`}>
                        <Command>
                          <CommandInput
                            placeholder="🔍 Rechercher un produit PRS..."
                            value={searchProductoPRSQuery}
                            onValueChange={setSearchProductoPRSQuery}
                          />
                          <CommandEmpty>Aucun produit PRS trouvé</CommandEmpty>
                          <CommandList className="max-h-[400px]">
                            <CommandGroup heading={`${productosFiltrados.length} produits PRS disponibles`}>
                              {productosFiltrados.map((producto) => (
                                <CommandItem
                                  key={producto.id}
                                  value={producto.id}
                                  onSelect={() => handleSeleccionarProductoPRS(producto)}
                                  className="cursor-pointer"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.productoId === producto.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <span className="mr-2 text-lg">{producto.icono}</span>
                                  <div className="flex-1">
                                    <p className="font-medium">{producto.nombre}</p>
                                    <p className="text-xs text-gray-500">
                                      {producto.categoria} → {producto.subcategoria}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      {producto.unidad}
                                    </Badge>
                                    {producto.pesoUnitario && (
                                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                        {formatQuantity(producto.pesoUnitario)} kg
                                      </Badge>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    
                    {productosFiltrados.length === 0 && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border-2 border-red-300 rounded-lg text-sm text-red-800">
                        <AlertTriangle className="w-4 h-4" />
                        <p>
                          Aucun produit PRS disponible. Créez-en un dans <strong>Inventaire → Productos PRS</strong>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {formData.tipoEntrada !== 'prs' && (
                  /* MODO NORMAL: Cascada Categoría → Subcategoría → Variante */
                  <div className="space-y-4">
                    {/* PASO 1: Catégorie */}
                    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-26px_rgba(15,23,42,0.35)]">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                      <Label>1️⃣ Catégorie *</Label>
                          <p className="mt-1 text-xs text-slate-500">Définissez la famille principale du produit.</p>
                        </div>
                        <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                          Étape 1
                        </Badge>
                      </div>
                      <Popover open={comboboxCategoriaOpen} onOpenChange={setComboboxCategoriaOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={comboboxCategoriaOpen}
                            className={comboboxTriggerClass}
                          >
                            {formData.categoriaNombre ? (
                              <span className="flex items-center gap-2">
                                <span>{formData.productoIcono}</span>
                                <span>{formData.categoriaNombre}</span>
                              </span>
                            ) : (
                              <span className="text-gray-500">Sélectionner une catégorie...</span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                    <PopoverContent className={`w-[min(92vw,460px)] ${floatingPanelClass}`}>
                      <Command>
                        <CommandInput
                          placeholder="Rechercher une catégorie..."
                          value={searchCategoriaQuery}
                          onValueChange={setSearchCategoriaQuery}
                        />
                        <CommandEmpty>Aucune catégorie trouvée</CommandEmpty>
                        <CommandList className="max-h-[300px]">
                          <CommandGroup>
                            {categoriasFiltradas.map((categoria) => (
                              <CommandItem
                                key={categoria.id}
                                value={categoria.id}
                                onSelect={() => handleCategoriaSelect(categoria.id)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.categoriaId === categoria.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <span className="mr-2">{categoria.icono}</span>
                                <div className="flex-1">
                                  <p className="font-medium">{categoria.nombre}</p>
                                  <p className="text-xs text-gray-500">
                                    {categoria.subcategorias?.length || 0} sous-catégories
                                  </p>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                    </div>

                {/* PASO 2: Sous-catégorie */}
                <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-26px_rgba(15,23,42,0.35)]">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Label>2️⃣ Sous-catégorie *</Label>
                      <p className="mt-1 text-xs text-slate-500">Affinez le produit dans une ligne plus précise.</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Obtener el ícono de la categoría seleccionada
                        const categoriaSeleccionada = categoriasDB.find(c => c.id === formData.categoriaId);
                        const iconoCategoria = categoriaSeleccionada?.icono || '📦';
                        
                        // Inicializar formulario con el ícono de la categoría
                        setFormSubcategoria({
                          ...FORM_SUBCATEGORIA_INICIAL,
                          icono: iconoCategoria
                        });
                        
                        setNuevaSubcategoriaDialogOpen(true);
                      }}
                      disabled={!formData.categoriaId}
                      className="h-7 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Créer sous-catégorie
                    </Button>
                  </div>
                  <Popover 
                    open={comboboxSubcategoriaOpen} 
                    onOpenChange={setComboboxSubcategoriaOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={comboboxSubcategoriaOpen}
                        className={comboboxTriggerClass}
                        disabled={!formData.categoriaId}
                      >
                        {formData.subcategoriaNombre ? (
                          <span className="flex items-center gap-2">
                            <span>{subcategoriaSeleccionada?.icono || formData.productoIcono || '📦'}</span>
                            <span>{formData.subcategoriaNombre}</span>
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            {formData.categoriaId 
                              ? 'Sélectionner une sous-catégorie...' 
                              : 'Sélectionner d\'abord une catégorie'}
                          </span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className={`w-[min(92vw,440px)] ${floatingPanelClass}`}>
                      <Command>
                        <CommandInput
                          placeholder="Rechercher une sous-catégorie..."
                          value={searchSubcategoriaQuery}
                          onValueChange={setSearchSubcategoriaQuery}
                        />
                        <CommandEmpty>Aucune sous-catégorie trouvée</CommandEmpty>
                        <CommandList className="max-h-[300px]">
                          <CommandGroup>
                            {subcategoriasDisponibles.map((subcategoria) => (
                              <CommandItem
                                key={subcategoria.id}
                                value={subcategoria.id}
                                onSelect={() => handleSubcategoriaSelect(subcategoria.id)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.subcategoriaId === subcategoria.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <span className="mr-2">{subcategoria.icono || '📦'}</span>
                                <div className="flex-1">
                                  <p className="font-medium">{subcategoria.nombre}</p>
                                  {subcategoria.variantes && subcategoria.variantes.length > 0 && (
                                    <p className="text-xs text-gray-500">
                                      {subcategoria.variantes.length} variantes
                                    </p>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* PASO 3: Variante (opcional) */}
                {formData.subcategoriaId && (
                  <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-26px_rgba(15,23,42,0.35)]">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Label>3️⃣ Variante (optionnel)</Label>
                        <p className="mt-1 text-xs text-slate-500">Ajoutez une déclinaison seulement si elle apporte une différence utile.</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Copiar nombre de subcategoría por defecto
                          setFormVariante({
                            ...FORM_VARIANTE_INICIAL,
                            nombre: formData.subcategoriaNombre || ''
                          });
                          setNuevaVarianteDialogOpen(true);
                        }}
                        disabled={!formData.subcategoriaId}
                        className="h-7 text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Créer variante
                      </Button>
                    </div>
                    {variantesDisponibles.length > 0 ? (
                      <Popover 
                        open={comboboxVarianteOpen} 
                        onOpenChange={setComboboxVarianteOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={comboboxVarianteOpen}
                            className={comboboxTriggerClass}
                          >
                            {formData.varianteNombre ? (
                              <span className="flex items-center gap-2">
                                <span>{varianteSeleccionada?.icono || subcategoriaSeleccionada?.icono || formData.productoIcono || '🏷️'}</span>
                                <span>{formData.varianteNombre}</span>
                              </span>
                            ) : (
                              <span className="text-gray-500">
                                Sélectionner une variante...
                              </span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                      <PopoverContent className={`w-[min(92vw,460px)] ${floatingPanelClass}`}>
                        <Command>
                          <CommandInput
                            placeholder="Rechercher une variante..."
                            value={searchVarianteQuery}
                            onValueChange={setSearchVarianteQuery}
                          />
                          <CommandEmpty>Aucune variante trouvée</CommandEmpty>
                          <CommandList className="max-h-[300px]">
                            <CommandGroup>
                              {variantesDisponibles.map((variante) => (
                                <CommandItem
                                  key={variante.id}
                                  value={variante.id}
                                  onSelect={() => handleVarianteSelect(variante.id)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.varianteId === variante.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <span className="mr-2">{variante.icono || '🏷️'}</span>
                                  <div className="flex-1">
                                    <p className="font-medium">{variante.nombre}</p>
                                    {variante.descripcion && (
                                      <p className="text-xs text-gray-500">{variante.descripcion}</p>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    ) : (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                        <p className="flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          Aucune variante pour cette sous-catégorie. Cliquez sur "Créer variante" pour en ajouter une.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                  </div>
                )}

                {/* Resumen del producto seleccionado */}
                {formData.nombreProducto && (
                  <div className="rounded-[22px] border border-emerald-200 bg-[linear-gradient(145deg,#ffffff_0%,#f2fbf5_100%)] p-4 shadow-[0_14px_30px_-28px_rgba(16,185,129,0.35)]">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-lg">
                        {formData.productoIcono || '📦'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Produit sélectionné</p>
                        <p className="mt-1 truncate text-base font-semibold text-slate-900">{formData.nombreProducto}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {formData.categoriaNombre || 'Catégorie à définir'}
                          {formData.subcategoriaNombre ? ` • ${formData.subcategoriaNombre}` : ''}
                          {formData.varianteNombre ? ` • ${formData.varianteNombre}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mensaje si no hay categorías disponibles */}
                {categoriasDB.length === 0 && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                    <AlertTriangle className="w-4 h-4" />
                    <p>
                      Aucune catégorie trouvée dans le système. Veuillez d'abord créer des catégories dans Configuration → Catégories.
                    </p>
                  </div>
                )}

                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
                  <div className="space-y-4">

                {/* Campos de cantidad y unidad */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-26px_rgba(15,23,42,0.35)]">
                    <Label>Quantité *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.cantidad || ''}
                      onChange={(e) => handleFieldChange('cantidad', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="mt-2 rounded-2xl border-slate-200 bg-slate-50/60"
                    />
                  </div>
                  <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-26px_rgba(15,23,42,0.35)]">
                    <Label>Unité *</Label>
                    <Select value={formData.unidad} onValueChange={(value) => handleFieldChange('unidad', value)}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent className={selectContentClass}>
                        {unidades.map((unidad) => (
                          <SelectItem key={unidad.id} value={unidad.abreviatura}>
                            {unidad.nombre} ({unidad.abreviatura})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                {/* Peso Unitario */}
                <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-26px_rgba(15,23,42,0.35)]">
                  <Label>Poids Unitaire (kg/unité)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.pesoUnitario || ''}
                    onChange={(e) => handleFieldChange('pesoUnitario', Math.round(parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    className="mt-2 rounded-2xl border-slate-200 bg-slate-50/60"
                  />
                  {formData.pesoUnitario > 0 && formData.cantidad > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Poids estimé: {formatQuantity(formData.pesoUnitario * formData.cantidad)} kg
                    </p>
                  )}
                </div>

                {/* Peso */}
                <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-26px_rgba(15,23,42,0.35)]">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Poids Total (kg)</Label>
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                      ✓ Calcul automatique
                    </Badge>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.peso ? formatQuantity(formData.peso) : ''}
                    onChange={(e) => handleFieldChange('peso', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="rounded-2xl border-slate-200 bg-gray-50"
                    readOnly
                  />
                  
                  {/* Desglose de peso con tara */}
                  {(() => {
                    const unidades = obtenerUnidades();
                    const unidadSeleccionada = formData.unidad ? unidades.find(u => 
                      u.abreviatura.toUpperCase() === formData.unidad.toUpperCase() ||
                      u.nombre.toLowerCase().includes(formData.unidad.toLowerCase())
                    ) : undefined;
                    const pesoTara = unidadSeleccionada?.pesoUnidad || 0;
                    const pesoBruto = formData.peso || 0;
                    const cantidad = formData.cantidad || 1;
                    const pesoTaraTotal = pesoTara * cantidad;
                    const pesoNeto = pesoTara > 0 ? Math.max(0, pesoBruto - pesoTaraTotal) : pesoBruto;

                    if (pesoTara > 0 && pesoBruto > 0) {
                      return (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-2 mb-2">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-blue-800">
                              <p className="font-semibold mb-1">📊 Décomposition du poids:</p>
                            </div>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center py-1">
                              <span className="text-gray-700">📦 Poids brut (avec {formData.unidad}):</span>
                              <span className="font-semibold text-gray-900">{formatQuantity(pesoBruto)} kg</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-t border-blue-200">
                              <span className="text-gray-700">⚖️ Poids de l'unité (tare):</span>
                              <span className="font-semibold text-red-600">- {formatQuantity(pesoTaraTotal)} kg{cantidad > 1 ? ` (${formatQuantity(pesoTara)} × ${formatQuantity(cantidad)})` : ''}</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-t-2 border-blue-300 bg-green-50 -mx-3 px-3 rounded">
                              <span className="text-green-800 font-semibold">✓ Poids net (imprimé):</span>
                              <span className="font-bold text-green-700 text-sm">{formatQuantity(pesoNeto)} kg</span>
                            </div>
                          </div>
                          <p className="text-xs text-blue-700 mt-2 italic">
                            💡 L'étiquette imprimée affichera le poids net ({formatQuantity(pesoNeto)} kg)
                          </p>
                        </div>
                      );
                    }
                    
                    return (
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Se calcule automatiquement: Quantité × Poids unitaire
                      </p>
                    );
                  })()}
                </div>
                </div>

                {/* Temperatura */}
                <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-26px_rgba(15,23,42,0.35)]">
                  <Label>Température *</Label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleFieldChange('temperatura', 'ambiente')}
                      className={cn(
                        "rounded-2xl border px-3 py-2.5 transition-all",
                        formData.temperatura === 'ambiente'
                          ? "border-amber-500 bg-amber-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <Wind className="w-5 h-5 mx-auto text-amber-600" />
                      <p className="text-xs mt-1">Ambiante</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('temperatura', 'refrigerado')}
                      className={cn(
                        "rounded-2xl border px-3 py-2.5 transition-all",
                        formData.temperatura === 'refrigerado'
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <Thermometer className="w-5 h-5 mx-auto text-blue-600" />
                      <p className="text-xs mt-1">Réfrigéré</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('temperatura', 'congelado')}
                      className={cn(
                        "rounded-2xl border px-3 py-2.5 transition-all",
                        formData.temperatura === 'congelado'
                          ? "border-cyan-500 bg-cyan-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <Snowflake className="w-5 h-5 mx-auto text-cyan-600" />
                      <p className="text-xs mt-1">Congelé</p>
                    </button>
                  </div>
                </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[22px] border border-slate-200 bg-[linear-gradient(145deg,#f8fbfd_0%,#ffffff_100%)] p-4 shadow-[0_12px_28px_-26px_rgba(15,23,42,0.35)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Cockpit produit</p>
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
                          <span className="text-sm text-slate-500">Statut</span>
                          <span className="text-sm font-semibold text-slate-900">{formData.nombreProducto ? 'Configuré' : 'En attente'}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
                          <span className="text-sm text-slate-500">Quantité</span>
                          <span className="text-sm font-semibold text-slate-900">{formData.cantidad > 0 ? `${formatQuantity(formData.cantidad)} ${formData.unidad || ''}`.trim() : 'Non définie'}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
                          <span className="text-sm text-slate-500">Poids estimé</span>
                          <span className="text-sm font-semibold text-slate-900">{formatQuantity(poidsEstimeCourant)} kg</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
                          <span className="text-sm text-slate-500">Température</span>
                          <span className="text-sm font-semibold text-slate-900">{etiquetteTemperature}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-26px_rgba(15,23,42,0.35)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Conseil opérateur</p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        Utilisez la catégorie et la sous-catégorie pour standardiser les données. Réservez les variantes aux différences réellement utiles pour l’étiquetage ou le suivi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              </div>

              {/* SECTION 4: Detalles opcionales */}
              <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-3 shadow-[0_14px_30px_-28px_rgba(15,23,42,0.4)]">
                <button
                  type="button"
                  onClick={() => setDetallesOpcionalesAbiertos(!detallesOpcionalesAbiertos)}
                  className="flex w-full items-center justify-between text-left text-sm font-semibold text-slate-800"
                >
                  <span>Détails Optionnels</span>
                  {detallesOpcionalesAbiertos ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {detallesOpcionalesAbiertos && (
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <Label>Numéro de Lot</Label>
                        <Input
                          value={formData.lote}
                          onChange={(e) => handleFieldChange('lote', e.target.value)}
                          placeholder="LOT-12345"
                        />
                      </div>
                      <div>
                        <Label>Date d'Expiration</Label>
                        <Input
                          type="date"
                          value={formData.fechaCaducidad}
                          onChange={(e) => handleFieldChange('fechaCaducidad', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Détails d'Empaquetage</Label>
                      <Input
                        value={formData.detallesEmpaque}
                        onChange={(e) => handleFieldChange('detallesEmpaque', e.target.value)}
                        placeholder="Ex: 24x500ml, 12x1kg, etc."
                      />
                    </div>

                    <div>
                      <Label>Observations</Label>
                      <Textarea
                        value={formData.observaciones}
                        onChange={(e) => handleFieldChange('observaciones', e.target.value)}
                        placeholder="Notes supplémentaires..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 5: Botones de acción */}
              <div className="flex flex-col gap-3 pt-1 md:flex-row md:items-center">
                <Button
                  onClick={agregarProductoALista}
                  className="flex-1 rounded-2xl bg-[#2d9561] shadow-sm hover:bg-[#267d50]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter Produit
                </Button>
                
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <Checkbox
                    id="imprimirAuto"
                    checked={imprimirAutomaticamente}
                    onCheckedChange={(checked) => setImprimirAutomaticamente(checked as boolean)}
                  />
                  <label htmlFor="imprimirAuto" className="text-sm cursor-pointer flex items-center gap-1">
                    <Printer className="w-4 h-4" />
                    Imprimer auto
                  </label>
                </div>
              </div>

              {/* SECTION 6: Lista de productos agregados */}
              {productosAgregados.length > 0 && (
                <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_18px_36px_-34px_rgba(15,23,42,0.45)]">
                  {/* Información del contacto seleccionado */}
                  {formData.donadorId && (
                    <div className="mb-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-green-50 p-3">
                      {(() => {
                        const contacto = contactosDisponibles.find(c => c.id === formData.donadorId);
                        const programa = programasActivos.find(p => p.codigo.toLowerCase() === formData.tipoEntrada);
                        if (!contacto) return null;
                        
                        return (
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">{programa?.icono || '📦'}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-[#1a4d7a] text-base">
                                  {contacto.nombreEmpresa || `${contacto.nombre} ${contacto.apellido}`}
                                </span>
                                <Badge 
                                  style={{
                                    backgroundColor: programa?.color + '20',
                                    color: programa?.color
                                  }}
                                  className="text-xs"
                                >
                                  {programa?.nombre}
                                </Badge>
                              </div>
                              {contacto.nombreEmpresa && (
                                <p className="text-sm text-gray-700">👤 {contacto.nombre} {contacto.apellido}</p>
                              )}
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 mt-1">
                                {contacto.telefono && <span>📞 {contacto.telefono}</span>}
                                {contacto.email && <span>📧 {contacto.email}</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Produits Ajoutés ({productosAgregados.length})
                    </h3>
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        {formatQuantity(productosAgregados.reduce((sum, p) => {
                          const pesoNeto = p.pesoUnidad && p.pesoUnidad > 0 
                            ? Math.max(0, p.pesoTotal - p.pesoUnidad)
                            : p.pesoTotal;
                          return sum + pesoNeto;
                        }, 0))} kg net total
                      </Badge>
                      {(() => {
                        const totalMonetario = productosAgregados.reduce((sum, p) => sum + (p.valorTotal || 0), 0);
                        if (totalMonetario > 0) {
                          return (
                            <Badge className="bg-green-600 text-white">
                              💰 CAD$ {formatMoney(totalMonetario)}
                            </Badge>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>

                  <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
                    {productosAgregados.map((producto, index) => {
                      const pesoTaraTotal = (producto.pesoUnidad && producto.pesoUnidad > 0) 
                        ? producto.pesoUnidad * producto.cantidad 
                        : 0;
                      const pesoNeto = pesoTaraTotal > 0
                        ? Math.max(0, producto.pesoTotal - pesoTaraTotal)
                        : producto.pesoTotal;
                      const tieneTara = producto.pesoUnidad && producto.pesoUnidad > 0;

                      return (
                        <div key={index} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
                          <span className="text-2xl">{producto.productoIcono}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{producto.nombreProducto}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{formatQuantity(producto.cantidad)} {producto.unidad}</span>
                              <span>•</span>
                              {tieneTara ? (
                                <span className="flex items-center gap-1" title={`Brut: ${formatQuantity(producto.pesoTotal)}kg - Tare: ${formatQuantity(pesoTaraTotal)}kg (${formatQuantity(producto.pesoUnidad)}kg × ${formatQuantity(producto.cantidad)}) = Net: ${formatQuantity(pesoNeto)}kg`}>
                                  <span className="font-semibold text-green-700">{formatQuantity(pesoNeto)} kg</span>
                                  <span className="text-xs text-gray-400">(net)</span>
                                </span>
                              ) : (
                                <span>{formatQuantity(producto.pesoTotal)} kg</span>
                              )}
                              <span>•</span>
                              <Badge className={cn("text-xs", getTemperatureColor(producto.temperatura))}>
                                {getTemperatureIcon(producto.temperatura)}
                                <span className="ml-1">
                                  {producto.temperatura === 'ambiente' ? 'AMB' :
                                   producto.temperatura === 'refrigerado' ? 'RÉF' : 'CONG'}
                                </span>
                              </Badge>
                              {producto.valorTotal && producto.valorTotal > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="font-semibold text-green-700">
                                    CAD$ {formatMoney(producto.valorTotal)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => imprimirEtiquetaProducto(producto)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Réimprimer l'étiquette"
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => eliminarProductoAgregado(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFormData(FORM_DATA_INICIAL);
                        setProductosAgregados([]);
                        handleOpenChange(false);
                      }}
                      size="lg"
                      className="rounded-2xl"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Annuler
                    </Button>
                    <Button
                      onClick={finalizarEntrada}
                      className="flex-1 rounded-2xl bg-[#1a4d7a] shadow-sm hover:bg-[#153d62]"
                      size="lg"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Finaliser l'Entrée ({productosAgregados.length} produits)
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
              </div>

              <aside className="space-y-4 lg:sticky lg:top-0">
                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_22px_50px_-38px_rgba(15,23,42,0.45)]">
                  <div className="border-b border-slate-200 bg-[linear-gradient(135deg,rgba(26,77,122,0.08),rgba(45,149,97,0.08))] px-5 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Résumé en direct</p>
                    <h3 className="mt-1 text-lg font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Nouvelle entrée
                    </h3>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#1a4d7a_0%,#2d9561_100%)] transition-all"
                        style={{ width: `${progressionFormulaire}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{checkpointsCompletados}/6 repères complétés</p>
                  </div>

                  <div className="space-y-4 px-5 py-4 text-sm text-slate-700">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Programme</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Gift className="h-4 w-4 text-[#2d9561]" />
                        <span className="font-medium text-slate-900">{programaSeleccionado?.nombre || 'Non sélectionné'}</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Contact</p>
                      <div className="mt-2 flex items-start gap-2">
                        <Building2 className="mt-0.5 h-4 w-4 text-[#1a4d7a]" />
                        <div>
                          <p className="font-medium text-slate-900">
                            {contactoSeleccionado?.nombreEmpresa || (contactoSeleccionado ? `${contactoSeleccionado.nombre} ${contactoSeleccionado.apellido}` : 'À sélectionner')}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {contactoSeleccionado?.telefono || contactoSeleccionado?.email || 'Choisissez un donateur, fournisseur ou participant PRS.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Produit courant</p>
                      <div className="mt-2 flex items-start gap-2">
                        <Package2 className="mt-0.5 h-4 w-4 text-[#1a4d7a]" />
                        <div>
                          <p className="font-medium text-slate-900">{formData.nombreProducto || 'Aucun produit sélectionné'}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formData.cantidad > 0 && formData.unidad
                              ? `${formatQuantity(formData.cantidad)} ${formData.unidad} • ${formatQuantity(formData.peso || 0)} kg`
                              : 'Sélectionnez la catégorie, la quantité et l’unité.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-slate-200 bg-white p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Température</p>
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                          {getTemperatureIcon(formData.temperatura)}
                          <span>{etiquetteTemperature}</span>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Impression</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{imprimirAutomaticamente ? 'Automatique' : 'Manuelle'}</p>
                        <p className="mt-1 text-xs text-slate-500">Réimpression disponible après ajout.</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Validation finale</p>
                      <p className="mt-2 text-sm text-slate-700">
                        Ajoutez un ou plusieurs produits, puis finalisez l’entrée pour enregistrer le lot dans l’inventaire.
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <Save className="h-4 w-4" />
                        <span>Le résumé se met à jour en temps réel.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
        </div>

        {/* Botón de Cancelar - Siempre visible cuando no hay productos */}
        {productosAgregados.length === 0 && (
          <div className="border-t px-6 py-4 bg-gray-50 flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setFormData(FORM_DATA_INICIAL);
                setProductosAgregados([]);
                handleOpenChange(false);
              }}
              className="px-6"
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
          </div>
        )}
      </div>
      </DialogContent>

      {/* DIÁLOGO: Crear Nueva Variante */}
      <Dialog open={nuevaVarianteDialogOpen} onOpenChange={setNuevaVarianteDialogOpen}>
        <DialogContent className="w-[min(96vw,1100px)] max-w-[1100px] max-h-[92vh] overflow-hidden p-0" aria-describedby="new-variant-description">
          <DialogHeader className="border-b px-6 py-5 pb-4">
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
              🏷️ Créer une Nouvelle Variante
            </DialogTitle>
            <DialogDescription id="new-variant-description">
              Créer une nouvelle variante pour la sous-catégorie "{formData.subcategoriaNombre}"
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 overflow-y-auto px-6 py-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Catégorie:</strong> {formData.categoriaNombre}
                  {' → '}
                  <strong>Sous-catégorie:</strong> {formData.subcategoriaNombre}
                </p>
              </div>

              <div>
                <Label>Nom de la variante *</Label>
                <Input
                  value={formVariante.nombre}
                  onChange={(e) => setFormVariante(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ex. : grande, 500 ml, marque A, biologique..."
                />
              </div>

              <div>
                <Label>Code (optionnel)</Label>
                <Input
                  value={formVariante.codigo}
                  onChange={(e) => setFormVariante(prev => ({ ...prev, codigo: e.target.value }))}
                  placeholder="VAR-001"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label>Unité (optionnel)</Label>
                  <Select 
                    value={formVariante.unidad} 
                    onValueChange={(value) => setFormVariante(prev => ({ ...prev, unidad: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Hérite de la sous-catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {unidades.map((unidad) => (
                        <SelectItem key={unidad.id} value={unidad.abreviatura}>
                          {unidad.nombre} ({unidad.abreviatura})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!formVariante.unidad && subcategoriaSeleccionada?.unidad && (
                    <p className="text-xs text-gray-500 mt-1">
                      Par défaut: {subcategoriaSeleccionada.unidad}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Poids Unitaire (kg) (optionnel)</Label>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    value={formVariante.pesoUnitario}
                    onChange={(e) => setFormVariante(prev => ({ ...prev, pesoUnitario: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label>Valeur par Kg (CAD$) (optionnel)</Label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  value={formVariante.valorPorKg}
                  onChange={(e) => setFormVariante(prev => ({ ...prev, valorPorKg: e.target.value }))}
                  placeholder="0"
                />
              </div>

              <div>
                <Label>Description (optionnel)</Label>
                <Textarea
                  value={formVariante.descripcion}
                  onChange={(e) => setFormVariante(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Description de la variante..."
                  rows={4}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border bg-[#FAFBFC] p-3">
                <IconSelector
                  value={formVariante.icono}
                  onChange={(icono) => setFormVariante(prev => ({ ...prev, icono }))}
                  label="Icône de la variante"
                  gridCols={10}
                  maxHeight="max-h-36"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t px-6 py-4 bg-white">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormVariante(FORM_VARIANTE_INICIAL);
                setNuevaVarianteDialogOpen(false);
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleGuardarNuevaVariante}
              className="bg-[#2d9561] hover:bg-[#267d50]"
            >
              <Save className="w-4 h-4 mr-2" />
              Créer Variante
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO: Crear Nueva Subcategoría */}
      <Dialog open={nuevaSubcategoriaDialogOpen} onOpenChange={setNuevaSubcategoriaDialogOpen}>
        <DialogContent className="w-[min(96vw,1180px)] max-w-[1180px] max-h-[92vh] overflow-hidden p-0" aria-describedby="new-subcategory-description">
          <DialogHeader className="border-b px-6 py-5 pb-4">
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
              📦 Créer une Nouvelle Sous-catégorie
            </DialogTitle>
            <DialogDescription id="new-subcategory-description">
              Créer une nouvelle sous-catégorie pour la catégorie "{formData.categoriaNombre}"
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 overflow-y-auto px-6 py-5 xl:grid-cols-[minmax(0,1fr)_minmax(420px,1.05fr)]">
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Catégorie:</strong> {formData.categoriaNombre}
                </p>
              </div>

              <div>
                <Label>Nom de la sous-catégorie *</Label>
                <Input
                  value={formSubcategoria.nombre}
                  onChange={(e) => setFormSubcategoria(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ex: Pain Blanc, Lait 2%, Pommes..."
                />
              </div>

              <div>
                <Label>Code (optionnel)</Label>
                <Input
                  value={formSubcategoria.codigo}
                  onChange={(e) => setFormSubcategoria(prev => ({ ...prev, codigo: e.target.value }))}
                  placeholder="SUBCAT-001"
                />
              </div>

              <div>
                <Label>Unité par défaut (optionnel)</Label>
                <Select 
                  value={formSubcategoria.unidad} 
                  onValueChange={(value) => setFormSubcategoria(prev => ({ ...prev, unidad: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une unité..." />
                  </SelectTrigger>
                  <SelectContent>
                    {unidades.map((unidad) => (
                      <SelectItem key={unidad.id} value={unidad.abreviatura}>
                        {unidad.nombre} ({unidad.abreviatura})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="peso-unitario-input" className="font-semibold">⚖️ Poids unitaire (kg) - Optionnel</Label>
                <Input
                  id="peso-unitario-input"
                  type="number"
                  step="1"
                  min="0"
                  value={formSubcategoria.pesoUnitario || ''}
                  onChange={(e) => setFormSubcategoria(prev => ({ ...prev, pesoUnitario: Math.round(parseFloat(e.target.value) || 0) }))}
                  placeholder="0"
                  className="border-2 border-blue-300 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Poids moyen d'une unité de ce produit (exemple: 0.500 kg pour une boîte de 500g)
                </p>
              </div>

              <div>
                <Label>Poids Unitaire Héritage (kg) (optionnel)</Label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  value={formSubcategoria.pesoUnitario || ''}
                  onChange={(e) => setFormSubcategoria(prev => ({ ...prev, pesoUnitario: Math.round(parseFloat(e.target.value) || 0) }))}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maintenu pour compatibilité. Utilisez les poids par unité ci-dessous.
                </p>
              </div>

              <div>
                <Label>Stock Minimum (optionnel)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formSubcategoria.stockMinimo || ''}
                  onChange={(e) => setFormSubcategoria(prev => ({ ...prev, stockMinimo: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>

              <div>
                <Label>Description (optionnel)</Label>
                <Textarea
                  value={formSubcategoria.descripcion}
                  onChange={(e) => setFormSubcategoria(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Description de la sous-catégorie..."
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border bg-[#FAFBFC] p-3">
                <IconSelector
                  value={formSubcategoria.icono}
                  onChange={(icono) => setFormSubcategoria(prev => ({ ...prev, icono }))}
                  label="Icône de la sous-catégorie"
                  gridCols={10}
                  maxHeight="max-h-36"
                />
              </div>

              <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                <Label className="text-sm font-semibold">Poids par unité (kg) - Optionnel</Label>
                <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Palette (PLT)</Label>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    value={formSubcategoria.pesoPLT || ''}
                    onChange={(e) => setFormSubcategoria(prev => ({ ...prev, pesoPLT: Math.round(parseFloat(e.target.value) || 0) }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="text-xs">Boîte (CJA)</Label>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    value={formSubcategoria.pesoCJA || ''}
                    onChange={(e) => setFormSubcategoria(prev => ({ ...prev, pesoCJA: Math.round(parseFloat(e.target.value) || 0) }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="text-xs">Unité (UND)</Label>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    value={formSubcategoria.pesoUND || ''}
                    onChange={(e) => setFormSubcategoria(prev => ({ ...prev, pesoUND: Math.round(parseFloat(e.target.value) || 0) }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="text-xs">Sac (SAC)</Label>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    value={formSubcategoria.pesoSAC || ''}
                    onChange={(e) => setFormSubcategoria(prev => ({ ...prev, pesoSAC: Math.round(parseFloat(e.target.value) || 0) }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="text-xs">Bac Noir (BN)</Label>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    value={formSubcategoria.pesoBN || ''}
                    onChange={(e) => setFormSubcategoria(prev => ({ ...prev, pesoBN: Math.round(parseFloat(e.target.value) || 0) }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="text-xs">Kilogramme (kg)</Label>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    value={formSubcategoria.pesoKg || ''}
                    onChange={(e) => setFormSubcategoria(prev => ({ ...prev, pesoKg: Math.round(parseFloat(e.target.value) || 0) }))}
                    placeholder="1"
                  />
                </div>
              </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t bg-white px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormSubcategoria(FORM_SUBCATEGORIA_INICIAL);
                setNuevaSubcategoriaDialogOpen(false);
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleGuardarNuevaSubcategoria}
              className="bg-[#2d9561] hover:bg-[#267d50]"
            >
              <Save className="w-4 h-4 mr-2" />
              Créer Sous-catégorie
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmación - Recordatorio de Campos Opcionales */}
      {dialogConfirmacion && console.log('🎨 Renderizando diálogo de confirmación')}
      <Dialog open={dialogConfirmacion} onOpenChange={setDialogConfirmacion} modal>
        <DialogContent 
          className="max-w-lg bg-gradient-to-br from-amber-50 via-white to-orange-50 border-2 border-amber-200" 
          aria-describedby="confirmacion-campos-description"
          style={{ zIndex: 9999 }}
        >
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl flex items-center gap-4" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl ring-4 ring-amber-100">
                <span className="text-3xl">⚠️</span>
              </div>
              <div>
                <span className="text-amber-900">Rappel Important</span>
                <p className="text-sm text-amber-700 font-normal mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Champs optionnels non remplis
                </p>
              </div>
            </DialogTitle>
            <DialogDescription id="confirmacion-campos-description" className="sr-only">
              Confirmación para continuar sin fecha de caducidad o número de lote
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-4">
            {/* Mensaje principal */}
            <div className="bg-white rounded-xl p-5 border-2 border-amber-200 shadow-md">
              <p className="text-base text-gray-800 mb-4" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}>
                Les champs suivants sont <span className="font-bold text-amber-700">très importants</span> mais n'ont pas été remplis :
              </p>
              
              <div className="space-y-3">
                {(!formData.fechaCaducidad || formData.fechaCaducidad.trim() === '') && (
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-lg">📅</span>
                    </div>
                    <div>
                      <p className="font-semibold text-amber-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Date d'expiration
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Essentiel pour la gestion des stocks et la sécurité alimentaire
                      </p>
                    </div>
                  </div>
                )}
                
                {(!formData.lote || formData.lote.trim() === '') && (
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-lg">🏷️</span>
                    </div>
                    <div>
                      <p className="font-semibold text-orange-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Numéro de lot
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Important pour la traçabilité et le contrôle qualité
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pregunta de confirmación */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
              <p className="text-center text-base font-semibold text-gray-800" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Voulez-vous continuer sans remplir ces champs ?
              </p>
              <p className="text-center text-sm text-gray-600 mt-2">
                Vous pourrez les ajouter plus tard depuis l'inventaire
              </p>
            </div>

            {/* Botones de confirmación */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setDialogConfirmacion(false)}
                variant="outline"
                className="flex-1 h-11 border-2 border-gray-300 hover:bg-gray-50"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button
                type="button"
                onClick={confirmarYAgregar}
                className="flex-1 h-11 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}
              >
                <Check className="w-4 h-4 mr-2" />
                Continuer Quand Même
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}