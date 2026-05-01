import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Trash2,
  Calendar,
  User,
  Package,
  Filter,
  Download,
  Search,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { obtenerUsuarios } from '../../utils/usuarios';
import { formatMoney, formatQuantity } from '../../utils/formatUtils';
import { obtenerUsuarioSesion } from '../../utils/sesionStorage';

export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste' | 'transferencia' | 'merma' | 'donacion';

export interface Movimiento {
  id: string;
  fecha: string;
  tipo: TipoMovimiento;
  productoId: string;
  productoNombre: string;
  categoria: string;
  cantidad: number;
  unidad: string;
  stockAnterior: number;
  stockNuevo: number;
  usuario: string;
  motivo?: string;
  referencia?: string;
  destino?: string;
  valorMonetario?: number;
}

interface MovimientosInventarioProps {
  productos?: any[];
}

export function MovimientosInventario({ productos = [] }: MovimientosInventarioProps) {
  const { t } = useTranslation();
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<TipoMovimiento | 'todos'>('todos');
  const [filtroFecha, setFiltroFecha] = useState<'hoy' | 'semana' | 'mes' | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');

  // Cargar movimientos desde localStorage
  useEffect(() => {
    const movimientosGuardados = localStorage.getItem('movimientos_inventario');
    if (movimientosGuardados) {
      setMovimientos(JSON.parse(movimientosGuardados));
    } else {
      // Generar movimientos de ejemplo
      generarMovimientosEjemplo();
    }
  }, []);

  const generarMovimientosEjemplo = () => {
    const tiposMovimiento: TipoMovimiento[] = ['entrada', 'salida', 'ajuste', 'transferencia', 'merma', 'donacion'];
    
    // Obtener usuarios reales del sistema
    const usuariosData = obtenerUsuarios();
    const usuarios = usuariosData.map(u => `${u.nombre} ${u.apellido}`);
    
    // Si no hay usuarios, usar el usuario actual
    if (usuarios.length === 0) {
      const usuarioActual = obtenerUsuarioSesion();
      usuarios.push(usuarioActual ? `${usuarioActual.nombre} ${usuarioActual.apellido}` : 'Usuario Sistema');
    }
    
    const categoriasEjemplo = ['Alimentos Secos', 'Conservas', 'Lácteos', 'Frutas y Verduras', 'Proteínas'];
    const productosEjemplo = [
      'Arroz blanco', 'Frijoles negros', 'Aceite vegetal', 'Leche en polvo',
      'Atún enlatado', 'Pasta', 'Tomate enlatado', 'Lentejas'
    ];

    const movimientosEjemplo: Movimiento[] = [];
    const ahora = new Date();

    for (let i = 0; i < 50; i++) {
      const diasAtras = Math.floor(Math.random() * 30);
      const fecha = new Date(ahora);
      fecha.setDate(fecha.getDate() - diasAtras);

      const tipo = tiposMovimiento[Math.floor(Math.random() * tiposMovimiento.length)];
      const cantidad = Math.floor(Math.random() * 100) + 1;
      const stockAnterior = Math.floor(Math.random() * 500) + 100;
      const stockNuevo = tipo === 'entrada' ? stockAnterior + cantidad :
                         tipo === 'salida' || tipo === 'donacion' ? stockAnterior - cantidad :
                         stockAnterior + (Math.random() > 0.5 ? cantidad : -cantidad);

      movimientosEjemplo.push({
        id: `MOV-${String(i + 1).padStart(4, '0')}`,
        fecha: fecha.toISOString(),
        tipo,
        productoId: `PROD-${String(i + 1).padStart(3, '0')}`,
        productoNombre: productosEjemplo[Math.floor(Math.random() * productosEjemplo.length)],
        categoria: categoriasEjemplo[Math.floor(Math.random() * categoriasEjemplo.length)],
        cantidad,
        unidad: 'kg',
        stockAnterior,
        stockNuevo,
        usuario: usuarios[Math.floor(Math.random() * usuarios.length)],
        motivo: tipo === 'ajuste' ? 'Corrección de inventario' : 
                tipo === 'merma' ? 'Producto vencido' :
                tipo === 'donacion' ? 'Donación a organismo' : undefined,
        referencia: tipo === 'entrada' ? `ENT-${String(i + 1).padStart(3, '0')}` :
                   tipo === 'salida' ? `SAL-${String(i + 1).padStart(3, '0')}` : undefined,
        destino: tipo === 'transferencia' ? 'Almacén secundario' :
                tipo === 'donacion' ? 'Organismo Comunitario' : undefined,
        valorMonetario: cantidad * (Math.random() * 5 + 1)
      });
    }

    const ordenados = movimientosEjemplo.sort((a, b) => 
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    setMovimientos(ordenados);
    localStorage.setItem('movimientos_inventario', JSON.stringify(ordenados));
  };

  // Guardar movimientos en localStorage cuando cambian
  const guardarMovimientos = (nuevosMovimientos: Movimiento[]) => {
    setMovimientos(nuevosMovimientos);
    localStorage.setItem('movimientos_inventario', JSON.stringify(nuevosMovimientos));
  };

  // Filtrar movimientos
  const movimientosFiltrados = movimientos.filter(mov => {
    // Filtro por tipo
    if (filtroTipo !== 'todos' && mov.tipo !== filtroTipo) {
      return false;
    }

    // Filtro por fecha
    if (filtroFecha !== 'todos') {
      const fechaMov = new Date(mov.fecha);
      const ahora = new Date();
      const diferenciaDias = Math.floor((ahora.getTime() - fechaMov.getTime()) / (1000 * 60 * 60 * 24));

      if (filtroFecha === 'hoy' && diferenciaDias > 0) return false;
      if (filtroFecha === 'semana' && diferenciaDias > 7) return false;
      if (filtroFecha === 'mes' && diferenciaDias > 30) return false;
    }

    // Filtro por búsqueda
    if (busqueda) {
      const termino = busqueda.toLowerCase();
      return (
        mov.productoNombre.toLowerCase().includes(termino) ||
        mov.id.toLowerCase().includes(termino) ||
        mov.usuario.toLowerCase().includes(termino) ||
        mov.categoria.toLowerCase().includes(termino)
      );
    }

    return true;
  });

  // Obtener ícono y color por tipo de movimiento
  const getTipoInfo = (tipo: TipoMovimiento) => {
    switch (tipo) {
      case 'entrada':
        return { icon: ArrowUpCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Entrée' };
      case 'salida':
        return { icon: ArrowDownCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Sortie' };
      case 'ajuste':
        return { icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Ajustement' };
      case 'transferencia':
        return { icon: RefreshCw, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Transfert' };
      case 'merma':
        return { icon: TrendingDown, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Perte' };
      case 'donacion':
        return { icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Don' };
      default:
        return { icon: Package, color: 'text-gray-600', bg: 'bg-gray-50', label: tipo };
    }
  };

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    const totalEntradas = movimientosFiltrados
      .filter(m => m.tipo === 'entrada')
      .reduce((acc, m) => acc + m.cantidad, 0);
    
    const totalSalidas = movimientosFiltrados
      .filter(m => m.tipo === 'salida' || m.tipo === 'donacion')
      .reduce((acc, m) => acc + m.cantidad, 0);
    
    const totalMermas = movimientosFiltrados
      .filter(m => m.tipo === 'merma')
      .reduce((acc, m) => acc + m.cantidad, 0);
    
    const valorTotal = movimientosFiltrados
      .reduce((acc, m) => acc + (m.valorMonetario || 0), 0);

    return {
      totalEntradas,
      totalSalidas,
      totalMermas,
      valorTotal,
      totalMovimientos: movimientosFiltrados.length
    };
  };

  const stats = calcularEstadisticas();

  // Exportar a CSV
  const exportarCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Produit', 'Catégorie', 'Quantité', 'Unité', 'Stock Avant', 'Stock Après', 'Utilisateur', 'Motif'];
    const rows = movimientosFiltrados.map(m => [
      m.id,
      new Date(m.fecha).toLocaleDateString('fr-FR'),
      getTipoInfo(m.tipo).label,
      m.productoNombre,
      m.categoria,
      m.cantidad,
      m.unidad,
      m.stockAnterior,
      m.stockNuevo,
      m.usuario,
      m.motivo || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mouvements_inventaire_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('Exportation réussie');
  };

  return (
    <div className="space-y-4">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Mouvements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMovimientos}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Entrées</p>
                <p className="text-2xl font-bold text-green-600">+{stats.totalEntradas} kg</p>
              </div>
              <ArrowUpCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sorties</p>
                <p className="text-2xl font-bold text-red-600">-{stats.totalSalidas} kg</p>
              </div>
              <ArrowDownCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pertes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalMermas} kg</p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valeur Total</p>
                <p className="text-2xl font-bold text-blue-600">CAD$ {formatMoney(stats.valorTotal)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Historique des Mouvements</CardTitle>
              <CardDescription>Gestion et suivi de tous les mouvements d'inventaire</CardDescription>
            </div>
            <Button onClick={exportarCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par produit, ID, utilisateur..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filtroTipo} onValueChange={(value: any) => setFiltroTipo(value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Type de mouvement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Tous les types</SelectItem>
                <SelectItem value="entrada">Entrées</SelectItem>
                <SelectItem value="salida">Sorties</SelectItem>
                <SelectItem value="ajuste">Ajustements</SelectItem>
                <SelectItem value="transferencia">Transferts</SelectItem>
                <SelectItem value="merma">Pertes</SelectItem>
                <SelectItem value="donacion">Dons</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroFecha} onValueChange={(value: any) => setFiltroFecha(value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Toutes les dates</SelectItem>
                <SelectItem value="hoy">Aujourd'hui</SelectItem>
                <SelectItem value="semana">Cette semaine</SelectItem>
                <SelectItem value="mes">Ce mois</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabla de movimientos */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="text-right">Stock Avant</TableHead>
                  <TableHead className="text-right">Stock Après</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <AlertCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">Aucun mouvement trouvé</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  movimientosFiltrados.map((movimiento) => {
                    const tipoInfo = getTipoInfo(movimiento.tipo);
                    const Icon = tipoInfo.icon;

                    return (
                      <TableRow key={movimiento.id}>
                        <TableCell className="font-mono text-sm">{movimiento.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              {new Date(movimiento.fecha).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(movimiento.fecha).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${tipoInfo.bg} ${tipoInfo.color} border-0`}>
                            <Icon className="w-3 h-3 mr-1" />
                            {tipoInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{movimiento.productoNombre}</div>
                          <div className="text-xs text-gray-500">{movimiento.productoId}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{movimiento.categoria}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-semibold ${
                            movimiento.tipo === 'entrada' ? 'text-green-600' : 
                            movimiento.tipo === 'salida' || movimiento.tipo === 'donacion' ? 'text-red-600' : 
                            'text-blue-600'
                          }`}>
                            {movimiento.tipo === 'entrada' ? '+' : movimiento.tipo === 'salida' || movimiento.tipo === 'donacion' ? '-' : '±'}
                            {formatQuantity(movimiento.cantidad)} {movimiento.unidad}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-gray-600">
                          {formatQuantity(movimiento.stockAnterior)} {movimiento.unidad}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">{formatQuantity(movimiento.stockNuevo)} {movimiento.unidad}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{movimiento.usuario}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {movimiento.motivo && (
                            <p className="text-xs text-gray-600">{movimiento.motivo}</p>
                          )}
                          {movimiento.referencia && (
                            <p className="text-xs text-blue-600">Réf: {movimiento.referencia}</p>
                          )}
                          {movimiento.destino && (
                            <p className="text-xs text-purple-600">{movimiento.destino}</p>
                          )}
                          {movimiento.valorMonetario && (
                            <p className="text-xs text-green-600">CAD$ {formatMoney(movimiento.valorMonetario)}</p>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}