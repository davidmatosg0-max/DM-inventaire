# 🎨 PALETA DE COLORES PREDETERMINADA DEL SISTEMA
## Banque Alimentaire - DMi Gestion

---

## 📊 **COLORES OFICIALES DEL SISTEMA**

Esta es la paleta de colores **predeterminada y oficial** del sistema de gestión de banques alimentaires. Estos colores deben ser utilizados en todo el sistema para mantener coherencia visual y profesionalismo.

### **Colores Principales**

| Color | Código HEX | Nombre | Uso Principal |
|-------|------------|--------|---------------|
| 🔵 **Primario** | `#1a4d7a` | Azul marino profesional | Headers, navegación, iconos principales, enlaces |
| 🟢 **Secundario** | `#2d9561` | Verde elegante | Botones de acción, estados activos, barras de progreso |
| ✅ **Éxito** | `#2d9561` | Verde éxito | Confirmaciones, estados completados, ofertas activas |
| 🔴 **Peligro** | `#c23934` | Rojo elegante | Errores, eliminaciones, estados rechazados |
| 🟡 **Alerta** | `#e8a419` | Naranja/amarillo profesional | Advertencias, estados pendientes, notificaciones |

---

## 🖼️ **IDENTIDAD VISUAL**

### **Logo Predeterminado del Sistema**

**Nombre**: "DMi - Gestion de banques alimentaires"

**Descripción del Diseño**:
- 🎨 **Estilo**: Logo 3D con efecto de profundidad y sombras
- 📐 **Composición**:
  - Letra **"D"** en color **turquesa/cyan** (#4db8b8) con efecto 3D
  - Letra **"M"** en color **azul marino/gris oscuro** (#5a6b7c) con efecto 3D
  - Letra **"i"** con icono de **lupa** (búsqueda) integrado en blanco
  - Texto inferior: "Gestion de banques alimentaires" en tipografía serif elegante
- 🖼️ **Formato**: PNG con fondo transparente
- 📦 **Referencia**: `figma:asset/88882bc723a7419ad993393bc21033b23ba79364.png`
- ✨ **Características**: Diseño premium con sombras sutiles que aportan profesionalismo

**Integración con la Paleta**:
- El turquesa del logo complementa el verde secundario (#2d9561)
- El azul marino del logo coordina perfectamente con el azul primario (#1a4d7a)
- El icono de lupa refuerza la funcionalidad de búsqueda/gestión del sistema

**Configuración Técnica**:
- **Nombre del Sistema**: Banque Alimentaire
- **Formato de Visualización**: Circular optimizado con relleno completo
- **Tipografías del Sistema**:
  - **Títulos**: Montserrat Bold / Medium
  - **Cuerpo**: Roboto Regular

### **📐 Especificaciones del Logo Circular**

El logo DMi utiliza un diseño circular optimizado con las siguientes características:

- **Forma**: Círculo perfecto (border-radius: 50%)
- **Relleno**: Completo, sin espacios vacíos - la imagen llena todo el círculo
- **Ajuste**: object-fit: cover + object-position: center (mantiene proporciones y centra la imagen)
- **Borde**: 2-4px solid rgba(255, 255, 255, 0.9) según tamaño
- **Sombras**:
  - Externa: `0 2px 8px rgba(0,0,0,0.15)` - profundidad profesional
  - Interna: `0 2px 8px rgba(0,0,0,0.1) inset` - efecto de relieve
- **Efecto Glow**: Resplandor de fondo opcional con `blur-md opacity-50`

### **📏 Tamaños Estandarizados del Logo**

| Ubicación | Clase CSS | Tamaño Móvil | Tamaño Desktop |
|-----------|-----------|--------------|----------------|
| Header | `logo-circular-sm` | 28px × 28px | 36px × 36px |
| Sidebar | `logo-circular-md` | 40px × 40px | 48px × 48px |
| Login/Pantallas Principales | `logo-circular-lg` | 64px × 64px | 80-96px |
| Bienvenida/Departamentos | `logo-circular-xl` | 112px × 112px | 128px × 128px |

---

## 📱 **APLICACIÓN DE COLORES POR MÓDULO**

### **Panel Principal (Dashboard)**
- Header: `#1a4d7a` (Primario)
- Cards activas: `#2d9561` (Secundario)
- Estadísticas positivas: `#2d9561` (Éxito)

### **Inventario**
- Productos disponibles: `#2d9561` (Éxito)
- Stock bajo: `#e8a419` (Alerta)
- Sin stock: `#c23934` (Peligro)

### **Comandas**
- Estado confirmado: `#2d9561` (Éxito)
- Estado pendiente: `#e8a419` (Alerta)
- Estado cancelado: `#c23934` (Peligro)
- Iconos y badges: `#1a4d7a` (Primario)

### **Organismos**
- Organismos activos: `#2d9561` (Éxito)
- Información principal: `#1a4d7a` (Primario)
- Alertas: `#e8a419` (Alerta)

### **Ofertas Especiales**
- Ofertas activas: `#2d9561` (Secundario)
- Ofertas expiradas: `#c23934` (Peligro)
- Ofertas próximas a expirar: `#e8a419` (Alerta)
- Bordes y acentos: `#2d9561` (Secundario)

### **Transporte**
- Rutas activas: `#2d9561` (Éxito)
- Rutas en progreso: `#1a4d7a` (Primario)
- Rutas con incidencias: `#e8a419` (Alerta)

### **Reportes**
- Gráficos principales: `#1a4d7a` (Primario)
- Datos positivos: `#2d9561` (Éxito)
- Advertencias: `#e8a419` (Alerta)

---

## 💡 **GUÍA DE USO**

### **Botones**
```tsx
// Botón primario (acción principal)
style={{ backgroundColor: branding.secondaryColor }} // #2d9561

// Botón secundario (acción alternativa)
style={{ backgroundColor: branding.primaryColor }} // #1a4d7a

// Botón de peligro (eliminar, cancelar)
style={{ backgroundColor: branding.dangerColor }} // #c23934
```

### **Badges y Estados**
```tsx
// Estado activo/éxito
style={{ backgroundColor: branding.successColor }} // #2d9561

// Estado pendiente/alerta
style={{ backgroundColor: branding.warningColor }} // #e8a419

// Estado rechazado/error
style={{ backgroundColor: branding.dangerColor }} // #c23934
```

### **Bordes y Acentos**
```tsx
// Bordes principales
style={{ borderColor: branding.primaryColor }} // #1a4d7a

// Bordes de elementos activos
style={{ borderColor: branding.secondaryColor }} // #2d9561

// Bordes de alerta
style={{ borderColor: branding.warningColor }} // #e8a419
```

---

## 🔧 **IMPLEMENTACIÓN TÉCNICA**

### **Hook de Branding**
```tsx
import { useBranding } from '../../../hooks/useBranding';

function MiComponente() {
  const branding = useBranding();
  
  return (
    <div style={{ backgroundColor: branding.primaryColor }}>
      {/* Contenido */}
    </div>
  );
}
```

### **Variables CSS**
```css
:root {
  --color-primary: #1a4d7a;
  --color-secondary: #2d9561;
  --color-success: #2d9561;
  --color-danger: #c23934;
  --color-warning: #e8a419;
}
```

---

## 🌐 **COMPATIBILIDAD MULTILINGÜE**

Estos colores son consistentes en todos los idiomas del sistema:
- 🇫🇷 Francés (predeterminado)
- 🇪🇸 Español
- 🇬🇧 Inglés
- 🇸🇦 Árabe (con soporte RTL)

---

## 📝 **NOTAS IMPORTANTES**

1. **NO** usar colores hardcodeados. Siempre usar `branding.primaryColor`, `branding.secondaryColor`, etc.
2. Los colores pueden ser personalizados por cada banque alimentaire desde el módulo "Aide et Support"
3. Esta paleta coordina perfectamente con el logo predeterminado "DMi" (circular con icono de búsqueda)
4. Todos los módulos nuevos deben seguir esta guía de colores
5. La moneda del sistema es **CAD$** (Dólar Canadiense)

---

## 🎯 **CONSISTENCIA VISUAL**

✅ **Módulos ya sincronizados con esta paleta:**
- Panel Principal (Dashboard)
- Inventario
- Comandas
- Organismos
- Vista Pública de Organismos
- Ofertas Especiales
- Transporte
- Reportes
- Usuarios/Roles
- Comptoir
- Aide et Support

---

## 📅 **Historial de Versiones**

- **v2.3.1** - Febrero 2026: Hotfix - Solución a problema de persistencia del logo predeterminado. Logo ahora se carga dinámicamente para evitar problemas de serialización JSON.
- **v2.3** - Febrero 2026: Implementación de persistencia permanente de colores en localStorage. Los colores ya no cambian al cerrar sesión.
- **v2.2** - Febrero 2026: Actualización del logo predeterminado a diseño 3D "DMi - Gestion de banques alimentaires" con turquesa, azul marino y lupa integrada (Asset: figma:asset/88882bc723a7419ad993393bc21033b23ba79364.png)
- **v2.1** - Febrero 2026: Implementación de logo circular con relleno completo optimizado
- **v2.0** - Febrero 2026: Paleta oficial establecida con logo DMi circular
- **v1.0** - Inicial: Sistema básico

---

## 💾 **PERSISTENCIA DE CONFIGURACIÓN**

### **Configuración Permanente**

⚠️ **IMPORTANTE**: Los colores del sistema se guardan automáticamente en `localStorage` y permanecen activos incluso después de cerrar sesión. Solo pueden ser modificados explícitamente por el usuario desde el módulo "Aide et Support > Personnalisation".

**Clave de almacenamiento**: `brandingConfig_permanent`

**Comportamiento**:
- ✅ Primera carga: Colores predeterminados se guardan automáticamente
- ✅ Cargas subsecuentes: Colores guardados se cargan automáticamente
- ✅ Cierre de sesión: Los colores NO cambian, permanecen guardados
- ✅ Modificación: Solo a través del panel de personalización
- ✅ Restablecimiento: Disponible en cualquier momento desde el panel

Para más información, consultar: `/CONFIGURACION_PERSISTENCIA_COLORES.md`

---

**Última actualización**: 15 de Febrero, 2026  
**Desarrollador**: David (Lettycia26)  
**Sistema**: DMi - Gestion de banques alimentaires