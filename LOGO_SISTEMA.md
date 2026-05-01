# 🎨 LOGO OFICIAL DEL SISTEMA
## DMi - Gestion de banques alimentaires

---

## 📋 **INFORMACIÓN GENERAL**

**Nombre del Logo**: DMi - Gestion de banques alimentaires  
**Versión Actual**: 2.1  
**Última Actualización**: 15 de Febrero, 2026  
**Formato**: PNG con transparencia  
**Referencia de Asset**: `figma:asset/88882bc723a7419ad993393bc21033b23ba79364.png`

---

## 🎨 **DESCRIPCIÓN DEL DISEÑO**

### **Composición Visual**

El logo DMi es un diseño 3D premium que combina elegancia, modernidad y funcionalidad:

#### **Elementos Principales:**

1. **Letra "D"** (Primera letra)
   - Color: **Turquesa/Cyan** (#4db8b8)
   - Estilo: 3D con gradiente y sombras
   - Efecto: Profundidad visual hacia adelante
   - Significado: Dinamismo y modernidad

2. **Letra "M"** (Segunda letra)
   - Color: **Azul marino/Gris oscuro** (#5a6b7c)
   - Estilo: 3D con gradiente y sombras
   - Efecto: Sólido y robusto
   - Significado: Confianza y profesionalismo

3. **Letra "i"** con icono de lupa
   - Color base: Azul marino/gris oscuro (#5a6b7c)
   - Icono: Lupa de búsqueda en **blanco** integrada
   - Estilo: Diseño 3D con efecto de elevación
   - Significado: Funcionalidad de búsqueda y gestión

4. **Texto Descriptivo**
   - Texto: "Gestion de banques alimentaires"
   - Tipografía: Serif elegante (similar a Playfair Display o Georgia)
   - Color: Gris oscuro (#5a6b7c)
   - Posición: Centrado debajo del logo principal

### **Efectos y Acabados**

- ✨ **Sombras**: Sombras suaves que crean profundidad 3D
- 🌟 **Gradientes**: Transiciones de color sutiles en cada letra
- 💎 **Iluminación**: Efecto de luz superior izquierda
- 🎭 **Profundidad**: Capas superpuestas con diferentes alturas visuales

---

## 🎯 **INTEGRACIÓN CON LA PALETA DE COLORES**

El logo DMi coordina perfectamente con la paleta oficial del sistema:

| Color del Logo | Color del Sistema | Función |
|----------------|-------------------|---------|
| **Turquesa** (#4db8b8) | **Verde Secundario** (#2d9561) | Complementariedad en acciones y estados activos |
| **Azul marino** (#5a6b7c) | **Azul Primario** (#1a4d7a) | Coordinación perfecta con headers y navegación |
| **Blanco** (lupa) | **Backgrounds blancos** | Contraste y claridad visual |

### **Armonía Cromática**

```
Logo DMi (Turquesa + Azul marino + Blanco)
    ↓
Sistema BA (Azul primario + Verde secundario + Blanco)
    ↓
= Coherencia Visual Total ✅
```

---

## 📐 **ESPECIFICACIONES TÉCNICAS**

### **Formato de Archivo**

- **Tipo**: PNG (Portable Network Graphics)
- **Transparencia**: Sí (canal alfa completo)
- **Fondo**: Transparente
- **Resolución**: Alta resolución optimizada para web
- **Compresión**: Optimizada para rendimiento web

### **Dimensiones Recomendadas**

El logo es flexible y se adapta a múltiples tamaños:

| Uso | Dimensiones Mínimas | Dimensiones Máximas | Formato Circular |
|-----|---------------------|---------------------|------------------|
| **Favicon** | 32×32 px | 64×64 px | ✅ Sí |
| **Header Mobile** | 28×28 px | 36×36 px | ✅ Sí |
| **Header Desktop** | 36×36 px | 48×48 px | ✅ Sí |
| **Sidebar** | 40×40 px | 56×56 px | ✅ Sí |
| **Login Screen** | 112×112 px | 160×160 px | ✅ Sí |
| **Pantalla Principal** | 128×128 px | 256×256 px | ✅ Sí |
| **Documentos/Reportes** | 256×256 px | 512×512 px | ❌ No (rectangular) |

---

## 🔄 **IMPLEMENTACIÓN TÉCNICA**

### **Importación en React/TypeScript**

```tsx
// En el hook useBranding.ts
import defaultLogo from 'figma:asset/88882bc723a7419ad993393bc21033b23ba79364.png';

// Uso en componentes
import { useBranding } from '../../../hooks/useBranding';

function MiComponente() {
  const branding = useBranding();
  
  return (
    <img 
      src={branding.logo} 
      alt="DMi - Gestion de banques alimentaires"
      className="logo-circular"
    />
  );
}
```

### **Formato Circular Optimizado**

```tsx
// Logo circular con relleno completo
<img 
  src={branding.logo} 
  alt="Logo DMi" 
  className="h-full w-full rounded-full"
  style={{ 
    objectFit: 'cover',
    objectPosition: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    border: '2px solid rgba(255,255,255,0.9)'
  }}
/>
```

### **Con Efecto Glow**

```tsx
<div className="relative">
  {/* Resplandor de fondo */}
  <div 
    className="absolute inset-0 rounded-full blur-md opacity-50"
    style={{ backgroundColor: branding.secondaryColor }}
  />
  
  {/* Logo principal */}
  <img 
    src={branding.logo} 
    alt="Logo DMi"
    className="h-9 w-9 rounded-full relative z-10"
    style={{ 
      objectFit: 'cover',
      objectPosition: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      border: '2px solid rgba(255,255,255,0.9)'
    }}
  />
</div>
```

---

## 🎯 **USOS Y APLICACIONES**

### **✅ Usos Correctos**

1. **Header de Navegación**: Logo circular pequeño (28-36px)
2. **Pantalla de Login**: Logo circular grande (112-128px)
3. **Acceso de Organismos**: Logo circular mediano (64-80px)
4. **Selección de Departamentos**: Logo circular grande (80-96px)
5. **Sidebar de Comptoir**: Logo circular pequeño (40px)
6. **Documentos y Reportes**: Logo rectangular completo con texto
7. **Emails del Sistema**: Logo rectangular centrado
8. **Material Impreso**: Logo en alta resolución con texto

### **❌ Usos Incorrectos**

1. ❌ Distorsionar o estirar el logo (siempre usar `object-fit: cover`)
2. ❌ Cambiar los colores originales del logo
3. ❌ Agregar efectos que comprometan la legibilidad
4. ❌ Usar sobre fondos que no contrasten adecuadamente
5. ❌ Rotar o inclinar el logo sin justificación
6. ❌ Combinar con logos de otras organizaciones sin espacio adecuado

---

## 🌐 **ADAPTACIÓN MULTILINGÜE**

El logo DMi es **universal** y funciona en todos los idiomas del sistema:

- 🇫🇷 **Francés** (predeterminado): "Gestion de banques alimentaires"
- 🇪🇸 **Español**: El logo permanece igual (texto en francés)
- 🇬🇧 **Inglés**: El logo permanece igual (texto en francés)
- 🇸🇦 **Árabe** (RTL): El logo permanece igual, centrado

**Nota**: El texto del logo está en francés como estándar internacional del sistema, independientemente del idioma de la interfaz.

---

## 📱 **RESPONSIVE DESIGN**

### **Adaptación por Dispositivo**

```css
/* Mobile First */
.logo-container {
  width: 28px;
  height: 28px;
}

/* Tablet */
@media (min-width: 640px) {
  .logo-container {
    width: 36px;
    height: 36px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .logo-container {
    width: 48px;
    height: 48px;
  }
}

/* Large Desktop */
@media (min-width: 1280px) {
  .logo-container {
    width: 56px;
    height: 56px;
  }
}
```

---

## 🔐 **PROTECCIÓN Y DERECHOS**

- **Propiedad**: Sistema DMi - Gestion de banques alimentaires
- **Desarrollador**: David (Lettycia26)
- **Uso**: Exclusivo para el sistema Banque Alimentaire
- **Modificaciones**: Requieren aprobación del desarrollador
- **Distribución**: Limitada al contexto del sistema

---

## 📝 **CHECKLIST DE IMPLEMENTACIÓN**

Cuando implementes el logo DMi, verifica:

- [ ] Importación correcta desde `figma:asset/88882bc723a7419ad993393bc21033b23ba79364.png`
- [ ] Uso del hook `useBranding()` para obtener el logo
- [ ] Aplicación de `border-radius: 50%` para formato circular
- [ ] Uso de `object-fit: cover` y `object-position: center`
- [ ] Bordes blancos aplicados: `border: 2px solid rgba(255,255,255,0.9)`
- [ ] Sombras profesionales: externa `0 2px 8px rgba(0,0,0,0.15)` e interna `0 2px 8px rgba(0,0,0,0.1) inset`
- [ ] Alt text descriptivo: "DMi - Gestion de banques alimentaires" o "Logo DMi"
- [ ] Tamaño apropiado según contexto (ver tabla de dimensiones)
- [ ] Contraste adecuado con el fondo
- [ ] Responsive design implementado

---

## 🎨 **VARIANTES DEL LOGO**

### **1. Versión Circular (Principal)**
- **Uso**: Header, login, sidebars, cards
- **Formato**: Recorte circular con relleno completo
- **Tamaños**: 28px a 160px
- **Implementación**: Actual en el sistema ✅

### **2. Versión Rectangular Completa**
- **Uso**: Reportes, documentos, emails
- **Formato**: Logo completo con texto descriptivo
- **Tamaños**: 256px a 512px
- **Implementación**: Pendiente para reportes 📋

### **3. Versión Monocromática** (Futura)
- **Uso**: Impresión en blanco y negro
- **Formato**: Una sola tinta
- **Implementación**: Pendiente 🔄

---

## 📊 **ESTADÍSTICAS DE USO**

El logo DMi aparece en:

- ✅ Componente **Layout** (header principal)
- ✅ Página **Login** (pantalla de inicio de sesión)
- ✅ Página **AccesoOrganismo** (acceso público)
- ✅ Página **Departamentos** (selección de departamento)
- ✅ Componente **IDDigital** (sidebar del comptoir)
- ✅ Hook **useBranding** (configuración global)
- ⏳ Reportes PDF (pendiente)
- ⏳ Emails del sistema (pendiente)

---

## 🔄 **HISTORIAL DE VERSIONES DEL LOGO**

### **Versión 2.1 (Actual)** - 15 de Febrero, 2026
- ✨ Logo 3D "DMi - Gestion de banques alimentaires"
- 🎨 Diseño con turquesa, azul marino y lupa integrada
- 📦 Asset: `figma:asset/88882bc723a7419ad993393bc21033b23ba79364.png`
- ✅ Implementado en formato circular con relleno completo
- ✅ Optimizado para todos los tamaños

### **Versión 2.0** - Febrero 2026
- 🔵 Logo "DMi" circular con icono de búsqueda
- Asset anterior (reemplazado)

### **Versión 1.0** - Inicial
- Logo básico del sistema

---

## 💡 **CONSEJOS Y MEJORES PRÁCTICAS**

1. **Siempre usar el hook `useBranding()`**: No hardcodear la URL del logo
2. **Mantener las proporciones**: Usar `object-fit: cover` siempre
3. **Fondos contrastantes**: Asegurar legibilidad en todos los contextos
4. **Tamaño apropiado**: No usar logos demasiado grandes o pequeños
5. **Accesibilidad**: Incluir siempre alt text descriptivo
6. **Performance**: El logo está optimizado, no re-optimizar
7. **Consistencia**: Usar las mismas clases CSS en todo el sistema
8. **Responsive**: Ajustar tamaño según breakpoints

---

## 📞 **SOPORTE**

Para cambios o consultas sobre el logo DMi:

- **Desarrollador**: David (Lettycia26)
- **Sistema**: Banque Alimentaire - DMi Gestion
- **Documentación**: `/PALETA_COLORES.md` y `/LOGO_SISTEMA.md`

---

**Última actualización**: 15 de Febrero, 2026  
**Estado**: ✅ Activo y en uso  
**Próxima revisión**: Según necesidades del proyecto
