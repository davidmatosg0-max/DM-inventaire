import { Movimiento, TipoMovimiento } from '../components/inventario/MovimientosInventario';

const STORAGE_KEY = 'movimientos_inventario';

export const obtenerMovimientos = (): Movimiento[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    return [];
  }
};

export const guardarMovimientos = (movimientos: Movimiento[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movimientos));
  } catch (error) {
    console.error('Error al guardar movimientos:', error);
  }
};

export const registrarMovimiento = (movimiento: Omit<Movimiento, 'id' | 'fecha'>): Movimiento => {
  const movimientos = obtenerMovimientos();
  
  const nuevoMovimiento: Movimiento = {
    ...movimiento,
    id: `MOV-${String(movimientos.length + 1).padStart(4, '0')}`,
    fecha: new Date().toISOString()
  };

  movimientos.unshift(nuevoMovimiento); // Agregar al inicio
  guardarMovimientos(movimientos);

  return nuevoMovimiento;
};

export const registrarEntrada = (
  productoId: string,
  productoNombre: string,
  categoria: string,
  cantidad: number,
  unidad: string,
  stockAnterior: number,
  usuario: string,
  referencia?: string,
  valorMonetario?: number
): Movimiento => {
  return registrarMovimiento({
    tipo: 'entrada',
    productoId,
    productoNombre,
    categoria,
    cantidad,
    unidad,
    stockAnterior,
    stockNuevo: stockAnterior + cantidad,
    usuario,
    referencia,
    valorMonetario
  });
};

export const registrarSalida = (
  productoId: string,
  productoNombre: string,
  categoria: string,
  cantidad: number,
  unidad: string,
  stockAnterior: number,
  usuario: string,
  referencia?: string,
  destino?: string,
  valorMonetario?: number
): Movimiento => {
  return registrarMovimiento({
    tipo: 'salida',
    productoId,
    productoNombre,
    categoria,
    cantidad,
    unidad,
    stockAnterior,
    stockNuevo: stockAnterior - cantidad,
    usuario,
    referencia,
    destino,
    valorMonetario
  });
};

export const registrarAjuste = (
  productoId: string,
  productoNombre: string,
  categoria: string,
  cantidad: number,
  unidad: string,
  stockAnterior: number,
  stockNuevo: number,
  usuario: string,
  motivo: string,
  valorMonetario?: number
): Movimiento => {
  return registrarMovimiento({
    tipo: 'ajuste',
    productoId,
    productoNombre,
    categoria,
    cantidad: Math.abs(stockNuevo - stockAnterior),
    unidad,
    stockAnterior,
    stockNuevo,
    usuario,
    motivo,
    valorMonetario
  });
};

export const registrarMerma = (
  productoId: string,
  productoNombre: string,
  categoria: string,
  cantidad: number,
  unidad: string,
  stockAnterior: number,
  usuario: string,
  motivo: string,
  valorMonetario?: number
): Movimiento => {
  return registrarMovimiento({
    tipo: 'merma',
    productoId,
    productoNombre,
    categoria,
    cantidad,
    unidad,
    stockAnterior,
    stockNuevo: stockAnterior - cantidad,
    usuario,
    motivo,
    valorMonetario
  });
};

export const registrarDonacion = (
  productoId: string,
  productoNombre: string,
  categoria: string,
  cantidad: number,
  unidad: string,
  stockAnterior: number,
  usuario: string,
  destino: string,
  referencia?: string,
  valorMonetario?: number
): Movimiento => {
  return registrarMovimiento({
    tipo: 'donacion',
    productoId,
    productoNombre,
    categoria,
    cantidad,
    unidad,
    stockAnterior,
    stockNuevo: stockAnterior - cantidad,
    usuario,
    destino,
    referencia,
    valorMonetario
  });
};

export const registrarTransferencia = (
  productoId: string,
  productoNombre: string,
  categoria: string,
  cantidad: number,
  unidad: string,
  stockAnterior: number,
  usuario: string,
  destino: string,
  valorMonetario?: number
): Movimiento => {
  return registrarMovimiento({
    tipo: 'transferencia',
    productoId,
    productoNombre,
    categoria,
    cantidad,
    unidad,
    stockAnterior,
    stockNuevo: stockAnterior - cantidad,
    usuario,
    destino,
    valorMonetario
  });
};

export const eliminarMovimiento = (id: string): void => {
  const movimientos = obtenerMovimientos();
  const filtrados = movimientos.filter(m => m.id !== id);
  guardarMovimientos(filtrados);
};

export const obtenerMovimientosPorProducto = (productoId: string): Movimiento[] => {
  const movimientos = obtenerMovimientos();
  return movimientos.filter(m => m.productoId === productoId);
};

export const obtenerMovimientosPorTipo = (tipo: TipoMovimiento): Movimiento[] => {
  const movimientos = obtenerMovimientos();
  return movimientos.filter(m => m.tipo === tipo);
};

export const obtenerMovimientosPorFecha = (fechaInicio: Date, fechaFin: Date): Movimiento[] => {
  const movimientos = obtenerMovimientos();
  return movimientos.filter(m => {
    const fechaMov = new Date(m.fecha);
    return fechaMov >= fechaInicio && fechaMov <= fechaFin;
  });
};

export const obtenerEstadisticas = () => {
  const movimientos = obtenerMovimientos();
  
  const totalEntradas = movimientos
    .filter(m => m.tipo === 'entrada')
    .reduce((acc, m) => acc + m.cantidad, 0);
  
  const totalSalidas = movimientos
    .filter(m => m.tipo === 'salida' || m.tipo === 'donacion')
    .reduce((acc, m) => acc + m.cantidad, 0);
  
  const totalMermas = movimientos
    .filter(m => m.tipo === 'merma')
    .reduce((acc, m) => acc + m.cantidad, 0);
  
  const valorTotal = movimientos
    .reduce((acc, m) => acc + (m.valorMonetario || 0), 0);

  return {
    totalMovimientos: movimientos.length,
    totalEntradas,
    totalSalidas,
    totalMermas,
    valorTotal
  };
};
