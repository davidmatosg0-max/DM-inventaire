# 📋 IDENTIFICACIÓN COMPLETA DE FORMULARIOS POR MÓDULO

## 🎯 OBJETIVO
Este documento identifica todos los formularios del sistema con sus módulos correspondientes para evitar confusiones en configuraciones futuras.

---

## 📦 **1. MÓDULO: ENTREPÔT (Almacén)**

### **FormularioContactoEntrepotCompacto.tsx**
- **Ubicación:** `/src/app/components/inventario/FormularioContactoEntrepotCompacto.tsx`
- **Módulo:** Entrepôt (Almacén)
- **Departamento ID:** `'1'` (Entrepôt)
- **Usado en:** `GestionContactosEntrepot.tsx`
- **Tipos de contacto permitidos:**
  - `'fournisseur'` → Fournisseur (Proveedor)
  - `'donador'` → Donateur (Donador)
  - `'transportista'` → Transporteur (Transportista)
  - `'partenaire'` → Partenaire (Socio)

**Características:**
- ✅ Gestiona contactos exclusivos de Entrepôt
- ✅ Incluye campos profesionales (empresa, TVA, cuenta bancaria)
- ✅ Asigna automáticamente a departamento "Entrepôt" (ID: '1')
- ✅ Permite asignación múltiple de departamentos
- ✅ DialogDescription ID: `contact-warehouse-form-description`

**Pestañas disponibles:**
- Base (siempre visible)
- Contact (siempre visible)
- Professionnel (oculta para Donateur)
- Disponibilités (siempre visible)
- Autres (oculta para Donateur)

---

### **FormularioEntradaProductoCompacto.tsx**
- **Ubicación:** `/src/app/components/inventario/FormularioEntradaProductoCompacto.tsx`
- **Módulo:** Entrepôt (Almacén - Entrada de productos)
- **Usado en:** `EntradaDonAchat.tsx`
- **Función:** Registrar entradas de productos (donaciones y compras)

**Características:**
- ✅ Conexión con balanza Pennsylvania Scale
- ✅ Gestión de categorías y subcategorías
- ✅ Programas de entrada (PRS, OACAS, etc.)
- ✅ Integración con contactos de Entrepôt

---

## 🏢 **2. MÓDULO: DEPARTAMENTOS (Sistema Unificado)**

### **FormularioContactoCompacto.tsx**
- **Ubicación:** `/src/app/components/departamentos/FormularioContactoCompacto.tsx`
- **Módulo:** Sistema de Departamentos (Multi-departamento)
- **Departamento ID:** Variable (depende del contexto)
- **Usado en:** `GestionContactosDepartamento.tsx`
- **Tipos de contacto:** Dinámicos según departamento

**Características:**
- ✅ Sistema unificado para TODOS los departamentos
- ✅ Tipos de contacto personalizables por departamento
- ✅ Gestión de tipos globales y específicos
- ✅ Tipos de documentos estandarizados
- ✅ Sistema de disponibilidad por días (AM/PM)
- ✅ Historial de actividad completo
- ✅ DialogDescription ID: `contact-form-description`

**Departamentos soportados:**
| Departamento | ID | Contexto de uso |
|--------------|----|--------------------|
| Entrepôt | '1' | Usado desde Inventario > Contactos |
| Comptoir | '2' | Usado desde Comptoir > Contactos |
| Cuisine | '3' | Usado desde Cuisine > Contactos |
| Liaison | '4' | Usado desde Liaison > Contactos |
| PTC | '5' | Programa de Trabajo Comunitario |
| Maintien | '6' | Mantenimiento |
| Recrutement | '7' | Reclutamiento |

**Pestañas disponibles:**
- Base
- Contact
- Professionnel
- Disponibilités
- Documents
- Historique

---

## 👥 **3. MÓDULO: BÉNÉVOLES (Voluntarios)**

### **FormularioNouveauBenevole.tsx**
- **Ubicación:** `/src/app/components/benevoles/FormularioNouveauBenevole.tsx`
- **Módulo:** Bénévoles
- **Usado en:** `Benevoles.tsx`
- **Función:** Crear y editar voluntarios

**Características:**
- ✅ Especializado en gestión de voluntarios
- ✅ Sistema de tareas asignables
- ✅ Gestión de disponibilidad semanal
- ✅ Integración con sistema de calles de Laval
- ✅ Sincronización con contactos de departamentos

---

## 🏪 **4. MÓDULO: COMPTOIR (Mostrador)**

### **FormularioBeneficiarioCompacto.tsx**
- **Ubicación:** `/src/app/components/comptoir/FormularioBeneficiarioCompacto.tsx`
- **Módulo:** Comptoir
- **Usado en:** Gestión de beneficiarios de Comptoir
- **Función:** Registrar beneficiarios del programa de mostrador

**Características:**
- ✅ Gestión de beneficiarios
- ✅ Sistema de membresía
- ✅ Historial de retiros

---

## 🤝 **5. MÓDULO: ORGANISMOS**

### **FormularioOrganismoCompacto.tsx**
- **Ubicación:** `/src/app/components/organismos/FormularioOrganismoCompacto.tsx`
- **Módulo:** Organismos
- **Usado en:** `Organismos.tsx`, `EmailOrganismos.tsx`
- **Función:** Crear y editar organismos beneficiarios

**Características:**
- ✅ Tipos de organismo personalizables
- ✅ Sistema de credenciales de acceso
- ✅ Portal público de ofertas
- ✅ Gestión de personas responsables

---

## 🚚 **6. MÓDULO: TRANSPORTE**

### **FormularioChoferCompacto.tsx**
- **Ubicación:** `/src/app/components/transporte/FormularioChoferCompacto.tsx`
- **Módulo:** Transporte (Choferes)
- **Función:** Gestión de conductores

**Características:**
- ✅ Datos del conductor
- ✅ Licencia de conducir
- ✅ Certificaciones

---

### **FormularioVehiculoCompacto.tsx**
- **Ubicación:** `/src/app/components/transporte/FormularioVehiculoCompacto.tsx`
- **Módulo:** Transporte (Vehículos)
- **Función:** Gestión de vehículos

**Características:**
- ✅ Datos del vehículo
- ✅ Mantenimiento
- ✅ Documentación

---

## 👤 **7. MÓDULO: USUARIOS**

### **FormularioUsuarioInternoCompacto.tsx**
- **Ubicación:** `/src/app/components/usuarios/FormularioUsuarioInternoCompacto.tsx`
- **Módulo:** Usuarios Internos
- **Función:** Gestión de usuarios del sistema

**Características:**
- ✅ Roles y permisos
- ✅ Acceso al sistema
- ✅ Departamentos asignados

---

## 📊 **8. MÓDULO: ENTRADA GENERAL**

### **FormularioEntrada.tsx**
- **Ubicación:** `/src/app/components/FormularioEntrada.tsx`
- **Módulo:** Sistema general de entradas
- **Función:** Formulario básico de entrada de productos

**Características:**
- ✅ Integración con balanza
- ✅ Sistema básico de entrada
- ✅ Usado como componente heredado

---

## 🔑 **MATRIZ DE IDENTIFICACIÓN RÁPIDA**

| Formulario | Módulo | Dept ID | DialogDescription ID | Storage Key |
|------------|--------|---------|---------------------|-------------|
| FormularioContactoEntrepotCompacto | Entrepôt | '1' | contact-warehouse-form-description | banqueAlimentaire_contactosDepartamento |
| FormularioContactoCompacto | Departamentos | Variable | contact-form-description | banqueAlimentaire_contactosDepartamento |
| FormularioNouveauBenevole | Bénévoles | - | - | benevoles |
| FormularioBeneficiarioCompacto | Comptoir | - | - | beneficiarios |
| FormularioOrganismoCompacto | Organismos | - | - | organismos |
| FormularioChoferCompacto | Transporte | - | - | choferes |
| FormularioVehiculoCompacto | Transporte | - | - | vehiculos |
| FormularioUsuarioInternoCompacto | Usuarios | - | - | usuarios |

---

## ⚠️ **REGLAS IMPORTANTES**

### **1. Sistema Unificado de Contactos de Departamentos**

**Almacenamiento:** `banqueAlimentaire_contactosDepartamento`

**Formularios que usan este sistema:**
- ✅ FormularioContactoEntrepotCompacto (especializado para Entrepôt)
- ✅ FormularioContactoCompacto (para todos los departamentos)

**Diferencias clave:**
```typescript
// FormularioContactoEntrepotCompacto (Entrepôt SOLO)
tipoContacto: 'fournisseur' | 'donador' | 'transportista' | 'partenaire'
departamentoId: '1' // Siempre Entrepôt
departamentoIds: ['1'] // Por defecto

// FormularioContactoCompacto (Multi-departamento)
tipo: TipoContacto // Dinámico según departamento
departamentoId: string // Variable
departamentoIds: string[] // Múltiples departamentos permitidos
```

### **2. Identificadores Únicos de DialogDescription**

**CRÍTICO:** Cada formulario DEBE tener un `aria-describedby` único para accesibilidad:

```typescript
// ✅ CORRECTO
<DialogContent aria-describedby="contact-warehouse-form-description">
  <DialogDescription id="contact-warehouse-form-description">
    Formulaire de contact pour l'entrepôt
  </DialogDescription>
</DialogContent>

// ❌ INCORRECTO
<DialogContent> // Sin aria-describedby
  <DialogDescription>...</DialogDescription>
</DialogContent>
```

### **3. Departamentos y sus IDs**

```typescript
const DEPARTAMENTOS = {
  ENTREPOT: '1',      // Almacén
  COMPTOIR: '2',      // Mostrador
  CUISINE: '3',       // Cocina
  LIAISON: '4',       // Enlace/Liaison
  PTC: '5',           // Programa Trabajo Comunitario
  MAINTIEN: '6',      // Mantenimiento
  RECRUTEMENT: '7'    // Reclutamiento
};
```

### **4. Tipos de Contacto por Contexto**

**Entrepôt (FormularioContactoEntrepotCompacto):**
- Fournisseur (Proveedor)
- Donateur (Donador)
- Transporteur (Transportista)
- Partenaire (Socio)

**Departamentos generales (FormularioContactoCompacto):**
- Tipos personalizables
- Tipos globales compartidos
- Tipos específicos por departamento

---

## 🔧 **GUÍA DE MANTENIMIENTO**

### **Al crear un nuevo formulario:**

1. ✅ Definir claramente el módulo al que pertenece
2. ✅ Asignar un `aria-describedby` único
3. ✅ Documentar en este archivo
4. ✅ Usar convención de nombres: `Formulario[Entidad]Compacto.tsx`
5. ✅ Incluir DialogHeader con DialogTitle y DialogDescription

### **Al modificar un formulario existente:**

1. ✅ Verificar que no se rompa la identificación
2. ✅ Actualizar este documento si cambia el propósito
3. ✅ Mantener la compatibilidad con localStorage
4. ✅ Probar en todos los contextos donde se usa

---

## 📝 **NOTAS DE VERSIÓN**

- **v2.1** - Sistema unificado de contactos de departamentos implementado
- **v2.0** - FormularioContactoEntrepotCompacto creado específicamente para Entrepôt
- **v1.9** - FormularioContactoCompacto unificado para multi-departamento
- **v1.8** - Corrección de accesibilidad con aria-describedby en todos los formularios

---

## 🚀 **PRÓXIMAS MEJORAS**

- [ ] Estandarizar todos los formularios con el patrón "Compacto"
- [ ] Crear sistema de validación unificado
- [ ] Implementar auto-guardado en todos los formularios
- [ ] Agregar sistema de versionado de formularios

---

**Última actualización:** 11 de marzo de 2026  
**Mantenido por:** David (Desarrollador)  
**Versión del documento:** 1.0
