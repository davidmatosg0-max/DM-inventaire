import React, { useState } from 'react';
import { Calendar, Clock, Send, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import { useBranding } from '../../../hooks/useBranding';

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
  const branding = useBranding();
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [motivo, setMotivo] = useState('');

  const handleEnviar = () => {
    if (!nuevaFecha) {
      toast.error('Veuillez sélectionner une nouvelle date');
      return;
    }
    if (!nuevaHora) {
      toast.error('Veuillez sélectionner une heure');
      return;
    }
    if (!motivo.trim()) {
      toast.error('Veuillez indiquer le motif du changement');
      return;
    }

    onConfirmar(nuevaFecha, nuevaHora, motivo);
    
    // Resetear formulario
    setNuevaFecha('');
    setNuevaHora('');
    setMotivo('');
    onOpenChange(false);
    
    toast.success(`Proposition de nouvelle date envoyée à l'organisme ${organismo?.nombre}`);
  };

  const fechaOriginal = new Date(comanda?.fechaEntrega);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" aria-describedby="proponer-fecha-description">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem' }}>
            Proposer une nouvelle date de collecte
          </DialogTitle>
          <DialogDescription id="proponer-fecha-description" className="text-[#666666]">
            Suggérez une nouvelle date et une nouvelle heure pour la collecte de la commande
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la comanda */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#666666] mb-1">Commande :</p>
                <p className="font-bold text-[#1E73BE]">{comanda?.id}</p>
              </div>
              <div>
                <p className="text-sm text-[#666666] mb-1">Organisme :</p>
                <p className="font-bold text-[#333333]">{organismo?.nombre}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-[#666666] mb-1">Date originale de collecte :</p>
                <p className="font-bold text-[#DC3545]">
                  {fechaOriginal.toLocaleDateString('fr-CA', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  {organismo?.horaCita && ` à ${organismo.horaCita}`}
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
                  Nouvelle date proposée *
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
                  Heure proposée *
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
                <p className="text-sm text-[#666666] mb-1">Nouvelle date proposée :</p>
                <p className="font-bold text-[#4CAF50]" style={{ fontSize: '1.1rem' }}>
                  {new Date(nuevaFecha).toLocaleDateString('fr-CA', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} à {nuevaHora}
                </p>
              </div>
            )}

            {/* Motivo del cambio */}
            <div className="space-y-2">
              <Label>Motif du changement de date *</Label>
              <Textarea 
                rows={4}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Expliquez le motif de la proposition de changement de date de collecte (ex. : problème d'inventaire, ajustement d'horaire, disponibilité du personnel, etc.)"
                className="resize-none"
              />
              <p className="text-xs text-[#666666]">
                Ce message sera envoyé à l'organisme avec la proposition de nouvelle date
              </p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-[#666666] flex items-start gap-2">
              <span className="text-[#FFC107] font-bold">ℹ️</span>
              <span>
                L'organisme recevra une notification avec la nouvelle date proposée et pourra l'accepter ou contacter 
                {branding.systemName} pour coordonner une autre date. La commande restera en attente jusqu'à 
                la confirmation de la nouvelle date.
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
              Annuler
            </Button>
            <Button
              onClick={handleEnviar}
              className="bg-[#1E73BE] hover:bg-[#1557A0]"
              disabled={!nuevaFecha || !nuevaHora || !motivo.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              Envoyer la proposition
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}