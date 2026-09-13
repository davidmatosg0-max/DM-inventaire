import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Plus } from 'lucide-react';
import { ICONOS_PRINCIPALES } from '../data/iconosAlimentos';

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  valorMonetario: number | string;
  color: string;
  icono: string;
  subcategorias: any[];
  activa: boolean;
}

interface CategoriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editando: Categoria | null;
  formData: {
    nombre: string;
    descripcion: string;
    valorMonetario: string;
    color: string;
    icono: string;
    activa: boolean;
  };
  onFormChange: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function CategoriaDialog({
  open,
  onOpenChange,
  editando,
  formData,
  onFormChange,
  onSave,
  onCancel,
}: CategoriaDialogProps) {
  const handleIconToggle = () => {
    const element = document.getElementById('iconPickerCategoria');
    if (element) {
      element.classList.toggle('hidden');
    }
  };

  const handleSelectIcon = (icono: string) => {
    onFormChange({ ...formData, icono });
    document.getElementById('iconPickerCategoria')?.classList.add('hidden');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="app-dialog-form-shell" aria-describedby="categoria-description">
        <DialogHeader className="app-dialog-form-header">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a4d7a] to-[#2d9561] flex items-center justify-center text-white text-2xl">
              {formData.icono || '📁'}
            </div>
            <div>
              <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }} className="text-xl">
                {editando ? 'Editar Categoría' : 'Nueva Categoría'}
              </DialogTitle>
              <DialogDescription id="categoria-description" className="text-sm mt-1">
                {editando ? 'Editando categoría' : 'Crear nueva categoría'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="app-dialog-form-body space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2">
              <div className="w-1 h-5 bg-[#1a4d7a] rounded-full"></div>
              <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }} className="text-sm text-[#333333]">
                Información Básica
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="space-y-2 col-span-full">
                <Label className="text-sm flex items-center gap-1">
                  Nombre
                  <span className="text-[#DC3545]">*</span>
                </Label>
                <Input
                  value={formData.nombre || ''}
                  onChange={(e) => onFormChange({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre de la categoría"
                  className="h-11 text-base"
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2 col-span-full">
                <Label className="text-sm flex items-center gap-1">
                  Descripción
                  <span className="text-xs text-[#999999] font-normal">(Opcional)</span>
                </Label>
                <Textarea
                  value={formData.descripcion || ''}
                  onChange={(e) => onFormChange({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción de la categoría"
                  className="min-h-20 text-sm"
                />
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1">
                  🎨 Color
                  <span className="text-[#DC3545]">*</span>
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {['#1a4d7a', '#2d9561', '#9C27B0', '#FF6B6B', '#FFA500', '#FFD700', '#4CAF50', '#00BCD4'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => onFormChange({ ...formData, color })}
                      className={`w-10 h-10 rounded-lg transition-all ${formData.color === color ? 'ring-4 ring-offset-2' : 'hover:shadow-lg'}`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Icono */}
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1">
                  Icono
                  <span className="text-[#DC3545]">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleIconToggle}
                  className="w-full justify-start text-lg"
                >
                  <span className="text-2xl mr-2">{formData.icono || '📁'}</span>
                  Seleccionar ícono
                </Button>
                <div id="iconPickerCategoria" className="hidden border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto bg-white">
                  <div className="grid grid-cols-6 gap-2">
                    {ICONOS_PRINCIPALES.map((icono, index) => (
                      <button
                        key={`${icono}-${index}`}
                        type="button"
                        onClick={() => handleSelectIcon(icono)}
                        className={`text-2xl p-2 rounded hover:bg-gray-100 ${
                          formData.icono === icono ? 'bg-gray-200 ring-2 ring-[#1a4d7a]' : 'bg-white'
                        }`}
                      >
                        {icono}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Valor Monetario */}
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1">
                  💰 Valor Monetario
                  <span className="text-xs text-[#999999] font-normal">(Opcional)</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valorMonetario || ''}
                  onChange={(e) => onFormChange({ ...formData, valorMonetario: e.target.value })}
                  placeholder="0.00"
                  className="h-11 text-base"
                />
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1">
                  {formData.activa ? '✅' : '❌'} Estado
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onFormChange({ ...formData, activa: !formData.activa })}
                  className={`w-full ${formData.activa ? 'bg-green-50 text-green-700 border-green-300' : 'bg-red-50 text-red-700 border-red-300'}`}
                >
                  {formData.activa ? 'Activa' : 'Inactiva'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="app-dialog-form-footer">
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            onClick={onSave}
            disabled={!formData.nombre || !formData.icono}
            className="bg-[#1a4d7a] hover:bg-[#0f3550]"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
          >
            <Plus className="w-4 h-4 mr-2" />
            {editando ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
