# 🔒 INSTRUCCIONES PARA RESTAURAR BACKUP SIN PERDER DATOS

## 📋 PROCEDIMIENTO CORRECTO - PASO A PASO

### 🔴 PASO 1: ANTES DE RESTAURAR EL BACKUP

Abre la consola del navegador (F12) y ejecuta:

```javascript
proteccionEmergencia()
```

Esto marcará tu sistema como protegido **ANTES** de hacer cualquier cosa.

---

### 🔴 PASO 2: RESTAURAR EL BACKUP

1. Ve a **Configuración** → **Gestion des Sauvegardes**
2. Haz clic en **"Restaurer"** en la sección naranja
3. Selecciona tu archivo de backup `.json`
4. Confirma la restauración

---

### 🔴 PASO 3: ESPERAR 5 SEGUNDOS (MUY IMPORTANTE)

**NO RECARGUES LA PÁGINA INMEDIATAMENTE**

Después de restaurar, verás en la consola:

```
🔒🔒🔒 ═══════════════════════════════════════════════════════════
🔒🔒🔒 PROTECCIÓN POST-RESTAURACIÓN ACTIVADA
🔒🔒🔒 ═══════════════════════════════════════════════════════════

✅ NIVEL 1: Flags de protección establecidos
✅ NIVEL 2: Flag de restauración establecido
✅ NIVEL 3: Contador de protección = X

🛡️ PROTECCIÓN COMPLETA ACTIVADA

📋 INSTRUCCIONES IMPORTANTES:
   1️⃣  NO recargue la página inmediatamente
   2️⃣  Espere 3-5 segundos para que se guarden los flags
   3️⃣  Luego puede recargar la página con F5
   4️⃣  Sus datos estarán 100% protegidos
```

**ESPERA 5 SEGUNDOS** para que localStorage guarde todos los flags de protección.

---

### 🔴 PASO 4: VERIFICAR PROTECCIÓN

En la consola, ejecuta:

```javascript
verificarRestauracionProtegida()
```

Debes ver:

```
✅ RESULTADO: RESTAURACIÓN PROTEGIDA CORRECTAMENTE
✅ Puede recargar la página sin preocupaciones
```

Si ves esto, estás 100% protegido y puedes continuar al siguiente paso.

---

### 🔴 PASO 5: RECARGAR LA PÁGINA

Ahora SÍ puedes recargar la página:

- Presiona **F5**
- O haz clic en el botón de recargar del navegador

---

### 🔴 PASO 6: VERIFICAR QUE TODO FUNCIONA

Después de recargar, deberías ver en la consola:

```
🔒🔒🔒 PROTECCIÓN MÁXIMA ACTIVADA
🛡️ Sistema marcado como CON DATOS REALES
🛡️ Limpieza automática PERMANENTEMENTE DESHABILITADA
✅ Sistema protegido - Limpieza automática omitida
```

**NUNCA deberías ver:**
```
🗑️ EJECUTANDO LIMPIEZA COMPLETA DEL SISTEMA
```

---

## 🆘 SI LOS DATOS SE BORRARON DE NUEVO

Si a pesar de seguir estos pasos, los datos se borraron, ejecuta INMEDIATAMENTE:

### Solución de Emergencia:

1. **NO CIERRES** el navegador
2. **NO RECARGUES** la página
3. Abre la consola (F12) y ejecuta:

```javascript
// Ver qué claves existen en localStorage
Object.keys(localStorage).forEach(key => console.log(key))

// Ver si hay datos guardados
localStorage.getItem('organismos_banco_alimentos')
localStorage.getItem('banco_alimentos_usuarios')
localStorage.getItem('banco_alimentos_comandas')
```

4. Toma una **captura de pantalla** de todo lo que veas
5. **NO RECARGUES** hasta que podamos diagnosticar el problema

---

## 📊 VERIFICACIÓN POST-RESTAURACIÓN

Después de recargar exitosamente, verifica que tus datos están presentes:

### En la consola:

```javascript
mostrarResumenRestauracion()
```

Deberías ver algo como:

```
📊 ═══════════════════════════════════════════════════════════
📊 RESUMEN DE DATOS RESTAURADOS
📊 ═══════════════════════════════════════════════════════════

👥 USUARIOS: 5 registros
🏢 ORGANISMOS: 12 registros
📦 COMANDAS: 8 registros
📊 PRODUCTOS: 45 registros
📈 MOVIMIENTOS: 23 registros
🚚 VEHÍCULOS: 3 registros
🗺️ RUTAS: 5 registros
🚛 TRANSPORTES: 7 registros
👨‍👩‍👧‍👦 CONTACTOS: 15 registros
🙋 BÉNÉVOLES: 10 registros
💳 IDS DIGITALES: 12 registros

📊 TOTAL: 145 registros restaurados
```

### En la interfaz:

1. Ve a **Organismos** → deberías ver tus organismos
2. Ve a **Comandas** → deberías ver tus comandas
3. Ve a **Inventario** → deberías ver tus productos
4. Ve a **Departamentos** → deberías ver tus bénévoles asignados

---

## 🔒 FLAGS DE PROTECCIÓN

El sistema utiliza **5 flags** en localStorage para proteger tus datos:

1. **`sistema_con_datos_reales`** = `'true'`
   - Indica que el sistema tiene datos reales del usuario

2. **`limpieza_completa_ejecutada`** = `'true'`
   - Indica que la limpieza ya se ejecutó

3. **`limpieza_completa_fecha`** = `'ISO timestamp'`
   - Fecha de la última "limpieza"

4. **`backup_restaurado`** = `'true'`
   - Indica que se restauró un backup

5. **`proteccion_contador`** = `'número'`
   - Contador de veces que se activó la protección

### Verificar flags manualmente:

```javascript
console.log('sistema_con_datos_reales:', localStorage.getItem('sistema_con_datos_reales'));
console.log('limpieza_completa_ejecutada:', localStorage.getItem('limpieza_completa_ejecutada'));
console.log('backup_restaurado:', localStorage.getItem('backup_restaurado'));
console.log('proteccion_contador:', localStorage.getItem('proteccion_contador'));
```

**TODOS** deben estar en `'true'` (excepto el contador que es un número).

---

## ⚠️ QUÉ NO HACER

❌ **NO** recargues inmediatamente después de restaurar
❌ **NO** cierres el navegador sin verificar primero
❌ **NO** limpies el cache del navegador
❌ **NO** uses modo incógnito (los datos no persisten)
❌ **NO** cambies de navegador sin hacer backup

---

## ✅ CHECKLIST COMPLETO

Antes de restaurar un backup:

- [ ] He ejecutado `proteccionEmergencia()` en la consola
- [ ] He descargado un backup actual como respaldo
- [ ] Tengo la consola abierta para ver los mensajes

Durante la restauración:

- [ ] He seleccionado el archivo de backup correcto
- [ ] He confirmado la restauración
- [ ] Veo mensajes de protección en la consola

Después de restaurar:

- [ ] He esperado 5 segundos SIN recargar
- [ ] He ejecutado `verificarRestauracionProtegida()`
- [ ] He visto el mensaje de éxito
- [ ] Ahora recargo la página (F5)

Después de recargar:

- [ ] Veo "🔒🔒🔒 PROTECCIÓN MÁXIMA ACTIVADA"
- [ ] NO veo "🗑️ EJECUTANDO LIMPIEZA"
- [ ] Mis datos están presentes en la interfaz
- [ ] He ejecutado `mostrarResumenRestauracion()` para verificar

---

## 🎯 RESUMEN RÁPIDO

```
1. proteccionEmergencia()     → Proteger antes de restaurar
2. Restaurar backup            → Desde Configuración
3. ESPERAR 5 segundos          → NO recargar todavía
4. verificarRestauracionProtegida() → Verificar que está OK
5. F5 para recargar            → Ahora sí recargar
6. Verificar datos presentes   → Comprobar en interfaz
```

---

## 📞 SI NECESITAS AYUDA

Si después de seguir TODOS estos pasos los datos se siguen borrando:

1. Toma capturas de pantalla de la consola
2. Anota exactamente qué pasos seguiste
3. No cierres el navegador
4. No borres el localStorage
5. Contacta al soporte técnico con la información

---

**Fecha de creación**: 11 de marzo de 2025  
**Versión**: 5.0 PRO - Protección Máxima  
**Estado**: ✅ ACTIVO
