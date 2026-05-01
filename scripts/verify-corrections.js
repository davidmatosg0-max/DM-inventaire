#!/usr/bin/env node

/**
 * Script de vérification automatique des corrections
 * Vérifie que toutes les corrections du guide ont été appliquées
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Statistiques
const stats = {
  totalFiles: 0,
  filesChecked: 0,
  consoleLogFound: 0,
  indexKeysFound: 0,
  escapeSequencesFound: 0,
  ariaIssuesFound: 0,
  errors: [],
  warnings: [],
};

/**
 * Lire un fichier
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    stats.errors.push(`Impossible de lire ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Vérifier les console.log
 */
function checkConsoleLogs(content, filePath) {
  const consoleRegex = /console\.(log|warn|error|info|table|group|groupEnd)\(/g;
  const matches = content.match(consoleRegex);
  
  if (matches) {
    stats.consoleLogFound += matches.length;
    stats.warnings.push(
      `${colors.yellow}⚠️  ${filePath}${colors.reset}: ${matches.length} console.log trouvé(s)`
    );
    
    // Vérifier si logger est importé
    if (!content.includes("import { logger } from")) {
      stats.errors.push(
        `${colors.red}❌ ${filePath}${colors.reset}: logger n'est pas importé`
      );
    }
  }
}

/**
 * Vérifier les keys avec index
 */
function checkIndexKeys(content, filePath) {
  const indexKeyRegex = /key=\{.*index.*\}/g;
  const matches = content.match(indexKeyRegex);
  
  if (matches) {
    stats.indexKeysFound += matches.length;
    stats.warnings.push(
      `${colors.yellow}⚠️  ${filePath}${colors.reset}: ${matches.length} key={index} trouvé(s)`
    );
  }
}

/**
 * Vérifier les escape sequences
 */
function checkEscapeSequences(content, filePath) {
  const escapeRegex = /\\n\s+/g;
  const matches = content.match(escapeRegex);
  
  if (matches) {
    stats.escapeSequencesFound += matches.length;
    stats.warnings.push(
      `${colors.yellow}⚠️  ${filePath}${colors.reset}: ${matches.length} escape sequence(s) trouvée(s)`
    );
  }
}

/**
 * Vérifier aria-describedby
 */
function checkAriaDescribedby(content, filePath) {
  const ariaRegex = /aria-describedby="([^"]+)"/g;
  let match;
  
  while ((match = ariaRegex.exec(content)) !== null) {
    const ariaId = match[1];
    const visuallyHiddenRegex = new RegExp(`id="${ariaId}"`);
    
    if (!visuallyHiddenRegex.test(content)) {
      stats.ariaIssuesFound++;
      stats.warnings.push(
        `${colors.yellow}⚠️  ${filePath}${colors.reset}: aria-describedby="${ariaId}" sans élément correspondant`
      );
    }
  }
}

/**
 * Vérifier un fichier
 */
function checkFile(filePath) {
  const content = readFile(filePath);
  if (!content) return;
  
  stats.filesChecked++;
  
  checkConsoleLogs(content, filePath);
  checkIndexKeys(content, filePath);
  checkEscapeSequences(content, filePath);
  checkAriaDescribedby(content, filePath);
}

/**
 * Scanner récursivement un répertoire
 */
function scanDirectory(dir, extensions = ['.tsx', '.ts']) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Ignorer node_modules et autres dossiers
      if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
        scanDirectory(filePath, extensions);
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        stats.totalFiles++;
        checkFile(filePath);
      }
    }
  });
}

/**
 * Vérifier si authStorage.ts existe
 */
function checkAuthStorage() {
  const authStoragePath = path.join(process.cwd(), 'src', 'app', 'utils', 'authStorage.ts');
  
  if (!fs.existsSync(authStoragePath)) {
    stats.errors.push(
      `${colors.red}❌ authStorage.ts n'existe pas${colors.reset}`
    );
    return false;
  }
  
  const content = readFile(authStoragePath);
  if (!content) return false;
  
  // Vérifier que les fonctions essentielles existent
  const requiredFunctions = [
    'getAuthStatus',
    'setAuth',
    'clearAuth',
    'isProductionCleanupDone',
    'performProductionCleanup',
    'cleanupOldContactTypes',
  ];
  
  requiredFunctions.forEach(func => {
    if (!content.includes(`export const ${func}`)) {
      stats.errors.push(
        `${colors.red}❌ Fonction ${func} manquante dans authStorage.ts${colors.reset}`
      );
    }
  });
  
  return true;
}

/**
 * Afficher le rapport
 */
function displayReport() {
  console.log('\n' + '='.repeat(80));
  console.log(
    `${colors.cyan}📊 RAPPORT DE VÉRIFICATION DES CORRECTIONS${colors.reset}`
  );
  console.log('='.repeat(80) + '\n');
  
  // Statistiques générales
  console.log(`${colors.blue}📁 Fichiers scannés:${colors.reset} ${stats.filesChecked}/${stats.totalFiles}`);
  console.log('');
  
  // Problèmes trouvés
  console.log(`${colors.magenta}🔍 Problèmes trouvés:${colors.reset}`);
  console.log(`   console.log:      ${stats.consoleLogFound > 0 ? colors.red : colors.green}${stats.consoleLogFound}${colors.reset}`);
  console.log(`   key={index}:      ${stats.indexKeysFound > 0 ? colors.red : colors.green}${stats.indexKeysFound}${colors.reset}`);
  console.log(`   Escape sequences: ${stats.escapeSequencesFound > 0 ? colors.red : colors.green}${stats.escapeSequencesFound}${colors.reset}`);
  console.log(`   Aria issues:      ${stats.ariaIssuesFound > 0 ? colors.red : colors.green}${stats.ariaIssuesFound}${colors.reset}`);
  console.log('');
  
  // Erreurs critiques
  if (stats.errors.length > 0) {
    console.log(`${colors.red}❌ ERREURS CRITIQUES (${stats.errors.length}):${colors.reset}`);
    stats.errors.forEach(error => console.log(`   ${error}`));
    console.log('');
  }
  
  // Avertissements
  if (stats.warnings.length > 0) {
    console.log(`${colors.yellow}⚠️  AVERTISSEMENTS (${stats.warnings.length}):${colors.reset}`);
    if (stats.warnings.length <= 10) {
      stats.warnings.forEach(warning => console.log(`   ${warning}`));
    } else {
      stats.warnings.slice(0, 10).forEach(warning => console.log(`   ${warning}`));
      console.log(`   ${colors.yellow}... et ${stats.warnings.length - 10} autres avertissements${colors.reset}`);
    }
    console.log('');
  }
  
  // Résultat final
  const totalIssues = 
    stats.consoleLogFound + 
    stats.indexKeysFound + 
    stats.escapeSequencesFound + 
    stats.ariaIssuesFound;
  
  console.log('='.repeat(80));
  if (totalIssues === 0 && stats.errors.length === 0) {
    console.log(`${colors.green}✅ TOUTES LES CORRECTIONS ONT ÉTÉ APPLIQUÉES !${colors.reset}`);
  } else if (stats.errors.length > 0) {
    console.log(`${colors.red}❌ ${stats.errors.length} ERREUR(S) CRITIQUE(S) À CORRIGER${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️  ${totalIssues} PROBLÈME(S) RESTANT(S)${colors.reset}`);
  }
  console.log('='.repeat(80) + '\n');
  
  // Instructions
  if (totalIssues > 0 || stats.errors.length > 0) {
    console.log(`${colors.cyan}📖 Consultez le guide:${colors.reset}`);
    console.log('   /GUIDE_CORRECTIONS_PRATIQUES.md');
    console.log('');
  }
}

/**
 * Main
 */
function main() {
  console.log(`${colors.cyan}🔍 Démarrage de la vérification...${colors.reset}\n`);
  
  // Vérifier authStorage.ts
  console.log('Vérification de authStorage.ts...');
  checkAuthStorage();
  
  // Scanner les fichiers
  console.log('Scan des fichiers TypeScript/React...');
  const srcPath = path.join(process.cwd(), 'src');
  scanDirectory(srcPath);
  
  // Afficher le rapport
  displayReport();
  
  // Exit code
  const totalIssues = 
    stats.consoleLogFound + 
    stats.indexKeysFound + 
    stats.escapeSequencesFound + 
    stats.ariaIssuesFound;
  
  process.exit(totalIssues > 0 || stats.errors.length > 0 ? 1 : 0);
}

// Exécuter
main();