import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../../hooks/useBranding';
import { FileText, Printer, Calendar, Filter, Download, X, Package, Building2, Thermometer, Wind, Snowflake, Tag, Sparkles, DollarSign } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { obtenerTodasLasEntradas, type EntradaInventario } from '../utils/entradaInventarioStorage';
import { formatBrandingContactLine, normalizeBrandingPrintConfig } from '../utils/brandingPrint';
import { printStandardLabel, type ProductLabelData } from './etiquetas/StandardProductLabel';
import { obtenerValorPorKg } from '../utils/categoriaStorage';
import { formatMoney, formatQuantity } from '../utils/formatUtils';

export function VerificacionesRecientes() {
  const { t } = useTranslation();
  const branding = useBranding();
  const brandingPrint = normalizeBrandingPrintConfig(branding);
  const nombreSistemaImpresion = brandingPrint.systemName;
  const brandingContactLine = formatBrandingContactLine(brandingPrint);
  const [open, setOpen] = useState(false);
  const [entradas, setEntradas] = useState<EntradaInventario[]>([]);
  const [filteredEntradas, setFilteredEntradas] = useState<EntradaInventario[]>([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos');

  useEffect(() => {
    if (open) {
      cargarEntradas();
    }
  }, [open]);

  useEffect(() => {
    aplicarFiltros();
  }, [entradas, fechaInicio, fechaFin, tipoFiltro]);

  const cargarEntradas = () => {
    const todasLasEntradas = obtenerTodasLasEntradas()
      .filter(e => e.activo)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    setEntradas(todasLasEntradas);
  };

  const aplicarFiltros = () => {
    let resultado = [...entradas];

    // Filtro por tipo
    if (tipoFiltro !== 'todos') {
      resultado = resultado.filter(e => e.tipoEntrada === tipoFiltro);
    }

    // Filtro por fechas
    if (fechaInicio) {
      resultado = resultado.filter(e => new Date(e.fecha) >= new Date(fechaInicio));
    }
    if (fechaFin) {
      resultado = resultado.filter(e => new Date(e.fecha) <= new Date(fechaFin + 'T23:59:59'));
    }

    setFilteredEntradas(resultado);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTemperaturaIcon = (temperatura: string) => {
    switch (temperatura) {
      case 'ambiente':
        return <Thermometer className="w-4 h-4 text-[#FFC107]" />;
      case 'refrigerado':
        return <Wind className="w-4 h-4 text-[#2196F3]" />;
      case 'congelado':
        return <Snowflake className="w-4 h-4 text-[#00BCD4]" />;
      default:
        return null;
    }
  };

  const getTemperaturaText = (temperatura: string) => {
    switch (temperatura) {
      case 'ambiente':
        return 'Ambiant';
      case 'refrigerado':
        return 'Réfrigéré';
      case 'congelado':
        return 'Congelé';
      default:
        return temperatura;
    }
  };

  // Calcular valor monetario de una entrada
  const calcularValorMonetario = (entrada: EntradaInventario): number => {
    const categoria = entrada.productoCategoria || entrada.categoria || '';
    const subcategoria = entrada.productoSubcategoria || entrada.subcategoria || '';
    const varianteId = entrada.varianteId;
    
    const valorPorKg = obtenerValorPorKg(categoria, subcategoria, varianteId);
    
    if (valorPorKg && entrada.pesoTotal) {
      return valorPorKg * entrada.pesoTotal;
    }
    
    return 0;
  };

  const tiposUnicos = Array.from(new Set(entradas.map(e => e.tipoEntrada).filter(Boolean)));

  const totalPeso = filteredEntradas.reduce((sum, e) => sum + (e.pesoTotal || 0), 0);
  const totalCantidad = filteredEntradas.reduce((sum, e) => sum + (e.cantidad || 0), 0);
  const totalValorMonetario = filteredEntradas.reduce((sum, e) => sum + calcularValorMonetario(e), 0);

  const handleReimprimirEtiqueta = async (entrada: EntradaInventario) => {
    const labelData: ProductLabelData = {
      id: entrada.id,
      nombreProducto: entrada.nombreProducto,
      productoIcono: entrada.productoIcono,
      categoria: entrada.productoCategoria,
      subcategoria: entrada.productoSubcategoria,
      cantidad: entrada.cantidad,
      unidad: entrada.unidad,
      pesoTotal: entrada.pesoTotal,
      pesoUnidad: entrada.pesoUnidad,
      temperatura: entrada.temperatura as 'ambiente' | 'refrigerado' | 'congelado',
      lote: entrada.lote,
      fechaCaducidad: entrada.fechaCaducidad,
      programa: entrada.programaNombre,
      programaIcono: entrada.programaIcono,
      programaColor: entrada.programaColor,
      donadorNombre: entrada.donadorNombre,
      fechaEntrada: entrada.fecha,
      translations: {
        foodBank: nombreSistemaImpresion,
        productLabel: 'Étiquette du Produit',
        quantity: 'QUANTITÉ',
        temperature: 'TEMPÉRATURE',
        lot: 'LOT',
        expiryDate: "DATE D'EXPIRATION",
        weight: 'POIDS',
        program: 'PROGRAMME',
        entryDate: "DATE D'ENTRÉE",
        systemFooter: 'Système de Gestion des Stocks',
        ambient: 'Ambiant',
        refrigerated: 'Réfrigéré',
        frozen: 'Congelé',
      }
    };

    try {
      await printStandardLabel(labelData);
    } catch (err) {
      console.error('Error al reimprimer etiqueta:', err);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            size="icon"
            variant="outline"
            className="border-2 border-[#1E73BE] text-[#1E73BE] hover:bg-[#E3F2FD] hover:border-[#155a99] shadow-md hover:shadow-lg transition-all"
            title="Vérifications Récentes"
            aria-label="Vérifications Récentes"
          >
            <FileText className="w-5 h-5" />
          </Button>
        </DialogTrigger>
        
        <DialogContent 
          className="max-w-none !w-[95vw] !h-[95vh] overflow-hidden !p-0"
          aria-describedby="verificaciones-recientes-description"
        >
          {/* Header - No se imprime */}
          <div className="print:hidden">
            <DialogHeader 
              className="px-6 pt-6 pb-4 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`
              }}
            >
              {/* Formas decorativas en el header */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div 
                  className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-2xl"
                  style={{ backgroundColor: 'white' }}
                />
                <div 
                  className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-20 blur-2xl"
                  style={{ backgroundColor: 'white' }}
                />
              </div>

              <div className="relative z-10 flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm bg-white/20"
                >
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle 
                    className="flex items-center gap-2"
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: 'white' }}
                  >
                    Vérifications des Entrées Récentes
                    <Sparkles className="w-5 h-5 text-white/80 animate-pulse" />
                  </DialogTitle>
                  <DialogDescription 
                    id="verificaciones-recientes-description"
                    className="text-white/80 text-sm mt-1"
                  >
                    Historique des vérifications et entrées d'inventaire
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            {/* Filtros */}
            <div className="px-6 py-4 bg-[#F8F9FA] border-b border-[#E0E0E0]">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3">
                  <Label className="text-[#555555] text-xs mb-2 block font-semibold flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#1E73BE]" />
                    Date de début
                  </Label>
                  <Input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="h-10 border-2 rounded-lg"
                  />
                </div>

                <div className="col-span-3">
                  <Label className="text-[#555555] text-xs mb-2 block font-semibold flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#1E73BE]" />
                    Date de fin
                  </Label>
                  <Input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="h-10 border-2 rounded-lg"
                  />
                </div>

                <div className="col-span-3">
                  <Label className="text-[#555555] text-xs mb-2 block font-semibold flex items-center gap-1.5">
                    <Filter className="w-4 h-4 text-[#1E73BE]" />
                    Type d'Entrée
                  </Label>
                  <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                    <SelectTrigger className="h-10 border-2 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Tous</SelectItem>
                      {tiposUnicos.map(tipo => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-3 flex items-end gap-2">
                  <Button
                    onClick={handlePrint}
                    className="flex-1 h-10 bg-gradient-to-r from-[#4CAF50] to-[#45a049] hover:from-[#45a049] hover:to-[#3d8b40] text-white rounded-lg shadow-md"
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimer
                  </Button>
                  <Button
                    onClick={() => {
                      setFechaInicio('');
                      setFechaFin('');
                      setTipoFiltro('todos');
                    }}
                    variant="outline"
                    className="h-10 border-2 border-[#DC3545] text-[#DC3545] hover:bg-[#DC3545] hover:text-white rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Resumen */}
              <div className="grid grid-cols-5 gap-4 mt-4">
                <div className="bg-white rounded-lg p-3 border-2 border-[#E3F2FD] shadow-sm">
                  <p className="text-xs text-[#666666] font-medium mb-1">Total d'Entrées</p>
                  <p className="text-2xl font-bold text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {filteredEntradas.length}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border-2 border-[#E8F5E9] shadow-sm">
                  <p className="text-xs text-[#666666] font-medium mb-1">Quantité Totale</p>
                  <p className="text-2xl font-bold text-[#4CAF50]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {totalCantidad}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border-2 border-[#FFF8E1] shadow-sm">
                  <p className="text-xs text-[#666666] font-medium mb-1">Poids Total</p>
                  <p className="text-2xl font-bold text-[#FFC107]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {formatQuantity(totalPeso)} kg
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border-2 border-[#FCE4EC] shadow-sm">
                  <p className="text-xs text-[#666666] font-medium mb-1">Moyenne par Entrée</p>
                  <p className="text-2xl font-bold text-[#E91E63]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {filteredEntradas.length > 0 ? formatQuantity(totalPeso / filteredEntradas.length) : '0'} kg
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border-2 border-[#E8F5E9] shadow-sm">
                  <div className="flex items-center gap-1 mb-1">
                    <DollarSign className="w-3 h-3 text-[#2d9561]" />
                    <p className="text-xs text-[#666666] font-medium">Valeur Totale</p>
                  </div>
                  <p className="text-2xl font-bold text-[#2d9561]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {formatMoney(totalValorMonetario)} CAD$
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido imprimible */}
          <div className="h-[calc(95vh-400px)] print:h-auto overflow-y-auto px-6 py-4 print:px-0 print:py-0">
            {/* Header de impresión - Solo visible al imprimir */}
            <div className="hidden print:block mb-6">
              <div className="text-center border-b-2 border-[#1E73BE] pb-4 mb-4">
                <h1 className="text-2xl font-bold text-[#1E73BE] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {nombreSistemaImpresion}
                </h1>
                {brandingContactLine && <p className="text-sm text-[#666666] mb-2">{brandingContactLine}</p>}
                <h2 className="text-xl font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Vérifications des Entrées d'Inventaire
                </h2>
                <p className="text-sm text-[#666666] mt-2">
                  Date d'Impression: {new Date().toLocaleDateString('fr-FR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                {(fechaInicio || fechaFin) && (
                  <p className="text-sm text-[#666666]">
                    Période: {fechaInicio ? new Date(fechaInicio).toLocaleDateString('fr-FR') : 'Début'} - {fechaFin ? new Date(fechaFin).toLocaleDateString('fr-FR') : "Aujourd'hui"}
                  </p>
                )}
              </div>
              
              {/* Resumen para impresión */}
              <div className="grid grid-cols-5 gap-3 mb-4 text-center">
                <div className="border border-[#1E73BE] rounded p-2">
                  <p className="text-xs text-[#666666] font-medium">Total d'Entrées</p>
                  <p className="text-lg font-bold text-[#1E73BE]">{filteredEntradas.length}</p>
                </div>
                <div className="border border-[#4CAF50] rounded p-2">
                  <p className="text-xs text-[#666666] font-medium">Quantité Totale</p>
                  <p className="text-lg font-bold text-[#4CAF50]">{totalCantidad}</p>
                </div>
                <div className="border border-[#FFC107] rounded p-2">
                  <p className="text-xs text-[#666666] font-medium">Poids Total</p>
                  <p className="text-lg font-bold text-[#FFC107]">{formatQuantity(totalPeso)} kg</p>
                </div>
                <div className="border border-[#E91E63] rounded p-2">
                  <p className="text-xs text-[#666666] font-medium">Moyenne par Entrée</p>
                  <p className="text-lg font-bold text-[#E91E63]">
                    {filteredEntradas.length > 0 ? formatQuantity(totalPeso / filteredEntradas.length) : '0'} kg
                  </p>
                </div>
                <div className="border border-[#2d9561] rounded p-2">
                  <p className="text-xs text-[#666666] font-medium">Valeur Totale</p>
                  <p className="text-lg font-bold text-[#2d9561]">{formatMoney(totalValorMonetario)} CAD$</p>
                </div>
              </div>
            </div>

            {/* Tabla de verificaciones */}
            {filteredEntradas.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-[#CCCCCC] mx-auto mb-4" />
                <p className="text-[#999999] text-lg font-medium">Aucune entrée trouvée</p>
                <p className="text-[#CCCCCC] text-sm">Essayez d'ajuster les filtres</p>
              </div>
            ) : (
              <div className="space-y-3 print:space-y-2">
                {filteredEntradas.map((entrada, index) => {
                  const valorMonetario = calcularValorMonetario(entrada);
                  
                  return (
                    <div 
                      key={entrada.id} 
                      className="border-2 border-[#E0E0E0] rounded-xl p-4 bg-white hover:shadow-md transition-shadow print:border print:rounded-lg print:p-3 print:break-inside-avoid"
                    >
                      <div className="grid grid-cols-12 gap-4 print:gap-2">
                        {/* Columna 1: Fecha y Tipo */}
                        <div className="col-span-2 print:col-span-2">
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg print:w-8 print:h-8 print:text-base"
                              style={{ 
                                backgroundColor: entrada.programaColor + '20',
                                color: entrada.programaColor 
                              }}
                            >
                              {entrada.programaIcono}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#333333] print:text-[10px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                #{index + 1}
                              </p>
                              <Badge 
                                className="text-[10px] px-2 py-0.5 print:text-[8px]"
                                style={{ 
                                  backgroundColor: entrada.programaColor + '20',
                                  color: entrada.programaColor,
                                  border: `1px solid ${entrada.programaColor}`
                                }}
                              >
                                {entrada.programaCodigo}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-[#666666] print:text-[9px]">
                            📅 {formatearFecha(entrada.fecha)}
                          </p>
                        </div>

                        {/* Columna 2: Donador/Proveedor */}
                        <div className="col-span-3 print:col-span-3">
                          <Label className="text-[10px] text-[#999999] font-semibold mb-1 block print:text-[8px]">
                            DONATEUR/FOURNISSEUR
                          </Label>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[#4CAF50] print:w-3 print:h-3" />
                            <p className="text-sm font-semibold text-[#333333] print:text-xs">
                              {entrada.donadorNombre || 'Sans nom'}
                            </p>
                          </div>
                        </div>

                        {/* Columna 3: Producto */}
                        <div className="col-span-4 print:col-span-4">
                          <Label className="text-[10px] text-[#999999] font-semibold mb-1 block print:text-[8px]">
                            PRODUIT
                          </Label>
                          <div className="flex items-start gap-2">
                            <span className="text-2xl print:text-lg">{entrada.productoIcono || '📦'}</span>
                            <div>
                              <p className="text-sm font-bold text-[#333333] print:text-xs">
                                {entrada.nombreProducto}
                              </p>
                              <p className="text-xs text-[#666666] print:text-[9px]">
                                {entrada.productoCategoria} → {entrada.productoSubcategoria}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Columna 4: Cantidades */}
                        <div className="col-span-3 print:col-span-3">
                          <Label className="text-[10px] text-[#999999] font-semibold mb-1 block print:text-[8px]">
                            QUANTITÉS
                          </Label>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between bg-[#E3F2FD] px-3 py-1.5 rounded-lg print:bg-gray-100">
                              <span className="text-xs text-[#666666] print:text-[9px]">Quantité</span>
                              <span className="text-sm font-bold text-[#1E73BE] print:text-xs">
                                {formatQuantity(entrada.cantidad)} {entrada.unidad}
                              </span>
                            </div>
                            <div className="flex items-center justify-between bg-[#E8F5E9] px-3 py-1.5 rounded-lg print:bg-gray-100">
                              <span className="text-xs text-[#666666] print:text-[9px]">Poids Unit.</span>
                              <span className="text-sm font-bold text-[#4CAF50] print:text-xs">
                                {formatQuantity(entrada.pesoUnidad || 0)} kg
                              </span>
                            </div>
                            <div className="flex items-center justify-between bg-gradient-to-r from-[#FFF8E1] to-[#FFECB3] px-3 py-1.5 rounded-lg print:bg-gray-100">
                              <span className="text-xs text-[#666666] font-bold print:text-[9px]">Poids Total</span>
                              <span className="text-sm font-bold text-[#F57C00] print:text-xs">
                                {formatQuantity(entrada.pesoTotal || 0)} kg
                              </span>
                            </div>
                            {valorMonetario > 0 && (
                              <div className="flex items-center justify-between bg-gradient-to-r from-[#E8F5E9] to-[#C8E6C9] px-3 py-1.5 rounded-lg print:bg-gray-100">
                                <span className="text-xs text-[#666666] font-bold print:text-[9px] flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  Valeur
                                </span>
                                <span className="text-sm font-bold text-[#2d9561] print:text-xs">
                                  {formatMoney(valorMonetario)} CAD$
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Temperatura */}
                          <div className="flex items-center gap-1 mt-2 print:mt-1">
                            {getTemperaturaIcon(entrada.temperatura)}
                            <span className="text-xs text-[#666666] capitalize print:text-[9px]">
                              {getTemperaturaText(entrada.temperatura)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Detalles opcionales */}
                      {(entrada.lote || entrada.fechaCaducidad || entrada.observaciones) && (
                        <div className="mt-3 pt-3 border-t border-[#E0E0E0] grid grid-cols-3 gap-3 print:mt-2 print:pt-2 print:gap-2">
                          {entrada.lote && (
                            <div>
                              <Label className="text-[9px] text-[#999999] print:text-[8px]">Lot</Label>
                              <p className="text-xs text-[#333333] font-medium print:text-[9px]">{entrada.lote}</p>
                            </div>
                          )}
                          {entrada.fechaCaducidad && (
                            <div>
                              <Label className="text-[9px] text-[#999999] print:text-[8px]">Expiration</Label>
                              <p className="text-xs text-[#333333] font-medium print:text-[9px]">
                                {new Date(entrada.fechaCaducidad).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          )}
                          {entrada.observaciones && (
                            <div className="col-span-2">
                              <Label className="text-[9px] text-[#999999] print:text-[8px]">Observations</Label>
                              <p className="text-xs text-[#333333] print:text-[9px]">{entrada.observaciones}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Botón de reimprimer etiqueta - Solo visible en pantalla */}
                      <div className="mt-3 pt-3 border-t border-[#E0E0E0] flex justify-end print:hidden">
                        <Button
                          onClick={() => handleReimprimirEtiqueta(entrada)}
                          size="sm"
                          className="bg-gradient-to-r from-[#1E73BE] to-[#155a99] hover:from-[#155a99] hover:to-[#0d3a66] text-white shadow-md"
                          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                        >
                          <Tag className="w-4 h-4 mr-2" />
                          Réimprimer l'étiquette
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer - No se imprime */}
          <div className="flex justify-end gap-4 px-6 py-4 border-t-2 border-[#E0E0E0] bg-white print:hidden">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-11 px-8 border-2 border-[#999999] text-[#666666] hover:bg-[#F5F5F5] text-sm rounded-lg"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Estilos de impresión */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </>
  );
}