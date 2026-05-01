# Sistema de ID Digital Genérico

## Descripción

El sistema de ID Digital ha sido estandarizado para todos los módulos del Banco de Alimentos. Ahora todos los módulos utilizan el mismo diseño profesional y consistente.

## Componente Principal

**Ubicación:** `/src/app/components/shared/IDDigitalGenerico.tsx`

Este es el componente base que genera las tarjetas de identificación digital para cualquier tipo de usuario.

## Características

- ✅ Diseño profesional y moderno con gradientes
- ✅ Código QR funcional con información del usuario
- ✅ Colores personalizables por módulo/rol
- ✅ Botones de acción: Descargar, Compartir, Enviar por email, Imprimir
- ✅ Accesible para lectores de pantalla
- ✅ Responsive y preparado para impresión
- ✅ Compatible con todos los navegadores

## Uso en Módulos

### Módulo de Bénévoles (Voluntarios)

**Componente:** `/src/app/components/benevoles/IDDigitalBenevole.tsx`
**Color:** Verde (#4CAF50)

```tsx
<IDDigitalBenevole
  benevole={benevole}
  isOpen={idDigitalModalOpen}
  onClose={() => setIdDigitalModalOpen(false)}
/>
```

### Módulo de Usuarios Internos

**Componente:** `/src/app/components/usuarios/IDDigitalUsuarioInterno.tsx`
**Colores:** Depende de la categoría
- Bénévole: Verde (#4CAF50)
- Employé: Azul (#1E73BE)
- Programme: Púrpura (#9C27B0)
- PTC: Naranja (#FF9800)
- Donateur: Azul claro (#2196F3)
- Vendeur: Rosa (#E91E63)

```tsx
<IDDigitalUsuarioInterno
  usuario={usuario}
  isOpen={idDigitalOpen}
  onClose={() => setIdDigitalOpen(false)}
/>
```

## Cómo Crear un ID Digital para Otro Módulo

1. **Crear un componente adaptador** en la carpeta correspondiente:

```tsx
import React from 'react';
import { IDDigitalGenerico, IDDigitalData } from '../shared/IDDigitalGenerico';

interface MiEntidad {
  // ... propiedades de tu entidad
}

interface IDDigitalMiEntidadProps {
  entidad: MiEntidad;
  isOpen: boolean;
  onClose: () => void;
}

export function IDDigitalMiEntidad({ entidad, isOpen, onClose }: IDDigitalMiEntidadProps) {
  const idData: IDDigitalData = {
    identifiant: entidad.id,
    nom: entidad.apellido,
    prenom: entidad.nombre,
    email: entidad.email,
    telephone: entidad.telefono,
    role: 'Bénéficiaire', // o el rol correspondiente
    departement: entidad.departamento, // opcional
    dateInscription: entidad.fechaRegistro,
    statut: entidad.activo ? 'actif' : 'inactif',
    metrique: { // opcional
      label: 'Visitas realizadas',
      valor: `${entidad.visitas}`
    },
    couleurTheme: '#1E73BE', // Color personalizado
    qrData: { // datos adicionales para el QR (opcional)
      tipo: 'beneficiaire',
      categoria: entidad.categoria
    }
  };

  return (
    <IDDigitalGenerico
      data={idData}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
```

2. **Importar y usar** en tu componente de página:

```tsx
import { IDDigitalMiEntidad } from '../mi-modulo/IDDigitalMiEntidad';

// En tu componente:
const [idDigitalOpen, setIdDigitalOpen] = useState(false);
const [entidadSeleccionada, setEntidadSeleccionada] = useState<MiEntidad | null>(null);

// En tu render:
{entidadSeleccionada && (
  <IDDigitalMiEntidad
    entidad={entidadSeleccionada}
    isOpen={idDigitalOpen}
    onClose={() => {
      setIdDigitalOpen(false);
      setEntidadSeleccionada(null);
    }}
  />
)}
```

## Interface IDDigitalData

```typescript
export interface IDDigitalData {
  // Información básica (obligatorio)
  identifiant: string;      // ID único
  nom: string;              // Apellido
  prenom: string;           // Nombre
  email: string;            // Email
  telephone: string;        // Teléfono
  
  // Rol/Departamento (obligatorio)
  role: string;             // Ej: "Bénévole", "Employé", "Bénéficiaire"
  departement?: string;     // Departamento o área (opcional)
  
  // Fechas (obligatorio)
  dateInscription: string;  // Fecha de inscripción/registro
  
  // Estadísticas/métricas (opcional)
  metrique?: {
    label: string;          // Ej: "Heures accumulées"
    valor: string | number; // Ej: "120h" o 120
  };
  
  // Estado (obligatorio)
  statut: 'actif' | 'inactif' | 'en pause';
  
  // Personalización (opcional)
  couleurTheme?: string;    // Color hex (default: #4CAF50)
  
  // Datos QR adicionales (opcional)
  qrData?: Record<string, any>;
}
```

## Colores Recomendados por Módulo

- **Bénévoles (Voluntarios):** `#4CAF50` (Verde)
- **Employés (Empleados):** `#1E73BE` (Azul)
- **Bénéficiaires (Beneficiarios):** `#2196F3` (Azul claro)
- **Transport:** `#FF9800` (Naranja)
- **Donateurs:** `#9C27B0` (Púrpura)
- **Organismes:** `#4CAF50` (Verde)

## Notas Importantes

- El componente genérico maneja automáticamente la accesibilidad (ARIA labels)
- Los códigos QR se generan automáticamente con la información proporcionada
- El diseño es responsive y se adapta a móviles
- La función de impresión está pre-configurada con estilos optimizados
- Los colores se ajustan automáticamente según el tema proporcionado
