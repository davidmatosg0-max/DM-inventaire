# Sistema de Autocompletado de Direcciones

## Componente: AddressAutocomplete

### Ubicación
`/src/app/components/ui/address-autocomplete.tsx`

### Características
- ✅ Base de datos de **250+ calles** de Québec (Laval, Montréal, Québec)
- ✅ Autocompletado inteligente: escribir número cívico + filtrar por nombre
- ✅ Auto-relleno de ciudad y código postal
- ✅ Navegación por teclado (↑↓ Enter Esc)
- ✅ Diseño responsive y accesible

---

## Cómo Implementar en Nuevos Formularios

### 1. Importar el Componente

```typescript
import { AddressAutocomplete } from '../ui/address-autocomplete';
```

### 2. Usar en el Formulario

#### **Ejemplo Básico:**

```typescript
<AddressAutocomplete
  onAddressSelect={(address) => {
    setFormData({ 
      ...formData, 
      direccion: address.street,
      ciudad: address.city,
      codigoPostal: address.postalCode
    });
  }}
  disabled={false}
  initialValue={formData.direccion}
  label="Dirección *"
  placeholder="Ex: 123 Boulevard Saint-Martin Est"
  required={true}
/>
```

#### **Ejemplo con Estado Separado:**

```typescript
const [direccion, setDireccion] = useState('');
const [ciudad, setCiudad] = useState('');
const [codigoPostal, setCodigoPostal] = useState('');

<AddressAutocomplete
  onAddressSelect={(address) => {
    setDireccion(address.street);
    setCiudad(address.city);
    setCodigoPostal(address.postalCode);
  }}
  initialValue={direccion}
  label="Adresse complète"
  required={true}
/>
```

### 3. Props del Componente

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `onAddressSelect` | `(address) => void` | ✅ Sí | - | Callback cuando se selecciona dirección |
| `disabled` | `boolean` | ❌ No | `false` | Deshabilitar el input |
| `initialValue` | `string` | ❌ No | `''` | Valor inicial de la dirección |
| `placeholder` | `string` | ❌ No | `'Ex: 123 Boulevard...'` | Texto de placeholder |
| `label` | `string` | ❌ No | `'Adresse'` | Etiqueta del campo |
| `required` | `boolean` | ❌ No | `false` | Si el campo es obligatorio |

### 4. Estructura del Objeto `address`

```typescript
interface AddressSuggestion {
  street: string;       // "123 Boulevard Saint-Martin Est"
  city: string;         // "Laval" o "Montréal"
  postalCode: string;   // "H7T 1C7"
  apt: string;          // "" (vacío por defecto)
}
```

---

## Archivos Ya Actualizados

✅ **FicheBeneficiaire.tsx** (Comptoir)  
✅ **Organismos.tsx**  
✅ **UsuariosInternos.tsx**  
✅ **VistaPublicaOrganismo_fix.tsx**  

---

## Funcionalidad

### Flujo de Usuario:

1. **Usuario escribe número cívico:**
   ```
   Entrada: "123"
   → Muestra TODAS las calles con el número: "123 Boulevard Saint-Martin Est", etc.
   ```

2. **Usuario filtra por nombre de calle:**
   ```
   Entrada: "123 saint"
   → Muestra solo: "123 Boulevard Saint-Martin Est", "123 Rue Saint-Denis", etc.
   ```

3. **Usuario selecciona dirección:**
   ```
   → Auto-rellena: dirección completa, ciudad, código postal
   ```

### Detección Automática de Ciudad:

```typescript
// Montréal: calles como Saint-Laurent, Sherbrooke, Mont-Royal
// Laval: resto de calles (default)
// Québec: Grande Allée, Cartier
```

---

## Estilo Visual

- **Color primario:** `#1E73BE` (azul del sistema)
- **Número cívico destacado:** en negrita y azul
- **Hover:** `#E3F2FD` (azul claro)
- **Bordes:** `#CCCCCC`
- **Iconos:** Lucide React (Search, MapPin, Loader2)

---

## Notas Importantes

⚠️ **NO usar más los sistemas antiguos de dirección:**
- ❌ `lavalAddresses.ts` (deprecated)
- ❌ Inputs manuales separados para número/calle/barrio
- ❌ Dropdowns personalizados

✅ **SIEMPRE usar `AddressAutocomplete`** en cualquier formulario nuevo con dirección

---

## Extensibilidad

Para agregar más calles, editar el array `streets` en:
`/src/app/components/ui/address-autocomplete.tsx` (línea ~38)

```typescript
const streets = [
  'Nueva Calle Aquí',
  // ... resto de calles
];
```

---

## Soporte Multilingüe

El componente está preparado para i18n. Los placeholders y labels se pueden pasar como props traducidos:

```typescript
const { t } = useTranslation();

<AddressAutocomplete
  label={t('forms.address')}
  placeholder={t('forms.addressPlaceholder')}
/>
```
