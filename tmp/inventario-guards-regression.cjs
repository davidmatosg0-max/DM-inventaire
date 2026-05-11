const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const inventarioPath = path.join(repoRoot, 'src', 'app', 'components', 'pages', 'Inventario.tsx');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function countMatches(content, regex) {
  const matches = content.match(regex);
  return matches ? matches.length : 0;
}

try {
  const content = fs.readFileSync(inventarioPath, 'utf8');

  assert(
    content.includes("if (!Number.isFinite(cantidadOrigen) || !Number.isFinite(cantidadDestino) || cantidadOrigen <= 0 || cantidadDestino <= 0)"),
    'Inventario debe validar cantidades finitas y positivas antes de convertir unidades'
  );

  assert(
    content.includes("if (!Number.isFinite(factorConversion) || factorConversion <= 0)"),
    'Inventario debe validar el factor de conversión antes de calcular pesoUnitario destino'
  );

  assert(
    content.includes('stockMinimo: Math.ceil((productoOrigen.stockMinimo || 0) * factorConversion)'),
    'Inventario debe reutilizar el factor de conversión validado para stock mínimo destino'
  );

  assert(
    !content.includes('${nuevoStock}'),
    'Inventario no debe volver a usar la variable inexistente nuevoStock en el log de conversión'
  );

  assert(
    content.includes("if (!Number.isFinite(stockMinimo) || stockMinimo <= 0)"),
    'Inventario debe proteger getStockStatus contra stockMinimo cero'
  );

  assert(
    content.includes('const getReliableUnitWeight = (producto: typeof todosLosProductos[0]): number | null => {'),
    'Inventario debe centralizar el cálculo seguro de peso unitario visual'
  );

  assert(
    countMatches(content, /producto\.peso\s*\/\s*producto\.stockActual/g) === 1,
    'La división producto.peso / producto.stockActual debe quedar sólo dentro del helper seguro'
  );

  console.log(JSON.stringify({
    ok: true,
    checks: [
      'conversion-validates-positive-finite-quantities',
      'conversion-validates-factor',
      'conversion-reuses-safe-factor-for-stock-minimum',
      'conversion-removes-undefined-stock-log-variable',
      'stock-status-guards-zero-minimum',
      'unit-weight-centralized-safe-helper'
    ]
  }, null, 2));
} catch (error) {
  console.error('INVENTARIO_GUARDS_REGRESSION_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
}