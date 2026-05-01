import React, { useState } from 'react';
import { Calendar, Clock, Send, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';

interface ProponerNuevaFechaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comanda: any;
  organismo: any;
  onConfirmar: (nuevaFecha: string, nuevaHora: string, motivo: string) => void;
}

export function ProponerNuevaFecha({ 
  open, 
  onOpenChange, 
  comanda, 
  organismo,
  onConfirmar 
}: ProponerNuevaFechaProps) {
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [motivo, setMotivo] = useState('');

  const handleEnviar = () => {
    if (!nuevaFecha) {
      toast.error('Por favor, seleccione una nueva fecha');
      return;
    }
    if (!nuevaHora) {
      toast.error('Por favor, seleccione una hora');
      return;
    }
    if (!motivo.trim()) {
      toast.error('Por favor, indique el motivo del cambio');
      return;
    }

    onConfirmar(nuevaFecha, nuevaHora, motivo);
    
    // Resetear formulario
    setNuevaFecha('');
    setNuevaHora('');
    setMotivo('');
    onOpenChange(false);
    
    toast.success(`Propuesta de nueva fecha enviada al organismo ${organismo?.nombre}`);
  };

  const fechaOriginal = new Date(comanda?.fechaEntrega);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" aria-describedby="proponer-fecha-description">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem' }}>
            Proponer Nueva Fecha de Recogida
          </DialogTitle>
          <DialogDescription id="proponer-fecha-description" className="text-[#666666]">
            Sugiera una nueva fecha y hora para la recogida de la comanda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la comanda */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#666666] mb-1">Comanda:</p>
                <p className="font-bold text-[#1E73BE]">{comanda?.id}</p>
              </div>
              <div>
                <p className="text-sm text-[#666666] mb-1">Organismo:</p>
                <p className="font-bold text-[#333333]">{organismo?.nombre}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-[#666666] mb-1">Fecha Original de Recogida:</p>
                <p className="font-bold text-[#DC3545]">
                  {fechaOriginal.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  {organismo?.horaCita && ` a las ${organismo.horaCita}`}
                </p>
              </div>
            </div>
          </div>

          {/* Nueva fecha propuesta */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#1E73BE]" />
                  Nueva Fecha Propuesta *
                </Label>
                <Input 
                  type="date"
                  value={nuevaFecha}
                  onChange={(e) => setNuevaFecha(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#1E73BE]" />
                  Hora Propuesta *
                </Label>
                <Input 
                  type="time"
                  value={nuevaHora}
                  onChange={(e) => setNuevaHora(e.target.value)}
                  className="text-base"
                />
              </div>
            </div>

            {/* Vista previa de la nueva fecha */}
            {nuevaFecha && nuevaHora && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-[#666666] mb-1">Nueva fecha propuesta:</p>
                <p className="font-bold text-[#4CAF50]" style={{ fontSize: '1.1rem' }}>
                  {new Date(nuevaFecha).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} a las {nuevaHora}
                </p>
              </div>
            )}

            {/* Motivo del cambio */}
            <div className="space-y-2">
              <Label>Motivo del Cambio de Fecha *</Label>
              <Textarea 
                rows={4}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Explique el motivo por el cual se propone cambiar la fecha de recogida (ej: problemas de inventario, ajuste de horarios, disponibilidad del personal, etc.)"
                className="resize-none"
              />
              <p className="text-xs text-[#666666]">
                Este mensaje se enviará al organismo junto con la propuesta de nueva fecha
              </p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-[#666666] flex items-start gap-2">
              <span className="text-[#FFC107] font-bold">ℹ️</span>
              <span>
                El organismo recibirá una notificación con la nueva fecha propuesta y podrá aceptarla o contactar 
                con la Banque Alimentaire para coordinar otra fecha. La comanda quedará en estado pendiente hasta 
                que se confirme la nueva fecha.
              </span>
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setNuevaFecha('');
                setNuevaHora('');
                setMotivo('');
                onOpenChange(false);
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleEnviar}
              className="bg-[#1E73BE] hover:bg-[#1557A0]"
              disabled={!nuevaFecha || !nuevaHora || !motivo.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Propuesta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}