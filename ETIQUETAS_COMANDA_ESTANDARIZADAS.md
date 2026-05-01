# ✅ Etiquetas de Comanda Estandarizadas

## 📋 Cambios Implementados

He creado un **nuevo sistema de etiquetas para comandas** con las **mismas dimensiones y configuración** que las etiquetas de producto (StandardProductLabel).

---

## 🎯 Archivos Creados/Modificados

### **1. Nuevo Componente**
**Archivo:** `/src/app/components/comandas/EtiquetaComandaEstandarizada.tsx`

Este componente replica la estructura y dimensiones del `StandardProductLabel` pero adaptado para comandas.

### **2. Módulo de Comandas Actualizado**
**Archivo:** `/src/app/components/pages/Comandas.tsx`

- ✅ Importa `printStandardOrderLabel` y `EtiquetaComandaData`
- ✅ Nueva función: `handleImprimirEtiquetaEstandarizada()`
- ✅ Botón adicional en el dialog de etiquetas con el nuevo formato

---

## 📏 Dimensiones y Configuración

### **Idénticas a StandardProductLabel:**

| Característica | Valor |
|---------------|-------|
| **Tamaño de página** | Letter (8.5" x 11") |
| **Márgenes** | 0.4in (arriba/abajo), 0.5in (izq/der) |
| **QR Code** | 120x120px |
| **Borde principal** | 3px solid #1E73BE |
| **Ancho contenedor** | 7.5in máximo |
| **Border radius** | 10px |

### **Colores Oficiales:**
- Azul: #1E73BE
- Verde: #4CAF50
- Amarillo: #FFC107
- Rojo: #DC3545
- Gris: #F4F4F4 / #333333

### **Tipografías:**
- **Montserrat Bold/Medium** → Títulos y etiquetas
- **Roboto Regular** → Cuerpo de texto y valores

---

## 🎨 Diseño de la Etiqueta de Comanda

### **Estructura Visual:**

```
┌─────────────────────────────────────────┐
│ 🏦 BANQUE ALIMENTAIRE                   │ 12px padding
│ Étiquette de Commande                   │
├─────────────────────────────────────────┤
│  ┌───────────┐  ┌──────────────┐       │
│  │ QR Code   │  │    📦          │       │ 12px padding
│  │ 120x120px │  │     5          │       │
│  │ SOL-123   │  │  articles      │       │
│  └───────────┘  └──────────────┘       │
├─────────────────────────────────────────┤
│  ┌────────────┐  ┌─────────────┐       │
│  │N° Commande │  │   Statut     │       │
│  │  SOL-123   │  │   PRÊTE      │       │
│  └────────────┘  └─────────────┘       │
├═════════════════════════════════════════┤
│ 📅 Livraison                            │ Borde amarillo
│ 14/02/2026 - 10:00                     │
├─────────────────────────────────────────┤
│ 👤 ORGANISME DESTINATAIRE               │ Fondo celeste
│ ┌────────────┐  ┌─────────────┐       │
│ │Nom:        │  │Responsable:  │       │
│ │Carrefour   │  │Jean Dupont   │       │
│ └────────────┘  └─────────────┘       │
│ ┌────────────────────────────┐         │
│ │Adresse: 123 Rue Principal  │         │
│ └────────────────────────────┘         │
├─────────────────────────────────────────┤
│ 📋 Détail des Produits                  │
│ ┌─────────────────────────────────┐   │
│ │ 🍎 Pommes         50 CJA       │   │
│ │ 🥛 Lait           30 L         │   │
│ │ 🥫 Conserves      100 unités   │   │
│ └─────────────────────────────────┘   │
├═════════════════════════════════════════┤
│ Poids Total: 1500.00 kg                │ Barra verde
├─────────────────────────────────────────┤
│ Observations:                           │
│ Livraison urgente - À manipuler...    │
├─────────────────────────────────────────┤
│ Remis par:           Reçu par:         │
│ ________________    ________________   │
│ Nom et signature    Nom et signature  │
├─────────────────────────────────────────┤
│ Système de Gestion des Commandes       │
│ Imprimé le: 14/02/2026, 15:59         │
└─────────────────────────────────────────┘
```

---

## 🔧 Interfaz de Datos

### **EtiquetaComandaData**

```typescript
interface EtiquetaComandaData {
  // Comanda
  numeroComanda: string;
  fechaEntrega: string;
  estado: 'pendiente' | 'en_preparacion' | 'completada' | 'entregada' | 'anulada';
  observaciones?: string;
  
  // Productos
  items: Array<{
    nombre: string;
    icono?: string;
    cantidad: number;
    unidad: string;
    peso?: number;
  }>;
  
  // Organismo
  organismoNombre: string;
  organismoTipo?: string;
  organismoDireccion?: string;
  organismoResponsable?: string;
  organismoTelefono?: string;
  horaCita?: string;
  
  // Traducciones (opcional)
  translations?: { ... };
}
```

---

## 💻 Cómo Usar

### **Opción 1: Desde el Dialog (Automático)**

```typescript
// Ya está integrado en el módulo de Comandas
// Solo hacer clic en el botón verde "Imprimir Nouvelle Étiquette"
```

### **Opción 2: Programáticamente**

```typescript
import { printStandardOrderLabel, type EtiquetaComandaData } from './comandas/EtiquetaComandaEstandarizada';

const labelData: EtiquetaComandaData = {
  numeroComanda: 'CMD-001',
  fechaEntrega: '2026-02-20',
  estado: 'en_preparacion',
  observaciones: 'Livraison urgente',
  items: [
    {
      nombre: 'Pommes',
      icono: '🍎',
      cantidad: 50,
      unidad: 'CJA',
      peso: 25
    },
    {
      nombre: 'Lait',
      icono: '🥛',
      cantidad: 30,
      unidad: 'L',
      peso: 30
    }
  ],
  organismoNombre: 'Carrefour Solidaire',
  organismoTipo: 'Association',
  organismoDireccion: '123 Rue Principal, Montréal',
  organismoResponsable: 'Jean Dupont',
  organismoTelefono: '514-555-1234',
  horaCita: '10:00',
  translations: {
    // Opcional - Se usan valores por defecto en francés si no se proveen
  }
};

await printStandardOrderLabel(labelData);
```

---

## 📊 Comparación: Antes vs. Ahora

| Característica | Etiqueta Antigua | Etiqueta Estandarizada |
|---------------|------------------|------------------------|
| **Tamaño de página** | Letter | Letter ✅ |
| **Optimización** | No optimizada | Una sola hoja ✅ |
| **QR Code** | 150x150px | 120x120px ✅ |
| **Diseño** | Diferente a productos | **Idéntico a productos** ✅ |
| **Tipografías** | Mixtas | Montserrat + Roboto ✅ |
| **Colores** | Similares | **Exactamente iguales** ✅ |
| **Padding/Margins** | Variables | **Estandarizados** ✅ |
| **Lista de productos** | Básica | Mejorada con iconos ✅ |
| **Peso total** | No visible | **Destacado en verde** ✅ |
| **Firmas** | Básicas | Mejor diseñadas ✅ |
| **Footer** | Simple | Con timestamp ✅ |

---

## ✨ Características Principales

### **1. Grid Superior Compacto**
- QR Code a la izquierda (120x120px)
- Número de productos a la derecha (icono + número grande)

### **2. Información de Comanda**
- Número de comanda en barra azul
- Estado con badge de color según estado

### **3. Fecha de Entrega Destacada**
- Barra amarilla con borde superior e inferior (#FFC107)
- Fecha grande + hora de cita

### **4. Organismo Destinatario**
- Fondo celeste con degradado
- Grid de 2 columnas para información
- Campos con borde azul a la izquierda

### **5. Lista de Productos**
- Scroll automático si hay muchos productos
- Iconos emoji para cada producto
- Cantidad destacada en verde

### **6. Peso Total (si aplica)**
- Barra verde idéntica a StandardProductLabel
- Solo se muestra si hay productos con peso

### **7. Observaciones**
- Solo se muestra si existen
- Fondo blanco con borde gris

### **8. Firmas**
- Grid 2 columnas
- Líneas punteadas para firmar
- Espacios de 30px de altura

### **9. Footer**
- Sistema de gestión
- Timestamp de impresión

---

## 🎯 Estados de Comanda con Colores

| Estado | Color | Badge Text |
|--------|-------|------------|
| `pendiente` | #FFC107 (Amarillo) | EN ATTENTE |
| `en_preparacion` | #1E73BE (Azul) | EN PRÉPARATION |
| `completada` | #4CAF50 (Verde) | PRÊTE |
| `entregada` | #4CAF50 (Verde) | LIVRÉE |
| `anulada` | #DC3545 (Rojo) | ANNULÉE |

---

## 🔄 Flujo de Impresión en Comandas

### **Paso 1: Usuario hace clic en botón de impresión**
```
📋 Tabla de comandas → Botón "Printer" → Dialog se abre
```

### **Paso 2: Dialog muestra 2 opciones**
```
┌─────────────────────────────────────────────┐
│ ✨ Nouveau Format d'Étiquette              │
│ [Imprimir Nouvelle Étiquette] (Verde)      │ ← NUEVA
├─────────────────────────────────────────────┤
│                                             │
│  [Vista previa de etiqueta antigua]        │ ← Antigua
│  [Botón "Imprimer Étiquette"] (Azul)      │
│                                             │
└─────────────────────────────────────────────┘
```

### **Paso 3: Impresión**
- **Nueva:** Abre ventana con etiqueta estandarizada
- **Antigua:** Usa EtiquetaComanda.tsx tradicional

---

## 📱 Soporte Multiidioma

La etiqueta incluye soporte completo para traducciones:

```typescript
translations: {
  foodBank: 'BANQUE ALIMENTAIRE',
  orderLabel: 'Étiquette de Commande',
  orderNumber: 'N° Commande',
  deliveryDate: 'Livraison',
  status: 'Statut',
  products: 'Produits',
  articles: 'articles',
  recipient: 'Organisme Destinataire',
  // ... etc
}
```

Si no se proveen traducciones, se usan valores por defecto en **francés**.

---

## ✅ Ventajas del Nuevo Sistema

1. ✅ **Consistencia Visual Total** con etiquetas de producto
2. ✅ **Una sola hoja optimizada** (sin desperdicio de papel)
3. ✅ **Mismos colores oficiales** en todo el sistema
4. ✅ **Tipografías unificadas** (Montserrat + Roboto)
5. ✅ **QR Code del mismo tamaño** (120x120px funcional)
6. ✅ **Fácil de mantener** (misma estructura que StandardProductLabel)
7. ✅ **Lista de productos mejorada** con iconos
8. ✅ **Peso total visible** cuando aplica
9. ✅ **Información de organismo más clara**
10. ✅ **Estados de comanda con colores significativos**

---

## 🔗 Integración con Otros Módulos

### **Módulos que usan StandardProductLabel:**
- ✅ EntradaDonAchat.tsx (productos)
- ✅ VerificacionesRecientes.tsx (productos)
- ✅ Etiquetas.tsx (productos)
- ✅ **Comandas.tsx (comandas)** ← NUEVO

### **Sistema Unificado:**
```
┌──────────────────────────────────────┐
│  SISTEMA DE ETIQUETAS ESTANDARIZADO  │
├──────────────────────────────────────┤
│                                      │
│  StandardProductLabel.ts             │
│  ✓ Productos individuales            │
│  ✓ Una sola hoja Letter              │
│  ✓ QR 120x120px                      │
│                                      │
│  EtiquetaComandaEstandarizada.tsx    │
│  ✓ Comandas completas                │
│  ✓ Mismas dimensiones                │
│  ✓ Mismos colores/tipografías        │
│                                      │
└──────────────────────────────────────┘
```

---

## 📄 Compatibilidad de Impresión

### **Navegadores:**
- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari

### **Configuración de Impresora:**
```
Tamaño:       Letter (8.5" x 11")
Orientación:  Portrait (Vertical)
Márgenes:     Por defecto
Escala:       100%
Fondos:       Activado (importante)
```

---

## 🎉 Resultado Final

Ahora **TODAS las etiquetas del sistema** (productos y comandas) tienen:
- ✅ Las mismas dimensiones
- ✅ Los mismos colores
- ✅ Las mismas tipografías
- ✅ La misma calidad de impresión
- ✅ Optimización para una sola hoja

**Sistema completamente unificado y profesional** ✨

---

**Fecha de Implementación:** 14 de Febrero, 2026  
**Versión:** 2.0.0 (Sistema Unificado)  
**Estado:** ✅ Implementado y Funcional
