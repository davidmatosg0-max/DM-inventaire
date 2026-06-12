import React, { useRef, useState } from 'react';
import { useBranding } from '../../../hooks/useBranding';
import {
  Package,
  Camera,
  Thermometer,
  Scale,
  ShoppingCart,
  Calendar,
  FileText,
  Settings,
  Box,
  Layers,
  Truck,
  Users
} from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { QuantityInput, parseQuantityText } from '../ui/quantity-input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useTranslation } from 'react-i18next';
import { formatMoney, formatQuantity } from '../../utils/formatUtils';
import { 
  obtenerContactosDepartamento,
  obtenerIdDepartamentoEntrepot,
  type ContactoDepartamento,
  sincronizarDonateursFournisseurs
} from '../../utils/contactosDepartamentoStorage';
import { Badge } from '../ui/badge';

interface FormEntradaProductoData {
  categoriaId: string;
  subcategoriaId: string;
  unidadId: string;
  cantidad: number;
  peso: number;
  temperatura: string;
  programaEntradaId: string;
  lote: string;
  fechaCaducidad: string;
  proveedor: string;
  proveedorContacto?: string;
  proveedorTelefono?: string;
  observaciones: string;
  imagen: string | null;
  valorUnitario?: number; // ✅ AGREGADO: Valor monetario por unidad en CAD$
  valorTotal?: number; // ✅ AGREGADO: Valor total calculado (cantidad × valorUnitario)
}

interface Categoria {
  id: string;
  nombre: string;
  icono: string;
  subcategorias: Subcategoria[];
}

interface Subcategoria {
  id: string;
  nombre: string;
  icono: string;
}

interface Unidad {
  id: string;
  nombre: string;
  abreviatura: string;
  pesoUnidad?: number; // Peso de la unidad en kg
}

interface ProgramaEntrada {
  id: string;
  nombre: string;
  codigo: string;
  color: string;
}

interface FormularioEntradaProductoCompactoProps {
  abierto: boolean;
  onCerrar: () => void;
  formulario: FormEntradaProductoData;
  setFormulario: React.Dispatch<React.SetStateAction<FormEntradaProductoData>>;
  onGuardar: () => void;
  categorias: Categoria[];
  unidades: Unidad[];
  programasEntrada: ProgramaEntrada[];
}

export function FormularioEntradaProductoCompacto({
  abierto,
  onCerrar,
  formulario,
  setFormulario,
  onGuardar,
  categorias,
  unidades,
  programasEntrada
}: FormularioEntradaProductoCompactoProps) {
  const branding = useBranding();
  const { t } = useTranslation();
  const departamentoEntrepotId = obtenerIdDepartamentoEntrepot();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormulario({ ...formulario, imagen: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const categoriaSeleccionada = categorias.find(c => c.id === formulario.categoriaId);
  const subcategoriasDisponibles = categoriaSeleccionada?.subcategorias || [];

  const temperaturasAlmacenamiento = [
    { value: 'ambiente', label: t('warehouse.ambient'), icon: '🌡️', color: '#FFC107' },
    { value: 'refrigerado', label: t('warehouse.refrigerated'), icon: '❄️', color: '#4A90E2' },
    { value: 'congelado', label: t('warehouse.frozen'), icon: '🧊', color: '#1E73BE' },
    { value: 'fresco', label: t('warehouse.fresh'), icon: '🌿', color: '#2d9561' },
  ];

  const [contactos, setContactos] = useState<ContactoDepartamento[]>([]);
  const [dialogContactos, setDialogContactos] = useState(false);
  const [modoProveedorManual, setModoProveedorManual] = useState(false);

  // Función para obtener el nombre completo de un contacto
  const obtenerNombreCompleto = (contacto: ContactoDepartamento): string => {
    return `${contacto.nombre} ${contacto.apellido}`.trim();
  };

  // Cargar contactos al abrir el diálogo
  React.useEffect(() => {
    if (abierto) {
      // ✅ SINCRONIZAR DONATEURS/FOURNISSEURS PRIMERO
      console.log('🔄 Sincronizando donateurs/fournisseurs con contactos...');
      const resultado = sincronizarDonateursFournisseurs();
      console.log(`✅ Sincronización completada: ${resultado.sincronizados} sincronizados, ${resultado.errores} errores`);
      
      const todosContactos = obtenerContactosDepartamento(departamentoEntrepotId);
      console.log(`📋 Total contactos en Entrepôt: ${todosContactos.length}`);
      
      // Filtrar solo proveedores (fournisseur) y donadores (donador)
      const contactosFiltrados = todosContactos.filter(
        c => c.tipo === 'fournisseur' || c.tipo === 'donador'
      );
      console.log(`📦 Fournisseurs: ${contactosFiltrados.filter(c => c.tipo === 'fournisseur').length}`);
      console.log(`🎁 Donateurs: ${contactosFiltrados.filter(c => c.tipo === 'donador').length}`);
      
      setContactos(contactosFiltrados);
    }
  }, [abierto, departamentoEntrepotId]);

  // Escuchar evento de restauración de contactos para actualizar automáticamente
  React.useEffect(() => {
    const handleContactosRestaurados = (event: any) => {
      const { departamentoId } = event.detail || {};
      if (departamentoId === departamentoEntrepotId) {
        const todosContactos = obtenerContactosDepartamento(departamentoEntrepotId);
        const contactosFiltrados = todosContactos.filter(
          c => c.tipo === 'fournisseur' || c.tipo === 'donador'
        );
        setContactos(contactosFiltrados);
      }
    };

    window.addEventListener('contactos-restaurados', handleContactosRestaurados);
    return () => {
      window.removeEventListener('contactos-restaurados', handleContactosRestaurados);
    };
  }, [departamentoEntrepotId]);

  const handleSeleccionarContacto = (contacto: ContactoDepartamento) => {
    setFormulario({
      ...formulario,
      proveedor: obtenerNombreCompleto(contacto),
      proveedorContacto: `${contacto.nombre} ${contacto.apellido}`.trim(),
      proveedorTelefono: contacto.telefono
    });
    setDialogContactos(false);
  };

  const handleSeleccionarContactoPorId = (contactoId: string) => {
    if (contactoId === 'manual') {
      setModoProveedorManual(true);
      setFormulario({
        ...formulario,
        proveedor: '',
        proveedorContacto: '',
        proveedorTelefono: ''
      });
      return;
    }

    const contacto = contactos.find(c => c.id === contactoId);
    if (contacto) {
      setModoProveedorManual(false);
      setFormulario({
        ...formulario,
        proveedor: obtenerNombreCompleto(contacto),
        proveedorContacto: `${contacto.nombre} ${contacto.apellido}`.trim(),
        proveedorTelefono: contacto.telefono
      });
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent 
        className="!max-w-none !w-screen !max-h-screen !h-screen !top-0 !left-0 !translate-x-0 !translate-y-0 overflow-hidden p-0 m-0 rounded-none border-0"
        aria-describedby="product-entry-form-description"
      >
        <div className="h-full flex flex-col">
          <DialogHeader className="sticky top-0 z-10 bg-white border-b-2 border-[#E0E0E0] px-6 py-3 shadow-sm">
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '1.25rem' }}>
              <Package className="w-5 h-5 inline mr-2" />
              {t('warehouse.newProductEntry')}
            </DialogTitle>
            <DialogDescription id="product-entry-form-description">
              {t('warehouse.productEntryDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex">
            {/* Sidebar izquierda: Imagen y Programa */}
            <div className="w-64 border-r-2 border-[#E0E0E0] bg-[#F9FAFB] p-4 overflow-y-auto scrollbar-thin">
              {/* Image du Produit */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-[#666666] mb-3 uppercase tracking-wide">
                  {t('warehouse.productImage')}
                </h4>
                <div className="flex justify-center">
                  <div className="relative">
                    <div 
                      className="w-28 h-28 rounded-lg border-4 overflow-hidden bg-white flex items-center justify-center"
                      style={{ borderColor: branding.primaryColor }}
                    >
                      {formulario.imagen ? (
                        <img src={formulario.imagen} alt="Product" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-14 h-14 text-gray-400" />
                      )}
                    </div>
                    <Button
                      size="icon"
                      type="button"
                      className="absolute bottom-0 right-0 rounded-full text-white h-8 w-8"
                      style={{ backgroundColor: branding.primaryColor }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImagenChange}
                    />
                  </div>
                </div>
              </div>

              {/* Programme d'Entrée */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-[#666666] mb-3 uppercase tracking-wide">
                  {t('warehouse.entryProgram')}
                </h4>
                <div className="space-y-2">
                  {programasEntrada.map((programa) => {
                    const isSelected = formulario.programaEntradaId === programa.id;
                    return (
                      <div
                        key={programa.id}
                        onClick={() => setFormulario({ ...formulario, programaEntradaId: programa.id })}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm ${
                          isSelected ? 'ring-2' : ''
                        }`}
                        style={{
                          borderColor: isSelected ? programa.color : '#E0E0E0',
                          backgroundColor: isSelected ? `${programa.color}15` : 'white',
                          ringColor: programa.color
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#333333]">
                            {programa.nombre}
                          </span>
                          <span 
                            className="text-xs font-bold px-2 py-0.5 rounded"
                            style={{ 
                              backgroundColor: `${programa.color}30`,
                              color: programa.color
                            }}
                          >
                            {programa.codigo}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Température */}
              <div>
                <h4 className="text-sm font-semibold text-[#666666] mb-3 uppercase tracking-wide">
                  {t('warehouse.temperature')}
                </h4>
                <div className="space-y-2">
                  {temperaturasAlmacenamiento.map((temp) => {
                    const isSelected = formulario.temperatura === temp.value;
                    return (
                      <div
                        key={temp.value}
                        onClick={() => setFormulario({ ...formulario, temperatura: temp.value })}
                        className={`p-2 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm ${
                          isSelected ? 'ring-2' : ''
                        }`}
                        style={{
                          borderColor: isSelected ? temp.color : '#E0E0E0',
                          backgroundColor: isSelected ? `${temp.color}15` : 'white',
                          ringColor: temp.color
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="text-lg">
                            {temp.icon}
                          </div>
                          <span className="text-xs font-medium text-[#333333] leading-tight">
                            {temp.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Contenido principal con Tabs */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Tabs defaultValue="base" className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b bg-[#F9FAFB] px-6 py-0 h-12">
                  <TabsTrigger value="base" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Box className="w-4 h-4 mr-2" />
                    {t('warehouse.productInfo')}
                  </TabsTrigger>
                  <TabsTrigger value="quantite" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Scale className="w-4 h-4 mr-2" />
                    {t('warehouse.quantityWeight')}
                  </TabsTrigger>
                  <TabsTrigger value="traçabilite" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Calendar className="w-4 h-4 mr-2" />
                    {t('warehouse.traceability')}
                  </TabsTrigger>
                  <TabsTrigger value="fournisseur" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Truck className="w-4 h-4 mr-2" />
                    {t('warehouse.supplier')}
                  </TabsTrigger>
                  <TabsTrigger value="autres" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Settings className="w-4 h-4 mr-2" />
                    {t('warehouse.other')}
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Información del Producto */}
                <TabsContent value="base" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="categoria" className="text-xs">
                          <Layers className="w-3 h-3 inline mr-1" />
                          {t('warehouse.category')} *
                        </Label>
                        <Select 
                          value={formulario.categoriaId} 
                          onValueChange={(value) => {
                            setFormulario({ ...formulario, categoriaId: value, subcategoriaId: '' });
                          }}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder={t('warehouse.selectCategory')} />
                          </SelectTrigger>
                          <SelectContent>
                            {categorias.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.icono} {cat.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="subcategoria" className="text-xs">
                          {t('warehouse.subcategory')} *
                        </Label>
                        <Select 
                          value={formulario.subcategoriaId} 
                          onValueChange={(value) => setFormulario({ ...formulario, subcategoriaId: value })}
                          disabled={!formulario.categoriaId}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder={t('warehouse.selectSubcategory')} />
                          </SelectTrigger>
                          <SelectContent>
                            {subcategoriasDisponibles.map(sub => (
                              <SelectItem key={sub.id} value={sub.id}>
                                {sub.icono} {sub.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="unidad" className="text-xs">
                        {t('warehouse.unit')} *
                      </Label>
                      <Select 
                        value={formulario.unidadId} 
                        onValueChange={(value) => setFormulario({ ...formulario, unidadId: value })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={t('warehouse.selectUnit')} />
                        </SelectTrigger>
                        <SelectContent>
                          {unidades.map(unidad => (
                            <SelectItem key={unidad.id} value={unidad.id}>
                              {unidad.nombre} ({unidad.abreviatura})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Cantidad y Peso */}
                <TabsContent value="quantite" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cantidad" className="text-xs">
                          <Package className="w-3 h-3 inline mr-1" />
                          {t('warehouse.quantity')} *
                        </Label>
                        <QuantityInput
                          id="cantidad"
                          value={formulario.cantidad}
                          onChangeText={(value) => {
                            const cantidad = parseQuantityText(value, false) || 0;
                            const valorUnitario = formulario.valorUnitario || 0;
                            setFormulario({ 
                              ...formulario, 
                              cantidad,
                              valorTotal: cantidad * valorUnitario
                            });
                          }}
                          step={1}
                          min={0}
                          placeholder="10"
                          className="h-9"
                          buttonClassName="h-9 w-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="peso" className="text-xs">
                          <Scale className="w-3 h-3 inline mr-1" />
                          {(() => {
                            const unidadSeleccionada = unidades.find(u => u.id === formulario.unidadId);
                            const tieneTara = unidadSeleccionada?.pesoUnidad && unidadSeleccionada.pesoUnidad > 0;
                            return tieneTara ? 'Poids total (avec l\'unité)' : t('warehouse.weight');
                          })()} (kg) *
                        </Label>
                        <QuantityInput
                          id="peso"
                          value={formulario.peso}
                          onChangeText={(value) => setFormulario({ ...formulario, peso: parseQuantityText(value, false) || 0 })}
                          step={1}
                          min={0}
                          placeholder="26"
                          className="h-9"
                          buttonClassName="h-9 w-9"
                        />
                      </div>
                    </div>

                    {/* ✅ NUEVO: Campos de Valor Monetario */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="valorUnitario" className="text-xs">
                          💰 Valeur unitaire (CAD$)
                        </Label>
                        <Input
                          id="valorUnitario"
                          type="number"
                          step="1"
                          min="0"
                          value={formulario.valorUnitario || ''}
                          onChange={(e) => {
                            const valorUnitario = Math.round(parseFloat(e.target.value) || 0);
                            const cantidad = formulario.cantidad || 0;
                            setFormulario({ 
                              ...formulario, 
                              valorUnitario,
                              valorTotal: cantidad * valorUnitario
                            });
                          }}
                          placeholder="2.50"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="valorTotal" className="text-xs">
                          💵 Valeur totale (CAD$)
                        </Label>
                        <Input
                          id="valorTotal"
                          type="text"
                          value={formatMoney(formulario.valorTotal || 0)}
                          readOnly
                          disabled
                          className="h-9 bg-gray-50 text-gray-700 font-bold"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Información de valor monetario */}
                    {formulario.valorUnitario && formulario.valorUnitario > 0 && (
                      <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">💰</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-green-900 mb-2">
                              Calcul de la valeur monétaire
                            </h4>
                            <div className="grid grid-cols-3 gap-3 text-xs">
                              <div className="bg-white p-2 rounded border border-green-300">
                                <p className="text-green-700 font-medium mb-1">Valeur unitaire:</p>
                                <p className="text-lg font-bold text-green-900">CAD$ {formatMoney(formulario.valorUnitario || 0)}</p>
                              </div>
                              <div className="bg-white p-2 rounded border border-green-300">
                                <p className="text-green-700 font-medium mb-1">Quantité:</p>
                                <p className="text-lg font-bold text-green-900">{formatQuantity(formulario.cantidad)} {unidades.find(u => u.id === formulario.unidadId)?.abreviatura || 'unités'}</p>
                              </div>
                              <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-2 rounded border-2 border-green-500">
                                <p className="text-green-700 font-medium mb-1">Valeur totale:</p>
                                <p className="text-lg font-bold text-green-700">CAD$ {formatMoney(formulario.valorTotal || 0)}</p>
                              </div>
                            </div>
                            <p className="text-xs text-green-700 mt-2">
                              💡 La valeur sera enregistrée avec l'entrée et mise à jour dans l'inventaire avec moyenne pondérée
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Información de deducción de tara */}
                    {(() => {
                      const unidadSeleccionada = unidades.find(u => u.id === formulario.unidadId);
                      const tieneTara = unidadSeleccionada?.pesoUnidad && unidadSeleccionada.pesoUnidad > 0;
                      
                      if (tieneTara) {
                        const pesoTara = unidadSeleccionada!.pesoUnidad!;
                        const pesoTaraTotal = pesoTara * formulario.cantidad; // Multiplicar tara por cantidad
                        const pesoNeto = Math.max(0, formulario.peso - pesoTaraTotal);
                        
                        return (
                          <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">⚖️</div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm text-amber-900 mb-2">
                                  Calcul automatique avec déduction de tare
                                </h4>
                                <div className="grid grid-cols-3 gap-3 text-xs">
                                  <div className="bg-white p-2 rounded border border-amber-300">
                                    <p className="text-amber-700 font-medium mb-1">Poids total:</p>
                                    <p className="text-lg font-bold text-amber-900">{formatQuantity(formulario.peso)} kg</p>
                                  </div>
                                  <div className="bg-white p-2 rounded border border-amber-300">
                                    <p className="text-amber-700 font-medium mb-1">Tare ({unidadSeleccionada!.abreviatura}):</p>
                                    <p className="text-lg font-bold text-red-600">- {formatQuantity(pesoTaraTotal)} kg</p>
                                    {formulario.cantidad > 1 && (
                                      <p className="text-[10px] text-amber-600 mt-1">
                                        ({formatQuantity(pesoTara)} kg × {formatQuantity(formulario.cantidad)})
                                      </p>
                                    )}
                                  </div>
                                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-2 rounded border-2 border-green-400">
                                    <p className="text-green-700 font-medium mb-1">Poids net:</p>
                                    <p className="text-lg font-bold text-green-700">= {formatQuantity(pesoNeto)} kg</p>
                                  </div>
                                </div>
                                <p className="text-xs text-amber-700 mt-2">
                                  💡 Le poids de {formulario.cantidad > 1 ? `${formatQuantity(formulario.cantidad)} unités` : "l'unité"} ({formatQuantity(pesoTaraTotal)} kg) sera automatiquement déduit lors de l'enregistrement
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-sm text-blue-900 mb-1">
                            {t('warehouse.totalCalculation')}
                          </h4>
                          <p className="text-xs text-blue-700">
                            {t('warehouse.totalQuantity')}: <strong>{formulario.cantidad}</strong> {unidades.find(u => u.id === formulario.unidadId)?.abreviatura || 'unités'}
                          </p>
                          <p className="text-xs text-blue-700">
                            {t('warehouse.totalWeight')}: <strong>{(() => {
                              const unidadSeleccionada = unidades.find(u => u.id === formulario.unidadId);
                              const tieneTara = unidadSeleccionada?.pesoUnidad && unidadSeleccionada.pesoUnidad > 0;
                              if (tieneTara) {
                                const pesoTaraTotal = unidadSeleccionada!.pesoUnidad! * formulario.cantidad;
                                const pesoNeto = Math.max(0, formulario.peso - pesoTaraTotal);
                                return formatQuantity(pesoNeto);
                              }
                              return formatQuantity(formulario.peso);
                            })()}</strong> kg {(() => {
                              const unidadSeleccionada = unidades.find(u => u.id === formulario.unidadId);
                              const tieneTara = unidadSeleccionada?.pesoUnidad && unidadSeleccionada.pesoUnidad > 0;
                              return tieneTara ? '(net)' : '';
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Traçabilité */}
                <TabsContent value="traçabilite" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lote" className="text-xs">
                          <FileText className="w-3 h-3 inline mr-1" />
                          {t('warehouse.batch')}
                        </Label>
                        <Input
                          id="lote"
                          value={formulario.lote}
                          onChange={(e) => setFormulario({ ...formulario, lote: e.target.value })}
                          placeholder="LOT-2024-001"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fechaCaducidad" className="text-xs">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {t('warehouse.expirationDate')}
                        </Label>
                        <Input
                          id="fechaCaducidad"
                          type="date"
                          value={formulario.fechaCaducidad}
                          onChange={(e) => setFormulario({ ...formulario, fechaCaducidad: e.target.value })}
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Fournisseur */}
                <TabsContent value="fournisseur" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="proveedor" className="text-xs">
                          <Truck className="w-3 h-3 inline mr-1" />
                          {t('warehouse.supplier')} / Donateur
                        </Label>
                        {!modoProveedorManual && (
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            onClick={() => setModoProveedorManual(true)}
                            className="h-6 text-xs px-0"
                            style={{ color: branding.primaryColor }}
                          >
                            ✏️ Saisie manuelle
                          </Button>
                        )}
                        {modoProveedorManual && (
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            onClick={() => setModoProveedorManual(false)}
                            className="h-6 text-xs px-0"
                            style={{ color: branding.primaryColor }}
                          >
                            📋 Sélectionner du répertoire
                          </Button>
                        )}
                      </div>
                      
                      {!modoProveedorManual && (contactos.length > 0) ? (
                        <Select 
                          value={
                            contactos.find(c => 
                              obtenerNombreCompleto(c) === formulario.proveedor
                            )?.id || ''
                          }
                          onValueChange={handleSeleccionarContactoPorId}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Sélectionner un fournisseur ou donateur" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[400px]">
                            {contactos.length > 0 && (
                              <>
                                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                                  📦 Fournisseurs ({contactos.filter(c => c.tipo === 'fournisseur').length})
                                </div>
                                {contactos.filter(c => c.tipo === 'fournisseur').map((contacto) => (
                                  <SelectItem key={contacto.id} value={contacto.id}>
                                    <div className="flex items-center gap-2">
                                      <span>📦</span>
                                      <span className={contacto.activo ? '' : 'text-gray-400'}>
                                        {obtenerNombreCompleto(contacto)}
                                      </span>
                                      {!contacto.activo && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">
                                          Inactif
                                        </span>
                                      )}
                                      <span className="text-xs text-gray-500">
                                        • {contacto.telefono}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </>
                            )}
                            {contactos.length > 0 && (
                              <>
                                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 mt-1">
                                  🎁 Donateurs ({contactos.filter(c => c.tipo === 'donador').length})
                                </div>
                                {contactos.filter(c => c.tipo === 'donador').map((contacto) => (
                                  <SelectItem key={contacto.id} value={contacto.id}>
                                    <div className="flex items-center gap-2">
                                      <span>🎁</span>
                                      <span className={contacto.activo ? '' : 'text-gray-400'}>
                                        {obtenerNombreCompleto(contacto)}
                                      </span>
                                      {!contacto.activo && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">
                                          Inactif
                                        </span>
                                      )}
                                      <span className="text-xs text-gray-500">
                                        • {contacto.telefono}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      ) : !modoProveedorManual ? (
                        <div className="space-y-2">
                          <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-lg">
                            <p className="text-xs text-amber-800 text-center">
                              ⚠️ Aucun contact disponible. Créez des fournisseurs ou donateurs dans la gestion de l'entrepôt.
                            </p>
                          </div>
                          <Input
                            id="proveedor"
                            value={formulario.proveedor}
                            onChange={(e) => setFormulario({ ...formulario, proveedor: e.target.value })}
                            placeholder={t('warehouse.supplierPlaceholder')}
                            className="h-9"
                          />
                        </div>
                      ) : (
                        <Input
                          id="proveedor"
                          value={formulario.proveedor}
                          onChange={(e) => setFormulario({ ...formulario, proveedor: e.target.value })}
                          placeholder={t('warehouse.supplierPlaceholder')}
                          className="h-9"
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="proveedorContacto" className="text-xs">
                          {t('warehouse.supplierContact')}
                        </Label>
                        <Input
                          id="proveedorContacto"
                          value={formulario.proveedorContacto || ''}
                          onChange={(e) => setFormulario({ ...formulario, proveedorContacto: e.target.value })}
                          placeholder="Jean Dupont"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="proveedorTelefono" className="text-xs">
                          {t('warehouse.supplierPhone')}
                        </Label>
                        <Input
                          id="proveedorTelefono"
                          type="tel"
                          value={formulario.proveedorTelefono || ''}
                          onChange={(e) => setFormulario({ ...formulario, proveedorTelefono: e.target.value })}
                          placeholder="+1 (514) 123-4567"
                          className="h-9"
                        />
                      </div>
                    </div>
                    
                    {/* Información del contacto seleccionado */}
                    {!modoProveedorManual && formulario.proveedor && (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0"
                            style={{ 
                              backgroundColor: contactos.find(c => 
                                obtenerNombreCompleto(c) === formulario.proveedor
                              )?.tipo === 'fournisseur' ? '#1E73BE' : '#FF5722' 
                            }}
                          >
                            {formulario.proveedor.split(' ').map(n => n.charAt(0)).join('')}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-gray-900 mb-1">
                              {formulario.proveedor}
                            </h4>
                            {formulario.proveedorContacto && (
                              <p className="text-xs text-gray-600">
                                👤 Contact: {formulario.proveedorContacto}
                              </p>
                            )}
                            {formulario.proveedorTelefono && (
                              <p className="text-xs text-gray-600">
                                📞 Téléphone: {formulario.proveedorTelefono}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Mostrar contactos disponibles - eliminado, ahora está en el Select */}
                  </div>
                </TabsContent>

                {/* Tab: Autres */}
                <TabsContent value="autres" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div>
                      <Label htmlFor="observaciones" className="text-xs">
                        <FileText className="w-3 h-3 inline mr-1" />
                        {t('warehouse.observations')}
                      </Label>
                      <Textarea
                        id="observaciones"
                        value={formulario.observaciones}
                        onChange={(e) => setFormulario({ ...formulario, observaciones: e.target.value })}
                        placeholder={t('warehouse.observationsPlaceholder')}
                        rows={6}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Footer con botones de acción */}
              <div className="sticky bottom-0 bg-white border-t-2 border-[#E0E0E0] px-6 py-3 shadow-sm flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={onCerrar}
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={onGuardar}
                  className="text-white"
                  style={{ 
                    backgroundColor: branding.secondaryColor,
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600
                  }}
                >
                  {t('common.save')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Diálogo de selección de contactos */}
      <Dialog open={dialogContactos} onOpenChange={setDialogContactos}>
        <DialogContent 
          className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
          aria-describedby="select-contact-description"
        >
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              <Users className="w-5 h-5 inline mr-2" />
              Sélectionner un fournisseur ou donateur
            </DialogTitle>
            <DialogDescription id="select-contact-description">
              Choisissez un contact du répertoire pour auto-compléter les informations
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {/* Proveedores */}
            {contactos.filter(c => c.tipo === 'fournisseur').length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  📦 Fournisseurs ({contactos.filter(c => c.tipo === 'fournisseur').length})
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {contactos.filter(c => c.tipo === 'fournisseur').map((contacto) => (
                    <div
                      key={contacto.id}
                      onClick={() => handleSeleccionarContacto(contacto)}
                      className="p-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0"
                          style={{ backgroundColor: '#1E73BE' }}
                        >
                          {contacto.nombre.charAt(0)}{contacto.apellido.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {obtenerNombreCompleto(contacto)}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {contacto.nombre} {contacto.apellido}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            📞 {contacto.telefono}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            ✉️ {contacto.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Donateurs */}
            {contactos.filter(c => c.tipo === 'donador').length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  🎁 Donateurs ({contactos.filter(c => c.tipo === 'donador').length})
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {contactos.filter(c => c.tipo === 'donador').map((contacto) => (
                    <div
                      key={contacto.id}
                      onClick={() => handleSeleccionarContacto(contacto)}
                      className="p-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0"
                          style={{ backgroundColor: '#FF5722' }}
                        >
                          {contacto.nombre.charAt(0)}{contacto.apellido.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {obtenerNombreCompleto(contacto)}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {contacto.nombre} {contacto.apellido}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            📞 {contacto.telefono}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            ✉️ {contacto.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contactos.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Aucun contact disponible</p>
                <p className="text-sm text-gray-400 mt-2">
                  Créez des contacts dans la gestion de l'entrepôt
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setDialogContactos(false)}
            >
              Annuler
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}