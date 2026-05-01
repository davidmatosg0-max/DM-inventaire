# 🖨️ Configuración de Impresión Automática

## 📋 Descripción

El sistema de impresión automática está implementado con dos modos:

1. **Modo Silencioso (Iframe)**: Imprime directamente sin abrir ventanas emergentes
2. **Modo Normal (Ventana)**: Abre ventana con vista previa

Cuando la opción "Impresión Automática" está activada, el sistema usa el **Modo Silencioso** que minimiza la interacción del usuario.

---

## ⚙️ Configuración del Navegador

Para lograr impresión **completamente automática** sin ningún diálogo, necesitas configurar tu navegador:

### **Google Chrome / Microsoft Edge**

#### **Opción 1: Configuración de Impresora Predeterminada**

1. Ve a `chrome://settings/printing` (o `edge://settings/printing`)
2. En "Imprimir", selecciona tu impresora predeterminada
3. Activa "Usar configuración del sistema"

#### **Opción 2: Deshabilitar Vista Previa de Impresión**

1. Ve a `chrome://flags`
2. Busca "Print Preview"
3. Desactívalo
4. Reinicia el navegador

#### **Opción 3: Política de Empresa (Más Efectivo)**

Para entornos corporativos, puedes configurar políticas:

```json
{
  "PrintingEnabled": true,
  "PrintPreviewUseSystemDefaultPrinter": true,
  "PrinterTypeDenyList": [],
  "DefaultPrinterSelection": "{\"kind\":\"local\",\"namePattern\":\".*\"}"
}
```

### **Mozilla Firefox**

1. Ve a `about:config`
2. Busca `print.always_print_silent`
3. Cámbialo a `true`
4. Busca `print.printer_[tu_impresora].print_silent`
5. Cámbialo a `true`

---

## 🔧 Configuración para Entorno de Producción

### **Kiosco / Terminal de Registro**

Si este sistema se usa en un kiosco o terminal dedicado:

#### **Chrome en Modo Kiosco con Impresión Silenciosa**

Ejecuta Chrome con estos parámetros:

```bash
chrome.exe --kiosk "http://tu-sistema.com" --kiosk-printing --disable-print-preview
```

Parámetros importantes:
- `--kiosk-printing`: Habilita impresión automática en modo kiosco
- `--disable-print-preview`: Desactiva la vista previa
- `--auto-select-desktop-capture-source`: Permite captura automática

#### **Script de Inicio (Windows)**

Crea un archivo `iniciar-sistema-impresion.bat`:

```batch
@echo off
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --kiosk "http://localhost:3000" ^
  --kiosk-printing ^
  --disable-print-preview ^
  --disable-popup-blocking ^
  --auto-accept-this-tab-capture
```

#### **Script de Inicio (Linux)**

Crea un archivo `iniciar-sistema-impresion.sh`:

```bash
#!/bin/bash
google-chrome \
  --kiosk "http://localhost:3000" \
  --kiosk-printing \
  --disable-print-preview \
  --disable-popup-blocking \
  --auto-accept-this-tab-capture
```

---

## 🖨️ Configuración de Impresora

### **Windows**

1. **Panel de Control** → **Dispositivos e Impresoras**
2. Click derecho en tu impresora → **Preferencias de impresión**
3. Configura:
   - **Orientación**: Vertical
   - **Tamaño de papel**: Letter (8.5" x 11")
   - **Calidad**: Alta
   - **Color**: Activado (para imprimir colores de la etiqueta)

### **Impresora de Etiquetas (Zebra, Brother, etc.)**

Si usas impresora térmica de etiquetas:

1. Configura el tamaño de papel personalizado: **8.5" x 11"**
2. Ajusta márgenes: **0.4" (arriba/abajo)** y **0.5" (izq/der)**
3. Activa "Imprimir en Color" si está disponible

---

## 📱 Funcionamiento del Sistema

### **Con Impresión Automática ACTIVADA:**

```
Usuario marca checkbox "Imprimir Automáticamente"
    ↓
Registra producto (ej: 1 caja de arroz)
    ↓
Sistema crea iframe invisible
    ↓
Genera HTML de la etiqueta
    ↓
Llama a window.print() automáticamente
    ↓
Impresora imprime (o muestra diálogo según configuración del navegador)
    ↓
Cierra ventana/iframe automáticamente
    ↓
Cierra formulario después de 1 segundo
```

### **Con Paletas Múltiples (ej: 5 paletas):**

```
Usuario marca "Imprimir Automáticamente"
    ↓
Registra 5 paletas
    ↓
Sistema crea 5 registros individuales
    ↓
Paleta 1: Imprime → Cierra
    ↓ (500ms)
Paleta 2: Imprime → Cierra
    ↓ (500ms)
Paleta 3: Imprime → Cierra
    ↓ (500ms)
Paleta 4: Imprime → Cierra
    ↓ (500ms)
Paleta 5: Imprime → Cierra
    ↓
Cierra formulario después de ~3.5 segundos
```

---

## 🎯 Ventajas del Sistema Actual

1. ✅ **Impresión automática activada**: Usa iframe invisible
2. ✅ **No abre ventanas emergentes visibles**
3. ✅ **Cierre automático del formulario**
4. ✅ **Gestión individual de paletas**
5. ✅ **Delay inteligente entre impresiones**
6. ✅ **Feedback visual claro**

---

## ⚠️ Limitaciones del Navegador

Por razones de **seguridad**, los navegadores modernos tienen restricciones:

1. **No pueden imprimir sin interacción del usuario** (primera vez)
2. **Requieren al menos un click** antes de permitir impresión automática
3. **Bloquean impresión silenciosa** por defecto

### **Soluciones:**

- ✅ **Modo Kiosco**: Permite impresión completamente silenciosa
- ✅ **Configuración del navegador**: Reduce diálogos al mínimo
- ✅ **Iframe invisible**: Minimiza ventanas emergentes
- ✅ **Permisos del sitio**: Permitir pop-ups y impresión

---

## 🔍 Troubleshooting

### **Problema: Aún aparece el diálogo de impresión**

**Solución:**
1. Verifica que tu impresora esté configurada como predeterminada
2. Configura Chrome/Edge según la sección "Configuración del Navegador"
3. Si es posible, usa Modo Kiosco

### **Problema: No imprime ninguna etiqueta**

**Solución:**
1. Verifica que el navegador permita pop-ups del sitio
2. Revisa la consola del navegador (F12) para errores
3. Asegúrate de que la impresora esté conectada y encendida

### **Problema: Las etiquetas se imprimen muy lento**

**Solución:**
1. Aumenta el delay entre impresiones en el código (línea 850 de EntradaDonAchat.tsx)
2. Verifica la velocidad de tu impresora
3. Reduce la cantidad de paletas simultáneas

---

## 📊 Comparación de Modos

| Característica | Modo Silencioso (Iframe) | Modo Normal (Ventana) |
|----------------|--------------------------|------------------------|
| Ventanas emergentes | ❌ No | ✅ Sí |
| Vista previa | ❌ No | ✅ Sí |
| Diálogo de impresión | ⚠️ Según navegador | ✅ Sí |
| Cierre automático | ✅ Sí | ✅ Sí |
| Compatible con kiosco | ✅ Sí | ⚠️ Parcial |

---

## 💡 Recomendaciones

### **Para Terminal de Registro (Producción):**
- ✅ Usa Chrome en Modo Kiosco
- ✅ Configura impresora predeterminada
- ✅ Activa "Impresión Automática" permanentemente
- ✅ Usa computadora dedicada para registro de entradas

### **Para Uso Normal (Oficina):**
- ✅ Mantén "Impresión Automática" desactivada por defecto
- ✅ Actívala solo cuando registres múltiples productos
- ✅ Permite que el navegador muestre el diálogo de impresión para verificar

---

## 🎉 Conclusión

El sistema está optimizado para **impresión automática máxima** dentro de las restricciones de seguridad del navegador. Para lograr impresión **completamente silenciosa** sin ningún diálogo, se recomienda usar **Chrome en Modo Kiosco** en una terminal dedicada.

### **Flujo Ideal:**

```
Terminal de Registro con Chrome Kiosco
    ↓
Usuario activa "Impresión Automática"
    ↓
Registra productos/paletas
    ↓
Sistema imprime automáticamente sin diálogos
    ↓
Formulario se cierra solo
    ↓
Listo para siguiente entrada
```

**¡El sistema está listo para uso en producción!** 🚀
