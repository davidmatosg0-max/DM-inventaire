const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const reportsPagePath = path.join(repoRoot, 'src', 'app', 'components', 'pages', 'Reportes.tsx');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function validateTabsWiring() {
  const reportsPageContent = fs.readFileSync(reportsPagePath, 'utf8');

  assert(
    reportsPageContent.includes("const comandasReporte = obtenerComandasReporte();"),
    'La pestaña de reportes debe construir una fuente consolidada de comandas'
  );

  assert(
    reportsPageContent.includes("const comandasFiltradas = rangoValido")
      && reportsPageContent.includes("? comandasReporte"),
    'La pestaña Comandas debe filtrar desde comandasReporte y no desde la colección canónica cruda'
  );

  assert(
    reportsPageContent.includes("const operationalDistributions = comandasFiltradas"),
    'Operaciones debe reutilizar la misma colección filtrada que Comandas para evitar divergencias'
  );

  assert(
    reportsPageContent.includes("const reportePrsLocal = rangoValido")
      && reportsPageContent.includes("? generarReportePRS(rangoInicio, rangoFin)")
      && reportsPageContent.includes(": generarReportePRS();"),
    'La pestaña PRS debe depender de generarReportePRS con y sin rango válido'
  );

  assert(
    reportsPageContent.includes("const auditLogsBase = rangoValido")
      && reportsPageContent.includes("obtenerLogs().filter((log) => isDateInRange(log.fecha, rangoInicio, rangoFin))"),
    'La pestaña Auditoría debe filtrar el registro por fecha visible'
  );

  assert(
    reportsPageContent.includes("const datosInventario = Array.from(")
      && reportsPageContent.includes("productosFiltrados.reduce((mapa, producto) =>"),
    'La pestaña Inventario debe calcular sus agregados desde productosFiltrados'
  );

  assert(
    reportsPageContent.includes("const compactGeneralItems")
      && reportsPageContent.includes("const compactOperationsItems")
      && reportsPageContent.includes("const compactInventoryItems")
      && reportsPageContent.includes("const compactOrdersItems")
      && reportsPageContent.includes("const compactPrsItems")
      && reportsPageContent.includes("const compactAuditItems"),
    'Todas las pestañas deben tener una síntesis compacta definida en el módulo'
  );
}

try {
  validateTabsWiring();

  console.log(JSON.stringify({
    ok: true,
    checks: [
      'tab-comandas-uses-consolidated-source',
      'tab-operaciones-reuses-orders-filter',
      'tab-prs-uses-reportes-logic',
      'tab-auditoria-filters-by-range',
      'tab-inventario-uses-filtered-products',
      'all-tabs-have-compact-summaries'
    ]
  }, null, 2));
} catch (error) {
  console.error('REPORTES_TABS_WIRING_REGRESSION_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
}