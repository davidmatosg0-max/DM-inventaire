# 🔐 Sistema de Autenticación Híbrido - JWT + API Keys

## Banque Alimentaire PRO v5.0

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [JWT (JSON Web Tokens)](#jwt-json-web-tokens)
4. [API Keys](#api-keys)
5. [Comparación y Casos de Uso](#comparación-y-casos-de-uso)
6. [Implementación Técnica](#implementación-técnica)
7. [Guía de Uso](#guía-de-uso)
8. [Seguridad](#seguridad)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Resumen Ejecutivo

El sistema Banque Alimentaire PRO v5.0 implementa un **modelo de autenticación híbrido** que combina:

- **JWT (JSON Web Tokens)** → Para usuarios humanos (login web/móvil)
- **API Keys** → Para integraciones máquina-a-máquina

### ¿Por qué híbrido?

| Aspecto | JWT | API Keys |
|---------|-----|----------|
| **Usuarios** | Humanos (navegador/app) | Sistemas/servicios externos |
| **Duración** | Corta (15min) + Refresh (7 días) | Larga o permanente |
| **Renovación** | Automática | Manual |
| **Casos de uso** | Login, Portal Organismos | Email/SMS, Webhooks, Scripts |

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                  SISTEMA DE AUTENTICACIÓN                    │
│                   Banque Alimentaire PRO                     │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
          ┌─────▼─────┐              ┌─────▼─────┐
          │    JWT    │              │ API Keys  │
          │ (Humanos) │              │ (M2M)     │
          └───────────┘              └───────────┘
                │                           │
    ┌───────────┼───────────┐              │
    │           │           │              │
┌───▼───┐  ┌───▼───┐  ┌───▼────┐    ┌────▼─────┐
│ Login │  │Portal │  │ Mobile │    │Email/SMS │
│  Web  │  │Organi.│  │   App  │    │Webhooks  │
└───────┘  └───────┘  └────────┘    └──────────┘
```

---

## 🎫 JWT (JSON Web Tokens)

### Características

- **Access Token**: Válido por 15 minutos
- **Refresh Token**: Válido por 7 días
- **Auto-refresh**: Renovación automática antes de expirar
- **Firmado**: Con secreto único del sistema
- **Información incluida**: userId, username, email, role, permissions

### Flujo de Autenticación

```
1. Usuario ingresa credenciales
2. Sistema valida contra base de datos
3. Se generan Access Token + Refresh Token
4. Tokens se guardan en localStorage/sessionStorage
5. Access Token se incluye en cada request (header)
6. Cuando expira, se usa Refresh Token para renovar
7. Logout revoca ambos tokens
```

### Ejemplo de Token JWT

```json
{
  "userId": "user_1234567890",
  "username": "David",
  "email": "david@banque.local",
  "role": "Desarrollador",
  "permissions": ["*"],
  "type": "access",
  "iat": 1678901234,
  "exp": 1678902134
}
```

### Usuarios JWT

1. **David (Desarrollador)**
   - Usuario: `David`
   - Contraseña: `Lettycia26`
   - Permisos: Acceso total
   - Estado: SIEMPRE activo

2. **Admin (Administrador)**
   - Usuario: `admin`
   - Contraseña: `Admin2024!`
   - Permisos: Administración completa

3. **Portal Organismos**
   - Clave de acceso: `CAC-456ABC`
   - Permisos limitados: read:ofertas, write:comandas

---

## 🔑 API Keys

### Características

- **Formato**: `ba_[timestamp]_[random32chars]`
- **Permisos granulares**: Por recurso (read/write)
- **Rate limiting**: Límites por minuto/hora/día
- **IP Whitelist**: Restricción por IP (opcional)
- **Sin expiración** (configurable)

### Permisos Disponibles

```typescript
type APIPermission = 
  | 'read:inventory'      // Leer inventario
  | 'write:inventory'     // Modificar inventario
  | 'read:orders'         // Leer comandas
  | 'write:orders'        // Crear/modificar comandas
  | 'read:organisms'      // Leer organismos
  | 'write:organisms'     // Crear/modificar organismos
  | 'read:transport'      // Leer transporte
  | 'write:transport'     // Modificar transporte
  | 'read:reports'        // Generar reportes
  | 'read:users'          // Leer usuarios
  | 'write:users'         // Crear/modificar usuarios
  | 'admin:all';          // Acceso total
```

### Rate Limits por Defecto

| Período | Límite |
|---------|--------|
| Por minuto | 60 requests |
| Por hora | 1,000 requests |
| Por día | 10,000 requests |

### Ejemplo de Uso

```bash
# Headers para requests API
curl -H "X-API-Key: ba_lzc8x3_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" \
     https://banque-alimentaire.local/api/v1/inventory
```

---

## 🔄 Comparación y Casos de Uso

### JWT - Autenticación de Usuarios

✅ **Usar JWT cuando:**
- Login de usuarios en navegador web
- Aplicación móvil (PWA en FASE 2)
- Portal público de organismos
- Sesiones interactivas con usuario humano
- Necesitas renovación automática de sesión

❌ **NO usar JWT para:**
- Scripts automatizados
- Servicios externos (email, SMS)
- Webhooks
- Integraciones de terceros

### API Keys - Integraciones

✅ **Usar API Keys cuando:**
- Integración con servicios de email (FASE 2)
- Integración con servicios SMS (FASE 2)
- Webhooks de notificaciones
- Scripts de automatización
- Servicios de terceros que consumen tu API

❌ **NO usar API Keys para:**
- Login de usuarios finales
- Aplicaciones web interactivas
- Portal de organismos

---

## 💻 Implementación Técnica

### Estructura de Archivos

```
src/
├── app/
│   └── utils/
│       ├── jwtManager.ts         # Gestión de JWT
│       └── apiKeyManager.ts      # Gestión de API Keys
├── contexts/
│   └── AuthContext.tsx           # Contexto de autenticación
└── components/
    ├── JWTSessionInfo.tsx        # Info de sesión JWT
    └── pages/
        ├── Login.tsx             # Login con JWT
        ├── APIKeysPage.tsx       # Gestión de API Keys
        └── GestionAutenticacion.tsx # Panel híbrido
```

### Funciones Principales JWT

```typescript
// Generar tokens
generarTokens(usuario) → { accessToken, refreshToken, expiresIn }

// Validar token
validarToken(token) → { valid, expired, payload, error }

// Refrescar sesión
refrescarAccessToken(refreshToken) → AuthTokens | null

// Verificar autenticación
estaAutenticado() → boolean

// Cerrar sesión
cerrarSesion() → void

// Verificar permisos
tienePermiso(permiso: string) → boolean
```

### Funciones Principales API Keys

```typescript
// Crear API Key
crearAPIKey(data) → APIKey

// Validar API Key
validarAPIKey(apiKey) → { isValid, key, error }

// Registrar uso
registrarUsoAPIKey(apiKey) → boolean

// Verificar rate limit
verificarRateLimit(apiKey) → { allowed, remaining, resetIn }

// Revocar API Key
revocarAPIKey(keyId) → boolean
```

---

## 📖 Guía de Uso

### Para Desarrolladores

#### 1. Usar JWT en Login

```typescript
import { useAuth } from '../contexts/AuthContext';

function MiComponente() {
  const { login, usuario, logout } = useAuth();

  const handleLogin = async () => {
    const exito = await login('David', 'Lettycia26', true);
    if (exito) {
      console.log('Login exitoso:', usuario);
    }
  };

  return (
    <button onClick={handleLogin}>Iniciar Sesión</button>
  );
}
```

#### 2. Proteger Rutas con JWT

```typescript
import { withAuth } from '../contexts/AuthContext';

// Componente protegido
const PaginaProtegida = withAuth(MiComponente);

// O con permisos específicos
import { withPermission } from '../contexts/AuthContext';
const PaginaAdmin = withPermission(MiComponente, 'admin:all');
```

#### 3. Crear API Key

```typescript
import { crearAPIKey } from '../utils/apiKeyManager';

const nuevaKey = crearAPIKey({
  name: 'Email Service Integration',
  description: 'Para envío de emails automáticos',
  createdBy: 'David',
  permissions: ['read:organisms', 'write:orders'],
  expiresInDays: 365, // 1 año
  rateLimit: {
    requestsPerMinute: 30,
    requestsPerHour: 500,
  },
  ipWhitelist: ['192.168.1.100', '10.0.0.50']
});

console.log('API Key:', nuevaKey.key);
// ba_lzc8x3_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### Para Administradores

#### Acceder a la Gestión

1. Login como admin o David
2. Ir a **Configuración** > **API Keys**
3. O visitar **Gestion d'Authentification**

#### Crear Nueva API Key

1. Click en "Créer une nouvelle clé API"
2. Completar formulario:
   - Nombre descriptivo
   - Descripción del uso
   - Seleccionar permisos necesarios
   - Configurar rate limits
   - (Opcional) IP whitelist
3. Guardar y copiar la clave generada
   
⚠️ **Importante**: La clave completa solo se muestra UNA VEZ

#### Monitorear Uso

- Dashboard muestra estadísticas en tiempo real
- Top consumidores de API
- Alertas de rate limit excedido
- Logs de acceso (FASE 2)

---

## 🔒 Seguridad

### Buenas Prácticas JWT

✅ **Hacer:**
- Usar HTTPS en producción
- Guardar tokens en localStorage/sessionStorage
- Implementar logout en todas las pestañas
- Validar tokens en cada request importante
- Revocar tokens al cambiar contraseña

❌ **NO hacer:**
- Guardar tokens en cookies sin HttpOnly
- Exponer tokens en URL
- Compartir refresh tokens entre dispositivos
- Usar secretos débiles

### Buenas Prácticas API Keys

✅ **Hacer:**
- Usar permisos mínimos necesarios
- Rotar claves regularmente
- Implementar IP whitelist cuando sea posible
- Monitorear uso anormal
- Revocar claves comprometidas inmediatamente

❌ **NO hacer:**
- Compartir API Keys públicamente
- Usar la misma key para múltiples servicios
- Ignorar alertas de rate limit
- Hardcodear keys en código fuente

### Secretos del Sistema

```typescript
// ⚠️ EN PRODUCCIÓN: USAR VARIABLES DE ENTORNO

// JWT Secrets (actual - DEMO)
JWT_SECRET = 'banque_alimentaire_secret_key_2026_ultra_secure_pro_v5'
REFRESH_SECRET = 'banque_alimentaire_refresh_secret_key_2026_ultra_secure_pro_v5'

// En producción:
JWT_SECRET = process.env.JWT_SECRET
REFRESH_SECRET = process.env.REFRESH_SECRET
```

---

## 🛠️ Troubleshooting

### Problemas Comunes JWT

#### "Token expirado"

**Causa**: Access token de 15 minutos expiró  
**Solución**: El sistema auto-refresca. Si falla, re-login

```typescript
const { refrescarSesion } = useAuth();
await refrescarSesion();
```

#### "Refresh token inválido"

**Causa**: Refresh token revocado o expirado (7 días)  
**Solución**: Hacer logout y login nuevamente

#### "No se puede refrescar la sesión"

**Causa**: Refresh token corrupto o eliminado  
**Solución**: 
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Problemas Comunes API Keys

#### "API Key no encontrada"

**Causa**: Key eliminada o revocada  
**Solución**: Generar nueva API Key

#### "Rate limit excedido"

**Causa**: Demasiadas requests en poco tiempo  
**Solución**: Esperar o solicitar aumento de límite

```typescript
const { allowed, remaining, resetIn } = verificarRateLimit(apiKey);
console.log(`Esperar ${resetIn} segundos`);
```

#### "Permiso denegado"

**Causa**: API Key sin permisos necesarios  
**Solución**: Actualizar permisos de la key

---

## 📊 Estadísticas y Monitoreo

### JWT

```typescript
import { obtenerEstadisticasJWT } from './utils/jwtManager';

const stats = obtenerEstadisticasJWT();
// {
//   tokenActivo: true,
//   tiempoRestante: 850, // segundos
//   usuario: 'David',
//   rol: 'Desarrollador',
//   ultimoAcceso: '2026-03-08T10:30:00Z'
// }
```

### API Keys

```typescript
import { obtenerEstadisticasAPI } from './utils/apiKeyManager';

const stats = obtenerEstadisticasAPI();
// {
//   totalKeys: 5,
//   activeKeys: 3,
//   expiredKeys: 1,
//   totalRequests: 12450,
//   requestsToday: 234,
//   topConsumers: [...]
// }
```

---

## 🚀 Próximos Pasos (FASE 2)

### JWT
- [ ] Implementar en PWA (aplicación móvil)
- [ ] Sistema de 2FA (autenticación de dos factores)
- [ ] Fingerprinting de dispositivos
- [ ] Logs de auditoría de sesiones

### API Keys
- [ ] Integración con servicio de Email
- [ ] Integración con servicio de SMS
- [ ] Webhooks para notificaciones
- [ ] Dashboard de analytics avanzado
- [ ] Exportación de logs de uso

---

## 📝 Changelog

### v5.0 PRO (8 Marzo 2026)
- ✅ Implementación inicial de JWT
- ✅ Implementación de API Keys
- ✅ Sistema híbrido JWT + API Keys
- ✅ Contexto de autenticación unificado
- ✅ Auto-refresh de tokens JWT
- ✅ Rate limiting para API Keys
- ✅ Dashboard de gestión
- ✅ Documentación completa

---

## 👥 Soporte

Para problemas o preguntas:
- **Desarrollador Principal**: David
- **Email**: support@banque-alimentaire.local
- **Documentación**: `/SISTEMA_AUTENTICACION_HIBRIDO.md`

---

**Sistema desarrollado con ❤️ para Banque Alimentaire**  
*Versión 5.0 PRO - Autenticación Híbrida JWT + API Keys*
