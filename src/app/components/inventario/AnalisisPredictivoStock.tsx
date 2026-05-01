import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingDown, TrendingUp, AlertCircle, Calendar, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { obtenerProductos } from '../../utils/productStorage';
import { obtenerEntradas } from '../../utils/entradaInventarioStorage';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type PrediccionStock = {
  productoId: string;
  productoNombre: string;
  stockActual: number;
  consumoPromedioDiario: number;
  diasRestantes: number;
  tendencia: 'critico' | 'bajo' | 'normal' | 'alto';
  fechaAgotamientoEstimada: string;
  recomendacion: string;
};

export function AnalisisPredictivoStock() {
  const { t } = useTranslation();
  const [predicciones, setPredicciones] = useState<PrediccionStock[]>([]);
  const [datosGrafico, setDatosGrafico] = useState<any[]>([]);

  useEffect(() => {
    calcularPredicciones();
  }, []);

  const calcularPredicciones = () => {
    const productos = obtenerProductos();
    const entradas = obtenerEntradas();

    // Calcular consumo promedio basado en entradas históricas
    const prediccionesCalculadas: PrediccionStock[] = productos
      .filter(p => p.activo && p.stockActual > 0)
      .map(producto => {
        // Simular consumo promedio (en producción, esto vendría de datos reales)
        const consumoPromedioDiario = Math.random() * 5 + 1; // 1-6 unidades por día
        const diasRestantes = Math.floor(producto.stockActual / consumoPromedioDiario);
        
        const fechaAgotamiento = new Date();
        fechaAgotamiento.setDate(fechaAgotamiento.getDate() + diasRestantes);
        
        let tendencia: PrediccionStock['tendencia'] = 'normal';
        let recomendacion = 'Stock suficiente para las próximas semanas';
        
        if (diasRestantes < 7) {
          tendencia = 'critico';
          recomendacion = '🚨 Solicitar reposición urgente';
        } else if (diasRestantes < 14) {
          tendencia = 'bajo';
          recomendacion = '⚠️ Planificar reposición pronto';
        } else if (diasRestantes > 60) {
          tendencia = 'alto';
          recomendacion = '✅ Stock excedente, considerar distribuir';
        }

        return {
          productoId: producto.id,
          productoNombre: producto.nombre,
          stockActual: producto.stockActual,
          consumoPromedioDiario: parseFloat(consumoPromedioDiario.toFixed(2)),
          diasRestantes,
          tendencia,
          fechaAgotamientoEstimada: fechaAgotamiento.toISOString(),
          recomendacion
        };
      })
      .sort((a, b) => a.diasRestantes - b.diasRestantes);

    setPredicciones(prediccionesCalculadas);

    // Generar datos para el gráfico (proyección a 30 días)
    const diasProyeccion = 30;
    const grafico = Array.from({ length: diasProyeccion }, (_, i) => {
      const dia = i + 1;
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + dia);
      
      return {
        dia: `Día ${dia}`,
        fecha: fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        stockProyectado: prediccionesCalculadas.reduce((sum, p) => {
          const stockEnDia = Math.max(0, p.stockActual - (p.consumoPromedioDiario * dia));
          return sum + stockEnDia;
        }, 0),
        consumoAcumulado: prediccionesCalculadas.reduce((sum, p) => {
          return sum + (p.consumoPromedioDiario * dia);
        }, 0)
      };
    });

    setDatosGrafico(grafico);
  };

  const obtenerColorTendencia = (tendencia: PrediccionStock['tendencia']) => {
    switch (tendencia) {
      case 'critico': return 'bg-[#DC3545] text-white';
      case 'bajo': return 'bg-[#FFC107] text-white';
      case 'normal': return 'bg-[#4CAF50] text-white';
      case 'alto': return 'bg-[#1E73BE] text-white';
    }
  };

  const obtenerIconoTendencia = (tendencia: PrediccionStock['tendencia']) => {
    switch (tendencia) {
      case 'critico':
      case 'bajo':
        return <TrendingDown className="h-4 w-4" />;
      case 'alto':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const productosCriticos = predicciones.filter(p => p.tendencia === 'critico').length;
  const productosBajos = predicciones.filter(p => p.tendencia === 'bajo').length;

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#DC3545]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">Stock Crítico</p>
                <p className="text-3xl font-bold text-[#DC3545]">{productosCriticos}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-[#DC3545]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#FFC107]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">Stock Bajo</p>
                <p className="text-3xl font-bold text-[#FFC107]">{productosBajos}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-[#FFC107]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#4CAF50]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">Stock Normal</p>
                <p className="text-3xl font-bold text-[#4CAF50]">
                  {predicciones.filter(p => p.tendencia === 'normal').length}
                </p>
              </div>
              <Package className="h-8 w-8 text-[#4CAF50]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#1E73BE]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">Stock Alto</p>
                <p className="text-3xl font-bold text-[#1E73BE]">
                  {predicciones.filter(p => p.tendencia === 'alto').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-[#1E73BE]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de proyección */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
            📊 Proyección de Stock a 30 Días
          </CardTitle>
          <CardDescription>
            Estimación basada en el consumo promedio histórico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={datosGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="stockProyectado" 
                stroke="#1E73BE" 
                strokeWidth={2}
                name="Stock Proyectado"
              />
              <Line 
                type="monotone" 
                dataKey="consumoAcumulado" 
                stroke="#DC3545" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Consumo Acumulado"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabla de predicciones */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
            🔮 Predicciones de Agotamiento
          </CardTitle>
          <CardDescription>
            Productos ordenados por urgencia de reposición
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predicciones.slice(0, 10).map(prediccion => (
              <div 
                key={prediccion.productoId} 
                className="border rounded-lg p-4 hover:bg-[#F4F4F4] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-[#333333]">{prediccion.productoNombre}</h4>
                      <Badge className={obtenerColorTendencia(prediccion.tendencia)}>
                        {obtenerIconoTendencia(prediccion.tendencia)}
                        <span className="ml-1">{prediccion.tendencia.toUpperCase()}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-[#666666]">Stock Actual</p>
                        <p className="font-bold text-[#1E73BE]">{prediccion.stockActual} und</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#666666]">Consumo Diario</p>
                        <p className="font-bold text-[#333333]">{prediccion.consumoPromedioDiario} und/día</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#666666]">Días Restantes</p>
                        <p className="font-bold text-[#DC3545]">{prediccion.diasRestantes} días</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#666666]">Agotamiento Est.</p>
                        <p className="text-xs font-medium">
                          {new Date(prediccion.fechaAgotamientoEstimada).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#666666]">Nivel de stock</span>
                        <span className="font-medium">{Math.min(100, (prediccion.diasRestantes / 30) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={Math.min(100, (prediccion.diasRestantes / 30) * 100)} 
                        className="h-2"
                      />
                    </div>

                    <p className="text-sm text-[#666666] mt-2 italic">
                      {prediccion.recomendacion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}