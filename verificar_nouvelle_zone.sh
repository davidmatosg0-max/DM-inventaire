#!/bin/bash

# Script de verificación de la implementación del botón "Nouvelle zone"

echo "🔍 Verificando implementación del botón 'Nouvelle zone' en Etiquetas.tsx..."
echo ""

# Verificar que existan los estados necesarios
echo "✅ Verificando estados:"
grep -q "dialogNuevaZona" /src/app/components/pages/Etiquetas.tsx && echo "  ✓ Estado dialogNuevaZona encontrado" || echo "  ✗ Estado dialogNuevaZona NO encontrado"
grep -q "nuevaZona" /src/app/components/pages/Etiquetas.tsx && echo "  ✓ Estado nuevaZona encontrado" || echo "  ✗ Estado nuevaZona NO encontrado"
grep -q "ubicacionesPredefinidas" /src/app/components/pages/Etiquetas.tsx && echo "  ✓ Estado ubicacionesPredefinidas encontrado" || echo "  ✗ Estado ubicacionesPredefinidas NO encontrado"

echo ""
echo "✅ Verificando funciones:"
grep -q "const handleCrearZona" /src/app/components/pages/Etiquetas.tsx && echo "  ✓ Función handleCrearZona encontrada" || echo "  ✗ Función handleCrearZona NO encontrada"
grep -q "const obtenerZonas" /src/app/components/pages/Etiquetas.tsx && echo "  ✓ Función obtenerZonas encontrada" || echo "  ✗ Función obtenerZonas NO encontrada"
grep -q "const guardarZonas" /src/app/components/pages/Etiquetas.tsx && echo "  ✓ Función guardarZonas encontrada" || echo "  ✗ Función guardarZonas NO encontrada"

echo ""
echo "✅ Verificando UI:"
grep -q "Nouvelle zone" /src/app/components/pages/Etiquetas.tsx && echo "  ✓ Botón 'Nouvelle zone' encontrado" || echo "  ✗ Botón 'Nouvelle zone' NO encontrado"
grep -q "Créer une nouvelle zone" /src/app/components/pages/Etiquetas.tsx && echo "  ✓ Título del diálogo encontrado" || echo "  ✗ Título del diálogo NO encontrado"
grep -q "Code de la zone" /src/app/components/pages/Etiquetas.tsx && echo "  ✓ Campo 'Code de la zone' encontrado" || echo "  ✗ Campo 'Code de la zone' NO encontrado"
grep -q "Type d'emplacement" /src/app/components/pages/Etiquetas.tsx && echo "  ✓ Campo 'Type d'emplacement' encontrado" || echo "  ✗ Campo 'Type d'emplacement' NO encontrado"
grep -q "Capacité maximum" /src/app/components/pages/Etiquetas.tsx && echo "  ✓ Campo 'Capacité maximum' encontrado" || echo "  ✗ Campo 'Capacité maximum' NO encontrado"

echo ""
echo "✅ Verificando tipos de emplazamiento:"
grep -q "Étagère" /src/app/components/pages/Etiquetas.tsx && echo "  ✓ Étagère" || echo "  ✗ Étagère NO encontrado"
grep -q "Chambre froide" /src/app/components/pages/Etiquetas.tsx && echo "  ✓ Chambre froide" || echo "  ✗ Chambre froide NO encontrado"
grep -q "Congélateur" /src/app/components/pages/Etiquetas.tsx && echo "  ✓ Congélateur" || echo "  ✗ Congélateur NO encontrado"
grep -q "Entrepôt sec" /src/app/components/pages/Etiquetas.tsx && echo "  ✓ Entrepôt sec" || echo "  ✗ Entrepôt sec NO encontrado"

echo ""
echo "📊 RESUMEN:"
echo "  - Si todos los elementos muestran ✓, la implementación está completa"
echo "  - Si ves ✗, hay elementos faltantes que deben revisarse"
echo ""
echo "💡 IMPORTANTE:"
echo "  - Si el código está bien pero no ves cambios en el navegador:"
echo "    1. Presiona Ctrl+F5 (Windows/Linux) o Cmd+Shift+R (Mac) para limpiar caché"
echo "    2. Cierra y vuelve a abrir el navegador"
echo "    3. Verifica que no haya errores en la consola del navegador (F12)"
echo ""
