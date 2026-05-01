# Logo de Marca en ID Digital de Contactos

## 📋 Descripción

El sistema de ID Digital ahora integra automáticamente el logo y colores de marca personalizados configurados en el Panel de Marca, brindando una experiencia visual coherente y profesional.

## 🎨 Integración del Logo

### Ubicaciones del Logo en ID Digital

1. **Header de la Tarjeta de ID**
   - El logo aparece en la esquina superior izquierda
   - Altura: 24px (6 unidades Tailwind)
   - Opacidad: 90% para mejor integración con el fondo
   - Se muestra junto al texto "ID Digital"

2. **Área del Código QR**
   - El nombre del sistema aparece debajo del código QR
   - Usa el color principal de marca
   - Tamaño de fuente: extra pequeño (xs)

## 🎨 Colores Personalizados

Los IDs digitales usan dinámicamente los colores de marca:

### Header del ID
```tsx
// Gradiente usando el color principal
background: linear-gradient(135deg, primaryColor, primaryColor + alpha)
```

### Badges de Estado
- **Vigente**: Usa `successColor` (verde por defecto)
- **Por Vencer**: Usa `warningColor` (naranja por defecto)
- **Vencido**: Usa `dangerColor` (rojo por defecto)
- **Activo**: Usa fondo blanco con texto en `primaryColor`

## 📱 Visualización

### Estructura del ID Digital

```
┌─────────────────────────────────────┐
│ [Logo] ID Digital        [Badge]    │ ← Header con color principal
│ ID-2024-001                          │
├─────────────────────────────────────┤
│ [Foto] Nombre Beneficiario           │
│        Organismo                     │
│        [Badge Estado]                │
│                                      │
│ Emisión: DD/MM/YYYY                  │
│ Vencimiento: DD/MM/YYYY              │
│                                      │
│ ┌─────────────────────┐              │
│ │     [QR Code]       │              │
│ │   QR-CODE-123       │              │
│ │   Banco Alimentos   │ ← Nombre     │
│ └─────────────────────┘              │
│                                      │
│ [Ver QR]  [Descargar]                │
│ [Enviar Credenciales]                │
└─────────────────────────────────────┘
```

## 🔧 Implementación Técnica

### Hook de Branding
```tsx
import { useBranding } from '../../../hooks/useBranding';

function IDDigital() {
  const branding = useBranding();
  
  // El hook proporciona:
  // - branding.logo (string | null)
  // - branding.systemName (string)
  // - branding.primaryColor (string)
  // - branding.successColor (string)
  // - branding.warningColor (string)
  // - branding.dangerColor (string)
}
```

### Renderizado del Logo
```tsx
{branding.logo && (
  <img 
    src={branding.logo} 
    alt="Logo" 
    className="h-6 w-auto opacity-90"
  />
)}
```

### Aplicación de Colores
```tsx
// Header con gradiente
<div style={{ 
  background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)`
}}>

// Badges con colores dinámicos
<Badge style={{ backgroundColor: branding.successColor }}>
  Vigente
</Badge>
```

## ✨ Características

### Responsive
- El logo se adapta automáticamente al tamaño disponible
- Mantiene proporciones originales (w-auto)
- Se oculta en pantallas muy pequeñas si es necesario

### Fallback
- Si no hay logo configurado, solo se muestra el texto
- Si no hay nombre del sistema, no se muestra línea vacía
- Los colores siempre tienen valores por defecto

### Actualización en Tiempo Real
- Los cambios en el Panel de Marca se reflejan inmediatamente
- No requiere recargar la página
- Usa eventos personalizados para sincronización

## 🎯 Mejores Prácticas para el Logo

### Dimensiones Recomendadas
- **Ancho**: 200-400px
- **Alto**: 60-100px
- **Formato**: PNG con fondo transparente
- **Tamaño**: < 2MB

### Diseño
1. **Simplicidad**: Logos simples se ven mejor en tamaños pequeños
2. **Contraste**: Asegura que el logo sea visible sobre fondo de color
3. **Horizontal**: Logos horizontales funcionan mejor en el header
4. **Monocromo**: Considera una versión en blanco para fondos oscuros

### Ejemplos de Buenos Logos para ID

✅ **Recomendado:**
- Logo horizontal con texto
- Isotipo (símbolo) simple
- Versión en blanco/transparente
- Bordes redondeados o suaves

❌ **Evitar:**
- Logos muy verticales (ocupan mucho espacio)
- Múltiples colores complejos
- Textos muy pequeños o detallados
- Fondos sólidos no transparentes

## 🔄 Sincronización

### Cuando se Actualiza el Logo
1. Usuario configura logo en Panel de Marca
2. Se guarda en localStorage como Base64
3. Se dispara evento `brandingUpdated`
4. Todos los componentes con `useBranding()` se actualizan
5. Los IDs digitales muestran el nuevo logo instantáneamente

### Persistencia
- El logo se guarda localmente en el navegador
- Persiste entre sesiones
- Se puede exportar/importar la configuración

## 📊 Casos de Uso

### Múltiples Bancos de Alimentos
Si gestionas varios bancos de alimentos:
- Cada uno puede tener su propio logo
- Los colores corporativos se aplican consistentemente
- Los IDs se ven profesionales y personalizados

### White Label
El sistema permite personalización completa:
- Logo propio
- Colores corporativos
- Nombre del sistema
- Identidad visual única

## 🐛 Solución de Problemas

**El logo no aparece:**
- Verifica que el logo esté configurado en Panel de Marca
- Revisa el formato del archivo (PNG, JPG, SVG)
- Comprueba el tamaño (< 2MB)
- Limpia el caché del navegador

**El logo se ve pixelado:**
- Usa una imagen de mayor resolución
- Formato PNG con transparencia
- Mínimo 200px de ancho recomendado

**El logo se corta:**
- Ajusta las proporciones de la imagen original
- Usa logos horizontales en lugar de verticales
- Verifica que el fondo sea transparente

## 📞 Soporte

Para personalizar aún más la apariencia de los IDs digitales, consulta:
- `/PANEL_MARCA.md` - Documentación del Panel de Marca
- `/src/hooks/useBranding.ts` - Hook de branding
- `/src/app/components/pages/IDDigital.tsx` - Componente principal
