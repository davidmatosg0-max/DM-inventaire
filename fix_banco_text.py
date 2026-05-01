#!/usr/bin/env python3
import os
import re

# Lista de archivos a corregir
files_to_fix = [
    'src/app/components/pages/Benevoles.tsx',
    'src/app/components/pages/Dashboard.tsx',
    'src/app/components/pages/Etiquetas.tsx',
    'src/app/components/pages/ModeloComanda.tsx',
    'src/app/components/pages/PanelMarca.tsx',
    'src/app/components/pages/UsuariosInternos.tsx',
    'src/app/components/pages/VistaPublicaOrganismo_fix.tsx',
    'src/app/components/EnviarCredencialesID.tsx',
    'src/app/components/NotificacionComanda.tsx',
    'src/app/components/VerificacionesRecientes.tsx',
    'src/app/components/comandas/EtiquetaComanda.tsx',
    'src/app/components/comandas/ProponerNuevaFecha.tsx',
    'src/app/components/etiquetas/EtiquetaImprimible.tsx',
    'src/app/components/inventario/CarritoMejorado.tsx',
    'src/app/components/organismo/ConfirmacionComanda.tsx',
    'src/app/components/shared/IDDigitalGenerico.tsx',
    'src/app/data/iconosAlimentos.ts',
    'src/app/data/rolesPermisos.ts',
    'src/app/types/index.ts',
    'src/app/utils/barcode.ts',
    'src/app/utils/dataService.ts',
    'src/app/utils/exportarPDF.ts',
    'src/app/utils/ofertaStorage.ts',
    'src/app/utils/reportesLogic.ts'
]

# Mapeo de reemplazos
replacements = {
    'Banco de Alimentos': 'Banque Alimentaire',
    'banco de alimentos': 'banque alimentaire',
    'BANCO DE ALIMENTOS': 'BANQUE ALIMENTAIRE',
    'Banco de Alimentos Comunitario': 'Banque Alimentaire Communautaire',
    'del Banco de Alimentos': 'de la Banque Alimentaire',
    'al Banco de Alimentos': 'à la Banque Alimentaire',
    'el Banco de Alimentos': 'la Banque Alimentaire',
    'del banco de alimentos': 'de la banque alimentaire',
    'al banco de alimentos': 'à la banque alimentaire',
    'el banco de alimentos': 'la banque alimentaire',
    'del Sistema de Banco de Alimentos': 'du Système de Banque Alimentaire',
    'Sistema de Banco de Alimentos': 'Système de Banque Alimentaire',
    'Sistema Integral del Banco de Alimentos': 'Système Intégral de la Banque Alimentaire',
    'del Banco de Alimentos de Laval': 'de la Banque Alimentaire de Laval',
    'Banco de Alimentos - Sistema': 'Banque Alimentaire - Système',
    'del Banco de Alimentos se pondrá': 'de la Banque Alimentaire se mettra',
    'el Banco de Alimentos se reserva': 'la Banque Alimentaire se réserve',
    'con el Banco de Alimentos': 'avec la Banque Alimentaire',
}

def fix_file(filepath):
    """Fix Banco de Alimentos references in a file"""
    full_path = os.path.join('..', filepath)
    if not os.path.exists(full_path):
        print(f"⚠️  File not found: {filepath}")
        return False
    
    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply replacements
        for old_text, new_text in replacements.items():
            content = content.replace(old_text, new_text)
        
        # Only write if changes were made
        if content != original_content:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fixed: {filepath}")
            return True
        else:
            print(f"ℹ️  No changes: {filepath}")
            return False
    except Exception as e:
        print(f"❌ Error fixing {filepath}: {e}")
        return False

def main():
    print("🔧 Corrección de texto: Banco de Alimentos → Banque Alimentaire\n")
    print("=" * 70)
    
    fixed_count = 0
    for filepath in files_to_fix:
        if fix_file(filepath):
            fixed_count += 1
    
    print("=" * 70)
    print(f"\n✨ Proceso completado: {fixed_count} archivo(s) corregido(s)")

if __name__ == '__main__':
    main()
