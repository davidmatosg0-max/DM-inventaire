# 📝 Guía de Integración - Sistema de Registro de Actividades

## 🎯 Descripción General

El **Journal d'Activités** es un sistema completo de auditoría que registra automáticamente todas las acciones realizadas por los usuarios en la aplicación. Este sistema permite:

- ✅ Rastrear quién hizo qué y cuándo
- ✅ Auditar cambios en la base de datos
- ✅ Detectar patrones de uso
- ✅ Cumplir con requisitos de seguridad y compliance
- ✅ Exportar reportes de actividad
- ✅ Filtrar por usuario, módulo, acción y fechas

---

## 📍 Ubicación en la Aplicación

**Módulo:** Configuración  
**Pestaña:** Journal d'Activités  
**Ruta:** Configuración > Journal d'Activités

---

## 🔧 Cómo Integrar en Otros Módulos

### **1. Importar la función de registro**

```typescript
import { registrarActividad } from '../utils/actividadLogger';
```

### **2. Llamar después de cada acción**

#### **Ejemplo: Crear un producto en Inventario**

```typescript
const crearProducto = async (producto: Producto) => {
  try {
    // Guardar el producto
    const productoGuardado = await guardarProducto(producto);
    
    // ✅ Registrar la actividad
    registrarActividad(
      'Inventario',
      'crear',
      `Produit "${producto.nombre}" créé avec code ${producto.codigo}`,
      { productoId: productoGuardado.id }
    );
    
    toast.success('Produit créé avec succès');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### **Ejemplo: Modificar un organismo**

```typescript
const actualizarOrganismo = async (organismo: Organismo) => {
  try {
    // Actualizar el organismo
    await actualizarOrganismoEnBD(organismo);
    
    // ✅ Registrar la actividad
    registrarActividad(
      'Organismes',
      'modificar',
      `Organisme "${organismo.nombre}" modifié - Email: ${organismo.email}`,
      { organismoId: organismo.id, cambios: { email: organismo.email } }
    );
    
    toast.success('Organisme mis à jour');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### **Ejemplo: Eliminar una comanda**

```typescript
const eliminarComanda = async (comandaId: string, numeroComanda: string) => {
  try {
    // Eliminar la comanda
    await eliminarComandaDeBD(comandaId);
    
    // ✅ Registrar la actividad
    registrarActividad(
      'Commandes',
      'eliminar',
      `Commande #${numeroComanda} supprimée`,
      { comandaId }
    );
    
    toast.success('Commande supprimée');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 📊 Parámetros de la Función

```typescript
registrarActividad(
  modulo: string,              // Nombre del módulo
  accion: 'crear' | 'modificar' | 'eliminar',  // Tipo de acción
  descripcion: string,         // Descripción en francés
  detalles?: any              // (Opcional) Objeto con info adicional
)
```

### **Parámetros Detallados:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `modulo` | string | ✅ Sí | Nombre del módulo (ej: "Inventaire", "Organismes", "Commandes") |
| `accion` | 'crear' \| 'modificar' \| 'eliminar' | ✅ Sí | Tipo de acción realizada |
| `descripcion` | string | ✅ Sí | Descripción legible en francés de la acción |
| `detalles` | any | ❌ No | Objeto con información adicional para referencia |

---

## 📋 Ejemplos por Módulo

### **Inventario**
```typescript
// Crear producto
registrarActividad('Inventaire', 'crear', `Produit "Riz 1kg" ajouté au stock`, { sku: 'RIZ001' });

// Modificar stock
registrarActividad('Inventaire', 'modificar', `Stock de "Pâtes" mis à jour: 50 → 75 unités`, { productoId: '123' });

// Eliminar producto
registrarActividad('Inventaire', 'eliminar', `Produit "Huile 500ml" supprimé du système`, { productoId: '456' });
```

### **Organismos**
```typescript
// Crear organismo
registrarActividad('Organismes', 'crear', `Nouvel organisme "Cruz Roja" enregistré`, { organismoId: 'org-123' });

// Modificar organismo
registrarActividad('Organismes', 'modificar', `Organisme "Banque Alimentaire" - Téléphone modifié`, { organismoId: 'org-456' });

// Eliminar organismo
registrarActividad('Organismes', 'eliminar', `Organisme "Centro Comunitario" supprimé`, { organismoId: 'org-789' });
```

### **Comandas**
```typescript
// Crear comanda
registrarActividad('Commandes', 'crear', `Commande #CMD-2024-001 créée pour Cruz Roja`, { comandaId: 'cmd-001' });

// Modificar comanda
registrarActividad('Commandes', 'modificar', `Commande #CMD-2024-001 - Statut changé à "Validée"`, { comandaId: 'cmd-001' });

// Eliminar comanda
registrarActividad('Commandes', 'eliminar', `Commande #CMD-2024-001 annulée et supprimée`, { comandaId: 'cmd-001' });
```

### **Usuarios**
```typescript
// Crear usuario
registrarActividad('Utilisateurs', 'crear', `Nouvel utilisateur "Jean Dupont" créé - Rôle: Coordinateur`, { userId: 'user-123' });

// Modificar usuario
registrarActividad('Utilisateurs', 'modificar', `Utilisateur "Marie Martin" - Permissions modifiées`, { userId: 'user-456' });

// Eliminar usuario
registrarActividad('Utilisateurs', 'eliminar', `Utilisateur "Pierre Durand" désactivé`, { userId: 'user-789' });
```

### **Transporte**
```typescript
// Crear ruta
registrarActividad('Transport', 'crear', `Nouvelle route "Zone Nord" planifiée`, { rutaId: 'ruta-001' });

// Modificar entrega
registrarActividad('Transport', 'modificar', `Livraison #LIV-001 - Statut: En cours`, { entregaId: 'entrega-001' });

// Eliminar ruta
registrarActividad('Transport', 'eliminar', `Route "Zone Est" supprimée`, { rutaId: 'ruta-002' });
```

---

## 🎨 Características del Journal d'Activités

### **Filtros Disponibles:**
- 🔍 **Búsqueda libre** - Por usuario, módulo o descripción
- 🎯 **Por tipo de acción** - Crear, Modificar, Eliminar
- 📦 **Por módulo** - Inventario, Organismos, Comandas, etc.
- 👤 **Por usuario** - Filtrar por usuario específico
- 📅 **Por rango de fechas** - Desde/hasta

### **Funciones Adicionales:**
- 📥 **Exportar a JSON** - Descargar registros filtrados
- 🗑️ **Limpiar registro** - Eliminar todo el historial (con confirmación)
- 📊 **Estadísticas rápidas** - Conteo por tipo de acción
- 🔄 **Actualización en tiempo real** - Se actualiza automáticamente

---

## 💾 Almacenamiento

- **Ubicación:** `localStorage` bajo la clave `'registroActividades'`
- **Límite:** Máximo 1000 actividades (las más recientes)
- **Formato:** Array de objetos JSON
- **Persistencia:** Local al navegador del usuario

---

## 🛠️ Estructura de Datos

```typescript
interface ActividadLog {
  id: string;              // ID único: "act-1234567890-abc123"
  fecha: string;           // Formato: "2024-03-16" (YYYY-MM-DD)
  hora: string;            // Formato: "14:30:45" (HH:MM:SS)
  usuario: string;         // Nombre completo: "David González"
  usuarioId: string;       // ID del usuario
  modulo: string;          // Módulo: "Inventaire"
  accion: 'crear' | 'modificar' | 'eliminar';
  descripcion: string;     // Descripción legible
  detalles?: any;         // Información adicional (opcional)
  ipAddress?: string;     // IP del usuario (por ahora "local")
}
```

---

## ✅ Checklist de Integración

Para integrar el sistema en un nuevo módulo:

- [ ] Importar `registrarActividad` desde `../utils/actividadLogger`
- [ ] Agregar llamadas después de cada operación exitosa de **crear**
- [ ] Agregar llamadas después de cada operación exitosa de **modificar**
- [ ] Agregar llamadas después de cada operación exitosa de **eliminar**
- [ ] Usar descripciones en **francés** que sean claras y concisas
- [ ] Incluir información relevante en el parámetro `detalles` (IDs, nombres, etc.)
- [ ] Probar que las actividades aparezcan en el Journal

---

## 🚨 Importante

1. **Siempre registrar DESPUÉS del éxito** - No registres actividades si la operación falla
2. **Descripciones en francés** - Mantener consistencia con el idioma del sistema
3. **Incluir contexto relevante** - Nombres de productos, códigos, números de comanda
4. **No registrar datos sensibles** - Evitar passwords, tokens, información personal crítica
5. **Ser específico** - "Produit modifié" ❌ vs "Produit 'Riz 1kg' - Stock modifié: 50 → 75" ✅

---

## 📞 Soporte

Si necesitas ayuda para integrar el sistema de registro de actividades en un nuevo módulo, contacta al equipo de desarrollo.

---

## 🎉 ¡Listo!

Con esta guía, podrás integrar fácilmente el sistema de registro de actividades en cualquier módulo de la aplicación. El Journal d'Activités estará disponible en **Configuración > Journal d'Activités** para revisar todas las acciones registradas.
