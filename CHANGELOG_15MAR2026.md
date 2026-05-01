# 📋 Changelog - 15 de Marzo 2026
## 🕐 Última actualización: 15/03/2026 18:35 - CAMBIOS FORZADOS Y VISIBLES

## ✅ Funcionalidades Implementadas

### 1. Campo Peso Unitario en Subcategorías ⚖️

**Archivo modificado:** `/src/app/components/EntradaDonAchat.tsx`

**Cambios realizados:**
- ✅ Agregado campo `pesoUnitario: number` en la interfaz `FormSubcategoria`
- ✅ Inicializado en `FORM_SUBCATEGORIA_INICIAL` con valor 0
- ✅ Input numérico en el diálogo "Créer une Nouvelle Sous-catégorie"
  - Label: "⚖️ Poids unitaire (kg) - Optionnel"
  - Type: number con step 0.001, min 0
  - Placeholder: "0.000"
  - Border destacado con clase `border-2`
  - Texto de ayuda con ejemplo: "💡 Poids moyen d'une unité de ce produit (exemple: 0.500 kg pour une boîte de 500g)"
- ✅ Se guarda correctamente en la función `handleGuardarNuevaSubcategoria` (línea 857)
- ✅ El valor se utiliza para cálculo automático de pesos totales

**Ubicación visual:**
- Módulo: **Inventario** → Pestaña **Entradas**
- Botón: **➕ Nueva Entrada**
- Seleccionar programa → Seleccionar categoría
- Click en **"Créer sous-catégorie"**
- El campo aparece después del selector de unidad

---

### 2. Botón Anular Entrada ❌

**Archivo modificado:** `/src/app/components/inventario/HistorialEntradasCompacto.tsx`

**Cambios realizados:**
- ✅ Importado icono `XCircle` de lucide-react
- ✅ Importada función `eliminarEntrada` de entradaInventarioStorage
- ✅ Importado `toast` de sonner para notificaciones
- ✅ Agregada función `handleAnularEntrada` que:
  - Muestra confirmación nativa del navegador
  - Ejecuta soft delete (marca `activo: false`)
  - Muestra toast de éxito/error
  - Recarga los datos
  - Notifica a otros componentes vía eventos
- ✅ Agregado botón en el UI:
  - Color rojo (#DC3545)
  - Icono XCircle
  - Texto "Anular" (oculto en móviles)
  - Hover effect
  - Transition animation
  - Tooltip "Anular entrada"
- ✅ Layout vertical junto al botón "Editar"

**Ubicación visual:**
- Módulo: **Inventario** → Pestaña **Entradas**
- Cada entrada muestra 2 botones verticales:
  - **Editar** (azul, arriba)
  - **Anular** (rojo, abajo)

---

## 🔧 Detalles Técnicos

### Soft Delete
Las entradas anuladas **NO se eliminan permanentemente**, solo se marcan como inactivas (`activo: false`). Esto permite:
- Mantener historial completo
- Auditoría de operaciones
- Posibilidad de restauración futura
- Integridad de datos

### Funciones utilizadas
```typescript
// En entradaInventarioStorage.ts
export function eliminarEntrada(id: string): boolean {
  return actualizarEntrada(id, { activo: false });
}

export function obtenerEntradasActivas(): EntradaInventario[] {
  return obtenerTodasLasEntradas().filter(entrada => entrada.activo);
}
```

### Eventos del sistema
Cuando se anula una entrada, se dispara el evento `entradaGuardada` que actualiza:
- HistorialEntradasCompacto
- Otros componentes que escuchan este evento
- Stock disponible (si aplica)

---

## 🎨 Mejoras Visuales

1. **Campo Peso Unitario:**
   - Icono ⚖️ en el label
   - Border destacado (2px)
   - Icono 💡 en el texto de ayuda
   - Ejemplo práctico en la descripción

2. **Botón Anular:**
   - Color rojo distintivo
   - Animación de transición suave
   - Tooltip descriptivo
   - Layout vertical optimizado

---

## 📝 Notas Importantes

1. **Compatibilidad:** Ambas funcionalidades son retrocompatibles con datos existentes
2. **Validación:** El campo pesoUnitario acepta 0 como valor válido (opcional)
3. **Responsive:** El botón Anular oculta el texto en pantallas pequeñas
4. **LocalStorage:** Los datos se preservan en localStorage
5. **Usuario David:** Mantiene acceso total como siempre

---

## 🧪 Cómo Verificar

### Peso Unitario:
1. Crear nueva entrada Don/Achat
2. Seleccionar categoría
3. Click en "Créer sous-catégorie"
4. Buscar el campo "⚖️ Poids unitaire (kg)"
5. Ingresar un valor como 0.500
6. Guardar y verificar que se usa en cálculos

### Botón Anular:
1. Ir a Inventario → Entradas
2. Buscar cualquier entrada existente
3. Ver botón rojo "Anular" debajo de "Editar"
4. Click en Anular
5. Confirmar en el diálogo
6. Verificar que desaparece de la lista

---

## ⚠️ Si no ves los cambios

**Solución rápida:**
1. Presiona `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac)
2. Esto fuerza la recarga limpiando el caché

**Verificación técnica:**
1. Abre DevTools (F12)
2. Ve a Console
3. No debe haber errores
4. Ve a Application → Local Storage
5. Verifica que existen las claves del sistema

---

## 👨‍💻 Desarrollador: David
## 📅 Fecha: 15 de Marzo 2026
## ✅ Estado: PRODUCCIÓN
