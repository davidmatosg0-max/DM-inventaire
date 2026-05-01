# 📸 GUÍA VISUAL - Botón "Nouvelle zone"

## 🎯 UBICACIÓN EXACTA DEL BOTÓN

### Paso 1: Ir al Módulo Etiquetas
```
┌────────────────────────────────────────────────┐
│  MENU LATERAL                                  │
├────────────────────────────────────────────────┤
│  🏠 Dashboard                                  │
│  📦 Entrepôt                                   │
│  📋 Comandas                                   │
│  🏢 Organismos                                 │
│  🚚 Transporte                                 │
│  🏷️ Étiquettes  ← AQUÍ                         │
│  📊 Reportes                                   │
│  👥 Usuarios                                   │
└────────────────────────────────────────────────┘
```

---

### Paso 2: Abrir Diálogo Nueva Étiquette
```
┌─────────────────────────────────────────────────────────────┐
│  🏷️ Étiquettes                                              │
│                                                             │
│  [🔥 Génération Massive]  [+ Nouvelle Étiquette] ← CLIC    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Estadísticas...                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Paso 3: Ver el Tab "Ubicación"
```
┌─────────────────────────────────────────────────────────────┐
│  Créer une nouvelle étiquette                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [📍 Ubicación]  [📦 Producto]                              │
│   ^^^^^^^^^^^^                                              │
│   ESTE TAB                                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Paso 4: ¡AQUÍ ESTÁ EL BOTÓN!
```
┌─────────────────────────────────────────────────────────────┐
│  Créer une nouvelle étiquette                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [📍 Ubicación]  [📦 Producto]                              │
│                                                             │
│  ┌──────────────────────────┬──────────────────────────┐  │
│  │                          │                          │  │
│  │  Zone                    │  Number                  │  │
│  │  [+ Nouvelle zone] 🟢    │                          │  │
│  │   ^^^^^^^^^^^^^^^^       │                          │  │
│  │   ¡¡¡EL BOTÓN!!!        │  [1         ]            │  │
│  │                          │                          │  │
│  │  [▼ Sélectionner...]     │                          │  │
│  │                          │                          │  │
│  └──────────────────────────┴──────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🖼️ ASPECTO DETALLADO DEL BOTÓN

### Características Visuales:
```
┌───────────────────────┐
│ + Nouvelle zone       │  ← Texto en francés
└───────────────────────┘
 ^   ^
 │   └─ Icono Plus pequeño
 └───── Color verde (#2d9561)

TAMAÑO: Pequeño (h-7, px-2)
ESTILO: Ghost (transparente)
COLOR: Verde al hacer hover
FUENTE: Roboto Regular
```

---

## 🎭 DIÁLOGO "Créer une nouvelle zone"

### Vista Completa del Modal:
```
╔═══════════════════════════════════════════════════════════╗
║  Créer une nouvelle zone                               ✕  ║
║  Ajouter une nouvelle zone d'entreposage                  ║
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║  Code de la zone                                          ║
║  ┌─────────────────────────────────────────────────┐     ║
║  │ Ex: F, G, H...                                  │     ║
║  └─────────────────────────────────────────────────┘     ║
║  Utiliser 1-2 caractères (A-Z)                           ║
║                                                            ║
║  Type d'emplacement                                       ║
║  ┌─────────────────────────────────────────────────┐     ║
║  │ Étagère                                    ▼    │     ║
║  └─────────────────────────────────────────────────┘     ║
║                                                            ║
║  Capacité maximum d'emplacements                          ║
║  ┌─────────────────────────────────────────────────┐     ║
║  │ 10                                              │     ║
║  └─────────────────────────────────────────────────┘     ║
║  Nombre maximum d'emplacements dans cette zone            ║
║                                                            ║
║  ╔═══════════════════════════════════════════════╗       ║
║  ║ Aperçu:                                       ║       ║
║  ║ Zone F - Étagère                              ║       ║
║  ║ Emplacements: F1 à F10                        ║       ║
║  ╚═══════════════════════════════════════════════╝       ║
║                                                            ║
║                               [Annuler] [Créer la zone]   ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📋 SELECTOR DE TIPO - Opciones Disponibles

### Dropdown "Type d'emplacement":
```
┌─────────────────────────────────┐
│ ▼ Étagère                       │  ← Por defecto
├─────────────────────────────────┤
│   Étagère                    ✓  │  ← Estantería
│   Chambre froide                │  ← Cámara fría
│   Congélateur                   │  ← Congelador
│   Entrepôt sec                  │  ← Almacén seco
│   Zone de chargement            │  ← Zona de carga
│   Zone de tri                   │  ← Área de clasificación
└─────────────────────────────────┘
```

---

## 🎨 ESTADOS VISUALES DEL BOTÓN

### Estado Normal:
```
[ + Nouvelle zone ]
  Verde tenue
  Fondo transparente
```

### Estado Hover (al pasar mouse):
```
[ + Nouvelle zone ]
  ^^^^^^^^^^^^^^^^^^^
  Verde más intenso
  Ligero cambio de color
```

### Estado Click:
```
[ + Nouvelle zone ]
  →→→→→→→→→→→→→→→→→→→
  Se abre el diálogo
  Animación suave
```

---

## 🔄 FLUJO VISUAL COMPLETO

### Animación del Proceso:
```
1. [+ Nouvelle zone] 
      ↓ CLIC
      
2. ╔══════════════════╗
   ║ Diálogo se abre  ║
   ╚══════════════════╝
      ↓ LLENAR
      
3. Code: F
   Type: Étagère  
   Capacité: 10
      ↓ CREAR
      
4. ✅ Zone F créée avec succès
      ↓ CERRAR
      
5. Selector actualizado:
   [▼ Zone A - Estantería    ]
   [▼ Zone B - Estantería    ]
   [▼ Zone C - Cámara Fría   ]
   [▼ Zone D - Almacén Seco  ]
   [▼ Zone E - Congelador    ]
   [▼ Zone F - Étagère    ]  ← NUEVA! ✨
```

---

## 🎯 VISTA PREVIA EN TIEMPO REAL

### Cuando escribes en el formulario:
```
╔═════════════════════════════════════════╗
║ Code de la zone: F                      ║
║ Type: Étagère                           ║
║ Capacité: 15                            ║
║                                         ║
║ ┌─────────────────────────────────────┐ ║
║ │ Aperçu:                 ←────┐      │ ║
║ │                              │      │ ║
║ │ Zone F - Étagère        VISTA │      │ ║
║ │ Emplacements: F1 à F15   PREVIA│      │ ║
║ │                              │      │ ║
║ └─────────────────────────────────────┘ ║
║                              └────┘      ║
╚═════════════════════════════════════════╝
```

---

## 📱 RESPONSIVE - Vista Móvil

### En Pantallas Pequeñas:
```
┌───────────────────────┐
│ Zone                  │
│ [+ Nouvelle zone]     │  ← Botón más pequeño
│                       │
│ [▼ Sélectionner...]   │
│                       │
│ Number                │
│ [1              ]     │
└───────────────────────┘
```

---

## ✅ CHECKLIST VISUAL

Verifica que veas cada uno de estos elementos:

### En el Formulario Principal:
- [ ] Label "Zone" visible
- [ ] Botón "+ Nouvelle zone" en verde
- [ ] Selector de zonas debajo
- [ ] Campo "Number" al lado

### Al Hacer Clic:
- [ ] Diálogo modal se abre
- [ ] Título "Créer une nouvelle zone"
- [ ] Campo "Code de la zone" con placeholder
- [ ] Selector "Type d'emplacement"
- [ ] Campo numérico "Capacité maximum"
- [ ] Vista previa con borde verde
- [ ] Botones "Annuler" y "Créer la zone"

### Después de Crear:
- [ ] Mensaje verde de éxito (toast)
- [ ] Diálogo se cierra automáticamente
- [ ] Nueva zona aparece en selector
- [ ] Zonas ordenadas alfabéticamente

---

## 🎨 PALETA DE COLORES

```
BOTÓN:
- Color primario: #2d9561 (Verde)
- Hover: #2d9561 con opacidad
- Texto: #2d9561

DIÁLOGO:
- Fondo: Blanco con blur
- Título: #1a4d7a (Azul marino)
- Bordes: Gris claro

VISTA PREVIA:
- Fondo: #2d956110 (Verde muy claro)
- Borde: #2d956130 (Verde transparente)
- Texto: #2d9561 (Verde)
```

---

## 🔍 ZOOM EN DETALLES

### El Icono Plus (+):
```
┌───┐
│ + │  ← w-3 h-3 (12px × 12px)
└───┘    Lucide-react icon
         Color heredado del botón
```

### El Texto "Nouvelle zone":
```
Nouvelle zone
^^^^^^^^^^^^^
Font: Roboto Regular
Size: sm (14px)
Weight: Normal
Color: #2d9561
```

### Espaciado:
```
[ICON] [ESPACIO] [TEXTO]
  +        4px     Nouvelle zone
```

---

## 💡 TIPS VISUALES

### Si No Ves el Botón:
1. **Busca el label "Zone"** - El botón está justo al lado
2. **Busca el color verde** - Es el único botón verde en esa área
3. **Busca el símbolo "+"** - Es distintivo
4. **Desplázate hacia arriba** - Puede estar fuera de vista

### Si No Puedes Hacer Clic:
1. **Verifica que el botón no esté deshabilitado** (debería ser clickeable)
2. **Intenta hacer zoom out** (Ctrl + -)
3. **Cambia el tamaño de la ventana** (responsive)

---

## 🎬 ANIMACIONES

### Al Abrir el Diálogo:
```
Opacidad: 0 → 100%
Escala: 95% → 100%
Duración: 200ms
Efecto: ease-out
```

### Al Cerrar el Diálogo:
```
Opacidad: 100% → 0%
Escala: 100% → 95%
Duración: 150ms
Efecto: ease-in
```

### Toast de Éxito:
```
Aparece desde abajo
Duración en pantalla: 3 segundos
Color de fondo: Verde
Icono: Checkmark ✓
```

---

## 📐 DIMENSIONES EXACTAS

```
BOTÓN:
- Altura: 28px (h-7)
- Padding horizontal: 8px (px-2)
- Ancho: Auto (ajustado al contenido)

DIÁLOGO:
- Ancho máximo: 600px (max-w-2xl)
- Altura: Auto
- Padding: 24px (p-6)

INPUTS:
- Altura: 40px
- Ancho: 100%
- Border radius: 6px
```

---

## 🎯 POSICIÓN RELATIVA

```
Form Container
  └─ Grid (2 columnas)
      ├─ Columna 1: Zone
      │   ├─ Flex container (justify-between)
      │   │   ├─ Label "Zone"
      │   │   └─ [+ Nouvelle zone] ← AQUÍ
      │   └─ Selector de zonas
      │
      └─ Columna 2: Number
          ├─ Label "Number"
          └─ Input numérico
```

---

**Nota Final**: Esta guía visual te ayuda a identificar exactamente dónde debe aparecer el botón y cómo debe verse. Si sigues esta guía y aún no lo ves, es definitivamente un problema de caché del navegador.

**Solución rápida**: Ctrl+F5 (Windows/Linux) o Cmd+Shift+R (Mac)

---

**Última actualización**: Febrero 2026  
**Para**: Sistema Banque Alimentaire  
**Módulo**: Étiquettes
