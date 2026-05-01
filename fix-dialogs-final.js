const fs = require('fs');
const path = require('path');

// Función para verificar si un DialogContent tiene DialogDescription
function checkDialogContent(content, filePath) {
  const issues = [];
  
  // Buscar todos los DialogContent
  const dialogContentRegex = /<DialogContent[^>]*>/g;
  let match;
  
  while ((match = dialogContentRegex.exec(content)) !== null) {
    const dialogTag = match[0];
    const startIndex = match.index;
    
    // Verificar si tiene aria-describedby
    const hasAriaDescribedBy = /aria-describedby=/.test(dialogTag);
    
    if (!hasAriaDescribedBy) {
      // Buscar el cierre del DialogContent
      const afterDialog = content.substring(startIndex);
      const endMatch = afterDialog.match(/<\/DialogContent>/);
      
      if (endMatch) {
        const dialogBlock = afterDialog.substring(0, endMatch.index);
        
        // Verificar si tiene DialogDescription
        const hasDescription = /<DialogDescription/.test(dialogBlock);
        
        if (!hasDescription) {
          const lineNumber = content.substring(0, startIndex).split('\n').length;
          issues.push({
            file: filePath,
            line: lineNumber,
            issue: 'DialogContent sin aria-describedby ni DialogDescription'
          });
        }
      }
    }
  }
  
  return issues;
}

// Función para procesar archivos
function processFiles(dir) {
  const allIssues = [];
  
  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    
    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!filePath.includes('node_modules') && !filePath.includes('.git')) {
          walkDir(filePath);
        }
      } else if (file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const issues = checkDialogContent(content, filePath);
        allIssues.push(...issues);
      }
    }
  }
  
  walkDir(dir);
  return allIssues;
}

// Ejecutar
const srcDir = path.join(__dirname, 'src', 'app');
const issues = processFiles(srcDir);

console.log('\n📊 REPORTE DE DIÁLOGOS\n');
console.log('═'.repeat(60));

if (issues.length === 0) {
  console.log('✅ Todos los DialogContent tienen aria-describedby o DialogDescription');
} else {
  console.log(`⚠️  Encontrados ${issues.length} DialogContent sin aria-describedby:\n`);
  issues.forEach(issue => {
    console.log(`📁 ${issue.file}`);
    console.log(`   Línea ${issue.line}: ${issue.issue}\n`);
  });
}

console.log('═'.repeat(60));
