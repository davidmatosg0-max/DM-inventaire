# 🚚 Lógica de Identificación de Donadores PRS - Documentación Completa

## 📋 Resumen

Se ha implementado un sistema completo para identificar y gestionar los donadores participantes del **Programa PRS (Programme de Récupération en Supermarché)** dentro del sistema de gestión de contactos de la Banque Alimentaire.

---

## 🏗️ Estructura de Datos

### Campos PRS Agregados al Tipo `ContactoDepartamento`

Se agregaron 7 nuevos campos opcionales en la interfaz `ContactoDepartamento`:

```typescript
// 🚚 PROGRAMA PRS - Identificador de participación
participaPRS?: boolean;                 // Participa en el programa PRS
fechaInicioPRS?: string;                // Fecha de inicio en PRS
frecuenciaPRS?: number;                 // Frecuencia de recolección (veces por semana)
diasRecoleccionPRS?: string[];          // Días específicos ['Lundi', 'Mercredi', 'Vendredi']
horarioRecoleccionPRS?: string;         // Horario preferido de recolección
contactoPRS?: string;                   // Persona de contacto específica para PRS
telefonoPRS?: string;                   // Teléfono directo para coordinación PRS
notasPRS?: string;                      // Notas especiales sobre el donador PRS
```

**Ubicación**: `/src/app/utils/contactosDepartamentoStorage.ts` (líneas 54-61)

---

## 🔧 Funciones Implementadas

### 1. **obtenerDonadoresPRS()**
Obtiene todos los donadores activos participantes del programa PRS.

```typescript
export function obtenerDonadoresPRS(): ContactoDepartamento[]
```

**Filtros aplicados**:
- `tipo === 'donador'`
- `participaPRS === true`
- `activo === true`

**Uso**:
```typescript
import { obtenerDonadoresPRS } from '@/app/utils/contactosDepartamentoStorage';

const donadoresPRS = obtenerDonadoresPRS();
console.log(`Total donadores PRS: ${donadoresPRS.length}`);
```

---

### 2. **obtenerDonadoresPRSPorDepartamento()**
Obtiene donadores PRS filtrados por departamento.

```typescript
export function obtenerDonadoresPRSPorDepartamento(departamentoId: string): ContactoDepartamento[]
```

**Parámetros**:
- `departamentoId`: ID del departamento (ej: '2' para Entrepôt)

**Uso**:
```typescript
const donadoresPRSEntrepot = obtenerDonadoresPRSPorDepartamento('2');
```

---

### 3. **activarParticipacionPRS()**
Activa la participación de un donador en el programa PRS.

```typescript
export function activarParticipacionPRS(
  contactoId: string, 
  datosPRS: {
    fechaInicioPRS?: string;
    frecuenciaPRS?: number;
    diasRecoleccionPRS?: string[];
    horarioRecoleccionPRS?: string;
    contactoPRS?: string;
    telefonoPRS?: string;
    notasPRS?: string;
  }
): boolean
```

**Validaciones**:
- ✅ Verifica que el contacto existe
- ✅ Verifica que el contacto es de tipo 'donador'
- ✅ Asigna automáticamente fecha de inicio si no se proporciona
- ✅ Establece frecuencia por defecto de 1 vez por semana

**Uso**:
```typescript
const exito = activarParticipacionPRS('contacto-123', {
  fechaInicioPRS: '2024-02-20',
  frecuenciaPRS: 3,
  diasRecoleccionPRS: ['Lundi', 'Mercredi', 'Vendredi'],
  horarioRecoleccionPRS: '08:00 - 10:00',
  contactoPRS: 'Jean-Marc Tremblay',
  telefonoPRS: '(514) 555-9999',
  notasPRS: 'Préférence pour les matins. Accès par porte arrière.'
});

if (exito) {
  console.log('✅ Donador activado en PRS');
}
```

---

### 4. **desactivarParticipacionPRS()**
Desactiva la participación de un donador en PRS.

```typescript
export function desactivarParticipacionPRS(contactoId: string): boolean
```

**Comportamiento**:
- Establece `participaPRS` a `false`
- Limpia todos los campos relacionados con PRS

**Uso**:
```typescript
const desactivado = desactivarParticipacionPRS('contacto-123');
```

---

### 5. **actualizarInformacionPRS()**
Actualiza la información PRS de un donador existente.

```typescript
export function actualizarInformacionPRS(
  contactoId: string,
  datosPRS: Partial<{
    frecuenciaPRS: number;
    diasRecoleccionPRS: string[];
    horarioRecoleccionPRS: string;
    contactoPRS: string;
    telefonoPRS: string;
    notasPRS: string;
  }>
): boolean
```

**Validaciones**:
- ✅ Verifica que el contacto existe
- ✅ Verifica que el contacto ya participa en PRS

**Uso**:
```typescript
// Cambiar frecuencia a 2 veces por semana
actualizarInformacionPRS('contacto-123', {
  frecuenciaPRS: 2,
  diasRecoleccionPRS: ['Mardi', 'Jeudi']
});
```

---

### 6. **esParticipantePRS()**
Verifica si un contacto participa en el programa PRS.

```typescript
export function esParticipantePRS(contactoId: string): boolean
```

**Uso**:
```typescript
if (esParticipantePRS('contacto-123')) {
  // Mostrar badge PRS en la interfaz
}
```

---

### 7. **obtenerEstadisticasPRS()**
Obtiene estadísticas completas del programa PRS.

```typescript
export function obtenerEstadisticasPRS(): {
  totalParticipantes: number;
  participantesPorDepartamento: Record<string, number>;
  frecuenciaPromedio: number;
  diasMasActivos: string[];
}
```

**Retorna**:
- `totalParticipantes`: Cantidad total de donadores PRS
- `participantesPorDepartamento`: Distribución por departamento
- `frecuenciaPromedio`: Frecuencia promedio de recolección (redondeada a 1 decimal)
- `diasMasActivos`: Top 3 días con más recolecciones programadas

**Uso**:
```typescript
const stats = obtenerEstadisticasPRS();

console.log(`📊 Estadísticas PRS:
  - Total participantes: ${stats.totalParticipantes}
  - Frecuencia promedio: ${stats.frecuenciaPromedio}x/semana
  - Días más activos: ${stats.diasMasActivos.join(', ')}
`);
```

---

### 8. **obtenerDonadoresPRSPorDia()**
Obtiene donadores PRS que tienen recolección un día específico.

```typescript
export function obtenerDonadoresPRSPorDia(dia: string): ContactoDepartamento[]
```

**Parámetros**:
- `dia`: Día de la semana en francés ('Lundi', 'Mardi', etc.)

**Uso**:
```typescript
// Obtener donadores con recolección los lunes
const donadoresLundi = obtenerDonadoresPRSPorDia('Lundi');

console.log(`Recolecciones programadas para Lundi: ${donadoresLundi.length}`);
```

---

### 9. **buscarDonadoresPRS()**
Busca donadores PRS aplicando múltiples filtros.

```typescript
export function buscarDonadoresPRS(criterios: {
  nombreEmpresa?: string;
  ciudad?: string;
  frecuenciaMin?: number;
  dia?: string;
}): ContactoDepartamento[]
```

**Criterios de búsqueda**:
- `nombreEmpresa`: Búsqueda parcial en nombre de empresa, nombre o apellido
- `ciudad`: Búsqueda parcial en ciudad
- `frecuenciaMin`: Frecuencia mínima de recolección
- `dia`: Día específico de recolección

**Uso**:
```typescript
// Buscar supermercados en Montreal con recolección mínima 2x/semana
const resultados = buscarDonadoresPRS({
  nombreEmpresa: 'Supermarché',
  ciudad: 'Montréal',
  frecuenciaMin: 2
});

// Buscar donadores con recolección los miércoles en Laval
const donadoresMiercoles = buscarDonadoresPRS({
  ciudad: 'Laval',
  dia: 'Mercredi'
});
```

---

## 📊 Ejemplo de Implementación Completa

### Flujo de Trabajo Típico

```typescript
import {
  obtenerDonadoresPRS,
  activarParticipacionPRS,
  obtenerEstadisticasPRS,
  obtenerDonadoresPRSPorDia,
  buscarDonadoresPRS
} from '@/app/utils/contactosDepartamentoStorage';

// 1. Activar un donador en PRS
const activado = activarParticipacionPRS('contacto-456', {
  fechaInicioPRS: '2024-02-20',
  frecuenciaPRS: 3,
  diasRecoleccionPRS: ['Lundi', 'Mercredi', 'Vendredi'],
  horarioRecoleccionPRS: '07:00 - 09:00',
  contactoPRS: 'Marie Lefebvre',
  telefonoPRS: '(514) 555-1234',
  notasPRS: 'Accès par porte latérale. Sonner 2 fois.'
});

// 2. Obtener todos los donadores PRS
const todosDonadoresPRS = obtenerDonadoresPRS();
console.log(`Total donadores PRS activos: ${todosDonadoresPRS.length}`);

// 3. Ver estadísticas
const stats = obtenerEstadisticasPRS();
console.log(`
📊 Resumen PRS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Participantes: ${stats.totalParticipantes}
📈 Frecuencia promedio: ${stats.frecuenciaPromedio}x/semana
📅 Días más activos: ${stats.diasMasActivos.join(', ')}
`);

// 4. Planificar ruta del lunes
const donadoresLundi = obtenerDonadoresPRSPorDia('Lundi');
console.log(`Recolecciones programadas para Lundi: ${donadoresLundi.length}`);

donadoresLundi.forEach(donador => {
  console.log(`
  🏢 ${donador.nombreEmpresa}
  📍 ${donador.direccion}, ${donador.ciudad}
  🕐 ${donador.horarioRecoleccionPRS}
  👤 Contacto: ${donador.contactoPRS} (${donador.telefonoPRS})
  `);
});

// 5. Buscar donadores específicos
const supermarches = buscarDonadoresPRS({
  nombreEmpresa: 'Supermarché',
  frecuenciaMin: 2
});

console.log(`Supermarchés avec min 2 collectes/semaine: ${supermarches.length}`);
```

---

## 🎨 Integración con UI - Ejemplos de Uso

### Badge de Identificación PRS

```typescript
// En el componente de lista de contactos
import { esParticipantePRS } from '@/app/utils/contactosDepartamentoStorage';

function ContactoCard({ contacto }) {
  const isPRS = esParticipantePRS(contacto.id);
  
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2">
        <h3>{contacto.nombreEmpresa}</h3>
        {isPRS && (
          <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-semibold">
            🚚 PRS
          </span>
        )}
      </div>
      {/* Resto del card */}
    </div>
  );
}
```

### Panel de Estadísticas PRS

```typescript
import { obtenerEstadisticasPRS } from '@/app/utils/contactosDepartamentoStorage';

function PanelEstadisticasPRS() {
  const stats = obtenerEstadisticasPRS();
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="text-3xl font-bold text-pink-600">
          {stats.totalParticipantes}
        </div>
        <div className="text-sm text-gray-600">Donateurs PRS</div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="text-3xl font-bold text-pink-600">
          {stats.frecuenciaPromedio}x
        </div>
        <div className="text-sm text-gray-600">Fréquence moyenne/semaine</div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="text-sm font-semibold text-gray-700">Jours actifs</div>
        <div className="mt-2 flex gap-1">
          {stats.diasMasActivos.map(dia => (
            <span key={dia} className="px-2 py-1 bg-pink-50 text-pink-700 rounded text-xs">
              {dia}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Formulario de Activación PRS

```typescript
import { activarParticipacionPRS } from '@/app/utils/contactosDepartamentoStorage';
import { toast } from 'sonner';

function FormularioActivacionPRS({ contactoId, onSuccess }) {
  const [datos, setDatos] = useState({
    frecuenciaPRS: 1,
    diasRecoleccionPRS: [],
    horarioRecoleccionPRS: '',
    contactoPRS: '',
    telefonoPRS: '',
    notasPRS: ''
  });
  
  const handleActivar = () => {
    const exito = activarParticipacionPRS(contactoId, datos);
    
    if (exito) {
      toast.success('✅ Donateur activé dans le programme PRS');
      onSuccess();
    } else {
      toast.error('❌ Erreur lors de l\'activation PRS');
    }
  };
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); handleActivar(); }}>
      {/* Campos del formulario */}
      <Button type="submit">Activer dans PRS</Button>
    </form>
  );
}
```

---

## 🔍 Casos de Uso Prácticos

### 1. **Dashboard PRS**
Mostrar resumen ejecutivo del programa:
```typescript
const stats = obtenerEstadisticasPRS();
// Renderizar KPIs: total participantes, frecuencia, días activos
```

### 2. **Planificación de Rutas**
Crear rutas de recolección por día:
```typescript
const donadoresLundi = obtenerDonadoresPRSPorDia('Lundi');
// Ordenar por zona geográfica, generar ruta óptima
```

### 3. **Filtro de Búsqueda**
Permitir buscar donadores PRS específicos:
```typescript
const resultados = buscarDonadoresPRS({
  ciudad: 'Montréal',
  frecuenciaMin: 2
});
// Mostrar resultados en tabla/lista
```

### 4. **Gestión de Contacto**
En el formulario de edición de contacto:
```typescript
if (contacto.tipo === 'donador') {
  // Mostrar sección "Participation PRS"
  // Toggle para activar/desactivar
  // Campos adicionales si participaPRS === true
}
```

### 5. **Reportes**
Generar reportes mensuales:
```typescript
const donadoresPRS = obtenerDonadoresPRS();
const stats = obtenerEstadisticasPRS();

// Exportar CSV, PDF o Excel con:
// - Lista completa de participantes
// - Estadísticas agregadas
// - Calendario de recolecciones
```

---

## ✅ Validaciones Implementadas

### Activación PRS
- ✅ Solo donadores pueden participar en PRS
- ✅ El contacto debe existir
- ✅ Fecha de inicio por defecto: fecha actual
- ✅ Frecuencia por defecto: 1 vez/semana

### Actualización PRS
- ✅ El contacto debe existir
- ✅ El contacto debe estar previamente activado en PRS

### Filtros y Búsquedas
- ✅ Solo donadores activos con `participaPRS === true`
- ✅ Búsquedas case-insensitive
- ✅ Filtros acumulativos (AND lógico)

---

## 📦 Estructura de Archivos

```
/src/app/utils/
  └── contactosDepartamentoStorage.ts  // ⭐ Todas las funciones PRS aquí
      ├── Tipos: ContactoDepartamento (campos PRS agregados)
      ├── Funciones CRUD básicas
      └── Funciones PRS (líneas 1061-1254)
```

---

## 🚀 Próximos Pasos Sugeridos

### Fase 1: UI Básica ✅ (Completada)
- ✅ Badge "PRS" en listado de contactos
- ✅ Sección PRS en formulario de donadores
- ✅ Toggle para activar/desactivar participación

### Fase 2: Dashboard PRS (Sugerida)
- [ ] Panel de estadísticas PRS
- [ ] Lista filtrable de donadores PRS
- [ ] Calendario semanal de recolecciones
- [ ] Mapa de ubicaciones

### Fase 3: Planificación de Rutas (Sugerida)
- [ ] Generador de rutas por día
- [ ] Optimización de distancias
- [ ] Asignación de vehículos
- [ ] Export PDF de ruta diaria

### Fase 4: Reportes (Sugerida)
- [ ] Reporte mensual de recolecciones
- [ ] Estadísticas de participación
- [ ] Análisis de tendencias
- [ ] Export Excel/CSV

---

## 📝 Notas Técnicas

### Almacenamiento
- Todos los datos se almacenan en `localStorage`
- Key: `'contactos_departamentos'`
- Los campos PRS son opcionales y se guardan con los contactos existentes

### Compatibilidad
- ✅ Compatible con la estructura existente de contactos
- ✅ No afecta contactos que no son donadores
- ✅ Retrocompatible (campos opcionales)

### Performance
- ✅ Funciones optimizadas con filtros en memoria
- ✅ Sin impacto en rendimiento (< 1000 contactos)
- ✅ Búsquedas case-insensitive eficientes

---

## 🎯 Resumen Ejecutivo

Se ha implementado un **sistema completo y robusto** para gestionar los donadores del programa PRS, incluyendo:

- ✅ **8 nuevos campos** en la estructura de datos
- ✅ **9 funciones especializadas** para gestión PRS
- ✅ **Validaciones completas** en todas las operaciones
- ✅ **Búsquedas y filtros avanzados**
- ✅ **Estadísticas y reportes** automáticos
- ✅ **100% compatible** con el sistema existente

El sistema está listo para ser integrado en la UI y permite identificar, gestionar y analizar todos los donadores participantes del programa PRS de manera eficiente y escalable.
