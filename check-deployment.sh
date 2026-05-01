#!/bin/bash

# 🚀 Script de Verificación Pre-Deployment
# Este script verifica que todo esté listo para el deployment

echo "======================================"
echo "🔍 VERIFICACIÓN PRE-DEPLOYMENT"
echo "======================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de errores
ERRORS=0
WARNINGS=0

# 1. Verificar que package.json existe
echo "1. Verificando package.json..."
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json existe${NC}"
else
    echo -e "${RED}❌ package.json NO encontrado${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 2. Verificar que node_modules existe
echo ""
echo "2. Verificando node_modules..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules existe${NC}"
else
    echo -e "${RED}❌ node_modules NO encontrado. Ejecuta: npm install${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 3. Verificar que vite.config.ts existe
echo ""
echo "3. Verificando vite.config.ts..."
if [ -f "vite.config.ts" ]; then
    echo -e "${GREEN}✅ vite.config.ts existe${NC}"
    
    # Verificar base path
    if grep -q "base:" vite.config.ts; then
        BASE_PATH=$(grep "base:" vite.config.ts | sed "s/.*base: '\(.*\)'.*/\1/")
        echo -e "${GREEN}   Base path configurada: ${BASE_PATH}${NC}"
    else
        echo -e "${YELLOW}⚠️  Base path no configurada${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}❌ vite.config.ts NO encontrado${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 4. Verificar .nojekyll
echo ""
echo "4. Verificando .nojekyll..."
if [ -f "public/.nojekyll" ]; then
    echo -e "${GREEN}✅ public/.nojekyll existe${NC}"
else
    echo -e "${YELLOW}⚠️  public/.nojekyll NO encontrado (recomendado para GitHub Pages)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 5. Verificar 404.html
echo ""
echo "5. Verificando 404.html..."
if [ -f "public/404.html" ]; then
    echo -e "${GREEN}✅ public/404.html existe${NC}"
else
    echo -e "${YELLOW}⚠️  public/404.html NO encontrado (necesario para rutas SPA)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 6. Verificar gh-pages (si usas GitHub Pages)
echo ""
echo "6. Verificando gh-pages..."
if grep -q "gh-pages" package.json; then
    echo -e "${GREEN}✅ gh-pages configurado en package.json${NC}"
else
    echo -e "${YELLOW}⚠️  gh-pages no encontrado (necesario si usas GitHub Pages)${NC}"
    echo -e "${YELLOW}   Instala con: npm install --save-dev gh-pages${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 7. Verificar scripts de build
echo ""
echo "7. Verificando scripts de build..."
if grep -q '"build"' package.json; then
    echo -e "${GREEN}✅ Script 'build' configurado${NC}"
else
    echo -e "${RED}❌ Script 'build' NO configurado${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 8. Verificar TypeScript
echo ""
echo "8. Verificando archivos TypeScript..."
TS_ERRORS=$(find src -name "*.tsx" -o -name "*.ts" 2>/dev/null | wc -l)
if [ "$TS_ERRORS" -gt 0 ]; then
    echo -e "${GREEN}✅ Archivos TypeScript encontrados${NC}"
else
    echo -e "${YELLOW}⚠️  No se encontraron archivos TypeScript${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 9. Verificar index.html
echo ""
echo "9. Verificando index.html..."
if [ -f "index.html" ]; then
    echo -e "${GREEN}✅ index.html existe${NC}"
    
    # Verificar script de SPA
    if grep -q "Single Page Apps" index.html; then
        echo -e "${GREEN}   Script de SPA configurado${NC}"
    else
        echo -e "${YELLOW}⚠️  Script de SPA no encontrado${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}❌ index.html NO encontrado${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 10. Verificar archivos de deployment
echo ""
echo "10. Verificando archivos de configuración de deployment..."

if [ -f "netlify.toml" ]; then
    echo -e "${GREEN}✅ netlify.toml existe (Netlify)${NC}"
fi

if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✅ vercel.json existe (Vercel)${NC}"
fi

if [ -f ".github/workflows/deploy.yml" ] || [ -f "workflows/deploy.yml" ]; then
    echo -e "${GREEN}✅ GitHub Actions workflow existe${NC}"
fi

# Resumen
echo ""
echo "======================================"
echo "📊 RESUMEN"
echo "======================================"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ TODO LISTO PARA DEPLOYMENT${NC}"
    echo ""
    echo "Puedes ejecutar:"
    echo "  npm run build      # Para construir el proyecto"
    echo "  npm run deploy     # Para hacer deploy (GitHub Pages)"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  HAY ${WARNINGS} ADVERTENCIAS${NC}"
    echo ""
    echo "El deployment debería funcionar, pero revisa las advertencias arriba."
    echo ""
    echo "Puedes continuar con:"
    echo "  npm run build"
    echo "  npm run deploy"
    exit 0
else
    echo -e "${RED}❌ HAY ${ERRORS} ERRORES Y ${WARNINGS} ADVERTENCIAS${NC}"
    echo ""
    echo "Por favor, resuelve los errores antes de hacer deployment."
    echo ""
    echo "Pasos sugeridos:"
    echo "  1. npm install         # Instalar dependencias"
    echo "  2. npm run build       # Verificar que el build funciona"
    echo "  3. Ejecuta este script nuevamente"
    exit 1
fi
