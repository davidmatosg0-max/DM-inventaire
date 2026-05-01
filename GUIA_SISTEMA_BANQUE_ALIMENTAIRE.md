# 📚 GUÍA COMPLETA DEL SISTEMA BANQUE ALIMENTAIRE

## 📑 ÍNDICE

1. [Introducción General](#introducción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Identidad Visual y Branding](#identidad-visual-y-branding)
4. [Sistema Multilingüe](#sistema-multilingüe)
5. [Usuarios y Roles](#usuarios-y-roles)
6. [Departamentos y Módulos](#departamentos-y-módulos)
7. [Flujos de Trabajo Completos](#flujos-de-trabajo-completos)
8. [Base de Datos y Persistencia](#base-de-datos-y-persistencia)
9. [Configuración Técnica](#configuración-técnica)
10. [Credenciales de Acceso](#credenciales-de-acceso)

---

# 1. INTRODUCCIÓN GENERAL

## ¿Qué es Banque Alimentaire?

**Banque Alimentaire** (Banco de Alimentos) es un sistema integral de gestión diseñado para organizaciones sin fines de lucro que distribuyen alimentos a personas en situación de vulnerabilidad. El sistema centraliza la gestión de inventario, pedidos, distribución, transporte, y comunicación entre diferentes actores.

## Objetivos del Sistema

- ✅ **Gestionar inventario** de alimentos de manera eficiente
- ✅ **Coordinar pedidos** de organismos beneficiarios
- ✅ **Optimizar la distribución** y logística
- ✅ **Trazabilidad completa** de productos desde donación hasta entrega
- ✅ **Reportes en tiempo real** para toma de decisiones
- ✅ **Comunicación fluida** entre todos los departamentos
- ✅ **Acceso multiusuario** con roles y permisos personalizados

## Características Principales

### 🌍 Multilingüe
- Español
- Francés (idioma predeterminado)
- Inglés
- Árabe (con soporte RTL)

### 💰 Moneda
- Dólar Canadiense (CAD$)

### 🎨 Diseño
- Estilo glassmorphism moderno
- Responsive (desktop y móvil)
- Accesible y fácil de usar
- Interfaz intuitiva con iconografía clara

### 🔐 Seguridad
- Sistema de autenticación robusto
- Roles y permisos granulares
- Trazabilidad de acciones
- Auditoría completa

---

# 2. ARQUITECTURA DEL SISTEMA

## Tecnologías Utilizadas

### Frontend
- React 18+ (con TypeScript)
- Tailwind CSS v4.0
- React Router (para navegación)
- Lucide React (iconos)
- Recharts (gráficos)
- Sonner (notificaciones toast)
- React Hook Form (formularios)

### Almacenamiento
- localStorage (para persistencia local)
- Preparado para Supabase (backend opcional)

### Estructura de Carpetas
```
/src
  /app
    /components
      /pages       ← Módulos principales (Dashboard, Entrepôt, etc.)
      /ui          ← Componentes reutilizables (Button, Dialog, etc.)
      /figma       ← Componentes de Figma importados
    App.tsx        ← Componente principal
    routes.ts      ← Configuración de rutas
  /hooks
    useBranding.ts ← Hook personalizado para branding
  /i18n
    /locales       ← Traducciones (es, fr, en, ar)
    config.ts      ← Configuración de i18n
  /styles
    theme.css      ← Variables CSS y tema
    fonts.css      ← Importación de fuentes
```

---

# 3. IDENTIDAD VISUAL Y BRANDING

## Paleta de Colores

### Colores Principales
- **Azul Marino (Primario)**: #1a4d7a
- **Verde Elegante (Secundario)**: #2d9561
- **Gris Neutro (Texto)**: #333333, #666666, #999999
- **Backgrounds**: #ffffff, #f8f9fa, #e9ecef

### Degradados
- Principal (Azul): linear-gradient(135deg, #1a4d7a 0%, #2d6ba3 100%)
- Secundario (Verde): linear-gradient(135deg, #2d9561 0%, #2d9561dd 100%)

## Tipografías

### Fuentes Principales
- **Títulos**: Montserrat (Bold/SemiBold/Medium)
- **Cuerpo**: Roboto (Regular/Medium)

### Tamaños
- h1: 2.5rem (40px)
- h2: 2rem (32px)
- h3: 1.5rem (24px)
- body: 1rem (16px)

---

# 4. SISTEMA MULTILINGÜE

## Idiomas Soportados
- Español (es)
- Francés (fr) - Predeterminado
- Inglés (en)
- Árabe (ar) - Con soporte RTL

## Uso de Traducciones
```tsx
import { useTranslation } from 'react-i18next'

const { t, i18n } = useTranslation()

// Traducción simple
{t('common.save')}

// Cambiar idioma
i18n.changeLanguage('fr')
```

---

# 5. USUARIOS Y ROLES

## Roles Disponibles

### 👨‍💼 ADMINISTRATOR
- Acceso total al sistema
- Gestión de usuarios y roles
- Configuración del sistema
- Todos los módulos y reportes

### 📦 ENTREPÔT (Inventario)
- Gestionar productos y categorías
- Registrar entradas de mercancía
- Gestionar ubicaciones y zonas
- Generar etiquetas

### 📋 COMANDAS (Pedidos)
- Crear y gestionar comandas
- Ver organismos
- Consultar inventario disponible
- Generar órdenes de preparación

### 🏢 ORGANISMOS
- Gestionar datos de organismos
- Ver historial de comandas
- Gestionar contactos
- Ver estadísticas de distribución

### 🚚 TRANSPORTE
- Planificar rutas
- Asignar vehículos y conductores
- Ver comandas pendientes
- Actualizar estados de entrega

### 📊 REPORTES
- Ver todos los reportes
- Exportar datos
- Generar gráficos
- Análisis de tendencias

### 🏪 COMPTOIR (Mostrador)
- Atender clientes en mostrador
- Procesar entregas directas
- Consultar inventario
- Registrar salidas

## Usuario Desarrollador

### Credenciales
```
Username: David
Password: Lettycia26
Role: Administrator
```

**Características Especiales:**
- Acceso total sin restricciones
- Puede eliminar datos del sistema
- Puede modificar configuraciones críticas
- Bypass de validaciones de negocio

---

# 6. DEPARTAMENTOS Y MÓDULOS

## 6.1 DASHBOARD (Panel Principal)

### Características
- KPIs principales (productos, comandas, organismos)
- Gráficos de tendencias
- Alertas y notificaciones
- Accesos rápidos a módulos
- Actividad reciente

## 6.2 ENTREPÔT (Inventario)

### Características Principales
- Gestión de productos (CRUD completo)
- Categorías y subcategorías
- Control de lotes y vencimientos
- Ubicaciones y zonas de almacenamiento
- Entradas y salidas de mercancía
- Trazabilidad completa

### Gestión de Contactos (Sin Restricciones)
**Cambio Importante:** Se eliminaron las restricciones que limitaban los tipos de contacto por departamento.

**Tipos de Contacto:**
- ORGANISME: Organización beneficiaria
- DONATEUR: Donante
- FOURNISSEUR: Proveedor
- TRANSPORTISTA: Empresa de transporte
- AUTRE: Otro

Todos los tipos están disponibles en todos los módulos.

## 6.3 COMANDAS (Pedidos)

### Ciclo de Vida
1. BORRADOR → Creada, aún editable
2. PENDIENTE → Enviada para preparación
3. EN PREPARACIÓN → Siendo empacada
4. LISTA PARA ENVÍO → Preparada, esperando transporte
5. EN TRÁNSITO → Despachada
6. ENTREGADA → Recibida por organismo
7. CANCELADA → Anulada (requiere razón)

### Características
- Crear comandas manuales o desde plantillas
- Seleccionar organismo beneficiario
- Agregar productos con cantidades
- Validación de disponibilidad en tiempo real
- Cálculo automático de totales
- Programar fecha de entrega

## 6.4 ORGANISMOS (Organizaciones)

### Tipos de Organismos
- Comedor comunitario
- Refugio
- Centro comunitario
- Iglesia
- Escuela
- Hogar de ancianos
- Centro de rehabilitación
- ONG
- Otro

### Características
- Registro completo de organismos
- Datos de contacto y ubicación
- Categorización por tipo
- Historial de comandas
- Estadísticas de distribución
- Documentación y certificados

## 6.5 TRANSPORTE

### Características
- Gestión de vehículos
- Gestión de conductores
- Planificación de rutas
- Asignación de comandas
- Seguimiento en tiempo real
- Historial de entregas
- Mantenimiento de vehículos

## 6.6 ÉTIQUETTES (Etiquetas)

### Características
- Generar etiquetas individuales
- Generación masiva de etiquetas
- **Crear zonas dinámicamente (NUEVA FUNCIONALIDAD)**
- Templates personalizables
- Código de barras / QR
- Información del producto
- Ubicación física

### Crear Nueva Zona (Funcionalidad Implementada)

**Ubicación del Botón:**
```
Módulo Etiquetas 
→ Botón "+ Nouvelle Étiquette" 
→ Tab "Ubicación" 
→ Junto al label "Zone" 
→ Botón "+ Nouvelle zone" (verde)
```

**Campos del Diálogo:**
1. Code de la zone (F, G, H...)
2. Type d'emplacement (Étagère, Chambre froide, Congélateur, etc.)
3. Capacité maximum d'emplacements (1-999)

**Persistencia:**
Las zonas se guardan en localStorage bajo la clave 'zonasAlmacen'.

## 6.7 REPORTES

### Tipos de Reportes

#### 📦 Reportes de Inventario
- Valorización del inventario
- Movimientos de productos
- Stock crítico
- Productos sin movimiento
- Rotación de inventario

#### 📋 Reportes de Comandas
- Comandas por período
- Comandas por organismo
- Productos más solicitados
- Valor distribuido
- Tiempo de preparación

#### 🏢 Reportes de Organismos
- Organismos activos/inactivos
- Distribución por tipo
- Organismos por región
- Frecuencia de pedidos

#### 🚚 Reportes de Transporte
- Rutas completadas
- Eficiencia de entregas
- Kilometraje de vehículos
- Desempeño de conductores

---

# 7. FLUJOS DE TRABAJO COMPLETOS

## Flujo: Recepción de Donación

1. **Entrepôt** registra entrada de mercancía
2. Selecciona tipo: "Donación"
3. Selecciona donante (tipo DONATEUR)
4. Agrega productos y cantidades
5. Asigna ubicaciones (zona + número)
6. Registra lote y vencimiento
7. Genera etiquetas
8. Sistema actualiza inventario automáticamente

## Flujo: Crear y Entregar Comanda

1. **Comandas** crea nueva comanda
2. Selecciona organismo beneficiario
3. Agrega productos (valida disponibilidad)
4. Define cantidades y fecha de entrega
5. Confirma comanda (estado: PENDIENTE)
6. **Entrepôt** prepara comanda (estado: EN PREPARACIÓN)
7. **Transporte** asigna vehículo y conductor
8. Crea ruta de entrega
9. Conductor entrega (estado: EN TRÁNSITO)
10. Organismo recibe (estado: ENTREGADA)

## Flujo: Generar Etiquetas con Nueva Zona

1. **Etiquetas** → "+ Nouvelle Étiquette"
2. Tab "Ubicación"
3. Click "+ Nouvelle zone"
4. Ingresa código (ej: F)
5. Selecciona tipo (ej: Chambre froide)
6. Define capacidad (ej: 12)
7. Click "Créer la zone"
8. Nueva zona aparece en selector
9. Selecciona zona y número
10. Completa datos del producto
11. Genera e imprime etiqueta

---

# 8. BASE DE DATOS Y PERSISTENCIA

## LocalStorage

### Claves Utilizadas
- `zonasAlmacen`: Zonas de almacenamiento creadas
- `productos`: Lista de productos
- `comandas`: Comandas registradas
- `organismos`: Organismos beneficiarios
- `contactos`: Contactos (donantes, proveedores, etc.)
- `vehiculos`: Vehículos de transporte
- `conductores`: Conductores
- `rutas`: Rutas de entrega
- `usuarios`: Usuarios del sistema
- `configuracion`: Configuración general

### Estructura de Datos

#### Zona
```typescript
{
  zona: string,        // "F", "G", "H"
  tipo: string,        // "Estantería", "Cámara Fría", etc.
  cantidad: number     // 1-999
}
```

#### Producto
```typescript
{
  id: string,
  codigo: string,
  nombre: string,
  categoria: string,
  unidad: string,
  precioUnitario: number,
  stock: number,
  stockMinimo: number,
  ubicacion: string,   // "A1", "B5", "F12"
  lote: string,
  fechaVencimiento: Date,
  estado: 'activo' | 'inactivo'
}
```

#### Comanda
```typescript
{
  id: string,
  numero: string,
  organismo: Organismo,
  productos: Array<ProductoComanda>,
  fechaCreacion: Date,
  fechaEntrega: Date,
  estado: EstadoComanda,
  prioridad: 'normal' | 'urgente',
  total: number,
  notas: string
}
```

---

# 9. CONFIGURACIÓN TÉCNICA

## Variables de Entorno

```env
# Supabase (opcional)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Configuración
VITE_DEFAULT_LANGUAGE=fr
VITE_DEFAULT_CURRENCY=CAD
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview

# Lint
npm run lint
```

## Instalación

```bash
# Clonar repositorio
git clone [repository-url]

# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev
```

---

# 10. CREDENCIALES DE ACCESO

## Usuario Desarrollador (Memorizado)

```
Username: David
Password: Lettycia26
Role: Administrator
```

**Permisos Especiales:**
- Acceso total sin restricciones
- Puede eliminar datos del sistema
- Puede modificar configuraciones críticas
- Bypass de validaciones de negocio
- Acceso a módulos ocultos
- Modo debug activado

## Usuarios de Prueba (Ejemplo)

```
# Entrepôt
Username: entrepot
Password: entrepot123
Role: Entrepôt

# Comandas
Username: comandas
Password: comandas123
Role: Comandas

# Transporte
Username: transporte
Password: transporte123
Role: Transporte
```

---

# RESUMEN DE CAMBIOS RECIENTES

## ✅ Funcionalidad: Crear Zonas Dinámicamente

**Ubicación:** Módulo Étiquettes → Tab Ubicación → Botón "+ Nouvelle zone"

**Características:**
- Crear zonas con código personalizado (A-Z, 1-2 caracteres)
- Seleccionar tipo de emplazamiento (6 opciones)
- Definir capacidad máxima (1-999)
- Vista previa antes de crear
- Persistencia en localStorage
- Validación de duplicados
- Ordenamiento alfabético automático

**Persistencia:**
```typescript
localStorage.setItem('zonasAlmacen', JSON.stringify(zonas))
```

## ✅ Eliminación de Restricciones de Contactos

**Antes:**
- Tipo "Donateur" solo en módulo Entrepôt
- Tipo "Fournisseur" solo en módulo Entrepôt

**Ahora:**
- Todos los tipos de contacto en todos los departamentos
- DONATEUR, FOURNISSEUR, ORGANISME, TRANSPORTISTA, AUTRE
- Accesibles desde Entrepôt, Comandas, Organismos

---

# SOPORTE Y DOCUMENTACIÓN

## Recursos Adicionales

- **Documentación Técnica:** Ver carpeta `/docs`
- **Componentes UI:** Ver carpeta `/src/app/components/ui`
- **Traducciones:** Ver carpeta `/src/i18n/locales`

## Contacto

Para soporte técnico o consultas sobre el sistema, contactar al desarrollador principal.

---

**Última actualización:** 2024
**Versión del sistema:** 1.0.0
**Desarrollado por:** David
