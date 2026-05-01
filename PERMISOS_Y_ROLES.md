# Sistema de Permisos y Roles - Banque Alimentaire

## 📋 Usuarios Predefinidos del Sistema

### 1. **David** (Développeur) 🔧
- **Usuario:** `David`
- **Contraseña:** `Lettycia26`
- **Rol:** Administrador (Desarrollador)
- **Permisos:** Acceso total al sistema
- **Descripción:** Développeur Principal con acceso completo incluyendo módulos de desarrollo

### 2. **Admin** (Administrateur Système) 👨‍💼
- **Usuario:** `admin`
- **Contraseña:** `Demo2024!`
- **Rol:** Administrador General
- **Permisos:** Acceso completo excepto desarrollo
- **Descripción:** Administrateur Démo - Gestión completa del sistema

### 3. **Liaison** (Administrateur Liaison) 🤝
- **Usuario:** `liaison`
- **Contraseña:** `liaison123`
- **Rol:** Administrador Liaison
- **Permisos:** Gestión de organismos y comandas
- **Descripción:** Especializado en gestión de organismos y relaciones externas

### 4. **Coordinateur** (Coordinador) 📊
- **Usuario:** `coordinador`
- **Contraseña:** `coord123`
- **Rol:** Coordinador
- **Permisos:** Solo lectura en todos los módulos
- **Descripción:** Acceso en modo lectura para supervisión

### 5. **Marc** (Transporteur) 🚚
- **Usuario:** `transport`
- **Contraseña:** `Transport2024!`
- **Rol:** Usuario (Transportista)
- **Permisos:** Gestión de transporte y entregas
- **Descripción:** Responsable Transport - Gestion des Livraisons et Véhicules

### 6. **Louise** (Transporteuse) 🚛
- **Usuario:** `Louise`
- **Contraseña:** `Louise2024!`
- **Rol:** Usuario (Transportista)
- **Permisos:** Gestión de transporte y entregas
- **Descripción:** Transporteuse - Gestion des Livraisons

---

## 🎯 Permisos por Rol

### Desarrollador (développeur)
✅ Acceso TOTAL al sistema
- ✅ Panel de Marca (Branding)
- ✅ Configuración avanzada
- ✅ Todos los módulos y funcionalidades

### Administrador General (administrador_general)
✅ Dashboard (Lectura y Escritura)
✅ Inventario (CRUD completo)
✅ Comandas (CRUD + Aprobar)
✅ Organismos (CRUD completo)
✅ Transporte (Ver y Editar)
✅ Reportes (Ver y Exportar)
✅ Usuarios (CRUD completo)
✅ Configuración (Ver y Editar)
✅ Comptoir (Ver y Editar)
❌ Panel de Marca (Solo desarrollador)

### Administrador Liaison (administrador_liaison)
✅ Dashboard (Ver)
✅ Organismos (CRUD completo)
✅ Comandas (CRUD + Aprobar)
✅ Inventario (Solo lectura)
✅ Reportes (Ver)
❌ Usuarios
❌ Configuración
❌ Transporte (Solo administrador)

### Coordinador (coordinador)
✅ Dashboard (Solo lectura)
✅ Inventario (Solo lectura)
✅ Comandas (Solo lectura)
✅ Organismos (Solo lectura)
✅ Transporte (Solo lectura)
✅ Reportes (Ver)
❌ NO puede crear, editar o eliminar nada

### Usuario Transportista (transporte.*)
✅ Dashboard (Ver)
✅ Transporte (Ver, Editar, Entregar)
✅ Vehículos (Gestión completa)
✅ Comandas (Solo lectura)
✅ Organismos (Solo lectura)
❌ Inventario
❌ Usuarios
❌ Configuración

---

## 🔐 Sistema de Permisos

### Permisos Disponibles

#### Dashboard
- `dashboard.ver` - Ver dashboard
- `dashboard.metricas` - Ver métricas avanzadas

#### Inventario
- `inventario.ver` - Ver inventario
- `inventario.crear` - Crear productos
- `inventario.editar` - Editar productos
- `inventario.eliminar` - Eliminar productos

#### Comandas
- `comandas.ver` - Ver comandas
- `comandas.crear` - Crear comandas
- `comandas.editar` - Editar comandas
- `comandas.aprobar` - Aprobar comandas
- `comandas.eliminar` - Eliminar comandas

#### Organismos
- `organismos.ver` - Ver organismos
- `organismos.crear` - Crear organismos
- `organismos.editar` - Editar organismos
- `organismos.eliminar` - Eliminar organismos

#### Transporte
- `transporte.ver` - Ver transporte
- `transporte.editar` - Editar rutas/entregas
- `transporte.entregar` - Marcar como entregado
- `transporte.vehiculos` - Gestionar vehículos

#### Reportes
- `reportes.ver` - Ver reportes
- `reportes.exportar` - Exportar reportes

#### Usuarios
- `usuarios.ver` - Ver usuarios
- `usuarios.crear` - Crear usuarios
- `usuarios.editar` - Editar usuarios
- `usuarios.eliminar` - Eliminar usuarios

#### Configuración
- `configuracion.ver` - Ver configuración
- `configuracion.editar` - Editar configuración

---

## 🛠️ Uso en el Código

### Verificar Permisos

```typescript
import { tienePermiso, PERMISOS } from '../utils/permisos';

// Verificar un permiso específico
if (tienePermiso(PERMISOS.INVENTARIO_CREAR)) {
  // El usuario puede crear productos
}
```

### Proteger Componentes

```typescript
import { PermisoGuard } from '../components/PermisoGuard';

<PermisoGuard permiso={PERMISOS.INVENTARIO_CREAR}>
  <Button>Crear Producto</Button>
</PermisoGuard>
```

### Botones Protegidos

```typescript
import { ProtectedButton } from '../components/PermisoGuard';

<ProtectedButton 
  permiso={PERMISOS.COMANDAS_APROBAR}
  onClick={handleAprobar}
>
  Aprobar Comanda
</ProtectedButton>
```

### Verificar Módulo Disponible

```typescript
import { moduloDisponible } from '../utils/permisos';

if (moduloDisponible('inventario')) {
  // Mostrar el módulo de inventario
}
```

---

## 📝 Notas Importantes

1. **Persistencia:** Los permisos se almacenan en `localStorage` 
2. **Sesión:** La información del usuario actual está en `sessionStorage`
3. **Seguridad:** Las contraseñas NO se envían al frontend después del login
4. **Migración:** El sistema migra automáticamente usuarios al actualizar versiones
5. **Expansión:** Los permisos se expanden automáticamente según el rol

---

## 🚀 Agregar Nuevos Usuarios

Para agregar un nuevo usuario, editar `/src/app/utils/usuarios.ts`:

```typescript
{
  id: '7',
  username: 'nuevo_usuario',
  password: 'password123',
  nombre: 'Nombre',
  apellido: 'Apellido',
  email: 'email@example.org',
  rol: 'usuario', // 'administrador' | 'usuario' | 'coordinador'
  permisos: [
    'dashboard.ver',
    'inventario.ver',
    // ... otros permisos
  ],
  descripcion: 'Descripción del usuario'
}
```

Luego actualizar `CURRENT_VERSION` para forzar migración.
