# Sistema de Diseño Estandarizado - Banque Alimentaire

## 🎨 Introducción

Este directorio contiene todos los componentes compartidos y estandarizados para mantener una experiencia de usuario consistente en todos los módulos de la aplicación.

## 📦 Componentes Disponibles

### 1. ModuleContainer
Contenedor principal para todos los módulos con fondo degradado y formas decorativas.

**Props:**
- `children`: React.ReactNode - Contenido del módulo
- `className?`: string - Clases CSS adicionales
- `withGradient?`: boolean - Activar fondo degradado (default: true)
- `withShapes?`: boolean - Activar formas decorativas (default: true)

**Ejemplo:**
```tsx
<ModuleContainer>
  {/* Tu contenido aquí */}
</ModuleContainer>
```

---

### 2. ModuleHeader
Encabezado estandarizado para módulos con icono, título, descripción y acciones.

**Props:**
- `icon`: LucideIcon - Icono del módulo
- `title`: string - Título del módulo
- `description?`: string - Descripción opcional
- `actions?`: React.ReactNode - Botones o acciones
- `gradient?`: boolean - Usar efecto glassmorphism (default: true)

**Ejemplo:**
```tsx
<ModuleHeader
  icon={Package}
  title={t('inventory.title')}
  description={t('inventory.subtitle')}
  actions={
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Agregar
    </Button>
  }
/>
```

---

### 3. StatCard
Tarjeta de estadísticas con diseño moderno y efecto glassmorphism.

**Props:**
- `icon`: LucideIcon - Icono de la estadística
- `title`: string - Título de la métrica
- `value`: string | number - Valor a mostrar
- `subtitle?`: string - Subtítulo opcional
- `iconColor?`: string - Color del icono (default: '#1a4d7a')
- `borderColor?`: string - Color del borde izquierdo (default: '#1a4d7a')
- `valueColor?`: string - Color del valor (default: '#1a4d7a')
- `trendIcon?`: LucideIcon - Icono de tendencia
- `trendColor?`: string - Color del icono de tendencia
- `badge?`: { text: string, variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' }
- `onClick?`: () => void - Función al hacer click
- `className?`: string - Clases adicionales

**Ejemplo:**
```tsx
<StatCard
  icon={Package}
  title="Total de Productos"
  value="1,234"
  iconColor="#1a4d7a"
  borderColor="#1a4d7a"
  valueColor="#1a4d7a"
  trendIcon={TrendingUp}
  trendColor="#10b981"
  badge={{ text: '100 activos', variant: 'primary' }}
  onClick={() => navigate('/productos')}
/>
```

---

### 4. ModuleSection
Sección de contenido con título, descripción y acciones.

**Props:**
- `title`: string - Título de la sección
- `description?`: string - Descripción opcional
- `icon?`: LucideIcon - Icono de la sección
- `children`: React.ReactNode - Contenido
- `actions?`: React.ReactNode - Acciones (botones)
- `className?`: string - Clases adicionales
- `contentClassName?`: string - Clases para el contenido
- `variant?`: 'default' | 'glass' - Estilo de la tarjeta (default: 'default')

**Ejemplo:**
```tsx
<ModuleSection
  title="Lista de Productos"
  description="Gestiona todos los productos del inventario"
  icon={List}
  variant="glass"
  actions={<Button size="sm">Exportar</Button>}
>
  {/* Contenido de la sección */}
</ModuleSection>
```

---

### 5. ModuleTable
Tabla estandarizada con efectos hover y soporte para filas rayadas.

**Props:**
- `data`: T[] - Array de datos
- `columns`: Column<T>[] - Configuración de columnas
- `keyExtractor`: (item: T, index: number) => string | number
- `onRowClick?`: (item: T, index: number) => void
- `emptyMessage?`: string - Mensaje cuando no hay datos
- `className?`: string - Clases adicionales
- `hoverable?`: boolean - Efecto hover (default: true)
- `striped?`: boolean - Filas rayadas (default: false)

**Column Interface:**
```typescript
interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}
```

**Ejemplo:**
```tsx
<ModuleTable
  data={productos}
  columns={[
    {
      key: 'nombre',
      header: 'Nombre',
      render: (producto) => (
        <div className="flex items-center gap-2">
          <span>{producto.icono}</span>
          <span>{producto.nombre}</span>
        </div>
      )
    },
    {
      key: 'stock',
      header: 'Stock',
      className: 'text-right font-semibold'
    }
  ]}
  keyExtractor={(producto) => producto.id}
  onRowClick={(producto) => handleEdit(producto)}
  hoverable
  striped
/>
```

---

### 6. ModuleCardList
Lista de tarjetas con grid responsivo y mensaje de vacío.

**Props:**
- `data`: T[] - Array de datos
- `renderCard`: (item: T, index: number) => React.ReactNode - Función render
- `keyExtractor`: (item: T, index: number) => string | number
- `emptyMessage?`: string - Mensaje cuando está vacío
- `emptyIcon?`: React.ReactNode - Icono para estado vacío
- `columns?`: 1 | 2 | 3 | 4 - Número de columnas (default: 1)
- `gap?`: 'sm' | 'md' | 'lg' - Espaciado (default: 'md')
- `className?`: string - Clases adicionales

**Ejemplo:**
```tsx
<ModuleCardList
  data={productos}
  columns={3}
  gap="md"
  keyExtractor={(producto) => producto.id}
  emptyMessage="No hay productos"
  emptyIcon={<Package className="w-16 h-16" />}
  renderCard={(producto) => (
    <Card className="shadow-modern hover:shadow-modern-lg">
      <CardHeader>
        <CardTitle>{producto.nombre}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Contenido */}
      </CardContent>
    </Card>
  )}
/>
```

---

## 🎨 Clases CSS Estandarizadas

### Sombras
- `shadow-modern` - Sombra estándar
- `shadow-modern-lg` - Sombra grande
- `shadow-modern-xl` - Sombra extra grande
- `shadow-primary` - Sombra con tinte primario
- `shadow-accent` - Sombra con tinte de acento

### Efectos Glassmorphism
- `card-glass` - Tarjeta con efecto de vidrio
- `backdrop-blur-xl bg-white/90 border border-white/60` - Efecto glassmorphism personalizado

### Gradientes
- `gradient-primary` - Gradiente azul marino
- `gradient-accent` - Gradiente verde

### Animaciones
- `animate-slideInUp` - Deslizar desde abajo
- `animate-slideInRight` - Deslizar desde derecha
- `animate-fadeInScale` - Aparecer con escala
- `hover-lift` - Elevación al hover
- `animate-pulse-ring` - Pulso para notificaciones

### Badges
- `badge-primary` - Badge azul
- `badge-secondary` - Badge verde
- `badge-warning` - Badge amarillo
- `badge-danger` - Badge rojo

## 🎯 Paleta de Colores

```javascript
const colors = {
  primary: '#1a4d7a',      // Azul marino
  secondary: '#2d9561',    // Verde elegante
  destructive: '#c23934',  // Rojo
  warning: '#e8a419',      // Amarillo/Naranja
};
```

## 📱 Breakpoints Responsivos

```css
sm:  640px   /* Móviles grandes */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops */
xl:  1280px  /* Escritorios */
```

## ✅ Checklist para Crear un Módulo

1. [ ] Usar `ModuleContainer` como contenedor principal
2. [ ] Agregar `ModuleHeader` con icono y título
3. [ ] Incluir tarjetas de estadísticas con `StatCard`
4. [ ] Organizar contenido en `ModuleSection`
5. [ ] Usar `ModuleTable` o `ModuleCardList` para datos
6. [ ] Aplicar animaciones con clases predefinidas
7. [ ] Usar la paleta de colores estándar
8. [ ] Asegurar responsividad con grid y breakpoints
9. [ ] Usar `fontFamily: 'Montserrat, sans-serif'` en títulos
10. [ ] Probar en diferentes tamaños de pantalla

## 📖 Ver Plantilla Completa

Consulta `ModuleTemplate.tsx` para ver un ejemplo completo de cómo estructurar un módulo usando todos estos componentes.

## 🚀 Inicio Rápido

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Package } from 'lucide-react';
import {
  ModuleContainer,
  ModuleHeader,
  ModuleSection,
  StatCard
} from '../shared';

export function MiModulo() {
  const { t } = useTranslation();

  return (
    <ModuleContainer>
      <ModuleHeader
        icon={Package}
        title={t('module.title')}
        description={t('module.description')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          title="Métrica 1"
          value="123"
          iconColor="#1a4d7a"
          borderColor="#1a4d7a"
          valueColor="#1a4d7a"
        />
      </div>

      <ModuleSection
        title="Contenido"
        icon={Package}
      >
        {/* Tu contenido aquí */}
      </ModuleSection>
    </ModuleContainer>
  );
}
```

## 💡 Consejos

1. **Consistencia**: Usa siempre los componentes compartidos en lugar de crear estilos personalizados
2. **Colores**: Respeta la paleta de colores definida
3. **Animaciones**: Aplica animaciones de entrada a elementos nuevos
4. **Responsividad**: Prueba en diferentes tamaños de pantalla
5. **Accesibilidad**: Usa etiquetas semánticas y ARIA cuando sea necesario

## 🔗 Referencias

- Ver `DesignStandards.md` para documentación detallada
- Ver `ModuleTemplate.tsx` para plantilla completa
- Consultar Tailwind CSS v4 para clases de utilidad
