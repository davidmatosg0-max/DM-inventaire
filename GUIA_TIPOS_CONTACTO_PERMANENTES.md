# 📋 Guía: Tipos de Contacto Permanentes

## 🎯 Resumen

Los tipos de contacto creados en el sistema quedan **guardados permanentemente** en el navegador (localStorage) y **NO se borran al reiniciar la aplicación**.

---

## ✅ Características Implementadas

### 1. **Persistencia Automática**
- ✅ Todos los tipos creados se marcan como `isPredefined: true`
- ✅ Se guardan automáticamente en `localStorage` con la clave: `banque_alimentaire_tipos_contacto_personalizados`
- ✅ Incluyen `dateCreated` para rastrear cuándo fueron creados
- ✅ Permanecen disponibles después de recargar la página o reiniciar el navegador

### 2. **Gestión Completa**
- ✅ **Crear**: Nuevos tipos con código único, etiqueta, icono y colores personalizados
- ✅ **Editar**: Modificar tipos existentes
- ✅ **Eliminar**: Borrar tipos que ya no se necesitan
- ✅ **Exportar**: Descargar todos los tipos en formato JSON
- ✅ **Importar**: Restaurar tipos desde un archivo JSON (agregar o reemplazar)

### 3. **Estadísticas y Auditoría**
- ✅ Ver total de tipos creados
- ✅ Distinguir entre predefinidos y personalizados
- ✅ Fecha de creación del tipo más antiguo y más reciente

---

## 🔧 Cómo Usar

### Acceder a la Gestión de Tipos

1. Ir a cualquier módulo de Contactos (Direction, Entrepôt, Comptoir, etc.)
2. Hacer clic en "Enregistrer un nouveau contact" o editar un contacto existente
3. En el formulario, buscar el icono de **engranaje ⚙️** junto a "Type"
4. Se abrirá el diálogo "Gestion des Types de Contact"

### Crear un Nuevo Tipo

1. Clic en **"Créer un nouveau type"**
2. Completar:
   - **Code unique**: Identificador único (ej: `chef-cuisine`, `technicien-it`)
   - **Étiquette**: Nombre visible (ej: `Chef Cuisine`, `Technicien IT`)
   - **Icône**: Seleccionar icono de la galería
   - **Couleur**: Elegir combinación de colores
3. Clic en **"Créer"**
4. ✅ El tipo quedará guardado **permanentemente**

### Exportar Tipos (Respaldo)

1. En "Gestion des Types de Contact", clic en **"Exporter/Importer"**
2. En la sección azul "Exporter les types", clic en **"Télécharger le fichier JSON"**
3. Se descargará un archivo: `tipos-contacto-YYYY-MM-DD.json`
4. Guardar este archivo como respaldo

### Importar Tipos (Restaurar)

1. Abrir el archivo JSON exportado previamente
2. Copiar todo el contenido
3. En "Exporter/Importer", pegar el JSON en el campo de texto
4. Elegir:
   - **"Ajouter (sans dupliquer)"**: Agrega solo tipos nuevos
   - **"Remplacer tout"**: Elimina tipos existentes y carga los del JSON

### Ver Estadísticas

1. En "Gestion des Types de Contact", clic en **"Statistiques"**
2. Se mostrará:
   - Total de tipos
   - Cantidad de predefinidos y personalizados
   - Fechas de creación

---

## 🛡️ Restricciones de Seguridad

### Tipos Restringidos por Departamento

Según la regla de negocio implementada:

- **Entrepôt (Almacén) - ID: "2"**
  - ✅ Puede crear: `donador`, `fournisseur`, `benevole`, `responsable-sante`, `partenaire`, `visiteur`
  - Es el **ÚNICO** departamento que puede gestionar donadores y proveedores

- **Otros departamentos (Direction, Achats, Comptoir, etc.)**
  - ✅ Puede crear: `benevole`, `responsable-sante`, `partenaire`, `visiteur`
  - ❌ **NO** puede crear: `donador`, `fournisseur`

---

## 💾 Estructura de Datos

### Ejemplo de Tipo de Contacto

```json
{
  "id": "tipo-1707914523456-a7b3c9d",
  "code": "chef-cuisine",
  "label": "Chef Cuisine",
  "icon": "Briefcase",
  "color": "#2d9561",
  "bgColor": "#D1FAE5",
  "isPredefined": true,
  "dateCreated": "2025-02-19T14:28:43.456Z"
}
```

### Campos

- **id**: Identificador único generado automáticamente
- **code**: Código único del tipo (usado internamente)
- **label**: Etiqueta visible para el usuario
- **icon**: Nombre del icono de Lucide React
- **color**: Color del icono (hex)
- **bgColor**: Color de fondo (hex)
- **isPredefined**: Siempre `true` para tipos creados (indica que son permanentes)
- **dateCreated**: Fecha y hora de creación (ISO 8601)

---

## 🔍 Verificación Técnica

### Verificar en la Consola del Navegador

```javascript
// Ver todos los tipos guardados
const tipos = JSON.parse(localStorage.getItem('banque_alimentaire_tipos_contacto_personalizados'));
console.table(tipos);

// Ver total de tipos
console.log(`Total de tipos: ${tipos.length}`);

// Ver tipos creados en las últimas 24 horas
const hace24h = new Date(Date.now() - 24*60*60*1000);
const recientes = tipos.filter(t => new Date(t.dateCreated) > hace24h);
console.log(`Tipos creados en las últimas 24h: ${recientes.length}`);
```

### Verificar Persistencia

1. Crear un tipo de contacto nuevo
2. Recargar la página (F5)
3. Volver a abrir "Gestion des Types de Contact"
4. ✅ El tipo debe seguir apareciendo en la lista

---

## 🚨 Solución de Problemas

### Los tipos desaparecen al reiniciar

**Causa posible**: El navegador está en modo privado/incógnito

**Solución**: 
- Usar el navegador en modo normal
- El modo privado borra localStorage al cerrar la ventana

### No puedo crear tipos de donador/fournisseur

**Causa**: Estás en un departamento que no es Entrepôt

**Solución**:
- Solo Entrepôt (Almacén) puede crear estos tipos
- Cambiar al módulo Entrepôt para gestionar estos tipos

### Error al importar JSON

**Causa**: Formato JSON inválido

**Solución**:
- Verificar que el JSON esté bien formado
- Usar un validador JSON online
- Asegurarse de que todos los campos requeridos estén presentes

---

## 📊 Estadísticas del Sistema

Para ver estadísticas completas de los tipos de contacto:

```javascript
// Ejecutar en la consola del navegador
import { obtenerEstadisticasTipos } from './src/app/utils/tiposContactoStorage';
const stats = obtenerEstadisticasTipos();
console.log(stats);
```

O usar el botón **"Statistiques"** en la interfaz.

---

## 🔐 Seguridad y Privacidad

- ✅ Los datos se almacenan **localmente** en el navegador del usuario
- ✅ **NO** se envían a ningún servidor externo
- ✅ Cada usuario tiene sus propios tipos en su navegador
- ✅ Los tipos se mantienen hasta que el usuario:
  - Borre manualmente el localStorage
  - Borre los datos del sitio web
  - Use el botón de importar con "Remplacer tout"

---

## 📝 Buenas Prácticas

1. **Hacer respaldos regulares**: Exportar tipos periódicamente
2. **Usar códigos descriptivos**: Ej: `volontaire-logistique` en vez de `vol1`
3. **Colores consistentes**: Mantener una paleta coherente
4. **Documentar cambios**: Si se modifican tipos, informar al equipo
5. **No duplicar códigos**: El sistema previene duplicados, pero mejor evitarlos

---

## 🎨 Iconos Disponibles

User, UserCheck, UserPlus, Users, Heart, Star, Building, Building2, Briefcase, Stethoscope, ShieldCheck, Award, Crown, Zap, Sparkles, Phone, Mail, MessageCircle, Package, Truck

## 🎨 Colores Disponibles

- Azul: `#1a4d7a` (Primario del sistema)
- Verde: `#2d9561` (Secundario del sistema)
- Rojo: `#DC2626`
- Amarillo: `#F59E0B`
- Púrpura: `#8B5CF6`
- Rosa: `#EC4899`
- Gris: `#6B7280`
- Naranja: `#F97316`
- Índigo: `#4F46E5`
- Turquesa: `#14B8A6`

---

## 📅 Historial de Cambios

### v2.1 - 19 de febrero de 2025
- ✅ Implementada persistencia permanente de tipos
- ✅ Agregado campo `dateCreated` para auditoría
- ✅ Funciones de exportar/importar
- ✅ Estadísticas y reportes
- ✅ Restricción de tipos por departamento

---

## 💡 Próximas Mejoras

- [ ] Sincronización entre dispositivos (requiere backend)
- [ ] Historial de cambios en tipos
- [ ] Tipos compartidos entre usuarios
- [ ] Categorías de tipos
- [ ] Colores e iconos personalizados

---

**✨ Todos los tipos de contacto que crees quedarán guardados permanentemente en tu navegador y estarán disponibles siempre que uses la aplicación.**
