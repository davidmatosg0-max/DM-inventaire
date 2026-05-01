# Guía de Estilo Moderno DM - Banque Alimentaire

## 🎨 Paleta de Colores

### Colores Principales
- **Primario (Azul Marino)**: `#1a4d7a`
- **Secundario (Verde Elegante)**: `#2d9561`
- **Fondo**: Gradiente suave `linear-gradient(135deg, #1a4d7a08 0%, #2d956105 100%)`

### Colores de Estado
- **Éxito**: `#22c55e` (verde)
- **Advertencia**: `#FFC107` (amarillo)
- **Peligro**: `#DC3545` (rojo)
- **Info**: `#1a4d7a` (azul primario)

---

## 📦 Clases CSS Globales

### Tarjetas
```tsx
// Tarjeta con glassmorphism
<div className="card-glass rounded-2xl p-6 shadow-xl">
  {/* Contenido */}
</div>

// Tarjeta elevada con hover
<div className="card-elevated hover-lift p-5">
  {/* Contenido */}
</div>

// Tarjeta oscura con glassmorphism
<div className="card-glass-dark rounded-2xl p-6">
  {/* Contenido */}
</div>
```

### Botones Modernos
```tsx
// Botón primario
<button className="btn-modern text-white" style={{ background: 'linear-gradient(135deg, #1a4d7a 0%, #16426a 100%)' }}>
  Texto
</button>

// Botón secundario
<button className="btn-modern text-white" style={{ background: 'linear-gradient(135deg, #2d9561 0%, #268650 100%)' }}>
  Texto
</button>
```

### Inputs Modernos
```tsx
<input 
  className="input-modern w-full" 
  placeholder="Placeholder"
/>
```

### Badges Modernos
```tsx
<span className="badge-modern badge-primary">Primario</span>
<span className="badge-modern badge-secondary">Secundario</span>
<span className="badge-modern badge-success">Éxito</span>
<span className="badge-modern badge-warning">Advertencia</span>
<span className="badge-modern badge-danger">Peligro</span>
```

---

## 🎭 Animaciones

### Animación de Entrada
```tsx
// Contenedor principal
<div className="animate-fade-in">
  {/* Contenido */}
</div>

// Slide in (desde la izquierda)
<div className="animate-slide-in">
  {/* Contenido */}
</div>

// Scale in (desde pequeño)
<div className="animate-scale-in">
  {/* Contenido */}
</div>
```

### Efectos Hover
```tsx
// Elevación al hover
<div className="hover-lift">
  {/* Contenido */}
</div>

// Brillo al hover
<div className="hover-glow">
  {/* Contenido */}
</div>
```

---

## 📊 Componentes Comunes

### Header de Página
```tsx
<div className="card-glass rounded-2xl p-6 shadow-xl">
  <div className="flex items-center justify-between">
    <div>
      <h1 
        className="text-2xl md:text-3xl flex items-center gap-3" 
        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#1a4d7a' }}
      >
        <IconoComponente className="w-8 h-8" />
        Título del Módulo
      </h1>
      <p className="text-sm text-gray-600 mt-1">
        Descripción del módulo
      </p>
    </div>
    <div className="flex gap-3">
      {/* Botones de acción */}
    </div>
  </div>
</div>
```

### Tarjetas de Estadísticas
```tsx
<div className="card-glass rounded-2xl p-5 hover-lift cursor-pointer border-l-4" style={{ borderLeftColor: '#1a4d7a' }}>
  {/* Icono y métrica */}
  <div className="flex items-center justify-between mb-3">
    <div 
      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
      style={{ background: 'linear-gradient(135deg, #1a4d7a 0%, #16426a 100%)' }}
    >
      <Package className="w-6 h-6 text-white" />
    </div>
    <TrendingUp className="w-5 h-5 text-green-500" />
  </div>
  
  {/* Etiqueta */}
  <p className="text-sm text-gray-600 mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
    Etiqueta
  </p>
  
  {/* Valor */}
  <div className="font-bold mb-1" style={{ fontSize: '2rem', color: '#1a4d7a', fontFamily: 'Montserrat, sans-serif' }}>
    1,234
  </div>
  
  {/* Badge */}
  <div className="badge-primary text-xs">
    Información adicional
  </div>
</div>
```

### Tabla Moderna
```tsx
<table className="table-modern scrollbar-modern">
  <thead>
    <tr>
      <th>Columna 1</th>
      <th>Columna 2</th>
      <th>Columna 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Dato 1</td>
      <td>Dato 2</td>
      <td>Dato 3</td>
    </tr>
  </tbody>
</table>
```

---

## 🎨 Fondo con Formas Decorativas

### Para páginas completas
```tsx
<div className="min-h-screen gradient-primary relative overflow-hidden">
  {/* Formas decorativas */}
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div 
      className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10 blur-3xl"
      style={{ backgroundColor: '#1a4d7a' }}
    />
    <div 
      className="absolute top-1/2 -right-32 w-96 h-96 rounded-full opacity-10 blur-3xl"
      style={{ backgroundColor: '#2d9561' }}
    />
  </div>
  
  {/* Contenido con z-index mayor */}
  <div className="relative z-10">
    {/* Tu contenido aquí */}
  </div>
</div>
```

---

## 🔧 Componentes de UI Modernos

### Modal/Dialog
```tsx
<div className="card-glass rounded-2xl p-6 max-w-md mx-auto">
  <h2 
    className="text-xl font-bold mb-4" 
    style={{ fontFamily: 'Montserrat, sans-serif', color: '#1a4d7a' }}
  >
    Título del Modal
  </h2>
  
  <div className="divider-modern" />
  
  <div className="space-y-4">
    {/* Contenido */}
  </div>
  
  <div className="flex gap-3 mt-6">
    <button className="btn-modern flex-1" style={{ background: 'linear-gradient(135deg, #1a4d7a 0%, #16426a 100%)' }}>
      Confirmar
    </button>
    <button className="btn-modern flex-1 bg-gray-200 text-gray-700">
      Cancelar
    </button>
  </div>
</div>
```

### Lista con Items
```tsx
<div className="space-y-3">
  {items.map((item) => (
    <div 
      key={item.id}
      className="card-glass rounded-xl p-4 hover-lift cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1a4d7a 0%, #16426a 100%)' }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {item.title}
          </h3>
          <p className="text-sm text-gray-600">{item.description}</p>
        </div>
        <span className="badge-modern badge-primary">{item.status}</span>
      </div>
    </div>
  ))}
</div>
```

---

## 📝 Tipografía

### Títulos
```tsx
// H1 - Título Principal
<h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#1a4d7a' }}>
  Título
</h1>

// H2 - Subtítulo
<h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: '#333333' }}>
  Subtítulo
</h2>

// H3 - Sección
<h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#666666' }}>
  Sección
</h3>
```

### Texto del Cuerpo
```tsx
// Texto normal
<p style={{ fontFamily: 'Roboto, sans-serif' }}>
  Texto del cuerpo
</p>

// Texto destacado
<span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
  Texto destacado
</span>
```

---

## 🎯 Iconos con Gradientes

### Icono en contenedor circular
```tsx
<div 
  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
  style={{ background: 'linear-gradient(135deg, #1a4d7a 0%, #16426a 100%)' }}
>
  <Package className="w-6 h-6 text-white" />
</div>
```

### Icono con efecto glow
```tsx
<div className="glow-primary w-12 h-12 rounded-full flex items-center justify-center bg-white">
  <Package className="w-6 h-6" style={{ color: '#1a4d7a' }} />
</div>
```

---

## 📱 Responsive

Todas las clases están diseñadas para ser responsive. Usa las breakpoints de Tailwind:

```tsx
<div className="p-3 sm:p-4 md:p-6 lg:p-8">
  <h1 className="text-xl sm:text-2xl md:text-3xl">
    Título Responsive
  </h1>
</div>
```

---

## ✨ Tips Adicionales

1. **Siempre usa `fontFamily: 'Montserrat, sans-serif'` para títulos y labels**
2. **Usa `fontFamily: 'Roboto, sans-serif'` para texto del cuerpo**
3. **Aplica `animate-fade-in` a contenedores principales para animaciones suaves**
4. **Usa `hover-lift` en tarjetas interactivas**
5. **Los gradientes siempre van de oscuro a más oscuro (135deg)**
6. **Los bordes redondeados son de 12px (rounded-xl) o 16px (rounded-2xl)**
7. **Las sombras son suaves: `shadow-lg` o `shadow-xl`**
8. **Los badges siempre con backdrop-blur para efecto glassmorphism**

---

## 🚀 Ejemplo de Módulo Completo

```tsx
import { Package, Plus } from 'lucide-react';

export function MiModulo() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card-glass rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-2xl md:text-3xl flex items-center gap-3" 
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#1a4d7a' }}
            >
              <Package className="w-8 h-8" />
              Mi Módulo
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Descripción del módulo
            </p>
          </div>
          <button 
            className="btn-modern text-white flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #1a4d7a 0%, #16426a 100%)' }}
          >
            <Plus className="w-5 h-5" />
            Nuevo
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tarjetas de estadísticas aquí */}
      </div>

      {/* Contenido principal */}
      <div className="card-glass rounded-2xl p-6">
        {/* Tu contenido aquí */}
      </div>
    </div>
  );
}
```

---

**Mantén la consistencia visual en todos los módulos usando esta guía! 🎨✨**
