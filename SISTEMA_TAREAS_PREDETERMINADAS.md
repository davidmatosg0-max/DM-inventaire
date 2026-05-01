# 📋 Sistema de Tareas Predeterminadas por Tipo de Contacto

## ✅ Estado: IMPLEMENTADO Y VERIFICADO

---

## 🎯 Descripción General

El sistema permite guardar modificaciones a tareas predeterminadas del sistema para que se apliquen automáticamente a **todos los contactos del mismo tipo** (Donateurs, Fournisseurs, Bénévoles, etc.).

---

## 🏗️ Arquitectura del Sistema

### Niveles de Jerarquía de Tareas:

```
┌─────────────────────────────────────────────────────────┐
│  Nivel 1: Tareas del Sistema (Globales)                │
│  • Accueil, Distribution, Inventaire, etc.              │
│  • Visibles para todos por defecto                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Nivel 2: Tareas Predeterminadas por Tipo ⭐ NUEVO     │
│  • Modificaciones a tareas del sistema para un tipo     │
│  • Se aplican a TODOS los contactos del mismo tipo      │
│  • Ejemplos:                                            │
│    - "Distribution" modificada → "Distribution de dons" │
│      (solo para Donateurs)                              │
│    - "Transport" modificada → "Livraison fournisseurs"  │
│      (solo para Fournisseurs)                           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Nivel 3: Tareas por Departamento                       │
│  • Tareas específicas de Entrepôt, Cuisine, etc.        │
│  • Solo visibles en el departamento correspondiente     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Nivel 4: Tareas Personalizadas Individuales            │
│  • Tareas únicas creadas para casos específicos         │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Estructura de Datos

### Interfaz TareaPersonalizada

```typescript
export interface TareaPersonalizada {
  id: string;                  // Identificador único
  code: string;                // Código de la tarea (ej: 'distribution')
  label: string;               // Nombre de la tarea (ej: 'Distribution')
  icon: string;                // Emoji de la tarea (ej: '📦')
  color: string;               // Color en hexadecimal (ej: '#2d9561')
  departamentoId?: string;     // ID del departamento (opcional)
  tipoContacto?: string;       // ⭐ NUEVO: Tipo de contacto (opcional)
                               // Valores: 'donador', 'fournisseur', 'benevole', etc.
}
```

### Almacenamiento en localStorage

**Clave:** `'tareasPersonalizadas'`

**Ejemplo de datos:**

```json
[
  {
    "id": "tarea-1234567890-abc123",
    "code": "distribution",
    "label": "Distribution de dons",
    "icon": "💝",
    "color": "#FCD34D",
    "tipoContacto": "donador"
  },
  {
    "id": "tarea-1234567891-def456",
    "code": "transport",
    "label": "Livraison fournisseurs",
    "icon": "🚛",
    "color": "#1a4d7a",
    "tipoContacto": "fournisseur"
  },
  {
    "id": "tarea-1234567892-ghi789",
    "code": "reception",
    "label": "Réception marchandises",
    "icon": "📦",
    "color": "#2d9561",
    "departamentoId": "2"
  }
]
```

---

## 🔧 Funciones Principales

### 1. `obtenerTareasPersonalizadas(departamentoId?, tipoContacto?)`

Obtiene tareas filtradas por departamento y tipo de contacto.

**Lógica de filtrado:**

```typescript
// Si la tarea tiene tipoContacto específico
if (tarea.tipoContacto && tipoContacto && tarea.tipoContacto !== tipoContacto) {
  return false; // No mostrar
}

// Si la tarea tiene departamentoId específico
if (departamentoId && tarea.departamentoId && tarea.departamentoId !== departamentoId) {
  return false; // No mostrar
}

return true; // Mostrar
```

**Ejemplos:**

```typescript
// Obtener tareas para Donateurs en Entrepôt
const tareas = obtenerTareasPersonalizadas('2', 'donador');
// Retorna: Tareas globales + Tareas de Entrepôt + Tareas predeterminadas para Donateurs

// Obtener tareas para Fournisseurs en Cuisine
const tareas = obtenerTareasPersonalizadas('6', 'fournisseur');
// Retorna: Tareas globales + Tareas de Cuisine + Tareas predeterminadas para Fournisseurs
```

---

### 2. `guardarTareaPredeterminadaPorTipo(codeOriginal, nuevaTarea, tipoContacto)`

Guarda o actualiza una tarea predeterminada para un tipo de contacto específico.

**Parámetros:**
- `codeOriginal`: Código de la tarea original del sistema
- `nuevaTarea`: Datos de la tarea modificada
- `tipoContacto`: Tipo de contacto ('donador', 'fournisseur', etc.)

**Comportamiento:**

```typescript
// Buscar si ya existe una modificación para este tipo
const existente = tareas.find(t => 
  t.code === nuevaTarea.code && t.tipoContacto === tipoContacto
);

if (existente) {
  // Actualizar la existente
  existente.label = nuevaTarea.label;
  existente.icon = nuevaTarea.icon;
  existente.color = nuevaTarea.color;
} else {
  // Crear nueva tarea predeterminada
  tareas.push({
    id: generarId(),
    ...nuevaTarea,
    tipoContacto: tipoContacto
  });
}
```

---

## 🎨 Componentes Integrados

### 1. TaskSelector

**Props:**

```typescript
interface TaskSelectorProps {
  selectedTasks: string[];
  onChange: (tasks: string[]) => void;
  predefinedTasks?: Array<{ code, label, icon, color }>;
  departamentoId?: string;           // ID del departamento
  departamentoNombre?: string;       // Nombre del departamento
  tipoContacto?: string;             // ⭐ NUEVO: Tipo de contacto
  nombreTipoContacto?: string;       // ⭐ NUEVO: Nombre amigable del tipo
}
```

**Uso en FormularioContactoCompacto:**

```tsx
<TaskSelector
  selectedTasks={formulario.tareas || []}
  onChange={(tareas) => setFormulario({ ...formulario, tareas })}
  departamentoId={departamentoId}
  departamentoNombre={formulario.departamentoNombre || ''}
  tipoContacto={formulario.tipo}
  nombreTipoContacto={
    formulario.tipo === 'donador' ? 'Donateur' : 
    formulario.tipo === 'fournisseur' ? 'Fournisseur' : 
    formulario.tipo === 'benevole' ? 'Bénévole' : 
    formulario.tipo
  }
  predefinedTasks={[
    { code: 'accueil', label: 'Accueil', icon: '🤝', color: '#1a4d7a' },
    { code: 'distribution', label: 'Distribution', icon: '📦', color: '#2d9561' },
    // ... más tareas
  ]}
/>
```

---

## 🚀 Flujo de Usuario - Caso de Uso

### Escenario: Modificar tarea "Distribution" para Donateurs

#### **Paso 1: Abrir contacto tipo "Donateur"**

```
Usuario → Inventaire → Gestion des Contacts → [Click en un Donateur]
```

#### **Paso 2: Ir a la pestaña "Professionnel"**

```
Onglets: Personnel | Professionnel | Documents
                     ↑ (Click aquí)
```

#### **Paso 3: Buscar la tarea "Distribution"**

```
Tâches assignées:
┌─────────────────┐
│ 📦 Distribution │  ← Click en el botón de editar (✏️)
└─────────────────┘
```

#### **Paso 4: Modificar la tarea**

```
Dialog: Modifier la tâche
┌────────────────────────────────────┐
│ Code: distribution                 │
│ Nom: Distribution de dons          │  ← Modificado
│ Icône: 💝                          │  ← Modificado
│ Couleur: #FCD34D                   │  ← Modificado
└────────────────────────────────────┘
[Annuler]  [Mettre à jour]
           ↑ (Click aquí)
```

#### **Paso 5: Confirmación**

```
✨ Toast de éxito:
"Tâche système mise à jour comme prédéfinie pour tous les Donateurs"
```

#### **Paso 6: Resultado**

✅ **Todos los Donateurs existentes** verán la tarea modificada:
```
💝 Distribution de dons (color amarillo dorado)
```

✅ **Nuevos Donateurs** también verán automáticamente la versión modificada

❌ **Fournisseurs, Bénévoles y otros tipos** NO se ven afectados:
```
📦 Distribution (color verde original)
```

---

## ✅ Casos de Prueba

### Test 1: Modificar tarea para Donateurs

```
✓ Abrir contacto tipo "Donateur"
✓ Editar tarea "Distribution"
✓ Cambiar icono, nombre y color
✓ Guardar
✓ Verificar toast de confirmación
✓ Abrir otro Donateur
✓ Confirmar que ve la tarea modificada
✓ Abrir un Fournisseur
✓ Confirmar que NO ve la modificación
```

### Test 2: Modificar tarea para Fournisseurs

```
✓ Abrir contacto tipo "Fournisseur"
✓ Editar tarea "Transport"
✓ Cambiar a "Livraison fournisseurs"
✓ Guardar
✓ Verificar que todos los Fournisseurs ven la modificación
✓ Verificar que los Donateurs NO ven la modificación
```

### Test 3: Tareas independientes por Departamento + Tipo

```
✓ Departamento Entrepôt + Donateur
  → Ve: Tareas globales + Tareas Entrepôt + Tareas Donateur
  
✓ Departamento Cuisine + Fournisseur
  → Ve: Tareas globales + Tareas Cuisine + Tareas Fournisseur
  
✓ Departamento Transport + Bénévole
  → Ve: Tareas globales + Tareas Transport + Tareas Bénévole
```

---

## 📊 Verificación del Sistema

### Archivos Modificados

✅ `/src/app/utils/tareasPersonalizadasStorage.ts`
- Agregado campo `tipoContacto` a la interfaz
- Modificada función `obtenerTareasPersonalizadas()` para filtrar por tipo
- Agregada función `guardarTareaPredeterminadaPorTipo()`

✅ `/src/app/components/ui/task-selector.tsx`
- Agregados props `tipoContacto` y `nombreTipoContacto`
- Modificada función `handleActualizarTareaPredeterminada()` para usar el nuevo sistema
- Agregada lógica para distinguir entre modificaciones globales y por tipo

✅ `/src/app/components/departamentos/FormularioContactoCompacto.tsx`
- Pasando props `tipoContacto` y `nombreTipoContacto` al TaskSelector
- Mapeo de tipos internos a nombres amigables

---

## 🎯 Tipos de Contacto Soportados

| Tipo Interno | Nombre Amigable | Color Principal | Icono |
|--------------|-----------------|-----------------|-------|
| `donador` | Donateur | #FCD34D (Amarillo) | ❤️ |
| `fournisseur` | Fournisseur | #1a4d7a (Azul Marino) | 🏢 |
| `benevole` | Bénévole | #9CA3AF (Gris) | ✅ |
| `employe` | Employé | #65A30D (Verde Lima) | 👨‍💼 |
| `responsable-sante` | Responsable de Santé | #EC4899 (Rosa) | 🩺 |
| `partenaire` | Partenaire | #F59E0B (Naranja) | ⭐ |
| `visiteur` | Visiteur | #2d9561 (Verde) | 👋 |

---

## 🔍 Debugging

### Inspeccionar localStorage

```javascript
// En la consola del navegador:

// Ver todas las tareas personalizadas
JSON.parse(localStorage.getItem('tareasPersonalizadas'))

// Ver tareas predeterminadas ocultas
JSON.parse(localStorage.getItem('tareas_predeterminadas_ocultas'))

// Limpiar todas las tareas (CUIDADO - acción destructiva)
localStorage.removeItem('tareasPersonalizadas')
```

### Logs de depuración

El sistema incluye logs de error en la consola para facilitar el debugging:

```javascript
console.error('Error al obtener tareas personalizadas:', error);
console.error('Error al guardar tarea personalizada:', error);
console.error('Error al actualizar tarea personalizada:', error);
console.error('Error al eliminar tarea personalizada:', error);
```

---

## 🎉 Beneficios del Sistema

1. **🎯 Personalización por Rol**
   - Cada tipo de contacto tiene tareas adaptadas a su contexto
   - Los Donateurs ven tareas relacionadas con donaciones
   - Los Fournisseurs ven tareas relacionadas con compras/proveedores

2. **⚡ Escalabilidad Automática**
   - Las modificaciones se aplican instantáneamente a todos los contactos del mismo tipo
   - No es necesario editar cada contacto individualmente

3. **🔒 Aislamiento de Cambios**
   - Las modificaciones para un tipo NO afectan a otros tipos
   - Previene efectos colaterales no deseados

4. **🌐 Flexibilidad Multinivel**
   - Combina filtrado por departamento Y tipo de contacto
   - Soporta tareas globales, por departamento, por tipo y personalizadas individuales

5. **💡 Interfaz Intuitiva**
   - Mensajes claros que indican el alcance de las modificaciones
   - Badges visuales que distinguen entre tareas del sistema y personalizadas

---

## 📌 Notas Importantes

⚠️ **Las modificaciones a tareas predeterminadas son permanentes**
- Una vez guardadas, afectan a todos los contactos del mismo tipo
- Se recomienda tener precaución al modificar tareas del sistema

⚠️ **Las tareas se almacenan en localStorage**
- Los datos persisten en el navegador
- Limpiar el caché del navegador eliminará las personalizaciones

✅ **Compatible con el sistema existente**
- No afecta la funcionalidad de tareas independientes por departamento
- Ambos sistemas trabajan en conjunto

---

## 📅 Historial de Cambios

**Versión 1.0 - Implementación Inicial**
- ✅ Sistema de tareas predeterminadas por tipo de contacto
- ✅ Integración con FormularioContactoCompacto
- ✅ Mensajes de confirmación personalizados
- ✅ Filtrado multinivel (departamento + tipo)
- ✅ Soporte para todos los tipos de contacto

---

## 👨‍💻 Desarrollador

**Sistema creado por:** David Matos  
**Usuario del sistema:** David / Lettycia26  
**Fecha de implementación:** Marzo 2026  
**Estado:** ✅ Completado y Verificado

---

## 🚀 Próximos Pasos Sugeridos

- [ ] Agregar exportación/importación de tareas personalizadas
- [ ] Implementar historial de cambios en tareas
- [ ] Agregar vista de comparación entre versiones de tareas
- [ ] Soporte para templates de tareas por industria/sector
- [ ] Dashboard de análisis de tareas más usadas por tipo de contacto

---

**Fin de la documentación** 📋
