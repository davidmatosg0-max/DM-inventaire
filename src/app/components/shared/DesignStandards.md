# Estándares de Diseño - Banque Alimentaire

## 📐 Estructura de Módulos Estandarizada

### 1. Contenedor Principal
Todos los módulos deben usar el componente `ModuleContainer`:

```tsx
import { ModuleContainer } from '../shared';

<ModuleContainer>
  {/* contenido del módulo */}
</ModuleContainer>
```

### 2. Encabezado del Módulo
Usar el componente `ModuleHeader` para el título y acciones:

```tsx
import { ModuleHeader } from '../shared';
import { Package } from 'lucide-react';

<ModuleHeader
  icon={Package}
  title={t('inventory.title')}
  description={t('inventory.subtitle')}
  actions={
    <>
      <Button>Acción 1</Button>
      <Button>Acción 2</Button>
    </>
  }
/>
```

### 3. Tarjetas de Estadísticas
Usar el componente `StatCard` para métricas:

```tsx
import { StatCard } from '../shared';
import { Package, TrendingUp } from 'lucide-react';

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard
    icon={Package}
    title={t('dashboard.totalInventory')}
    value={formatLargeNumber(stockTotal)}
    iconColor="#1a4d7a"
    borderColor="#1a4d7a"
    valueColor="#1a4d7a"
    trendIcon={TrendingUp}
    trendColor="#10b981"
    badge={{
      text: `${totalProductos} productos`,
      variant: 'primary'
    }}
  />
</div>
```

### 4. Secciones de Contenido
Usar el componente `ModuleSection` para agrupar contenido:

```tsx
import { ModuleSection } from '../shared';
import { List } from 'lucide-react';

<ModuleSection
  title={t('inventory.productList')}
  description={t('inventory.productListDescription')}
  icon={List}
  variant="glass"
  actions={
    <Button size="sm">Ver más</Button>
  }
>
  {/* Contenido de la sección */}
</ModuleSection>
```

### 5. Tablas
Usar el componente `ModuleTable` para tablas estandarizadas:

```tsx
import { ModuleTable } from '../shared';

<ModuleTable
  data={productos}
  columns={[
    {
      key: 'nombre',
      header: t('inventory.name'),
      render: (producto) => (
        <div className="flex items-center gap-2">
          <span>{producto.icono}</span>
          <span>{producto.nombre}</span>
        </div>
      )
    },
    {
      key: 'stock',
      header: t('inventory.stock'),
      className: 'text-right font-semibold'
    }
  ]}
  keyExtractor={(producto) => producto.id}
  onRowClick={(producto) => handleEdit(producto)}
  hoverable
  striped
/>
```

### 6. Listas con Tarjetas
Usar el componente `ModuleCardList` para listas de tarjetas:

```tsx
import { ModuleCardList } from '../shared';
import { Package } from 'lucide-react';

<ModuleCardList
  data={productos}
  columns={3}
  gap="md"
  keyExtractor={(producto) => producto.id}
  emptyMessage={t('inventory.noProducts')}
  emptyIcon={<Package className="w-16 h-16" />}
  renderCard={(producto) => (
    <Card className="shadow-modern hover:shadow-modern-lg transition-all">
      <CardHeader>
        <CardTitle>{producto.nombre}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* contenido de la tarjeta */}
      </CardContent>
    </Card>
  )}
/>
```

## 🎨 Clases CSS Estandarizadas

### Tarjetas Modernas
- `shadow-modern` - Sombra suave estándar
- `shadow-modern-lg` - Sombra grande
- `shadow-modern-xl` - Sombra extra grande
- `shadow-primary` - Sombra con color primario
- `shadow-accent` - Sombra con color de acento

### Efectos de Glassmorphism
- `backdrop-blur-xl bg-white/90 border border-white/60` - Efecto de vidrio

### Gradientes
- `gradient-primary` - Gradiente del color primario
- `gradient-accent` - Gradiente del color de acento

### Animaciones
- `animate-slideInUp` - Deslizar desde abajo
- `animate-slideInRight` - Deslizar desde la derecha
- `animate-fadeInScale` - Aparecer con escala
- `hover-lift` - Elevación al pasar el mouse
- `animate-pulse-ring` - Pulso para notificaciones

### Badges
- `badge-modern` - Badge con diseño moderno
- Variantes de color en StatCard: `primary`, `secondary`, `success`, `warning`, `danger`

## 🎯 Paleta de Colores

### Colores Principales
- **Primario:** `#1a4d7a` (Azul marino)
- **Secundario:** `#2d9561` (Verde elegante)
- **Destructivo:** `#c23934` (Rojo)
- **Advertencia:** `#e8a419` (Amarillo/Naranja)

### Uso de Colores
```tsx
// Acceder a colores de branding
import { useBranding } from '../../../hooks/useBranding';

const branding = useBranding();
// branding.primaryColor = '#1a4d7a'
// branding.secondaryColor = '#2d9561'
```

## 📦 Componentes UI Base

### Botones
```tsx
<Button variant="default">Primario</Button>
<Button variant="destructive">Destructivo</Button>
<Button variant="outline">Borde</Button>
<Button variant="ghost">Fantasma</Button>
<Button size="sm">Pequeño</Button>
<Button size="lg">Grande</Button>
```

### Inputs
```tsx
<Input 
  placeholder="Buscar..." 
  className="shadow-sm hover:shadow-md focus:shadow-lg"
/>
```

### Cards
```tsx
<Card className="shadow-modern hover:shadow-modern-lg transition-all">
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>
    Contenido
  </CardContent>
</Card>
```

### Badges
```tsx
<Badge variant="default">Predeterminado</Badge>
<Badge variant="secondary">Secundario</Badge>
<Badge variant="destructive">Destructivo</Badge>
<Badge variant="outline">Borde</Badge>
```

## 📱 Responsividad

### Breakpoints Estándar
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px

### Grid Responsivo
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* contenido */}
</div>
```

## ✨ Mejores Prácticas

1. **Siempre usar componentes compartidos** en lugar de crear estilos personalizados
2. **Usar ModuleContainer** para mantener el fondo y decoraciones consistentes
3. **Usar ModuleHeader** para encabezados de módulos
4. **Usar StatCard** para tarjetas de métricas
5. **Usar ModuleSection** para secciones de contenido
6. **Usar ModuleTable** para tablas de datos
7. **Usar ModuleCardList** para listas de tarjetas
8. **Aplicar animaciones** con las clases predefinidas
9. **Mantener la paleta de colores** consistente
10. **Usar fontFamily: 'Montserrat, sans-serif'** para títulos y fontWeight: 700 o 500

## 🔤 Tipografía

### Títulos
```tsx
// H1 - Títulos principales
<h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
  Título Principal
</h1>

// H2 - Subtítulos
<h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
  Subtítulo
</h2>
```

### Texto Normal
- Roboto Regular para texto de cuerpo
- Usar clases de Tailwind: `text-sm`, `text-base`, `text-lg`

## 📊 Ejemplo Completo de Módulo

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Plus, TrendingUp } from 'lucide-react';
import { 
  ModuleContainer, 
  ModuleHeader, 
  ModuleSection, 
  StatCard,
  ModuleTable 
} from '../shared';
import { Button } from '../ui/button';

export function MiModulo() {
  const { t } = useTranslation();

  return (
    <ModuleContainer>
      <ModuleHeader
        icon={Package}
        title={t('module.title')}
        description={t('module.description')}
        actions={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t('module.add')}
          </Button>
        }
      />

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          title={t('module.total')}
          value="1,234"
          iconColor="#1a4d7a"
          borderColor="#1a4d7a"
          valueColor="#1a4d7a"
          trendIcon={TrendingUp}
          badge={{ text: '100 activos', variant: 'primary' }}
        />
      </div>

      {/* Contenido */}
      <ModuleSection
        title={t('module.list')}
        icon={Package}
        variant="glass"
      >
        <ModuleTable
          data={data}
          columns={columns}
          keyExtractor={(item) => item.id}
          hoverable
        />
      </ModuleSection>
    </ModuleContainer>
  );
}
```
