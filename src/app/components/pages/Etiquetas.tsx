import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../../../hooks/useBranding';
import { 
  Printer, 
  Tag, 
  MapPin, 
  Package, 
  Plus, 
  Eye, 
  Download,
  Grid3x3,
  Trash2,
  Copy,
  Check,
  Filter,
  LayoutGrid,
  Settings,
  Home,
  Sparkles,
  Edit,
  List
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { EtiquetaImprimible, DatosEtiqueta, VistaImpresion } from '../etiquetas/EtiquetaImprimible';
import { printStandardLabel, type ProductLabelData } from '../etiquetas/StandardProductLabel';
import { generarCodigoBarrasEAN13, generarCodigoLote, generarCodigoUbicacion } from '../../utils/barcode';
import { mockProductos } from '../../data/mockData';
import { obtenerProductos } from '../../utils/productStorage';
import { obtenerCategorias } from '../../utils/categoriaStorage';

// Funciones de almacenamiento de zonas
const obtenerZonas = (): Array<{ zona: string; tipo: string; cantidad: number }> => {
  const zonasGuardadas = localStorage.getItem('zonasAlmacen');
  if (zonasGuardadas) {
    try {
      return JSON.parse(zonasGuardadas);
    } catch (error) {
      console.error('Error al cargar zonas:', error);
    }
  }
  // Datos de ubicaciones predefinidas por defecto
  return [
    { zona: 'A', tipo: 'Estantería', cantidad: 10 },
    { zona: 'B', tipo: 'Estantería', cantidad: 10 },
    { zona: 'C', tipo: 'Cámara Fría', cantidad: 5 },
    { zona: 'D', tipo: 'Almacén Seco', cantidad: 8 },
    { zona: 'E', tipo: 'Congelador', cantidad: 4 },
  ];
};

const guardarZonas = (zonas: Array<{ zona: string; tipo: string; cantidad: number }>) => {
  localStorage.setItem('zonasAlmacen', JSON.stringify(zonas));
};

// Mapeo de categorías con sus iconos
const categoriasInfo: Record<string, { icono: string; color: string; label: string }> = {
  'Alimentos Secos': { icono: '🍚', color: '#FFC107', label: 'Aliments secs' },
  'Conservas': { icono: '🥫', color: '#4CAF50', label: 'Conserves' },
  'Lácteos': { icono: '🥛', color: '#1E73BE', label: 'Produits laitiers' },
  'Frutas y Verduras': { icono: '🥬', color: '#4CAF50', label: 'Fruits et legumes' },
  'Proteínas': { icono: '🥩', color: '#DC3545', label: 'Proteines' },
  'Panadería': { icono: '🍞', color: '#FFA726', label: 'Boulangerie' },
  'Bebidas': { icono: '🧃', color: '#29B6F6', label: 'Boissons' },
  'Aceites y Condimentos': { icono: '🫒', color: '#66BB6A', label: 'Huiles et condiments' },
};

export function Etiquetas() {
  const { t } = useTranslation();
  const branding = useBranding();
  const [etiquetasCreadas, setEtiquetasCreadas] = useState<DatosEtiqueta[]>([]);
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<number[]>([]);
  const [vistaPrevia, setVistaPrevia] = useState(false);
  const [dialogNuevaEtiqueta, setDialogNuevaEtiqueta] = useState(false);
  const [dialogUbicacionesMasivas, setDialogUbicacionesMasivas] = useState(false);
  
  // Estados para nueva etiqueta
  const [tipoEtiqueta, setTipoEtiqueta] = useState<'ubicacion' | 'producto' | 'lote'>('ubicacion');
  const [tamanoEtiqueta, setTamanoEtiqueta] = useState<'pequena' | 'mediana' | 'grande'>('mediana');
  const [formatoCodigo, setFormatoCodigo] = useState<'EAN13' | 'CODE128' | 'CODE39'>('CODE128');
  const [columnasImpresion, setColumnasImpresion] = useState(2);

  // Estados para etiqueta de ubicación
  const [zonaSeleccionada, setZonaSeleccionada] = useState('');
  const [numeroUbicacion, setNumeroUbicacion] = useState('');
  const [descripcionUbicacion, setDescripcionUbicacion] = useState('');

  // Estados para etiqueta de producto
  const [productoSeleccionado, setProductoSeleccionado] = useState('');

  // Estados para generación masiva
  const [zonaMasiva, setZonaMasiva] = useState('');
  const [cantidadMasiva, setCantidadMasiva] = useState(1);

  // Estados para creación de zona
  const [dialogNuevaZona, setDialogNuevaZona] = useState(false);
  const [dialogGestionarZonas, setDialogGestionarZonas] = useState(false);
  const [zonaEditando, setZonaEditando] = useState<string | null>(null);
  const [nuevaZona, setNuevaZona] = useState({
    zona: '',
    tipo: 'Estantería',
    cantidad: 10
  });
  const [ubicacionesPredefinidas, setUbicacionesPredefinidas] = useState<Array<{ zona: string; tipo: string; cantidad: number }>>(obtenerZonas());

  // Estado para forzar actualizaciones
  const [refreshKey, setRefreshKey] = useState(0);

  // Sincronizar productos con localStorage usando useMemo (similar a Inventario.tsx)
  const productosCreados = useMemo(() => obtenerProductos(), [refreshKey]);
  
  const todosLosProductos = useMemo(() => {
    const categoriasDB = obtenerCategorias();
    
    // Mapear productos de localStorage
    const productosLS = productosCreados.map(p => {
      let iconoFinal = '📦';
      
      const categoriaObj = categoriasDB.find(c => c.nombre === p.categoria);
      const subcategoriaObj = categoriaObj?.subcategorias?.find(s => s.nombre === p.subcategoria);
      
      if (subcategoriaObj?.icono && subcategoriaObj.icono.trim() !== '') {
        iconoFinal = subcategoriaObj.icono;
      } else if (categoriaObj?.icono && categoriaObj.icono.trim() !== '') {
        iconoFinal = categoriaObj.icono;
      } else if (categoriasInfo[p.categoria]?.icono) {
        iconoFinal = categoriasInfo[p.categoria].icono;
      }
      
      return {
        id: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
        categoria: p.categoria,
        subcategoria: p.subcategoria,
        unidad: p.unidad,
        stockActual: p.stockActual,
        stockMinimo: p.stockMinimo,
        ubicacion: p.ubicacion,
        lote: p.lote || '',
        fechaVencimiento: p.fechaVencimiento || '',
        esPRS: p.esPRS,
        foto: '',
        icono: iconoFinal,
        peso: p.peso,
        pesoRegistrado: p.pesoRegistrado,
        pesoUnitario: p.pesoUnitario || p.peso,
        varianteId: p.varianteId
      };
    });
    
    // Agregar mockProductos que NO estén en localStorage
    const mockProductosFiltrados = mockProductos.filter(
      mp => !productosLS.some(p => p.id === mp.id)
    );
    
    return [...productosLS, ...mockProductosFiltrados];
  }, [productosCreados, refreshKey]);

  const getCategoriaLabel = (categoria?: string) => {
    if (!categoria) return '';
    return categoriasInfo[categoria]?.label || categoria;
  };

  // 🔄 Escuchar evento de actualización de categorías
  useEffect(() => {
    const handleCategoriasActualizadas = () => {
      console.log('🔄 Categorías actualizadas - Recargando etiquetas...');
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('categorias-actualizadas', handleCategoriasActualizadas);

    return () => {
      window.removeEventListener('categorias-actualizadas', handleCategoriasActualizadas);
    };
  }, []);

  const handleCrearEtiquetaUbicacion = () => {
    if (!zonaSeleccionada || !numeroUbicacion) {
      toast.error(t('labels.completeAllFields'));
      return;
    }

    const ubicacionCompleta = `${zonaSeleccionada}${numeroUbicacion}`;
    const codigo = generarCodigoUbicacion(ubicacionCompleta);
    const ubicacionInfo = ubicacionesPredefinidas.find(u => u.zona === zonaSeleccionada);

    const nuevaEtiqueta: DatosEtiqueta = {
      tipo: 'ubicacion',
      titulo: 'UBICACIÓN',
      codigo: codigo,
      subtitulo: ubicacionCompleta,
      descripcion: descripcionUbicacion || `${ubicacionInfo?.tipo} - Zona ${zonaSeleccionada}`,
      icono: '📍'
    };

    setEtiquetasCreadas([...etiquetasCreadas, nuevaEtiqueta]);
    toast.success(t('labels.locationLabelCreated'));
    limpiarFormulario();
  };

  const handleCrearEtiquetaProducto = () => {
    if (!productoSeleccionado) {
      toast.error(t('inventory.selectProduct'));
      return;
    }

    const producto = todosLosProductos.find(p => p.id === productoSeleccionado);
    if (!producto) return;

    const codigo = generarCodigoBarrasEAN13(producto.id);
    const categoriaInfo = categoriasInfo[producto.categoria];

    const nuevaEtiqueta: DatosEtiqueta = {
      tipo: 'producto',
      titulo: producto.nombre,
      codigo: codigo,
      subtitulo: `${t('labels.code')}: ${producto.codigo}`,
      categoria: producto.categoria,
      lote: producto.lote,
      fechaVencimiento: producto.fechaVencimiento,
      icono: producto.icono || categoriaInfo?.icono || '📦'
    };

    setEtiquetasCreadas([...etiquetasCreadas, nuevaEtiqueta]);
    toast.success(t('labels.productLabelCreated'));
    limpiarFormulario();
  };

  const handleGenerarUbicacionesMasivas = () => {
    if (!zonaMasiva || cantidadMasiva < 1) {
      toast.error(t('labels.completeAllFields'));
      return;
    }

    const ubicacionInfo = ubicacionesPredefinidas.find(u => u.zona === zonaMasiva);
    const nuevasEtiquetas: DatosEtiqueta[] = [];

    for (let i = 1; i <= cantidadMasiva; i++) {
      const ubicacionCompleta = `${zonaMasiva}${i}`;
      const codigo = generarCodigoUbicacion(ubicacionCompleta);

      nuevasEtiquetas.push({
        tipo: 'ubicacion',
        titulo: 'UBICACIÓN',
        codigo: codigo,
        subtitulo: ubicacionCompleta,
        descripcion: `${ubicacionInfo?.tipo} - Zona ${zonaMasiva}`,
        icono: '📍'
      });
    }

    setEtiquetasCreadas([...etiquetasCreadas, ...nuevasEtiquetas]);
    toast.success(`${cantidadMasiva} ${t('labels.labelsCreated')}`);
    setDialogUbicacionesMasivas(false);
    setZonaMasiva('');
    setCantidadMasiva(1);
  };

  const handleCrearZona = () => {
    if (!nuevaZona.zona.trim()) {
      toast.error('El código de zona es requerido');
      return;
    }

    // Verificar si ya existe una zona con ese código
    if (ubicacionesPredefinidas.some(z => z.zona.toUpperCase() === nuevaZona.zona.toUpperCase())) {
      toast.error('Ya existe una zona con ese código');
      return;
    }

    const zonasActualizadas = [...ubicacionesPredefinidas, {
      zona: nuevaZona.zona.toUpperCase(),
      tipo: nuevaZona.tipo,
      cantidad: nuevaZona.cantidad
    }];

    // Ordenar alfabéticamente por zona
    zonasActualizadas.sort((a, b) => a.zona.localeCompare(b.zona));

    setUbicacionesPredefinidas(zonasActualizadas);
    guardarZonas(zonasActualizadas);
    
    toast.success(`Zone ${nuevaZona.zona.toUpperCase()} créée avec succès`);
    setDialogNuevaZona(false);
    setNuevaZona({
      zona: '',
      tipo: 'Estantería',
      cantidad: 10
    });
  };

  const handleEditarZona = (zonaCode: string) => {
    const zona = ubicacionesPredefinidas.find(z => z.zona === zonaCode);
    if (zona) {
      setNuevaZona({
        zona: zona.zona,
        tipo: zona.tipo,
        cantidad: zona.cantidad
      });
      setZonaEditando(zonaCode);
      setDialogGestionarZonas(false);
      setDialogNuevaZona(true);
    }
  };

  const handleGuardarEdicion = () => {
    if (!nuevaZona.zona.trim()) {
      toast.error('El código de zona es requerido');
      return;
    }

    // Si cambió el código, verificar que no exista
    if (zonaEditando && nuevaZona.zona.toUpperCase() !== zonaEditando) {
      if (ubicacionesPredefinidas.some(z => z.zona.toUpperCase() === nuevaZona.zona.toUpperCase())) {
        toast.error('Ya existe una zona con ese código');
        return;
      }
    }

    const zonasActualizadas = ubicacionesPredefinidas.map(z => 
      z.zona === zonaEditando 
        ? { zona: nuevaZona.zona.toUpperCase(), tipo: nuevaZona.tipo, cantidad: nuevaZona.cantidad }
        : z
    );

    // Ordenar alfabéticamente por zona
    zonasActualizadas.sort((a, b) => a.zona.localeCompare(b.zona));

    setUbicacionesPredefinidas(zonasActualizadas);
    guardarZonas(zonasActualizadas);
    
    toast.success(`Zone ${nuevaZona.zona.toUpperCase()} modifiée avec succès`);
    setDialogNuevaZona(false);
    setZonaEditando(null);
    setNuevaZona({
      zona: '',
      tipo: 'Estantería',
      cantidad: 10
    });
  };

  const handleEliminarZona = (zonaCode: string) => {
    if (confirm(`¿Está seguro que desea eliminar la zona ${zonaCode}? Esta acción no se puede deshacer.`)) {
      const zonasActualizadas = ubicacionesPredefinidas.filter(z => z.zona !== zonaCode);
      setUbicacionesPredefinidas(zonasActualizadas);
      guardarZonas(zonasActualizadas);
      toast.success(`Zone ${zonaCode} supprimée avec succès`);
    }
  };

  const limpiarFormulario = () => {
    setZonaSeleccionada('');
    setNumeroUbicacion('');
    setDescripcionUbicacion('');
    setProductoSeleccionado('');
    setDialogNuevaEtiqueta(false);
  };

  const toggleSeleccion = (index: number) => {
    setEtiquetasSeleccionadas(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleTodas = () => {
    if (etiquetasSeleccionadas.length === etiquetasCreadas.length) {
      setEtiquetasSeleccionadas([]);
    } else {
      setEtiquetasSeleccionadas(etiquetasCreadas.map((_, i) => i));
    }
  };

  const eliminarSeleccionadas = () => {
    setEtiquetasCreadas(prev => prev.filter((_, i) => !etiquetasSeleccionadas.includes(i)));
    setEtiquetasSeleccionadas([]);
    toast.success(t('labels.labelsDeleted'));
  };

  const duplicarSeleccionadas = () => {
    const duplicadas = etiquetasSeleccionadas.map(i => ({ ...etiquetasCreadas[i] }));
    setEtiquetasCreadas([...etiquetasCreadas, ...duplicadas]);
    setEtiquetasSeleccionadas([]);
    toast.success(`${duplicadas.length} ${t('labels.labelsDuplicated')}`);
  };

  const imprimirEtiquetas = async () => {
    const etiquetasAImprimir = etiquetasSeleccionadas.length > 0
      ? etiquetasSeleccionadas.map(i => etiquetasCreadas[i])
      : etiquetasCreadas;

    if (etiquetasAImprimir.length === 0) {
      toast.error(t('labels.noLabelsToPrint'));
      return;
    }

    // Separar etiquetas de producto del resto
    const etiquetasProducto = etiquetasAImprimir.filter(e => e.tipo === 'producto');
    const etiquetasOtras = etiquetasAImprimir.filter(e => e.tipo !== 'producto');

    // Imprimir etiquetas de producto con el sistema estandarizado
    if (etiquetasProducto.length > 0) {
      // Imprimir todas las etiquetas sin esperar - cada una se abre instantáneamente
      etiquetasProducto.forEach((etiqueta) => {
        const producto = todosLosProductos.find(p => p.nombre === etiqueta.titulo);
        if (producto) {
          const labelData: ProductLabelData = {
            id: producto.id,
            nombreProducto: producto.nombre,
            productoIcono: producto.icono,
            categoria: producto.categoria,
            subcategoria: producto.subcategoria,
            cantidad: producto.stockActual || 1,
            unidad: producto.unidad,
            pesoTotal: (producto.pesoUnitario || producto.peso || 0) * (producto.stockActual || 1),
            pesoUnidad: producto.pesoUnitario || producto.peso,
            temperatura: 'ambiente',
            lote: producto.lote,
            fechaCaducidad: producto.fechaVencimiento,
            fechaEntrada: new Date().toISOString(),
            translations: {
              foodBank: t('labels.foodBank') || 'BANQUE ALIMENTAIRE',
              productLabel: t('labels.productLabel') || 'Étiquette du Produit',
              quantity: t('labels.quantity') || 'QUANTITÉ',
              temperature: t('labels.temperature') || 'TEMPÉRATURE',
              lot: t('labels.lot') || 'LOT',
              expiryDate: t('labels.expiryDate') || "DATE D'EXPIRATION",
              weight: t('labels.weight') || 'POIDS',
              program: t('labels.program') || 'PROGRAMME',
              donor: t('labels.donor') || 'DONATEUR',
              entryDate: t('labels.entryDate') || "DATE D'ENTRÉE",
              systemFooter: t('labels.systemFooter') || 'Système de Gestion des Stocks',
              ambient: t('labels.ambient') || 'Ambiant',
              refrigerated: t('labels.refrigerated') || 'Réfrigéré',
              frozen: t('labels.frozen') || 'Congelé',
            }
          };

          // No usar await - lanzar todas las impresiones simultáneamente
          printStandardLabel(labelData).catch(err => {
            console.error('Error al imprimir etiqueta:', err);
            toast.error(`Error al imprimir ${producto.nombre}`);
          });
        }
      });
      
      toast.success(`${etiquetasProducto.length} ${t('labels.productLabels')} ${t('labels.printed')}`);
    }

    // Si hay etiquetas de ubicación u otras, usar el sistema antiguo
    if (etiquetasOtras.length === 0) {
      return; // Ya imprimimos todas las de producto
    }

    // Crear ventana de impresión para el resto
    const ventanaImpresion = window.open('', '', 'width=800,height=600');
    if (!ventanaImpresion) {
      toast.error(t('labels.couldNotOpenPrintWindow'));
      return;
    }

    const dimensiones = {
      pequena: { width: '6cm', height: '4cm' },
      mediana: { width: '10cm', height: '6cm' },
      grande: { width: '14cm', height: '8cm' }
    };

    const dim = dimensiones[tamanoEtiqueta];

    ventanaImpresion.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impression d'Étiquettes - Banque Alimentaire</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @page {
              size: A4;
              margin: 1cm;
            }
            
            body {
              font-family: Arial, sans-serif;
              background: white;
            }
            
            .grid-etiquetas {
              display: grid;
              grid-template-columns: repeat(${columnasImpresion}, 1fr);
              gap: 0.5cm;
              padding: 0.5cm;
            }
            
            .etiqueta {
              width: ${dim.width};
              height: ${dim.height};
              border: 2px solid #000;
              padding: 8px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              page-break-inside: avoid;
              background: white;
            }
            
            .etiqueta-header {
              text-align: center;
              border-bottom: 2px solid #ccc;
              padding-bottom: 4px;
              margin-bottom: 4px;
            }
            
            .etiqueta-titulo {
              font-weight: bold;
              font-size: ${tamanoEtiqueta === 'pequena' ? '12px' : tamanoEtiqueta === 'mediana' ? '14px' : '16px'};
              text-transform: uppercase;
              letter-spacing: 1px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
            }
            
            .etiqueta-subtitulo {
              font-size: ${tamanoEtiqueta === 'pequena' ? '9px' : tamanoEtiqueta === 'mediana' ? '10px' : '12px'};
              color: #666;
              font-weight: 500;
            }
            
            .etiqueta-barcode {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 4px 0;
            }
            
            .etiqueta-footer {
              border-top: 2px solid #ccc;
              padding-top: 4px;
              font-size: ${tamanoEtiqueta === 'pequena' ? '8px' : tamanoEtiqueta === 'mediana' ? '9px' : '10px'};
            }
            
            .etiqueta-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 4px;
            }
            
            .etiqueta-info-item {
              font-size: ${tamanoEtiqueta === 'pequena' ? '8px' : tamanoEtiqueta === 'mediana' ? '9px' : '10px'};
            }
            
            .etiqueta-info-label {
              font-weight: bold;
            }
            
            .etiqueta-vencimiento {
              color: #dc3545;
              font-weight: bold;
            }
            
            .etiqueta-pie {
              text-align: center;
              margin-top: 4px;
              padding-top: 4px;
              border-top: 1px solid #e0e0e0;
              font-size: 7px;
              color: #999;
            }
            
            @media print {
              body {
                background: white;
              }
              
              .grid-etiquetas {
                page-break-after: avoid;
              }
              
              .etiqueta {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="grid-etiquetas">
            ${etiquetasOtras.map(etq => `
              <div class="etiqueta">
                <div class="etiqueta-header">
                  <div class="etiqueta-titulo">
                    ${etq.icono ? `<span>${etq.icono}</span>` : ''}
                    <span>${etq.titulo}</span>
                  </div>
                  ${etq.subtitulo ? `<div class="etiqueta-subtitulo">${etq.subtitulo}</div>` : ''}
                </div>
                
                <div class="etiqueta-barcode">
                  <svg id="barcode-${etq.codigo}"></svg>
                </div>
                
                <div class="etiqueta-footer">
                  <div class="etiqueta-info">
                    ${etq.categoria ? `
                      <div class="etiqueta-info-item">
                        <span class="etiqueta-info-label">Categorie:</span>
                        <div>${getCategoriaLabel(etq.categoria)}</div>
                      </div>
                    ` : ''}
                    ${etq.lote ? `
                      <div class="etiqueta-info-item">
                        <span class="etiqueta-info-label">Lote:</span>
                        <div>${etq.lote}</div>
                      </div>
                    ` : ''}
                    ${etq.fechaVencimiento ? `
                      <div class="etiqueta-info-item" style="grid-column: span 2;">
                        <span class="etiqueta-info-label">Vencimiento:</span>
                        <div class="etiqueta-vencimiento">${etq.fechaVencimiento}</div>
                      </div>
                    ` : ''}
                    ${etq.descripcion ? `
                      <div class="etiqueta-info-item" style="grid-column: span 2; font-size: 8px; color: #666;">
                        ${etq.descripcion}
                      </div>
                    ` : ''}
                  </div>
                  <div class="etiqueta-pie">
                    Banque Alimentaire - Système d'Inventaire
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script>
            window.onload = function() {
              ${etiquetasOtras.map(etq => `
                JsBarcode("#barcode-${etq.codigo}", "${etq.codigo}", {
                  format: "${formatoCodigo}",
                  width: ${tamanoEtiqueta === 'pequena' ? 1.2 : tamanoEtiqueta === 'mediana' ? 1.8 : 2.5},
                  height: ${tamanoEtiqueta === 'pequena' ? 30 : tamanoEtiqueta === 'mediana' ? 45 : 60},
                  displayValue: true,
                  fontSize: ${tamanoEtiqueta === 'pequena' ? 12 : tamanoEtiqueta === 'mediana' ? 14 : 16},
                  margin: 0
                });
              `).join('')}
              
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    
    ventanaImpresion.document.close();
    toast.success(`Imprimiendo ${etiquetasOtras.length} etiquetas`);
  };

  return (
    <div 
      className="min-h-screen p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 relative overflow-hidden"
      style={{ 
        fontFamily: 'Roboto, sans-serif',
        background: 'linear-gradient(135deg, #1a4d7a15 0%, #2d956110 100%)',
      }}
    >
      {/* Formas decorativas de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ backgroundColor: branding.primaryColor }}
        />
        <div 
          className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ backgroundColor: branding.secondaryColor }}
        />
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: branding.primaryColor }}
        />
      </div>

      {/* Contenido con z-index superior */}
      <div className="relative z-10 space-y-4 sm:space-y-6">
        {/* Header con glassmorphism */}
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 border border-white/60">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              {branding.logo ? (
                <div 
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center overflow-hidden shadow-lg border-2"
                  style={{ borderColor: branding.primaryColor }}
                >
                  <img 
                    src={branding.logo} 
                    alt="Logo" 
                    className="h-full w-full"
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                  />
                </div>
              ) : (
                <div 
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  <Tag className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 
                    className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight"
                    style={{ 
                      fontFamily: 'Montserrat, sans-serif',
                      color: branding.primaryColor 
                    }}
                  >
                    {t('labels.title')}
                  </h1>
                  <Sparkles 
                    className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" 
                    style={{ color: branding.secondaryColor }}
                  />
                </div>
                <p className="text-xs sm:text-sm text-[#666666] mt-1">{t('labels.subtitle')}</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Dialog open={dialogUbicacionesMasivas} onOpenChange={setDialogUbicacionesMasivas}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex-1 sm:flex-none bg-white hover:shadow-lg transition-all duration-300" 
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                  >
                    <Grid3x3 className="w-4 h-4 mr-2" />
                    {t('labels.massGeneration')}
                  </Button>
                </DialogTrigger>
                <DialogContent aria-describedby="mass-generation-description">
                  <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                      {t('labels.generateMassLocations')}
                    </DialogTitle>
                    <DialogDescription id="mass-generation-description">
                      {t('labels.massGenerationDescription')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{t('labels.zone')}</Label>
                      <Select value={zonaMasiva} onValueChange={setZonaMasiva}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('labels.selectZoneMessage')} />
                        </SelectTrigger>
                        <SelectContent>
                          {ubicacionesPredefinidas.map(ub => (
                            <SelectItem key={ub.zona} value={ub.zona}>
                              {t('labels.zone')} {ub.zona} - {ub.tipo} ({t('labels.max')}. {ub.cantidad})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('labels.labelQuantity')}</Label>
                      <Input
                        type="number"
                        min="1"
                        max={ubicacionesPredefinidas.find(u => u.zona === zonaMasiva)?.cantidad || 10}
                        value={cantidadMasiva}
                        onChange={(e) => setCantidadMasiva(parseInt(e.target.value) || 1)}
                      />
                      <p className="text-xs text-[#666666]">
                        {t('labels.willGenerate')} {zonaMasiva}1 {t('labels.until')} {zonaMasiva}{cantidadMasiva}
                      </p>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setDialogUbicacionesMasivas(false)}>
                        {t('common.cancel')}
                      </Button>
                      <Button 
                        onClick={handleGenerarUbicacionesMasivas}
                        className="text-white"
                        style={{ 
                          background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`,
                          boxShadow: `0 4px 15px ${branding.secondaryColor}40`
                        }}
                      >
                        {t('labels.generate')} {cantidadMasiva} {t('labels.labels')}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={dialogNuevaEtiqueta} onOpenChange={setDialogNuevaEtiqueta}>
                <DialogTrigger asChild>
                  <Button 
                    className="flex-1 sm:flex-none text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                    style={{ 
                      fontFamily: 'Montserrat, sans-serif', 
                      fontWeight: 500,
                      background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)`,
                      boxShadow: `0 4px 15px ${branding.primaryColor}40`
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('labels.newLabel')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="new-label-description">
                  <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                      {t('labels.createNewLabel')}
                    </DialogTitle>
                    <DialogDescription id="new-label-description">
                      {t('labels.selectLabelType')}
                    </DialogDescription>
                  </DialogHeader>
                  <Tabs value={tipoEtiqueta} onValueChange={(v) => setTipoEtiqueta(v as any)}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="ubicacion">
                        <MapPin className="w-4 h-4 mr-2" />
                        {t('labels.location')}
                      </TabsTrigger>
                      <TabsTrigger value="producto">
                        <Package className="w-4 h-4 mr-2" />
                        {t('labels.product')}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="ubicacion" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <Label>{t('labels.zone')}</Label>
                            <div className="flex gap-1">
                              <Dialog open={dialogNuevaZona} onOpenChange={(open) => {
                                setDialogNuevaZona(open);
                                if (!open) {
                                  setZonaEditando(null);
                                  setNuevaZona({ zona: '', tipo: 'Estantería', cantidad: 10 });
                                }
                              }}>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-7 px-2"
                                    style={{ color: branding.secondaryColor }}
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Nouvelle zone
                                  </Button>
                                </DialogTrigger>
                                <DialogContent aria-describedby="zone-form-description">
                                  <DialogHeader>
                                    <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                                      {zonaEditando ? 'Modifier la zone' : 'Créer une nouvelle zone'}
                                    </DialogTitle>
                                    <DialogDescription id="zone-form-description">
                                      {zonaEditando ? 'Modifier les détails de la zone' : 'Ajouter une nouvelle zone d\'entreposage'}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label>Code de la zone</Label>
                                      <Input
                                        placeholder="Ex: F, G, H..."
                                        value={nuevaZona.zona}
                                        onChange={(e) => setNuevaZona({ ...nuevaZona, zona: e.target.value.toUpperCase() })}
                                        maxLength={2}
                                      />
                                      <p className="text-xs text-[#666666]">Utiliser 1-2 caractères (A-Z)</p>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Type d'emplacement</Label>
                                      <Select value={nuevaZona.tipo} onValueChange={(v) => setNuevaZona({ ...nuevaZona, tipo: v })}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Estantería">Étagère</SelectItem>
                                          <SelectItem value="Cámara Fría">Chambre froide</SelectItem>
                                          <SelectItem value="Congelador">Congélateur</SelectItem>
                                          <SelectItem value="Almacén Seco">Entrepôt sec</SelectItem>
                                          <SelectItem value="Zona de Carga">Zone de chargement</SelectItem>
                                          <SelectItem value="Área de Clasificación">Zone de tri</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Capacité maximum d'emplacements</Label>
                                      <Input
                                        type="number"
                                        min="1"
                                        max="999"
                                        value={nuevaZona.cantidad}
                                        onChange={(e) => setNuevaZona({ ...nuevaZona, cantidad: parseInt(e.target.value) || 1 })}
                                      />
                                      <p className="text-xs text-[#666666]">Nombre maximum d'emplacements dans cette zone</p>
                                    </div>
                                    {nuevaZona.zona && (
                                      <div 
                                        className="p-4 rounded-lg border-2"
                                        style={{ 
                                          backgroundColor: `${branding.secondaryColor}10`,
                                          borderColor: `${branding.secondaryColor}30`
                                        }}
                                      >
                                        <p className="text-sm text-[#666666] mb-2">Aperçu:</p>
                                        <p 
                                          className="font-bold text-lg"
                                          style={{ color: branding.secondaryColor }}
                                        >
                                          Zone {nuevaZona.zona} - {nuevaZona.tipo}
                                        </p>
                                        <p className="text-xs text-[#666666]">
                                          Emplacements: {nuevaZona.zona}1 à {nuevaZona.zona}{nuevaZona.cantidad}
                                        </p>
                                      </div>
                                    )}
                                    <div className="flex justify-end gap-2 pt-4">
                                      <Button variant="outline" onClick={() => {
                                        setDialogNuevaZona(false);
                                        setZonaEditando(null);
                                        setNuevaZona({ zona: '', tipo: 'Estantería', cantidad: 10 });
                                      }}>
                                        {t('common.cancel')}
                                      </Button>
                                      <Button 
                                        onClick={zonaEditando ? handleGuardarEdicion : handleCrearZona}
                                        className="text-white"
                                        style={{ 
                                          background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`,
                                          boxShadow: `0 4px 15px ${branding.secondaryColor}40`
                                        }}
                                      >
                                        {zonaEditando ? 'Enregistrer' : 'Créer la zone'}
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Dialog open={dialogGestionarZonas} onOpenChange={setDialogGestionarZonas}>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-7 px-2"
                                    style={{ color: branding.primaryColor }}
                                  >
                                    <List className="w-3 h-3 mr-1" />
                                    Gérer
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl" aria-describedby="manage-zones-description">
                                  <DialogHeader>
                                    <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                                      Gérer les zones d'entreposage
                                    </DialogTitle>
                                    <DialogDescription id="manage-zones-description">
                                      {ubicacionesPredefinidas.length} zone{ubicacionesPredefinidas.length !== 1 ? 's' : ''} disponible{ubicacionesPredefinidas.length !== 1 ? 's' : ''}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-2 py-4 max-h-[500px] overflow-y-auto">
                                    {ubicacionesPredefinidas.length === 0 ? (
                                      <div className="text-center py-8 text-[#999999]">
                                        <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>Aucune zone créée</p>
                                        <p className="text-sm">Cliquez sur "Nouvelle zone" pour commencer</p>
                                      </div>
                                    ) : (
                                      ubicacionesPredefinidas.map((zona) => (
                                        <div 
                                          key={zona.zona}
                                          className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow"
                                          style={{ borderColor: '#e9ecef' }}
                                        >
                                          <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                              <div 
                                                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                                                style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)` }}
                                              >
                                                {zona.zona}
                                              </div>
                                              <div>
                                                <p className="font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                                  Zone {zona.zona}
                                                </p>
                                                <p className="text-sm text-[#666666]">
                                                  {zona.tipo}
                                                </p>
                                                <p className="text-xs text-[#999999]">
                                                  {zona.cantidad} emplacement{zona.cantidad !== 1 ? 's' : ''} ({zona.zona}1 à {zona.zona}{zona.cantidad})
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex gap-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleEditarZona(zona.zona)}
                                              style={{ color: branding.secondaryColor }}
                                            >
                                              <Edit className="w-4 h-4 mr-1" />
                                              Modifier
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleEliminarZona(zona.zona)}
                                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                              <Trash2 className="w-4 h-4 mr-1" />
                                              Supprimer
                                            </Button>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                  <div className="flex justify-end pt-4 border-t">
                                    <Button variant="outline" onClick={() => setDialogGestionarZonas(false)}>
                                      Fermer
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                          <Select value={zonaSeleccionada} onValueChange={setZonaSeleccionada}>
                            <SelectTrigger>
                              <SelectValue placeholder={t('labels.selectZone')} />
                            </SelectTrigger>
                            <SelectContent>
                              {ubicacionesPredefinidas.map(ub => (
                                <SelectItem key={ub.zona} value={ub.zona}>
                                  {t('labels.zone')} {ub.zona} - {ub.tipo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{t('labels.number')}</Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
                            value={numeroUbicacion}
                            onChange={(e) => setNumeroUbicacion(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('labels.descriptionOptional')}</Label>
                        <Input
                          placeholder={t('labels.descriptionPlaceholder')}
                          value={descripcionUbicacion}
                          onChange={(e) => setDescripcionUbicacion(e.target.value)}
                        />
                      </div>
                      {zonaSeleccionada && numeroUbicacion && (
                        <div 
                          className="p-4 rounded-lg border-2"
                          style={{ 
                            backgroundColor: `${branding.primaryColor}10`,
                            borderColor: `${branding.primaryColor}30`
                          }}
                        >
                          <p className="text-sm text-[#666666] mb-2">{t('labels.preview')}:</p>
                          <p 
                            className="font-bold text-lg"
                            style={{ color: branding.primaryColor }}
                          >
                            {zonaSeleccionada}{numeroUbicacion}
                          </p>
                          <p className="text-xs text-[#666666]">
                            {t('labels.code')}: {generarCodigoUbicacion(`${zonaSeleccionada}${numeroUbicacion}`)}
                          </p>
                        </div>
                      )}
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={limpiarFormulario}>
                          {t('common.cancel')}
                        </Button>
                        <Button 
                          onClick={handleCrearEtiquetaUbicacion}
                          className="text-white"
                          style={{ 
                            background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`,
                            boxShadow: `0 4px 15px ${branding.secondaryColor}40`
                          }}
                        >
                          {t('labels.createLabel')}
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="producto" className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t('labels.product')}</Label>
                        <Select value={productoSeleccionado} onValueChange={setProductoSeleccionado}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('labels.selectProduct')} />
                          </SelectTrigger>
                          <SelectContent>
                            {todosLosProductos.map(prod => (
                              <SelectItem key={prod.id} value={prod.id}>
                                {prod.nombre} ({prod.codigo})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {productoSeleccionado && (() => {
                        const prod = todosLosProductos.find(p => p.id === productoSeleccionado);
                        return prod ? (
                          <div 
                            className="p-4 rounded-lg space-y-2 border-2"
                            style={{ 
                              backgroundColor: `${branding.primaryColor}10`,
                              borderColor: `${branding.primaryColor}30`
                            }}
                          >
                            <p className="text-sm text-[#666666]">{t('labels.preview')}:</p>
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{prod.icono || categoriasInfo[prod.categoria]?.icono || '📦'}</span>
                              <div>
                                <p className="font-bold text-lg">{prod.nombre}</p>
                                <p className="text-sm text-[#666666]">{t('labels.code')}: {prod.codigo}</p>
                                <p className="text-xs text-[#666666]">{t('labels.category')}: {getCategoriaLabel(prod.categoria)}</p>
                                {prod.lote && <p className="text-xs text-[#666666]">{t('labels.lot')}: {prod.lote}</p>}
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={limpiarFormulario}>
                          {t('common.cancel')}
                        </Button>
                        <Button 
                          onClick={handleCrearEtiquetaProducto}
                          className="text-white"
                          style={{ 
                            background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`,
                            boxShadow: `0 4px 15px ${branding.secondaryColor}40`
                          }}
                        >
                          {t('labels.createLabel')}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Estadísticas con glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div 
            className="backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-4 sm:p-6 border-l-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{ 
              borderLeftColor: branding.primaryColor,
              boxShadow: `0 4px 15px ${branding.primaryColor}20`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">{t('labels.totalLabels')}</p>
                <p 
                  className="font-bold text-2xl"
                  style={{ color: branding.primaryColor }}
                >
                  {etiquetasCreadas.length}
                </p>
              </div>
              <Tag 
                className="w-10 h-10 opacity-20" 
                style={{ color: branding.primaryColor }}
              />
            </div>
          </div>

          <div 
            className="backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-4 sm:p-6 border-l-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{ 
              borderLeftColor: branding.secondaryColor,
              boxShadow: `0 4px 15px ${branding.secondaryColor}20`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">{t('labels.locations')}</p>
                <p 
                  className="font-bold text-2xl"
                  style={{ color: branding.secondaryColor }}
                >
                  {etiquetasCreadas.filter(e => e.tipo === 'ubicacion').length}
                </p>
              </div>
              <MapPin 
                className="w-10 h-10 opacity-20" 
                style={{ color: branding.secondaryColor }}
              />
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-l-[#FFC107] transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">{t('labels.products')}</p>
                <p className="font-bold text-2xl text-[#FFC107]">
                  {etiquetasCreadas.filter(e => e.tipo === 'producto').length}
                </p>
              </div>
              <Package className="w-10 h-10 text-[#FFC107] opacity-20" />
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-l-[#DC3545] transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">{t('labels.selected')}</p>
                <p className="font-bold text-2xl text-[#DC3545]">
                  {etiquetasSeleccionadas.length}
                </p>
              </div>
              <Check className="w-10 h-10 text-[#DC3545] opacity-20" />
            </div>
          </div>
        </div>

        {/* Configuración de impresión con glassmorphism */}
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 border border-white/60">
          <h2 
            className="text-lg sm:text-xl font-bold mb-4"
            style={{ 
              fontFamily: 'Montserrat, sans-serif',
              color: branding.primaryColor 
            }}
          >
            {t('labels.printConfiguration')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>{t('labels.labelSize')}</Label>
              <Select value={tamanoEtiqueta} onValueChange={(v) => setTamanoEtiqueta(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pequena">{t('labels.small')} (6x4 cm)</SelectItem>
                  <SelectItem value="mediana">{t('labels.medium')} (10x6 cm)</SelectItem>
                  <SelectItem value="grande">{t('labels.large')} (14x8 cm)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('labels.codeFormat')}</Label>
              <Select value={formatoCodigo} onValueChange={(v) => setFormatoCodigo(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CODE128">CODE128</SelectItem>
                  <SelectItem value="EAN13">EAN-13</SelectItem>
                  <SelectItem value="CODE39">CODE39</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('labels.printColumns')}</Label>
              <Select value={columnasImpresion.toString()} onValueChange={(v) => setColumnasImpresion(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 {t('labels.column')}</SelectItem>
                  <SelectItem value="2">2 {t('labels.columns')}</SelectItem>
                  <SelectItem value="3">3 {t('labels.columns')}</SelectItem>
                  <SelectItem value="4">4 {t('labels.columns')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                onClick={() => setVistaPrevia(!vistaPrevia)} 
                variant="outline"
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                {vistaPrevia ? t('labels.hide') : t('labels.viewPreview')}
              </Button>
            </div>
          </div>
        </div>

        {/* Acciones masivas con glassmorphism */}
        {etiquetasCreadas.length > 0 && (
          <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 border border-white/60">
            <div className="flex flex-wrap items-center gap-3">
              <Checkbox
                id="select-all"
                checked={etiquetasSeleccionadas.length === etiquetasCreadas.length}
                onCheckedChange={toggleTodas}
              />
              <Label htmlFor="select-all" className="cursor-pointer font-medium">
                {t('labels.selectAll')} ({etiquetasCreadas.length})
              </Label>
              
              {etiquetasSeleccionadas.length > 0 && (
                <>
                  <div className="h-6 w-px bg-gray-300 mx-2" />
                  <Badge 
                    className="text-white"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    {etiquetasSeleccionadas.length} {t('labels.selected')}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={duplicarSeleccionadas}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {t('labels.duplicate')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={eliminarSeleccionadas}
                    className="text-[#DC3545] border-[#DC3545] hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {t('labels.delete')}
                  </Button>
                </>
              )}
              
              <div className="flex-1" />
              
              <Button
                onClick={imprimirEtiquetas}
                className="text-white"
                style={{ 
                  fontFamily: 'Montserrat, sans-serif', 
                  fontWeight: 500,
                  background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`,
                  boxShadow: `0 4px 15px ${branding.secondaryColor}40`
                }}
              >
                <Printer className="w-4 h-4 mr-2" />
                {t('labels.print')} {etiquetasSeleccionadas.length > 0 ? `${etiquetasSeleccionadas.length} ` : t('labels.printAll')}
              </Button>
            </div>
          </div>
        )}

        {/* Vista Previa con glassmorphism */}
        {vistaPrevia && etiquetasCreadas.length > 0 && (
          <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 border border-white/60">
            <h2 
              className="text-lg sm:text-xl font-bold mb-4"
              style={{ 
                fontFamily: 'Montserrat, sans-serif',
                color: branding.primaryColor 
              }}
            >
              {t('labels.previewLabels')}
            </h2>
            <VistaImpresion
              etiquetas={etiquetasSeleccionadas.length > 0 
                ? etiquetasSeleccionadas.map(i => etiquetasCreadas[i])
                : etiquetasCreadas
              }
              tamano={tamanoEtiqueta}
              formato={formatoCodigo}
              columnas={columnasImpresion}
            />
          </div>
        )}

        {/* Lista de Etiquetas con glassmorphism */}
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 border border-white/60">
          <h2 
            className="text-lg sm:text-xl font-bold mb-4"
            style={{ 
              fontFamily: 'Montserrat, sans-serif',
              color: branding.primaryColor 
            }}
          >
            {t('labels.createdLabels')} ({etiquetasCreadas.length})
          </h2>
          {etiquetasCreadas.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-16 h-16 text-[#CCCCCC] mx-auto mb-4" />
              <p className="text-[#666666] mb-2">{t('labels.noLabelsCreated')}</p>
              <p className="text-sm text-[#999999]">{t('labels.createFirstLabel')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {etiquetasCreadas.map((etiqueta, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
                    etiquetasSeleccionadas.includes(index)
                      ? 'bg-blue-50'
                      : ''
                  }`}
                  style={{
                    borderColor: etiquetasSeleccionadas.includes(index) 
                      ? branding.primaryColor 
                      : '#e5e7eb'
                  }}
                  onClick={() => toggleSeleccion(index)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={etiquetasSeleccionadas.includes(index)}
                      onCheckedChange={() => toggleSeleccion(index)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{etiqueta.icono}</span>
                        <div>
                          <h4 className="font-bold text-sm">{etiqueta.titulo}</h4>
                          {etiqueta.subtitulo && (
                            <p className="text-xs text-[#666666]">{etiqueta.subtitulo}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs">
                          {etiqueta.tipo === 'ubicacion' ? '📍 Ubicación' : '📦 Producto'}
                        </Badge>
                        <p className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                          {etiqueta.codigo}
                        </p>
                        {etiqueta.descripcion && (
                          <p className="text-xs text-[#666666] line-clamp-2">
                            {etiqueta.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}