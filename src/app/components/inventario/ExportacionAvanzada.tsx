import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileText, FileSpreadsheet, FileJson, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import { obtenerProductos } from '../../utils/productStorage';
import { obtenerEntradas } from '../../utils/entradaInventarioStorage';
import { exportarInventarioPDF } from '../../utils/exportarPDF';
import { exportData, generateFilename, type TableColumn } from '../../utils/exportUtils';

type ExportacionAvanzadaProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FormatoExportacion = 'csv' | 'excel' | 'json' | 'pdf';
type TipoDatos = 'productos' | 'entradas' | 'ambos';

function getExtension(formato: FormatoExportacion): string {
  return formato === 'excel' ? 'xlsx' : formato;
}

function getNombreArchivo(tipoDatos: TipoDatos, formato: FormatoExportacion): string {
  if (tipoDatos === 'productos' && formato === 'pdf') {
    return generateFilename('Inventario_compacto', 'pdf');
  }

  if (tipoDatos === 'ambos') {
    return generateFilename('inventario_completo', getExtension(formato));
  }

  return generateFilename(`inventario_${tipoDatos}`, getExtension(formato));
}

export function ExportacionAvanzada({ open, onOpenChange }: ExportacionAvanzadaProps) {
  const { t } = useTranslation();
  const [formato, setFormato] = useState<FormatoExportacion>('excel');
  const [tipoDatos, setTipoDatos] = useState<TipoDatos>('productos');
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const [incluirValorMonetario, setIncluirValorMonetario] = useState(true);
  const [incluirUbicacion, setIncluirUbicacion] = useState(true);
  const [incluirFechas, setIncluirFechas] = useState(true);
  const [rangoFechas, setRangoFechas] = useState('todos');
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]);

  const formatosDisponibles = [
    {
      id: 'excel' as FormatoExportacion,
      nombre: 'Excel (.xlsx)',
      icono: <FileSpreadsheet className="h-5 w-5 text-[#4CAF50]" />,
      descripcion: 'Formato compatible con Microsoft Excel y Google Sheets'
    },
    {
      id: 'csv' as FormatoExportacion,
      nombre: 'CSV (.csv)',
      icono: <FileText className="h-5 w-5 text-[#1E73BE]" />,
      descripcion: 'Archivo de texto separado por comas, compatible con cualquier programa'
    },
    {
      id: 'json' as FormatoExportacion,
      nombre: 'JSON (.json)',
      icono: <FileJson className="h-5 w-5 text-[#FFC107]" />,
      descripcion: 'Formato para integración con APIs y sistemas externos'
    },
    {
      id: 'pdf' as FormatoExportacion,
      nombre: 'PDF (.pdf)',
      icono: <FileText className="h-5 w-5 text-[#DC3545]" />,
      descripcion: 'Documento imprimible con formato profesional'
    }
  ];

  const generarExportacion = async () => {
    const productos = obtenerProductos();
    const entradas = obtenerEntradas();

    let datosExportar: any[] = [];

    // Filtrar datos según configuración
    if (tipoDatos === 'productos' || tipoDatos === 'ambos') {
      let productosFiltrados = incluirInactivos 
        ? productos 
        : productos.filter(p => p.activo);

      if (categoriasSeleccionadas.length > 0) {
        productosFiltrados = productosFiltrados.filter(p => 
          categoriasSeleccionadas.includes(p.categoria)
        );
      }

      datosExportar = [...productosFiltrados];
    }

    if (tipoDatos === 'entradas' || tipoDatos === 'ambos') {
      let entradasFiltradas = [...entradas];

      // Filtrar por rango de fechas
      if (rangoFechas !== 'todos') {
        const ahora = new Date();
        const diasAtras = rangoFechas === '7dias' ? 7 : rangoFechas === '30dias' ? 30 : 90;
        const fechaLimite = new Date(ahora.getTime() - (diasAtras * 24 * 60 * 60 * 1000));
        
        entradasFiltradas = entradasFiltradas.filter(e => 
          new Date(e.fecha) >= fechaLimite
        );
      }

      datosExportar = tipoDatos === 'ambos' 
        ? [...datosExportar, ...entradasFiltradas]
        : entradasFiltradas;
    }

    const nombreArchivo = getNombreArchivo(tipoDatos, formato);
    const filasProductos = (tipoDatos === 'productos' || tipoDatos === 'ambos')
      ? (tipoDatos === 'productos' ? datosExportar : productos.filter((producto) => {
          const productoActivo = incluirInactivos ? true : producto.activo;
          const categoriaValida = categoriasSeleccionadas.length === 0 || categoriasSeleccionadas.includes(producto.categoria);
          return productoActivo && categoriaValida;
        })).map((producto) => ({
          recordType: 'Produit',
          recordDate: '',
          entryType: '',
          program: '',
          actor: '',
          prsParticipant: '',
          code: producto.codigo || 'N/A',
          name: producto.nombre || 'Sans nom',
          category: producto.categoria || 'N/A',
          subcategory: producto.subcategoria || 'N/A',
          quantity: producto.stockActual ?? 0,
          unit: producto.unidad || 'u',
          unitWeight: producto.pesoUnitario ?? producto.peso ?? 0,
          totalWeight: producto.pesoRegistrado ?? ((producto.pesoUnitario ?? producto.peso ?? 0) * (producto.stockActual ?? 0)),
          location: producto.ubicacion || 'N/A',
          batch: producto.lote || 'N/A',
          expiration: producto.fechaVencimiento || 'N/A',
          temperature: producto.temperaturaAlmacenamiento || producto.temperatura || 'N/A',
          packageDetails: '',
          notes: '',
          status: producto.estado || 'Disponible',
          value: incluirValorMonetario ? (producto.valorTotal ?? 0) : '',
          minStock: producto.stockMinimo ?? 0,
        }))
      : [];
    const filasEntradas = (tipoDatos === 'entradas' || tipoDatos === 'ambos')
      ? entradas.filter((entrada) => {
          if (rangoFechas === 'todos') {
            return true;
          }

          const ahora = new Date();
          const diasAtras = rangoFechas === '7dias' ? 7 : rangoFechas === '30dias' ? 30 : 90;
          const fechaLimite = new Date(ahora.getTime() - (diasAtras * 24 * 60 * 60 * 1000));
          return new Date(entrada.fecha) >= fechaLimite;
        }).map((entrada) => ({
          recordType: 'Entrée',
          recordDate: entrada.fecha,
          entryType: entrada.tipoEntrada || 'N/A',
          program: entrada.programaNombre || 'N/A',
          actor: entrada.donadorNombre || 'N/A',
          prsParticipant: entrada.participantePRSNombre || 'N/A',
          code: entrada.productoCodigo || 'N/A',
          name: entrada.nombreProducto || 'N/A',
          category: entrada.productoCategoria || entrada.categoria || 'N/A',
          subcategory: entrada.productoSubcategoria || entrada.subcategoria || 'N/A',
          quantity: entrada.cantidad ?? 0,
          unit: entrada.unidad || 'u',
          unitWeight: entrada.pesoUnidad ?? 0,
          totalWeight: entrada.pesoTotal ?? 0,
          location: '',
          batch: entrada.lote || 'N/A',
          expiration: entrada.fechaCaducidad || 'N/A',
          temperature: entrada.temperatura || 'N/A',
          packageDetails: entrada.detallesEmpaque || 'N/A',
          notes: entrada.observaciones || 'N/A',
          status: entrada.activo ? 'Active' : 'Inactive',
          value: incluirValorMonetario ? (entrada.valorTotal ?? 0) : '',
          minStock: '',
        }))
      : [];

    if (tipoDatos === 'productos') {
      if (filasProductos.length === 0 && formato !== 'pdf') {
        toast.error('Aucun produit disponible pour cette exportation.');
        onOpenChange(false);
        return;
      }

      if (formato === 'pdf') {
        exportarInventarioPDF(datosExportar, nombreArchivo);
      } else {
        const columns: TableColumn[] = [
          { header: 'Código', key: 'code' },
          { header: 'Producto', key: 'name' },
          { header: 'Categoría', key: 'category' },
          { header: 'Subcategoría', key: 'subcategory' },
          { header: 'Stock', key: 'quantity' },
          { header: 'Mínimo', key: 'minStock' },
          { header: 'Unidad', key: 'unit' },
          { header: 'Poids (kg)', key: 'totalWeight' },
          ...(incluirUbicacion ? [{ header: 'Ubicación', key: 'location' }] : []),
          ...(incluirFechas ? [
            { header: 'Lote', key: 'batch' },
            { header: 'Fecha vencimiento', key: 'expiration' },
            { header: 'Température', key: 'temperature' },
          ] : []),
          { header: 'État', key: 'status' },
          ...(incluirValorMonetario ? [{ header: 'Valeur', key: 'value' }] : []),
        ];

        await exportData(formato, filasProductos, columns, {
          filename: nombreArchivo,
          title: 'Exportación Avanzada de Inventario',
          subtitle: `${filasProductos.length} registros exportados`,
          orientation: 'landscape',
        });
      }

      toast.success(
        <div className="space-y-1">
          <p className="font-bold">✅ Exportación completada</p>
          <p className="text-sm">Archivo: {nombreArchivo}</p>
          <p className="text-xs text-[#666666]">{datosExportar.length} registros exportados</p>
        </div>,
        { duration: 5000 }
      );

      onOpenChange(false);
      return;
    }

    const filasExportacion = tipoDatos === 'entradas'
      ? filasEntradas
      : [...filasProductos, ...filasEntradas];

    if (filasExportacion.length === 0) {
      toast.error('Aucune donnée disponible pour cette exportation.');
      onOpenChange(false);
      return;
    }

    const columns: TableColumn[] = tipoDatos === 'entradas'
      ? [
          { header: 'Date', key: 'recordDate' },
          { header: 'Type', key: 'entryType' },
          { header: 'Programme', key: 'program' },
          { header: 'Donateur / fournisseur', key: 'actor' },
          { header: 'Participant PRS', key: 'prsParticipant' },
          { header: 'Code', key: 'code' },
          { header: 'Produit', key: 'name' },
          { header: 'Catégorie', key: 'category' },
          { header: 'Sous-catégorie', key: 'subcategory' },
          { header: 'Quantité', key: 'quantity' },
          { header: 'Unité', key: 'unit' },
          { header: 'Poids unitaire', key: 'unitWeight' },
          { header: 'Poids total', key: 'totalWeight' },
          { header: 'Température', key: 'temperature' },
          ...(incluirFechas ? [
            { header: 'Lot', key: 'batch' },
            { header: 'Date de péremption', key: 'expiration' },
          ] : []),
          { header: 'Détails emballage', key: 'packageDetails' },
          { header: 'Notes', key: 'notes' },
          ...(incluirValorMonetario ? [{ header: 'Valeur', key: 'value' }] : []),
          { header: 'État', key: 'status' },
        ]
      : [
          { header: 'Type de registre', key: 'recordType' },
          { header: 'Date', key: 'recordDate' },
          { header: 'Type entrée', key: 'entryType' },
          { header: 'Programme', key: 'program' },
          { header: 'Acteur', key: 'actor' },
          { header: 'Code', key: 'code' },
          { header: 'Produit', key: 'name' },
          { header: 'Catégorie', key: 'category' },
          { header: 'Sous-catégorie', key: 'subcategory' },
          { header: 'Quantité', key: 'quantity' },
          { header: 'Unité', key: 'unit' },
          { header: 'Poids total', key: 'totalWeight' },
          ...(incluirUbicacion ? [{ header: 'Emplacement', key: 'location' }] : []),
          ...(incluirFechas ? [
            { header: 'Lot', key: 'batch' },
            { header: 'Date de péremption', key: 'expiration' },
          ] : []),
          { header: 'Température', key: 'temperature' },
          { header: 'État', key: 'status' },
          ...(incluirValorMonetario ? [{ header: 'Valeur', key: 'value' }] : []),
        ];

    await exportData(formato, filasExportacion, columns, {
      filename: nombreArchivo,
      title: tipoDatos === 'entradas' ? 'Exportación de Entradas de Inventario' : 'Exportación Completa de Inventario',
      subtitle: `${filasExportacion.length} registros exportados`,
      orientation: 'landscape',
    });

    toast.success(
      <div className="space-y-1">
        <p className="font-bold">✅ Exportación completada</p>
        <p className="text-sm">Archivo: {nombreArchivo}</p>
        <p className="text-xs text-[#666666]">{filasExportacion.length} registros exportados</p>
      </div>,
      { duration: 5000 }
    );

    onOpenChange(false);
  };

  const categorias = ['Alimentos Secos', 'Conservas', 'Lácteos', 'Frutas y Verduras', 'Proteínas', 'Panadería', 'Bebidas', 'Aceites y Condimentos'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="exportacion-avanzada-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <Download className="h-6 w-6 text-[#1E73BE]" />
            Exportación Avanzada de Inventario
          </DialogTitle>
          <DialogDescription id="exportacion-avanzada-description">
            Exporta tu inventario en diferentes formatos con opciones personalizadas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Selección de formato */}
          <div className="space-y-3">
            <Label className="text-base font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              1. Selecciona el formato de exportación
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {formatosDisponibles.map(fmt => (
                <Card
                  key={fmt.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formato === fmt.id ? 'border-2 border-[#1E73BE] bg-blue-50' : 'border'
                  }`}
                  onClick={() => setFormato(fmt.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {fmt.icono}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">{fmt.nombre}</h4>
                          {formato === fmt.id && (
                            <Check className="h-4 w-4 text-[#4CAF50]" />
                          )}
                        </div>
                        <p className="text-xs text-[#666666] mt-1">{fmt.descripcion}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tipo de datos */}
          <div className="space-y-3">
            <Label className="text-base font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              2. ¿Qué datos deseas exportar?
            </Label>
            <RadioGroup value={tipoDatos} onValueChange={(value: any) => setTipoDatos(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="productos" id="productos" />
                <Label htmlFor="productos" className="cursor-pointer">
                  📦 Solo Productos del Inventario
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="entradas" id="entradas" />
                <Label htmlFor="entradas" className="cursor-pointer">
                  📥 Solo Entradas/Movimientos
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ambos" id="ambos" />
                <Label htmlFor="ambos" className="cursor-pointer">
                  📊 Productos y Entradas (Completo)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Opciones adicionales */}
          <div className="space-y-3">
            <Label className="text-base font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              3. Opciones adicionales
            </Label>
            
            <div className="space-y-3 pl-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inactivos"
                  checked={incluirInactivos}
                  onCheckedChange={(checked) => setIncluirInactivos(checked as boolean)}
                />
                <Label htmlFor="inactivos" className="cursor-pointer text-sm">
                  Incluir productos inactivos
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="valorMonetario"
                  checked={incluirValorMonetario}
                  onCheckedChange={(checked) => setIncluirValorMonetario(checked as boolean)}
                />
                <Label htmlFor="valorMonetario" className="cursor-pointer text-sm">
                  Incluir valor monetario
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ubicacion"
                  checked={incluirUbicacion}
                  onCheckedChange={(checked) => setIncluirUbicacion(checked as boolean)}
                />
                <Label htmlFor="ubicacion" className="cursor-pointer text-sm">
                  Incluir ubicación de almacenamiento
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fechas"
                  checked={incluirFechas}
                  onCheckedChange={(checked) => setIncluirFechas(checked as boolean)}
                />
                <Label htmlFor="fechas" className="cursor-pointer text-sm">
                  Incluir fechas de caducidad y lotes
                </Label>
              </div>
            </div>
          </div>

          {/* Filtros por rango de fechas (solo para entradas) */}
          {(tipoDatos === 'entradas' || tipoDatos === 'ambos') && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="text-base font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  4. Rango de fechas para entradas
                </Label>
                <Select value={rangoFechas} onValueChange={setRangoFechas}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas las fechas</SelectItem>
                    <SelectItem value="7dias">Últimos 7 días</SelectItem>
                    <SelectItem value="30dias">Últimos 30 días</SelectItem>
                    <SelectItem value="90dias">Últimos 90 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Resumen */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-[#1E73BE] mb-2">📋 Resumen de exportación</h4>
            <div className="space-y-1 text-sm">
              <p>• Formato: <Badge variant="outline">{formatosDisponibles.find(f => f.id === formato)?.nombre}</Badge></p>
              <p>• Datos: <Badge variant="outline">{tipoDatos === 'productos' ? 'Productos' : tipoDatos === 'entradas' ? 'Entradas' : 'Productos + Entradas'}</Badge></p>
              {(tipoDatos === 'entradas' || tipoDatos === 'ambos') && (
                <p>• Período: <Badge variant="outline">{
                  rangoFechas === 'todos' ? 'Todas las fechas' :
                  rangoFechas === '7dias' ? 'Últimos 7 días' :
                  rangoFechas === '30dias' ? 'Últimos 30 días' :
                  'Últimos 90 días'
                }</Badge></p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={generarExportacion}
            className="bg-[#4CAF50] hover:bg-[#45a049]"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Datos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}