const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const targetPath = path.join(repoRoot, 'src', 'app', 'components', 'pages', 'ReportesAvanzado.tsx');
const source = fs.readFileSync(targetPath, 'utf8');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function includes(snippet) {
  return source.includes(snippet);
}

function validateAdvancedReportsWiring() {
  assert(
    includes("import { obtenerComandasReporte, type ReportComanda } from '../reports/reportComandas';"),
    'ReportesAvanzado debe importar la fuente consolidada de comandas.'
  );

  assert(
    includes("const initialRange = getDatePresetRange('month');")
      && includes("const [fechaInicio, setFechaInicio] = useState(initialRange.start);")
      && includes("const [fechaFin, setFechaFin] = useState(initialRange.end);"),
    'ReportesAvanzado debe abrir con un rango dinámico del mes actual y no con fechas fijas obsoletas.'
  );

  assert(
    includes("import { isActiveReportComanda } from '../reports/reportComandaStatus';"),
    'ReportesAvanzado debe usar la regla compartida de comandas activas.'
  );

  assert(
    includes("setComandas(obtenerComandasReporte());"),
    'ReportesAvanzado debe cargar comandas desde obtenerComandasReporte().' 
  );

  assert(
    includes("const comandasFiltradas = rangoValido")
      && includes("isActiveReportComanda(comanda) && isDateInRange(comanda.fechaEntrega || comanda.fecha, rangoInicio, rangoFin)"),
    'La pestaña de comandas debe filtrar por rango usando la colección consolidada y excluir anuladas.'
  );

  assert(
    includes("const organismosAnalizados = organismosReportados.length > 0 ? organismosReportados : organismos;"),
    'La pestaña de organismos debe usar el subconjunto servido cuando exista.'
  );

  assert(
    includes("const reportePrsLocal = rangoValido ? generarReportePRS(fechaInicio, fechaFin) : generarReportePRS();"),
    'La pestaña PRS debe calcular el reporte local canónico por rango.'
  );

  assert(
    includes("const organismosPRS = reportePrsLocal.resumen.organismosUnicos || obtenerOrganismosPRS().length;"),
    'La métrica de organismos PRS debe basarse primero en el reporte PRS filtrado.'
  );

  assert(
    includes("const productosSeguidos = productoIdsConActividad.size;")
      && includes("const productosSeguidosComparacion = productoIdsConActividadComparacion.size;"),
    'La métrica de productos seguidos no debe inflarse con todo el inventario cuando no hay actividad en el rango.'
  );
}

try {
  validateAdvancedReportsWiring();

  console.log(JSON.stringify({
    ok: true,
    checks: [
      'advanced-default-range-is-current-month',
      'advanced-orders-use-consolidated-source',
      'advanced-orders-filter-active-status',
      'advanced-organisms-use-served-subset',
      'advanced-prs-uses-local-canonical-report',
      'advanced-products-follow-range-activity'
    ]
  }, null, 2));
} catch (error) {
  console.error('REPORTES_AVANZADO_WIRING_REGRESSION_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
}
