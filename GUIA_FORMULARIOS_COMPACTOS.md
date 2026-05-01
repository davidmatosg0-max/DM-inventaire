# 📋 GUÍA DE IMPLEMENTACIÓN: Formularios Compactos con Tabs

## 🎯 Descripción General

Se ha implementado un patrón unificado de **formularios compactos con tabs** para todos los módulos del sistema de Banque Alimentaire. Este patrón elimina el scroll excesivo y mejora significativamente la experiencia de usuario al organizar la información en pestañas (tabs) lógicas.

## ✨ Características del Patrón

### 📐 Estructura Visual
- **Tamaño**: 95vw × 95vh (95% del viewport)
- **Diseño**: Sidebar izquierda (256px) + Contenido principal con tabs
- **Sin scroll excesivo**: Todo visible en pantalla
- **Glassmorphism**: Mantiene el estilo visual del sistema

### 🎨 Componentes del Layout

#### 1. **Sidebar Izquierda** (256px)
- **Foto/Avatar**: Circular o cuadrado según el tipo
- **Botón de cámara**: Cambiar foto fácilmente
- **Selección de Tipo/Categoría**: Cards interactivos con colores específicos
- **Resumen rápido**: Información clave visible siempre

#### 2. **Sistema de Tabs**
- **5 tabs organizadas**: Base, Contact, [Específico], [Específico], Autres
- **Iconos descriptivos**: Cada tab tiene su icono lucide-react
- **Indicador visual**: Border bottom con color primario
- **Grid de 3 columnas**: Campos organizados eficientemente

#### 3. **Footer Fijo**
- **Botones de acción**: Cancelar y Guardar/Crear
- **Siempre visible**: No se pierde con el scroll
- **Colores del branding**: Usa primaryColor del sistema

## 📦 Componentes Creados

### 1. **FormularioContactoCompacto.tsx** ✅
**Ubicación**: `/src/app/components/departamentos/FormularioContactoCompacto.tsx`

**Tabs**:
- Base: Nombre, apellido, género, fechas
- Contact: Email, teléfono, dirección, idioma
- Professionnel: Departamento, puesto, horas
- Disponibilités: Calendario semanal interactivo
- Autres: Notas y documentos

**Tipos de contacto**:
- Bénévole (Voluntario)
- Donador
- Fournisseur (Proveedor)
- Responsable Santé
- Partenaire
- Visiteur

### 2. **FormularioUsuarioInternoCompacto.tsx** ✅
**Ubicación**: `/src/app/components/usuarios/FormularioUsuarioInternoCompacto.tsx`

**Tabs**:
- Base: Información personal
- Contact: Contacto y ubicación
- Professionnel: Trabajo y programa
- Disponibilités: Horarios disponibles
- Autres: Notas y documentos PDF

**Categorías**:
- Bénévole (Voluntario)
- Empleado
- Programa
- PTC (Programa Trabajo Comunitario)
- Donador (Empresa)
- Vendedor (Empresa)

### 3. **FormularioOrganismoCompacto.tsx** ✅
**Ubicación**: `/src/app/components/organismos/FormularioOrganismoCompacto.tsx`

**Tabs**:
- Base: Nombre, tipo, quartier, dirección
- Contact: Teléfono, email, citas
- Services: Beneficiarios, servicios, estado
- Notifications: Contactos de notificación con disponibilidad
- Autres: Notas, documentos, inactividad

**20 tipos de organismos** con iconos:
- Cuisine Communautaire 🍽️
- Fondation 🏛️
- ONG 🤝
- Refuge 🏠
- Centre de Jour ☀️
- Y 15 más...

### 4. **FormularioVehiculoCompacto.tsx** ✅
**Ubicación**: `/src/app/components/transporte/FormularioVehiculoCompacto.tsx`

**Tabs**:
- Base: Placa, marca, modelo, año, estado
- Capacidad: Kg y m³
- Mantenimiento: Fechas y recordatorios
- Seguro: Número de póliza
- Autres: Notas y documentos

**Tipos de vehículos**:
- Camión 🚚
- Furgoneta 🚐
- Auto 🚗
- Refrigerado ❄️

### 5. **FormularioChoferCompacto.tsx** ✅
**Ubicación**: `/src/app/components/transporte/FormularioChoferCompacto.tsx`

**Tabs**:
- Base: Nombre, apellido, fecha de nacimiento
- Contact: Teléfono, email, dirección
- Licence: Número, tipo, expiración, experiencia
- Affectation: Vehículo asignado
- Autres: Notas y documentos

**Tipos de licencia**:
- Classe 5 (Auto personal)
- Classe 4A (Taxi/Ambulancia)
- Classe 3 (Camión)
- Classe 2 (Autobús)
- Classe 1 (Tráiler)

### 6. **FormularioBeneficiarioCompacto.tsx** ✅
**Ubicación**: `/src/app/components/comptoir/FormularioBeneficiarioCompacto.tsx`

**Tabs**:
- Base: Nombre, ID, estado civil
- Contact: Teléfono, email, dirección
- Famille: Personas en hogar, niños, ingresos, empleo
- Aide: Tipo de ayuda, frecuencia, alergias, preferencias
- Autres: Notas generales

**Resumen en sidebar**:
- Personas en hogar
- Número de niños
- Ingreso mensual

## 🔧 Cómo Implementar en Cada Módulo

### Paso 1: Importar el Componente
```tsx
import { FormularioContactoCompacto } from '../departamentos/FormularioContactoCompacto';
```

### Paso 2: Reemplazar el Dialog Antiguo
**ANTES**:
```tsx
<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    {/* Montón de campos con scroll */}
  </DialogContent>
</Dialog>
```

**DESPUÉS**:
```tsx
<FormularioContactoCompacto
  abierto={dialogOpen}
  onCerrar={() => setDialogOpen(false)}
  formulario={formData}
  setFormulario={setFormData}
  modoEdicion={modoEdicion}
  onGuardar={handleGuardar}
  fotoPreview={fotoPreview}
  onFotoChange={handleFotoChange}
  getTipoConfig={getTipoConfig}
  updateDisponibilidad={updateDisponibilidad}
/>
```

### Paso 3: Mantener la Lógica Existente
- No cambies las funciones `handleGuardar`, `handleEditar`, etc.
- El componente compacto solo cambia la UI, no la lógica
- Todos los estados existentes se reutilizan

## 📝 Props Estándar de Todos los Componentes

### Props Comunes
```tsx
interface PropsComunes {
  abierto: boolean;                    // Estado del dialog
  onCerrar: () => void;                // Función para cerrar
  formulario: TipoFormulario;          // Estado del formulario
  setFormulario: SetStateAction;       // Setter del formulario
  modoEdicion: boolean;                // true = editar, false = crear
  onGuardar: () => void;               // Función para guardar
}
```

### Props Específicas según Módulo
```tsx
// ContactoDepartamento
fotoPreview: string | null;
onFotoChange: (e: ChangeEvent<HTMLInputElement>) => void;
getTipoConfig: (tipo) => ConfigType;
updateDisponibilidad: (index, field, value) => void;

// Organismo
tiposOrganismo: TipoOrganismo[];

// Usuario Interno
getCategoriaConfig: () => CategoriaConfig;
departamentos: string[];
```

## 🎨 Personalización de Colores

Todos los componentes usan el hook `useBranding()`:
```tsx
const branding = useBranding();

// Colores disponibles:
branding.primaryColor    // #1a4d7a (Azul marino)
branding.secondaryColor  // #2d9561 (Verde elegante)
branding.warningColor    // #e8a419 (Amarillo)
branding.dangerColor     // #dc3545 (Rojo)
```

## 📊 Ventajas del Nuevo Patrón

### ✅ Experiencia de Usuario
- **Sin scroll excesivo**: Todo visible en una pantalla
- **Navegación intuitiva**: Tabs organizadas lógicamente
- **Información siempre visible**: Sidebar con datos clave
- **Acciones accesibles**: Footer fijo con botones

### ✅ Desarrollo
- **Código reutilizable**: Patrón consistente en todos los módulos
- **Fácil mantenimiento**: Estructura clara y organizada
- **Responsive**: Diseño adaptable
- **TypeScript**: Todo tipado correctamente

### ✅ Diseño
- **Consistencia visual**: Mismo estilo en todo el sistema
- **Glassmorphism**: Mantiene la identidad visual
- **Colores del branding**: Usa la paleta definida
- **Iconografía unificada**: Lucide-react en todas partes

## 🚀 Módulos Pendientes de Migración

### Alta Prioridad
- [ ] **Benevoles** - Fichas de voluntarios
- [ ] **Comandas** - Formularios de pedidos
- [ ] **Inventario** - Productos y entradas
- [ ] **Etiquetas** - Gestión de etiquetas

### Media Prioridad
- [ ] **Roles y Permisos** - Gestión de accesos
- [ ] **Configuración** - Categorías y subcategorías
- [ ] **Email Organismos** - Envío masivo

### Baja Prioridad (Formularios simples)
- [ ] **Departamentos** - Ya es simple, pero puede mejorarse
- [ ] **Balance** - Configuración de balance

## 📱 Compatibilidad y Pruebas

### Navegadores Soportados
- ✅ Chrome/Edge (últimas 2 versiones)
- ✅ Firefox (últimas 2 versiones)
- ✅ Safari (últimas 2 versiones)

### Resoluciones Probadas
- ✅ 1920×1080 (Full HD)
- ✅ 1366×768 (Laptop común)
- ✅ 1280×720 (HD)
- ⚠️ <1280px: Sidebar puede ajustarse

## 🔍 Debugging y Troubleshooting

### Problema: Tabs no se muestran
**Solución**: Verifica que `@radix-ui/react-tabs` esté instalado:
```bash
npm install @radix-ui/react-tabs
```

### Problema: Colores no se aplican
**Solución**: Asegúrate de que `useBranding()` devuelva valores:
```tsx
console.log(branding); // Debe mostrar primaryColor, secondaryColor, etc.
```

### Problema: Dialog demasiado pequeño
**Solución**: Verifica las clases de Tailwind:
```tsx
className="!max-w-none !w-[95vw] !max-h-[95vh] !h-[95vh]"
```

## 📞 Contacto y Soporte

Si tienes dudas sobre la implementación de estos componentes:
1. Revisa esta guía completa
2. Inspecciona el código de los componentes existentes
3. Sigue el patrón establecido para consistencia

---

**Versión**: 1.0.0  
**Fecha**: 17 Febrero 2026  
**Sistema**: Banque Alimentaire v3.0+  
**Desarrollador**: David (Lettycia26)
