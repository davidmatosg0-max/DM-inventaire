/**
 * Guía de Implementación de Responsive Design
 * Sistema completo para adaptar la aplicación a todos los tamaños de pantalla
 */

# 🎯 Estrategia de Responsive Design

## 📐 Breakpoints Estándar

```
xs: 0px - 639px     (Móviles pequeños)
sm: 640px - 767px   (Móviles grandes)
md: 768px - 1023px  (Tablets)
lg: 1024px - 1279px (Laptops)
xl: 1280px - 1535px (Desktops)
2xl: 1536px+        (Pantallas grandes)
```

## 🔧 Implementación por Componente

### 1. DIÁLOGOS (Modales)

#### ❌ ANTES (No responsive):
```tsx
<DialogContent className="max-w-4xl max-h-[90vh]">
```

#### ✅ DESPUÉS (Responsive):
```tsx
// Pequeño
<DialogContent className="w-full sm:max-w-md mx-4 sm:mx-auto max-h-[90vh]">

// Mediano
<DialogContent className="w-full sm:max-w-lg md:max-w-2xl mx-4 sm:mx-auto max-h-[90vh]">

// Grande
<DialogContent className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-4 sm:mx-auto max-h-[90vh]">

// Full (con sidebar)
<DialogContent className="w-full h-full sm:w-[95vw] sm:h-[95vh] md:w-[90vw] md:h-[90vh] max-w-none overflow-hidden p-0 m-0 rounded-none sm:rounded-xl">
```

### 2. GRIDS

#### ❌ ANTES:
```tsx
<div className="grid grid-cols-4 gap-4">
```

#### ✅ DESPUÉS:
```tsx
// 1 columna móvil, 2 tablet, 4 desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">

// 2 columnas móvil, 3 tablet, 4 desktop
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
```

### 3. LAYOUT CON SIDEBAR

#### ❌ ANTES:
```tsx
<div className="flex">
  <div className="w-64">Sidebar</div>
  <div className="flex-1">Content</div>
</div>
```

#### ✅ DESPUÉS:
```tsx
<div className="flex flex-col md:flex-row">
  {/* Sidebar: horizontal en móvil, vertical en desktop */}
  <div className="w-full md:w-64 lg:w-72 border-b md:border-b-0 md:border-r max-h-[200px] md:max-h-none overflow-y-auto">
    Sidebar
  </div>
  
  {/* Content */}
  <div className="flex-1 min-w-0 overflow-auto">
    Content
  </div>
</div>
```

### 4. TEXTOS

#### ❌ ANTES:
```tsx
<h1 className="text-2xl">Título</h1>
<p className="text-base">Texto</p>
```

#### ✅ DESPUÉS:
```tsx
<h1 className="text-xl sm:text-2xl lg:text-3xl">Título</h1>
<p className="text-sm sm:text-base">Texto</p>
<span className="text-xs sm:text-sm">Pequeño</span>
```

### 5. SPACING (Márgenes y Padding)

#### ❌ ANTES:
```tsx
<div className="p-6 space-y-4">
```

#### ✅ DESPUÉS:
```tsx
<div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
```

### 6. BOTONES

#### ❌ ANTES:
```tsx
<Button className="h-10 px-4">
```

#### ✅ DESPUÉS:
```tsx
<Button className="h-9 sm:h-10 px-3 sm:px-4 text-sm sm:text-base">

// Botones icon
<Button size="icon" className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10">
```

### 7. FORMULARIOS

#### ❌ ANTES:
```tsx
<div className="grid grid-cols-2 gap-4">
  <Input className="h-10" />
  <Input className="h-10" />
</div>
```

#### ✅ DESPUÉS:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
  <Input className="h-9 sm:h-10 text-sm sm:text-base" />
  <Input className="h-9 sm:h-10 text-sm sm:text-base" />
</div>
```

### 8. TABLAS

#### ❌ ANTES:
```tsx
<table className="w-full">
```

#### ✅ DESPUÉS:
```tsx
<div className="overflow-x-auto scrollbar-thin">
  <table className="w-full min-w-[640px]">
    <thead>
      <tr>
        <th className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
```

### 9. CARDS

#### ❌ ANTES:
```tsx
<div className="rounded-lg p-6">
```

#### ✅ DESPUÉS:
```tsx
<div className="rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6">
```

### 10. OCULTAR/MOSTRAR POR PANTALLA

```tsx
{/* Solo en móvil */}
<div className="block md:hidden">Menú hamburguesa</div>

{/* Solo en desktop */}
<div className="hidden md:block">Menú completo</div>

{/* Diferente en móvil vs desktop */}
<div className="text-sm md:text-base font-medium md:font-semibold">
```

## 📱 Patrones Específicos para FormularioContactoCompacto

### Header del Dialog
```tsx
<DialogHeader className="px-3 sm:px-4 md:px-6 py-2 sm:py-3">
  <DialogTitle className="text-base sm:text-lg md:text-xl">
    <Users className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
    Título
  </DialogTitle>
</DialogHeader>
```

### Sidebar de Tipos
```tsx
<div className="w-full md:w-64 lg:w-72 
                border-b-2 md:border-b-0 md:border-r-2 
                max-h-[200px] md:max-h-none 
                overflow-y-auto scrollbar-thin 
                p-3 sm:p-4">
```

### Área de Contenido con Tabs
```tsx
<div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
  <div className="max-w-full sm:max-w-2xl lg:max-w-4xl mx-auto space-y-4 sm:space-y-6">
```

### Vista Simplificada (Donador/Fournisseur)
```tsx
<div className="space-y-4 sm:space-y-6">
  {/* Header informativo */}
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
    <div className="flex items-start gap-2 sm:gap-3">
      <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
      <div>
        <h3 className="text-sm sm:text-base font-semibold">Titre</h3>
        <p className="text-xs sm:text-sm">Description</p>
      </div>
    </div>
  </div>
  
  {/* Campos */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
```

### Sección PRS
```tsx
<div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t-2">
  <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg sm:rounded-xl p-4 sm:p-5">
    {/* Header */}
    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-pink-500">
        <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>
      <div>
        <h3 className="text-sm sm:text-base font-bold">Programme PRS</h3>
        <p className="text-xs sm:text-sm">Description</p>
      </div>
    </div>
    
    {/* Campos PRS */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
```

### Días de la Semana (Checkboxes)
```tsx
<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
  {['Lundi', 'Mardi', ...].map(dia => (
    <div key={dia} className="flex items-center gap-1.5 sm:gap-2">
      <Checkbox className="h-4 w-4 sm:h-5 sm:w-5" />
      <Label className="text-xs sm:text-sm">
        {dia.substring(0, 3)}
      </Label>
    </div>
  ))}
</div>
```

### Footer con Botones
```tsx
<div className="sticky bottom-0 bg-white border-t-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 
                flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
  <Button variant="outline" className="w-full sm:w-auto">
    Annuler
  </Button>
  <Button className="w-full sm:w-auto">
    Sauvegarder
  </Button>
</div>
```

## 🎨 Clases Utility Reutilizables

### Contenedores
```css
/* Container con padding responsive */
.responsive-container {
  @apply px-4 sm:px-6 lg:px-8 py-4 sm:py-6;
}

/* Card responsive */
.responsive-card {
  @apply rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6;
}
```

### Texto
```css
/* Título responsive */
.responsive-title {
  @apply text-xl sm:text-2xl md:text-3xl font-bold;
}

/* Subtítulo responsive */
.responsive-subtitle {
  @apply text-base sm:text-lg md:text-xl font-semibold;
}

/* Body responsive */
.responsive-body {
  @apply text-sm sm:text-base;
}
```

### Grids
```css
/* Grid 1-2-3 */
.grid-responsive-123 {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3;
}

/* Grid 1-2-4 */
.grid-responsive-124 {
  @apply grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4;
}
```

## 🔍 Testing Checklist

- [ ] Móvil: 375px x 667px (iPhone SE)
- [ ] Móvil grande: 414px x 896px (iPhone 11)
- [ ] Tablet vertical: 768px x 1024px (iPad)
- [ ] Tablet horizontal: 1024px x 768px (iPad landscape)
- [ ] Laptop: 1366px x 768px
- [ ] Desktop: 1920px x 1080px
- [ ] Pantalla grande: 2560px x 1440px

## 🚀 Implementación Rápida

### Paso 1: Actualizar DialogContent
Buscar todos los `DialogContent` y aplicar clases responsive según el tamaño necesario.

### Paso 2: Actualizar Grids
Convertir todos los `grid-cols-X` fijos a responsive.

### Paso 3: Actualizar Texto
Agregar breakpoints a todos los tamaños de texto.

### Paso 4: Actualizar Spacing
Hacer responsive todos los padding, margin, gap.

### Paso 5: Test
Probar en todos los breakpoints usando DevTools.

## 💡 Tips Finales

1. **Mobile First**: Diseñar primero para móvil, luego agregar breakpoints
2. **Contenido Prioritario**: Ocultar elementos secundarios en móvil
3. **Touch-Friendly**: Botones mínimo 44x44px en móvil
4. **Scroll Visible**: Asegurar scroll indicators en contenedores
5. **Performance**: Minimizar re-renders en resize events
6. **Accessibility**: Mantener orden lógico en todos los breakpoints

## 📚 Recursos

- Tailwind Responsive: https://tailwindcss.com/docs/responsive-design
- Mobile-First: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Responsive/Mobile_first
- Touch Targets: https://web.dev/accessible-tap-targets/
