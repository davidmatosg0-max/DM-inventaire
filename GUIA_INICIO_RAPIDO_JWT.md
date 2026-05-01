# ⚡ Guía de Inicio Rápido - Sistema JWT + API Keys

## Banque Alimentaire PRO v5.0

---

## 🚀 Inicio Rápido (5 minutos)

### Paso 1: Login con JWT

```
1. Abrir la aplicación
2. Verás la pantalla de login
3. Ingresar credenciales:
   
   👨‍💻 Para Desarrollador:
   Usuario: David
   Contraseña: Lettycia26
   
   👑 Para Admin:
   Usuario: admin
   Contraseña: Admin2024!

4. ✅ Click en "Se connecter"
5. 🎉 ¡Listo! Estás autenticado con JWT
```

**Atajo rápido**: Click en el logo para autocompletar credenciales de David

---

### Paso 2: Verificar tu Sesión JWT

Una vez dentro del sistema:

```
1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña "Application" > "localStorage"
3. Busca la clave: banque_auth_tokens
4. Verás tu token JWT:

{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "expiresIn": 900
}
```

---

### Paso 3: Acceder al Panel de Gestión

```
1. Desde el menú lateral, ir a:
   Configuración ⚙️ > Gestion d'Authentification 🔐

2. Verás 3 pestañas:
   • Vue d'ensemble (resumen)
   • JWT Sessions (tu sesión actual)
   • API Keys (gestión de claves)
```

---

## 🔐 Usar JWT en tu Código

### 1. Importar el Hook de Autenticación

```typescript
import { useAuth } from '../contexts/AuthContext';

function MiComponente() {
  const { 
    isAuthenticated,  // ¿Está autenticado?
    usuario,          // Datos del usuario
    login,            // Función de login
    logout,           // Función de logout
    tienePermiso      // Verificar permisos
  } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <p>Hola, {usuario?.username}!</p>
      ) : (
        <button onClick={() => login('user', 'pass')}>
          Login
        </button>
      )}
    </div>
  );
}
```

### 2. Proteger Componentes

```typescript
import { withAuth } from '../contexts/AuthContext';

// Tu componente normal
function Dashboard() {
  return <div>Panel Protegido</div>;
}

// Exportar protegido
export default withAuth(Dashboard);
// Solo usuarios autenticados pueden ver este componente
```

### 3. Proteger con Permisos Específicos

```typescript
import { withPermission } from '../contexts/AuthContext';

function EditarInventario() {
  return <div>Editar productos</div>;
}

export default withPermission(
  EditarInventario, 
  'write:inventory' // Requiere este permiso
);
```

### 4. Verificar Permisos Manualmente

```typescript
function MiComponente() {
  const { tienePermiso } = useAuth();

  return (
    <div>
      {tienePermiso('write:inventory') && (
        <button>Editar Inventario</button>
      )}
      
      {tienePermiso('admin:all') && (
        <button>Panel de Admin</button>
      )}
    </div>
  );
}
```

---

## 🔑 Crear y Usar API Keys

### 1. Crear una Nueva API Key

```
1. Login como admin o David
2. Ir a: Configuración > API Keys
3. Click en "Créer une nouvelle clé API"
4. Completar formulario:
   
   Nombre: Email Service Integration
   Descripción: Para envío automático de emails
   
   Permisos (seleccionar):
   ✅ read:organisms
   ✅ write:orders
   
   Rate Limits (opcional):
   - Por minuto: 60
   - Por hora: 1000
   - Por día: 10000
   
   IP Whitelist (opcional):
   192.168.1.100
   10.0.0.50

5. Click "Créer la clé"
6. ⚠️ IMPORTANTE: Copiar la clave generada
   (solo se muestra UNA VEZ)
```

### 2. Usar la API Key

#### En JavaScript/Fetch

```javascript
const apiKey = 'ba_lzc8x3_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

fetch('/api/v1/inventory', {
  method: 'GET',
  headers: {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

#### En Node.js (axios)

```javascript
const axios = require('axios');

const apiKey = 'ba_lzc8x3_...';

axios.get('https://banque-alimentaire.local/api/v1/inventory', {
  headers: {
    'X-API-Key': apiKey
  }
})
.then(response => {
  console.log(response.data);
});
```

#### En cURL

```bash
curl -H "X-API-Key: ba_lzc8x3_a1b2c3d4..." \
     https://banque-alimentaire.local/api/v1/inventory
```

### 3. Validar API Key (en el backend)

```typescript
import { validarAPIKey } from './utils/apiKeyManager';

// En tu middleware de API
function apiKeyMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'API Key requerida' 
    });
  }

  const validation = validarAPIKey(apiKey);
  
  if (!validation.isValid) {
    return res.status(401).json({ 
      error: validation.error 
    });
  }

  // Guardar info de la key en el request
  req.apiKey = validation.key;
  next();
}
```

---

## 🎯 Casos de Uso Comunes

### Caso 1: Login de Usuario Normal

```typescript
const { login } = useAuth();

async function handleLogin() {
  const exito = await login('David', 'Lettycia26', true); // true = recordar
  
  if (exito) {
    console.log('✅ Login exitoso');
    // El usuario será redirigido automáticamente
  } else {
    console.log('❌ Login fallido');
  }
}
```

### Caso 2: Portal de Organismos

```typescript
const { loginOrganismo } = useAuth();

async function accederPortal() {
  const claveAcceso = 'CAC-456ABC';
  const exito = await loginOrganismo(claveAcceso);
  
  if (exito) {
    console.log('✅ Acceso al portal concedido');
  }
}
```

### Caso 3: Refrescar Sesión Manualmente

```typescript
const { refrescarSesion } = useAuth();

async function renovarSesion() {
  const exito = await refrescarSesion();
  
  if (exito) {
    console.log('✅ Sesión renovada');
  } else {
    console.log('❌ Error al renovar sesión');
    // Redirigir a login
  }
}
```

### Caso 4: Logout

```typescript
const { logout } = useAuth();

function handleLogout() {
  logout();
  console.log('✅ Sesión cerrada');
  // Los tokens son revocados automáticamente
}
```

### Caso 5: Obtener Info del Usuario Actual

```typescript
import { obtenerUsuarioDesdeToken } from './utils/jwtManager';

const usuario = obtenerUsuarioDesdeToken();

if (usuario) {
  console.log('Usuario:', usuario.username);
  console.log('Rol:', usuario.role);
  console.log('Permisos:', usuario.permissions);
}
```

---

## 📊 Monitorear el Sistema

### 1. Ver Estadísticas JWT

```typescript
import { obtenerEstadisticasJWT } from './utils/jwtManager';

const stats = obtenerEstadisticasJWT();

console.log('Token activo:', stats.tokenActivo);
console.log('Tiempo restante:', stats.tiempoRestante, 'segundos');
console.log('Usuario:', stats.usuario);
console.log('Rol:', stats.rol);
```

### 2. Ver Estadísticas de API Keys

```typescript
import { obtenerEstadisticasAPI } from './utils/apiKeyManager';

const stats = obtenerEstadisticasAPI();

console.log('Total de keys:', stats.totalKeys);
console.log('Keys activas:', stats.activeKeys);
console.log('Requests hoy:', stats.requestsToday);
console.log('Top consumers:', stats.topConsumers);
```

### 3. Verificar Rate Limit

```typescript
import { verificarRateLimit } from './utils/apiKeyManager';

const apiKey = 'ba_lzc8x3_...';
const limite = verificarRateLimit(apiKey);

if (limite.allowed) {
  console.log('✅ Request permitido');
  console.log('Requests restantes:', limite.remaining);
  console.log('Reset en:', limite.resetIn, 'segundos');
} else {
  console.log('❌ Rate limit excedido');
  console.log('Espera', limite.resetIn, 'segundos');
}
```

---

## 🔒 Mejores Prácticas de Seguridad

### ✅ Hacer

```typescript
// 1. Siempre usar HTTPS en producción
const API_URL = 'https://banque-alimentaire.local';

// 2. Guardar tokens de forma segura
// (el sistema ya lo hace por ti en localStorage)

// 3. Implementar logout en todas las pestañas
window.addEventListener('storage', (e) => {
  if (e.key === 'banque_auth_tokens' && !e.newValue) {
    // Token eliminado, hacer logout
    logout();
  }
});

// 4. Verificar permisos en cada acción importante
if (tienePermiso('write:inventory')) {
  // Permitir modificar inventario
} else {
  // Mostrar mensaje de permiso denegado
}

// 5. Manejar errores de token expirado
try {
  // Hacer request
} catch (error) {
  if (error.message === 'Token expirado') {
    await refrescarSesion();
    // Reintentar request
  }
}
```

### ❌ NO Hacer

```typescript
// ❌ NO exponer tokens en URLs
const url = `https://api.example.com?token=${accessToken}`; // MAL

// ❌ NO compartir API Keys públicamente
const apiKey = 'ba_lzc8x3_...'; // NO committear a Git

// ❌ NO ignorar validación de permisos
// Siempre verificar permisos antes de acciones importantes

// ❌ NO guardar contraseñas en código
const password = 'Admin2024!'; // MAL - usar variables de entorno

// ❌ NO usar la misma API Key para todo
// Crear keys específicas por servicio
```

---

## 🛠️ Troubleshooting

### Problema 1: "Token expirado"

**Solución:**
```typescript
const { refrescarSesion } = useAuth();
await refrescarSesion();

// Si falla, hacer logout y login nuevamente
```

### Problema 2: "Refresh token inválido"

**Solución:**
```javascript
// Limpiar storage y recargar
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Problema 3: "API Key no encontrada"

**Solución:**
```
1. Verificar que la key está correctamente copiada
2. Verificar que no está revocada
3. Generar nueva key si es necesario
```

### Problema 4: "Rate limit excedido"

**Solución:**
```typescript
const limite = verificarRateLimit(apiKey);
const esperarMs = limite.resetIn * 1000;

// Esperar y reintentar
setTimeout(() => {
  // Reintentar request
}, esperarMs);
```

### Problema 5: "Permiso denegado"

**Solución:**
```
1. Verificar permisos del usuario/API key
2. Actualizar permisos si es necesario
3. Contactar al administrador para solicitar permisos
```

---

## 📞 Obtener Ayuda

### Documentación Completa

- **Manual Técnico**: `/SISTEMA_AUTENTICACION_HIBRIDO.md`
- **Implementación**: `/IMPLEMENTACION_JWT_HIBRIDO_COMPLETADA.md`
- **Resumen Visual**: `/RESUMEN_VISUAL_JWT_HIBRIDO.md`

### Código de Referencia

- **JWT Manager**: `/src/app/utils/jwtManager.ts`
- **API Keys Manager**: `/src/app/utils/apiKeyManager.ts`
- **Auth Context**: `/src/contexts/AuthContext.tsx`

### Contacto

- **Desarrollador**: David (usuario con acceso total)
- **Sistema**: Banque Alimentaire PRO v5.0

---

## 🎯 Checklist de Inicio

```
✅ Login exitoso con JWT
✅ Verificación de token en localStorage
✅ Acceso al panel de gestión
✅ Creación de primera API Key
✅ Prueba de validación de API Key
✅ Verificación de auto-refresh
✅ Prueba de logout y re-login
✅ Exploración de permisos
✅ Lectura de documentación
```

---

## 🎉 Conclusión

¡Ya estás listo para usar el sistema de autenticación híbrido!

**Recuerda:**
- 🔐 JWT para usuarios humanos
- 🔑 API Keys para integraciones
- ⏱️ Auto-refresh automático cada 15 minutos
- 🛡️ Permisos granulares por recurso
- 📊 Monitoreo en tiempo real

**Próximos pasos:**
1. Explorar el Dashboard Predictivo con IA
2. Configurar integraciones con API Keys (FASE 2)
3. Implementar PWA (FASE 2)

---

**Banque Alimentaire PRO v5.0**  
*Sistema Híbrido de Autenticación JWT + API Keys*

⚡ Rápido • 🔒 Seguro • 🎯 Profesional
