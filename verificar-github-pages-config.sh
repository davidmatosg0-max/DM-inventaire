#!/bin/bash

# Script de verificación pre-commit para GitHub Pages
# Verifica que todos los archivos necesarios estén en su lugar

echo "🔍 Verificando configuración de GitHub Pages..."
echo ""

# Variables de control
ERRORES=0
WARNINGS=0

# 1. Verificar .nojekyll
echo "1. Verificando archivo .nojekyll..."
if [ -f ".nojekyll" ]; then
    echo "   ✅ .nojekyll existe"
else
    echo "   ❌ ERROR: .nojekyll NO existe"
    ERRORES=$((ERRORES + 1))
fi
echo ""

# 2. Verificar workflow de GitHub Actions
echo "2. Verificando workflow de GitHub Actions..."
if [ -f ".github/workflows/deploy.yml" ]; then
    echo "   ✅ .github/workflows/deploy.yml existe"
    
    # Verificar contenido importante
    if grep -q "actions/deploy-pages@v4" ".github/workflows/deploy.yml"; then
        echo "   ✅ Usa actions/deploy-pages@v4"
    else
        echo "   ⚠️  WARNING: No usa actions/deploy-pages@v4"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if grep -q "touch dist/.nojekyll" ".github/workflows/deploy.yml"; then
        echo "   ✅ Copia .nojekyll a dist"
    else
        echo "   ⚠️  WARNING: No copia .nojekyll a dist"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "   ❌ ERROR: .github/workflows/deploy.yml NO existe"
    ERRORES=$((ERRORES + 1))
fi
echo ""

# 3. Verificar workflow antiguo (debería no existir o ser eliminado)
echo "3. Verificando workflow antiguo..."
if [ -f "workflows/deploy.yml" ]; then
    echo "   ⚠️  WARNING: workflows/deploy.yml existe (debería eliminarse)"
    echo "      Ejecuta: git rm workflows/deploy.yml"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✅ No hay workflow antiguo"
fi
echo ""

# 4. Verificar package.json
echo "4. Verificando package.json..."
if [ -f "package.json" ]; then
    echo "   ✅ package.json existe"
    
    if grep -q '"build"' "package.json"; then
        echo "   ✅ Script 'build' definido"
    else
        echo "   ❌ ERROR: Script 'build' NO definido"
        ERRORES=$((ERRORES + 1))
    fi
else
    echo "   ❌ ERROR: package.json NO existe"
    ERRORES=$((ERRORES + 1))
fi
echo ""

# 5. Verificar vite.config.ts
echo "5. Verificando vite.config.ts..."
if [ -f "vite.config.ts" ]; then
    echo "   ✅ vite.config.ts existe"
    
    if grep -q "base:" "vite.config.ts"; then
        echo "   ℹ️  Configuración 'base' encontrada"
    else
        echo "   ℹ️  Sin configuración 'base' (ok si no se necesita)"
    fi
else
    echo "   ⚠️  WARNING: vite.config.ts NO existe"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 6. Verificar que NO existan archivos que activen Jekyll
echo "6. Verificando archivos que activan Jekyll..."
JEKYLL_FILES=0

if [ -f "_config.yml" ]; then
    echo "   ⚠️  WARNING: _config.yml existe (activa Jekyll)"
    WARNINGS=$((WARNINGS + 1))
    JEKYLL_FILES=$((JEKYLL_FILES + 1))
fi

if [ -d "_layouts" ]; then
    echo "   ⚠️  WARNING: carpeta _layouts existe (activa Jekyll)"
    WARNINGS=$((WARNINGS + 1))
    JEKYLL_FILES=$((JEKYLL_FILES + 1))
fi

if [ -d "_includes" ]; then
    echo "   ⚠️  WARNING: carpeta _includes existe (activa Jekyll)"
    WARNINGS=$((WARNINGS + 1))
    JEKYLL_FILES=$((JEKYLL_FILES + 1))
fi

if [ $JEKYLL_FILES -eq 0 ]; then
    echo "   ✅ No hay archivos que activen Jekyll"
fi
echo ""

# 7. Probar build local
echo "7. Probando build local..."
if command -v npm &> /dev/null; then
    echo "   ℹ️  npm está disponible"
    echo "   ℹ️  Para probar: npm run build"
else
    echo "   ⚠️  npm no está disponible (no se puede probar build)"
fi
echo ""

# Resumen
echo "═══════════════════════════════════════════════"
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "═══════════════════════════════════════════════"
echo ""

if [ $ERRORES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ PERFECTO - Todo está configurado correctamente"
    echo ""
    echo "Próximos pasos:"
    echo "1. git add .nojekyll .github/workflows/deploy.yml"
    echo "2. git commit -m 'fix: Desactivar Jekyll y actualizar workflow'"
    echo "3. git push origin main"
    echo "4. Ir a Settings → Pages → Source → Seleccionar 'GitHub Actions'"
    echo ""
    exit 0
elif [ $ERRORES -eq 0 ]; then
    echo "⚠️  HAY ADVERTENCIAS ($WARNINGS)"
    echo ""
    echo "Puedes continuar, pero revisa las advertencias arriba."
    echo ""
    exit 0
else
    echo "❌ HAY ERRORES CRÍTICOS ($ERRORES)"
    echo ""
    echo "Corrige los errores antes de hacer commit."
    echo ""
    exit 1
fi
