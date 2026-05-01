#!/usr/bin/env python3
# Script para eliminar las funciones huérfanas relacionadas con soporte

file_path = '/src/app/components/pages/Configuracion.tsx'

# Leer el archivo
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Encontrar y eliminar las líneas de la 1314 a la 1358 (índices 1313-1357 en Python)
# Las funciones ocupan desde "// Funciones para configuración de soporte" hasta el cierre de handleProbarConfigSupport
start_line = 1313  # índice 0-based, línea 1314 en el editor
end_line = 1357    # índice 0-based, línea 1358 en el editor

# Eliminar las líneas
new_lines = lines[:start_line] + lines[end_line:]

# Escribir el archivo
with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"✅ Eliminadas {end_line - start_line} líneas (1314-1358)")
print("✅ Funciones huérfanas eliminadas exitosamente")
