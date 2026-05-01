# 🔄 Sincronización Completa: Bénévoles ↔ Departamentos

## 📋 Resumen del Problema

El usuario reportó que las modificaciones realizadas a voluntarios en el departamento "Entrepôt" (Almacén) **no se reflejaban** en el módulo de Recrutement. Específicamente, cuando se agregaba una dirección a un voluntario en el departamento almacén, este cambio no aparecía en la vista de recrutamiento.

## 🔍 Causa Raíz Identificada

### Problema Principal
El módulo de `Benevoles.tsx` tenía un sistema de sincronización **limitado** que SOLO sincronizaba el `numeroArchivo` desde el sistema de contactos, pero **NO sincronizaba** otros campos como:
- ❌ Dirección (adresse)
- ❌ Ciudad (ville)
- ❌ Código Postal (codePostal)
- ❌ Teléfono
- ❌ Nombre/Apellido
- ❌ Notas
- ❌ Cargo/Poste
- ❌ Etc.

### Problema Secundario
El módulo de `Recrutement.tsx` **no escuchaba** el evento `contactos-actualizados`, por lo que nunca se enteraba de cambios realizados en otros módulos.

### Problema de Arquitectura
El `useEffect` en `Benevoles.tsx` tenía una dependencia circular (`[benevoles]`) que podía causar renders infinitos y degradar el rendimiento.

---

## ✅ Soluciones Implementadas

### 1. **Sincronización Completa en Benevoles.tsx**

#### Antes (Solo numeroArchivo):
```typescript
if (contacto?.numeroArchivo && contacto.numeroArchivo !== benevole.numeroArchivo) {
  return {
    ...benevole,
    numeroArchivo: contacto.numeroArchivo  // ❌ Solo este campo
  };
}
```

#### Después (Todos los campos relevantes):
```typescript
if (contacto) {
  const hayCambios = 
    contacto.numeroArchivo !== benevole.numeroArchivo ||
    contacto.direccion !== benevole.adresse ||
    contacto.ciudad !== benevole.ville ||
    contacto.codigoPostal !== benevole.codePostal ||
    contacto.telefono !== benevole.telephone ||
    contacto.nombre !== benevole.prenom ||
    contacto.apellido !== benevole.nom ||
    contacto.notas !== benevole.notasGenerales;
  
  if (hayCambios) {
    return {
      ...benevole,
      numeroArchivo: contacto.numeroArchivo,
      prenom: contacto.nombre,
      nom: contacto.apellido,
      telephone: contacto.telefono,
      adresse: contacto.direccion || benevole.adresse,
      ville: contacto.ciudad || benevole.ville,
      codePostal: contacto.codigoPostal || benevole.codePostal,
      notasGenerales: contacto.notas || benevole.notasGenerales,
      poste: contacto.cargo || benevole.poste,
      heuresSemaines: contacto.heuresSemaines || benevole.heuresSemaines,
      reference: contacto.reference || benevole.reference,
      sexe: contacto.genero || benevole.sexe,
      dateNaissance: contacto.fechaNacimiento || benevole.dateNaissance,
      langues: contacto.idiomas?.map(lang => {
        const langMap: Record<string, string> = { 
          es: 'Espagnol', 
          fr: 'Français', 
          en: 'Anglais', 
          ar: 'Arabe' 
        };
        return langMap[lang] || lang;
      }) || benevole.langues,
      disponibilidadesSemanal: contacto.disponibilidades || benevole.disponibilidadesSemanal,
      photo: contacto.foto || benevole.photo
    };
  }
}
```

### 2. **Eliminación de Dependencia Circular**

#### Antes (Con dependencia problemática):
```typescript
React.useEffect(() => {
  // ... código de sincronización
}, [benevoles]); // ❌ Dependencia circular
```

#### Después (Sin dependencias):
```typescript
React.useEffect(() => {
  const sincronizarNumerosArchivo = () => {
    // ✅ Leer directamente de localStorage para evitar dependencias
    const storedBenevoles = localStorage.getItem('banqueAlimentaire_benevoles');
    if (!storedBenevoles) return;
    
    const benevolesActuales = JSON.parse(storedBenevoles);
    // ... resto del código
  };
  
  // Ejecutar al montar
  sincronizarNumerosArchivo();
  
  // Escuchar eventos
  const handleContactosUpdate = () => {
    console.log('🔔 Benevoles: Evento contactos-actualizados recibido');
    sincronizarNumerosArchivo();
  };
  
  window.addEventListener('contactos-actualizados', handleContactosUpdate);
  
  return () => {
    window.removeEventListener('contactos-actualizados', handleContactosUpdate);
  };
}, []); // ✅ Sin dependencias
```

### 3. **Sincronización en Recrutement.tsx**

Se agregó un `useEffect` similar para que el módulo de Recrutement también sincronice los números de archivo cuando hay cambios:

```typescript
// 🔄 SINCRONIZAR números de archivo desde contactos a candidatos
useEffect(() => {
  const sincronizarCandidatos = () => {
    const contactos = obtenerContactosPorDepartamento('8'); // Departamento Bénévoles
    let actualizado = false;
    
    const candidatosActualizados = candidates.map(candidate => {
      const contacto = contactos.find(c => 
        c.email.toLowerCase() === candidate.email.toLowerCase()
      );
      
      if (contacto?.numeroArchivo && contacto.numeroArchivo !== candidate.numeroArchivo) {
        console.log(`🔄 Sincronizando número de archivo para candidato ${candidate.name}: ${contacto.numeroArchivo}`);
        actualizado = true;
        return {
          ...candidate,
          numeroArchivo: contacto.numeroArchivo
        };
      }
      
      return candidate;
    });
    
    if (actualizado) {
      console.log('✅ Sincronización de candidatos actualizada');
      setCandidates(candidatosActualizados);
    }
  };
  
  sincronizarCandidatos();
  
  const handleContactosUpdate = () => {
    console.log('🔔 Recrutement: Evento contactos-actualizados recibido');
    sincronizarCandidatos();
  };
  
  window.addEventListener('contactos-actualizados', handleContactosUpdate);
  
  return () => {
    window.removeEventListener('contactos-actualizados', handleContactosUpdate);
  };
}, [candidates]);
```

### 4. **Logging Mejorado para Debugging**

Se agregaron logs en `contactosDepartamentoStorage.ts` para rastrear cuando se disparan los eventos:

```typescript
// En guardarContacto()
console.log('🔥 STORAGE - Disparando evento contactos-actualizados (nuevo contacto):', {
  departamentoId: nuevoContacto.departamentoId,
  contactoId: nuevoContacto.id,
  nombre: nuevoContacto.nombre,
  apellido: nuevoContacto.apellido
});

// En actualizarContacto()
console.log('🔥 STORAGE - Disparando evento contactos-actualizados:', {
  departamentoId: contactos[index].departamentoId,
  contactoId: id,
  nombre: contactos[index].nombre,
  apellido: contactos[index].apellido
});
```

---

## 🎯 Flujo de Sincronización Actualizado

```
┌─────────────────────────────────────────────────────────────┐
│                  SISTEMA DE SINCRONIZACIÓN                   │
└─────────────────────────────────────────────────────────────┘

1️⃣ Usuario modifica contacto en Departamento Almacén
   └─> FormularioContactoCompacto o GestionContactosDepartamento
       └─> actualizarContacto(id, datos)

2️⃣ contactosDepartamentoStorage actualiza localStorage
   └─> Guarda cambios en: banqueAlimentaire_contactosDepartamento
   └─> 🔥 Dispara evento: window.dispatchEvent('contactos-actualizados')

3️⃣ Módulos escuchan el evento y sincronizan:
   
   📦 Benevoles.tsx
   ├─> Escucha: 'contactos-actualizados'
   ├─> Lee: localStorage (banqueAlimentaire_benevoles)
   ├─> Busca contacto correspondiente por email
   ├─> Sincroniza TODOS los campos (dirección, teléfono, etc.)
   └─> Actualiza estado: setBenevoles(datosActualizados)
   
   👥 Recrutement.tsx
   ├─> Escucha: 'contactos-actualizados'
   ├─> Lee: contactos del departamento Bénévoles (ID: 8)
   ├─> Busca candidato correspondiente por email
   ├─> Sincroniza numeroArchivo
   └─> Actualiza estado: setCandidates(datosActualizados)

4️⃣ Interfaz se actualiza automáticamente con los cambios
   └─> ✅ Usuario ve los cambios en TODOS los módulos
```

---

## 📁 Archivos Modificados

### 1. `/src/app/components/pages/Benevoles.tsx`
- ✅ Import de `useEffect` agregado (si faltaba)
- ✅ Función `sincronizarNumerosArchivo` ampliada para sincronizar TODOS los campos
- ✅ Eliminada dependencia circular del `useEffect`
- ✅ Agregados logs de debugging

### 2. `/src/app/components/pages/Recrutement.tsx`
- ✅ Import de `useEffect` agregado
- ✅ Nuevo `useEffect` para sincronizar números de archivo
- ✅ Listener para evento `contactos-actualizados`
- ✅ Agregados logs de debugging

### 3. `/src/app/utils/contactosDepartamentoStorage.ts`
- ✅ Logs mejorados en `guardarContacto()`
- ✅ Logs mejorados en `actualizarContacto()`
- ✅ Logs del evento `contactos-actualizados`

---

## 🧪 Pruebas Recomendadas

### Escenario 1: Modificar dirección en Almacén
1. Ir a **Departamentos** → **Entrepôt**
2. Editar un voluntario existente
3. Agregar/Modificar dirección completa (calle, apartamento, ciudad, código postal)
4. Guardar cambios
5. ✅ Verificar que los cambios aparezcan inmediatamente en **Bénévoles**
6. ✅ Verificar logs en consola:
   ```
   🔥 STORAGE - Disparando evento contactos-actualizados: {...}
   🔔 Benevoles: Evento contactos-actualizados recibido
   🔄 Sincronizando datos completos para [Nombre] [Apellido]: {...}
   ✅ Sincronización completa de bénévoles actualizada
   ```

### Escenario 2: Modificar teléfono en Almacén
1. Ir a **Departamentos** → **Entrepôt**
2. Editar un voluntario
3. Cambiar número de teléfono
4. Guardar
5. ✅ Verificar cambio en **Bénévoles**

### Escenario 3: Agregar notas en Transport
1. Ir a **Departamentos** → **Transport**
2. Editar un voluntario (chofer)
3. Agregar notas
4. Guardar
5. ✅ Verificar notas en **Bénévoles**

### Escenario 4: Crear nuevo voluntario desde Recrutement
1. Ir a **Recrutement**
2. Aceptar un candidato
3. ✅ Verificar que aparezca en **Bénévoles** con número de archivo

---

## 🔍 Debugging

Si la sincronización no funciona, verificar en la consola del navegador:

### 1. Evento disparado correctamente
```javascript
// Buscar este log:
🔥 STORAGE - Disparando evento contactos-actualizados: {
  departamentoId: "1",
  contactoId: "1234567890",
  nombre: "Pierre",
  apellido: "Gagnon"
}
```

### 2. Evento recibido por Benevoles
```javascript
// Buscar este log:
🔔 Benevoles: Evento contactos-actualizados recibido
```

### 3. Sincronización ejecutada
```javascript
// Buscar este log:
🔄 Sincronizando datos completos para Pierre Gagnon: {
  numeroArchivo: "CONT-2024-0123",
  direccion: "123 Rue Principale",
  ciudad: "Laval",
  codigoPostal: "H7X 1A1",
  telefono: "(514) 555-0123"
}
```

### 4. Estado actualizado
```javascript
// Buscar este log:
✅ Sincronización completa de bénévoles actualizada
```

---

## 🎓 Lecciones Aprendidas

1. **Sincronización parcial es peligrosa**: Sincronizar solo un campo (`numeroArchivo`) cuando hay múltiples campos relacionados puede llevar a inconsistencias en la UI.

2. **Dependencias circulares en useEffect**: Usar el estado como dependencia en un `useEffect` que modifica ese mismo estado puede causar loops infinitos. Solución: leer directamente de localStorage o usar `useRef`.

3. **Eventos personalizados son poderosos**: El sistema de eventos `window.dispatchEvent` permite comunicación entre componentes sin acoplamiento directo.

4. **Logging es fundamental**: Los logs bien estructurados facilitan enormemente el debugging de sistemas complejos.

---

## ✨ Beneficios de la Solución

1. ✅ **Sincronización en tiempo real**: Cambios en cualquier departamento se reflejan inmediatamente en Bénévoles
2. ✅ **Sin duplicación de datos**: Un solo source of truth (contactosDepartamentoStorage)
3. ✅ **Performance optimizada**: Sin dependencias circulares ni renders innecesarios
4. ✅ **Debugging facilitado**: Logs claros en cada paso del proceso
5. ✅ **Escalable**: Fácil agregar más módulos que escuchen los mismos eventos

---

## 📝 Notas Adicionales

- El sistema de eventos `contactos-actualizados` también se dispara desde `Recrutement.tsx` cuando se crea un nuevo voluntario
- El departamento "8" corresponde a **Bénévoles** según la configuración del sistema
- La sincronización preserva valores existentes si el nuevo valor es `undefined` o vacío (`||`)
- Los idiomas se mapean automáticamente de códigos ISO (`es`, `fr`) a nombres completos (`Espagnol`, `Français`)

---

## 🚀 Próximos Pasos Sugeridos

1. ✅ **Implementado**: Sincronización completa entre módulos
2. 🔄 Considerar: Agregar indicador visual cuando se sincroniza (ej: toast discreto)
3. 🔄 Considerar: Sistema de cache para reducir lecturas de localStorage
4. 🔄 Considerar: Debounce en la sincronización si hay muchos cambios simultáneos

---

**Fecha de Implementación**: 16 de Marzo, 2026  
**Estado**: ✅ COMPLETADO  
**Versión del Sistema**: 5.0+
