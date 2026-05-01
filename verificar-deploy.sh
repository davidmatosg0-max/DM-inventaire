#!/bin/bash

# 🔍 Script de Verificación Pre-Push para GitHub Pages
# Este script verifica que todo esté configurado correctamente antes de hacer push

echo "🔍 Verificando configuración de GitHub Pages..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de errores
ERRORS=0
WARNINGS=0

# Función para imprimir errores
print_error() {
    echo -e "${RED}✗ ERROR:${NC} $1"
    ((ERRORS++))
}

# Función para imprimir advertencias
print_warning() {
    echo -e "${YELLOW}⚠ ADVERTENCIA:${NC} $1"
    ((WARNINGS++))
}

# Función para imprimir éxito
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Verificando archivos esenciales..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar .nojekyll
if [ -f ".nojekyll" ]; then
    print_success "Archivo .nojekyll existe"
else
    print_error "Archivo .nojekyll NO existe. Créalo con: touch .nojekyll"
fi

# Verificar .gitignore
if [ -f ".gitignore" ]; then
    print_success "Archivo .gitignore existe"
    
    # Verificar que node_modules está en .gitignore
    if grep -q "node_modules" .gitignore; then
        print_success "node_modules está en .gitignore"
    else
        print_warning "node_modules NO está en .gitignore"
    fi
    
    # Verificar que dist está en .gitignore
    if grep -q "dist" .gitignore; then
        print_success "dist está en .gitignore"
    else
        print_warning "dist NO está en .gitignore (puede ser normal)"
    fi
else
    print_warning "Archivo .gitignore NO existe"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. Verificando configuración de Vite..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar vite.config.ts
if [ -f "vite.config.ts" ]; then
    print_success "Archivo vite.config.ts existe"
    
    # Verificar base: './'
    if grep -q "base: './'," vite.config.ts || grep -q 'base: "./",' vite.config.ts; then
        print_success "base está configurado con rutas relativas"
    else
        print_error "base NO está configurado correctamente. Debe ser: base: './'"
    fi
else
    print_error "Archivo vite.config.ts NO existe"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. Verificando GitHub Actions Workflow..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar workflow
if [ -f "workflows/deploy.yml" ] || [ -f ".github/workflows/deploy.yml" ]; then
    print_success "GitHub Actions workflow existe"
    
    WORKFLOW_FILE=""
    if [ -f "workflows/deploy.yml" ]; then
        WORKFLOW_FILE="workflows/deploy.yml"
    else
        WORKFLOW_FILE=".github/workflows/deploy.yml"
    fi
    
    # Verificar que copia .nojekyll
    if grep -q "cp .nojekyll dist/.nojekyll" "$WORKFLOW_FILE"; then
        print_success "Workflow copia .nojekyll a dist"
    else
        print_warning "Workflow NO copia .nojekyll a dist"
    fi
else
    print_error "GitHub Actions workflow NO existe"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. Verificando package.json..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "package.json" ]; then
    print_success "Archivo package.json existe"
    
    # Verificar script de build
    if grep -q '"build"' package.json; then
        print_success "Script 'build' está configurado"
    else
        print_error "Script 'build' NO está configurado"
    fi
    
    # Verificar dependencias básicas
    if grep -q '"vite"' package.json; then
        print_success "Vite está instalado"
    else
        print_error "Vite NO está instalado"
    fi
    
    if grep -q '"react"' package.json; then
        print_success "React está instalado"
    else
        print_warning "React NO está en package.json"
    fi
else
    print_error "Archivo package.json NO existe"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. Verificando node_modules..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "node_modules" ]; then
    print_success "node_modules existe (dependencias instaladas)"
else
    print_warning "node_modules NO existe. Ejecuta: npm install"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. Intentando build de prueba..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Ejecutando: npm run build"
if npm run build > /dev/null 2>&1; then
    print_success "Build exitoso"
    
    # Verificar que dist existe
    if [ -d "dist" ]; then
        print_success "Directorio dist fue creado"
        
        # Verificar que index.html existe
        if [ -f "dist/index.html" ]; then
            print_success "index.html existe en dist"
        else
            print_error "index.html NO existe en dist"
        fi
    else
        print_error "Directorio dist NO fue creado"
    fi
else
    print_error "Build FALLÓ. Revisa los errores arriba"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. Verificando estado de Git..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar si estamos en un repositorio Git
if [ -d ".git" ]; then
    print_success "Repositorio Git inicializado"
    
    # Verificar rama actual
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
        print_success "En rama principal ($CURRENT_BRANCH)"
    else
        print_warning "No estás en rama main/master (estás en: $CURRENT_BRANCH)"
    fi
    
    # Verificar archivos sin commit
    if git status --porcelain | grep -q '^'; then
        print_warning "Hay cambios sin commit"
        echo "   Archivos modificados:"
        git status --short | head -5
        if [ $(git status --short | wc -l) -gt 5 ]; then
            echo "   ... y más"
        fi
    else
        print_success "No hay cambios sin commit"
    fi
else
    print_error "NO es un repositorio Git"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "RESUMEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ TODO ESTÁ CONFIGURADO CORRECTAMENTE${NC}"
    echo "Puedes hacer push de forma segura:"
    echo ""
    echo "  git add ."
    echo "  git commit -m \"feat: actualización del sistema\""
    echo "  git push origin main"
    echo ""
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ HAY $WARNINGS ADVERTENCIA(S)${NC}"
    echo "El despliegue debería funcionar, pero revisa las advertencias arriba"
    echo ""
else
    echo -e "${RED}✗ HAY $ERRORS ERROR(ES) Y $WARNINGS ADVERTENCIA(S)${NC}"
    echo "Debes corregir los errores antes de hacer push"
    echo ""
    exit 1
fi

exit 0
