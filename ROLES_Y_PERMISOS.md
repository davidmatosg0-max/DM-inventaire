# 🎭 SISTEMA DE ROLES Y PERMISOS

## Descripción General

El sistema de Banque Alimentaire incluye un **sistema robusto de roles y permisos** que permite controlar el acceso de los usuarios a diferentes funcionalidades según su nivel de responsabilidad.

---

## 📋 ROLES DISPONIBLES (11 roles)

### **1. 🖥️ Développeur (Desarrollador)**

**Nivel de Acceso:** Máximo (Desarrollo y Debugging)

**Descripción:** Accès complet au système avec permissions de développement y debugging

**Color:** `#000000` (Negro)

**Permisos:**
- ✅ `desarrollador` - Acceso a funciones de desarrollo
- ✅ `acceso_total` - Acceso total a todas las funcionalidades
- ✅ `debug_mode` - Modo de debugging activado
- ✅ `administrador_general` - Administración general del sistema
- ✅ `gestion_usuarios` - Gestión de usuarios
- ✅ `gestion_roles` - Gestión de roles y permisos
- ✅ `configuracion_sistema` - Configuración avanzada del sistema
- ✅ `backup_restauracion` - Backup y restauración de datos

**Acceso a Módulos:**
- 🟢 **Dashboard** - Total
- 🟢 **Inventario** - Total
- 🟢 **Comandas** - Total
- 🟢 **Organismos** - Total
- 🟢 **Transporte** - Total
- 🟢 **Reportes** - Total
- 🟢 **Usuarios/Roles** - Total
- 🟢 **Comptoir** - Total
- 🟢 **Configuración** - Total

---

### **2. 👑 Administrateur (Administrador)**

**Nivel de Acceso:** Muy Alto (Gestión Completa)

**Descripción:** Gestion complète du système et de toutes les opérations

**Color:** `#DC3545` (Rojo)

**Permisos:**
- ✅ `administrador_general` - Administración general
- ✅ `gestion_usuarios` - Gestión de usuarios
- ✅ `gestion_roles` - Gestión de roles
- ✅ `configuracion_sistema` - Configuración del sistema
- ✅ `backup_restauracion` - Backup y restauración
- ✅ `coordinador` - Coordinación de operaciones
- ✅ `gestion_organismos` - Gestión de organismos
- ✅ `gestion_comandas` - Gestión de comandas
- ✅ `gestion_inventario` - Gestión de inventario
- ✅ `reportes_avanzados` - Reportes avanzados
- ✅ `gestion_productos` - Gestión de productos
- ✅ `gestion_beneficiarios` - Gestión de beneficiarios
- ✅ `gestion_vehiculos` - Gestión de vehículos
- ✅ `gestion_rutas` - Gestión de rutas
- ✅ `administrador_liaison` - Administración de comunicación

**Acceso a Módulos:**
- 🟢 **Dashboard** - Total
- 🟢 **Inventario** - Total
- 🟢 **Comandas** - Total
- 🟢 **Organismos** - Total
- 🟢 **Transporte** - Total
- 🟢 **Reportes** - Total
- 🟢 **Usuarios/Roles** - Total
- 🟢 **Comptoir** - Total
- 🟡 **Configuración** - Limitado (sin debugging)

---

### **3. 🎯 Coordinateur (Coordinador)**

**Nivel de Acceso:** Alto (Operaciones)

**Descripción:** Coordination des opérations, gestion des commandes et de l'inventaire

**Color:** `#1E73BE` (Azul)

**Permisos:**
- ✅ `coordinador` - Coordinación de operaciones
- ✅ `gestion_organismos` - Gestión de organismos
- ✅ `gestion_comandas` - Gestión de comandas
- ✅ `gestion_inventario` - Gestión de inventario
- ✅ `reportes_avanzados` - Reportes avanzados
- ✅ `movimientos_inventario` - Movimientos de inventario
- ✅ `gestion_ofertas` - Gestión de ofertas
- ✅ `ver_dashboard` - Ver dashboard
- ✅ `ver_reportes` - Ver reportes

**Acceso a Módulos:**
- 🟢 **Dashboard** - Total
- 🟢 **Inventario** - Total
- 🟢 **Comandas** - Total
- 🟢 **Organismos** - Total
- 🟡 **Transporte** - Lectura
- 🟢 **Reportes** - Total
- 🔴 **Usuarios/Roles** - Sin acceso
- 🟡 **Comptoir** - Lectura
- 🔴 **Configuración** - Sin acceso

---

### **4. 📦 Responsable Entrepôt (Responsable de Almacén)**

**Nivel de Acceso:** Medio-Alto (Almacén)

**Descripción:** Gestion de l'entrepôt, inventaire et réception des produits

**Color:** `#4CAF50` (Verde)

**Permisos:**
- ✅ `responsable_entrepot` - Responsable de almacén
- ✅ `gestion_productos` - Gestión de productos
- ✅ `movimientos_inventario` - Movimientos de inventario
- ✅ `gestion_prs` - Gestión de PRS
- ✅ `recepcion_productos` - Recepción de productos
- ✅ `gestion_inventario` - Gestión de inventario
- ✅ `ver_dashboard` - Ver dashboard
- ✅ `ver_inventario` - Ver inventario

**Acceso a Módulos:**
- 🟢 **Dashboard** - Total (métricas de almacén)
- 🟢 **Inventario** - Total
- 🟡 **Comandas** - Lectura (preparación)
- 🟡 **Organismos** - Lectura
- 🔴 **Transporte** - Sin acceso
- 🟢 **Reportes** - Inventario y PRS
- 🔴 **Usuarios/Roles** - Sin acceso
- 🔴 **Comptoir** - Sin acceso
- 🔴 **Configuración** - Sin acceso

---

### **5. 🏪 Responsable Comptoir (Responsable de Comptoir)**

**Nivel de Acceso:** Medio-Alto (Comptoir)

**Descripción:** Gestion du comptoir, bénéficiaires et distribution d'aide

**Color:** `#2d9561` (Verde elegante)

**Permisos:**
- ✅ `responsable_comptoir` - Responsable de comptoir
- ✅ `gestion_beneficiarios` - Gestión de beneficiarios
- ✅ `gestion_rendez_vous` - Gestión de citas
- ✅ `gestion_aide_alimentaire` - Gestión de ayuda alimentaria
- ✅ `registro_visitas` - Registro de visitas
- ✅ `ver_dashboard` - Ver dashboard
- ✅ `ver_reportes` - Ver reportes

**Acceso a Módulos:**
- 🟢 **Dashboard** - Total (métricas de comptoir)
- 🟡 **Inventario** - Lectura
- 🔴 **Comandas** - Sin acceso
- 🟡 **Organismos** - Lectura
- 🔴 **Transporte** - Sin acceso
- 🟢 **Reportes** - Comptoir y beneficiarios
- 🔴 **Usuarios/Roles** - Sin acceso
- 🟢 **Comptoir** - Total
- 🔴 **Configuración** - Sin acceso

---

### **6. 🚚 Responsable Transport (Responsable de Transporte)**

**Nivel de Acceso:** Medio-Alto (Logística)

**Descripción:** Gestion du transport, véhicules, routes et livraisons

**Color:** `#FFC107` (Amarillo)

**Permisos:**
- ✅ `responsable_transport` - Responsable de transporte
- ✅ `gestion_vehiculos` - Gestión de vehículos
- ✅ `gestion_rutas` - Gestión de rutas
- ✅ `gestion_transportes` - Gestión de transportes
- ✅ `tracking_gps` - Tracking GPS
- ✅ `ver_dashboard` - Ver dashboard
- ✅ `ver_reportes` - Ver reportes

**Acceso a Módulos:**
- 🟢 **Dashboard** - Total (métricas de transporte)
- 🟡 **Inventario** - Lectura (productos a transportar)
- 🟡 **Comandas** - Lectura (comandas para entregar)
- 🟡 **Organismos** - Lectura (destinos)
- 🟢 **Transporte** - Total
- 🟢 **Reportes** - Transporte y logística
- 🔴 **Usuarios/Roles** - Sin acceso
- 🔴 **Comptoir** - Sin acceso
- 🔴 **Configuración** - Sin acceso

---

### **7. 🤝 Liaison Organisme (Enlace con Organismos)**

**Nivel de Acceso:** Medio (Comunicación)

**Descripción:** Communication avec les organismes et gestion des relations

**Color:** `#9C27B0` (Púrpura)

**Permisos:**
- ✅ `administrador_liaison` - Administrador de comunicación
- ✅ `comunicacion_organismos` - Comunicación con organismos
- ✅ `gestion_ofertas` - Gestión de ofertas
- ✅ `verificacion_organismos` - Verificación de organismos
- ✅ `gestion_organismos` - Gestión de organismos
- ✅ `ver_dashboard` - Ver dashboard
- ✅ `ver_reportes` - Ver reportes

**Acceso a Módulos:**
- 🟢 **Dashboard** - Total (métricas de organismos)
- 🟡 **Inventario** - Lectura (productos disponibles)
- 🟡 **Comandas** - Lectura (comandas de organismos)
- 🟢 **Organismos** - Total
- 🔴 **Transporte** - Sin acceso
- 🟢 **Reportes** - Organismos y ofertas
- 🔴 **Usuarios/Roles** - Sin acceso
- 🔴 **Comptoir** - Sin acceso
- 🔴 **Configuración** - Sin acceso

---

### **8. 👥 Bénévole Comptoir (Voluntario de Comptoir)**

**Nivel de Acceso:** Básico (Asistencia)

**Descripción:** Aide au comptoir et assistance aux bénéficiaires

**Color:** `#17A2B8` (Cian)

**Permisos:**
- ✅ `benevole_lecteur` - Lector bénévole
- ✅ `aide_comptoir` - Ayuda en comptoir
- ✅ `registro_visitas` - Registro de visitas
- ✅ `ver_dashboard` - Ver dashboard

**Acceso a Módulos:**
- 🟡 **Dashboard** - Lectura (métricas básicas)
- 🔴 **Inventario** - Sin acceso
- 🔴 **Comandas** - Sin acceso
- 🔴 **Organismos** - Sin acceso
- 🔴 **Transporte** - Sin acceso
- 🔴 **Reportes** - Sin acceso
- 🔴 **Usuarios/Roles** - Sin acceso
- 🟡 **Comptoir** - Registro de visitas solamente
- 🔴 **Configuración** - Sin acceso

---

### **9. 📦 Bénévole Entrepôt (Voluntario de Almacén)**

**Nivel de Acceso:** Básico (Organización)

**Descripción:** Aide à l'entrepôt et organisation des produits

**Color:** `#28A745` (Verde oscuro)

**Permisos:**
- ✅ `benevole_lecteur` - Lector bénévole
- ✅ `aide_entrepot` - Ayuda en almacén
- ✅ `ver_inventario` - Ver inventario
- ✅ `ver_dashboard` - Ver dashboard

**Acceso a Módulos:**
- 🟡 **Dashboard** - Lectura (métricas básicas)
- 🟡 **Inventario** - Lectura (organización)
- 🔴 **Comandas** - Sin acceso
- 🔴 **Organismos** - Sin acceso
- 🔴 **Transporte** - Sin acceso
- 🔴 **Reportes** - Sin acceso
- 🔴 **Usuarios/Roles** - Sin acceso
- 🔴 **Comptoir** - Sin acceso
- 🔴 **Configuración** - Sin acceso

---

### **10. 💼 Employé (Empleado)**

**Nivel de Acceso:** Básico (General)

**Descripción:** Employé général avec accès aux fonctions courantes

**Color:** `#6C757D` (Gris)

**Permisos:**
- ✅ `employe_general` - Empleado general
- ✅ `ver_dashboard` - Ver dashboard
- ✅ `ver_inventario` - Ver inventario
- ✅ `ver_reportes` - Ver reportes

**Acceso a Módulos:**
- 🟡 **Dashboard** - Lectura
- 🟡 **Inventario** - Lectura
- 🔴 **Comandas** - Sin acceso
- 🔴 **Organismos** - Sin acceso
- 🔴 **Transporte** - Sin acceso
- 🟡 **Reportes** - Lectura
- 🔴 **Usuarios/Roles** - Sin acceso
- 🔴 **Comptoir** - Sin acceso
- 🔴 **Configuración** - Sin acceso

---

### **11. 👁️ Visualiseur (Visualizador)**

**Nivel de Acceso:** Mínimo (Solo Lectura)

**Descripción:** Accès en lecture seule au système

**Color:** `#9E9E9E` (Gris claro)

**Permisos:**
- ✅ `visualizador` - Visualizador
- ✅ `ver_dashboard` - Ver dashboard
- ✅ `ver_reportes` - Ver reportes
- ✅ `ver_inventario` - Ver inventario

**Acceso a Módulos:**
- 🟡 **Dashboard** - Lectura
- 🟡 **Inventario** - Lectura
- 🔴 **Comandas** - Sin acceso
- 🔴 **Organismos** - Sin acceso
- 🔴 **Transporte** - Sin acceso
- 🟡 **Reportes** - Lectura
- 🔴 **Usuarios/Roles** - Sin acceso
- 🔴 **Comptoir** - Sin acceso
- 🔴 **Configuración** - Sin acceso

---

## 🔐 LISTA COMPLETA DE PERMISOS (28 permisos)

### **Permisos de Desarrollador (3)**
1. `desarrollador` - Acceso a funciones de desarrollo
2. `acceso_total` - Acceso total a todas las funcionalidades
3. `debug_mode` - Modo de debugging activado

### **Permisos de Administración General (5)**
4. `administrador_general` - Administración general del sistema
5. `gestion_usuarios` - Gestión de usuarios
6. `gestion_roles` - Gestión de roles y permisos
7. `configuracion_sistema` - Configuración avanzada del sistema
8. `backup_restauracion` - Backup y restauración de datos

### **Permisos de Coordinación (5)**
9. `coordinador` - Coordinación de operaciones
10. `gestion_organismos` - Gestión de organismos
11. `gestion_comandas` - Gestión de comandas
12. `gestion_inventario` - Gestión de inventario
13. `reportes_avanzados` - Reportes avanzados

### **Permisos de Entrepôt (5)**
14. `responsable_entrepot` - Responsable de almacén
15. `gestion_productos` - Gestión de productos
16. `movimientos_inventario` - Movimientos de inventario
17. `gestion_prs` - Gestión de PRS
18. `recepcion_productos` - Recepción de productos

### **Permisos de Comptoir (5)**
19. `responsable_comptoir` - Responsable de comptoir
20. `gestion_beneficiarios` - Gestión de beneficiarios
21. `gestion_rendez_vous` - Gestión de citas
22. `gestion_aide_alimentaire` - Gestión de ayuda alimentaria
23. `registro_visitas` - Registro de visitas

### **Permisos de Transport (5)**
24. `responsable_transport` - Responsable de transporte
25. `gestion_vehiculos` - Gestión de vehículos
26. `gestion_rutas` - Gestión de rutas
27. `gestion_transportes` - Gestión de transportes
28. `tracking_gps` - Tracking GPS

### **Permisos de Liaison (4)**
29. `administrador_liaison` - Administrador de comunicación
30. `comunicacion_organismos` - Comunicación con organismos
31. `gestion_ofertas` - Gestión de ofertas
32. `verificacion_organismos` - Verificación de organismos

### **Permisos de Bénévoles (3)**
33. `benevole_lecteur` - Lector bénévole
34. `aide_comptoir` - Ayuda en comptoir
35. `aide_entrepot` - Ayuda en almacén

### **Permisos de Empleados (1)**
36. `employe_general` - Empleado general

### **Permisos de Visualización (4)**
37. `visualizador` - Visualizador
38. `ver_dashboard` - Ver dashboard
39. `ver_reportes` - Ver reportes
40. `ver_inventario` - Ver inventario

---

## 👥 USUARIOS PERMANENTES DEL SISTEMA

### **1. David (Desarrollador)**
- **Username:** `David`
- **Password:** `Lettycia26`
- **Rol:** `desarrollador`
- **Permisos:** Acceso total + debugging + desarrollo
- **Estado:** Siempre activo (PERMANENTE)
- **Descripción:** Développeur Principal - Accès Total au Système
- **Email:** david@banque-alimentaire.org

> ⚠️ **IMPORTANTE:** David es el ÚNICO usuario permanente del sistema. No puede ser eliminado y tiene acceso completo a todas las funcionalidades incluyendo modo debug y desarrollo.

---

## 🎯 MATRIZ DE ACCESO A MÓDULOS

| **Rol** | **Dashboard** | **Inventario** | **Comandas** | **Organismos** | **Transporte** | **Reportes** | **Usuarios** | **Comptoir** | **Config** |
|---------|--------------|----------------|-------------|---------------|---------------|-------------|-------------|-------------|-----------|
| **Développeur** | 🟢 Total | 🟢 Total | 🟢 Total | 🟢 Total | 🟢 Total | 🟢 Total | 🟢 Total | 🟢 Total | 🟢 Total |
| **Administrateur** | 🟢 Total | 🟢 Total | 🟢 Total | 🟢 Total | 🟢 Total | 🟢 Total | 🟢 Total | 🟢 Total | 🟡 Limitado |
| **Coordinateur** | 🟢 Total | 🟢 Total | 🟢 Total | 🟢 Total | 🟡 Lectura | 🟢 Total | 🔴 No | 🟡 Lectura | 🔴 No |
| **Resp. Entrepôt** | 🟢 Total | 🟢 Total | 🟡 Lectura | 🟡 Lectura | 🔴 No | 🟡 Limitado | 🔴 No | 🔴 No | 🔴 No |
| **Resp. Comptoir** | 🟢 Total | 🟡 Lectura | 🔴 No | 🟡 Lectura | 🔴 No | 🟡 Limitado | 🔴 No | 🟢 Total | 🔴 No |
| **Resp. Transport** | 🟢 Total | 🟡 Lectura | 🟡 Lectura | 🟡 Lectura | 🟢 Total | 🟡 Limitado | 🔴 No | 🔴 No | 🔴 No |
| **Liaison Organisme** | 🟢 Total | 🟡 Lectura | 🟡 Lectura | 🟢 Total | 🔴 No | 🟡 Limitado | 🔴 No | 🔴 No | 🔴 No |
| **Bénévole Comptoir** | 🟡 Lectura | 🔴 No | 🔴 No | 🔴 No | 🔴 No | 🔴 No | 🔴 No | 🟡 Limitado | 🔴 No |
| **Bénévole Entrepôt** | 🟡 Lectura | 🟡 Lectura | 🔴 No | 🔴 No | 🔴 No | 🔴 No | 🔴 No | 🔴 No | 🔴 No |
| **Employé** | 🟡 Lectura | 🟡 Lectura | 🔴 No | 🔴 No | 🔴 No | 🟡 Lectura | 🔴 No | 🔴 No | 🔴 No |
| **Visualiseur** | 🟡 Lectura | 🟡 Lectura | 🔴 No | 🔴 No | 🔴 No | 🟡 Lectura | 🔴 No | 🔴 No | 🔴 No |

**Leyenda:**
- 🟢 **Total** - Acceso completo (lectura + escritura + eliminación)
- 🟡 **Lectura/Limitado** - Solo lectura o funciones limitadas
- 🔴 **No** - Sin acceso

---

## 🔧 CÓMO ASIGNAR ROLES

### **Desde el Módulo de Recrutement (Bénévoles):**

1. Ir a **Recrutement** → **Bénévoles**
2. Seleccionar un bénévole
3. Clic en **Créer Accès au Système**
4. Elegir el rol apropiado
5. Ingresar username y password
6. Guardar

### **Desde el Módulo de Usuarios/Roles:**

1. Ir a **Usuarios/Roles**
2. Clic en **Nouveau Utilisateur**
3. Completar formulario:
   - Nombre y apellido
   - Email y teléfono
   - Username y password
   - **Seleccionar rol** (automáticamente asigna permisos)
4. Guardar

---

## 🛡️ SEGURIDAD

### **Protección de Usuario Permanente:**
- ✅ David **NUNCA** se puede eliminar
- ✅ Sus credenciales están protegidas
- ✅ Siempre está activo en el sistema
- ✅ Único usuario con acceso a debugging y desarrollo

### **Verificación de Permisos:**
```typescript
import { tienePermiso, PERMISOS } from './utils/usuarios';

// Verificar si el usuario tiene un permiso específico
if (tienePermiso(usuario, PERMISOS.GESTION_USUARIOS)) {
  // Permitir acceso
}

// El permiso 'acceso_total' otorga todos los permisos
if (usuario.permisos.includes('acceso_total')) {
  // Usuario tiene acceso total
}
```

---

## 📊 ESTADÍSTICAS

- **Total de Roles:** 11 roles
- **Total de Permisos:** 40+ permisos únicos
- **Usuarios Permanentes:** 1 (Solo David)
- **Niveles de Acceso:** 5 niveles (Máximo, Muy Alto, Alto, Medio, Básico)
- **Módulos Protegidos:** 9 módulos principales

---

**Última actualización:** Martes, 10 de marzo de 2026  
**Versión del Sistema:** 5.0-production  
**Estado:** ✅ SOLO DAVID - MODO PRODUCCIÓN LIMPIO