#!/usr/bin/env python3
"""
Script para eliminar contenido duplicado del archivo Configuracion.tsx
Elimina todo el contenido desde la línea 2111 hasta el final
"""

import os

# Ruta del archivo
archivo_path = 'src/app/components/pages/Configuracion.tsx'

try:
    # Leer el archivo
    with open(archivo_path, 'r', encoding='utf-8') as f:
        lineas = f.readlines()
    
    print(f"Total de líneas en el archivo: {len(lineas)}")
    
    # Mantener solo las primeras 2110 líneas
    lineas_correctas = lineas[:2110]
    
    # Guardar el archivo corregido
    with open(archivo_path, 'w', encoding='utf-8') as f:
        f.writelines(lineas_correctas)
    
    print(f"Archivo corregido. Nuevas líneas: {len(lineas_correctas)}")
    print("✓ Contenido duplicado eliminado exitosamente")
    
except Exception as e:
    print(f"✗ Error: {e}")
    exit(1)
