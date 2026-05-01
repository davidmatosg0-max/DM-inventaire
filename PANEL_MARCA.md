# Panel de Marca - Sistema Banco de Alimentos

## 📋 Descripción

El Panel de Marca permite personalizar completamente la identidad visual del sistema del Banco de Alimentos, incluyendo colores corporativos y logo.

## 🎨 Características

### 1. **Personalización de Colores**
- **Color Principal**: Usado en encabezados, menús laterales y elementos principales
- **Color Secundario**: Usado en botones secundarios y acentos visuales
- **Color de Éxito**: Mensajes de confirmación y acciones completadas
- **Color de Peligro**: Alertas y acciones peligrosas
- **Color de Advertencia**: Notificaciones importantes

### 2. **Gestión de Logo**
- Carga de logo personalizado (PNG, JPG, SVG)
- Tamaño máximo: 2MB
- Se muestra en el header del sistema
- Soporte para fondo transparente

### 3. **Nombre del Sistema**
- Personalización del nombre mostrado en el header
- Se actualiza en tiempo real

### 4. **Vista Previa en Tiempo Real**
- Modo de vista previa para ver cambios antes de guardar
- Ejemplos visuales de cómo se verán los colores

## 🚀 Cómo Usar

### Acceso al Panel
1. Navega al menú lateral
2. Haz clic en "Panel de Marca" (icono de paleta)
3. Se abrirá la interfaz de personalización

### Cambiar Colores
1. En la sección "Paleta de Colores"
2. Haz clic en el selector de color
3. Elige tu color personalizado
4. O ingresa el código hexadecimal manualmente
5. Activa "Vista Previa" para ver los cambios
6. Haz clic en "Guardar Cambios" para aplicar

### Subir Logo
1. En la sección "Logo del Sistema"
2. Haz clic en "Seleccionar Archivo"
3. Elige tu imagen (máx. 2MB)
4. El logo aparecerá en la vista previa
5. Haz clic en "Guardar Cambios"

### Restablecer Valores
- Haz clic en "Restablecer" para volver a los colores y configuración por defecto

## 💻 Uso en Componentes

### Usar colores de marca en componentes nuevos

```tsx
import { useBranding } from '../hooks/useBranding';

function MiComponente() {
  const branding = useBranding();

  return (
    <div style={{ backgroundColor: branding.primaryColor }}>
      <h1>{branding.systemName}</h1>
      {branding.logo && <img src={branding.logo} alt="Logo" />}
    </div>
  );
}
```

### Usar clases CSS de marca

```tsx
// Usar las clases predefinidas
<button className="bg-brand-primary text-white">
  Botón Principal
</button>

<button className="bg-brand-secondary text-white">
  Botón Secundario
</button>

<div className="border-brand-primary">
  Contenido con borde del color principal
</div>
```

### Usar el componente StatCard

```tsx
import { StatCard } from './components/ui/StatCard';
import { Package } from 'lucide-react';

<StatCard
  title="Total Productos"
  value="1,234"
  icon={Package}
  colorType="primary"
  trend={{ value: 12, isPositive: true }}
/>
```

## 🎯 Colores por Defecto

```css
--color-primary: #1E73BE    /* Azul */
--color-secondary: #4CAF50   /* Verde */
--color-success: #4CAF50     /* Verde */
--color-danger: #DC3545      /* Rojo */
--color-warning: #FFC107     /* Naranja */
```

## 📦 Archivos Importantes

- `/src/app/components/pages/PanelMarca.tsx` - Componente principal del panel
- `/src/hooks/useBranding.ts` - Hook para acceder a la configuración
- `/src/styles/branding.css` - Estilos y variables CSS
- `/src/app/components/ui/StatCard.tsx` - Componente ejemplo usando branding

## 💾 Almacenamiento

La configuración se guarda en `localStorage` del navegador:
- Clave: `brandingConfig`
- Formato: JSON
- Persiste entre sesiones del usuario

## 🔄 Eventos Personalizados

El sistema emite un evento cuando se actualiza la configuración:

```typescript
window.addEventListener('brandingUpdated', (event: CustomEvent) => {
  console.log('Nueva configuración:', event.detail);
});
```

## ⚠️ Notas Importantes

1. **Contraste**: Asegúrate de que los colores tengan suficiente contraste con el texto blanco
2. **Formato de colores**: Usa formato hexadecimal (#RRGGBB)
3. **Tamaño del logo**: Máximo 2MB para mantener buen rendimiento
4. **Formato del logo**: Se recomienda PNG con fondo transparente
5. **Persistencia**: Los cambios solo se guardan en el navegador actual

## 🎨 Mejores Prácticas

1. **Coherencia**: Mantén una paleta de colores coherente
2. **Accesibilidad**: Verifica el contraste para usuarios con discapacidad visual
3. **Simplicidad**: No uses más de 3-4 colores principales
4. **Pruebas**: Usa la vista previa antes de guardar cambios definitivos
5. **Logo**: Usa logos con buena resolución y fondo transparente

## 🔧 Solución de Problemas

**Los colores no se aplican:**
- Verifica que hayas hecho clic en "Guardar Cambios"
- Refresca la página
- Verifica la consola del navegador para errores

**El logo no se muestra:**
- Verifica el tamaño del archivo (máx. 2MB)
- Asegúrate de que sea un formato de imagen válido
- Prueba con otro navegador

**Los cambios desaparecen:**
- Verifica que no estés en modo incógnito
- Los cambios solo persisten en el navegador donde se guardaron
- Revisa si el localStorage está habilitado

## 📞 Soporte

Para más información o soporte, contacta al equipo de desarrollo del sistema.
