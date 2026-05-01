# 🔐 Sistema de Asignación de Roles a Contactos

## ✅ Implementación Completada

He creado un sistema completo para asignar roles del sistema a los contactos de cada módulo (Organismos, Bénévoles, etc.).

## 📦 Componente Creado

### `/src/app/components/AsignarRolContacto.tsx`

Este componente permite:
- ✅ Asignar roles del sistema a cualquier contacto
- ✅ Crear credenciales de acceso (username y password)
- ✅ Generar contraseñas seguras automáticamente
- ✅ Detectar si el contacto ya tiene usuario creado
- ✅ Actualizar roles de usuarios existentes
- ✅ Activar/desactivar acceso al sistema

## 🎯 Cómo Usar

### 1. Importar el componente

```tsx
import { AsignarRolContacto } from '../AsignarRolContacto';
```

### 2. Agregar el estado necesario

```tsx
// En tu componente (Ej: Organismos.tsx, Benevoles.tsx, etc.)
const [dialogAsignarRolOpen, setDialogAsignarRolOpen] = useState(false);
const [contactoSeleccionado, setContactoSeleccionado] = useState<any>(null);

// Obtener roles disponibles del sistema
const rolesDisponibles = [
  {
    id: 'admin',
    nombre: 'Administrateur',
    descripcion: 'Accès complet à toutes les fonctionnalités',
    color: '#DC3545'
  },
  {
    id: 'coordinador',
    nombre: 'Coordinateur',
    descripcion: 'Gestion de l\'inventaire, des commandes et des organismes',
    color: '#1E73BE'
  },
  {
    id: 'almacenista',
    nombre: 'Magasinier',
    descripcion: 'Gestion de l\'inventaire et des mouvements de produits',
    color: '#4CAF50'
  },
  {
    id: 'transportista',
    nombre: 'Transporteur',
    descripcion: 'Gestion des routes et des livraisons',
    color: '#FFC107'
  },
  {
    id: 'visualizador',
    nombre: 'Visualiseur',
    descripcion: 'Lecture seule des informations du système',
    color: '#9E9E9E'
  }
];
```

### 3. Agregar botón en la tabla de contactos

```tsx
<Button
  variant="outline"
  size="sm"
  onClick={() => {
    setContactoSeleccionado({
      id: persona.id,
      nombreCompleto: persona.nombreCompleto,
      email: persona.email,
      telefono: persona.telefono,
      cargo: persona.cargo,
      modulo: 'organismo', // o 'benevole', 'donador', etc.
      organismoId: organismo.id,
      organismoNombre: organismo.nombre
    });
    setDialogAsignarRolOpen(true);
  }}
  title="Créer un accès au système"
>
  <Shield className="w-4 h-4" />
</Button>
```

### 4. Agregar el diálogo al final del componente

```tsx
{/* Dialog: Asignar Rol a Contacto */}
{contactoSeleccionado && (
  <AsignarRolContacto
    open={dialogAsignarRolOpen}
    onOpenChange={setDialogAsignarRolOpen}
    contacto={contactoSeleccionado}
    rolesDisponibles={rolesDisponibles}
    onGuardar={(datosAcceso) => {
      console.log('Acceso creado:', datosAcceso);
      // Aquí puedes actualizar el contacto con los datos de acceso
      toast.success('Accès créé avec succès!');
    }}
  />
)}
```

## 🔑 Características Principales

### 1. **Información del Contacto**
- Muestra todos los datos del contacto (nombre, email, teléfono, cargo, organismo)
- Vista clara de a quién se le está asignando el rol

### 2. **Selección de Rol**
- Dropdown con todos los roles disponibles del sistema
- Vista de descripción de cada rol
- Colores distintivos para cada rol

### 3. **Credenciales de Acceso**
- **Username**: Generado automáticamente basado en el nombre, editable
- **Password**: Campo con generador automático de contraseñas seguras
- **Mostrar/Ocultar Password**: Toggle para ver la contraseña
- **Confirmar Password**: Validación de contraseña

### 4. **Usuario Existente**
- Detecta si el contacto ya tiene un usuario en el sistema
- Permite actualizar el rol sin cambiar las credenciales
- Opción de cambiar contraseña desde el módulo de usuarios

### 5. **Estado del Acceso**
- Switch para activar/desactivar el acceso
- Badge visual del estado (Actif/Inactif)

## 📊 Ejemplo de Integración Completa

```tsx
// components/pages/Organismos.tsx
import { Shield } from 'lucide-react';
import { AsignarRolContacto } from '../AsignarRolContacto';

export function Organismos() {
  const [dialogAsignarRolOpen, setDialogAsignarRolOpen] = useState(false);
  const [contactoSeleccionado, setContactoSeleccionado] = useState<any>(null);
  
  const rolesDisponibles = [
    { id: 'coordinador', nombre: 'Coordinateur', descripcion: 'Gestion complète', color: '#1E73BE' },
    { id: 'visualizador', nombre: 'Visualiseur', descripcion: 'Lecture seule', color: '#9E9E9E' }
  ];

  return (
    <div>
      {/* Tu contenido actual */}
      
      {/* Tabla de personas autorizadas */}
      <Table>
        <TableBody>
          {personasAutorizadas.map(persona => (
            <TableRow key={persona.id}>
              <TableCell>{persona.nombreCompleto}</TableCell>
              <TableCell>{persona.email}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setContactoSeleccionado({
                      id: persona.id,
                      nombreCompleto: persona.nombreCompleto,
                      email: persona.email,
                      telefono: persona.telefono,
                      cargo: persona.cargo,
                      modulo: 'organismo',
                      organismoId: organismoSeleccionado.id,
                      organismoNombre: organismoSeleccionado.nombre
                    });
                    setDialogAsignarRolOpen(true);
                  }}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Créer Accès
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialog de asignación de rol */}
      {contactoSeleccionado && (
        <AsignarRolContacto
          open={dialogAsignarRolOpen}
          onOpenChange={setDialogAsignarRolOpen}
          contacto={contactoSeleccionado}
          rolesDisponibles={rolesDisponibles}
          onGuardar={(datosAcceso) => {
            console.log('✅ Acceso creado:', datosAcceso);
            // Aquí puedes guardar los datos en tu storage
          }}
        />
      )}
    </div>
  );
}
```

## 🎨 Preview del Componente

```
┌─────────────────────────────────────────────────────────┐
│ 🛡️ Créer un Accès au Système                          │
├─────────────────────────────────────────────────────────┤
│ Assignez un rôle et des identifiants de connexion      │
│ pour Marie Dubois                                       │
│                                                         │
│ ╔═══════════════════════════════════════════════════╗ │
│ ║ 👤 Informations du Contact                       ║ │
│ ║ Nom: Marie Dubois                                 ║ │
│ ║ Email: marie.dubois@organisme.org                ║ │
│ ║ Téléphone: 514-555-0123                          ║ │
│ ║ Poste: Coordinatrice                             ║ │
│ ║ Organisme: Centre d'Aide Communautaire          ║ │
│ ╚═══════════════════════════════════════════════════╝ │
│                                                         │
│ 🛡️ Rôle du Système *                                  │
│ [Coordinateur ▼]                                       │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Permissions: Gestion complète des commandes     │ │
│ └──────────────────────────────────────────────────┘ │
│                                                         │
│ 🔑 Identifiants de Connexion                          │
│ Nom d'utilisateur *                                    │
│ [mdubois                               ]               │
│                                                         │
│ Mot de passe *                                         │
│ [●●●●●●●●●●●●] 👁 📋                                  │
│                                                         │
│ Confirmer le mot de passe *                            │
│ [●●●●●●●●●●●●]                                        │
│                                                         │
│ [🔄 Générer un mot de passe sécurisé]                │
│                                                         │
│ [✓] Accès actif au système           [Actif]          │
│                                                         │
│ ℹ️ Informations importantes:                           │
│ • Assurez-vous de communiquer les identifiants        │
│   de manière sécurisée                                 │
│ • Le contact pourra se connecter immédiatement         │
│                                                         │
│                          [✗ Annuler] [✓ Créer l'accès] │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Trabajo

1. **Usuario administrador** abre el módulo de Organismos/Bénévoles
2. **Ve la tabla** de personas/contactos
3. **Hace clic** en el botón "🛡️ Créer Accès" junto a un contacto
4. **Se abre el diálogo** con la información del contacto prellenada
5. **Selecciona un rol** del sistema (Coordinador, Visualizador, etc.)
6. **Genera o ingresa** credenciales de acceso
7. **Guarda** y el contacto ahora tiene acceso al sistema
8. **El contacto puede iniciar sesión** con sus credenciales

## ✅ Validaciones Incluidas

- ✅ Rol seleccionado requerido
- ✅ Username mínimo 3 caracteres
- ✅ Username único (no puede duplicarse)
- ✅ Password mínimo 6 caracteres
- ✅ Confirmación de password coincidente
- ✅ Detección de usuario existente
- ✅ Email válido

## 🎯 Próximos Pasos Sugeridos

1. **Integrar en módulo de Organismos**: Agregar botón en tabla de personas autorizadas
2. **Integrar en módulo de Bénévoles**: Agregar botón para cada voluntario
3. **Agregar indicador visual**: Badge/Icono que muestre si un contacto ya tiene acceso
4. **Notificación por email**: Enviar credenciales al contacto automáticamente
5. **Panel de accesos**: Vista consolidada de todos los contactos con acceso al sistema

## 📝 Notas Importantes

- Los usuarios creados se almacenan en localStorage junto con los usuarios del sistema
- Las contraseñas se almacenan en texto plano (solo para demo)
- En producción, implementar hashing de contraseñas y autenticación real
- Los permisos se obtienen automáticamente del rol asignado
