# 🗑️ Limpieza Completa del Sistema

## Ejecución Automática

El sistema ejecuta una **limpieza completa automática** la primera vez que se carga. Esta limpieza:

### ✅ **Datos que SE MANTIENEN:**
- ✓ **12 Departamentos estructurados** con funciones y responsabilidades
- ✓ **Configuraciones del sistema**
- ✓ **Usuarios permanentes:**
  - `David` (Desarrollador) - Contraseña: `Lettycia26`
  - `admin` (Administrador) - Contraseña: `Admin2024!`
- ✓ **Calles de Laval** (166 calles principales)
- ✓ **Quartiers de Laval** (15 barrios)
- ✓ **Unidades de medida**
- ✓ **Configuración de soporte**
- ✓ **Configuración de backup automático**

### 🗑️ **Datos que SE ELIMINAN:**
- ✗ **Organismos de ejemplo (mockOrganismos)** - Array completamente vacío
- ✗ Comandas de ejemplo
- ✗ Productos de ejemplo
- ✗ Movimientos de inventario
- ✗ Contactos de ejemplo (departamentos, almacén)
- ✗ **Bénévoles de ejemplo** (módulo Recrutement vacío)
- ✗ **Feuilles de temps de ejemplo** (hojas de tiempo vacías)
- ✗ **Beneficiarios de ejemplo** (módulo Comptoir vacío)
- ✗ **Rendez-vous de ejemplo** (citas vacías)
- ✗ **Aide alimentaire de ejemplo** (historiales vacíos)
- ✗ **Demandes d'aide de ejemplo** (solicitudes de ayuda vacías)
- ✗ **Rapports de ejemplo** (reportes con estadísticas en cero)
- ✗ **Types d'aide personalizados** (solo 5 tipos del sistema, sin ejemplos personalizados)
- ✗ **Reportes de almacén** (gráficos de inventario, comandas y PRS sin datos de ejemplo)
- ✗ **Tableau de bord entrepôt** (dashboard de almacén con gráficos de movimientos vacíos)
- ✗ **Transportes de ejemplo (mockTransportes)** - Array completamente vacío
- ✗ **Vehículos de ejemplo (mockVehiculos)** - Array completamente vacío  
- ✗ **Rutas de ejemplo (mockRutas)** - Array completamente vacío
- ✗ **IDs Digitales de ejemplo (mockIDsDigitales)** - Array completamente vacío
- ✗ **Tipos de contacto predeterminados** (Donateur, Fournisseur, Bénévole, Responsable de Santé, Partenaire, Visitante, Employé)
- ✗ **Tipos de documento predeterminados** (Contrat, Casier Judiciaire, Assurance, Certificat, CV, Lettre de Motivation, Pièce d'Identité, Référence, Formation, Autre)
- ✗ Categorías predeterminadas
- ✗ Programas de entrada predeterminados
- ✗ Registros PRS de ejemplo
- ✗ Recetas de ejemplo
- ✗ Notificaciones antiguas
- ✗ Comunicaciones internas de ejemplo

---

## 🔄 Forzar Limpieza Manual

Si necesitas ejecutar la limpieza manualmente, abre la **Consola del Navegador** (F12) y ejecuta:

### Método 1: Limpieza Completa desde Cero
```javascript
// Eliminar flag de limpieza y recargar
localStorage.removeItem('limpieza_completa_ejecutada');
localStorage.removeItem('limpieza_completa_fecha');
location.reload();
```

### Método 2: Forzar Limpieza Inmediata
```javascript
// Importar y ejecutar limpieza
import { forzarLimpiezaCompleta } from '/src/app/utils/limpiezaCompleta';
forzarLimpiezaCompleta();
```

### Método 3: Limpiar TODO (incluyendo departamentos)
```javascript
// ⚠️ ADVERTENCIA: Esto borrará TODO el localStorage
localStorage.clear();
location.reload();
```

---

## 📊 Verificar Estado de Limpieza

Para verificar si el sistema ya fue limpiado:

```javascript
// Verificar si se ejecutó la limpieza
console.log('Limpieza ejecutada:', localStorage.getItem('limpieza_completa_ejecutada'));

// Ver fecha de última limpieza
console.log('Fecha limpieza:', localStorage.getItem('limpieza_completa_fecha'));

// Ver número de departamentos
const deps = JSON.parse(localStorage.getItem('departamentos_banco_alimentos') || '[]');
console.log('Departamentos:', deps.length);

// Ver usuarios permanentes
const users = JSON.parse(localStorage.getItem('banco_alimentos_usuarios') || '[]');
console.log('Usuarios:', users.map(u => u.nombre));
```

---

## 🛠️ Archivo de Limpieza

La función de limpieza se encuentra en:
```
/src/app/utils/limpiezaCompleta.ts
```

### Funciones Disponibles:
- `ejecutarLimpiezaCompleta()` - Ejecuta limpieza completa
- `yaEjecutadaLimpiezaCompleta()` - Verifica si ya se limpió
- `obtenerFechaUltimaLimpieza()` - Obtiene fecha de última limpieza
- `forzarLimpiezaCompleta()` - Fuerza nueva limpieza

---

## 📋 Departamentos Incluidos

El sistema mantiene estos **12 departamentos** estructurados:

1. **Direction Générale** - Dirección y coordinación general
2. **Entrepôt** - Gestión de stocks y almacén
3. **Achats et Approvisionnement** - Compras y relaciones con proveedores
4. **Comptoir** - Distribución directa a beneficiarios
5. **Cuisine Collective** - Preparación de comidas
6. **Liaison avec Organismes** - Coordinación con organismos
7. **Transport et Logistique** - Gestión de flota y entregas
8. **Programme Travail Communautaire (PTC)** - Encuadramiento PTC
9. **Maintenance et Installations** - Mantenimiento de instalaciones
10. **Ressources Humaines** - Gestión de personal
11. **Administration et Finances** - Administración y finanzas
12. **Communications et Développement** - Comunicaciones y fundraising

Cada departamento incluye:
- Funciones detalladas (8 funciones por departamento)
- Objetivos principales (4 objetivos)
- Número de empleados y voluntarios
- Horarios de operación
- Información de contacto (opcional)

---

## ✨ **Características Clave**

1. **Preservación Inteligente**: Mantiene SOLO los datos estructurales esenciales
2. **Limpieza Total de Ejemplos**: Elimina TODOS los datos de demostración
3. **Sistema Listo para Producción**: Comienza con un sistema completamente limpio
4. **Tipos de Contacto Vacíos**: NO inicializa tipos predeterminados, los usuarios deben crearlos manualmente
5. **Tipos de Documento Vacíos**: NO inicializa tipos predeterminados, los usuarios deben crearlos manualmente
6. **No Reversible**: Esta operación NO se puede deshacer (¡úsala con cuidado!)

---

## ✨ Sistema Limpio y Listo

Después de la limpieza, el sistema queda:
- ✅ **Completamente vacío** de datos de ejemplo
- ✅ **Listo para uso en producción**
- ✅ **Con estructura profesional** de departamentos
- ✅ **Con usuarios permanentes** para acceso inmediato
- ✅ **Con todas las configuraciones** necesarias

**¡El sistema está listo para que los usuarios creen sus propios datos!**