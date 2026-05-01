import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PackagePlus, Save, X, Plus, Scale } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { guardarEntrada } from '../utils/entradaInventarioStorage';
import { obtenerCategorias, agregarSubcategoria, obtenerPesoUnitario, actualizarPesoUnitarioSubcategoria, obtenerDatosSubcategoria } from '../utils/categoriaStorage';
import { obtenerProgramasActivos, type ProgramaEntrada } from '../utils/programaEntradaStorage';
import { obtenerContactosPorDepartamentoYTipo, obtenerIdDepartamentoEntrepot, type ContactoDepartamento } from '../utils/contactosDepartamentoStorage';
import { obtenerProductos, type ProductoCreado } from '../utils/productStorage';
import type { Categoria, Subcategoria } from '../data/configuracionData';
import { generarIconoAutomatico } from '../utils/iconoUtils';
import { useBalanceContext } from '../../contexts/BalanceContext';
import { formatLargeNumber, formatMoney, formatQuantity } from '../utils/formatUtils';
import { registrarActividad } from '../utils/actividadLogger';

const contactoCumpleTipoEntrada = (contacto: ContactoDepartamento, tipoPermitido: 'donador' | 'fournisseur' | null) => {
  if (!tipoPermitido) {
    return true;
  }

  if (tipoPermitido === 'donador') {
    return contacto.isDonateur === true || contacto.tipo === 'donador';
  }

  return contacto.isFournisseur === true || contacto.tipo === 'fournisseur';
};

const obtenerTipoPrincipalContacto = (contacto: ContactoDepartamento, tipoPreferido: 'donador' | 'fournisseur' | null) => {
  if (tipoPreferido && contactoCumpleTipoEntrada(contacto, tipoPreferido)) {
    return tipoPreferido;
  }

  if (contacto.isFournisseur || contacto.tipo === 'fournisseur') {
    return 'fournisseur';
  }

  return 'donador';
};

type FormularioEntradaProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FormEntrada = {
  // Información básica
  tipoEntrada: string;
  donadorId: string;
  
  // Producto
  categoria: string;
  subcategoria: string;
  
  // Cantidades
  cantidad: number;
  unidad: string;
  peso: number;
  
  // Valor monetario
  valorUnitario?: number; // Valor por unidad en CAD$
  valorTotal?: number; // Valor total calculado (cantidad × valorUnitario)
  
  // Detalles adicionales
  temperatura: 'ambiente' | 'refrigerado' | 'congelado' | '';
  fechaCaducidad: string;
  lote: string;
  observaciones: string;
};

const unidades = [
  { id: '1', nombre: 'Paleta', abreviatura: 'PLT' },
  { id: '2', nombre: 'Caja', abreviatura: 'CJA' },
  { id: '3', nombre: 'Unidad', abreviatura: 'UND' },
  { id: '4', nombre: 'Saco', abreviatura: 'SAC' },
  { id: '5', nombre: 'Bac Noir', abreviatura: 'BN' },
  { id: '6', nombre: 'Kilogramo', abreviatura: 'kg' },
];

export function FormularioEntrada({ open, onOpenChange }: FormularioEntradaProps) {
  const { t } = useTranslation();
  const departamentoEntrepotId = obtenerIdDepartamentoEntrepot();
  
  // Hook de balanza desde context
  const { isConnected, currentWeight } = useBalanceContext();
  
  // Estados
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [programas, setProgramas] = useState<ProgramaEntrada[]>([]);
  const [contactos, setContactos] = useState<ContactoDepartamento[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [productosPRS, setProductosPRS] = useState<ProductoCreado[]>([]);
  const [busquedaPRS, setBusquedaPRS] = useState('');
  const [dialogSubcategoria, setDialogSubcategoria] = useState(false);
  const [dialogConfirmacion, setDialogConfirmacion] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState<'guardar' | 'guardarYAgregar' | null>(null);
  const [nuevaSubcategoria, setNuevaSubcategoria] = useState({
    nombre: '',
    icono: '',
    unidad: '',
    pesoUnitario: 0,
    descripcion: ''
  });
  
  // Estado para datos heredados de la subcategoría
  const [datosHeredados, setDatosHeredados] = useState<{
    unidad?: string;
    pesoUnitario?: number;
    icono?: string;
    descripcion?: string;
  } | null>(null);
  
  const [formData, setFormData] = useState<FormEntrada>({
    tipoEntrada: '',
    donadorId: '',
    categoria: '',
    subcategoria: '',
    cantidad: 0,
    unidad: '',
    peso: 0,
    valorUnitario: 0,
    valorTotal: 0,
    temperatura: '',
    fechaCaducidad: '',
    lote: '',
    observaciones: ''
  });

  // Monitorear el estado del diálogo de confirmación
  useEffect(() => {
    console.log('📊 Estado dialogConfirmacion:', dialogConfirmacion);
  }, [dialogConfirmacion]);

  // Cargar datos iniciales
  useEffect(() => {
    if (open) {
      const cats = obtenerCategorias();
      const progs = obtenerProgramasActivos();
      
      // 🎯 OBTENER CONTACTOS REALES: donadores y fournisseurs del departamento Entrepôt
      const contactosEntrepot = obtenerContactosPorDepartamentoYTipo(departamentoEntrepotId, ['donador', 'fournisseur']);
      
      // 🎯 OBTENER PRODUCTOS PRS (productos con esPRS: true)
      let todosProductos = obtenerProductos();
      
      // 🔧 MIGRACIÓN: Asegurar que los productos PRS tengan esPRS=true
      let productosActualizados = false;
      const productosMigrados = todosProductos.map(producto => {
        // Si el producto tiene 'PRS' en el nombre o códigos conocidos de PRS
        if ((producto.nombre.includes('PRS') || producto.categoria.includes('PRS') || 
             producto.codigo === 'FL' || producto.codigo === 'PC' || producto.codigo === 'PL' || 
             producto.codigo === 'PV' || producto.codigo === 'VS') && producto.esPRS !== true) {
          console.log(`🔧 Migrando producto PRS: ${producto.nombre} (${producto.codigo})`);
          productosActualizados = true;
          return { ...producto, esPRS: true };
        }
        return producto;
      });
      
      // Si hubo cambios, guardar en localStorage
      if (productosActualizados) {
        console.log('✅ Productos PRS migrados correctamente');
        localStorage.setItem('productosCreados', JSON.stringify(productosMigrados));
        todosProductos = productosMigrados;
        window.dispatchEvent(new Event('productos-actualizados'));
      }
      
      console.log('🔍 DEBUG - Todos los productos:', todosProductos.length, todosProductos);
      console.log('🔍 DEBUG - Productos con esPRS:', todosProductos.map(p => ({ 
        nombre: p.nombre, 
        esPRS: p.esPRS,
        tipo: typeof p.esPRS
      })));
      
      const productosPRSFiltrados = todosProductos.filter(p => {
        const esPRS = p.esPRS === true;
        console.log(`🔍 Producto "${p.nombre}": esPRS=${p.esPRS} (tipo: ${typeof p.esPRS}), incluir: ${esPRS}`);
        return esPRS;
      });
      
      setCategorias(cats.filter(c => c.activa));
      setProgramas(progs);
      setContactos(contactosEntrepot);
      setProductosPRS(productosPRSFiltrados);
      
      console.log('📋 Contactos cargados:', contactosEntrepot.length, contactosEntrepot);
      console.log('📦 Productos PRS cargados:', productosPRSFiltrados.length, productosPRSFiltrados);
      console.log('⚠️ Si no hay productos PRS, necesitas crear productos con esPRS=true en el módulo Inventario');
    }
  }, [departamentoEntrepotId, open]);

  // 🔄 Escuchar cambios en contactos y productos (cuando se agregan/editan desde otros módulos)
  useEffect(() => {
    const handleContactosActualizados = () => {
      const contactosActualizados = obtenerContactosPorDepartamentoYTipo(departamentoEntrepotId, ['donador', 'fournisseur']);
      setContactos(contactosActualizados);
      console.log('🔄 Contactos actualizados automáticamente:', contactosActualizados.length);
    };

    const handleCategoriasActualizadas = () => {
      const categoriasActualizadas = obtenerCategorias();
      setCategorias(categoriasActualizadas.filter(c => c.activa));
      console.log('🔄 Categorías actualizadas automáticamente:', categoriasActualizadas.length);
    };

    const handleProductosActualizados = () => {
      const todosProductos = obtenerProductos();
      const productosPRSFiltrados = todosProductos.filter(p => p.esPRS === true);
      setProductosPRS(productosPRSFiltrados);
      console.log('🔄 Productos PRS actualizados automáticamente:', productosPRSFiltrados.length, productosPRSFiltrados);
    };

    window.addEventListener('contactos-actualizados', handleContactosActualizados);
    window.addEventListener('contactos-restaurados', handleContactosActualizados);
    window.addEventListener('categorias-actualizadas', handleCategoriasActualizadas);
    window.addEventListener('productos-actualizados', handleProductosActualizados);
    window.addEventListener('producto-creado', handleProductosActualizados);

    return () => {
      window.removeEventListener('contactos-actualizados', handleContactosActualizados);
      window.removeEventListener('contactos-restaurados', handleContactosActualizados);
      window.removeEventListener('categorias-actualizadas', handleCategoriasActualizadas);
      window.removeEventListener('productos-actualizados', handleProductosActualizados);
      window.removeEventListener('producto-creado', handleProductosActualizados);
    };
  }, [departamentoEntrepotId]);

  // Limpiar donadorId cuando cambia el tipo de entrada y el contacto seleccionado ya no es válido
  useEffect(() => {
    if (formData.tipoEntrada && formData.donadorId) {
      const contactoSeleccionado = contactos.find(c => c.id === formData.donadorId);
      
      // Si el contacto seleccionado no es del tipo permitido, limpiarlo
      if (contactoSeleccionado) {
        const tipoPermitido = 
          formData.tipoEntrada.toLowerCase() === 'ach' || formData.tipoEntrada.toLowerCase() === 'achat'
            ? 'fournisseur'
            : formData.tipoEntrada.toLowerCase() === 'don'
              ? 'donador'
              : null;
        
        if (tipoPermitido && !contactoCumpleTipoEntrada(contactoSeleccionado, tipoPermitido)) {
          const nombreContacto = contactoSeleccionado.nombreEmpresa || `${contactoSeleccionado.nombre} ${contactoSeleccionado.apellido}`;
          const tipoPrincipalContacto = obtenerTipoPrincipalContacto(contactoSeleccionado, null);
          const tipoContactoTexto = tipoPrincipalContacto === 'donador' ? 'donateur' : 'fournisseur';
          const tipoRequeridoTexto = tipoPermitido === 'donador' ? 'donateur' : 'fournisseur';
          
          toast.info(
            `🔄 "${nombreContacto}" est un ${tipoContactoTexto}. Veuillez sélectionner un ${tipoRequeridoTexto} pour ce type d'entrée.`,
            { duration: 4000 }
          );
          
          setFormData(prev => ({ ...prev, donadorId: '' }));
        }
      }
    }
  }, [formData.tipoEntrada, formData.donadorId, contactos]);

  // Cuando cambia la categoría, actualizar subcategorías y limpiar datos heredados
  useEffect(() => {
    if (formData.categoria) {
      const categoriaSeleccionada = categorias.find(c => c.nombre === formData.categoria);
      if (categoriaSeleccionada && categoriaSeleccionada.subcategorias) {
        setSubcategorias(categoriaSeleccionada.subcategorias.filter(s => s.activa));
      } else {
        setSubcategorias([]);
      }
      setFormData(prev => ({ ...prev, subcategoria: '', unidad: '', peso: 0 }));
      setDatosHeredados(null);
    }
  }, [formData.categoria, categorias]);

  // Actualizar datosHeredados cuando se selecciona una subcategoría
  // El auto-rellenado se hace ahora en el onValueChange del Select
  useEffect(() => {
    if (formData.categoria && formData.subcategoria) {
      const categoriaSeleccionada = categorias.find(c => c.nombre === formData.categoria);
      const subcategoriaSeleccionada = categoriaSeleccionada?.subcategorias?.find(
        s => s.nombre === formData.subcategoria
      );
      
      if (subcategoriaSeleccionada) {
        // Solo guardar datos heredados para mostrar badges e información
        const datosGuardados = obtenerDatosSubcategoria(formData.categoria, formData.subcategoria);
        
        setDatosHeredados({
          unidad: subcategoriaSeleccionada.unidad || datosGuardados?.unidad,
          pesoUnitario: subcategoriaSeleccionada.pesoUnitario || datosGuardados?.pesoUnitario,
          icono: subcategoriaSeleccionada.icono,
          descripcion: subcategoriaSeleccionada.descripcion
        });
      } else {
        setDatosHeredados(null);
      }
    } else {
      setDatosHeredados(null);
    }
  }, [formData.categoria, formData.subcategoria, categorias]);

  // Auto-capturar peso de balanza cuando la unidad es PLT
  // El peso capturado se considera como PESO UNITARIO (peso de 1 paleta)
  // Si hay cantidad, se multiplica automáticamente
  useEffect(() => {
    if (formData.unidad === 'PLT' && isConnected && currentWeight && currentWeight.stable && currentWeight.weight > 0) {
      // Calcular el peso total esperado basado en la cantidad
      const pesoUnitarioBalanza = currentWeight.weight;
      const cantidadActual = formData.cantidad > 0 ? formData.cantidad : 1;
      const pesoTotalCalculado = pesoUnitarioBalanza * cantidadActual;
      
      // Solo actualizar si el peso cambió significativamente (más de 0.01 kg de diferencia = 10g)
      const diferencia = Math.abs(formData.peso - pesoTotalCalculado);
      if (diferencia > 0.01) {
        setFormData(prev => {
          // Si no hay cantidad, establecer 1 paleta por defecto
          const nuevaCantidad = prev.cantidad > 0 ? prev.cantidad : 1;
          
          return {
            ...prev,
            cantidad: nuevaCantidad,
            peso: Math.round(pesoTotalCalculado)
          };
        });
        
        if (cantidadActual === 1) {
          toast.success(`⚖️ Peso unitario capturado: ${formatLargeNumber(pesoUnitarioBalanza)} kg/PLT`, {
            duration: 2000
          });
        } else {
          toast.success(`⚖️ Peso capturado: ${formatLargeNumber(pesoUnitarioBalanza)} kg × ${cantidadActual} PLT = ${formatLargeNumber(pesoTotalCalculado)} kg`, {
            duration: 3000
          });
        }
      }
    }
  }, [formData.unidad, isConnected, currentWeight?.stable, currentWeight?.weight, formData.cantidad]);

  // Auto-calcular peso cuando cambia la cantidad (si existe peso unitario)
  // ⚠️ EXCEPCIÓN: NO auto-calcular para PALETA (PLT)
  useEffect(() => {
    if (formData.categoria && formData.subcategoria && formData.cantidad > 0) {
      // Buscar la subcategoría directamente en el estado
      const categoriaSeleccionada = categorias.find(c => c.nombre === formData.categoria);
      const subcategoriaSeleccionada = categoriaSeleccionada?.subcategorias?.find(
        s => s.nombre === formData.subcategoria
      );
      
      // ⚠️ NO calcular peso automáticamente para PALETA
      if (formData.unidad === 'PLT') {
        return;
      }
      
      if (subcategoriaSeleccionada && subcategoriaSeleccionada.pesoUnitario && subcategoriaSeleccionada.pesoUnitario > 0) {
        const pesoCalculado = formData.cantidad * subcategoriaSeleccionada.pesoUnitario;
        setFormData(prev => ({ 
          ...prev, 
          peso: Math.round(pesoCalculado)
        }));
      }
    }
  }, [formData.cantidad, formData.categoria, formData.subcategoria, formData.unidad, categorias]);

  const limpiarFormulario = useCallback(() => {
    setFormData({
      tipoEntrada: '',
      donadorId: '',
      categoria: '',
      subcategoria: '',
      cantidad: 0,
      unidad: '',
      peso: 0,
      valorUnitario: 0,
      valorTotal: 0,
      temperatura: '',
      fechaCaducidad: '',
      lote: '',
      observaciones: ''
    });
  }, []);

  const abrirDialogSubcategoria = useCallback(() => {
    if (!formData.categoria) {
      toast.error('Primero selecciona una categoría');
      return;
    }
    
    const categoriaSeleccionada = categorias.find(c => c.nombre === formData.categoria);
    setNuevaSubcategoria({
      nombre: '',
      icono: categoriaSeleccionada?.icono || '📦',
      unidad: '',
      pesoUnitario: 0,
      descripcion: ''
    });
    setDialogSubcategoria(true);
  }, [formData.categoria, categorias]);

  // 🤖 Auto-generar icono cuando se escribe el nombre de la subcategoría
  useEffect(() => {
    if (nuevaSubcategoria.nombre && nuevaSubcategoria.nombre.length > 2) {
      const iconoGenerado = generarIconoAutomatico(nuevaSubcategoria.nombre);
      const categoriaSeleccionada = categorias.find(c => c.nombre === formData.categoria);
      const iconoPorDefecto = categoriaSeleccionada?.icono || '📦';
      
      // Si encontró un icono específico diferente al genérico, usarlo
      if (iconoGenerado !== '📦') {
        setNuevaSubcategoria(prev => ({
          ...prev,
          icono: iconoGenerado
        }));
      } else if (nuevaSubcategoria.icono === '📦') {
        // Si no encontró uno específico, mantener el de la categoría
        setNuevaSubcategoria(prev => ({
          ...prev,
          icono: iconoPorDefecto
        }));
      }
    }
  }, [nuevaSubcategoria.nombre, formData.categoria, categorias]);

  const guardarNuevaSubcategoria = useCallback(() => {
    if (!nuevaSubcategoria.nombre) {
      toast.error('El nombre es requerido');
      return;
    }

    const categoriaSeleccionada = categorias.find(c => c.nombre === formData.categoria);
    if (!categoriaSeleccionada) {
      toast.error('No se encontró la categoría');
      return;
    }

    const subcategoriaCreada = agregarSubcategoria(categoriaSeleccionada.id, {
      nombre: nuevaSubcategoria.nombre,
      icono: nuevaSubcategoria.icono || categoriaSeleccionada.icono,
      activa: true,
      pesoUnitario: nuevaSubcategoria.pesoUnitario,
      unidad: nuevaSubcategoria.unidad,
      descripcion: nuevaSubcategoria.descripcion
    });

    if (subcategoriaCreada) {
      toast.success('✅ Subcategoría creada: ' + nuevaSubcategoria.nombre);
      
      const categoriasActualizadas = obtenerCategorias();
      setCategorias(categoriasActualizadas.filter(c => c.activa));
      
      setFormData(prev => ({ ...prev, subcategoria: subcategoriaCreada.nombre }));
      
      setDialogSubcategoria(false);
    } else {
      toast.error('❌ Ya existe una subcategoría con ese nombre y peso unitario');
    }
  }, [nuevaSubcategoria, categorias, formData.categoria]);

  // Función para seleccionar un producto PRS y auto-rellenar todos los campos
  const seleccionarProductoPRS = useCallback((producto: ProductoCreado) => {
    console.log('🎯 Producto PRS seleccionado:', producto);
    
    // Obtener peso unitario del producto
    const pesoUnitarioPRS = producto.pesoUnitario || 0;
    
    // Auto-rellenar TODOS los campos desde el producto PRS
    setFormData(prev => ({
      ...prev,
      categoria: producto.categoria,
      subcategoria: producto.subcategoria,
      unidad: producto.unidad,
      peso: pesoUnitarioPRS // Establecer peso unitario como peso inicial
    }));
    
    // Actualizar datos heredados para mostrar badges
    setDatosHeredados({
      unidad: producto.unidad,
      pesoUnitario: pesoUnitarioPRS,
      icono: producto.icono,
      descripcion: producto.descripcion
    });
    
    // Limpiar búsqueda
    setBusquedaPRS('');
    
    // Mostrar notificación de éxito con más detalle
    const camposAutoRellenados = [
      `Catégorie: ${producto.categoria}`,
      `Sous-catégorie: ${producto.subcategoria}`,
      `Unité: ${producto.unidad}`,
      `Poids unitaire: ${formatLargeNumber(pesoUnitarioPRS)} kg`
    ];
    
    toast.success('💡 Produit PRS sélectionné - Champs auto-remplis', {
      description: camposAutoRellenados.join(' • '),
      duration: 4000
    });
  }, []);

  const generarCodigoProducto = useCallback((): string => {
    const timestamp = Date.now().toString().slice(-6);
    const categoriaInicial = formData.categoria.substring(0, 3).toUpperCase();
    return `${categoriaInicial}-${timestamp}`;
  }, [formData.categoria]);

  // Función que procesa el guardado real
  const procesarGuardado = useCallback((mantenerAbierto: boolean = false) => {
    // 🐛 DEBUG: Verificar desde dónde se llama procesarGuardado
    console.log('🚀 procesarGuardado llamada - Stack trace:', new Error().stack);
    console.log('📋 Datos del formulario en procesarGuardado:', {
      fechaCaducidad: formData.fechaCaducidad,
      lote: formData.lote
    });
    
    // Actualizar peso unitario en la configuración para futuras entradas
    const actualizado = actualizarPesoUnitarioSubcategoria(
      formData.categoria,
      formData.subcategoria,
      formData.cantidad,
      formData.peso,
      formData.unidad
    );

    if (actualizado) {
      const categoriasActualizadas = obtenerCategorias();
      setCategorias(categoriasActualizadas.filter(c => c.activa));
      
      // Solo mostrar mensaje de memorización si no es paleta (PLT no se memoriza)
      if (formData.unidad !== 'PLT') {
        toast.success(`💡 Peso unitario memorizado para ${formData.subcategoria}`);
      }
    }

    // Obtener datos necesarios
    const categoriaSeleccionada = categorias.find(c => c.nombre === formData.categoria);
    const subcategoriaSeleccionada = subcategorias.find(s => s.nombre === formData.subcategoria);
    const programaSeleccionado = programas.find(p => p.codigo.toLowerCase() === formData.tipoEntrada);
    const donadorSeleccionado = contactos.find(c => c.id === formData.donadorId);

    if (!categoriaSeleccionada || !subcategoriaSeleccionada) {
      toast.error('Error: categoría o subcategoría no encontrada');
      return;
    }

    // Calcular peso unitario (kg por unidad)
    const pesoUnitario = formData.cantidad > 0 ? formData.peso / formData.cantidad : 0;

    // Construir el objeto de entrada completo con TODOS los campos requeridos
    const entrada = {
      fecha: new Date().toISOString(),
      tipoEntrada: formData.tipoEntrada,
      programaNombre: programaSeleccionado?.nombre || formData.tipoEntrada,
      programaCodigo: programaSeleccionado?.codigo || formData.tipoEntrada.toUpperCase(),
      programaColor: programaSeleccionado?.color || '#1E73BE',
      programaIcono: programaSeleccionado?.icono || '📦',
      
      // Información del donador/proveedor
      donadorId: formData.donadorId,
      donadorNombre: donadorSeleccionado 
        ? (donadorSeleccionado.nombreEmpresa || `${donadorSeleccionado.nombre} ${donadorSeleccionado.apellido || ''}`.trim())
        : 'Donador no registrado',
      donadorEsCustom: false,
      
      // Información del producto
      productoId: `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nombreProducto: `${formData.categoria} - ${formData.subcategoria}`,
      categoria: formData.categoria,
      subcategoria: formData.subcategoria,
      productoCategoria: formData.categoria,
      productoSubcategoria: formData.subcategoria,
      productoIcono: subcategoriaSeleccionada.icono || categoriaSeleccionada.icono,
      productoCodigo: generarCodigoProducto(),
      
      // Cantidades
      cantidad: formData.cantidad,
      unidad: formData.unidad,
      pesoUnidad: pesoUnitario,
      pesoTotal: formData.peso,
      
      // Valores monetarios
      valorUnitario: formData.valorUnitario || 0,
      valorTotal: formData.valorTotal || 0,
      
      // Temperatura
      temperatura: (formData.temperatura || 'ambiente') as 'ambiente' | 'refrigerado' | 'congelado',
      
      // Detalles opcionales
      lote: formData.lote,
      fechaCaducidad: formData.fechaCaducidad,
      observaciones: formData.observaciones,
      
      // Metadata
      creadoPor: 'Usuario Actual'
    };

    // ✅ SOLO llamar a guardarEntrada() - Esta función hace TODO automáticamente:
    // - Crea o actualiza el producto en localStorage
    // - Actualiza el stock
    // - Registra el movimiento
    // - Guarda en el historial
    const entradaGuardada = guardarEntrada(entrada);
    
    // 📝 REGISTRAR ACTIVIDAD
    registrarActividad(
      'Inventaire',
      'crear',
      `Nouvelle entrée "${subcategoriaSeleccionada?.nombre || formData.subcategoria}" - ${formData.cantidad} ${formData.unidad} (${formData.peso} kg)`,
      { 
        entradaId: entradaGuardada.id,
        subcategoria: formData.subcategoria,
        cantidad: formData.cantidad,
        unidad: formData.unidad,
        peso: formData.peso,
        donador: entrada.donadorNombre,
        tipoEntrada: formData.tipoEntrada
      }
    );

    toast.success('✅ Entrada registrada correctamente');
    
    // Emitir evento para actualizar el historial en tiempo real
    window.dispatchEvent(new Event('entradaGuardada'));
    
    if (!mantenerAbierto) {
      limpiarFormulario();
      onOpenChange(false);
    } else {
      // Si se mantiene abierto, limpiar solo los campos del producto, manteniendo donador y tipo
      const donadorId = formData.donadorId;
      const tipoEntrada = formData.tipoEntrada;
      
      limpiarFormulario();
      
      // Restaurar donador y tipo de entrada
      setFormData(prev => ({
        ...prev,
        donadorId,
        tipoEntrada
      }));
      
      toast.info('📝 Listo para registrar otra entrada al mismo donador');
    }
  }, [formData, categorias, subcategorias, programas, contactos, generarCodigoProducto, limpiarFormulario, onOpenChange]);

  // Función para confirmar y proceder con el guardado
  const confirmarYGuardar = useCallback(() => {
    setDialogConfirmacion(false);
    const mantenerAbierto = accionPendiente === 'guardarYAgregar';
    procesarGuardado(mantenerAbierto);
    setAccionPendiente(null);
  }, [accionPendiente, procesarGuardado]);

  const handleSubmit = useCallback((mantenerAbierto: boolean = false) => {
    // 🐛 DEBUG: Inicio de handleSubmit
    console.log('▶️ handleSubmit INICIADO - mantenerAbierto:', mantenerAbierto);
    
    // Validaciones
    if (!formData.tipoEntrada) {
      toast.error('El tipo de entrada es requerido');
      return;
    }
    
    if (!formData.donadorId) {
      toast.error('El donador/proveedor es requerido');
      return;
    }
    
    // 🎯 VALIDACIÓN ESPECIAL PARA TIPO PRS
    if (formData.tipoEntrada.toLowerCase() === 'prs') {
      if (!formData.categoria || !formData.subcategoria) {
        toast.error('⚠️ Pour le type PRS, vous devez sélectionner un produit PRS existant');
        return;
      }
      
      // Verificar que el producto seleccionado sea realmente un producto PRS
      const productoSeleccionado = productosPRS.find(
        p => p.categoria === formData.categoria && p.subcategoria === formData.subcategoria
      );
      
      if (!productoSeleccionado) {
        toast.error('⚠️ Le produit sélectionné n\'est pas un produit PRS valide');
        return;
      }
    }
    
    if (!formData.categoria) {
      toast.error('La categoría es requerida');
      return;
    }
    
    if (!formData.subcategoria) {
      toast.error('La subcategoría es requerida');
      return;
    }
    
    if (formData.cantidad <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }
    
    if (!formData.unidad) {
      toast.error('La unidad es requerida');
      return;
    }

    if (formData.peso <= 0) {
      toast.error('El peso debe ser mayor a 0');
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
      // Guardar la acción pendiente y mostrar diálogo de confirmación
      setAccionPendiente(mantenerAbierto ? 'guardarYAgregar' : 'guardar');
      setDialogConfirmacion(true);
      console.log('🔔 dialogConfirmacion establecido a true');
      return;
    }

    // Si llegamos aquí, todos los campos opcionales están completos, proceder normalmente
    procesarGuardado(mantenerAbierto);
  }, [formData, productosPRS, procesarGuardado]);

  const categoriaSeleccionada = categorias.find(c => c.nombre === formData.categoria);
  const programaSeleccionado = programas.find(p => p.codigo.toLowerCase() === formData.tipoEntrada);

  // 🎯 Detectar si el tipo de entrada es PRS
  const esTipoEntradaPRS = useMemo(() => {
    return formData.tipoEntrada.toLowerCase() === 'prs';
  }, [formData.tipoEntrada]);

  // Determinar qué tipos de contactos mostrar según el programa de entrada
  const tipoContactoPermitido = useMemo(() => {
    if (!formData.tipoEntrada) return null;
    
    const tipoLower = formData.tipoEntrada.toLowerCase();
    
    // ACH/ACHAT → solo fournisseurs
    if (tipoLower === 'ach' || tipoLower === 'achat') {
      return 'fournisseur';
    }
    
    // DON → solo donadores
    if (tipoLower === 'don') {
      return 'donador';
    }
    
    // CPN → ambos tipos (donadores y fournisseurs)
    if (tipoLower === 'cpn') {
      return null; // null = mostrar todos
    }
    
    // Otros programas → mostrar ambos
    return null;
  }, [formData.tipoEntrada]);

  // Filtrar contactos según el tipo de entrada
  const contactosFiltrados = useMemo(() => {
    if (!tipoContactoPermitido) return contactos;
    return contactos.filter(c => contactoCumpleTipoEntrada(c, tipoContactoPermitido));
  }, [contactos, tipoContactoPermitido]);
  
  // Debug: Mostrar información de filtrado en consola
  useEffect(() => {
    if (formData.tipoEntrada) {
      console.log('🔍 Filtrado de contactos:', {
        tipoEntrada: formData.tipoEntrada,
        tipoPermitido: tipoContactoPermitido,
        totalContactos: contactos.length,
        contactosFiltrados: contactosFiltrados.length,
        contactosFiltradosDetalle: contactosFiltrados.map(c => ({
          id: c.id,
          nombre: c.nombreEmpresa || `${c.nombre} ${c.apellido}`,
          tipo: c.tipo,
          isDonateur: c.isDonateur,
          isFournisseur: c.isFournisseur
        }))
      });
      
      console.log('🎯 DEBUG Tipo PRS:', {
        tipoEntrada: formData.tipoEntrada,
        tipoEntradaLower: formData.tipoEntrada.toLowerCase(),
        esTipoEntradaPRS,
        productosPRSLength: productosPRS.length,
        mostrarSelectorPRS: esTipoEntradaPRS || productosPRS.length > 0
      });
    }
  }, [formData.tipoEntrada, tipoContactoPermitido, contactos, contactosFiltrados, esTipoEntradaPRS, productosPRS]);

  // 🔍 DEBUG: Monitorear cambios en valores monetarios
  useEffect(() => {
    console.log('💰 Estado Valores Monetarios:', {
      valorUnitario: formData.valorUnitario,
      cantidad: formData.cantidad,
      valorTotal: formData.valorTotal,
      calculoEsperado: (formData.valorUnitario || 0) * (formData.cantidad || 0)
    });
  }, [formData.valorUnitario, formData.cantidad, formData.valorTotal]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[95vh] flex flex-col p-0 bg-gradient-to-br from-slate-50 via-white to-blue-50" aria-describedby="formulario-entrada-description">
          {/* Header Moderno con Gradiente */}
          <DialogHeader className="px-8 pt-8 pb-6 border-b-2 border-blue-100 bg-gradient-to-r from-[#1a4d7a] via-[#1E73BE] to-[#2d9561] relative overflow-hidden shrink-0">
            {/* Patrón de fondo decorativo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)',
                backgroundSize: '40px 40px'
              }} />
            </div>
            
            <DialogTitle className="text-2xl relative z-10" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl border-2 border-white/30 ring-4 ring-white/10">
                  <PackagePlus className="h-7 w-7 text-white drop-shadow-lg" />
                </div>
                <div>
                  <span className="text-white drop-shadow-md">{t('inventory.newEntry') || 'Nueva Entrada de Inventario'}</span>
                  <p className="text-sm text-white/90 mt-1 font-normal drop-shadow-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    ✨ Registra productos recibidos en el almacén
                  </p>
                </div>
              </div>
            </DialogTitle>
            <DialogDescription id="formulario-entrada-description" className="sr-only">
              Formulario para registrar nuevas entradas de inventario en el almacén
            </DialogDescription>
          </DialogHeader>

          {/* Contenido del formulario con scroll */}
          <div className="px-8 py-6 flex-1 overflow-y-auto space-y-6">
            {/* Sección 1: Información Básica */}
            <div className="bg-white rounded-2xl border-2 border-blue-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-[#1a4d7a]/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#1a4d7a] to-[#1E73BE] flex items-center justify-center shadow-lg ring-4 ring-blue-50">
                  <span className="text-2xl drop-shadow-sm">📋</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1a4d7a]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Información Básica
                  </h3>
                  <p className="text-xs text-gray-600 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    ✨ Tipo de entrada y procedencia
                  </p>
                </div>
              </div>
                
              <div className="grid grid-cols-2 gap-5">
                {/* Tipo de Entrada */}
                <div className="space-y-2">
                  <Label htmlFor="tipoEntrada" className="text-sm font-semibold flex items-center gap-2 text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('common.entryType') || 'Tipo de Entrada'}
                    <Badge variant="destructive" className="text-[10px] px-2 py-0.5 shadow-sm">Requerido</Badge>
                  </Label>
                  <Select 
                    value={formData.tipoEntrada} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tipoEntrada: value }))}
                  >
                    <SelectTrigger className="h-12 text-sm border-2 border-gray-200 focus:border-[#1a4d7a] focus:ring-2 focus:ring-[#1a4d7a]/20 hover:border-gray-300 transition-colors rounded-lg shadow-sm">
                      <SelectValue placeholder="Seleccionar tipo de entrada..." />
                    </SelectTrigger>
                    <SelectContent>
                      {programas.map(programa => (
                        <SelectItem key={programa.id} value={programa.codigo.toLowerCase()}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{programa.icono}</span>
                            <span>{programa.nombre}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {programaSeleccionado && (
                    <div className="flex items-center justify-between gap-2 mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{programaSeleccionado.icono}</span>
                        <span className="text-xs text-[#1E73BE] font-medium">{programaSeleccionado.nombre}</span>
                      </div>
                      {tipoContactoPermitido && (
                        <Badge 
                          variant="secondary" 
                          className="text-[9px] px-2 py-0.5"
                          style={{
                            backgroundColor: tipoContactoPermitido === 'fournisseur' ? '#E3F2FD' : '#E8F5E9',
                            color: tipoContactoPermitido === 'fournisseur' ? '#1976D2' : '#2E7D32'
                          }}
                        >
                          {tipoContactoPermitido === 'fournisseur' ? '📦 Fournisseurs' : '🎁 Donateurs'}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Donador/Proveedor */}
                <div className="space-y-2">
                  <Label htmlFor="donador" className="text-sm font-medium flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {tipoContactoPermitido === 'fournisseur' 
                      ? '📦 Fournisseur' 
                      : tipoContactoPermitido === 'donador' 
                        ? '🎁 Donateur' 
                        : (t('common.donorProvider') || 'Fournisseur / Donateur')}
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Requerido</Badge>
                    {tipoContactoPermitido && (
                      <Badge 
                        variant="outline" 
                        className="text-[10px] px-1.5 py-0"
                        style={{
                          backgroundColor: tipoContactoPermitido === 'fournisseur' ? '#E3F2FD' : '#E8F5E9',
                          borderColor: tipoContactoPermitido === 'fournisseur' ? '#2196F3' : '#4CAF50',
                          color: tipoContactoPermitido === 'fournisseur' ? '#1976D2' : '#2E7D32'
                        }}
                      >
                        Filtré: {tipoContactoPermitido === 'fournisseur' ? 'Fournisseurs seulement' : 'Donateurs seulement'}
                      </Badge>
                    )}
                  </Label>
                  <Select 
                    value={formData.donadorId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, donadorId: value }))}
                    disabled={!formData.tipoEntrada}
                  >
                    <SelectTrigger className="h-12 text-sm border-2 border-gray-200 focus:border-[#1a4d7a] focus:ring-2 focus:ring-[#1a4d7a]/20 hover:border-gray-300 transition-colors rounded-lg shadow-sm">
                      <SelectValue placeholder={
                        !formData.tipoEntrada 
                          ? "Sélectionner d'abord un type d'entrée..."
                          : tipoContactoPermitido === 'fournisseur'
                            ? "Sélectionner un fournisseur..."
                            : tipoContactoPermitido === 'donador'
                              ? "Sélectionner un donateur..."
                              : "Sélectionner fournisseur ou donateur..."
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {contactosFiltrados.length === 0 ? (
                        <SelectItem value="__none__" disabled>
                          {tipoContactoPermitido === 'fournisseur' 
                            ? 'Aucun fournisseur disponible'
                            : tipoContactoPermitido === 'donador'
                              ? 'Aucun donateur disponible'
                              : 'Aucun contact disponible'}
                        </SelectItem>
                      ) : (
                        <>
                          {contactosFiltrados
                            .sort((a, b) => {
                              const nombreA = a.nombreEmpresa || `${a.nombre} ${a.apellido}`;
                              const nombreB = b.nombreEmpresa || `${b.nombre} ${b.apellido}`;
                              return nombreA.localeCompare(nombreB);
                            })
                            .map((contacto) => {
                              const nombreCompleto = contacto.nombreEmpresa || `${contacto.nombre} ${contacto.apellido}`;
                              const tipoPrincipal = obtenerTipoPrincipalContacto(contacto, tipoContactoPermitido);
                              const icono = tipoPrincipal === 'donador' ? '🎁' : '📦';
                              
                              return (
                                <SelectItem key={contacto.id} value={contacto.id}>
                                  <div className="flex items-center gap-2">
                                    <span>{icono}</span>
                                    <span className="font-medium">{nombreCompleto}</span>
                                    {contacto.telefono && (
                                      <span className="text-xs text-gray-500">• {contacto.telefono}</span>
                                    )}
                                  </div>
                                </SelectItem>
                              );
                            })}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {/* Contador de contactos */}
                  {formData.tipoEntrada && contactosFiltrados.length > 0 && (
                    <div className="flex gap-3 text-xs text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        {tipoContactoPermitido === 'fournisseur' && <span>📦</span>}
                        {tipoContactoPermitido === 'donador' && <span>🎁</span>}
                        <span>{contactosFiltrados.length} {tipoContactoPermitido === 'fournisseur' ? 'fournisseur(s)' : 'donateur(s)'} disponible(s)</span>
                      </span>
                    </div>
                  )}
                  {formData.tipoEntrada && contactosFiltrados.length === 0 && (
                    <div className="flex gap-2 text-xs text-orange-600 mt-1 bg-orange-50 p-2 rounded border border-orange-200">
                      <span>⚠️</span>
                      <span>Aucun {tipoContactoPermitido === 'fournisseur' ? 'fournisseur' : 'donateur'} disponible. Veuillez ajouter un contact dans Gestion de Contactos.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sección 2: Producto */}
            <div className="bg-white rounded-2xl border-2 border-green-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-[#2d9561]/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#2d9561] to-[#25825a] flex items-center justify-center shadow-lg ring-4 ring-green-50">
                  <span className="text-2xl drop-shadow-sm">📦</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#2d9561]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Información del Producto
                  </h3>
                  <p className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Categoría y subcategoría del producto
                  </p>
                </div>
              </div>

              {/* 🎯 SELECTOR RÁPIDO DE PRODUCTOS PRS */}
              {/* MOSTRAR SIEMPRE cuando es tipo PRS, o cuando hay productos PRS disponibles */}
              {(esTipoEntradaPRS || productosPRS.length > 0) && (
                <div className={`mb-6 p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden ${
                  esTipoEntradaPRS 
                    ? 'bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-600/10 border-2 border-purple-400 shadow-lg' 
                    : 'bg-gradient-to-br from-purple-100/50 via-pink-100/50 to-purple-200/50 border-2 border-purple-200 shadow-md'
                }`}>
                  {/* Efecto de brillo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
                  
                  <div className="flex items-center gap-2 mb-4 relative z-10">
                    <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center shadow-md">
                      <span className="text-lg">⚡</span>
                    </div>
                    <h4 className="text-base font-bold text-purple-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {esTipoEntradaPRS ? '🔒 Sélection OBLIGATOIRE - Produits PRS' : 'Sélection Rapide - Produits PRS'}
                    </h4>
                    <Badge className="text-[10px] px-2 py-0.5 bg-purple-600 shadow-sm">
                      {productosPRS.length} produits
                    </Badge>
                    {esTipoEntradaPRS && (
                      <Badge variant="destructive" className="text-[10px] px-2 py-0.5 animate-pulse shadow-md">
                        OBLIGATOIRE
                      </Badge>
                    )}
                  </div>
                  
                  {/* Campo de búsqueda */}
                  <Input
                    type="text"
                    placeholder="🔍 Rechercher un produit PRS par nom, code ou catégorie..."
                    value={busquedaPRS}
                    onChange={(e) => setBusquedaPRS(e.target.value)}
                    className={`mb-3 h-10 text-sm ${
                      esTipoEntradaPRS
                        ? 'border-purple-500 focus:border-purple-700 focus:ring-purple-700'
                        : 'border-purple-300 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                  />
                  
                  {/* Lista de productos filtrados - SIEMPRE MOSTRAR cuando es tipo PRS */}
                  {(busquedaPRS || esTipoEntradaPRS) && (
                    <div className="max-h-[200px] overflow-y-auto space-y-1 scrollbar-thin">
                      {productosPRS
                        .filter(p => 
                          !busquedaPRS || // Si es tipo PRS, mostrar todos cuando no hay búsqueda
                          p.nombre.toLowerCase().includes(busquedaPRS.toLowerCase()) ||
                          p.codigo.toLowerCase().includes(busquedaPRS.toLowerCase()) ||
                          p.categoria.toLowerCase().includes(busquedaPRS.toLowerCase()) ||
                          p.subcategoria.toLowerCase().includes(busquedaPRS.toLowerCase())
                        )
                        .slice(0, esTipoEntradaPRS ? 50 : 10) // Mostrar más productos si es tipo PRS
                        .map(producto => (
                          <button
                            key={producto.id}
                            type="button"
                            onClick={() => seleccionarProductoPRS(producto)}
                            className={`w-full p-3 text-left rounded-lg border transition-all group ${
                              formData.categoria === producto.categoria && formData.subcategoria === producto.subcategoria
                                ? 'border-purple-500 bg-purple-100 ring-2 ring-purple-400'
                                : 'border-purple-200 bg-white hover:bg-purple-50 hover:border-purple-400'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-lg flex-shrink-0">{producto.icono || '📦'}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm text-gray-800 truncate">
                                    {producto.nombre}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {producto.categoria} → {producto.subcategoria}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200">
                                  {producto.unidad}
                                </Badge>
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-green-50 text-green-700 border-green-200">
                                  {formatLargeNumber(producto.pesoUnitario || 0)} kg
                                </Badge>
                              </div>
                            </div>
                          </button>
                        ))}
                      
                      {productosPRS.filter(p => 
                        !busquedaPRS ||
                        p.nombre.toLowerCase().includes(busquedaPRS.toLowerCase()) ||
                        p.codigo.toLowerCase().includes(busquedaPRS.toLowerCase()) ||
                        p.categoria.toLowerCase().includes(busquedaPRS.toLowerCase()) ||
                        p.subcategoria.toLowerCase().includes(busquedaPRS.toLowerCase())
                      ).length === 0 && (
                        <div className={`p-6 text-center rounded-lg ${
                          esTipoEntradaPRS 
                            ? 'bg-red-50 border-2 border-red-300' 
                            : 'bg-gray-50 border border-gray-200'
                        }`}>
                          <div className="text-4xl mb-2">📦</div>
                          <div className={`text-sm font-medium mb-2 ${
                            esTipoEntradaPRS ? 'text-red-800' : 'text-gray-600'
                          }`}>
                            {esTipoEntradaPRS 
                              ? '⚠️ Aucun produit PRS disponible' 
                              : 'Aucun produit PRS trouvé'}
                          </div>
                          {esTipoEntradaPRS && (
                            <div className="text-xs text-red-600">
                              Vous devez créer au moins un produit PRS dans le module Inventaire avant d'utiliser ce type d'entrée.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className={`text-xs mt-2 ${esTipoEntradaPRS ? 'text-purple-800 font-semibold' : 'text-purple-600'}`}>
                    {esTipoEntradaPRS 
                      ? '⚠️ Pour le type d\'entrée PRS, vous devez sélectionner un produit PRS existant'
                      : '💡 Tapez pour rechercher et sélectionner un produit PRS pour auto-remplir tous les champs'
                    }
                  </p>
                </div>
              )}
                
              {/* OCULTAR SELECTOR MANUAL SI ES TIPO PRS - Solo mostrar si es tipo PRS y hay producto seleccionado */}
              {esTipoEntradaPRS && formData.categoria && formData.subcategoria ? (
                <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">✅</span>
                    <h4 className="text-sm font-semibold text-blue-800" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Produit PRS sélectionné
                    </h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{datosHeredados?.icono || '📦'}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          {formData.categoria} → {formData.subcategoria}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200">
                            {formData.unidad}
                          </Badge>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-green-50 text-green-700 border-green-200">
                            {formatLargeNumber(formData.peso)} kg
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : !esTipoEntradaPRS ? (
                <div className="grid grid-cols-2 gap-5">
                  {/* Categoría */}
                  <div className="space-y-2">
                  <Label htmlFor="categoria" className="text-sm font-medium flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('common.category') || 'Categoría'}
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Requerido</Badge>
                  </Label>
                  <Select 
                    value={formData.categoria} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
                  >
                    <SelectTrigger 
                      id="categoria"
                      className="h-11 text-sm border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE]"
                    >
                      <SelectValue placeholder="Cliquer pour voir toutes les catégories..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {categorias.length === 0 ? (
                        <SelectItem value="__none__" disabled>
                          Aucune catégorie disponible
                        </SelectItem>
                      ) : (
                        categorias.map(categoria => (
                          <SelectItem key={categoria.id} value={categoria.nombre}>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{categoria.icono}</span>
                              <span>{categoria.nombre}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {categoriaSeleccionada && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 rounded-lg border border-green-100">
                      <span className="text-lg">{categoriaSeleccionada.icono}</span>
                      <span className="text-xs text-[#4CAF50] font-medium">{categoriaSeleccionada.nombre}</span>
                    </div>
                  )}
                </div>

                {/* Subcategoría */}
                <div className="space-y-2">
                  <Label htmlFor="subcategoria" className="text-sm font-medium flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('common.subcategory') || 'Subcategoría'}
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Requerido</Badge>
                  </Label>
                  <div className="flex gap-2">
                    <Select 
                      value={formData.subcategoria} 
                      onValueChange={(value) => {
                        // 🎯 AUTO-RELLENAR campos al seleccionar subcategoría PRS
                        const subcategoriaSeleccionada = subcategorias.find(s => s.nombre === value);
                        const datosGuardados = obtenerDatosSubcategoria(formData.categoria, value);
                        
                        // Determinar unidad y peso unitario a usar
                        const unidadPRS = subcategoriaSeleccionada?.unidad || datosGuardados?.unidad || '';
                        const pesoUnitarioPRS = subcategoriaSeleccionada?.pesoUnitario || datosGuardados?.pesoUnitario || 0;
                        
                        // Rastrear qué campos se auto-rellenan
                        const camposAutoRellenados: string[] = [];
                        
                        // Actualizar formData con auto-rellenado
                        setFormData(prev => {
                          const actualizado = {
                            ...prev,
                            subcategoria: value
                          };
                          
                          // Solo auto-rellenar si los campos están vacíos
                          if (prev.unidad === '' && unidadPRS) {
                            actualizado.unidad = unidadPRS;
                            camposAutoRellenados.push(`Unité: ${unidadPRS}`);
                          } else {
                            actualizado.unidad = prev.unidad;
                          }
                          
                          if (prev.peso === 0 && pesoUnitarioPRS > 0) {
                            actualizado.peso = pesoUnitarioPRS;
                            camposAutoRellenados.push(`Poids unitaire: ${formatLargeNumber(pesoUnitarioPRS)} kg`);
                          } else {
                            actualizado.peso = prev.peso;
                          }
                          
                          return actualizado;
                        });
                        
                        // Guardar datos heredados para mostrar información
                        if (unidadPRS || pesoUnitarioPRS > 0) {
                          setDatosHeredados({
                            unidad: unidadPRS,
                            pesoUnitario: pesoUnitarioPRS,
                            icono: subcategoriaSeleccionada?.icono,
                            descripcion: subcategoriaSeleccionada?.descripcion
                          });
                          
                          // Solo mostrar toast si realmente se auto-rellenó algo
                          if (camposAutoRellenados.length > 0) {
                            toast.success('💡 Champs auto-remplis depuis le PRS', {
                              description: camposAutoRellenados.join(' • '),
                              duration: 3000
                            });
                          }
                        }
                      }}
                      disabled={!formData.categoria}
                    >
                      <SelectTrigger className="h-11 text-sm border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE] flex-1">
                        <SelectValue placeholder="Seleccionar subcategoría..." />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategorias.map(subcategoria => {
                          // Obtener datos guardados de la subcategoría
                          const datosGuardados = obtenerDatosSubcategoria(formData.categoria, subcategoria.nombre);
                          
                          return (
                            <SelectItem key={subcategoria.id} value={subcategoria.nombre}>
                              <div className="flex items-center gap-2 w-full justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{subcategoria.icono}</span>
                                  <span>{subcategoria.nombre}</span>
                                </div>
                                <div className="flex items-center gap-1.5 ml-auto">
                                  {/* Mostrar unidad directamente de subcategoria o de datosGuardados */}
                                  {(subcategoria.unidad || datosGuardados?.unidad) && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200 font-medium">
                                      {subcategoria.unidad || datosGuardados?.unidad}
                                    </Badge>
                                  )}
                                  {/* Mostrar peso unitario */}
                                  {((subcategoria.pesoUnitario && subcategoria.pesoUnitario > 0) || 
                                    (datosGuardados?.pesoUnitario && datosGuardados.pesoUnitario > 0)) && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-50 text-green-700 border-green-200 font-medium">
                                      {formatLargeNumber(subcategoria.pesoUnitario || datosGuardados?.pesoUnitario || 0)} kg
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      onClick={abrirDialogSubcategoria}
                      disabled={!formData.categoria}
                      className="h-11 w-11 flex items-center justify-center rounded-md bg-[#4CAF50] hover:bg-[#388E3C] text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      title={t('common.createSubcategory')}
                      style={{ minWidth: '44px' }}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  {!formData.categoria && (
                    <p className="text-xs text-[#999999]">{t('common.selectCategoryFirstShort')}</p>
                  )}
                  {/* Mostrar badge si hay datos heredados */}
                  {datosHeredados && (formData.subcategoria) && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="text-blue-600">💾</span>
                      <div className="flex-1 text-xs">
                        {datosHeredados.unidad && (
                          <span className="text-blue-700 font-medium">
                            {t('common.savedUnit')}: <strong>{datosHeredados.unidad}</strong>
                          </span>
                        )}
                        {datosHeredados.unidad && datosHeredados.pesoUnitario && datosHeredados.pesoUnitario > 0 && (
                          <span className="text-blue-700"> • </span>
                        )}
                        {datosHeredados.pesoUnitario && datosHeredados.pesoUnitario > 0 && (
                          <span className="text-blue-700 font-medium">
                            {t('common.weight')}: <strong>{formatLargeNumber(datosHeredados.pesoUnitario)} kg</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

            {/* Sección 3: Cantidades */}
            <div className="bg-white rounded-2xl border-2 border-purple-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-purple-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg ring-4 ring-purple-50">
                  <span className="text-2xl drop-shadow-sm">📊</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-purple-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Cantidades
                  </h3>
                  <p className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Cantidad, unidad y peso del producto
                  </p>
                </div>
              </div>
                
              <div className="grid grid-cols-3 gap-5">
                {/* Cantidad */}
                <div className="space-y-2">
                  <Label htmlFor="cantidad" className="text-sm font-semibold flex items-center gap-2 text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('common.quantity') || 'Cantidad'}
                    <Badge variant="destructive" className="text-[10px] px-2 py-0.5 shadow-sm">Requerido</Badge>
                  </Label>
                  <div className="relative">
                    <Input
                      id="cantidad"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.cantidad || ''}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        const cantidad = inputValue === '' ? 0 : parseFloat(inputValue);
                        const valorUnitario = formData.valorUnitario || 0;
                        const valorTotal = cantidad * valorUnitario;
                        
                        console.log('📦 Cambio de Cantidad - Recálculo Valor:', {
                          cantidad,
                          valorUnitario,
                          valorTotal,
                          formula: `${cantidad} × ${valorUnitario} = ${valorTotal}`
                        });
                        
                        setFormData(prev => ({ 
                          ...prev, 
                          cantidad,
                          valorTotal
                        }));
                      }}
                      placeholder="0"
                      className="h-12 text-sm pr-10 border-2 border-gray-200 focus:border-[#1a4d7a] focus:ring-2 focus:ring-[#1a4d7a]/20 hover:border-gray-300 transition-all rounded-lg shadow-sm font-medium"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                      #
                    </div>
                  </div>
                </div>

                {/* Unidad */}
                <div className="space-y-2">
                  <Label htmlFor="unidad" className="text-sm font-semibold flex items-center gap-2 text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('common.unit') || 'Unidad'}
                    <Badge variant="destructive" className="text-[10px] px-2 py-0.5 shadow-sm">Requerido</Badge>
                  </Label>
                  <Select 
                    key={`unidad-${formData.unidad}-${formData.subcategoria}`}
                    value={formData.unidad} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, unidad: value }))}
                  >
                    <SelectTrigger className="h-12 text-sm border-2 border-gray-200 focus:border-[#1a4d7a] focus:ring-2 focus:ring-[#1a4d7a]/20 hover:border-gray-300 transition-colors rounded-lg shadow-sm font-medium">
                      <SelectValue placeholder="Unidad..." />
                    </SelectTrigger>
                    <SelectContent>
                      {unidades.map(unidad => (
                        <SelectItem key={unidad.id} value={unidad.abreviatura}>
                          <div className="flex items-center justify-between gap-3">
                            <span>{unidad.nombre}</span>
                            <Badge variant="outline" className="text-[10px]">{unidad.abreviatura}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.unidad && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <span>✓</span>
                      <span>Unidad seleccionada: {formData.unidad}</span>
                      {datosHeredados?.unidad === formData.unidad && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200 ml-1">
                          PRS
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Peso */}
                <div className="space-y-2">
                  <Label htmlFor="peso" className="text-sm font-semibold flex items-center gap-2 text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {formData.unidad === 'PLT' ? 'Peso Total' : (t('common.weight') || 'Peso')}
                    <Badge variant="destructive" className="text-[10px] px-2 py-0.5 shadow-sm">Requerido</Badge>
                    {formData.unidad === 'PLT' && isConnected && currentWeight && currentWeight.stable && (
                      <Badge className="text-[11px] px-3 py-1 bg-gradient-to-r from-[#2d9561] to-[#25825a] text-white border-0 animate-pulse shadow-lg">
                        ⚖️ Peso unitario: {formatLargeNumber(currentWeight.weight)} kg/PLT
                      </Badge>
                    )}
                    {formData.unidad === 'PLT' && isConnected && currentWeight && !currentWeight.stable && (
                      <Badge className="text-[11px] px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 animate-pulse shadow-md">
                        ⚖️ Estabilizando...
                      </Badge>
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="peso"
                      type="number"
                      min="0"
                      step="0.001"
                      value={formData.peso || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, peso: parseFloat(e.target.value) || 0 }))}
                      placeholder={formData.unidad === 'PLT' ? 'Peso calculado automáticamente...' : '0.000'}
                      className={`h-12 text-sm pr-10 border-2 border-gray-200 focus:border-[#2d9561] focus:ring-2 focus:ring-[#2d9561]/20 hover:border-gray-300 transition-all rounded-lg shadow-sm ${
                        formData.unidad === 'PLT' && isConnected && currentWeight?.stable ? 'bg-green-50 border-green-300 font-semibold' : 'bg-white'
                      }`}
                      readOnly={formData.unidad === 'PLT' && isConnected && currentWeight?.stable}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] text-xs font-medium pointer-events-none">
                      kg
                    </div>
                  </div>
                  
                  {/* Indicador de peso auto-rellenado desde PRS */}
                  {formData.peso > 0 && datosHeredados?.pesoUnitario === formData.peso && formData.unidad !== 'PLT' && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <span>💡</span>
                      <span>Poids unitaire depuis PRS: {formatLargeNumber(formData.peso)} kg</span>
                    </div>
                  )}
                  
                  {/* Indicador de estado de balanza */}
                  {formData.unidad === 'PLT' && (
                    <div className="p-3 rounded-lg border bg-gradient-to-r from-blue-50 to-green-50">
                      {isConnected ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></div>
                            <span className="text-sm text-green-700 font-semibold">⚖️ Balance connectée - Captura automática activée</span>
                          </div>
                          {currentWeight && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 ml-5">
                              <Scale className="h-3 w-3" />
                              <span>
                                Poids unitaire (1 PLT): <strong className="text-green-700">{formatLargeNumber(currentWeight.weight)} {currentWeight.unit}</strong>
                                {currentWeight.stable ? (
                                  <span className="ml-2 text-green-600">✓ Stable</span>
                                ) : (
                                  <span className="ml-2 text-yellow-600">⏳ Stabilisation en cours...</span>
                                )}
                              </span>
                            </div>
                          )}
                          <div className="text-xs text-gray-500 ml-5 space-y-1">
                            <div>💡 Le poids unitaire se capture automatiquement depuis la balance</div>
                            <div className="ml-4">→ Poids total = Poids unitaire × Quantité de palettes</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-orange-400"></div>
                          <span className="text-sm text-orange-700">
                            ⚠️ Balance déconnectée - 
                            <button 
                              type="button" 
                              onClick={() => toast.info('Allez dans Configuración → Balance pour connecter la balance', { duration: 4000 })} 
                              className="ml-1 underline hover:text-orange-800 font-medium"
                            >
                              Connecter maintenant
                            </button>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Info de peso calculado */}
              {formData.cantidad > 0 && formData.peso > 0 && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600">💡</span>
                    <div className="text-xs text-purple-700 font-medium space-y-1">
                      <div>Peso unitario: {formatLargeNumber(formData.peso / formData.cantidad)} kg/{formData.unidad || 'unidad'}</div>
                      {formData.unidad === 'PLT' && formData.cantidad > 1 && (
                        <div className="text-purple-600">
                          → {formData.cantidad} palettes × {formatLargeNumber(formData.peso / formData.cantidad)} kg = {formatLargeNumber(formData.peso)} kg total
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* ✅ Sección: Valores Monetarios */}
              <div className="grid grid-cols-2 gap-5 mt-4">
                {/* Valor Unitario */}
                <div className="space-y-2">
                  <Label htmlFor="valorUnitario" className="text-sm font-medium flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    💰 Valeur unitaire (CAD$)
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200">
                      Par {formData.unidad || 'unité'}
                    </Badge>
                  </Label>
                  <div className="relative">
                    <Input
                      id="valorUnitario"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.valorUnitario || ''}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        const valorUnitario = inputValue === '' ? 0 : parseFloat(inputValue);
                        const cantidad = formData.cantidad || 0;
                        const valorTotal = cantidad * valorUnitario;
                        
                        console.log('💰 Cálculo Valor Monetario:', {
                          valorUnitario,
                          cantidad,
                          valorTotal,
                          formula: `${cantidad} × ${valorUnitario} = ${valorTotal}`
                        });
                        
                        setFormData(prev => ({ 
                          ...prev, 
                          valorUnitario,
                          valorTotal
                        }));
                      }}
                      placeholder="0.00"
                      className="h-12 text-sm pr-16 border-2 border-gray-200 focus:border-[#2d9561] focus:ring-2 focus:ring-[#2d9561]/20 hover:border-gray-300 transition-all rounded-lg shadow-sm font-semibold"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2d9561] text-sm font-bold pointer-events-none">
                      CAD$
                    </div>
                  </div>
                  {/* Indicador de valor ingresado */}
                  {formData.valorUnitario && formData.valorUnitario > 0 && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <span>✓</span>
                      <span>Valeur unitaire: CAD$ {formatMoney(formData.valorUnitario || 0)} / {formData.unidad || 'unité'}</span>
                    </div>
                  )}
                </div>

                {/* Valor Total (calculado automáticamente) */}
                <div className="space-y-2">
                  <Label htmlFor="valorTotal" className="text-sm font-medium flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    💵 Valeur totale (CAD$)
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-50 text-green-700 border-green-200">
                      Calculé automatiquement
                    </Badge>
                  </Label>
                  <div className="relative">
                    <Input
                      id="valorTotal"
                      type="text"
                      value={formatMoney(formData.valorTotal || 0)}
                      readOnly
                      className={`h-11 text-sm pr-16 font-bold border-2 cursor-not-allowed transition-all ${
                        formData.valorTotal && formData.valorTotal > 0 
                          ? 'bg-green-50 text-green-800 border-green-300' 
                          : 'bg-gray-50 text-gray-700 border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] text-xs font-medium pointer-events-none">
                      CAD$
                    </div>
                  </div>
                  {/* Indicador visual del cálculo en tiempo real */}
                  {formData.valorTotal > 0 && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <span>✓</span>
                      <span>Valeur calculée: {formatQuantity(formData.cantidad)} × CAD$ {formatMoney(formData.valorUnitario || 0)} = CAD$ {formatMoney(formData.valorTotal || 0)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info de valor monetario calculado */}
              {formData.valorUnitario && formData.valorUnitario > 0 && formData.cantidad > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">💰</span>
                    <div className="text-xs text-green-700 font-medium space-y-1">
                      <div>Valor total calculado: {formatQuantity(formData.cantidad)} {formData.unidad || 'unités'} × CAD$ {formatMoney(formData.valorUnitario || 0)} = CAD$ {formatMoney(formData.valorTotal || 0)}</div>
                      <div className="text-green-600">
                        💡 La valeur sera enregistrée avec l'entrée et mise à jour dans l'inventaire avec moyenne pondérée
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sección 4: Detalles Adicionales */}
            <div className="bg-white rounded-2xl border-2 border-orange-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-orange-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg ring-4 ring-orange-50">
                  <span className="text-2xl drop-shadow-sm">📝</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-orange-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Detalles Adicionales
                  </h3>
                  <p className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Información complementaria (opcional)
                  </p>
                </div>
              </div>

              {/* Banner Recordatorio de Campos Importantes */}
              {(!formData.fechaCaducidad || !formData.lote) && (
                <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-l-4 border-amber-500 p-4 rounded-lg shadow-sm mb-5">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-lg">💡</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-900 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Rappel important
                      </p>
                      <p className="text-xs text-gray-700">
                        La <span className="font-semibold">date d'expiration</span> et le <span className="font-semibold">numéro de lot</span> sont essentiels pour la traçabilité et la sécurité alimentaire.
                      </p>
                    </div>
                  </div>
                </div>
              )}
                
              <div className="grid grid-cols-3 gap-5">
                {/* Temperatura */}
                <div className="space-y-2">
                  <Label htmlFor="temperatura" className="text-sm font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('common.temperature') || 'Temperatura'}
                  </Label>
                  <Select 
                    value={formData.temperatura} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, temperatura: value }))}
                  >
                    <SelectTrigger className="h-11 text-sm border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE]">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ambiente">
                        <div className="flex items-center gap-2">
                          <span>🌡️</span>
                          <span>Ambiente</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="refrigerado">
                        <div className="flex items-center gap-2">
                          <span>❄️</span>
                          <span>Refrigerado</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="congelado">
                        <div className="flex items-center gap-2">
                          <span>🧊</span>
                          <span>Congelado</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fecha de Caducidad */}
                <div className="space-y-2">
                  <Label htmlFor="fechaCaducidad" className="text-sm font-semibold flex items-center gap-2 text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    📅 {t('common.expiryDate') || 'Fecha Caducidad'}
                    <Badge className="text-[10px] px-2 py-0.5 bg-amber-500 hover:bg-amber-600 shadow-sm">
                      Important
                    </Badge>
                  </Label>
                  <Input
                    id="fechaCaducidad"
                    type="date"
                    value={formData.fechaCaducidad}
                    onChange={(e) => setFormData(prev => ({ ...prev, fechaCaducidad: e.target.value }))}
                    className={`h-12 text-sm border-2 transition-all rounded-lg shadow-sm ${
                      formData.fechaCaducidad 
                        ? 'border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 bg-green-50' 
                        : 'border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 hover:border-amber-300'
                    }`}
                    placeholder="AAAA-MM-JJ"
                    title="Vous pouvez écrire directement (ex: 2025-12-31)"
                    lang="fr-CA"
                  />
                  {formData.fechaCaducidad && (
                    <div className="flex items-center gap-1 text-xs text-green-700 font-medium">
                      <span>✓</span>
                      <span>Date complétée</span>
                    </div>
                  )}
                </div>

                {/* Lote */}
                <div className="space-y-2">
                  <Label htmlFor="lote" className="text-sm font-semibold flex items-center gap-2 text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    🏷️ {t('common.batch') || 'Lote'}
                    <Badge className="text-[10px] px-2 py-0.5 bg-orange-500 hover:bg-orange-600 shadow-sm">
                      Important
                    </Badge>
                  </Label>
                  <Input
                    id="lote"
                    value={formData.lote}
                    onChange={(e) => setFormData(prev => ({ ...prev, lote: e.target.value }))}
                    placeholder="Ej: LOTE-2024-001"
                    className={`h-12 text-sm border-2 transition-all rounded-lg shadow-sm ${
                      formData.lote 
                        ? 'border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 bg-green-50' 
                        : 'border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 hover:border-orange-300'
                    }`}
                  />
                  {formData.lote && (
                    <div className="flex items-center gap-1 text-xs text-green-700 font-medium">
                      <span>✓</span>
                      <span>Lot complété</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Observaciones */}
              <div className="space-y-2 mt-5">
                <Label htmlFor="observaciones" className="text-sm font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('common.observations') || 'Observaciones'}
                </Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Notas adicionales sobre esta entrada..."
                  rows={3}
                  className="text-sm resize-none border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE]"
                />
              </div>
            </div>
          </div>

          {/* Botones de Acción - Fijos con gradiente moderno */}
          <div className="flex justify-between gap-4 border-t-2 border-gray-100 px-8 py-6 bg-gradient-to-r from-slate-50 via-white to-blue-50 shrink-0">
            <Button 
              variant="outline" 
              onClick={() => {
                limpiarFormulario();
                onOpenChange(false);
              }}
              className="h-12 px-7 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
            >
              <X className="h-5 w-5 mr-2" />
              {t('common.cancel') || 'Cancelar'}
            </Button>
            <div className="flex gap-3">
              <Button
                onClick={() => handleSubmit(true)}
                variant="outline"
                className="h-12 px-7 border-2 border-[#2d9561] text-[#2d9561] hover:bg-[#2d9561] hover:text-white transition-all duration-200 shadow-md hover:shadow-lg"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}
              >
                <Plus className="h-5 w-5 mr-2" />
                Guardar y Agregar Otra
              </Button>
              <Button
                onClick={() => handleSubmit(false)}
                className="h-12 px-9 bg-gradient-to-r from-[#1a4d7a] via-[#1E73BE] to-[#2d9561] hover:from-[#153d63] hover:via-[#1557a0] hover:to-[#25825a] shadow-xl hover:shadow-2xl transition-all duration-200 text-white"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}
              >
                <Save className="h-5 w-5 mr-2" />
                Guardar y Cerrar
              </Button>
            </div>
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
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-5 border-t-2 border-amber-100">
            <Button
              onClick={() => setDialogConfirmacion(false)}
              variant="outline"
              className="flex-1 h-12 border-2 border-[#2d9561] text-[#2d9561] hover:bg-[#2d9561] hover:text-white transition-all duration-200 shadow-md hover:shadow-lg"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}
            >
              <span className="mr-2">✏️</span>
              Volver y Completar
            </Button>
            <Button
              onClick={confirmarYGuardar}
              className="flex-1 h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}
            >
              <span className="mr-2">✓</span>
              Continuar de Todos Modos
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para crear nueva subcategoría */}
      <Dialog open={dialogSubcategoria} onOpenChange={setDialogSubcategoria}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-white to-gray-50" aria-describedby="nueva-subcategoria-description">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl flex items-center gap-4" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#4CAF50] to-[#388E3C] flex items-center justify-center shadow-lg">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <span>{t('common.createSubcategory')}</span>
            </DialogTitle>
            <DialogDescription id="nueva-subcategoria-description" className="text-sm text-[#666666] pl-16">
              {t('common.newSubcategoryIn')}: <span className="font-medium text-[#1E73BE]">{categoriaSeleccionada?.nombre}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Info de la categoría */}
            {categoriaSeleccionada && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{categoriaSeleccionada.icono}</span>
                  <div>
                    <p className="font-semibold text-[#333333] text-base">{categoriaSeleccionada.nombre}</p>
                    <p className="text-xs text-[#666666] mt-1">
                      {categoriaSeleccionada.subcategorias?.length || 0} {t('configuration.subcategories').toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Grid de campos */}
            <div className="grid grid-cols-2 gap-5">
              {/* Nombre */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="nombreSubcategoria" className="text-sm font-medium flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('configuration.subcategoryName')}
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{t('common.required')}</Badge>
                </Label>
                <Input
                  id="nombreSubcategoria"
                  value={nuevaSubcategoria.nombre}
                  onChange={(e) => setNuevaSubcategoria(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder={t('configuration.subcategoryNamePlaceholder')}
                  className="h-11 border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE]"
                  autoFocus
                />
              </div>

              {/* Ícono */}
              <div className="space-y-2">
                <Label htmlFor="iconoSubcategoria" className="text-sm font-medium flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('configuration.icon')}
                  <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200">
                    🤖 {t('common.autoGenerated')}
                  </Badge>
                </Label>
                <div className="relative">
                  <Input
                    id="iconoSubcategoria"
                    value={nuevaSubcategoria.icono}
                    onChange={(e) => setNuevaSubcategoria(prev => ({ ...prev, icono: e.target.value }))}
                    placeholder="🍎"
                    maxLength={2}
                    className="h-11 text-2xl text-center border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE]"
                  />
                  {nuevaSubcategoria.icono && nuevaSubcategoria.icono !== '📦' && (
                    <div className="absolute -right-14 top-1/2 -translate-y-1/2">
                      <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center border-2 border-green-300 shadow-sm">
                        <span className="text-2xl">{nuevaSubcategoria.icono}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#666666]">
                    {nuevaSubcategoria.nombre && nuevaSubcategoria.nombre.length > 2 
                      ? `✨ ${t('common.iconAutoDetected')}` 
                      : `${t('common.default')}: ${categoriaSeleccionada?.icono}`}
                  </span>
                </div>
              </div>

              {/* Unidad */}
              <div className="space-y-2">
                <Label htmlFor="unidadSubcategoria" className="text-sm font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('common.unit')}
                </Label>
                <Select 
                  value={nuevaSubcategoria.unidad} 
                  onValueChange={(value) => setNuevaSubcategoria(prev => ({ ...prev, unidad: value }))}
                >
                  <SelectTrigger className="h-11 text-sm border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE]">
                    <SelectValue placeholder={t('common.selectUnit')} />
                  </SelectTrigger>
                  <SelectContent>
                    {unidades.map(unidad => (
                      <SelectItem key={unidad.id} value={unidad.abreviatura}>
                        {unidad.nombre} ({unidad.abreviatura})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Peso Unitario */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="pesoUnitario" className="text-sm font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('common.unitWeight')}
                </Label>
                <div className="relative">
                  <Input
                    id="pesoUnitario"
                    type="number"
                    step="0.001"
                    min="0"
                    value={nuevaSubcategoria.pesoUnitario || ''}
                    onChange={(e) => setNuevaSubcategoria(prev => ({ ...prev, pesoUnitario: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.000"
                    className="h-11 pr-10 border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE]"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] text-xs font-medium">
                    kg
                  </div>
                </div>
                <p className="text-xs text-[#666666]">
                  {t('common.autoCalculatedIfZero')}
                </p>
              </div>

              {/* Descripción */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="descripcionSubcategoria" className="text-sm font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('configuration.subcategoryDescription')}
                </Label>
                <Textarea
                  id="descripcionSubcategoria"
                  value={nuevaSubcategoria.descripcion}
                  onChange={(e) => setNuevaSubcategoria(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder={t('common.optionalDescription')}
                  rows={3}
                  className="resize-none border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-5">
            <Button 
              variant="outline" 
              onClick={() => {
                setDialogSubcategoria(false);
                setNuevaSubcategoria({
                  nombre: '',
                  icono: '',
                  unidad: '',
                  pesoUnitario: 0,
                  descripcion: ''
                });
              }}
              className="h-11 px-6 border-gray-300 hover:bg-gray-50"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={guardarNuevaSubcategoria}
              disabled={!nuevaSubcategoria.nombre}
              className="h-11 px-8 bg-gradient-to-r from-[#4CAF50] to-[#388E3C] hover:from-[#388E3C] hover:to-[#2E7D32] shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('common.createSubcategory')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}