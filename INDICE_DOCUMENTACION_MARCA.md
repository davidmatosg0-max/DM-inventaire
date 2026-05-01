# 📚 ÍNDICE MAESTRO DE DOCUMENTACIÓN - CONFIGURACIÓN DE MARCA
## Banque Alimentaire - DMi Gestion

---

## 📖 **GUÍA DE REFERENCIA RÁPIDA**

Este índice contiene toda la documentación relacionada con la configuración de marca permanente del sistema.

**Última actualización**: 15 de Febrero, 2026  
**Versión del sistema**: 2.3  
**Estado**: ✅ COMPLETADO Y OPERATIVO

---

## 🎯 **DOCUMENTACIÓN PRINCIPAL**

### **1. Configuración de Marca Completa** ⭐ PRINCIPAL

**Archivo**: `/CONFIGURACION_MARCA_PERMANENTE.md`

**Contenido**:
- ✅ Configuración completa de marca memorizada
- ✅ Todos los elementos que se guardan permanentemente
- ✅ Colores, logo y nombre del sistema
- ✅ Comportamiento detallado del sistema
- ✅ Estructura técnica completa
- ✅ Verificación y pruebas
- ✅ Tabla de comportamiento completa

**Cuándo consultar**: Para información completa sobre toda la configuración de marca

---

### **2. Persistencia de Colores**

**Archivo**: `/CONFIGURACION_PERSISTENCIA_COLORES.md`

**Contenido**:
- ✅ Implementación de persistencia en localStorage
- ✅ Flujo de funcionamiento detallado
- ✅ Verificación y comandos de consola
- ✅ Checklist de implementación
- ✅ Manejo de errores

**Cuándo consultar**: Para entender cómo funciona la persistencia de colores

---

### **3. Paleta de Colores Oficial**

**Archivo**: `/PALETA_COLORES.md`

**Contenido**:
- ✅ Colores oficiales del sistema
- ✅ Logo predeterminado detallado
- ✅ Especificaciones del logo circular
- ✅ Tamaños estandarizados
- ✅ Aplicación de colores por módulo
- ✅ Guía de uso técnico
- ✅ Historial de versiones
- ✅ Sección de persistencia

**Cuándo consultar**: Para conocer la paleta oficial y guía de uso

---

### **4. Logo del Sistema**

**Archivo**: `/LOGO_SISTEMA.md`

**Contenido**:
- ✅ Descripción completa del logo DMi 3D
- ✅ Composición visual detallada
- ✅ Integración con paleta de colores
- ✅ Especificaciones técnicas
- ✅ Implementación en React/TypeScript
- ✅ Usos correctos e incorrectos
- ✅ Adaptación multilingüe
- ✅ Responsive design
- ✅ Checklist de implementación
- ✅ Historial de versiones del logo

**Cuándo consultar**: Para información específica sobre el logo DMi

---

### **5. Resumen de Colores Permanentes**

**Archivo**: `/RESUMEN_COLORES_PERMANENTES.md`

**Contenido**:
- ✅ Confirmación de implementación
- ✅ Resumen ejecutivo
- ✅ Cómo funciona (paso a paso)
- ✅ Verificación en el navegador
- ✅ Comportamiento garantizado
- ✅ Notas finales

**Cuándo consultar**: Para un resumen rápido de la implementación de colores

---

### **6. Memoria del Logo Actualizado**

**Archivo**: `/MEMORIA_LOGO_ACTUALIZADO.md`

**Contenido**:
- ✅ Confirmación de actualización del logo
- ✅ Asset ID del logo
- ✅ Archivos actualizados
- ✅ Características del logo
- ✅ Implementación actual
- ✅ Información memorizada
- ✅ Checklist de verificación

**Cuándo consultar**: Para confirmar qué logo está activo y dónde

---

## 🎨 **INFORMACIÓN MEMORIZADA - RESUMEN RÁPIDO**

### **Colores Predeterminados**

```yaml
Color Primario: '#1a4d7a'     # Azul marino profesional
Color Secundario: '#2d9561'   # Verde elegante
Color de Éxito: '#2d9561'     # Verde éxito
Color de Peligro: '#c23934'   # Rojo elegante
Color de Alerta: '#e8a419'    # Naranja/amarillo profesional
```

### **Logo Predeterminado**

```yaml
Nombre: "DMi - Gestion de banques alimentaires"
Estilo: 3D con profundidad y sombras
Letra D: Turquesa/cyan (#4db8b8)
Letra M: Azul marino/gris oscuro (#5a6b7c)
Icono: Lupa de búsqueda integrada en la "i"
Formato: PNG con transparencia
Asset: figma:asset/88882bc723a7419ad993393bc21033b23ba79364.png
```

### **Nombre del Sistema**

```yaml
Nombre: 'Banque Alimentaire'
Modificable: Sí (desde panel de personalización)
Permanente: Sí (se guarda en localStorage)
```

### **Persistencia**

```yaml
Clave_localStorage: 'brandingConfig_permanent'
Permanente: true
Se_borra_al_cerrar_sesion: false
Guardado_automatico: true (en primera carga)
Modificable_por_usuario: true (desde Aide et Support > Personnalisation)
```

---

## 📂 **ARCHIVOS DE CÓDIGO FUENTE**

### **Hook de Branding**

**Archivo**: `/src/hooks/useBranding.ts`

**Funciones principales**:
- `useBranding()` - Hook principal que gestiona la configuración
- `loadConfig()` - Carga configuración desde localStorage
- `applyBranding()` - Aplica colores a variables CSS
- `handleBrandingUpdate()` - Maneja actualizaciones en tiempo real

**Variables exportadas**:
- `config.primaryColor` - Color primario
- `config.secondaryColor` - Color secundario
- `config.successColor` - Color de éxito
- `config.dangerColor` - Color de peligro
- `config.warningColor` - Color de alerta
- `config.logo` - Logo del sistema
- `config.systemName` - Nombre del sistema

---

### **Panel de Personalización**

**Archivo**: `/src/app/components/pages/PanelMarca.tsx`

**Funciones principales**:
- `handleSave()` - Guarda configuración en localStorage
- `handleReset()` - Restablece a valores predeterminados
- `handleColorChange()` - Actualiza colores en tiempo real
- `handleLogoUpload()` - Sube y convierte logo a Base64

**Características**:
- Preview en tiempo real de cambios
- Validación de tamaño de archivo (máx 2MB)
- Conversión de logo a Base64
- Notificaciones toast de confirmación

---

### **Componentes que Usan la Configuración**

| Componente | Archivo | Uso del Branding |
|------------|---------|------------------|
| **Layout** | `/src/app/components/Layout.tsx` | Logo en header + colores |
| **Login** | `/src/app/components/pages/Login.tsx` | Logo grande + colores |
| **AccesoOrganismo** | `/src/app/components/pages/AccesoOrganismo.tsx` | Logo + colores |
| **Departamentos** | `/src/app/components/pages/Departamentos.tsx` | Logo + colores |
| **IDDigital** | `/src/app/components/pages/IDDigital.tsx` | Logo en sidebar |
| **Dashboard** | `/src/app/components/pages/Dashboard.tsx` | Colores en cards |
| **Inventario** | `/src/app/components/pages/Inventario.tsx` | Colores en estados |
| **Comandas** | `/src/app/components/pages/Comandas.tsx` | Colores en badges |
| **Todos** | - | Variables CSS globales |

---

## 🔍 **VERIFICACIÓN RÁPIDA**

### **Comandos de Consola del Navegador**

```javascript
// Ver configuración completa
console.log(JSON.parse(localStorage.getItem('brandingConfig_permanent')));

// Ver solo colores
const config = JSON.parse(localStorage.getItem('brandingConfig_permanent'));
console.log({
  primario: config.primaryColor,
  secundario: config.secondaryColor,
  exito: config.successColor,
  peligro: config.dangerColor,
  alerta: config.warningColor
});

// Ver logo y nombre
console.log({
  logo: config.logo ? (config.logo.startsWith('data:') ? 'Personalizado' : 'Predeterminado') : 'Predeterminado',
  nombre: config.systemName
});

// Verificar existencia
console.log('Existe:', localStorage.getItem('brandingConfig_permanent') !== null);
```

### **Verificación Visual**

1. **Abrir DevTools** (F12)
2. **Application > Local Storage**
3. **Buscar**: `brandingConfig_permanent`
4. **Verificar**: Debe existir un objeto JSON completo

---

## 🎯 **PREGUNTAS FRECUENTES**

### **¿Los colores cambian al cerrar sesión?**
❌ **NO**. Los colores permanecen guardados en localStorage y se cargan automáticamente.

### **¿El logo personalizado se mantiene?**
✅ **SÍ**. El logo se convierte a Base64 y se guarda permanentemente en localStorage.

### **¿Puedo restablecer a valores predeterminados?**
✅ **SÍ**. Desde "Aide et Support > Personnalisation", botón "Réinitialiser".

### **¿Qué pasa si cambio de navegador?**
Los colores y logo volverán a valores predeterminados en el nuevo navegador (localStorage es específico por navegador).

### **¿Qué pasa si borro los datos del navegador?**
Se perderá la configuración personalizada y volverán los valores predeterminados.

### **¿Puedo subir cualquier logo?**
Sí, pero con límites: máximo 2MB, formatos PNG, JPG, JPEG, GIF o SVG.

### **¿Los cambios se aplican inmediatamente?**
✅ **SÍ**. Al guardar, los cambios se aplican en toda la aplicación al instante.

---

## 📊 **HISTORIAL DE VERSIONES**

| Versión | Fecha | Cambios |
|---------|-------|---------|
| **v2.3** | Feb 2026 | Implementación de persistencia permanente completa |
| **v2.2** | Feb 2026 | Actualización del logo a DMi 3D |
| **v2.1** | Feb 2026 | Logo circular con relleno completo |
| **v2.0** | Feb 2026 | Paleta oficial establecida |
| **v1.0** | Inicial | Sistema básico |

---

## 🔗 **ACCESOS RÁPIDOS**

### **Documentación**

- [`/CONFIGURACION_MARCA_PERMANENTE.md`](CONFIGURACION_MARCA_PERMANENTE.md) - Configuración completa ⭐
- [`/CONFIGURACION_PERSISTENCIA_COLORES.md`](CONFIGURACION_PERSISTENCIA_COLORES.md) - Persistencia de colores
- [`/PALETA_COLORES.md`](PALETA_COLORES.md) - Paleta oficial
- [`/LOGO_SISTEMA.md`](LOGO_SISTEMA.md) - Logo DMi
- [`/RESUMEN_COLORES_PERMANENTES.md`](RESUMEN_COLORES_PERMANENTES.md) - Resumen de colores
- [`/MEMORIA_LOGO_ACTUALIZADO.md`](MEMORIA_LOGO_ACTUALIZADO.md) - Memoria del logo
- [`/INDICE_DOCUMENTACION_MARCA.md`](INDICE_DOCUMENTACION_MARCA.md) - Este archivo

### **Código Fuente**

- [`/src/hooks/useBranding.ts`](src/hooks/useBranding.ts) - Hook de branding
- [`/src/app/components/pages/PanelMarca.tsx`](src/app/components/pages/PanelMarca.tsx) - Panel de personalización
- [`/src/styles/logo.css`](src/styles/logo.css) - Estilos del logo

---

## ✅ **RESUMEN EJECUTIVO**

### **Todo está memorizado y guardado permanentemente:**

✅ **Colores del sistema** (#1a4d7a, #2d9561, #c23934, #e8a419)  
✅ **Logo DMi 3D** (turquesa + azul marino + lupa)  
✅ **Nombre del sistema** (Banque Alimentaire)  
✅ **Persistencia permanente** (localStorage: brandingConfig_permanent)  
✅ **Guardado automático** en primera carga  
✅ **No cambia al cerrar sesión**  
✅ **Modificable solo por el usuario**  
✅ **Restablecimiento disponible**  
✅ **Documentación completa creada**  
✅ **Sistema operativo al 100%**  

---

**Desarrollador**: David (Lettycia26)  
**Sistema**: Banque Alimentaire - DMi Gestion  
**Fecha**: 15 de Febrero, 2026  
**Versión**: 2.3  
**Estado**: ✅ COMPLETADO, MEMORIZADO Y DOCUMENTADO

---

## 🎨 **DIAGRAMA DE FLUJO**

```
┌─────────────────────────────────────────────────────────────┐
│                   CONFIGURACIÓN DE MARCA                    │
│                      MEMORIZADA Y PERMANENTE                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1️⃣ PRIMERA CARGA DEL SISTEMA                              │
│     └─> Guardado automático en localStorage                │
│         Clave: brandingConfig_permanent                     │
│                                                             │
│  2️⃣ CARGAS SUBSECUENTES                                     │
│     └─> Carga automática desde localStorage                │
│         Aplicación inmediata de configuración              │
│                                                             │
│  3️⃣ MODIFICACIÓN POR USUARIO                                │
│     └─> Panel: Aide et Support > Personnalisation          │
│         Guardado permanente al hacer clic en "Guardar"     │
│                                                             │
│  4️⃣ CIERRE DE SESIÓN                                        │
│     └─> localStorage NO se borra                            │
│         Configuración permanece intacta                    │
│                                                             │
│  5️⃣ RESTABLECIMIENTO                                        │
│     └─> Botón "Réinitialiser"                              │
│         Vuelve a valores predeterminados                   │
│         Se guardan nuevamente en localStorage              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**FIN DEL ÍNDICE MAESTRO**
