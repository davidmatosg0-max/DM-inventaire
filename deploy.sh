#!/bin/bash

# Script de deploy con verificación completa
# Para GitHub Pages - GestionDeBancoAlimentariosDm

echo "🚀 Iniciando proceso de deploy a GitHub Pages..."
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Paso 1: Verificar que estamos en la rama main
echo "📍 Verificando rama actual..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${RED}❌ Error: Debes estar en la rama 'main' para hacer deploy${NC}"
    echo "   Rama actual: $CURRENT_BRANCH"
    exit 1
fi
echo -e "${GREEN}✅ En rama main${NC}"
echo ""

# Paso 2: Verificar que no hay cambios sin commit
echo "📝 Verificando cambios sin commit..."
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  Tienes cambios sin commit:${NC}"
    git status -s
    echo ""
    read -p "¿Quieres hacer commit ahora? (s/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        read -p "Mensaje de commit: " commit_msg
        git add .
        git commit -m "$commit_msg"
        git push origin main
        echo -e "${GREEN}✅ Cambios commiteados y pusheados${NC}"
    else
        echo -e "${RED}❌ Abortando deploy. Commit tus cambios primero.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ No hay cambios sin commit${NC}"
fi
echo ""

# Paso 3: Verificar que gh-pages está instalado
echo "📦 Verificando instalación de gh-pages..."
if ! npm list gh-pages > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  gh-pages no está instalado${NC}"
    echo "   Instalando gh-pages..."
    npm install --save-dev gh-pages
    echo -e "${GREEN}✅ gh-pages instalado${NC}"
else
    echo -e "${GREEN}✅ gh-pages ya está instalado${NC}"
fi
echo ""

# Paso 4: Build
echo "🔨 Haciendo build de la aplicación..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en el build${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build completado${NC}"
echo ""

# Paso 5: Verificar que .nojekyll se creó
echo "🔍 Verificando archivo .nojekyll en dist/..."
if [ -f "dist/.nojekyll" ]; then
    echo -e "${GREEN}✅ Archivo .nojekyll encontrado en dist/${NC}"
else
    echo -e "${YELLOW}⚠️  .nojekyll no encontrado, creándolo...${NC}"
    touch dist/.nojekyll
    echo -e "${GREEN}✅ Archivo .nojekyll creado${NC}"
fi
echo ""

# Paso 6: Verificar archivos en dist
echo "📂 Archivos en dist/:"
ls -la dist/ | head -15
echo ""

# Paso 7: Deploy a gh-pages
echo "🚀 Desplegando a rama gh-pages..."
npm run deploy

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en el deploy${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Deploy completado${NC}"
echo ""

# Paso 8: Instrucciones finales
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 ¡Deploy exitoso!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 PASOS FINALES:"
echo ""
echo "1. Ve a GitHub Settings → Pages:"
echo -e "   ${YELLOW}https://github.com/davidmatosg0-max/GestionDeBancoAlimentariosDm/settings/pages${NC}"
echo ""
echo "2. Asegúrate que la configuración sea:"
echo -e "   Source: ${GREEN}Deploy from a branch${NC}"
echo -e "   Branch: ${GREEN}gh-pages${NC}"
echo -e "   Folder: ${GREEN}/ (root)${NC}"
echo ""
echo "3. Click en 'Save' si no está configurado así"
echo ""
echo "4. Espera 2-3 minutos"
echo ""
echo "5. Abre tu aplicación:"
echo -e "   ${GREEN}https://davidmatosg0-max.github.io/GestionDeBancoAlimentariosDm/${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Tip: Puedes ver el estado del deploy en:"
echo -e "   ${YELLOW}https://github.com/davidmatosg0-max/GestionDeBancoAlimentariosDm/deployments${NC}"
echo ""
