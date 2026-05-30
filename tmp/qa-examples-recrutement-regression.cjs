const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const configuracionPath = path.join(repoRoot, 'src', 'app', 'components', 'pages', 'Configuracion.tsx');
const cloudPersistencePath = path.join(repoRoot, 'src', 'app', 'utils', 'cloudPersistence.ts');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  const configuracion = fs.readFileSync(configuracionPath, 'utf8');
  const cloudPersistence = fs.readFileSync(cloudPersistencePath, 'utf8');

  assert(
    configuracion.includes('function resolverCantidadOrganismosRecrutementEjemplos('),
    'Configuracion debe centralizar la resolución de cantidades para Organismes recrutement'
  );

  assert(
    configuracion.includes('resolverCantidadOrganismosRecrutementEjemplos(cantidadesEjemplos);'),
    'El botón de ejemplos debe reutilizar la misma resolución de cantidades al sembrar'
  );

  assert(
    configuracion.includes('organismosRecrutement: cantidadOrganismosRecrutementNormalizada,'),
    'El sembrado debe usar la cantidad resuelta de Organismes recrutement y no el valor crudo del estado'
  );

  assert(
    configuracion.includes("organismosRecrutement: String(cantidadOrganismosRecrutementNormalizada)"),
    'La UI debe reflejar la cantidad normalizada de Organismes recrutement tras cargar ejemplos'
  );

  assert(
    cloudPersistence.includes("'recrutement_organismes_banco_alimentos'"),
    'La persistencia remota debe incluir el storage de Organismes recrutement'
  );

  console.log('qa-examples-recrutement-regression: ok');
}

main();