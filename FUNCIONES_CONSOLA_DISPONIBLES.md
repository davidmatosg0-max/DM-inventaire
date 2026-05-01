# 🎮 FUNCIONES DISPONIBLES EN LA CONSOLA DEL NAVEGADOR

## Sistema Integral - Banque Alimentaire

Este documento lista TODAS las funciones disponibles en la consola del navegador (F12) para gestión, diagnóstico y mantenimiento del sistema.

---

## 💰 FUNCIONES DE VALOR MONETARIO

### `recalcularTodosLosValores()`
**Descripción:** Recalcula el valor monetario de TODOS los productos del inventario y muestra un reporte visual completo.

**Cuándo usar:**
- Después de cambiar precios en categorías
- Después de importar datos masivos
- Para generar reportes de valor de inventario
- Cuando los valores monetarios no se muestran correctamente

**Ejemplo:**
```javascript
recalcularTodosLosValores()
```

**Resultado:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 REPORTE DE VALORES MONETARIOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 ESTADÍSTICAS
   Productos actualizados: 150
   Productos con valor: 145
   Productos sin valor: 5
   Valor total inventario: CAD$ 45,678.90
📦 TOP 10 PRODUCTOS POR VALOR
   1. Arroz Blanco - Total: CAD$ 700.00
   ...
```

---

### `verificarProductosSinPeso()`
**Descripción:** Lista todos los productos que no tienen peso unitario configurado.

**Cuándo usar:**
- Antes de generar reportes de valor
- Para diagnosticar productos sin configurar
- Antes de exportar datos

**Ejemplo:**
```javascript
verificarProductosSinPeso()
```

**Resultado:**
```
📊 Total de productos: 250
⚠️ Productos sin peso: 10
[Tabla con detalles de productos]
💡 Ejecuta migrarPesoUnitarioProductos() para corregir
```

---

### `migrarPesoUnitarioProductos()`
**Descripción:** Corrige automáticamente los productos que no tienen peso unitario definido.

**Cuándo usar:**
- Cuando `verificarProductosSinPeso()` muestra productos con problemas
- Después de importar productos antiguos
- Para corregir datos inconsistentes

**Ejemplo:**
```javascript
migrarPesoUnitarioProductos()
```

**Resultado:**
```
✅ Migración completada: 10 producto(s) corregido(s)
```

---

### `recalcularValoresMonetarios()`
**Descripción:** Actualiza los valores monetarios de todos los productos (similar a recalcularTodosLosValores pero sin reporte visual).

**Ejemplo:**
```javascript
recalcularValoresMonetarios()
```

---

## 📦 FUNCIONES DE CATEGORÍAS

### `listarCategorias()`
**Descripción:** Muestra todas las categorías con sus subcategorías y valores por kg.

**Ejemplo:**
```javascript
listarCategorias()
```

---

### `listarSubcategorias(categoriaNombre)`
**Descripción:** Muestra las subcategorías de una categoría específica.

**Parámetros:**
- `categoriaNombre` (string): Nombre de la categoría

**Ejemplo:**
```javascript
listarSubcategorias('Aliments Secs')
```

---

## 🔍 FUNCIONES DE TRADUCCIÓN

### `verificarTraducciones()`
**Descripción:** Ejecuta la herramienta de verificación de traducciones y genera un reporte completo.

**Cuándo usar:**
- Para verificar que todos los componentes tienen traducciones
- Después de agregar nuevos componentes
- Para diagnosticar problemas de idioma

**Ejemplo:**
```javascript
verificarTraducciones()
```

**Resultado:**
```
═══════════════════════════════════════════
📋 REPORTE DE TRADUCCIONES
═══════════════════════════════════════════
✅ Componentes con useTranslation: 65
❌ Componentes sin useTranslation: 2
...
```

---

## 💾 FUNCIONES DE ALMACENAMIENTO LOCAL

### `verTodoLocalStorage()`
**Descripción:** Muestra todo el contenido del localStorage organizado por claves.

**Ejemplo:**
```javascript
ver TodoLocalStorage()
```

---

### `limpiarDatosTest()`
**Descripción:** Limpia datos de prueba (CUIDADO: Esta función borra datos).

**⚠️ ADVERTENCIA:** Esta función es destructiva. Usar solo en desarrollo.

---

### `exportarDatos()`
**Descripción:** Exporta todos los datos del localStorage a un archivo JSON.

**Ejemplo:**
```javascript
exportarDatos()
```

---

### `importarDatos(datos)`
**Descripción:** Importa datos desde un objeto JSON.

**Parámetros:**
- `datos` (object): Objeto con los datos a importar

**⚠️ ADVERTENCIA:** Esta función sobrescribe datos existentes.

---

## 👥 FUNCIONES DE USUARIOS

### `listarUsuarios()`
**Descripción:** Muestra todos los usuarios del sistema.

**Ejemplo:**
```javascript
listarUsuarios()
```

---

### `verificarUsuarioDavid()`
**Descripción:** Verifica que el usuario permanente David existe y está activo.

**Ejemplo:**
```javascript
verificarUsuarioDavid()
```

**Resultado:**
```
✅ Usuario David encontrado
   Username: David
   Estado: Activo
   Rol: Desarrollador
   Acceso: Total
```

---

## 🏢 FUNCIONES DE ORGANISMOS

### `listarOrganismos()`
**Descripción:** Muestra todos los organismos registrados.

**Ejemplo:**
```javascript
listarOrganismos()
```

---

### `verOrganismo(id)`
**Descripción:** Muestra detalles de un organismo específico.

**Parámetros:**
- `id` (string): ID del organismo

**Ejemplo:**
```javascript
verOrganismo('ORG-001')
```

---

## 📊 FUNCIONES DE ESTADÍSTICAS

### `estadisticasInventario()`
**Descripción:** Muestra estadísticas completas del inventario.

**Ejemplo:**
```javascript
estadisticasInventario()
```

**Resultado:**
```
📊 ESTADÍSTICAS DEL INVENTARIO
   Total productos: 250
   Productos activos: 240
   Productos con stock bajo: 15
   Valor total inventario: CAD$ 45,678.90
   Productos sin valor: 10
```

---

### `estadisticasComandas()`
**Descripción:** Muestra estadísticas de comandas.

**Ejemplo:**
```javascript
estadisticasComandas()
```

---

## 🔧 FUNCIONES DE DIAGNÓSTICO

### `diagnosticoCompleto()`
**Descripción:** Ejecuta un diagnóstico completo del sistema y genera un reporte detallado.

**Cuándo usar:**
- Cuando hay problemas en el sistema
- Para verificar integridad de datos
- Antes de exportar datos importantes

**Ejemplo:**
```javascript
diagnosticoCompleto()
```

**Resultado:**
```
🔧 DIAGNÓSTICO COMPLETO DEL SISTEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ LocalStorage: OK
✅ Usuarios: OK (12 usuarios)
✅ Categorías: OK (15 categorías)
✅ Productos: OK (250 productos)
⚠️ Productos sin peso: 10
✅ Organismos: OK (45 organismos)
✅ Comandas: OK (128 comandas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Recomendaciones:
   - Ejecutar migrarPesoUnitarioProductos()
   - Recalcular valores monetarios
```

---

## 🎨 FUNCIONES DE DEPURACIÓN

### `console.clear()`
**Descripción:** Limpia la consola del navegador.

**Ejemplo:**
```javascript
console.clear()
```

---

### `localStorage.clear()`
**Descripción:** ⚠️ PELIGRO: Borra TODO el localStorage.

**⚠️ ADVERTENCIA:** Esta función borra TODOS los datos. Usar solo en desarrollo con cuidado extremo.

---

## 📝 FUNCIONES DE REPORTES

### `generarReporteCompleto()`
**Descripción:** Genera un reporte completo del sistema en la consola.

**Ejemplo:**
```javascript
generarReporteCompleto()
```

---

### `generarReporteProductos()`
**Descripción:** Genera un reporte detallado de productos.

**Ejemplo:**
```javascript
generarReporteProductos()
```

---

## 🌐 FUNCIONES DE IDIOMA

### `cambiarIdioma(codigo)`
**Descripción:** Cambia el idioma del sistema.

**Parámetros:**
- `codigo` (string): Código de idioma ('es', 'fr', 'en', 'ar')

**Ejemplo:**
```javascript
cambiarIdioma('fr')  // Francés
cambiarIdioma('es')  // Español
cambiarIdioma('en')  // Inglés
cambiarIdioma('ar')  // Árabe
```

---

## 🎯 FUNCIONES MÁS USADAS (RESUMEN)

| Función | Uso Principal |
|---------|---------------|
| `recalcularTodosLosValores()` | 🔥 Recalcular valores monetarios |
| `verificarProductosSinPeso()` | 🔍 Diagnosticar productos |
| `migrarPesoUnitarioProductos()` | 🔧 Corregir productos |
| `verificarTraducciones()` | 📋 Verificar idiomas |
| `diagnosticoCompleto()` | 🔧 Diagnóstico general |
| `estadisticasInventario()` | 📊 Ver estadísticas |

---

## 💡 CONSEJOS Y MEJORES PRÁCTICAS

1. **Ejecuta `recalcularTodosLosValores()` regularmente:**
   - Después de cambios en precios
   - Después de importaciones masivas
   - Antes de generar reportes

2. **Usa `verificarProductosSinPeso()` antes de exportar:**
   - Asegura que todos los productos tienen datos completos
   - Previene errores en reportes

3. **Ejecuta `diagnosticoCompleto()` cuando hay problemas:**
   - Identifica problemas rápidamente
   - Proporciona recomendaciones automáticas

4. **Guarda reportes importantes:**
   - Copia y pega reportes en documentos
   - Mantén historial de valores para auditorías

---

## 🚀 FLUJO DE TRABAJO RECOMENDADO

### Al Iniciar el Día:
```javascript
diagnosticoCompleto()
verificarUsuarioDavid()
```

### Antes de Generar Reportes:
```javascript
verificarProductosSinPeso()
migrarPesoUnitarioProductos()  // Si es necesario
recalcularTodosLosValores()
```

### Después de Importar Datos:
```javascript
migrarPesoUnitarioProductos()
recalcularTodosLosValores()
verificarTraducciones()
```

### Mantenimiento Mensual:
```javascript
diagnosticoCompleto()
estadisticasInventario()
estadisticasComandas()
generarReporteCompleto()
```

---

## 📞 SOPORTE

Si encuentras problemas o necesitas ayuda:

1. Ejecuta `diagnosticoCompleto()` primero
2. Copia el resultado
3. Consulta este documento
4. Ejecuta las funciones recomendadas

---

## ⚠️ ADVERTENCIAS IMPORTANTES

### Funciones Peligrosas (Usar con Cuidado):
- `localStorage.clear()` - Borra TODO
- `limpiarDatosTest()` - Borra datos de prueba
- `importarDatos()` - Sobrescribe datos

### Antes de Usar Funciones Destructivas:
1. Exporta tus datos: `exportarDatos()`
2. Guarda el backup
3. Verifica que tienes el archivo guardado
4. Solo entonces ejecuta la función destructiva

---

*Sistema Integral - Banque Alimentaire v5.0 PRO*  
*Documentación actualizada: Marzo 2026*
