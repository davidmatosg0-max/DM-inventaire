#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script para corregir automáticamente los warnings de accesibilidad en DialogContent
Elimina aria-describedby de DialogContent y el atributo id de DialogDescription
"""

import re
import os
from pathlib import Path

# Lista de archivos a procesar
ARCHIVOS = [
    '/src/app/components/pages/Inventario.tsx',
    '/src/app/components/pages/Configuracion.tsx',
    '/src/app/components/pages/Comandas.tsx',
    '/src/app/components/pages/Departamentos.tsx',
    '/src/app/components/pages/EmailOrganismos.tsx',
    '/src/app/components/pages/Etiquetas.tsx',
    '/src/app/components/pages/GestionRolesPermisos.tsx',
    '/src/app/components/pages/OfertasOrganismo.tsx',
    '/src/app/components/pages/Organismos.tsx',
    '/src/app/components/pages/Usuarios.tsx',
    '/src/app/components/pages/UsuariosInternos.tsx',
    '/src/app/components/EnviarCredencialesID.tsx',
    '/src/app/components/FormularioEntrada.tsx',
    '/src/app/components/GestionAdressesQuartiers.tsx',
    '/src/app/components/NotificacionComanda.tsx',
    '/src/app/components/VerificacionesRecientes.tsx',
    '/src/app/components/benevoles/FormularioNouveauBenevole.tsx',
    '/src/app/components/comandas/ProponerNuevaFecha.tsx',
    '/src/app/components/comptoir/DemandesAide.tsx',
    '/src/app/components/comptoir/FormularioBeneficiarioCompacto.tsx',
    '/src/app/components/comptoir/RendezVous.tsx',
    '/src/app/components/comptoir/TypesAide.tsx',
    '/src/app/components/conversion/ConversionDialog.tsx',
    '/src/app/components/conversion/HistorialConversiones.tsx',
    '/src/app/components/conversion/PlantillasConversion.tsx',
    '/src/app/components/cuisine/EtiquetaReceta.tsx',
    '/src/app/components/cuisine/InventarioCocina.tsx',
    '/src/app/components/cuisine/OfertasDisponibles.tsx',
    '/src/app/components/departamentos/FormularioContactoCompacto.tsx',
    '/src/app/components/departamentos/GestionContactosDepartamento.tsx',
    '/src/app/components/inventario/CarritoMejorado.tsx',
    '/src/app/components/inventario/ConversionUnidadesDialog.tsx',
    '/src/app/components/inventario/DialogAceptarOferta.tsx',
    '/src/app/components/inventario/DialogCrearOferta.tsx',
    '/src/app/components/inventario/DialogDistribuirProductos.tsx',
    '/src/app/components/inventario/DialogEnviarCocina.tsx',
    '/src/app/components/inventario/EditarEntradaDialog.tsx',
    '/src/app/components/inventario/ExportacionAvanzada.tsx',
    '/src/app/components/inventario/FormularioContactoEntrepotCompacto.tsx',
    '/src/app/components/inventario/FormularioEntradaProductoCompacto.tsx',
    '/src/app/components/inventario/GestionUnidades.tsx',
    '/src/app/components/inventario/GestionVariantes.tsx',
    '/src/app/components/inventario/HistorialProductoDialog.tsx',
    '/src/app/components/inventario/PanierProductos.tsx',
    '/src/app/components/inventario/TransformarProductoDialog.tsx',
    '/src/app/components/inventario/ValidacionEntradasDialog.tsx',
    '/src/app/components/liaison/GestionDemandes.tsx',
    '/src/app/components/organismos/FormularioOrganismoCompacto.tsx',
    '/src/app/components/organismos/MesDemandes.tsx',
    '/src/app/components/organismos/PerfilOrganismoDialog.tsx',
    '/src/app/components/shared/IDDigitalGenerico.tsx',
    '/src/app/components/transporte/FormularioChoferCompacto.tsx',
    '/src/app/components/transporte/FormularioVehiculoCompacto.tsx',
    '/src/app/components/transporte/GestionChoferes.tsx',
    '/src/app/components/transporte/GestionVehiculos.tsx',
    '/src/app/components/transporte/PlanificacionRutas.tsx',
    '/src/app/components/transporte/VerificacionVehiculo.tsx',
    '/src/app/components/ui/command.tsx',
    '/src/app/components/ui/language-selector.tsx',
    '/src/app/components/ui/task-selector.tsx',
    '/src/app/components/usuarios/FormularioUsuarioInternoCompacto.tsx',
    '/src/app/components/usuarios/GestionDepartamentos.tsx',
    '/src/app/components/usuarios/GestionRoles.tsx',
]

def corregir_archivo(ruta_archivo):
    """Corrige un archivo eliminando aria-describedby y los ids de DialogDescription"""
    try:
        with open(ruta_archivo, 'r', encoding='utf-8') as f:
            contenido = f.read()
        
        contenido_original = contenido
        
        # Paso 1: Eliminar aria-describedby de DialogContent
        # Patrón: aria-describedby="cualquier-cosa"
        contenido = re.sub(
            r'\s+aria-describedby="[^"]*"',
            '',
            contenido
        )
        
        # Paso 2: Eliminar id de DialogDescription  
        # Patrón: id="cualquier-cosa-description" en DialogDescription
        contenido = re.sub(
            r'(<DialogDescription[^>]*)\s+id="[^"]*"',
            r'\1',
            contenido
        )
        
        # Solo escribir si hubo cambios
        if contenido != contenido_original:
            with open(ruta_archivo, 'w', encoding='utf-8') as f:
                f.write(contenido)
            print(f"✅ Corregido: {ruta_archivo}")
            return True
        else:
            print(f"ℹ️  Sin cambios: {ruta_archivo}")
            return False
            
    except FileNotFoundError:
        print(f"❌ Archivo no encontrado: {ruta_archivo}")
        return False
    except Exception as e:
        print(f"❌ Error en {ruta_archivo}: {str(e)}")
        return False

def main():
    print("🔧 Iniciando corrección masiva de accesibilidad en DialogContent\n")
    
    archivos_corregidos = 0
    archivos_error = 0
    archivos_sin_cambios = 0
    
    for archivo in ARCHIVOS:
        resultado = corregir_archivo(archivo)
        if resultado:
            archivos_corregidos += 1
        elif resultado is False:
            archivos_error += 1
        else:
            archivos_sin_cambios += 1
    
    print(f"\n📊 Resumen:")
    print(f"   ✅ Archivos corregidos: {archivos_corregidos}")
    print(f"   ℹ️  Archivos sin cambios: {archivos_sin_cambios}")
    print(f"   ❌ Archivos con error: {archivos_error}")
    print(f"   📝 Total procesados: {len(ARCHIVOS)}\n")
    print("✨ Proceso completado!")

if __name__ == "__main__":
    main()
