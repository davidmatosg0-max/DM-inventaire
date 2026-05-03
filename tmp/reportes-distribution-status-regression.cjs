const fs = require('fs');
const path = require('path');
const vm = require('vm');
const esbuild = require('esbuild');

const repoRoot = path.resolve(__dirname, '..');
const helperPath = path.join(repoRoot, 'src', 'app', 'components', 'reports', 'reportComandaStatus.ts');

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

try {
  validateStatusLogic();
  validateWiring();

  console.log(JSON.stringify({
    ok: true,
    checks: [
      'status-helper-active-completed',
      'status-helper-active-delivered',
      'status-helper-excludes-canceled-from-all',
      'status-helper-allows-explicit-canceled-filter',
      'reports-module-shared-wiring',
      'exit-report-view-shared-wiring'
    ]
  }, null, 2));
} catch (error) {
  console.error('REPORTES_DISTRIBUTION_STATUS_REGRESSION_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
}