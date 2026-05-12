const fs = require('fs');
const path = require('path');
const vm = require('vm');
const esbuild = require('esbuild');

const repoRoot = path.resolve(__dirname, '..');
const helperPath = path.join(repoRoot, 'src', 'app', 'components', 'reports', 'reportComandaStatus.ts');
const reportComandasPath = path.join(repoRoot, 'src', 'app', 'components', 'reports', 'reportComandas.ts');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}. Esperado: ${expected}. Actual: ${actual}`);
  }
}

function loadStatusHelpers() {
  const buildResult = esbuild.buildSync({
    entryPoints: [helperPath],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    write: false,
    logLevel: 'silent',
    target: ['node18']
  });

  const bundledCode = buildResult.outputFiles[0].text;
  const module = { exports: {} };
  const context = {
    module,
    exports: module.exports,
    require,
    console,
    process
  };

  vm.runInNewContext(bundledCode, context, {
    filename: 'reportComandaStatus.bundle.cjs'
  });

  return module.exports;
}

function createLocalStorageMock(initialState = {}) {
  const store = { ...initialState };

  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      Object.keys(store).forEach((key) => delete store[key]);
    }
  };
}

function loadReportComandasHelpers(initialStorage = {}) {
  const buildResult = esbuild.buildSync({
    entryPoints: [reportComandasPath],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    write: false,
    logLevel: 'silent',
    target: ['node18'],
    define: {
      'import.meta.env': '{}'
    }
  });

  const bundledCode = buildResult.outputFiles[0].text;
  const module = { exports: {} };
  const localStorage = createLocalStorageMock(initialStorage);
  const context = {
    module,
    exports: module.exports,
    require,
    console,
    process,
    localStorage,
  };

  context.globalThis = context;
  context.global = context;
  context.window = context;

  vm.runInNewContext(bundledCode, context, {
    filename: 'reportComandas.bundle.cjs'
  });

  return module.exports;
}

function validateStatusLogic() {
  const {
    isActiveReportComanda,
    matchesReportComandaStatusFilter
  } = loadStatusHelpers();

  const activeComanda = { estado: 'completada' };
  const deliveredComanda = { estado: 'entregada' };
  const canceledComanda = { estado: 'anulada' };

  assertEqual(isActiveReportComanda(activeComanda), true, 'Una comanda completada debe contarse como activa');
  assertEqual(isActiveReportComanda(deliveredComanda), true, 'Una comanda entregada debe contarse como activa');
  assertEqual(isActiveReportComanda(canceledComanda), false, 'Una comanda anulada no debe contarse como activa');

  assertEqual(
    matchesReportComandaStatusFilter(activeComanda, 'all'),
    true,
    'El filtro all debe conservar comandas activas'
  );
  assertEqual(
    matchesReportComandaStatusFilter(canceledComanda, 'all'),
    false,
    'El filtro all debe excluir comandas anuladas'
  );
  assertEqual(
    matchesReportComandaStatusFilter(deliveredComanda, 'entregada'),
    true,
    'El filtro explicito entregada debe conservar ese estado'
  );
  assertEqual(
    matchesReportComandaStatusFilter(canceledComanda, 'anulada'),
    true,
    'El filtro explicito anulada debe seguir permitiendo auditar comandas anuladas'
  );
}

function validateWiring() {
  const reportsModulePath = path.join(repoRoot, 'src', 'app', 'components', 'reports', 'ReportsModule.tsx');
  const exitReportViewPath = path.join(repoRoot, 'src', 'app', 'components', 'reports', 'ExitReportView.tsx');

  const reportsModuleContent = fs.readFileSync(reportsModulePath, 'utf8');
  const exitReportViewContent = fs.readFileSync(exitReportViewPath, 'utf8');

  assert(
    reportsModuleContent.includes("from './reportComandaStatus'"),
    'ReportsModule debe importar la regla compartida de estado de comandas'
  );
  assert(
    reportsModuleContent.includes('filter(isActiveReportComanda)'),
    'ReportsModule debe usar isActiveReportComanda para su quick stat de distribution'
  );
  assert(
    !reportsModuleContent.includes("estado !== 'anulada'"),
    'ReportsModule no debe volver a duplicar la exclusion inline de anuladas'
  );

  assert(
    exitReportViewContent.includes("from './reportComandaStatus'"),
    'ExitReportView debe importar la regla compartida de estado de comandas'
  );
  assert(
    exitReportViewContent.includes('matchesReportComandaStatusFilter(comanda, statusFilter)'),
    'ExitReportView debe usar la regla compartida en su filtro base'
  );
  assert(
    !exitReportViewContent.includes('function matchesStatusFilter('),
    'ExitReportView no debe redefinir localmente la logica del filtro de estado'
  );
}

function validateOfferDistributionInReports() {
  const { obtenerComandasReporte } = loadReportComandasHelpers({
    banco_alimentos_comandas: JSON.stringify([]),
    ofertas_sistema: JSON.stringify([
      {
        id: 'oferta-1',
        numeroOferta: 'OFE-2026-05-001',
        titulo: 'Oferta con solicitudes',
        descripcion: 'Demo',
        fechaCreacion: '2026-05-10T10:00:00.000Z',
        fechaExpiracion: '2026-05-30T10:00:00.000Z',
        estado: 'parcial',
        creadoPor: 'qa',
        visible: true,
        activa: true,
        organismosDestino: 'todos',
        aceptaciones: [],
        totalProductos: 2,
        totalKilos: 11,
        valorMonetarioTotal: 39,
        productos: [
          {
            productoId: 'prod-kg',
            productoNombre: 'Arroz',
            productoCodigo: 'AR-1',
            categoria: 'Secos',
            cantidadOfrecida: 10,
            cantidadDisponible: 5,
            unidad: 'kg',
            peso: 1,
            valorUnitario: 2,
          },
          {
            productoId: 'prod-box',
            productoNombre: 'Latas',
            productoCodigo: 'LT-1',
            categoria: 'Conservas',
            cantidadOfrecida: 12,
            cantidadDisponible: 4,
            unidad: 'boîtes',
            peso: 2,
            valorUnitario: 3,
          }
        ],
        solicitudes: [
          {
            id: 'sol-pendiente',
            organismoId: 'org-1',
            organismoNombre: 'Organismo Pendiente',
            fechaSolicitud: '2026-05-11T09:00:00.000Z',
            productosAceptados: [
              { productoId: 'prod-kg', cantidadAceptada: 2 }
            ],
            estado: 'pendiente'
          },
          {
            id: 'sol-aceptada',
            organismoId: 'org-2',
            organismoNombre: 'Organismo Aceptado',
            fechaSolicitud: '2026-05-11T10:00:00.000Z',
            fechaActualizacion: '2026-05-11T12:00:00.000Z',
            productosAceptados: [
              { productoId: 'prod-kg', cantidadAceptada: 5 },
              { productoId: 'prod-box', cantidadAceptada: 3 }
            ],
            estado: 'aceptada'
          },
          {
            id: 'sol-entregada',
            organismoId: 'org-3',
            organismoNombre: 'Organismo Entregado',
            fechaSolicitud: '2026-05-11T11:00:00.000Z',
            fechaActualizacion: '2026-05-12T08:30:00.000Z',
            productosAceptados: [
              { productoId: 'prod-box', cantidadAceptada: 1 }
            ],
            estado: 'entregada'
          },
          {
            id: 'sol-rechazada',
            organismoId: 'org-4',
            organismoNombre: 'Organismo Rechazado',
            fechaSolicitud: '2026-05-11T12:00:00.000Z',
            productosAceptados: [
              { productoId: 'prod-kg', cantidadAceptada: 1 }
            ],
            estado: 'rechazada'
          }
        ]
      }
    ])
  });

  const reportes = obtenerComandasReporte();
  const solicitudAceptada = reportes.find((comanda) => comanda.id === 'OFE-SOL-sol-aceptada');
  const solicitudEntregada = reportes.find((comanda) => comanda.id === 'OFE-SOL-sol-entregada');

  assertEqual(reportes.length, 2, 'Solo las solicitudes de oferta aceptadas y entregadas deben entrar en reportes');
  assert(Boolean(solicitudAceptada), 'La solicitud aceptada debe incluirse en reportes');
  assert(Boolean(solicitudEntregada), 'La solicitud entregada debe incluirse en reportes');
  assertEqual(solicitudAceptada.estado, 'confirmada', 'La solicitud aceptada debe mapearse a estado confirmada');
  assertEqual(solicitudEntregada.estado, 'entregada', 'La solicitud entregada debe conservar estado entregada');
  assertEqual(solicitudAceptada.totalPeso, 11, 'El peso total de la solicitud aceptada debe sumar kg directos y pesos unitarios');
  assertEqual(solicitudAceptada.totalValorMonetario, 19, 'El valor total de la solicitud aceptada debe usar las cantidades aceptadas');
  assertEqual(solicitudEntregada.fecha, '2026-05-12T08:30:00.000Z', 'La solicitud entregada debe reportarse con su fecha de actualización');
}

try {
  validateStatusLogic();
  validateWiring();
  validateOfferDistributionInReports();

  console.log(JSON.stringify({
    ok: true,
    checks: [
      'status-helper-active-completed',
      'status-helper-active-delivered',
      'status-helper-excludes-canceled-from-all',
      'status-helper-allows-explicit-canceled-filter',
      'reports-module-shared-wiring',
      'exit-report-view-shared-wiring',
      'offer-requests-in-report-data'
    ]
  }, null, 2));
} catch (error) {
  console.error('REPORTES_DISTRIBUTION_STATUS_REGRESSION_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
}