const fs = require('fs');

// Read the file
const filePath = '/src/app/components/pages/Inventario.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Remove the problematic lines 690-701 
// Find the pattern and replace it
content = content.replace(
  /}\n\s+<span className=\\"text-\[#666666\]\\">→<\/span>\n\s+<Badge\n[\s\S]*?🧊 Congelado'}\n\s+<\/Badge>/,
  '}'
);

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('Fixed!');
