# 🚀 GUÍA RÁPIDA DE INICIO - BANQUE ALIMENTAIRE

> **Sistema completamente funcional y listo para usar**

---

## ⚡ INICIO RÁPIDO (3 pasos)

### 1️⃣ Instalar Dependencias

```bash
npm install
```

### 2️⃣ Iniciar en Modo Desarrollo

```bash
npm run dev
```

### 3️⃣ Abrir en el Navegador

```
http://localhost:5173
```

---

## 🔐 CREDENCIALES DE ACCESO

### Login Principal
```
Usuario: David
Contraseña: Lettycia26
Acceso: Total al sistema
```

### Portal de Organismos
```
Clave de acceso: CAC-456ABC
Organismo: Centre d'Aide Communautaire Exemple
```

---

## 📋 COMANDOS DISPONIBLES

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# El sistema se abrirá en http://localhost:5173
# Hot reload habilitado (cambios se reflejan automáticamente)
```

### Producción
```bash
# Build de producción
npm run build

# Preview del build (después de ejecutar build)
npm run preview

# Deploy a GitHub Pages
npm run deploy
```

### Verificación
```bash
# Verificar estado del sistema
bash verificar-sistema.sh

# Este script valida:
# - Estructura del proyecto
# - Componentes principales
# - Dependencias instaladas
# - Archivos de configuración
```

---

## 🗺️ ESTRUCTURA DE NAVEGACIÓN

Una vez logueado, tendrás acceso a:

### 📊 Panel Principal
- **Dashboard** - Vista general del sistema
- **Dashboard Métricas** - Métricas detalladas

### 🏢 Gestión de Departamentos ✨
- **Departamentos** - Gestión completa de departamentos
  - Crear, editar, eliminar departamentos
  - Gestión de contactos por departamento
  - Sincronización con otros módulos

### 📦 Inventario
- **Productos** - Gestión de inventario
  - Agregar/Editar productos
  - Control de stock
  - Alertas de stock bajo
  - Conversiones de unidades
- **Etiquetas** - Generación de etiquetas

### 📋 Comandas
- **Comandas** - Gestión de pedidos
  - Crear comandas
  - Cambiar estados
  - Imprimir etiquetas
  - Escanear QR

### 🏛️ Organismos
- **Organismos** - Gestión de organizaciones
  - CRUD completo
  - Ofertas y disponibilidad
  - Personas autorizadas
- **Ofertas** - Ver ofertas disponibles

### 🚚 Transporte
- **Vehículos** - Gestión de flota
- **Choferes** - Gestión de conductores
- **Rutas** - Planificación de rutas

### 👥 Usuarios
- **Usuarios del Sistema** - Gestión de acceso
- **Usuarios Internos** - Personal y bénévoles
- **IDs Digitales** - Credenciales digitales
- **Roles y Permisos** - Control de acceso

### 📈 Reportes
- **Generar Reportes** - PDF y Excel
- **Historial** - Reportes anteriores

### 🤝 Bénévoles
- **Gestión de Bénévoles** - Voluntarios
- **Hojas de Tiempo** - Control horario

### ⚙️ Configuración
- **Panel de Marca** - Personalización visual
- **Configuración** - Ajustes del sistema
- **Backup/Restauración** - Respaldo de datos

---

## 🌐 CAMBIAR IDIOMA

El sistema soporta 4 idiomas:

1. **Francés (fr)** - Idioma por defecto ✨
2. **Español (es)**
3. **Inglés (en)**
4. **Árabe (ar)** - Con soporte RTL

**Cómo cambiar:**
- Clic en el selector de idioma (🌐) en la esquina superior derecha
- Selecciona tu idioma preferido
- La interfaz cambiará automáticamente

---

## 💾 GESTIÓN DE DATOS

### Datos de Ejemplo

El sistema incluye datos de ejemplo para pruebas:

```javascript
// Para limpiar y reiniciar datos de ejemplo:
localStorage.removeItem('datos_ejemplo_inicializados');
location.reload();
```

### Datos Disponibles
- ✅ 3 Usuarios del sistema
- ✅ 4 Organismos
- ✅ 5 Comandas
- ✅ 10 Usuarios internos
- ✅ Vehículos y rutas
- ✅ Departamentos configurados

### Persistencia
- Los datos se guardan en **localStorage**
- Permanecen entre sesiones
- Sistema de backup/restauración disponible

---

## 🎨 PERSONALIZACIÓN

### Colores de Marca

El sistema usa:
- **Color Primario:** `#1a4d7a` (Azul marino)
- **Color Secundario:** `#2d9561` (Verde elegante)

**Cambiar colores:**
1. Ir a **Configuración** > **Panel de Marca**
2. Modificar colores primario y secundario
3. Los cambios se aplican inmediatamente

### Logo del Sistema

**Agregar logo personalizado:**
1. Ir a **Configuración** > **Panel de Marca**
2. Subir archivo de imagen (PNG, JPG, SVG)
3. El logo se mostrará en toda la aplicación

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### El sistema no inicia

```bash
# 1. Verificar que node_modules esté instalado
ls node_modules/

# 2. Si no existe, instalar dependencias
npm install

# 3. Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm install

# 4. Iniciar nuevamente
npm run dev
```

### Error al hacer build

```bash
# 1. Limpiar directorio dist
rm -rf dist

# 2. Build nuevamente
npm run build

# 3. Si persiste, verificar versión de Node
node --version  # Debe ser >= 18.x
```

### Datos no se guardan

```bash
# Verificar permisos de localStorage en el navegador
# Chrome: F12 > Application > Local Storage
# Firefox: F12 > Storage > Local Storage
```

### Página en blanco

```bash
# 1. Abrir consola del navegador (F12)
# 2. Revisar errores en rojo
# 3. Verificar que JavaScript esté habilitado
# 4. Limpiar caché del navegador (Ctrl+Shift+R)
```

---

## 📱 ACCESO MÓVIL

El sistema es **completamente responsive**:

- ✅ Funciona en smartphones
- ✅ Funciona en tablets
- ✅ Menú adaptable
- ✅ Interfaz optimizada

**Acceso desde móvil:**
1. Conectar dispositivo a la misma red
2. Encontrar IP de tu computadora:
   ```bash
   # En tu computadora:
   ifconfig  # Mac/Linux
   ipconfig  # Windows
   ```
3. Abrir en móvil: `http://[TU_IP]:5173`

---

## 🚀 DEPLOYMENT A PRODUCCIÓN

### GitHub Pages

```bash
# 1. Configurar repositorio en GitHub
# 2. Ejecutar deploy
npm run deploy

# 3. Tu sitio estará en:
# https://[tu-usuario].github.io/[tu-repo]
```

### Netlify

1. Conectar repositorio de GitHub
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy!

### Vercel

1. Importar proyecto desde GitHub
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy!

---

## 📚 DOCUMENTACIÓN ADICIONAL

El proyecto incluye documentación completa:

- **ANALISIS_SISTEMA_COMPLETO.md** - Análisis técnico detallado
- **SISTEMA_ESTABILIZADO_REPORTE.md** - Reporte de estado
- **CHECKLIST_VERIFICACION.md** - Checklist de verificación
- **README.md** - Documentación principal
- Múltiples guías en la carpeta raíz

---

## 🆘 SOPORTE

### Verificación Automática

Ejecuta este comando para verificar el estado del sistema:

```bash
bash verificar-sistema.sh
```

Este script te dirá:
- ✅ Qué está funcionando
- ❌ Qué necesita atención
- 📋 Pasos para corregir problemas

### Logs de Desarrollo

Durante el desarrollo, los logs aparecen en:
- **Consola del navegador** (F12)
- **Terminal** donde ejecutaste `npm run dev`

---

## ✨ CARACTERÍSTICAS PRINCIPALES

### 🎯 Funcionalidades Core
- ✅ Gestión integral de inventario
- ✅ Sistema de comandas y pedidos
- ✅ Gestión de organismos
- ✅ Planificación de transporte
- ✅ Gestión de bénévoles
- ✅ Sistema de reportes
- ✅ Control de acceso y roles
- ✅ Portal público para organismos

### 🎨 Experiencia de Usuario
- ✅ Interfaz moderna (glassmorphism)
- ✅ Multilingüe (4 idiomas)
- ✅ Responsive (móvil/tablet/desktop)
- ✅ Notificaciones en tiempo real
- ✅ Sistema de búsqueda global
- ✅ Impresión de etiquetas y QR

### 🔧 Tecnologías
- ✅ React 18.3.1
- ✅ TypeScript
- ✅ Vite 6.3.5
- ✅ Tailwind CSS 4
- ✅ i18next (internacionalización)
- ✅ Radix UI (componentes)

---

## 🎉 ¡LISTO PARA USAR!

El sistema está **100% funcional y optimizado**. Simplemente ejecuta:

```bash
npm run dev
```

Y comienza a explorar todas las funcionalidades.

**¡Buena suerte con tu Banque Alimentaire! 🚀**

---

*Guía actualizada: 6 de marzo de 2026*  
*Sistema Banque Alimentaire v2.1 - Sistema Integral de Gestion*
