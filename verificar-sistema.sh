#!/bin/bash

# 🔍 SCRIPT DE VERIFICACIÓN RÁPIDA - SISTEMA BANQUE ALIMENTAIRE
# Ejecuta validaciones básicas del sistema

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🔍 VERIFICACIÓN DEL SISTEMA - BANQUE ALIMENTAIRE       ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de errores
ERRORS=0
WARNINGS=0

# Función para verificar archivos
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $2"
    else
        echo -e "${RED}❌${NC} $2 - Archivo no encontrado: $1"
        ((ERRORS++))
    fi
}

# Función para verificar directorios
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $2"
    else
        echo -e "${RED}❌${NC} $2 - Directorio no encontrado: $1"
        ((ERRORS++))
    fi
}

echo "📁 VERIFICANDO ESTRUCTURA DEL PROYECTO..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Archivos principales
check_file "package.json" "package.json"
check_file "vite.config.ts" "vite.config.ts"
check_file "index.html" "index.html"
check_file "src/main.tsx" "src/main.tsx"
check_file "src/app/App.tsx" "src/app/App.tsx"

echo ""
echo "🧩 VERIFICANDO COMPONENTES PRINCIPALES..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Componentes principales
check_file "src/app/components/Layout.tsx" "Layout.tsx"
check_file "src/app/components/ErrorBoundary.tsx" "ErrorBoundary.tsx"
check_file "src/app/components/pages/Dashboard.tsx" "Dashboard.tsx"
check_file "src/app/components/pages/Departamentos.tsx" "Departamentos.tsx ✨"
check_file "src/app/components/pages/Inventario.tsx" "Inventario.tsx"
check_file "src/app/components/pages/Comandas.tsx" "Comandas.tsx"
check_file "src/app/components/pages/Organismos.tsx" "Organismos.tsx"
check_file "src/app/components/pages/Transporte.tsx" "Transporte.tsx"

echo ""
echo "🎨 VERIFICANDO ESTILOS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_dir "src/styles" "Directorio de estilos"
check_file "src/styles/index.css" "index.css"
check_file "src/styles/theme.css" "theme.css"
check_file "src/styles/branding.css" "branding.css"
check_file "src/styles/fonts.css" "fonts.css"

echo ""
echo "🌐 VERIFICANDO INTERNACIONALIZACIÓN..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_file "src/i18n/config.ts" "Configuración i18n"
check_file "src/i18n/locales/fr.json" "Francés (fr)"
check_file "src/i18n/locales/es.json" "Español (es)"
check_file "src/i18n/locales/en.json" "Inglés (en)"
check_file "src/i18n/locales/ar.json" "Árabe (ar)"

echo ""
echo "📦 VERIFICANDO NODE_MODULES..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅${NC} node_modules instalado"
    
    # Verificar paquetes críticos
    if [ -d "node_modules/react" ]; then
        echo -e "${GREEN}  ✅${NC} react"
    else
        echo -e "${RED}  ❌${NC} react no instalado"
        ((ERRORS++))
    fi
    
    if [ -d "node_modules/vite" ]; then
        echo -e "${GREEN}  ✅${NC} vite"
    else
        echo -e "${RED}  ❌${NC} vite no instalado"
        ((ERRORS++))
    fi
    
    if [ -d "node_modules/i18next" ]; then
        echo -e "${GREEN}  ✅${NC} i18next"
    else
        echo -e "${RED}  ❌${NC} i18next no instalado"
        ((ERRORS++))
    fi
else
    echo -e "${RED}❌${NC} node_modules no encontrado - Ejecuta: npm install"
    ((ERRORS++))
fi

echo ""
echo "🧪 VERIFICANDO ARCHIVOS DE LOG ANTIGUOS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar que los archivos de log obsoletos fueron eliminados
if [ -f "src/imports/departamentos.tsx" ]; then
    echo -e "${YELLOW}⚠️${NC}  src/imports/departamentos.tsx (debería estar eliminado)"
    ((WARNINGS++))
else
    echo -e "${GREEN}✅${NC} Archivos de log obsoletos eliminados correctamente"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                    📊 RESUMEN                            ║"
echo "╚══════════════════════════════════════════════════════════╝"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ SISTEMA EN PERFECTO ESTADO${NC}"
    echo ""
    echo "🚀 El sistema está listo para:"
    echo "   • npm run dev     - Modo desarrollo"
    echo "   • npm run build   - Build de producción"
    echo "   • npm run deploy  - Desplegar a GitHub Pages"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  SISTEMA FUNCIONAL CON ADVERTENCIAS${NC}"
    echo -e "   Advertencias: ${WARNINGS}"
    exit 0
else
    echo -e "${RED}❌ ERRORES ENCONTRADOS${NC}"
    echo -e "   Errores: ${ERRORS}"
    echo -e "   Advertencias: ${WARNINGS}"
    echo ""
    echo "Por favor, revisa los errores arriba y corrígelos."
    exit 1
fi
