# 🏢 DEPARTAMENTOS DEL SISTEMA - MEMORIZADO PERMANENTEMENTE
## Banque Alimentaire - DMi Gestion

---

## 📋 **DEPARTAMENTOS OFICIALES DEL SISTEMA**

Los siguientes son los **7 departamentos oficiales** del sistema Banque Alimentaire. Estos departamentos están implementados en todo el sistema y deben mantenerse consistentes en todas las funcionalidades.

---

## 🎯 **LISTADO COMPLETO DE DEPARTAMENTOS**

### **1. ENTREPÔT (Almacén)**
```json
{
  "id": "1",
  "codigo": "ENTREPOT",
  "nombre": "Entrepôt",
  "nombreES": "Almacén",
  "nombreEN": "Warehouse",
  "descripcion": "Gestion des stocks et inventaire",
  "descripcionES": "Gestión de stocks e inventario",
  "descripcionEN": "Stock and inventory management",
  "icono": "Warehouse",
  "color": "#1E73BE",
  "activo": true,
  "orden": 1,
  "responsable": "Carlos Ruiz",
  "ubicacion": "Bodega Central",
  "usuarios": 12
}
```

**Funciones principales:**
- Gestión de inventario
- Control de stocks
- Recepción de productos
- Organización de almacén
- Inventario periódico

**Módulos asociados:**
- Inventario
- Etiquetas
- Reportes de Stock

---

### **2. COMPTOIR (Mostrador)**
```json
{
  "id": "2",
  "codigo": "COMPTOIR",
  "nombre": "Comptoir",
  "nombreES": "Mostrador",
  "nombreEN": "Counter",
  "descripcion": "Distribution directe aux bénéficiaires",
  "descripcionES": "Distribución directa a beneficiarios",
  "descripcionEN": "Direct distribution to beneficiaries",
  "icono": "Apple",
  "color": "#1E73BE",
  "activo": true,
  "orden": 2,
  "responsable": "Marie Dubois",
  "ubicacion": "Área de Atención",
  "usuarios": 8
}
```

**Funciones principales:**
- Atención directa a beneficiarios
- Distribución de alimentos
- Registro de entregas
- ID Digital
- Control de acceso

**Módulos asociados:**
- Comptoir (ID Digital)
- Acceso para Organismos
- Vista Pública

---

### **3. CUISINE (Cocina)**
```json
{
  "id": "3",
  "codigo": "CUISINE",
  "nombre": "Cuisine",
  "nombreES": "Cocina",
  "nombreEN": "Kitchen",
  "descripcion": "Préparation de repas et recettes",
  "descripcionES": "Preparación de comidas y recetas",
  "descripcionEN": "Meal and recipe preparation",
  "icono": "ChefHat",
  "color": "#FF9800",
  "activo": true,
  "orden": 3,
  "responsable": "Chef Jean-Pierre",
  "ubicacion": "Cocina Central",
  "usuarios": 6
}
```

**Funciones principales:**
- Creación de recetas
- Transformación de productos
- Producción de comidas preparadas
- Gestión de pérdidas
- Control de calidad
- Ofertas especiales de cocina

**Módulos asociados:**
- Cuisine (módulo completo)
- Recetas
- Transformaciones
- Inventario de Cocina
- Ofertas de Cocina

---

### **4. LIAISON (Enlace/Coordinación)**
```json
{
  "id": "4",
  "codigo": "LIAISON",
  "nombre": "Liaison",
  "nombreES": "Enlace",
  "nombreEN": "Liaison",
  "descripcion": "Coordination avec les organismes",
  "descripcionES": "Coordinación con los organismos",
  "descripcionEN": "Coordination with organizations",
  "icono": "Users",
  "color": "#2d9561",
  "activo": true,
  "orden": 4,
  "responsable": "Ana Martínez",
  "ubicacion": "Oficina de Coordinación",
  "usuarios": 5
}
```

**Funciones principales:**
- Coordinación con organismos
- Gestión de comandas
- Comunicación externa
- Emails a organismos
- Relaciones públicas

**Módulos asociados:**
- Organismos
- Comandas
- Email Organismos
- Comunicación Interna

---

### **5. PTC (Programme de Travail Communautaire)**
```json
{
  "id": "5",
  "codigo": "PTC",
  "nombre": "PTC",
  "nombreES": "PTC",
  "nombreEN": "PTC",
  "descripcion": "Programme de travail communautaire",
  "descripcionES": "Programa de trabajo comunitario",
  "descripcionEN": "Community work program",
  "icono": "Briefcase",
  "color": "#9C27B0",
  "activo": true,
  "orden": 5,
  "responsable": "Pierre Gagnon",
  "ubicacion": "Área de PTC",
  "usuarios": 4
}
```

**Funciones principales:**
- Gestión de programas comunitarios
- Coordinación de voluntarios
- Proyectos sociales
- Integración comunitaria

**Módulos asociados:**
- Bénévoles
- Proyectos Comunitarios

---

### **6. MAINTIEN (Mantenimiento)**
```json
{
  "id": "6",
  "codigo": "MAINTIEN",
  "nombre": "Maintien",
  "nombreES": "Mantenimiento",
  "nombreEN": "Maintenance",
  "descripcion": "Maintenance et entretien",
  "descripcionES": "Mantenimiento y cuidado",
  "descripcionEN": "Maintenance and upkeep",
  "icono": "Car",
  "color": "#607D8B",
  "activo": true,
  "orden": 6,
  "responsable": "Luis Fernández",
  "ubicacion": "Taller de Mantenimiento",
  "usuarios": 3
}
```

**Funciones principales:**
- Mantenimiento de instalaciones
- Reparaciones
- Mantenimiento de vehículos
- Control de equipamiento
- Mantenimiento preventivo

**Módulos asociados:**
- Transporte
- Balance (equipos)
- Inventario de equipos

---

### **7. RECRUTEMENT (Reclutamiento)**
```json
{
  "id": "7",
  "codigo": "RECRUTEMENT",
  "nombre": "Recrutement",
  "nombreES": "Reclutamiento",
  "nombreEN": "Recruitment",
  "descripcion": "Gestion des ressources humaines",
  "descripcionES": "Gestión de recursos humanos",
  "descripcionEN": "Human resources management",
  "icono": "UserPlus",
  "color": "#E91E63",
  "activo": true,
  "orden": 7,
  "responsable": "Sophie Lavoie",
  "ubicacion": "Recursos Humanos",
  "usuarios": 4
}
```

**Funciones principales:**
- Reclutamiento de personal
- Gestión de voluntarios
- Administración de RRHH
- Onboarding
- Capacitación

**Módulos asociados:**
- Bénévoles
- Recrutement
- Usuarios

---

## 📊 **ESTADÍSTICAS GENERALES**

```yaml
Total de Departamentos: 7
Departamentos Activos: 7
Total de Usuarios: 42
Promedio de Usuarios por Departamento: 6

Distribución:
  - ENTREPOT: 12 usuarios (28.6%)
  - COMPTOIR: 8 usuarios (19.0%)
  - CUISINE: 6 usuarios (14.3%)
  - LIAISON: 5 usuarios (11.9%)
  - PTC: 4 usuarios (9.5%)
  - RECRUTEMENT: 4 usuarios (9.5%)
  - MAINTIEN: 3 usuarios (7.1%)
```

---

## 🎨 **COLORES POR DEPARTAMENTO**

### **Paleta de Colores Asignada**

```css
ENTREPOT:    #1E73BE  /* Azul principal */
COMPTOIR:    #1E73BE  /* Azul principal */
CUISINE:     #FF9800  /* Naranja */
LIAISON:     #2d9561  /* Verde */
PTC:         #9C27B0  /* Púrpura */
MAINTIEN:    #607D8B  /* Gris azulado */
RECRUTEMENT: #E91E63  /* Rosa/Magenta */
```

### **Uso de Colores**

- Los colores ayudan a identificar visualmente cada departamento
- Se usan en badges, tarjetas, iconos y navegación
- Mantener consistencia en todos los módulos

---

## 🔗 **INTEGRACIÓN EN EL SISTEMA**

### **Archivos que Utilizan Departamentos**

1. **`/src/app/utils/departamentosStorage.ts`**
   - Definición de interfaces
   - Funciones CRUD
   - Inicialización de datos
   - localStorage management

2. **`/src/app/components/pages/Departamentos.tsx`**
   - Vista de tarjetas de navegación
   - Acceso rápido a cada departamento

3. **`/src/app/components/usuarios/GestionDepartamentos.tsx`**
   - Gestión CRUD de departamentos
   - Tabla administrativa
   - Asignación de usuarios

4. **`/src/app/components/pages/Benevoles.tsx`**
   - Asignación de voluntarios a departamentos
   - Filtros por departamento

5. **`/src/app/App.tsx`**
   - Enrutamiento a módulos de departamentos
   - Navegación principal

6. **`/src/i18n/locales/*.json`**
   - Traducciones de nombres de departamentos
   - Descripciones multilingües

---

## 🛠️ **FUNCIONES DE UTILIDAD**

### **API del Sistema**

```typescript
// Obtener todos los departamentos
import { obtenerDepartamentos } from './utils/departamentosStorage';
const departamentos = obtenerDepartamentos();

// Obtener un departamento específico
import { obtenerDepartamentoPorId } from './utils/departamentosStorage';
const depto = obtenerDepartamentoPorId('1');

// Crear nuevo departamento
import { guardarDepartamento } from './utils/departamentosStorage';
const nuevo = guardarDepartamento({
  codigo: 'NUEVO',
  nombre: 'Nuevo Departamento',
  descripcion: 'Descripción',
  icono: 'Icon',
  color: '#000000',
  activo: true,
  orden: 8
});

// Actualizar departamento
import { actualizarDepartamento } from './utils/departamentosStorage';
actualizarDepartamento('1', {
  nombre: 'Nuevo Nombre'
});

// Eliminar departamento
import { eliminarDepartamento } from './utils/departamentosStorage';
eliminarDepartamento('1');

// Cambiar estado
import { cambiarEstadoDepartamento } from './utils/departamentosStorage';
cambiarEstadoDepartamento('1', false);
```

---

## 📝 **REGLAS DE NEGOCIO**

### **Códigos de Departamento**

✅ **Permitido:**
- Mayúsculas únicamente
- Sin espacios
- Sin caracteres especiales
- Máximo 15 caracteres
- Único en el sistema

❌ **No Permitido:**
- Códigos duplicados
- Minúsculas o mixtos
- Números solos (debe tener letras)
- Caracteres especiales (!@#$%^&*)

### **Nombres de Departamento**

✅ **Recomendaciones:**
- Claro y descriptivo
- En francés como idioma principal
- Con traducciones en ES, EN, AR
- Sin abreviaciones confusas

### **Estados**

- **Activo**: El departamento está operativo y visible
- **Inactivo**: El departamento está deshabilitado temporalmente

### **Orden**

- Los departamentos se muestran según el campo `orden`
- El orden determina la prioridad en la navegación
- Puede ser modificado desde la gestión

---

## 🔄 **MIGRACIÓN Y ACTUALIZACIÓN**

### **Historia de Cambios**

**v1.0** - Inicial:
- 7 departamentos base creados

**v2.0** - Actualización Cuisine:
- Cambio de icono: `Utensils` → `ChefHat`
- Cambio de color: `#1E73BE` → `#FF9800`

**v3.0** - Gestión de Departamentos:
- Agregado módulo de gestión en Usuarios y Roles
- CRUD completo implementado
- Estadísticas y reportes

### **Procedimiento de Migración**

Si necesitas actualizar los departamentos existentes:

```typescript
// El sistema incluye migración automática
// Se ejecuta en inicializarDepartamentos()
// Ver: /src/app/utils/departamentosStorage.ts líneas 93-108

// Ejemplo de migración personalizada:
const departamentos = obtenerDepartamentos();
const actualizados = departamentos.map(dep => {
  if (dep.codigo === 'CUISINE') {
    return { ...dep, icono: 'ChefHat', color: '#FF9800' };
  }
  return dep;
});
localStorage.setItem('departamentos_banco_alimentos', JSON.stringify(actualizados));
```

---

## ⚠️ **IMPORTANTE - NO ELIMINAR**

### **Departamentos del Sistema**

Los siguientes departamentos **NO DEBEN SER ELIMINADOS** ya que son parte integral del sistema:

1. ❌ **ENTREPOT** - Módulo de Inventario depende de él
2. ❌ **COMPTOIR** - Módulo de ID Digital depende de él
3. ❌ **CUISINE** - Módulo de Cocina depende de él
4. ❌ **LIAISON** - Módulo de Organismos depende de él
5. ❌ **RECRUTEMENT** - Módulo de Bénévoles depende de él

Los departamentos PTC y MAINTIEN pueden ser desactivados pero no se recomienda eliminarlos.

---

## 🎯 **RESUMEN EJECUTIVO**

```
╔═══════════════════════════════════════════════════════════╗
║           DEPARTAMENTOS OFICIALES MEMORIZADO             ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  7 Departamentos Oficiales:                               ║
║                                                           ║
║  1. ENTREPOT     - Almacén (12 usuarios)                  ║
║  2. COMPTOIR     - Mostrador (8 usuarios)                 ║
║  3. CUISINE      - Cocina (6 usuarios)                    ║
║  4. LIAISON      - Enlace (5 usuarios)                    ║
║  5. PTC          - Prog. Comunitario (4 usuarios)         ║
║  6. MAINTIEN     - Mantenimiento (3 usuarios)             ║
║  7. RECRUTEMENT  - Reclutamiento (4 usuarios)             ║
║                                                           ║
║  Total: 42 usuarios distribuidos                          ║
║  Estado: Todos activos                                    ║
║  Persistencia: localStorage                               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

**Sistema**: Banque Alimentaire - DMi Gestion  
**Desarrollador**: David (Lettycia26)  
**Fecha de memorización**: 15 de Febrero, 2026  
**Estado**: ✅ DOCUMENTADO Y MEMORIZADO PERMANENTEMENTE

---

## 📌 **NOTA FINAL**

Este documento debe consultarse siempre que se trabaje con departamentos en el sistema. Los 7 departamentos listados aquí son la fuente oficial de verdad y deben mantenerse consistentes en todo el código.

**Archivo de referencia**: `/src/app/utils/departamentosStorage.ts`

---

**FIN DEL DOCUMENTO - MEMORIZADO PERMANENTEMENTE**
