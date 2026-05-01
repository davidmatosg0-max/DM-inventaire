# 🔍 GUÍA RÁPIDA - VERIFICACIÓN DE SINCRONIZACIÓN PRS

## 📋 RESUMEN

La sincronización entre productos PRS y el formulario de nueva entrada está **completamente implementada y funcionando**. Esta guía te muestra cómo verificarlo en tiempo real.

---

## ✅ VERIFICACIÓN EN 3 PASOS

### Paso 1: Abrir la Consola del Navegador

1. Abre tu aplicación en el navegador
2. Presiona **F12** o clic derecho → **Inspeccionar**
3. Ve a la pestaña **Console**

---

### Paso 2: Ejecutar Verificación Completa

En la consola, ejecuta:

```javascript
verificarSincronizacionPRS()
```

**Resultado esperado:**
```
🔍 ===== VERIFICACIÓN DE SINCRONIZACIÓN PRS =====

📦 Paso 1: Verificando productos en localStorage...
   ✅ X productos encontrados

🎯 Paso 2: Filtrando productos PRS...
   ✅ X productos con esPRS === true
   [Tabla con detalles de productos PRS]

🔎 Paso 3: Buscando productos PRS sin marcar...
   ✅ No se encontraron productos PRS sin marcar

🎨 Paso 4: Verificando programa de entrada PRS...
   ✅ Programa PRS activo: "Programme de Récupération Spéciale"

🔧 Paso 5: Verificando integridad de datos...
   ✅ Integridad de datos correcta

📊 ===== RESUMEN DE VERIFICACIÓN =====

📈 Estadísticas:
   • Total de productos: X
   • Productos PRS marcados: X
   • Productos PRS sin marcar: 0
   • Programa PRS existe: Sí

🏁 Estado final:
   ✅✅✅ SINCRONIZACIÓN FUNCIONANDO CORRECTAMENTE ✅✅✅
```

---

### Paso 3: Listar Productos PRS

Para ver todos los productos PRS con detalles:

```javascript
listarProductosPRS()
```

**Resultado esperado:**
```
📦 ===== LISTADO DE PRODUCTOS PRS =====

✅ Total de productos PRS: X

📂 Fruits et Légumes PRS (X productos)
[Tabla con detalles: Código, Nombre, Subcategoría, Unidad, Peso, Stock]

📂 Viandes et Poissons PRS (X productos)
[Tabla con detalles: Código, Nombre, Subcategoría, Unidad, Peso, Stock]
```

---

## 🔧 FUNCIONES ADICIONALES

### Migración Manual (Si es necesario)

Si por alguna razón hay productos PRS sin la marca `esPRS: true`:

```javascript
migrarProductosPRSManual()
```

Esta función:
- Detecta automáticamente productos PRS por nombre, categoría o código
- Actualiza `esPRS: true` en todos ellos
- Guarda los cambios en localStorage
- Emite evento de actualización

---

## 🎯 VERIFICACIÓN VISUAL EN LA INTERFAZ

### En el Módulo de Configuración

1. Ve a **Configuración**
2. Selecciona el tab **"Productos PRS"**
3. Verifica que:
   - ✅ Se muestra el contador de productos PRS
   - ✅ Aparece la lista de productos PRS
   - ✅ Cada producto tiene su icono, categoría y subcategoría

### En el Formulario de Nueva Entrada

1. Ve a **Inventario** → **Nueva Entrada**
2. Selecciona **Tipo de Entrada: "PRS"**
3. Verifica que:
   - ✅ Aparece el selector de productos PRS con borde purple intenso
   - ✅ Badge "OBLIGATOIRE" está visible y pulsando
   - ✅ Se muestra el contador: "X produits"
   - ✅ Al buscar, filtra correctamente los productos
   - ✅ Al seleccionar un producto, auto-rellena los campos

### Flujo Completo

1. **Crear producto PRS en Configuración:**
   - Configuración → Productos PRS → Nuevo Produit PRS
   - Rellena los campos y guarda

2. **Verificar sincronización en FormularioEntrada:**
   - Inventario → Nueva Entrada
   - Tipo: "PRS"
   - El producto debe aparecer inmediatamente en el selector

3. **Seleccionar y usar:**
   - Click en el producto
   - Campos auto-rellenados: categoría, subcategoría, unidad, peso
   - Completa cantidad y observaciones
   - Guarda la entrada

---

## 📊 INDICADORES DE ÉXITO

### ✅ Sistema Funcionando Correctamente

- ✅ Verificación en consola muestra: "SINCRONIZACIÓN FUNCIONANDO CORRECTAMENTE"
- ✅ Productos PRS se muestran en Configuración
- ✅ Productos PRS aparecen en FormularioEntrada cuando tipo = "PRS"
- ✅ Auto-relleno de campos funciona
- ✅ Validación obligatoria funciona (no permite guardar sin producto PRS)

### ⚠️ Advertencias Normales

- ⚠️ "No hay productos PRS en el sistema" → Solución: Crear productos PRS en Configuración
- ⚠️ "Productos PRS sin marcar: X" → Solución: Ejecutar `migrarProductosPRSManual()`

### ❌ Problemas que Requieren Atención

- ❌ "Programa PRS no encontrado" → Verificar que existe programa con código "PRS"
- ❌ "Productos con errores de estructura" → Revisar integridad de datos

---

## 🆘 RESOLUCIÓN DE PROBLEMAS

### Problema: No se muestran productos PRS en el formulario

**Solución:**
1. Abre la consola
2. Ejecuta: `verificarSincronizacionPRS()`
3. Si muestra productos sin marcar, ejecuta: `migrarProductosPRSManual()`
4. Recarga el formulario

### Problema: Los productos PRS aparecen en entradas normales

**Solución:**
- Esto NO debería pasar. El filtrado es estricto (`esPRS === true`)
- Si ocurre, revisa el código del componente que muestra productos normales

### Problema: La sincronización no funciona entre módulos

**Solución:**
1. Verifica en consola que se emiten los eventos:
   ```javascript
   window.addEventListener('productos-actualizados', () => {
     console.log('✅ Evento productos-actualizados recibido');
   });
   ```
2. Ejecuta: `migrarProductosPRSManual()` para forzar sincronización

---

## 📝 LOGS DETALLADOS

El sistema emite logs automáticos en cada operación:

### Al abrir el formulario:
```
📦 Productos PRS cargados: X
🔍 DEBUG - Todos los productos: X
🔍 DEBUG - Productos con esPRS: [...]
```

### Al seleccionar tipo PRS:
```
🎯 DEBUG Tipo PRS: {
  tipoEntrada: "prs",
  esTipoEntradaPRS: true,
  productosPRSLength: X
}
```

### Al seleccionar producto:
```
🎯 Producto PRS seleccionado: { nombre, categoria, ... }
💡 Produit PRS sélectionné - Champs auto-remplis
```

### Al guardar entrada:
```
✅ Entrada registrada correctamente
```

---

## 🎓 COMPRENSIÓN DEL SISTEMA

### Arquitectura de Sincronización

```
┌─────────────────────────────────────────┐
│         CONFIGURACIÓN (Tab PRS)         │
│  • Crear productos PRS (esPRS: true)    │
│  • Migración automática en apertura     │
│  • Emite: 'productos-actualizados'      │
└─────────────────────────────────────────┘
                    ↓
         [localStorage: productosCreados]
                    ↓
┌─────────────────────────────────────────┐
│      FORMULARIO ENTRADA (Listener)      │
│  • Escucha: 'productos-actualizados'    │
│  • Filtra: p.esPRS === true             │
│  • Migración automática en apertura     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│        INTERFAZ USUARIO (Selector)      │
│  • Detecta tipo entrada === 'prs'       │
│  • Muestra productos PRS filtrados      │
│  • Auto-rellena campos al seleccionar   │
│  • Valida producto PRS al guardar       │
└─────────────────────────────────────────┘
```

### Flujo de Datos

1. **Creación:** Usuario crea producto PRS → localStorage
2. **Evento:** Se emite 'productos-actualizados'
3. **Escucha:** FormularioEntrada recibe evento
4. **Actualización:** Recarga productos PRS desde localStorage
5. **Filtrado:** Filtra solo `esPRS === true`
6. **Visualización:** Muestra en selector con UI diferenciada
7. **Selección:** Auto-rellena campos del formulario
8. **Validación:** Verifica producto PRS válido al guardar

---

## 🎯 CHECKLIST DE VERIFICACIÓN COMPLETA

```
□ Ejecutar verificarSincronizacionPRS() en consola
□ Ver lista de productos PRS con listarProductosPRS()
□ Verificar tab "Productos PRS" en Configuración
□ Crear un nuevo producto PRS
□ Abrir FormularioEntrada y ver que aparece
□ Seleccionar tipo "PRS" en formulario
□ Verificar que selector es obligatorio
□ Buscar y seleccionar producto PRS
□ Verificar auto-relleno de campos
□ Intentar guardar sin producto (debe fallar)
□ Guardar con producto PRS (debe funcionar)
```

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **Informe completo:** Ver `/VERIFICACION_SINCRONIZACION_PRS.md`
- **Código fuente verificación:** Ver `/src/app/utils/verificarPRS.ts`
- **Componente Configuración:** Ver `/src/app/components/pages/Configuracion.tsx`
- **Componente FormularioEntrada:** Ver `/src/app/components/FormularioEntrada.tsx`

---

**Sistema verificado el:** 15 de marzo de 2026  
**Estado:** ✅ FUNCIONANDO CORRECTAMENTE  
**Próxima verificación recomendada:** Después de cada actualización mayor
