# 🛡️ Sistema de Protección Total de Datos

## Resumen

El sistema ahora cuenta con **protección total** contra eliminación accidental de datos, incluyendo:

- ✅ Protección contra `localStorage.clear()`
- ✅ Protección contra `localStorage.removeItem()` en claves críticas
- ✅ Bloqueo de combinaciones de teclas peligrosas (Ctrl+Delete, Ctrl+Shift+Delete, etc.)
- ✅ Backups automáticos antes de cerrar pestaña
- ✅ Monitoreo continuo de cambios en localStorage
- ✅ Funciones de consola para diagnóstico y restauración

## Características

### 1. Protección de localStorage

El sistema sobrescribe las funciones nativas de localStorage para prevenir eliminaciones:

```javascript
// ❌ BLOQUEADO - No hace nada
localStorage.clear();

// ❌ BLOQUEADO - Si la clave es crítica
localStorage.removeItem('productos_inventario');

// ✅ PERMITIDO - Solo claves no críticas
localStorage.removeItem('temp_cache');
```

### 2. Claves Protegidas

Las siguientes claves están protegidas y **NO PUEDEN** ser eliminadas:

- `sistema_con_datos_reales`
- `limpieza_completa_ejecutada`
- `productos_inventario`
- `categorias_inventario`
- `subcategorias_inventario`
- `organismos`
- `usuarios_internos`
- `usuarios_sistema`
- `comandas`
- `sesion_usuario`
- `departamentos_banco_alimentos`
- `contactos_departamentos`
- `benevoles_data`
- `vehiculos_transporte`
- `choferes_transporte`
- `configuracion_branding`
- `productos_prs`
- `unidades_medida`
- Todas las claves que empiezan con `backup_`

### 3. Combinaciones de Teclas Bloqueadas

Las siguientes combinaciones están interceptadas y bloqueadas:

- `Ctrl + Delete` (o `Cmd + Delete` en Mac)
- `Ctrl + Shift + Delete` (o `Cmd + Shift + Delete` en Mac)
- `Ctrl + Shift + R` (Recarga forzada del navegador)

Cuando intentas usar estas combinaciones, verás una notificación indicando que la acción fue bloqueada.

### 4. Backups Automáticos

El sistema crea backups automáticamente en varios momentos:

- **Al iniciar la aplicación**: Backup inicial diario
- **Antes de cerrar pestaña**: Backup de emergencia con timestamp
- **Al detectar cambios sospechosos**: Backup de alerta

### 5. Monitoreo Continuo

El sistema verifica cada 5 segundos si hay reducciones significativas en localStorage (más de 5 claves eliminadas) y genera alertas automáticas.

## Funciones de Consola

Abre la consola del navegador (F12) y usa estas funciones:

### Ver Estado de Protección

```javascript
proteccionDatos.info()
```

Muestra:
- ✅ Estado de todas las protecciones
- 📊 Resumen de características activas

### Verificar Sistema

```javascript
proteccionDatos.verificar()
```

Muestra:
- 📊 Total de claves en localStorage
- 🔒 Número de claves protegidas
- 💾 Número de backups disponibles

### Restaurar Backup

```javascript
// Ver backups disponibles
proteccionDatos.restaurarBackup()

// Restaurar un backup específico (usa el timestamp mostrado)
proteccionDatos.restaurarBackup('2026-03-16T10:30:45.123Z')
```

## Notificaciones Visuales

El sistema muestra notificaciones en pantalla cuando:

- 🛡️ Se intenta borrar localStorage (fondo rojo)
- ⚠️ Se bloquea una combinación de teclas (fondo amarillo)

Las notificaciones aparecen en la esquina superior derecha y desaparecen automáticamente después de 3 segundos.

## Cómo Funciona

1. **Al cargar la aplicación**: Se ejecuta `inicializarProteccionDatos()` que activa todas las protecciones
2. **Protección activa**: Todas las funciones destructivas están interceptadas
3. **Backups continuos**: Se crean automáticamente en momentos clave
4. **Monitoreo constante**: El sistema vigila cambios sospechosos
5. **Recuperación fácil**: Los backups permiten restaurar datos si algo falla

## Seguridad Máxima

El sistema está diseñado con múltiples capas de protección:

```
┌─────────────────────────────────────┐
│  Capa 1: Protección localStorage   │
├─────────────────────────────────────┤
│  Capa 2: Bloqueo de teclas         │
├─────────────────────────────────────┤
│  Capa 3: Backups automáticos       │
├─────────────────────────────────────┤
│  Capa 4: Monitoreo continuo        │
├─────────────────────────────────────┤
│  Capa 5: Sistema de restauración   │
└─────────────────────────────────────┘
```

## Importante

⚠️ **NUNCA** elimines manualmente las claves que empiezan con:
- `sistema_con_datos_reales`
- `proteccion_datos_activa`
- `backup_`

Estas son críticas para el funcionamiento del sistema de protección.

## Soporte

Si necesitas ayuda o encuentras algún problema:

1. Abre la consola del navegador (F12)
2. Ejecuta `proteccionDatos.info()` para ver el estado
3. Ejecuta `proteccionDatos.verificar()` para diagnóstico completo

---

**Última actualización**: 16/03/2026
**Versión del Sistema**: 5.0 PRO con Protección Total de Datos

## Documentación Relacionada

- 📄 [Sistema de Actualización Automática de Versiones](./ACTUALIZACION_AUTOMATICA.md)
- 🔒 Sistema de Protección Total de Datos (este documento)