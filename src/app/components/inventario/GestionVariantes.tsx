import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Package2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { cn } from '../ui/utils';
import { type Subcategoria, type Variante } from '../../data/configuracionData';
import { obtenerCategorias, guardarCategorias } from '../../utils/categoriaStorage';
import { obtenerUnidades, type Unidad } from '../../utils/unidadStorage';

type GestionVariantesProps = {
  subcategoria: Subcategoria;
  categoriaId: string;
  onActualizar?: () => void;
};

const iconosVariantes = [
  '📦', '🏷️', '⭐', '💎', '🎯', '🔵', '🟢', '🟡', '🟠', '🔴',
  '🟣', '🟤', '⚫', '⚪', '🔸', '🔹', '💠', '🎨', '✨', '🌟'
];

export function GestionVariantes({ subcategoria, categoriaId, onActualizar }: GestionVariantesProps) {
  const [variantes, setVariantes] = useState<Variante[]>(subcategoria.variantes || []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [varianteEditando, setVarianteEditando] = useState<Variante | null>(null);
  const [expandido, setExpandido] = useState(false);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    icono: '📦',
    unidad: '',
    valorPorKg: '',
    pesoUnitario: '',
    descripcion: ''
  });

  useEffect(() => {
    setVariantes(subcategoria.variantes || []);
  }, [subcategoria]);

  useEffect(() => {
    // Cargar unidades iniciales
    cargarUnidades();

    // Escuchar cambios en las unidades
    const handleUnidadesActualizadas = (event: CustomEvent) => {
      setUnidades(event.detail);
    };

    window.addEventListener('unidadesActualizadas', handleUnidadesActualizadas as EventListener);

    return () => {
      window.removeEventListener('unidadesActualizadas', handleUnidadesActualizadas as EventListener);
    };
  }, []);

  const cargarUnidades = () => {
    const unidadesCargadas = obtenerUnidades();
    setUnidades(unidadesCargadas);
  };

  const handleAbrirNuevo = () => {
    setModoEdicion(false);
    setVarianteEditando(null);
    setFormData({
      nombre: '',
      codigo: '',
      icono: '📦',
      unidad: '',
      valorPorKg: '',
      pesoUnitario: '',
      descripcion: ''
    });
    setDialogOpen(true);
  };

  const handleAbrirEditar = (variante: Variante) => {
    setModoEdicion(true);
    setVarianteEditando(variante);
    setFormData({
      nombre: variante.nombre,
      codigo: variante.codigo || '',
      icono: variante.icono || '📦',
      unidad: variante.unidad || '',
      valorPorKg: variante.valorPorKg?.toString() || '',
      pesoUnitario: variante.pesoUnitario?.toString() || '',
      descripcion: variante.descripcion || ''
    });
    setDialogOpen(true);
  };

  const handleGuardar = () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre de la variante es requerido');
      return;
    }

    const nuevaVariante: Variante = {
      id: modoEdicion && varianteEditando ? varianteEditando.id : `var-${Date.now()}`,
      nombre: formData.nombre.trim(),
      codigo: formData.codigo.trim() || undefined,
      icono: formData.icono,
      activa: true,
      unidad: formData.unidad.trim() || undefined,
      valorPorKg: formData.valorPorKg ? parseFloat(formData.valorPorKg) : undefined,
      pesoUnitario: formData.pesoUnitario ? parseFloat(formData.pesoUnitario) : undefined,
      descripcion: formData.descripcion.trim() || undefined
    };

    let variantesActualizadas: Variante[];
    if (modoEdicion && varianteEditando) {
      variantesActualizadas = variantes.map(v => v.id === varianteEditando.id ? nuevaVariante : v);
    } else {
      variantesActualizadas = [...variantes, nuevaVariante];
    }

    // Actualizar la subcategoría en la base de datos
    const categorias = obtenerCategorias();
    const categoriaIndex = categorias.findIndex(c => c.id === categoriaId);
    
    if (categoriaIndex >= 0) {
      const categoria = categorias[categoriaIndex];
      if (categoria.subcategorias) {
        const subIndex = categoria.subcategorias.findIndex(s => s.id === subcategoria.id);
        if (subIndex >= 0) {
          categoria.subcategorias[subIndex].variantes = variantesActualizadas;
          guardarCategorias(categorias);
          
          // Disparar evento de actualización
          window.dispatchEvent(new Event('categorias-actualizadas'));
          
          setVariantes(variantesActualizadas);
          setDialogOpen(false);
          toast.success(modoEdicion ? 'Variante actualizada correctamente' : 'Variante creada correctamente');
          
          if (onActualizar) {
            onActualizar();
          }
        }
      }
    }
  };

  const handleEliminar = (variante: Variante) => {
    if (confirm(`¿Está seguro de eliminar la variante "${variante.nombre}"?`)) {
      const variantesActualizadas = variantes.filter(v => v.id !== variante.id);
      
      // Actualizar en la base de datos
      const categorias = obtenerCategorias();
      const categoriaIndex = categorias.findIndex(c => c.id === categoriaId);
      
      if (categoriaIndex >= 0) {
        const categoria = categorias[categoriaIndex];
        if (categoria.subcategorias) {
          const subIndex = categoria.subcategorias.findIndex(s => s.id === subcategoria.id);
          if (subIndex >= 0) {
            categoria.subcategorias[subIndex].variantes = variantesActualizadas;
            guardarCategorias(categorias);
            
            // Disparar evento de actualización
            window.dispatchEvent(new Event('categorias-actualizadas'));
            
            setVariantes(variantesActualizadas);
            toast.success('Variante eliminada correctamente');
            
            if (onActualizar) {
              onActualizar();
            }
          }
        }
      }
    }
  };

  const handleToggleActiva = (variante: Variante) => {
    const variantesActualizadas = variantes.map(v => 
      v.id === variante.id ? { ...v, activa: !v.activa } : v
    );
    
    // Actualizar en la base de datos
    const categorias = obtenerCategorias();
    const categoriaIndex = categorias.findIndex(c => c.id === categoriaId);
    
    if (categoriaIndex >= 0) {
      const categoria = categorias[categoriaIndex];
      if (categoria.subcategorias) {
        const subIndex = categoria.subcategorias.findIndex(s => s.id === subcategoria.id);
        if (subIndex >= 0) {
          categoria.subcategorias[subIndex].variantes = variantesActualizadas;
          guardarCategorias(categorias);
          
          // Disparar evento de actualización
          window.dispatchEvent(new Event('categorias-actualizadas'));
          
          setVariantes(variantesActualizadas);
          toast.success(variante.activa ? 'Variante desactivada' : 'Variante activada');
          
          if (onActualizar) {
            onActualizar();
          }
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header con botón de expandir/contraer */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setExpandido(!expandido)}
          className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors"
        >
          <Package2 className="w-5 h-5 text-[#9C27B0]" />
          <div className="text-left">
            <h4 className="text-sm font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Variantes
            </h4>
            <p className="text-xs text-[#666666]">
              {variantes.length} {variantes.length === 1 ? 'variante' : 'variantes'}
            </p>
          </div>
          {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        <Button
          size="sm"
          onClick={handleAbrirNuevo}
          className="bg-[#9C27B0] hover:bg-[#7B1FA2]"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
        >
          <Plus className="w-3 h-3 mr-1" />
          Nueva Variante
        </Button>
      </div>

      {/* Lista de variantes */}
      {expandido && (
        <div className="space-y-2 pl-4 border-l-2 border-[#9C27B0]/20">
          {variantes.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Package2 className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-[#666666] mb-2">No hay variantes creadas</p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAbrirNuevo}
              >
                <Plus className="w-3 h-3 mr-1" />
                Crear primera variante
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {variantes.map((variante) => (
                <Card key={variante.id} className={cn(
                  "p-3 hover:shadow-md transition-shadow",
                  !variante.activa && "opacity-60 bg-gray-50"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-2xl">{variante.icono || '📦'}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {variante.nombre}
                          </p>
                          {!variante.activa && (
                            <Badge variant="secondary" className="text-xs">Inactiva</Badge>
                          )}
                          {variante.codigo && (
                            <Badge variant="outline" className="text-xs">{variante.codigo}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[#666666]">
                          {variante.unidad && (
                            <span>📦 {variante.unidad}</span>
                          )}
                          {variante.pesoUnitario && (
                            <span>⚖️ {variante.pesoUnitario} kg</span>
                          )}
                          {variante.valorPorKg && (
                            <span>💰 ${variante.valorPorKg}/kg</span>
                          )}
                        </div>
                        {variante.descripcion && (
                          <p className="text-xs text-[#666666] mt-1">{variante.descripcion}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleActiva(variante)}
                        className="h-7 w-7 p-0"
                        title={variante.activa ? 'Desactivar' : 'Activar'}
                      >
                        {variante.activa ? '👁️' : '🚫'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAbrirEditar(variante)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEliminar(variante)}
                        className="h-7 w-7 p-0 text-[#DC3545] hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Diálogo Crear/Editar Variante */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl" aria-describedby="gestion-variantes-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {modoEdicion ? '✏️ Editar Variante' : '✨ Nueva Variante'}
            </DialogTitle>
            <DialogDescription id="gestion-variantes-description">
              {modoEdicion ? 'Modifica la información de la variante existente' : 'Crea una nueva variante para este producto'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label>Nombre de la Variante *</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Grande, 500ml, Marca A, Orgánico..."
                />
              </div>

              {/* Código */}
              <div className="space-y-2">
                <Label>Código (opcional)</Label>
                <Input
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  placeholder="Ej: VAR-001"
                />
              </div>
            </div>

            {/* Unidad de Medida */}
            <div className="space-y-2">
              <Label>Unidad de Medida</Label>
              <Select value={formData.unidad} onValueChange={(value) => setFormData({ ...formData, unidad: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={`Usar unidad de subcategoría (${subcategoria.unidad || 'No definida'})`} />
                </SelectTrigger>
                <SelectContent>
                  {unidades.map((unidad) => (
                    <SelectItem key={unidad.id} value={unidad.nombre}>{unidad.icono} {unidad.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-[#666666]">
                {formData.unidad ? `Unidad específica: ${formData.unidad}` : `Se usará la unidad de la subcategoría: ${subcategoria.unidad || 'No definida'}`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Peso Unitario */}
              <div className="space-y-2">
                <Label>Peso Unitario (kg)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.pesoUnitario}
                  onChange={(e) => setFormData({ ...formData, pesoUnitario: e.target.value })}
                  placeholder="0.00"
                />
                <p className="text-xs text-[#666666]">
                  Deja vacío para usar el peso de la subcategoría
                </p>
              </div>

              {/* Valor por Kg */}
              <div className="space-y-2">
                <Label>Valor por Kg ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valorPorKg}
                  onChange={(e) => setFormData({ ...formData, valorPorKg: e.target.value })}
                  placeholder="0.00"
                />
                <p className="text-xs text-[#666666]">
                  Deja vacío para usar el valor de la categoría
                </p>
              </div>
            </div>

            {/* Selector de Icono */}
            <div className="space-y-2">
              <Label>Icono</Label>
              <div className="grid grid-cols-10 gap-2">
                {iconosVariantes.map((icono) => (
                  <button
                    key={icono}
                    type="button"
                    onClick={() => setFormData({ ...formData, icono })}
                    className={cn(
                      "p-2 text-xl border rounded-lg hover:bg-gray-100 transition-colors",
                      formData.icono === icono ? 'border-[#9C27B0] bg-purple-50' : 'border-gray-200'
                    )}
                  >
                    {icono}
                  </button>
                ))}
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label>Descripción (opcional)</Label>
              <Input
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción adicional de la variante..."
              />
            </div>

            {/* Vista Previa */}
            <div className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-200">
              <p className="text-xs text-[#666666] mb-2">Vista Previa:</p>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{formData.icono}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {formData.nombre || 'Nombre de la variante'}
                    </p>
                    {formData.codigo && (
                      <Badge variant="outline" className="text-xs">{formData.codigo}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-[#666666] mt-1">
                    {subcategoria.nombre}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[#666666]">
                    {formData.pesoUnitario && (
                      <span>⚖️ {formData.pesoUnitario} kg</span>
                    )}
                    {formData.valorPorKg && (
                      <span>💰 ${formData.valorPorKg}/kg</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleGuardar}
              className="bg-[#9C27B0] hover:bg-[#7B1FA2]"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
            >
              <Save className="w-4 h-4 mr-2" />
              {modoEdicion ? 'Guardar Cambios' : 'Crear Variante'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}