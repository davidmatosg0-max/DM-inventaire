# Colores Predeterminados del Sistema
# Sistema Integral de Gestión - Banque Alimentaire

## 🎨 Paleta de Colores Oficial

Estos colores están guardados como predeterminados en todo el sistema y se aplican automáticamente.

### **Colores Principales**

| Nombre | Código Hex | Uso Principal | Variable CSS |
|--------|-----------|---------------|--------------|
| **Azul Marino Profesional** | `#1a4d7a` | Color primario - Headers, navegación, botones principales, enlaces | `--color-primary` |
| **Verde Elegante** | `#2d9561` | Color secundario - Botones de acción positiva, estados de éxito | `--color-secondary` |
| **Rojo Elegante** | `#c23934` | Color de peligro - Botones de eliminar, alertas de error | `--color-danger` |
| **Naranja Profesional** | `#e8a419` | Color de advertencia - Avisos importantes, alertas medias | `--color-warning` |

---

## 📍 Ubicaciones en el Código

### 1. **Hook de Branding** (`/src/hooks/useBranding.ts`)
```typescript
const DEFAULT_BRANDING: BrandingConfig = {
  primaryColor: '#1a4d7a',      // Azul marino profesional
  secondaryColor: '#2d9561',    // Verde elegante
  successColor: '#2d9561',      // Verde éxito
  dangerColor: '#c23934',       // Rojo elegante
  warningColor: '#e8a419',      // Naranja/amarillo profesional
  logo: defaultLogo,
  systemName: 'Banque Alimentaire'
};
```

### 2. **Panel de Marca** (`/src/app/components/pages/PanelMarca.tsx`)
```typescript
const DEFAULT_BRANDING: BrandingConfig = {
  primaryColor: '#1a4d7a',      // Azul marino profesional
  secondaryColor: '#2d9561',    // Verde elegante
  successColor: '#2d9561',      // Verde éxito
  dangerColor: '#c23934',       // Rojo elegante
  warningColor: '#e8a419',      // Naranja/amarillo profesional
  logo: null,
  systemName: 'Banque Alimentaire'
};
```

### 3. **Tema CSS** (`/src/styles/theme.css`)
```css
:root {
  --primary: #1a4d7a;
  --accent: #2d9561;
  --destructive: #c23934;
  --warning: #e8a419;
  --sidebar: #1a4d7a;
  --chart-1: #1a4d7a;
  --chart-2: #2d9561;
  --chart-3: #e8a419;
  --chart-4: #c23934;
}
```

### 4. **Página de Departamentos** (`/src/app/components/pages/Departamentos.tsx`)
- Formulario predeterminado: `#1a4d7a`
- Botón "Volver": `#1a4d7a`
- Botón "Añadir Departamento": `#2d9561`
- Botón "Guardar": `#2d9561`
- Botón "Eliminar": `#c23934`
- Todos los íconos y elementos decorativos

---

## 🔄 Comportamiento del Sistema

### **Al Cargar la Aplicación**
1. El hook `useBranding` carga automáticamente los colores predeterminados
2. Si existe configuración personalizada en localStorage, se carga esa configuración
3. Si hay error al cargar, se vuelve a los colores predeterminados
4. Los colores se aplican a las variables CSS globales

### **Botón "Restablecer" en Panel de Marca**
Cuando el usuario presiona "Restablecer":
1. Se limpia la configuración personalizada de localStorage
2. Se vuelve a `DEFAULT_BRANDING` con los colores oficiales
3. Se eliminan las variables CSS personalizadas
4. El sistema vuelve a usar los colores predeterminados

### **Personalización**
Los usuarios pueden:
- Cambiar cualquier color desde el Panel de Marca
- Ver vista previa antes de guardar
- Guardar cambios (se almacenan en localStorage del navegador)
- Restablecer a los colores predeterminados en cualquier momento

---

## 🎯 Aplicaciones de Colores

### **Azul Marino (#1a4d7a)**
- Headers de páginas
- Barra lateral de navegación
- Botones primarios (Volver, etc.)
- Enlaces y textos destacados
- Bordes de tablas principales
- Iconos de información
- Logo del sistema (fondo)
- Formas decorativas de fondo

### **Verde Elegante (#2d9561)**
- Botones de acción positiva (Guardar, Añadir, Confirmar)
- Estados de éxito y confirmación
- Indicadores de stock óptimo
- Ubicaciones de productos
- Elementos secundarios destacados
- Formas decorativas complementarias

### **Rojo Elegante (#c23934)**
- Botones de eliminación
- Alertas de error
- Confirmaciones destructivas
- Estados de alerta crítica
- Indicadores de stock bajo

### **Naranja Profesional (#e8a419)**
- Advertencias importantes
- Estados de stock medio
- Alertas de atención
- Indicadores intermedios

---

## ✅ Estado Actual

### **Archivos Actualizados:**
- ✅ `/src/hooks/useBranding.ts` - Hook con colores predeterminados
- ✅ `/src/app/components/pages/PanelMarca.tsx` - Panel con colores predeterminados
- ✅ `/src/app/components/pages/Departamentos.tsx` - Todos los botones actualizados
- ✅ `/src/styles/theme.css` - Variables CSS con colores correctos

### **Consistencia:**
- ✅ Los colores son consistentes en todos los archivos principales
- ✅ El sistema aplica automáticamente los colores al cargar
- ✅ El botón "Restablecer" vuelve a estos colores
- ✅ Las variables CSS están sincronizadas

---

## 📝 Notas Técnicas

### **localStorage**
La configuración personalizada se guarda en:
- Clave: `brandingConfig`
- Formato: JSON stringificado del objeto `BrandingConfig`
- Si no existe o hay error, se usan los colores predeterminados

### **Variables CSS Dinámicas**
Los colores se aplican mediante:
```javascript
document.documentElement.style.setProperty('--color-primary', '#1a4d7a');
document.documentElement.style.setProperty('--color-secondary', '#2d9561');
document.documentElement.style.setProperty('--color-success', '#2d9561');
document.documentElement.style.setProperty('--color-danger', '#c23934');
document.documentElement.style.setProperty('--color-warning', '#e8a419');
```

### **Logo Predeterminado**
El sistema incluye un logo por defecto "DM - Gestion de banques alimentaires" que se importa desde:
```typescript
import defaultLogo from 'figma:asset/f75f2eb0051f1da7875e489677de5a56d8a7edc7.png';
```

---

## 🎨 Coordinación con Marca DM

Estos colores fueron seleccionados específicamente para:
- ✅ Coordinar con el logo DM del sistema
- ✅ Proporcionar una apariencia profesional y elegante
- ✅ Mantener buena accesibilidad y contraste
- ✅ Crear una identidad visual consistente
- ✅ Diferenciarse de la paleta anterior (#1E73BE, #4CAF50, #DC3545)

---

**Fecha de Actualización:** 15 de febrero de 2026  
**Versión del Sistema:** v2.1  
**Estado:** Colores Predeterminados Confirmados ✅
