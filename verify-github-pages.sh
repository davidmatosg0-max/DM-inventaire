#!/bin/bash

# Script de verificación para GitHub Pages
# Verifica que la configuración esté correcta después del deploy

echo "🔍 Verificando configuración de GitHub Pages..."
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar que existe .nojekyll en raíz
echo "1️⃣  Verificando .nojekyll en raíz..."
if [ -f ".nojekyll" ]; then
    echo -e "${GREEN}✅ .nojekyll existe en la raíz${NC}"
else
    echo -e "${RED}❌ .nojekyll NO existe en la raíz${NC}"
    echo "   Ejecuta: touch .nojekyll"
fi
echo ""

# 2. Verificar que existe el workflow
echo "2️⃣  Verificando workflow de GitHub Actions..."
if [ -f "workflows/deploy.yml" ]; then
    echo -e "${GREEN}✅ Workflow existe en workflows/deploy.yml${NC}"
else
    echo -e "${RED}❌ Workflow NO encontrado${NC}"
fi
echo ""

# 3. Verificar vite.config.ts
echo "3️⃣  Verificando vite.config.ts..."
if grep -q "base: './'," vite.config.ts; then
    echo -e "${GREEN}✅ vite.config.ts tiene base: './'${NC}"
else
    echo -e "${YELLOW}⚠️  vite.config.ts no tiene base: './' configurado${NC}"
fi
echo ""

# 4. Verificar si existe la rama gh-pages
echo "4️⃣  Verificando rama gh-pages..."
if git ls-remote --heads origin | grep -q "gh-pages"; then
    echo -e "${GREEN}✅ La rama gh-pages existe${NC}"
    
    # Intentar verificar si .nojekyll existe en gh-pages
    echo "   Verificando contenido de gh-pages..."
    git fetch origin gh-pages:gh-pages-temp 2>/dev/null
    if [ $? -eq 0 ]; then
        git checkout gh-pages-temp 2>/dev/null
        if [ -f ".nojekyll" ]; then
            echo -e "${GREEN}   ✅ .nojekyll existe en gh-pages${NC}"
        else
            echo -e "${RED}   ❌ .nojekyll NO existe en gh-pages${NC}"
        fi
        
        # Contar archivos .md en gh-pages
        md_count=$(find . -maxdepth 1 -name "*.md" -type f | wc -l)
        if [ $md_count -eq 0 ]; then
            echo -e "${GREEN}   ✅ No hay archivos .md en gh-pages (correcto)${NC}"
        else
            echo -e "${RED}   ❌ Hay $md_count archivos .md en gh-pages (incorrecto)${NC}"
        fi
        
        git checkout - 2>/dev/null
        git branch -D gh-pages-temp 2>/dev/null
    fi
else
    echo -e "${YELLOW}⚠️  La rama gh-pages NO existe todavía${NC}"
    echo "   Esto es normal si no has hecho push después de configurar el workflow"
fi
echo ""

# 5. Instrucciones finales
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 INSTRUCCIONES FINALES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Paso crítico: Configurar GitHub Pages"
echo ""
echo "1. Ve a: https://github.com/davidmatosg0-max/Gestiondinventairedm/settings/pages"
echo "2. En 'Source', selecciona: ${YELLOW}GitHub Actions${NC}"
echo "3. Guarda los cambios"
echo ""
echo "Luego ejecuta:"
echo "  git add ."
echo "  git commit -m 'fix: Configuración definitiva para GitHub Pages'"
echo "  git push origin main"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Para más detalles, lee: SOLUCION_DEFINITIVA_JEKYLL.md"
echo ""
