# 📄 Sistema Estandarizado de Etiquetas - Banque Alimentaire

## 🎯 Resumen

Se ha implementado un sistema estandarizado de etiquetas de productos que garantiza consistencia visual y funcional en todos los módulos del sistema.

---

## 🏷️ Tipos de Etiquetas

### **1. Etiqueta de Producto Estandarizada** ⭐
**Archivo:** `/src/app/components/etiquetas/StandardProductLabel.ts`

**Uso:** Para todos los productos individuales del inventario

**Características:**
- ✅ Diseño oficial basado en especificaciones visuales
- ✅ QR Code azul (#1E73BE) de 160x160px
- ✅ Sección celeste para categoría/subcategoría
- ✅ Campos de información con bordes azules
- ✅ Barra verde (#4CAF50) para peso total
- ✅ Barra azul con programa/donador
- ✅ Footer con sistema de gestión
- ✅ Responsive para impresión Letter size
- ✅ Soporte multiidioma (FR, ES, EN, AR)

**Dimensiones:**
- Ancho máximo: 7.5 pulgadas
- Borde: 3px sólido #1E73BE
- Padding: 14-20px según sección
- QR: 160x160px con borde de 3px

**Colores oficiales:**
```typescript
Azul Principal: #1E73BE
Verde Peso:     #4CAF50
Gris Fondo:     #F4F4F4 / #333333
Rojo Error:     #DC3545
Naranja Alerta: #FFC107
Celeste Fondo:  #E3F2FD a #BBDEFB (gradiente)
```

**Tipografías:**
```typescript
Títulos:    Montserrat Bold (700) - 32px
Subtítulos: Montserrat Medium (600) - 15px
Etiquetas:  Montserrat SemiBold (600) - 11px
Cuerpo:     Roboto Regular (400/500) - 16-18px
```

---

### **2. Etiqueta de Comanda**
**Archivo:** `/src/app/components/comandas/EtiquetaComanda.tsx`

**Uso:** Para órdenes/comandas completas con múltiples productos

**Características:**
- QR Code con datos de la comanda
- Código de barras con número de comanda
- Información del organismo destinatario
- Estado de la comanda
- Firmas de entrega/recepción

---

## 🔧 Cómo Usar la Etiqueta Estandarizada

### **Importación:**
```typescript
import { printStandardLabel, type ProductLabelData } from './etiquetas/StandardProductLabel';
```

### **Preparar Datos:**
```typescript
const labelData: ProductLabelData = {
  // Identificación
  id: 'ENT-123456789',
  
  // Producto
  nombreProducto: 'Oranges',
  productoIcono: '🍊',
  categoria: 'Fruits et Légumes',
  subcategoria: 'Oranges',
  
  // Cantidades
  cantidad: 300,
  unidad: 'CJA',
  pesoTotal: 6000.00,
  pesoUnidad: 20.00,
  
  // Almacenamiento
  temperatura: 'refrigerado', // 'ambiente' | 'refrigerado' | 'congelado'
  lote: '222222',
  fechaCaducidad: '2026-02-19',
  
  // Procedencia
  programa: 'Walmart Supercentre',
  programaIcono: '🏢',
  programaColor: '#1E73BE',
  donadorNombre: 'Walmart Supercentre',
  
  // Fecha
  fechaEntrada: new Date().toISOString(),
  
  // Traducciones (opcional - usa francés por defecto)
  translations: {
    foodBank: 'BANQUE ALIMENTAIRE',
    productLabel: 'Étiquette du Produit',
    quantity: 'QUANTITÉ',
    temperature: 'TEMPÉRATURE',
    lot: 'LOT',
    expiryDate: "DATE D'EXPIRATION",
    weight: 'POIDS',
    program: 'PROGRAMME',
    entryDate: "DATE D'ENTRÉE",
    systemFooter: 'Système de Gestion des Stocks',
    ambient: 'Ambiant',
    refrigerated: 'Réfrigéré',
    frozen: 'Congelé',
  }
};
```

### **Imprimir:**
```typescript
try {
  await printStandardLabel(labelData);
} catch (err) {
  console.error('Error al imprimir etiqueta:', err);
  toast.error('Error al imprimir la etiqueta');
}
```

---

## 📍 Módulos Actualizados

### ✅ **1. Entrada Don/Achat** (`EntradaDonAchat.tsx`)
- Usa etiqueta estandarizada en `handlePrint()`
- Incluye todas las traducciones
- Integrado con i18n

### ✅ **2. Verificaciones Recientes** (`VerificacionesRecientes.tsx`)
- Usa etiqueta estandarizada en `handleReimprimirEtiqueta()`
- Soporte para reimpresión de productos existentes

### ⚠️ **3. Módulo de Etiquetas** (`pages/Etiquetas.tsx`)
**Pendiente de actualizar** - Actualmente usa su propio sistema

### ✅ **4. Comandas** (`comandas/EtiquetaComanda.tsx`)
**No requiere cambios** - Es un tipo diferente de etiqueta (para comandas, no productos)

---

## 🎨 Estructura Visual Estandarizada

```
┌─────────────────────────────────────────────────────┐
│  🏦 BANQUE ALIMENTAIRE                              │
│  Étiquette du Produit                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│            ┌──────────────┐                        │
│            │              │                        │
│            │   QR CODE    │ (160x160px)            │
│            │   #1E73BE    │                        │
│            │              │                        │
│            └──────────────┘                        │
│            ID: ENT-1234567890                      │
│                                                     │
├─────────────────────────────────────────────────────┤
│  ╔═══════════════════════════════════════════════╗ │
│  ║  🍊                                           ║ │
│  ║  Fruits et Légumes - Oranges                 ║ │
│  ║  🍊 Oranges                                   ║ │
│  ╚═══════════════════════════════════════════════╝ │
├─────────────────────────────────────────────────────┤
│  ┌─ QUANTITÉ ──────────────────────────────────┐ │
│  │  300 CJA                                     │ │
│  └──────────────────────────────────────────────┘ │
│                                                     │
│  ┌─ TEMPÉRATURE ────────────────────────────────┐ │
│  │  ❄️ Réfrigéré                               │ │
│  └──────────────────────────────────────────────┘ │
│                                                     │
│  ┌─ LOT ───────────────────────────────────────┐ │
│  │  222222                                      │ │
│  └──────────────────────────────────────────────┘ │
│                                                     │
│  ┌─ DATE D'EXPIRATION ─────────────────────────┐ │
│  │  19/02/2026                                  │ │
│  └──────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│  ╔═══════════════════════════════════════════════╗ │
│  ║  POIDS: 6000.00 kg                          ║ │ (Verde #4CAF50)
│  ╚═══════════════════════════════════════════════╝ │
├─────────────────────────────────────────────────────┤
│  ╔═══════════════════════════════════════════════╗ │
│  ║  🏢 PROGRAMME                                ║ │ (Azul #1E73BE)
│  ║  Walmart Supercentre                         ║ │ (Bordes #FFC107)
│  ╚═══════════════════════════════════════════════╝ │
├─────────────────────────────────────────────────────┤
│  DATE D'ENTRÉE                                      │
│  14/02/2026, 15:59                                  │
├─────────────────────────────────────────────────────┤
│  Système de Gestion des Stocks                      │
└─────────────────────────────────────────────────────┘
```

---

## 🔍 Detalles de Implementación

### **QR Code**
```typescript
await QRCode.toDataURL(qrData, {
  width: 180,        // Tamaño en generación
  margin: 2,         // Margen interno
  errorCorrectionLevel: 'H',  // Alta corrección de errores
  color: {
    dark: '#1E73BE',   // Color azul oficial
    light: '#FFFFFF'   // Fondo blanco
  }
});
```

### **Temperatura Badge**
```typescript
const tempConfig = {
  ambiente: { 
    icon: '🌡️', 
    text: 'Ambiant', 
    color: '#FFC107' 
  },
  refrigerado: { 
    icon: '❄️', 
    text: 'Réfrigéré', 
    color: '#1E73BE' 
  },
  congelado: { 
    icon: '🧊', 
    text: 'Congelé', 
    color: '#0288D1' 
  }
};
```

### **Formato de Fechas**
```typescript
// Fecha simple
toLocaleDateString('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

// Fecha con hora
toLocaleDateString('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});
```

---

## 📱 Responsive e Impresión

### **Configuración de Página:**
```css
@page {
  size: letter;      /* 8.5" x 11" */
  margin: 0.5in;     /* Márgenes uniformes */
}
```

### **Breakpoints:**
- **Desktop:** Contenedor de 7.5 pulgadas centrado
- **Print:** 100% del ancho disponible
- **Mobile:** Responsive con max-width

### **Botones de Impresión:**
```css
.print-buttons {
  display: none !important;  /* En impresión */
}
```

---

## 🌐 Soporte Multiidioma

El componente acepta traducciones personalizadas a través del objeto `translations`. Si no se proveen, usa francés por defecto.

### **Ejemplo con i18n:**
```typescript
const labelData: ProductLabelData = {
  // ... otros datos
  translations: {
    foodBank: t('common.foodBank'),
    productLabel: t('common.productLabel'),
    quantity: t('common.amount'),
    temperature: t('common.temperature'),
    lot: t('common.lot'),
    expiryDate: t('common.expiryDate'),
    weight: t('common.weight'),
    program: t('common.program'),
    entryDate: t('common.entryDate'),
    systemFooter: t('common.inventoryManagementSystem'),
    ambient: t('common.ambient'),
    refrigerated: t('common.refrigerated'),
    frozen: t('common.frozen'),
  }
};
```

---

## ✅ Checklist de Integración

Para agregar la etiqueta estandarizada a un nuevo módulo:

- [ ] Importar `printStandardLabel` y `ProductLabelData`
- [ ] Preparar objeto `labelData` con todos los campos requeridos
- [ ] Agregar traducciones desde i18n
- [ ] Llamar a `printStandardLabel(labelData)` en un try-catch
- [ ] Manejar errores con toast o mensaje apropiado
- [ ] Verificar que el QR Code se genera correctamente
- [ ] Probar impresión en diferentes navegadores
- [ ] Verificar que los colores se imprimen correctamente

---

## 🐛 Troubleshooting

### **El QR Code no se imprime:**
- Asegúrate de usar `await` al llamar `printStandardLabel()`
- El QR se genera de forma asíncrona
- Si persiste, verifica permisos de ventanas emergentes

### **Los colores no se imprimen:**
- El componente ya incluye `print-color-adjust: exact`
- Verifica configuración de impresora (imprimir en color)

### **La ventana de impresión no se abre:**
- Verifica que no haya bloqueadores de pop-ups
- Captura el error en el catch y muestra mensaje al usuario

### **Textos cortados al imprimir:**
- Verifica los márgenes en `@page`
- Ajusta `max-width` si es necesario

---

## 📊 Estadísticas de Uso

| Módulo | Estado | Última Actualización |
|--------|--------|---------------------|
| EntradaDonAchat | ✅ Implementado | 14/02/2026 |
| VerificacionesRecientes | ✅ Implementado | 14/02/2026 |
| Etiquetas | ⚠️ Pendiente | - |
| EtiquetaComanda | ✅ No requiere (diferente) | - |

---

## 🎯 Próximos Pasos

1. **Actualizar módulo de Etiquetas** (`pages/Etiquetas.tsx`)
2. Agregar opción de imprimir etiquetas en lote
3. Implementar plantillas de etiquetas personalizables
4. Agregar preview antes de imprimir
5. Exportar etiquetas como PDF

---

**Fecha de Creación:** 14 de Febrero, 2026  
**Autor:** Sistema de Gestión Banque Alimentaire  
**Versión:** 1.0.0

---

## 📞 Soporte

Para dudas o problemas con el sistema de etiquetas:
- Revisar esta documentación primero
- Verificar la implementación en `EntradaDonAchat.tsx` como referencia
- Consultar el archivo fuente en `/src/app/components/etiquetas/StandardProductLabel.ts`
