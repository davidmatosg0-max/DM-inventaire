import React, { useState, useEffect } from 'react';
import { Edit2, Calendar, Package, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { actualizarEntrada, type EntradaInventario } from '../../utils/entradaInventarioStorage';
import { formatQuantity } from '../../utils/formatUtils';

interface EditarEntradaDialogProps {
  entrada: EntradaInventario | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActualizar: () => void;
}

export function EditarEntradaDialog({ entrada, open, onOpenChange, onActualizar }: EditarEntradaDialogProps) {
  const [fecha, setFecha] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [lote, setLote] = useState('');
  const [fechaCaducidad, setFechaCaducidad] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [temperatura, setTemperatura] = useState<'ambiente' | 'refrigerado' | 'congelado'>('ambiente');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (entrada && open) {
      setFecha(entrada.fecha.split('T')[0]);
      setCantidad(entrada.cantidad.toString());
      setLote(entrada.lote || '');
      setFechaCaducidad(entrada.fechaCaducidad || '');
      setObservaciones(entrada.observaciones || '');
      setTemperatura(entrada.temperatura);
    }
  }, [entrada, open]);

  const handleGuardar = async () => {
    if (!entrada) return;

    // Validaciones
    const cantidadNum = parseFloat(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      toast.error('La cantidad debe ser un número positivo');
      return;
    }

    setGuardando(true);

    try {
      const nuevoPesoTotal = cantidadNum * entrada.pesoUnidad;

      // Actualizar la entrada
      const exito = actualizarEntrada(entrada.id, {
        fecha: new Date(fecha).toISOString(),
        cantidad: cantidadNum,
        pesoTotal: nuevoPesoTotal,
        lote: lote || undefined,
        fechaCaducidad: fechaCaducidad || undefined,
        observaciones: observaciones || undefined,
        temperatura,
      });

      if (!exito) {
        toast.error('Error al actualizar la entrada');
        setGuardando(false);
        return;
      }

      toast.success('Entrada actualizada correctamente');
      onActualizar();
      onOpenChange(false);
    } catch (error) {
      console.error('Error al actualizar entrada:', error);
      toast.error('Error al actualizar la entrada');
    } finally {
      setGuardando(false);
    }
  };

  const formatearFecha = (isoString: string) => {
    const fecha = new Date(isoString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!entrada) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="editar-entrada-description">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Edit2 className="h-5 w-5 text-[#1E73BE]" />
            <DialogTitle className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Editar Entrada de Inventario
            </DialogTitle>
          </div>
          <DialogDescription id="editar-entrada-description">
            Modifica los datos de la entrada. Los cambios se reflejarán en el inventario.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Información no editable */}
          <div className="p-4 bg-[#F4F4F4] rounded-lg space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                className="text-white text-xs"
                style={{ backgroundColor: entrada.programaColor }}
              >
                {entrada.programaIcono} {entrada.programaCodigo}
              </Badge>
              <span className="text-sm text-[#666666]">
                Fecha original: {formatearFecha(entrada.fechaCreacion)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {entrada.productoIcono && (
                <span className="text-2xl">{entrada.productoIcono}</span>
              )}
              <div>
                <p className="font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {entrada.nombreProducto}
                </p>
                <p className="text-sm text-[#666666]">{entrada.donadorNombre}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#666666]">
              <AlertCircle className="h-4 w-4" />
              <span>El producto y el donador no se pueden modificar</span>
            </div>
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <Label htmlFor="fecha" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#1E73BE]" />
              Fecha de Entrada <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label htmlFor="cantidad" className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#1E73BE]" />
              Cantidad ({entrada.unidad}) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cantidad"
              type="number"
              step="1"
              min="0"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="Ejemplo: 100"
              required
            />
            <p className="text-xs text-[#666666]">
              Peso unitario: {formatQuantity(entrada.pesoUnidad)} kg/ud
              {cantidad && !isNaN(parseFloat(cantidad)) && (
                <span className="ml-2 text-[#1E73BE] font-semibold">
                  → Peso total: {formatQuantity(parseFloat(cantidad) * entrada.pesoUnidad)} kg
                </span>
              )}
            </p>
          </div>

          {/* Temperatura */}
          <div className="space-y-2">
            <Label htmlFor="temperatura">
              🌡️ Temperatura de Almacenamiento <span className="text-red-500">*</span>
            </Label>
            <Select value={temperatura} onValueChange={(v: any) => setTemperatura(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ambiente">🌡️ Ambiente</SelectItem>
                <SelectItem value="refrigerado">❄️ Refrigerado (0-5°C)</SelectItem>
                <SelectItem value="congelado">🧊 Congelado (-18°C o menos)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lote */}
          <div className="space-y-2">
            <Label htmlFor="lote">📦 Lote (opcional)</Label>
            <Input
              id="lote"
              value={lote}
              onChange={(e) => setLote(e.target.value)}
              placeholder="Ejemplo: LOT-2024-001"
            />
          </div>

          {/* Fecha de Caducidad */}
          <div className="space-y-2">
            <Label htmlFor="fechaCaducidad">📅 Fecha de Caducidad (opcional)</Label>
            <Input
              id="fechaCaducidad"
              type="date"
              value={fechaCaducidad}
              onChange={(e) => setFechaCaducidad(e.target.value)}
            />
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">📝 Observaciones (opcional)</Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas adicionales sobre esta entrada..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={guardando}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            disabled={guardando}
            className="bg-[#1E73BE] hover:bg-[#1557a0]"
          >
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}