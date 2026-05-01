# 🔒 Guía de Seguridad - Banque Alimentaire

## Configuración de Seguridad Implementada

### 1. Headers de Seguridad HTTP

Todos los archivos de configuración (`netlify.toml`, `vercel.json`, `.htaccess`) incluyen:

#### X-Frame-Options
```
X-Frame-Options: SAMEORIGIN
```
**Propósito:** Prevenir ataques de clickjacking

#### X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```
**Propósito:** Prevenir MIME type sniffing

#### X-XSS-Protection
```
X-XSS-Protection: 1; mode=block
```
**Propósito:** Habilitar protección contra XSS en navegadores antiguos

#### Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```
**Propósito:** Controlar información del referrer enviada

#### Permissions-Policy
```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```
**Propósito:** Deshabilitar permisos no necesarios

---

## 2. Variables de Entorno

### ⚠️ NUNCA comitear archivos .env

**Archivos sensibles (NO comitear):**
- `.env`
- `.env.local`
- `.env.development.local`

**Archivos seguros (SÍ comitear):**
- `.env.example` (template sin valores reales)
- `.env.production` (si no contiene credenciales)

### Variables Seguras vs Sensibles

**✅ Seguras (pueden estar en código):**
```env
VITE_APP_MODE=production
VITE_ENABLE_SAMPLE_DATA=false
VITE_DEFAULT_LANGUAGE=fr
```

**❌ Sensibles (NUNCA en código):**
```env
VITE_API_KEY=xxx
VITE_DATABASE_PASSWORD=xxx
VITE_SECRET_KEY=xxx
```

---

## 3. Gestión de Credenciales

### Credenciales por Defecto (CAMBIAR EN PRODUCCIÓN)

**Sistema Principal:**
```
Usuario: David / Admin
Contraseña: Lettycia26
```

**Portal Público:**
```
Clave: CAC-456ABC
```

### ⚠️ IMPORTANTE: Cambiar Credenciales

Antes de lanzar en producción real:

1. **Cambiar contraseñas hardcodeadas** en `/src/app/data/usuarios.ts`
2. **Regenerar claves de acceso** para organismos
3. **Implementar sistema de autenticación real** con backend

---

## 4. Almacenamiento de Datos

### LocalStorage

El sistema usa `localStorage` para persistencia de datos.

**⚠️ Limitaciones de seguridad:**
- Los datos NO están encriptados
- Son accesibles desde JavaScript
- Persisten en el navegador del usuario

**Para producción con datos sensibles:**
- Implementar backend (Supabase, Firebase)
- Usar autenticación con JWT
- Encriptar datos sensibles

### NO Almacenar en LocalStorage:
- ❌ Contraseñas en texto plano
- ❌ Tokens de autenticación sin encriptar
- ❌ Información personal sensible (PII)
- ❌ Datos financieros
- ❌ Información médica

### SÍ Almacenar en LocalStorage:
- ✅ Preferencias de usuario (idioma, tema)
- ✅ Estado de UI
- ✅ Datos no sensibles temporales
- ✅ Caché de datos públicos

---

## 5. HTTPS

### Configuración HTTPS

**Vercel/Netlify:**
- ✅ HTTPS automático con certificado SSL gratuito
- ✅ Renovación automática
- ✅ Redirect HTTP → HTTPS automático

**Servidor Propio:**

#### Opción A: Let's Encrypt (Recomendado)
```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tudominio.com

# Renovación automática (ya configurada)
sudo certbot renew --dry-run
```

#### Opción B: Certificado Comercial
1. Comprar certificado de CA confiable
2. Instalar según proveedor
3. Configurar renovación manual

### Verificar HTTPS
```bash
# Test SSL/TLS
curl -I https://tudominio.com

# Test detallado
openssl s_client -connect tudominio.com:443
```

---

## 6. Content Security Policy (CSP)

### CSP Básico (Opcional pero Recomendado)

Agregar a headers:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;
```

**⚠️ Nota:** `unsafe-inline` y `unsafe-eval` son necesarios para React/Vite pero reducen la seguridad. En producción avanzada, considerar eliminarlos.

---

## 7. Auditoría de Seguridad

### Verificación Regular

```bash
# Auditoría de dependencias npm
npm audit

# Reparación automática
npm audit fix

# Reparación forzada (cuidado con breaking changes)
npm audit fix --force

# Ver vulnerabilidades detalladas
npm audit --json
```

### Actualizar Dependencias

```bash
# Ver paquetes desactualizados
npm outdated

# Actualizar a versiones seguras
npm update

# Actualizar major versions (revisar changelog)
npm install package@latest
```

---

## 8. CORS (Cross-Origin Resource Sharing)

Si integras backend:

### Backend Node.js/Express
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'https://tudominio.com',
  credentials: true
}));
```

### Backend con Headers
```
Access-Control-Allow-Origin: https://tudominio.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
```

---

## 9. Rate Limiting

Para prevenir abuso, implementar rate limiting en backend:

### Ejemplo con Express
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por ventana
});

app.use('/api/', limiter);
```

---

## 10. Backup y Recuperación

### Estrategia de Backups

**Datos en LocalStorage:**
- Los usuarios deben exportar regularmente
- Implementar función "Exportar datos completos"
- Guardar backups en servidor seguro

**Código:**
- ✅ Git repository (GitHub/GitLab)
- ✅ Branches de backup
- ✅ Tags para versiones estables

**Base de Datos (si se implementa):**
- Backups diarios automáticos
- Retención de 30 días mínimo
- Backups offsite

---

## 11. Logging y Monitoreo

### Logs de Seguridad

**Eventos a loggear:**
- Intentos de login fallidos
- Cambios de contraseñas
- Accesos no autorizados
- Modificaciones de datos críticos

### Herramientas Recomendadas

**Error Tracking:**
- Sentry (https://sentry.io)
- Rollbar (https://rollbar.com)

**Uptime Monitoring:**
- UptimeRobot (https://uptimerobot.com)
- Pingdom (https://pingdom.com)

**Security Scanning:**
- OWASP ZAP
- Snyk (https://snyk.io)

---

## 12. Checklist de Seguridad Pre-Deploy

- [ ] HTTPS configurado y funcionando
- [ ] Headers de seguridad implementados
- [ ] Variables sensibles en .env (no en código)
- [ ] .env en .gitignore
- [ ] Credenciales por defecto cambiadas
- [ ] npm audit sin vulnerabilidades críticas
- [ ] Dependencias actualizadas
- [ ] CSP configurado (si aplica)
- [ ] CORS configurado correctamente (si aplica)
- [ ] Rate limiting implementado (si aplica)
- [ ] Backups configurados
- [ ] Monitoreo implementado
- [ ] Plan de respuesta a incidentes documentado

---

## 13. Respuesta a Incidentes

### Si detectas una vulnerabilidad:

1. **No pánico** - Evalúa la severidad
2. **Documenta** - Qué, cuándo, cómo
3. **Contiene** - Deshabilita funcionalidad afectada si es necesario
4. **Repara** - Actualiza código/dependencias
5. **Deploy** - Despliega fix lo antes posible
6. **Comunica** - Informa a usuarios si es necesario
7. **Aprende** - Documenta para prevenir futuros incidentes

---

## 14. Recursos Adicionales

**Guías de Seguridad:**
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- MDN Web Security: https://developer.mozilla.org/en-US/docs/Web/Security

**Herramientas:**
- Security Headers: https://securityheaders.com
- SSL Labs: https://www.ssllabs.com/ssltest/

**Comunidades:**
- OWASP Community
- r/netsec
- Stack Overflow Security

---

## 📞 Contacto para Reportar Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, por favor repórtala a:

**Email:** security@banquealimentaire.ca  
**Respuesta:** Dentro de 48 horas

**Por favor incluye:**
- Descripción detallada
- Pasos para reproducir
- Impacto potencial
- Sugerencia de fix (opcional)

---

**Última Actualización:** Febrero 2026  
**Versión:** 2.1  
**Responsable:** Equipo de Desarrollo
