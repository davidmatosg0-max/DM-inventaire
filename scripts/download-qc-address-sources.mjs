#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const outputRoot = path.join(repoRoot, 'tmp', 'official-address-sources');
const force = process.argv.includes('--force');
const buildIndexes = process.argv.includes('--build-indexes');

const sources = {
  rqaZipUrl: 'https://diffusion.mern.gouv.qc.ca/diffusion/RGQ/Vectoriel/Theme/Local/RQA/CSV/RQA_CSV.zip',
  lavalGeoJsonUrl: 'https://www.donneesquebec.ca/recherche/dataset/8cd81673-5b0b-4050-b4a6-aed80975158a/resource/7ccb7a8b-18bb-4818-b0f1-beb9b05dbe41/download/adressecivique.geojson',
};

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function escapePowerShellSingleQuotes(value) {
  return value.replace(/'/g, "''");
}

async function downloadFile(url, destinationPath) {
  if (!force && fs.existsSync(destinationPath)) {
    return;
  }

  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Impossible de télécharger ${url} (${response.status} ${response.statusText})`);
  }

  const fileStream = fs.createWriteStream(destinationPath);
  await pipeline(Readable.fromWeb(response.body), fileStream);
}

function runPowerShell(script) {
  const result = spawnSync(
    'powershell',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script],
    { cwd: repoRoot, encoding: 'utf8', maxBuffer: 1024 * 1024 * 50 }
  );

  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || 'Erreur PowerShell inconnue').trim());
  }

  return result.stdout.trim();
}

function collectFileInfo(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const stats = fs.statSync(filePath);
  return {
    path: path.relative(repoRoot, filePath).replace(/\\/g, '/'),
    sizeBytes: stats.size,
    modifiedAt: stats.mtime.toISOString(),
  };
}

function findFirstCsvFile(rootDir) {
  if (!fs.existsSync(rootDir)) {
    return null;
  }

  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      const nestedMatch = findFirstCsvFile(fullPath);
      if (nestedMatch) {
        return nestedMatch;
      }
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.csv')) {
      return fullPath;
    }
  }

  return null;
}

async function main() {
  ensureDir(outputRoot);

  const rqaDir = path.join(outputRoot, 'quebec-rqa');
  const lavalDir = path.join(outputRoot, 'laval');
  ensureDir(rqaDir);
  ensureDir(lavalDir);

  const rqaZipPath = path.join(rqaDir, 'RQA_CSV.zip');
  const rqaExtractDir = path.join(rqaDir, 'extract');
  const municipalitiesPath = path.join(rqaDir, 'municipalites-quebec.json');
  const postalCodesPath = path.join(rqaDir, 'codes-postaux-quebec.json');
  const lavalStreetsPath = path.join(rqaDir, 'laval-rues-rqa.json');
  const rqaSummaryPath = path.join(rqaDir, 'rqa-summary.json');
  const lavalGeoJsonPath = path.join(lavalDir, 'adressecivique.geojson');

  console.log('Téléchargement de la base officielle RQA du Québec...');
  await downloadFile(sources.rqaZipUrl, rqaZipPath);

  console.log('Extraction du fichier RQA.csv...');
  const expandArchiveScript = `
    $zipPath = '${escapePowerShellSingleQuotes(rqaZipPath)}'
    $extractPath = '${escapePowerShellSingleQuotes(rqaExtractDir)}'
    if (Test-Path $extractPath) {
      Remove-Item -Path $extractPath -Recurse -Force
    }
    New-Item -ItemType Directory -Path $extractPath | Out-Null
    Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
  `;
  runPowerShell(expandArchiveScript);

  const rqaCsvPath = findFirstCsvFile(rqaExtractDir);
  if (!rqaCsvPath) {
    throw new Error('Aucun fichier CSV n\'a été trouvé après extraction du ZIP RQA.');
  }

  if (buildIndexes) {
    console.log('Génération des index municipaux et postaux...');
    const summaryScript = `
      $csvPath = '${escapePowerShellSingleQuotes(rqaCsvPath)}'
      $municipalitiesPath = '${escapePowerShellSingleQuotes(municipalitiesPath)}'
      $postalCodesPath = '${escapePowerShellSingleQuotes(postalCodesPath)}'
      $lavalStreetsPath = '${escapePowerShellSingleQuotes(lavalStreetsPath)}'
      $summaryPath = '${escapePowerShellSingleQuotes(rqaSummaryPath)}'

      $rows = Import-Csv -Path $csvPath

      $municipalities = $rows |
        Where-Object { $_.nom_municipalite } |
        ForEach-Object { $_.nom_municipalite.Trim() } |
        Where-Object { $_ } |
        Sort-Object -Unique

      $postalCodes = $rows |
        Where-Object { $_.code_postal } |
        ForEach-Object { $_.code_postal.Trim() } |
        Where-Object { $_ } |
        Sort-Object -Unique

      $lavalStreets = $rows |
        Where-Object { $_.nom_municipalite -eq 'Laval' -and $_.odonyme_recompose_court } |
        Group-Object odonyme_recompose_court |
        Sort-Object Name |
        ForEach-Object {
          [PSCustomObject]@{
            nom = $_.Name
            occurrences = $_.Count
            codesPostaux = ($_.Group |
              Where-Object { $_.code_postal } |
              ForEach-Object { $_.code_postal.Trim() } |
              Where-Object { $_ } |
              Sort-Object -Unique)
          }
        }

      $summary = [PSCustomObject]@{
        rowCount = $rows.Count
        municipalityCount = $municipalities.Count
        postalCodeCount = $postalCodes.Count
        lavalStreetCount = $lavalStreets.Count
        indexesBuilt = $true
      }

      $municipalities | ConvertTo-Json -Depth 3 | Set-Content -Path $municipalitiesPath -Encoding UTF8
      $postalCodes | ConvertTo-Json -Depth 3 | Set-Content -Path $postalCodesPath -Encoding UTF8
      $lavalStreets | ConvertTo-Json -Depth 5 | Set-Content -Path $lavalStreetsPath -Encoding UTF8
      $summary | ConvertTo-Json -Depth 4 | Set-Content -Path $summaryPath -Encoding UTF8
    `;
    runPowerShell(summaryScript);
  } else {
    const quickSummary = {
      indexesBuilt: false,
      rowCount: null,
      municipalityCount: null,
      postalCodeCount: null,
      lavalStreetCount: null,
      note: 'Les sources officielles brutes ont été téléchargées et extraites. Utilisez --build-indexes pour générer les index JSON lourds.',
    };
    fs.writeFileSync(rqaSummaryPath, JSON.stringify(quickSummary, null, 2), 'utf8');
  }

  console.log('Téléchargement de la couche GeoJSON officielle de Laval...');
  await downloadFile(sources.lavalGeoJsonUrl, lavalGeoJsonPath);

  const manifest = {
    downloadedAt: new Date().toISOString(),
    sources,
    files: {
      rqaZip: collectFileInfo(rqaZipPath),
      rqaCsv: collectFileInfo(rqaCsvPath),
      municipalities: collectFileInfo(municipalitiesPath),
      postalCodes: collectFileInfo(postalCodesPath),
      lavalStreets: collectFileInfo(lavalStreetsPath),
      rqaSummary: collectFileInfo(rqaSummaryPath),
      lavalGeoJson: collectFileInfo(lavalGeoJsonPath),
    },
  };

  const manifestPath = path.join(outputRoot, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log('Téléchargement officiel terminé.');
  console.log(`Manifeste: ${path.relative(repoRoot, manifestPath).replace(/\\/g, '/')}`);
}

main().catch((error) => {
  console.error('Erreur lors du téléchargement des sources officielles d\'adresses:');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});