# 👥 Sistema de Usuarios - Documentación Completa

## 📋 USUARIOS PREDEFINIDOS DEL SISTEMA

El sistema Banque Alimentaire cuenta con 5 usuarios predefinidos, cada uno con permisos específicos según su función.

---

## 🔑 CREDENCIALES Y ACCESOS

### 1. 👑 David - Développeur Principal

```
Username:     David
Password:     Lettycia26
Rol:          Administrador
```

**Permisos:**
- ✅ Acceso Total al Sistema
- ✅ Permisos de Desarrollador
- ✅ Administrador General
- ✅ Administrador Liaison
- ✅ Coordinador

**Acceso a:**
- Todos los módulos sin restricción
- Configuración avanzada del sistema
- Panel de marca
- Gestión de usuarios y roles
- Configuración de balanzas

---

### 2. 🔧 admin - Administrateur Système

```
Username:     admin
Password:     Demo2024!
Rol:          Administrador
```

**Permisos:**
- ✅ Administrador General
- ✅ Administrador Liaison
- ❌ Sin acceso a funciones de desarrollador

**Acceso a:**
- Dashboard
- Inventario (completo)
- Comandas (completo)
- Organismos (completo)
- Transporte (completo)
- Reportes
- Usuarios y Roles
- ID Digital
- Configuración general

---

### 3. 🏛️ liaison - Admin Liaison

```
Username:     liaison
Password:     liaison123
Rol:          Administrador
```

**Permisos:**
- ✅ Administrador Liaison

**Especializado en:**
- Gestión de organismos
- Comandas y ofertas
- Comunicación con organismos
- Portal público de organismos

**Acceso a:**
- Dashboard
- Organismos (completo)
- Comandas (completo)
- Ofertas
- Email a organismos
- Reportes de organismos

---

### 4. 📋 coordinador - Coordinateur Principal

```
Username:     coordinador
Password:     coord123
Rol:          Coordinador
```

**Permisos:**
- ✅ Coordinador (solo lectura)

**Acceso a:**
- Dashboard (lectura)
- Inventario (lectura)
- Comandas (lectura)
- Organismos (lectura)
- Transporte (lectura)
- Reportes (lectura)

**Restricciones:**
- ❌ No puede crear ni editar
- ❌ No puede eliminar
- ✅ Ideal para auditoría y supervisión

---

### 5. 🚚 transport - Responsable Transport ⭐ NUEVO

```
Username:     transport
Password:     Transport2024!
Rol:          Usuario
```

**Permisos:**
- ✅ `transporte.ver`
- ✅ `transporte.editar`
- ✅ `transporte.entregar`
- ✅ `transporte.vehiculos`
- ✅ `comandas.ver` (solo lectura)
- ✅ `organismos.ver` (solo lectura)
- ✅ `dashboard.ver` (solo lectura)

**Especializado en:**
- Gestión de entregas
- Planificación de rutas
- Administración de vehículos
- Registro de entregas completadas

**Acceso a:**
- Dashboard (resumen de entregas)
- Módulo de Transporte (completo)
  - Planificación de rutas
  - Gestión de choferes
  - Gestión de vehículos
  - Verificación de vehículos
- Comandas (solo lectura para ver entregas)
- Organismos (solo lectura para ver direcciones)

**Restricciones:**
- ❌ No puede gestionar inventario
- ❌ No puede crear/eliminar comandas
- ❌ No puede administrar usuarios
- ❌ No tiene acceso a configuración

---

## 📊 TABLA COMPARATIVA

| Usuario | Rol | Dashboard | Inventario | Comandas | Transporte | Usuarios | Config |
|---------|-----|-----------|------------|----------|------------|----------|--------|
| David | Admin | ✅ Total | ✅ Total | ✅ Total | ✅ Total | ✅ Total | ✅ Total |
| admin | Admin | ✅ Total | ✅ Total | ✅ Total | ✅ Total | ✅ Total | ✅ General |
| liaison | Admin | ✅ Total | ✅ Ver | ✅ Total | ✅ Ver | ✅ Ver | ✅ Ver |
| coordinador | Coord | 👁️ Ver | 👁️ Ver | 👁️ Ver | 👁️ Ver | 👁️ Ver | 👁️ Ver |
| **transport** | Usuario | 👁️ Ver | ❌ - | 👁️ Ver | ✅ Total | ❌ - | ❌ - |

### Leyenda:
- ✅ Total = Acceso completo (crear, editar, eliminar)
- 👁️ Ver = Solo lectura
- ❌ - = Sin acceso

---

## 🎯 CASOS DE USO

### Desarrollo y Pruebas
**Usuario recomendado**: `David`
- Acceso total sin restricciones
- Puede probar todas las funcionalidades

### Administración General
**Usuario recomendado**: `admin`
- Gestión completa del sistema
- Sin acceso a funciones de desarrollo

### Gestión de Organismos
**Usuario recomendado**: `liaison`
- Especializado en relación con organismos
- Gestión de comandas y ofertas

### Supervisión y Auditoría
**Usuario recomendado**: `coordinador`
- Acceso de solo lectura a todos los módulos
- Ideal para generar reportes

### Operaciones de Transporte ⭐
**Usuario recomendado**: `transport`
- Gestión de entregas y rutas
- Administración de vehículos
- Ideal para choferes y coordinadores de logística

---

## 🔐 SEGURIDAD

### Cambio de Contraseñas

Para cambiar la contraseña de un usuario:

1. Ir a **Usuarios** → **Usuarios Internos**
2. Seleccionar el usuario
3. Click en "Editar"
4. Cambiar la contraseña
5. Guardar

### Gestión de Permisos

Los permisos se gestionan en:
- **Usuarios** → **Roles y Permisos**

Los roles predeterminados incluyen:
- Administrador
- Coordinador
- Almacenista
- **Transportista** ⭐
- Auditor
- Voluntario

---

## 📝 AGREGAR NUEVOS USUARIOS

### Desde la Interfaz

1. Ir a **Usuarios** → **Usuarios Internos**
2. Click en "➕ Nouvel Utilisateur"
3. Completar el formulario:
   - Nombre y apellido
   - Username (único)
   - Password
   - Email
   - Rol
   - Permisos específicos
4. Guardar

### Programáticamente

Usar la función `agregarUsuario()` en `/src/app/utils/usuarios.ts`:

```typescript
import { agregarUsuario } from '@/app/utils/usuarios';

const nuevoUsuario = agregarUsuario({
  username: 'nuevo_usuario',
  password: 'Password123!',
  nombre: 'Nombre',
  apellido: 'Apellido',
  email: 'email@banque-alimentaire.org',
  rol: 'usuario',
  permisos: ['dashboard.ver', 'inventario.ver'],
  descripcion: 'Descripción del usuario'
});
```

---

## 🔄 MIGRACIÓN AUTOMÁTICA

El sistema incluye un sistema de migración automática que:

- ✅ Detecta la versión de usuarios en localStorage
- ✅ Aplica actualizaciones automáticamente
- ✅ Agrega nuevos usuarios predefinidos
- ✅ Actualiza permisos según la versión

**Versión actual**: `3.0`

### Historial de Versiones

| Versión | Cambios |
|---------|---------|
| 1.0 | Usuarios iniciales |
| 2.0 | Actualización de permisos admin |
| **3.0** | ⭐ Usuario de transporte agregado |

---

## 📂 ARCHIVOS RELACIONADOS

| Archivo | Descripción |
|---------|-------------|
| `/src/app/utils/usuarios.ts` | Sistema principal de usuarios |
| `/src/app/data/rolesPermisos.ts` | Definición de roles y permisos |
| `/src/app/components/pages/Login.tsx` | Pantalla de login |
| `/src/app/components/pages/Usuarios.tsx` | Gestión de usuarios |
| `/USUARIO_TRANSPORTE.md` | ⭐ Documentación usuario transport |

---

## 🆘 SOPORTE

### Olvidé mi contraseña

Si olvidaste la contraseña de un usuario:

1. **Para usuarios no-admin**: Solicitar a un administrador que la restablezca
2. **Para admin**: Usar el usuario `David` para restablecerla
3. **Emergencia**: Ejecutar en la consola del navegador:

```javascript
// SOLO EN DESARROLLO - RESETEAR USUARIOS
localStorage.removeItem('banque_alimentaire_usuarios');
localStorage.removeItem('banque_alimentaire_usuarios_version');
location.reload();
```

⚠️ **Advertencia**: Esto eliminará todos los usuarios personalizados y volverá a los predefinidos.

---

## ✅ CHECKLIST DE USUARIOS

- [x] David - Desarrollador ✅
- [x] admin - Administrador ✅
- [x] liaison - Admin Liaison ✅
- [x] coordinador - Coordinador ✅
- [x] **transport - Responsable Transport ✅** ⭐ NUEVO

---

**Última actualización**: 2026-02-26  
**Versión del sistema**: 3.0  
**Total de usuarios predefinidos**: 5  
**Status**: ✅ Actualizado
