#!/usr/bin/env python3
import re

# Leer el archivo
with open('/src/app/components/pages/Benevoles.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Reemplazos necesarios
replacements = [
    # En las vistas de tabla
    (r'\{benevole\.heuresTotal\}h', r'{formaterHeures(benevole.heuresTotal)}'),
    (r'\{benevole\.heuresMois\}h', r'{formaterHeures(benevole.heuresMois)}'),
    
    # En el HTML de impresión (template strings)
    (r'\$\{selectedBenevole\.heuresTotal\}h', r'${Math.round(selectedBenevole.heuresTotal)}h'),
    (r'\$\{selectedBenevole\.heuresMois\}h', r'${Math.round(selectedBenevole.heuresMois)}h'),
]

# Aplicar reemplazos
for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content)

# Escribir el archivo actualizado
with open('/src/app/components/pages/Benevoles.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Archivo actualizado exitosamente")
print("Reemplazos realizados:")
for pattern, replacement in replacements:
    print(f"  - {pattern} → {replacement}")
