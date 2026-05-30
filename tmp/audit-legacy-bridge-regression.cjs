const path = require('path');
const vm = require('vm');
const esbuild = require('esbuild');

const repoRoot = path.resolve(__dirname, '..');
const auditStoragePath = path.join(repoRoot, 'src', 'app', 'utils', 'auditStorage.ts');

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

function loadAuditStorage(initialStorage = {}) {
  const buildResult = esbuild.buildSync({
    entryPoints: [auditStoragePath],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    write: false,
    logLevel: 'silent',
    target: ['node18']
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
    navigator: { userAgent: 'node-test' },
  };

  context.globalThis = context;
  context.global = context;
  context.window = context;

  vm.runInNewContext(bundledCode, context, {
    filename: 'auditStorage.bundle.cjs'
  });

  return module.exports;
}

function validateLegacyBridge() {
  const { obtenerLogs, filtrarLogs } = loadAuditStorage({
    registroActividades: JSON.stringify([
      {
        id: 'act-2',
        fecha: '2026-05-18',
        hora: '10:30:00',
        usuario: 'Marie Test',
        usuarioId: 'u-2',
        modulo: 'Comandas',
        accion: 'modificar',
        descripcion: 'Commande #123 mise a jour',
        detalles: { comandaId: 'c-123' },
        ipAddress: 'local'
      },
      {
        id: 'act-1',
        fecha: '2026-05-17',
        hora: '08:15:00',
        usuario: 'Jean Test',
        usuarioId: 'u-1',
        modulo: 'Inventario',
        accion: 'crear',
        descripcion: 'Produit cree',
        detalles: { productoId: 'p-1' },
        ipAddress: 'local'
      }
    ]),
    banque_alimentaire_audit_logs: JSON.stringify([
      {
        id: 'audit-1',
        fecha: '2026-05-18T12:00:00.000Z',
        tipo: 'accion',
        usuario: 'Admin',
        modulo: 'usuarios',
        accion: 'usuarios.login',
        detalles: { timestamp: '2026-05-18T12:00:00.000Z' },
        exito: true,
        severidad: 'info'
      }
    ])
  });

  const logs = obtenerLogs();
  assertEqual(logs.length, 3, 'obtenerLogs debe combinar logs nuevos y actividades legacy');
  assert(
    new Date(logs[0].fecha).getTime() >= new Date(logs[1].fecha).getTime()
      && new Date(logs[1].fecha).getTime() >= new Date(logs[2].fecha).getTime(),
    'Los logs combinados deben quedar ordenados del mas reciente al mas antiguo'
  );

  const legacyLog = logs.find((log) => log.id === 'act-2');
  assert(Boolean(legacyLog), 'La actividad legacy mas reciente debe adaptarse a AuditLog');
  assertEqual(legacyLog.modulo, 'Comandas', 'El modulo legacy debe conservarse');
  assertEqual(legacyLog.accion, 'comandas.modificar', 'La accion legacy debe normalizarse para auditoria');
  assertEqual(legacyLog.exito, true, 'Las actividades legacy deben entrar como exitosas');

  const filteredByDate = filtrarLogs({ fechaInicio: '2026-05-18', fechaFin: '2026-05-18' });
  assertEqual(filteredByDate.length, 2, 'El filtrado por fecha debe incluir audit logs modernos y legacy del mismo dia');
}

try {
  validateLegacyBridge();

  console.log(JSON.stringify({
    ok: true,
    checks: [
      'legacy-activities-merged-into-audit',
      'legacy-activities-normalized',
      'date-filter-includes-legacy-and-modern-logs'
    ]
  }, null, 2));
} catch (error) {
  console.error('AUDIT_LEGACY_BRIDGE_REGRESSION_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
}
