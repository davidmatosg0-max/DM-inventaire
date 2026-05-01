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

type ExportacionAvanzadaProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FormatoExportacion = 'csv' | 'excel' | 'json' | 'pdf';
type TipoDatos = 'productos' | 'entradas' | 'ambos';

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

  const generarExportacion = () => {
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

    // Simular exportación
    const nombreArchivo = `inventario_${tipoDatos}_${new Date().getTime()}.${formato}`;
    
    toast.success(
      <div className="space-y-1">
        <p className="font-bold">✅ Exportación completada</p>
        <p className="text-sm">Archivo: {nombreArchivo}</p>
        <p className="text-xs text-[#666666]">{datosExportar.length} registros exportados</p>
      </div>,
      { duration: 5000 }
    );

    // En producción, aquí se generaría el archivo real
    console.log('Exportando:', {
      formato,
      tipoDatos,
      registros: datosExportar.length,
      opciones: {
        incluirInactivos,
        incluirValorMonetario,
        incluirUbicacion,
        incluirFechas,
        rangoFechas,
        categoriasSeleccionadas
      }
    });

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