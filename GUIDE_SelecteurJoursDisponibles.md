# 📅 Guía de Uso: SelecteurJoursDisponibles

## Componente Reutilizable para Selección de Días y Horarios

Este componente proporciona una interfaz intuitiva para seleccionar días de la semana con horarios específicos (Mañana, Tarde, Día Completo).

---

## 🎯 Características

✅ **Interfaz visual intuitiva** con ciclo de selección  
✅ **3 horarios disponibles**: AM (Matin), PM (Après-midi), AM/PM (Journée)  
✅ **Ciclo de clics**: AM → PM → AM/PM → Deseleccionar  
✅ **Badges de colores** según el horario seleccionado  
✅ **Leyenda explicativa** integrada  
✅ **Resumen de selección** en tiempo real  
✅ **TypeScript** con tipos completos  
✅ **Totalmente reutilizable** en cualquier formulario

---

## 📦 Instalación e Importación

```typescript
import { SelecteurJoursDisponibles, type JourDisponible } from '../shared/SelecteurJoursDisponibles';
```

### Tipo de Datos

```typescript
interface JourDisponible {
  jour: string;        // 'Lundi', 'Mardi', 'Mercredi', etc.
  horaire: 'AM' | 'PM' | 'AM/PM' | null;
}
```

---

## 🔧 Uso Básico

### 1. En el State del Componente

```typescript
import { useState } from 'react';
import { SelecteurJoursDisponibles, type JourDisponible } from '../shared/SelecteurJoursDisponibles';

function MonFormulaire() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    joursDisponibles: [] as JourDisponible[]
  });

  return (
    <div>
      {/* ... otros campos del formulario ... */}
      
      <SelecteurJoursDisponibles
        joursDisponibles={formData.joursDisponibles}
        onChange={(nouveauxJours) => setFormData({ ...formData, joursDisponibles: nouveauxJours })}
        showIcon={true}
      />
    </div>
  );
}
```

---

## 🎨 Props del Componente

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `joursDisponibles` | `JourDisponible[]` | ✅ Sí | - | Array de días seleccionados |
| `onChange` | `(nouveauxJours: JourDisponible[]) => void` | ✅ Sí | - | Callback al cambiar selección |
| `label` | `string` | ❌ No | Ver código | Etiqueta del campo |
| `showIcon` | `boolean` | ❌ No | `true` | Mostrar ícono de calendario |
| `className` | `string` | ❌ No | `''` | Clases CSS adicionales |

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Formulario de Voluntario

```typescript
// En Benevoles.tsx
import { SelecteurJoursDisponibles, type JourDisponible } from '../shared/SelecteurJoursDisponibles';

interface Benevole {
  id: number;
  nom: string;
  prenom: string;
  joursDisponibles?: JourDisponible[];
  // ... otros campos
}

function FormulaireBenevole() {
  const [editForm, setEditForm] = useState({
    nom: '',
    prenom: '',
    joursDisponibles: [] as JourDisponible[]
  });

  return (
    <form>
      {/* Otros campos */}
      
      <div className="mb-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <SelecteurJoursDisponibles
          joursDisponibles={editForm.joursDisponibles}
          onChange={(nouveauxJours) => setEditForm({ ...editForm, joursDisponibles: nouveauxJours })}
          showIcon={true}
        />
      </div>
    </form>
  );
}
```

### Ejemplo 2: Formulario de Chofer

```typescript
// En GestionChoferes.tsx
import { SelecteurJoursDisponibles, type JourDisponible } from '../shared/SelecteurJoursDisponibles';

type Chofer = {
  id: string;
  nombre: string;
  apellido: string;
  joursDisponibles?: JourDisponible[];
  // ... otros campos
};

function GestionChoferes() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    joursDisponibles: [] as JourDisponible[]
  });

  return (
    <Dialog>
      <DialogContent>
        {/* Otros campos del formulario */}
        
        <div className="mt-6 pt-6 border-t">
          <SelecteurJoursDisponibles
            joursDisponibles={formData.joursDisponibles}
            onChange={(nouveauxJours) => setFormData({ ...formData, joursDisponibles: nouveauxJours })}
            showIcon={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Ejemplo 3: Formulario Compacto (Sin Ícono)

```typescript
function FormulaireCompact() {
  const [jours, setJours] = useState<JourDisponible[]>([]);

  return (
    <div className="p-4">
      <SelecteurJoursDisponibles
        joursDisponibles={jours}
        onChange={setJours}
        showIcon={false}
        label="Sélectionnez vos disponibilités"
      />
    </div>
  );
}
```

### Ejemplo 4: Con Hook Personalizado

```typescript
import { useJoursDisponibles } from '../shared/SelecteurJoursDisponibles';

function MonComposant() {
  const [jours, handleChange, setJours] = useJoursDisponibles([]);

  return (
    <SelecteurJoursDisponibles
      joursDisponibles={jours}
      onChange={handleChange}
      showIcon={true}
    />
  );
}
```

---

## 🎯 Casos de Uso Recomendados

### ✅ Módulos que Deberían Usar Este Componente

1. **Bénévoles** (Voluntarios) ✅ Ya implementado
2. **Gestion Choferes** (Choferes de transporte) ✅ Ya implementado
3. **Usuarios Internos** - Para horarios de trabajo
4. **Organismos** - Para horarios de atención
5. **Comptoir** - Para disponibilidad de atención
6. **Departamentos** - Para horarios de operación
7. **Recrutement** - Para disponibilidad de candidatos
8. **Cualquier formulario que requiera días/horarios**

---

## 🎨 Personalización Visual

### Colores por Horario

```typescript
// Los colores son consistentes con el sistema de diseño

AM (Matin)      → Azul  #1E73BE  → 🌅
PM (Après-midi) → Amarillo #FFC107 → 🌆
AM/PM (Journée) → Verde #4CAF50  → ☀️
```

### Clases CSS Aplicables

```typescript
<SelecteurJoursDisponibles
  className="my-8 shadow-lg"
  // ... otras props
/>
```

---

## 📊 Visualización de Datos Seleccionados

### En Tablas

```typescript
{benevole.joursDisponibles && benevole.joursDisponibles.length > 0 && (
  <div className="flex flex-wrap gap-2">
    {benevole.joursDisponibles.map(j => (
      <Badge key={j.jour} variant="outline" className="bg-blue-50">
        {j.jour} ({j.horaire === 'AM' ? '🌅' : j.horaire === 'PM' ? '🌆' : '☀️'})
      </Badge>
    ))}
  </div>
)}
```

### En Fichas/Detalles

```typescript
{chofer.joursDisponibles && chofer.joursDisponibles.length > 0 ? (
  <div className="field">
    <div className="field-label">Jours disponibles</div>
    <div className="flex flex-wrap gap-2">
      {chofer.joursDisponibles.map(j => (
        <span key={j.jour} className="badge badge-green">
          {j.jour} ({j.horaire === 'AM' ? '🌅 Matin' : j.horaire === 'PM' ? '🌆 Après-midi' : '☀️ Journée'})
        </span>
      ))}
    </div>
  </div>
) : (
  <div className="text-sm text-gray-500">Aucun jour sélectionné</div>
)}
```

---

## 🔄 Ciclo de Interacción

```
Estado Inicial: No seleccionado (gris)
         ↓ [1er clic]
    AM - Matin (azul 🌅)
         ↓ [2ème clic]
    PM - Après-midi (amarillo 🌆)
         ↓ [3ème clic]
    AM/PM - Journée (verde ☀️)
         ↓ [4ème clic]
    [Vuelve al estado inicial]
```

---

## ⚠️ Consideraciones Importantes

### 1. Validación

```typescript
const validarFormulario = () => {
  if (formData.joursDisponibles.length === 0) {
    toast.error('Veuillez sélectionner au moins un jour disponible');
    return false;
  }
  return true;
};
```

### 2. Persistencia de Datos

```typescript
// Al guardar en localStorage o base de datos
const dataToSave = {
  ...formData,
  joursDisponibles: JSON.stringify(formData.joursDisponibles)
};

// Al cargar
const loadedData = {
  ...storedData,
  joursDisponibles: JSON.parse(storedData.joursDisponibles) || []
};
```

### 3. Valores por Defecto

```typescript
// Establecer días por defecto (ej: Lunes a Viernes, AM)
const diasLaborales: JourDisponible[] = [
  { jour: 'Lundi', horaire: 'AM' },
  { jour: 'Mardi', horaire: 'AM' },
  { jour: 'Mercredi', horaire: 'AM' },
  { jour: 'Jeudi', horaire: 'AM' },
  { jour: 'Vendredi', horaire: 'AM' }
];

const [formData, setFormData] = useState({
  joursDisponibles: diasLaborales
});
```

---

## 🌐 Multilenguaje

El componente está diseñado en francés, pero se puede internacionalizar:

```typescript
// Futuro: Con i18n
import { useTranslation } from 'react-i18next';

// En el componente
const { t } = useTranslation();

const JOURS_SEMAINE = [
  t('days.monday'),
  t('days.tuesday'),
  // ...
];
```

---

## 📝 Checklist de Integración

Al agregar el componente a un nuevo formulario, asegúrate de:

- [ ] Importar `SelecteurJoursDisponibles` y el tipo `JourDisponible`
- [ ] Agregar el campo `joursDisponibles` al estado del formulario
- [ ] Agregar el campo `joursDisponibles` al tipo/interface del objeto
- [ ] Incluir el campo en `resetForm()` o función similar
- [ ] Incluir el campo al cargar datos para editar
- [ ] Incluir el campo al guardar/actualizar
- [ ] Agregar validación si es requerido
- [ ] Mostrar los datos en la vista de detalles/tabla si aplica

---

## 🔗 Archivos Relacionados

- **Componente**: `/src/app/components/shared/SelecteurJoursDisponibles.tsx`
- **Ejemplo Bénévoles**: `/src/app/components/pages/Benevoles.tsx`
- **Ejemplo Choferes**: `/src/app/components/transporte/GestionChoferes.tsx`

---

## 🎉 ¡Listo para Usar!

El componente `SelecteurJoursDisponibles` está completamente implementado y listo para ser integrado en cualquier formulario del sistema que requiera selección de días y horarios de disponibilidad.

**¿Necesitas ayuda?** Consulta los ejemplos en los archivos mencionados o revisa esta guía.
