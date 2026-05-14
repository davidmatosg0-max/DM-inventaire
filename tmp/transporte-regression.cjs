const { spawnSync } = require('node:child_process');
const path = require('node:path');

const baseUrl = process.env.TRANSPORTE_BASE_URL || 'http://127.0.0.1:5173/';
const scripts = [
  'transporte-functional.cjs',
  'transporte-choferes-functional.cjs',
];

for (const scriptName of scripts) {
  console.log(`RUN ${scriptName}`);
  const result = spawnSync(process.execPath, [path.join(__dirname, scriptName)], {
    stdio: 'inherit',
    env: {
      ...process.env,
      TRANSPORTE_BASE_URL: baseUrl,
    },
  });

  if (result.status !== 0) {
    console.error(`TRANSPORTE_REGRESSION_ERROR ${scriptName}`);
    process.exit(result.status || 1);
  }
}

console.log('TRANSPORTE_REGRESSION_OK');
