#!/usr/bin/env python3
import os

input_file = '../src/app/components/pages/Inventario.tsx'
output_file = '../src/app/components/pages/Inventario_fixed.tsx'

# Read all lines
with open(input_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Keep lines 1-689 and 702-end (removing lines 690-701 which are problematic)
fixed_lines = lines[:689] + lines[701:]

# Write to output
with open(output_file, 'w', encoding='utf-8') as f:
    f.writelines(fixed_lines)

# Replace original with fixed
os.rename(output_file, input_file)

print(f"Fixed! Removed lines 690-701. New total: {len(fixed_lines)} lines")
