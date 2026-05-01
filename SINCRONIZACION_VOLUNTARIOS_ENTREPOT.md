# 🔄 SINCRONIZACIÓN AUTOMÁTICA DE VOLUNTARIOS ENTREPÔT

## 📋 ¿QUÉ ES?

El sistema ahora sincroniza **automáticamente** todos los bénévoles (voluntarios) que están asignados al departamento **Entrepôt** en la lista de reclutamiento hacia la sección de **Contactos del Almacén**.

## ✨ CARACTERÍSTICAS

### 🔄 Sincronización Automática

1. **Al iniciar el sistema**: 
   - Se ejecuta una sincronización automática 2 segundos después de cargar
   - Revisa todos los bénévoles asignados a Entrepôt
   - Los crea/actualiza automáticamente en Contactos

2. **Al asignar departamentos**:
   - Cuando asignas un bénévole a "Entrepôt" desde el módulo Recrutement
   - Se sincroniza automáticamente en 500ms
   - Aparece un mensaje de confirmación

3. **Al detectar cambios**:
   - El sistema detecta cambios en la lista de bénévoles
   - Sincroniza automáticamente cuando hay modificaciones

### 🔘 Sincronización Manual

Puedes sincronizar manualmente desde:

1. **Contactos del Almacén**:
   - Ve a Departamentos → Entrepôt (Contactos)
   - Haz clic en el botón **"Synchroniser Bénévoles"**
   - Los bénévoles se sincronizan instantáneamente

2. **Consola del navegador**:
   ```javascript
   sincronizarVoluntariosEntrepot()
   ```

## 🎯 ¿CÓMO FUNCIONA?

### Paso 1: Detectar Bénévoles de Entrepôt

El sistema busca todos los bénévoles que tienen:
- Campo `departement` que contiene: "Entrepôt", "Entrepot", "Almacén", "Almacen", o "Warehouse"
- Funciona con múltiples departamentos (ej: "Entrepôt, Comptoir")

### Paso 2: Convertir a Contacto

Para cada bénévole encontrado, el sistema:

1. **Verifica si ya existe** un contacto con el mismo email
   - Si existe: **ACTUALIZA** el contacto existente
   - Si no existe: **CREA** un nuevo contacto

2. **Mapea los datos**:
   ```
   Bénévole                    →  Contacto
   ─────────────────────────────────────────────────
   prenom                      →  nombre
   nom                         →  apellido
   email                       →  email
   telephone                   →  telefono
   tipo (benevole/employe)     →  tipo (benevole/employe)
   departement                 →  departamentoId = '2' (Entrepôt)
   disponibilidadesSemanal     →  disponibilidades
   langues                     →  idiomas
   photo                       →  foto
   adresse, ville, codePostal  →  direccion, ciudad, codigoPostal
   poste                       →  cargo
   heuresSemaines              →  heuresSemaines
   reference                   →  reference
   identifiant                 →  numeroEmpleado
   statut                      →  activo (true si 'actif')
   ```

3. **Preserva documentos**:
   - Si el bénévole tiene documentos adjuntos
   - Se copian automáticamente al contacto

## 📊 MENSAJES DEL SISTEMA

### ✅ Mensajes de Éxito

```
🔄 ═══════════════════════════════════════════════════════════
🔄 SINCRONIZACIÓN DE VOLUNTARIOS ENTREPÔT → CONTACTOS
🔄 ═══════════════════════════════════════════════════════════

📊 Total de bénévoles en sistema: 25
📦 Bénévoles asignados a Entrepôt: 12

🔄 [1/12] Sincronizando: Jean Dupont
✅ Contacto actualizado: Jean Dupont (jean.dupont@email.com)

🔄 [2/12] Sincronizando: Marie Leblanc
✅ Nuevo contacto creado: Marie Leblanc (marie.leblanc@email.com)

...

📊 RESUMEN DE SINCRONIZACIÓN:
   Total procesados: 12
   ✅ Sincronizados exitosamente: 12
   ❌ Errores: 0

🔄 ═══════════════════════════════════════════════════════════
```

### ℹ️ Mensaje Informativo

Si no hay bénévoles asignados a Entrepôt:

```
ℹ️ No hay bénévoles asignados a Entrepôt para sincronizar

Sugerencia: Ve a Recrutement y asigna bénévoles al departamento Entrepôt
```

### ⚠️ Mensajes de Error

Si hay problemas al sincronizar un bénévole específico:

```
❌ Error al sincronizar bénévole Jean Dupont: [detalles del error]
```

## 🔧 CONFIGURACIÓN

### Archivos Modificados

1. **`/src/app/utils/sincronizarVoluntariosEntrepot.ts`** (NUEVO)
   - Contiene toda la lógica de sincronización
   - Funciones exportadas al objeto `window`

2. **`/src/app/App.tsx`**
   - Importa y ejecuta `inicializarSincronizacionAutomatica()`
   - Se ejecuta al cargar la aplicación

3. **`/src/app/components/pages/Benevoles.tsx`**
   - Sincroniza automáticamente al asignar departamentos
   - Guarda en ambas claves de localStorage

4. **`/src/app/components/pages/ContactosAlmacen.tsx`**
   - Botón "Synchroniser Bénévoles" agregado
   - Muestra mensajes de confirmación

5. **`/src/app/components/pages/Departamentos.tsx`**
   - Importa función de sincronización (disponible para uso futuro)

### Claves de localStorage

El sistema verifica las siguientes claves:

- **`banqueAlimentaire_benevoles`**: Lista de bénévoles
- **`contactos_departamento`**: Lista de contactos de todos los departamentos

## 🎓 CASOS DE USO

### Caso 1: Nuevo Bénévole para Entrepôt

1. Ve a **Recrutement** (Gestion Bénévoles)
2. Haz clic en **"+ Nouveau Bénévole"**
3. Llena el formulario
4. En **Département**, selecciona **"Entrepôt"**
5. Guarda el bénévole
6. **AUTOMÁTICAMENTE** aparecerá en Contactos del Almacén

### Caso 2: Asignar Bénévole Existente a Entrepôt

1. Ve a **Recrutement**
2. Busca el bénévole en la lista
3. Haz clic en **"Assigner à Département"** (ícono de edificio)
4. Selecciona **"Entrepôt"**
5. Guarda
6. **AUTOMÁTICAMENTE** se sincroniza en 500ms
7. Verás el mensaje: "✅ Bénévole synchronisé automatiquement vers Contacts Entrepôt"

### Caso 3: Actualizar Información de Bénévole

1. Ve a **Recrutement**
2. Edita el bénévole (cambias teléfono, email, etc.)
3. Guarda los cambios
4. **AUTOMÁTICAMENTE** se actualiza en Contactos del Almacén
5. Los cambios se reflejan en ambos lugares

### Caso 4: Sincronización Manual Forzada

1. Ve a **Departamentos** → **Entrepôt** (Contactos)
2. Haz clic en **"Synchroniser Bénévoles"**
3. El sistema:
   - Revisa TODOS los bénévoles asignados a Entrepôt
   - Crea/actualiza los contactos correspondientes
   - Muestra un resumen

### Caso 5: Múltiples Departamentos

Si un bénévole está asignado a múltiples departamentos:

```
Ejemplo: "Entrepôt, Comptoir, Cuisine"
```

El sistema:
- Lo sincroniza en Contactos de Entrepôt (departamentoId = '2')
- Mantiene la información de múltiples departamentos en `departamentoIds`
- El contacto aparece en Entrepôt con referencia a sus otros departamentos

## 🔍 VERIFICACIÓN

### Ver Sincronización en Consola

Abre la consola del navegador (F12) y verás:

```javascript
🔄 Ejecutando sincronización inicial de voluntarios Entrepôt...
🔄 ═══════════════════════════════════════════════════════════
🔄 SINCRONIZACIÓN DE VOLUNTARIOS ENTREPÔT → CONTACTOS
🔄 ═══════════════════════════════════════════════════════════

📊 Total de bénévoles en sistema: 25
📦 Bénévoles asignados a Entrepôt: 12

✅ Contacto actualizado: Jean Dupont
✅ Contacto actualizado: Marie Leblanc
...

📊 RESUMEN DE SINCRONIZACIÓN:
   Total procesados: 12
   ✅ Sincronizados exitosamente: 12
   ❌ Errores: 0
```

### Verificar Contactos Sincronizados

1. Ve a **Departamentos** → **Entrepôt** (Contactos)
2. Deberías ver todos los bénévoles asignados a Entrepôt
3. Filtra por tipo "Bénévole" para verlos todos juntos
4. Verifica que la información esté completa

### Funciones de Consola Disponibles

```javascript
// Ejecutar sincronización manual
sincronizarVoluntariosEntrepot()

// Inicializar listener de cambios
inicializarSincronizacionAutomatica()

// Ver resultado detallado
const resultado = sincronizarVoluntariosEntrepot()
console.log(resultado)
// Retorna:
// {
//   total: 12,
//   sincronizados: 12,
//   errores: 0,
//   detalles: [
//     "✅ Jean Dupont (jean.dupont@email.com)",
//     "✅ Marie Leblanc (marie.leblanc@email.com)",
//     ...
//   ]
// }
```

## 🚨 TROUBLESHOOTING

### Problema: Bénévole no aparece en Contactos

**Solución 1**: Verificar asignación de departamento
```
1. Ve a Recrutement
2. Busca el bénévole
3. Verifica que el campo "Département" incluya "Entrepôt"
```

**Solución 2**: Sincronización manual
```
1. Ve a Contactos del Almacén
2. Haz clic en "Synchroniser Bénévoles"
3. Verifica el mensaje de confirmación
```

**Solución 3**: Consola
```javascript
// Ver todos los bénévoles
const benevoles = JSON.parse(localStorage.getItem('banqueAlimentaire_benevoles') || '[]')
console.log('Bénévoles:', benevoles)

// Ver cuáles están asignados a Entrepôt
const entrepot = benevoles.filter(b => 
  b.departement && b.departement.toLowerCase().includes('entrepôt')
)
console.log('Bénévoles Entrepôt:', entrepot)

// Forzar sincronización
sincronizarVoluntariosEntrepot()
```

### Problema: Información desactualizada

**Causa**: El contacto fue creado antes de editar el bénévole

**Solución**:
```
1. Haz clic en "Synchroniser Bénévoles"
2. La sincronización ACTUALIZA contactos existentes
3. La información se actualizará automáticamente
```

### Problema: Duplicados

**Prevención**: El sistema verifica el email antes de crear

- Si el email ya existe → ACTUALIZA
- Si el email es nuevo → CREA

**Solución si hay duplicados**:
```
1. Ve a Contactos del Almacén
2. Busca el contacto duplicado
3. Elimina uno de los duplicados
4. Ejecuta "Synchroniser Bénévoles" para recrearlo correctamente
```

## 📈 ESTADÍSTICAS

El sistema te muestra:

- **Total de bénévoles** en el sistema
- **Bénévoles asignados a Entrepôt**
- **Sincronizados exitosamente**
- **Errores** (si los hay)

Ejemplo de salida completa:

```
📊 RESUMEN DE SINCRONIZACIÓN:
   Total procesados: 12
   ✅ Sincronizados exitosamente: 12
   ❌ Errores: 0
```

## 🎯 BENEFICIOS

1. **Automatización Total**: No necesitas copiar/pegar información manualmente
2. **Sincronización Bidireccional**: Editas en Recrutement, se actualiza en Contactos
3. **Sin Duplicados**: El sistema verifica emails antes de crear
4. **Preservación de Datos**: Documentos, fotos, notas se copian automáticamente
5. **Trazabilidad**: Logs detallados de cada sincronización
6. **Control Manual**: Puedes forzar sincronización cuando quieras

## 🔐 SEGURIDAD

- ✅ No elimina contactos existentes
- ✅ Solo actualiza campos relevantes
- ✅ Preserva información adicional del contacto
- ✅ Verifica duplicados por email
- ✅ Logs detallados en consola para auditoría

---

**Fecha de implementación**: 11 de marzo de 2025  
**Versión**: 1.0  
**Estado**: ✅ ACTIVO Y FUNCIONAL
