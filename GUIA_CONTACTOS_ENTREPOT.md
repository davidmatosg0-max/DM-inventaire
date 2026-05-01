# 📇 GUÍA DE INTEGRACIÓN: Formulario Compacto de Contactos para Entrepôt

## 🎯 Descripción

Se ha creado el sistema completo de **Gestión de Contactos para Entrepôt**, que incluye:
1. **FormularioContactoEntrepotCompacto** - Formulario compacto con tabs
2. **GestionContactosEntrepot** - Página completa de gestión

Este módulo gestiona proveedores, transportistas y otros contactos relacionados con el almacén.

---

## ✅ Componentes Creados

### **1. FormularioContactoEntrepotCompacto.tsx**
- **Ubicación**: `/src/app/components/inventario/FormularioContactoEntrepotCompacto.tsx`
- **Uso**: Crear y editar contactos del almacén
- **Tamaño**: 95vw × 95vh (sin scroll excesivo)

### **2. GestionContactosEntrepot.tsx**
- **Ubicación**: `/src/app/components/inventario/GestionContactosEntrepot.tsx`
- **Uso**: Página completa con tabla, búsqueda y estadísticas
- **Funcionalidades**: CRUD completo de contactos

---

## 📐 Estructura del Formulario

### **Sidebar Izquierda (256px)**

#### 1. **Foto del Contacto**
- Vista circular con borde del color primario
- Botón de cámara para subir foto
- Iniciales del contacto por defecto

#### 2. **Tipo de Contacto**
Cards interactivos con colores específicos:
- 📦 **Proveedor** (Fournisseur) - Azul #1E73BE
- 🚚 **Transportista** (Transporteur) - Verde #4CAF50
- 👤 **Otro** (Autre) - Naranja #FF9800

#### 3. **Estado (Activo/Inactivo)**
- Toggle interactivo
- Verde para activo, rojo para inactivo
- Cambio visual inmediato

### **7 Tabs Organizadas**

#### **Tab 1: Informations de Base** (User icon)
```
┌──────────────────────┬──────────────────────┐
│ Prénom *             │ Nom *                │
│ [Jean]               │ [Dupont]             │
└──────────────────────┴──────────────────────┘
┌───────────────────────────────────────────┐
│ Numéro d'ID *                             │
│ [PRV-2024-001]                            │
└───────────────────────────────────────────┘
```

#### **Tab 2: Entreprise** (Building2 icon)
```
┌───────────────────────────────────────────┐
│ Nom de l'entreprise                       │
│ [Aliments ABC Inc.]                       │
└───────────────────────────────────────────┘
┌──────────────────────┬──────────────────────┐
│ Type d'entreprise    │ N° d'enregistrement  │
│ [Inc., Ltée, etc.]   │ [1234567890 RC]      │
└──────────────────────┴──────────────────────┘
┌───────────────────────────────────────────┐
│ Numéro de TVA                             │
│ [123456789 TQ / RT]                       │
└───────────────────────────────────────────┘
```

#### **Tab 3: Contact** (Phone icon)
```
┌──────────────────────┬──────────────────────┐
│ Email principal *    │ Email secondaire     │
│ [contact@...]        │ [info@...]           │
└──────────────────────┴──────────────────────┘
┌──────────────────────┬──────────────────────┐
│ Téléphone principal *│ Téléphone second.    │
│ [+1 514 123-4567]    │ [+1 514 987-6543]    │
└──────────────────────┴──────────────────────┘
┌───────────────────────────────────────────┐
│ Site Web                                   │
│ [https://www.exemple.com]                  │
└───────────────────────────────────────────┘
```

#### **Tab 4: Adresse** (MapPin icon)
```
┌───────────────────────────────────────────┐
│ Adresse                                    │
│ [123 Rue Principale]                       │
└───────────────────────────────────────────┘
┌──────────────────────┬──────────────────────┐
│ Ville                │ Province             │
│ [Montréal]           │ [Québec ▼]           │
└──────────────────────┴──────────────────────┘
┌──────────────────────┬──────────────────────┐
│ Code postal          │ Pays                 │
│ [H2X 3Y7]            │ [🇨🇦 Canada ▼]       │
└──────────────────────┴──────────────────────┘
```

#### **Tab 5: Bancaire** (CreditCard icon) - Solo para Proveedores
```
╔════════════════════════════════════════╗
║ ℹ️ Informations bancaires              ║
║ Pour les paiements et virements        ║
╚════════════════════════════════════════╝
┌───────────────────────────────────────────┐
│ Nom de la banque                          │
│ [Banque Nationale]                        │
└───────────────────────────────────────────┘
┌──────────────────────┬──────────────────────┐
│ Numéro de compte     │ Numéro de transit    │
│ [1234567]            │ [12345-001]          │
└──────────────────────┴──────────────────────┘
```

#### **Tab 6: Préférences** (Settings icon)
```
┌───────────────────────────────────────────┐
│ Température spécialisée                   │
│ [🌡️] [❄️] [🧊] [🌿]                      │
│ (Sélection multiple)                      │
└───────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│ Jours d'opération                         │
│ [Lun] [Mar] [Mer] [Jeu] [Ven] [Sam] [Dim]│
│ (Sélection multiple)                      │
└───────────────────────────────────────────┘

┌──────────────────────┬──────────────────────┐
│ Horaire disponible   │ Délai de livraison   │
│ [8h00 - 17h00]       │ [24-48 heures]       │
└──────────────────────┴──────────────────────┘

┌───────────────────────────────────────────┐
│ Méthodes de paiement                      │
│ [🏦] [📝] [💵] [💳]                       │
│ (Sélection multiple)                      │
└───────────────────────────────────────────┘
```

#### **Tab 7: Autres** (FileText icon)
```
┌───────────────────────────────────────────┐
│ Notes                                      │
│ ┌─────────────────────────────────────┐   │
│ │                                     │   │
│ │ [Textarea pour notes]               │   │
│ │                                     │   │
│ └─────────────────────────────────────┘   │
└───────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│ Étiquettes                                │
│ [vip, fiable, rapide]                     │
│ (Séparées par virgules)                   │
└───────────────────────────────────────────┘
```

---

## 🗂️ Estructura de Datos

### **FormContactoEntrepotData**

```typescript
interface FormContactoEntrepotData {
  // Base
  tipoContacto: 'proveedor' | 'transportista' | 'otro';
  nombre: string;
  apellido: string;
  numeroID: string;
  imagen: string | null;
  
  // Empresa
  nombreEmpresa: string;
  tipoEmpresa: string;
  numeroRegistro: string;
  numeroTVA: string;
  
  // Contacto
  emailPrincipal: string;
  emailSecundario: string;
  telefonoPrincipal: string;
  telefonoSecundario: string;
  sitioWeb: string;
  
  // Dirección
  direccion: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
  
  // Bancario (para proveedores)
  banco: string;
  numeroCuenta: string;
  numeroRuta: string;
  
  // Preferencias
  categoriaProductos: string[];
  temperaturaEspecializada: string[];
  horarioDisponible: string;
  diasOperacion: string[];
  tiempoEntrega: string;
  metodoPago: string[];
  
  // Otros
  notas: string;
  etiquetas: string[];
  activo: boolean;
}
```

---

## 🎨 Página de Gestión: GestionContactosEntrepot

### **Características**

#### 1. **Dashboard con Estadísticas**
- 📊 Total de contactos
- 📦 Total de proveedores
- 🚚 Total de transportistas
- ⭐ Contactos activos

#### 2. **Búsqueda Avanzada**
- 🔍 Búsqueda por nombre, empresa, ID
- 🏷️ Filtros por tipo (todos, proveedores, transportistas)
- ⚡ Actualización en tiempo real

#### 3. **Tabla Completa**
Columnas:
- Tipo (con badge colorido)
- Contacto (con avatar)
- Empresa
- Teléfono
- Email
- Ubicación
- Estado (activo/inactivo)
- Acciones (editar, eliminar)

#### 4. **Acciones Rápidas**
- ➕ Nuevo contacto
- ✏️ Editar contacto
- 🗑️ Eliminar contacto
- 👁️ Ver detalles

---

## 🔧 Cómo Integrar

### **Paso 1: Importar el Componente**

En tu archivo de rutas o navegación principal (por ejemplo, en el Layout o Router):

```tsx
import { GestionContactosEntrepot } from './components/inventario/GestionContactosEntrepot';
```

### **Paso 2: Agregar a la Navegación del Entrepôt**

Si tienes un sistema de pestañas o navegación en el módulo entrepôt:

```tsx
// En tu componente de navegación del entrepôt
const [vistaActual, setVistaActual] = useState('inventario');

// Agregar la opción de contactos
<Tabs value={vistaActual} onValueChange={setVistaActual}>
  <TabsList>
    <TabsTrigger value="inventario">
      <Package className="w-4 h-4 mr-2" />
      Inventaire
    </TabsTrigger>
    <TabsTrigger value="contactos">
      <Users className="w-4 h-4 mr-2" />
      Contacts
    </TabsTrigger>
  </TabsList>

  <TabsContent value="inventario">
    {/* Componente de inventario */}
  </TabsContent>

  <TabsContent value="contactos">
    <GestionContactosEntrepot />
  </TabsContent>
</Tabs>
```

### **Paso 3: O Crear Ruta Independiente**

Si prefieres una ruta separada:

```tsx
// En tu router
{
  path: '/entrepot/contacts',
  element: <GestionContactosEntrepot />
}
```

---

## 📝 Traducciones Necesarias

Asegúrate de agregar estas claves al archivo de traducciones (i18n):

```json
{
  "warehouse": {
    "contacts": "Contacts",
    "contactsDescription": "Gérer les fournisseurs, transporteurs et autres contacts",
    "newContact": "Nouveau contact",
    "editContact": "Modifier le contact",
    "contactDescription": "Informations complètes du contact",
    "contactPhoto": "Photo du contact",
    "contactType": "Type de contact",
    "supplier": "Fournisseur",
    "transporter": "Transporteur",
    "other": "Autre",
    "status": "Statut",
    "basicInfo": "Informations de base",
    "company": "Entreprise",
    "contact": "Contact",
    "address": "Adresse",
    "banking": "Bancaire",
    "preferences": "Préférences",
    "firstName": "Prénom",
    "lastName": "Nom",
    "idNumber": "Numéro d'ID",
    "companyName": "Nom de l'entreprise",
    "companyType": "Type d'entreprise",
    "selectType": "Sélectionner le type",
    "registrationNumber": "Numéro d'enregistrement",
    "taxNumber": "Numéro de TVA",
    "primaryEmail": "Email principal",
    "secondaryEmail": "Email secondaire",
    "primaryPhone": "Téléphone principal",
    "secondaryPhone": "Téléphone secondaire",
    "website": "Site Web",
    "streetAddress": "Adresse",
    "city": "Ville",
    "province": "Province",
    "selectProvince": "Sélectionner la province",
    "postalCode": "Code postal",
    "country": "Pays",
    "selectCountry": "Sélectionner le pays",
    "bankingInfo": "Informations bancaires",
    "bankingDescription": "Pour les paiements et virements",
    "bankName": "Nom de la banque",
    "accountNumber": "Numéro de compte",
    "transitNumber": "Numéro de transit",
    "specializedTemperature": "Température spécialisée",
    "operatingDays": "Jours d'opération",
    "availableSchedule": "Horaire disponible",
    "deliveryTime": "Délai de livraison",
    "paymentMethods": "Méthodes de paiement",
    "transfer": "Virement",
    "check": "Chèque",
    "cash": "Comptant",
    "credit": "Crédit",
    "notes": "Notes",
    "notesPlaceholder": "Notes additionnelles...",
    "tags": "Étiquettes",
    "tagsHelp": "Séparées par virgules",
    "requiredFields": "Veuillez remplir tous les champs obligatoires",
    "requiredContact": "Email et téléphone sont requis",
    "contactCreated": "Contact créé avec succès",
    "contactUpdated": "Contact modifié avec succès",
    "contactDeleted": "Contact supprimé avec succès",
    "confirmDelete": "Êtes-vous sûr de vouloir supprimer ce contact ?",
    "totalContacts": "Total contacts",
    "suppliers": "Fournisseurs",
    "transporters": "Transporteurs",
    "active": "Actifs",
    "searchContacts": "Rechercher un contact...",
    "contactList": "Liste des contacts",
    "type": "Type",
    "phone": "Téléphone",
    "email": "Email",
    "location": "Localisation",
    "ambient": "Ambiant",
    "refrigerated": "Réfrigéré",
    "frozen": "Congelé",
    "fresh": "Frais"
  },
  "common": {
    "all": "Tous",
    "active": "Actif",
    "inactive": "Inactif",
    "cancel": "Annuler",
    "save": "Enregistrer",
    "edit": "Modifier",
    "delete": "Supprimer",
    "actions": "Actions",
    "monday": "Lundi",
    "tuesday": "Mardi",
    "wednesday": "Mercredi",
    "thursday": "Jeudi",
    "friday": "Vendredi",
    "saturday": "Samedi",
    "sunday": "Dimanche"
  }
}
```

---

## ✅ Validaciones Implementadas

```typescript
// Campos obligatorios
- nombre *
- apellido *
- numeroID *
- emailPrincipal *
- telefonoPrincipal *

// Validación de formato
- Email: formato válido
- Teléfono: formato canadiense recomendado (+1 XXX XXX-XXXX)
- Código postal: formato canadiense (A1A 1A1)
- Sitio web: formato URL válido
```

---

## 🎯 Características Especiales

### 1. **Tab Bancaire Condicional**
- Solo aparece para contactos de tipo "proveedor"
- Se oculta automáticamente para transportistas y otros

### 2. **Selección Múltiple Visual**
- Temperaturas especializadas (4 opciones)
- Días de operación (7 días)
- Métodos de pago (4 opciones)
- Feedback visual inmediato con colores

### 3. **Avatar Dinámico**
- Foto del contacto o iniciales
- Color según tipo de contacto
- Borde con color primario del branding

### 4. **Toggle de Estado**
- Switch interactivo en el sidebar
- Cambio visual inmediato
- Verde (activo) o rojo (inactivo)

### 5. **Formato Canadiense**
- Provincias de Canadá
- Formato de código postal (A1A 1A1)
- Formato de teléfono (+1 XXX XXX-XXXX)
- Numeración bancaria canadiense

---

## 📊 Comparación Antes vs Después

| Característica | ANTES ❌ | DESPUÉS ✅ |
|----------------|----------|-----------|
| **Gestión de contactos** | No existe | Sistema completo |
| **Proveedores** | Dispersos | Centralizados |
| **Transportistas** | Sin registro | Bien organizados |
| **Información bancaria** | Manual | Estructurada |
| **Búsqueda** | No disponible | Búsqueda en tiempo real |
| **Estadísticas** | No disponible | Dashboard completo |
| **Formulario** | N/A | Compacto con 7 tabs |
| **Tiempo de captura** | N/A | ~20 segundos |
| **Validaciones** | N/A | Completas y claras |

---

## 🚀 Próximos Pasos

### 1. Integrar en el Módulo Entrepôt
- [ ] Agregar a la navegación del entrepôt
- [ ] Configurar ruta si es necesario
- [ ] Probar integración completa

### 2. Agregar Traducciones
- [ ] Español
- [ ] Francés (por defecto)
- [ ] Inglés
- [ ] Árabe (si aplica)

### 3. Testing
- [ ] Crear contacto proveedor
- [ ] Crear contacto transportista
- [ ] Editar contacto existente
- [ ] Eliminar contacto
- [ ] Búsqueda y filtros
- [ ] Validaciones de formulario
- [ ] Tab bancaire condicional

### 4. Mejoras Futuras (Opcional)
- [ ] Importar contactos desde CSV
- [ ] Exportar lista de contactos
- [ ] Historial de interacciones
- [ ] Recordatorios de contacto
- [ ] Integración con email
- [ ] Integración con teléfono
- [ ] Rating de proveedores
- [ ] Estadísticas de desempeño

---

## 💡 Casos de Uso

### **Caso 1: Nuevo Proveedor**
1. Usuario hace clic en "Nouveau contact"
2. Selecciona tipo "Proveedor" en sidebar
3. Completa información básica (Tab 1)
4. Agrega datos de empresa (Tab 2)
5. Ingresa emails y teléfonos (Tab 3)
6. Completa dirección (Tab 4)
7. Agrega información bancaria (Tab 5)
8. Define preferencias de temperatura y días (Tab 6)
9. Agrega notas y etiquetas (Tab 7)
10. Guarda contacto
**Tiempo**: ~30 segundos

### **Caso 2: Nuevo Transportista**
1. Usuario hace clic en "Nouveau contact"
2. Selecciona tipo "Transportista" en sidebar
3. Completa información básica
4. Agrega datos de empresa
5. Ingresa contactos
6. Completa dirección
7. *Tab bancaire no aparece* ✅
8. Define horarios y días de operación
9. Guarda contacto
**Tiempo**: ~20 segundos

### **Caso 3: Editar Contacto Existente**
1. Usuario busca contacto en tabla
2. Hace clic en menú de acciones
3. Selecciona "Modifier"
4. Formulario se abre con datos precargados
5. Navega a tab específico
6. Modifica información
7. Guarda cambios
**Tiempo**: ~10 segundos

---

## 🎉 Beneficios

### ✅ Para el Almacenista
- ✨ Todos los contactos en un solo lugar
- 🔍 Búsqueda rápida y eficiente
- 📊 Estadísticas visuales
- ⚡ Formulario rápido y completo

### ✅ Para la Organización
- 📇 Base de datos centralizada
- 💼 Información profesional completa
- 🏦 Datos bancarios seguros
- 📈 Mejor control de proveedores

### ✅ Para el Sistema
- 🔒 Datos estructurados
- ✅ Validaciones robustas
- 📱 Responsive y accesible
- 🌍 Multiidioma

---

**Versión**: 1.0.0  
**Fecha**: 17 Febrero 2026  
**Sistema**: Banque Alimentaire - Módulo Entrepôt  
**Estado**: ✅ Listo para integrar
