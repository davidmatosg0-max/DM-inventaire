#!/usr/bin/env python3
# Script to fix the escaped quotes in Inventario.tsx

with open('/src/app/components/pages/Inventario.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix line 690 (index 689)
if len(lines) > 689:
    # Remove the problematic lines (690-701)
    # Line 690 has: <span className=\\\"text-[#666666]\\\">→</span>
    # We need to remove lines 690-701 (indices 689-700)
    lines = lines[:689] + lines[701:]

with open('/src/app/components/pages/Inventario.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Fixed!")
