import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ArrowLeft, CheckCircle, Package, Calendar, FileText, Users, Clock, Box } from 'lucide-react';
import { mockProductos, mockOrganismos } from '../data/mockData';
import { obtenerProductos } from '../utils/productStorage';

interface ResumenComandasGrupoProps {
  organismosIds: string[];
  fechaEntrega: string;
  fechaLimiteRespuesta?: string;
  observaciones: string;
  items: Array<{ productoId: string; cantidad: number }>;
  onVolver: () => void;
  onConfirmar: () => void;
}

export function ResumenComandasGrupo({
  organismosIds,
  fechaEntrega,
  fechaLimiteRespuesta,
  observaciones,
  items,
  onVolver,
  onConfirmar
}: ResumenComandasGrupoProps) {
  const organismos = mockOrganismos.filter(o => organismosIds.includes(o.id));
  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
  const totalProductos = items.length;
  const totalComandas = organismosIds.length;

  // Calcular si la fecha límite está próxima
  const calcularDiasRestantes = () => {
    if (!fechaLimiteRespuesta) return null;
    const hoy = new Date();
    const fechaLimite = new Date(fechaLimiteRespuesta);
    const diferenciaTiempo = fechaLimite.getTime() - hoy.getTime();
    const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));
    return diasRestantes;
  };

  const diasRestantes = calcularDiasRestantes();
  const esUrgente = diasRestantes !== null && diasRestantes <= 2;
  const esMuyUrgente = diasRestantes !== null && diasRestantes <= 1;

  return (
    <div className="space-y-6">
      {/* Header con indicador de paso */}
      <div className="bg-[#E8F5E9] border border-[#4CAF50] rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-[#4CAF50] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
            2
          </div>
          <div>
            <h3 className="font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Resumen de Comandas en Grupo
            </h3>
            <p className="text-sm text-[#666666]">
              Verifica los datos antes de crear las {totalComandas} comandas
            </p>
          </div>
        </div>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-[#1E73BE]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#E3F2FD] p-3 rounded-lg">
                <Users className="w-6 h-6 text-[#1E73BE]" />
              </div>
              <div>
                <p className="text-xs text-[#666666] uppercase">Comandas a Crear</p>
                <p className="font-bold text-2xl text-[#1E73BE]">{totalComandas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#4CAF50]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#E8F5E9] p-3 rounded-lg">
                <Package className="w-6 h-6 text-[#4CAF50]" />
              </div>
              <div>
                <p className="text-xs text-[#666666] uppercase">Productos por Comanda</p>
                <p className="font-bold text-2xl text-[#4CAF50]">{totalProductos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#FFC107]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#FFF8E1] p-3 rounded-lg">
                <Package className="w-6 h-6 text-[#FFC107]" />
              </div>
              <div>
                <p className="text-xs text-[#666666] uppercase">Unidades Totales</p>
                <p className="font-bold text-2xl text-[#FFC107]">{totalItems * totalComandas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organismos Destinatarios */}
      <Card className="border-l-4 border-l-[#1E73BE]">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#E3F2FD] p-3 rounded-lg">
              <Users className="w-6 h-6 text-[#1E73BE]" />
            </div>
            <div>
              <Label className="text-xs text-[#666666] uppercase">Organismos Destinatarios</Label>
              <p className="font-semibold text-lg text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {totalComandas} organismos seleccionados
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {organismos.map((org, index) => (
              <div
                key={org.id}
                className="flex items-center gap-3 p-3 bg-[#F4F4F4] rounded-lg"
              >
                <div className="bg-[#1E73BE] text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#333333] truncate">{org.nombre}</p>
                  <p className="text-xs text-[#666666]">{org.tipo}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fecha de Entrega */}
      <Card className="border-l-4 border-l-[#FFC107]">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="bg-[#FFF8E1] p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-[#FFC107]" />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-[#666666] uppercase">Fecha de Entrega Programada</Label>
              <p className="font-semibold text-lg text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {new Date(fechaEntrega).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fecha Límite de Respuesta */}
      {fechaLimiteRespuesta && (
        <Card className="border-l-4 border-l-[#FFC107]">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-[#FFF8E1] p-3 rounded-lg">
                <Clock className="w-6 h-6 text-[#FFC107]" />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-[#666666] uppercase">Fecha Límite de Respuesta</Label>
                <p className="font-semibold text-lg text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {new Date(fechaLimiteRespuesta).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                {esMuyUrgente && (
                  <Badge className="bg-red-500 text-white block mt-2" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                    ¡Muy Urgente! {diasRestantes} día{diasRestantes !== 1 ? 's' : ''}
                  </Badge>
                )}
                {esUrgente && !esMuyUrgente && (
                  <Badge className="bg-orange-500 text-white block mt-2" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                    Urgente! {diasRestantes} días
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Productos */}
      <Card className="border-l-4 border-l-[#4CAF50]">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#E8F5E9] p-3 rounded-lg">
                <Package className="w-6 h-6 text-[#4CAF50]" />
              </div>
              <div>
                <Label className="text-xs text-[#666666] uppercase">Productos por Comanda</Label>
                <p className="font-semibold text-lg text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {totalProductos} producto{totalProductos !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-[#4CAF50] text-white block mb-1" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                {totalItems} unidades por comanda
              </Badge>
              <Badge variant="outline" className="text-xs">
                Total: {totalItems * totalComandas} unidades
              </Badge>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {items.map((item, index) => {
              const todosLosProductos = obtenerProductos();
              const producto = todosLosProductos.find(p => p.id === item.productoId) || 
                              mockProductos.find(p => p.id === item.productoId);
              if (!producto) return null;

              const totalNecesario = item.cantidad * totalComandas;
              const suficienteStock = totalNecesario <= producto.stockActual;

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                    suficienteStock ? 'bg-[#F4F4F4] hover:bg-gray-200' : 'bg-red-50 border-2 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center border-2 ${
                      suficienteStock ? 'bg-white border-[#1E73BE]' : 'bg-red-100 border-[#DC3545]'
                    }`}>
                      {producto.icono ? (
                        <span className="text-2xl">{producto.icono}</span>
                      ) : (
                        <Box className={`w-6 h-6 ${suficienteStock ? 'text-[#1E73BE]' : 'text-[#DC3545]'}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{producto.nombre}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {producto.categoria && (
                          <Badge variant="outline" className="text-xs">
                            {producto.categoria}
                            {(producto as any).subcategoria && ` › ${(producto as any).subcategoria}`}
                          </Badge>
                        )}
                        {producto.codigo && (
                          <span className="text-xs text-[#666666]">
                            Código: {producto.codigo}
                          </span>
                        )}
                        <span className={`text-xs font-medium ${\n                          suficienteStock ? 'text-[#4CAF50]' : 'text-[#DC3545]'\n                        }`}>
                          Stock: {producto.stockActual} {producto.unidad}
                          {!suficienteStock && ` (necesita ${totalNecesario})`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-xs text-[#666666]">Por comanda</p>
                          <p className="font-bold text-xl text-[#1E73BE]">{item.cantidad}</p>
                        </div>
                        <span className="text-[#666666] font-bold">×</span>
                        <div>
                          <p className="text-xs text-[#666666]">Total</p>
                          <p className="font-bold text-xl text-[#4CAF50]">{totalNecesario}</p>
                        </div>
                      </div>
                      <p className="text-xs text-[#666666] mt-1">{producto.unidad}</p>
                    </div>
                  </div>
                  {!suficienteStock && (
                    <Badge className="bg-[#DC3545] text-white ml-4">
                      ⚠️ Stock Insuficiente
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Observaciones */}
      {observaciones && (
        <Card className="border-l-4 border-l-[#9E9E9E]">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-[#666666]" />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-[#666666] uppercase">Observaciones</Label>
                <p className="text-[#333333] mt-1">{observaciones}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advertencia de verificación */}
      <div className="bg-[#FFF8E1] border border-[#FFC107] rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <p className="font-medium text-[#F57C00] mb-1">Verificación Final</p>
            <p className="text-sm text-[#856404]">
              Se crearán <strong>{totalComandas} comandas idénticas</strong>, una para cada organismo seleccionado.
              Cada comanda contendrá {totalProductos} producto{totalProductos !== 1 ? 's' : ''} ({totalItems} unidades).
              Por favor, verifica el stock disponible antes de confirmar.
            </p>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-between items-center pt-4 border-t-2">
        <Button
          variant="outline"
          onClick={onVolver}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Editar
        </Button>
        <Button
          onClick={onConfirmar}
          className="bg-[#4CAF50] hover:bg-[#45a049] flex items-center gap-2"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
        >
          <CheckCircle className="w-5 h-5" />
          Confirmar y Crear {totalComandas} Comandas
        </Button>
      </div>
    </div>
  );
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}>{children}</label>;
}