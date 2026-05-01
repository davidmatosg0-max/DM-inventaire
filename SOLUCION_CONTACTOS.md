# 🔧 SOLUCIÓN: Contactos no se muestran

## Problema
Los contactos no aparecen en el módulo de Contactos/Almacén debido a que:
1. El sistema estaba usando la key incorrecta de localStorage
2. Los datos de ejemplo no se estaban cargando en el formato correcto

## ✅ Solución Implementada

### 1. Corrección de Storage Key
- **Antes:** `banque_alimentaire_contactos_departamento` ❌
- **Ahora:** `contactos_departamentos` ✅

### 2. Formato Correcto de Datos
Los contactos ahora se guardan con el formato `ContactoDepartamento` correcto:
```typescript
{
  id: string,
  departamentoId: '2', // Entrepôt
  departamentoIds: ['2'],
  tipo: 'benevole' | 'employe' | 'donador' | 'fournisseur',
  nombre: string,
  apellido: string,
  email: string,
  telefono: string,
  fechaNacimiento?: string,
  fechaIngreso: string,
  activo: boolean,
  numeroEmpleado: string,
  direccion: string,
  heuresSemaines: number,
  disponibilidades: DisponibilidadDia[],
  // ... otros campos
}
```

### 3. Datos de Ejemplo Incluidos

#### 👥 BÉNÉVOLES (Voluntarios) - 3 contactos
1. **Sophie Martin** - BDV-2024-001
   - Email: sophie.martin@email.com
   - Teléfono: (514) 555-0101
   - Horas semanales: 8h
   - Departamento: Cocina

2. **Luc Morin** - BDV-2024-002
   - Email: luc.morin@email.com
   - Teléfono: (514) 555-0105
   - Horas semanales: 12h
   - Departamento: Transporte

3. **Isabelle Côté** - BDV-2024-003
   - Email: isabelle.cote@email.com
   - Teléfono: (514) 555-0106
   - Horas semanales: 10h
   - Departamento: Almacén

#### 👔 EMPLOYÉS (Empleados) - 2 contactos
1. **Jean Tremblay** - EMP-2024-001
   - Email: jean.tremblay@bancoalimentos.org
   - Teléfono: (514) 555-0102
   - Puesto: Coordinador de Almacén
   - Horario: Tiempo completo (40h)

2. **Claire Lefebvre** - EMP-2024-002
   - Email: claire.lefebvre@bancoalimentos.org
   - Teléfono: (514) 555-0107
   - Puesto: Directora Administrativa
   - Horario: Tiempo completo (40h)

#### 🎁 DONATEURS (Donadores) - 3 contactos
1. **Supermarchés Metro** - DON-2024-001
   - Email: dons@metro.ca
   - Teléfono: (514) 555-0201
   - Empresa: Metro Plus Laval
   - Tipo: Supermarché
   - Dirección: 1000 Boulevard Industriel, Laval, QC

2. **IGA Laval** - DON-2024-002
   - Email: contact@iga-laval.ca
   - Teléfono: (514) 555-0202
   - Empresa: IGA Extra
   - Tipo: Supermarché
   - Dirección: 2500 Boulevard Saint-Martin Ouest, Laval, QC

3. **Boulangerie Le Fournil** - DON-2024-003
   - Email: info@lefournil.ca
   - Teléfono: (514) 555-0203
   - Empresa: Le Fournil Artisan
   - Tipo: Boulangerie
   - Dirección: 850 Rue Principale, Laval, QC

#### 🛒 FOURNISSEURS (Vendedores) - 2 contactos
1. **Distribution Alimentaire QC** - VND-2024-001
   - Email: ventes@distalim-qc.ca
   - Teléfono: (514) 555-0301
   - Empresa: Dist-Alim QC Inc.
   - Tipo: Distributeur en gros
   - Dirección: 3200 Boulevard Industriel, Laval, QC

2. **Aliments Secs Laval** - VND-2024-002
   - Email: commandes@aliments-secs.ca
   - Teléfono: (514) 555-0302
   - Empresa: Aliments Secs Laval
   - Tipo: Fournisseur alimentaire
   - Dirección: 1800 Rue Commerciale, Laval, QC

**Total: 10 contactos predefinidos listos para usar! 🎉**

## 🚀 Cómo Ver los Contactos

### Opción 1: Recargar la Aplicación (Recomendado)
1. Abrir la consola del navegador (F12)
2. Ejecutar:
   ```javascript
   localStorage.removeItem('datos_ejemplo_inicializados');
   localStorage.removeItem('contactos_departamentos');
   setTimeout(() => location.reload(), 500);
   ```
3. La página recargará automáticamente
4. Verás en consola: "✅ Usuarios Internos cargados: 10"

### Opción 2: Verificar Datos en Console
```javascript
// Ver todos los contactos
const contactos = JSON.parse(localStorage.getItem('contactos_departamentos') || '[]');
console.table(contactos);

// Ver contactos del departamento 1 (Entrepôt)
const contactosEntrepot = contactos.filter(c => c.departamentoId === '1');
console.table(contactosEntrepot);
console.log('Total en Entrepôt:', contactosEntrepot.length);
```

### Opción 3: Forzar Reinicio Completo
```javascript
// En la consola del navegador
localStorage.clear();
location.reload();
```

## 📍 Dónde Ver los Contactos

1. **Módulo Departamentos** → Seleccionar "Entrepôt" (ID: 1)
2. **Módulo Contactos Almacén** (desde el sidebar o menú)
3. Deberías ver:
   - Contador "Bénévole": 3
   - Contador "Employé": 2  
   - Contador "Donateur": 3
   - Contador "Fournisseur": 2

## 🔍 Verificación

### Checklist de Verificación
- [ ] Abrir consola (F12)
- [ ] Ejecutar: `localStorage.removeItem('datos_ejemplo_inicializados')`
- [ ] Recargar página (F5)
- [ ] Ver mensaje en consola: "✅ Usuarios Internos cargados: 10"
- [ ] Ir a módulo "Contactos Almacén"
- [ ] Ver los contadores actualizados (no en 0)
- [ ] Ver lista de contactos

### Si Aún No Aparecen
```javascript
// Ejecutar en consola para diagnóstico
console.log('=== DIAGNÓSTICO DE CONTACTOS ===');
console.log('1. Flag inicialización:', localStorage.getItem('datos_ejemplo_inicializados'));
console.log('2. Storage key actual:', localStorage.getItem('contactos_departamentos') ? 'Existe' : 'No existe');
console.log('3. Cantidad de contactos:', JSON.parse(localStorage.getItem('contactos_departamentos') || '[]').length);
console.log('4. Contactos del departamento 2:', JSON.parse(localStorage.getItem('contactos_departamentos') || '[]').filter(c => c.departamentoId === '2').length);
```

## 🎯 Archivos Modificados

1. **`/src/app/utils/inicializarDatosEjemplo.ts`**
   - Corregido storage key
   - Formato correcto de ContactoDepartamento
   - Agregado campo `disponibilidades`

2. **`/src/app/App.tsx`**
   - Agregada inicialización automática de datos
   - Mensajes en consola para debug
   - Instrucciones para reiniciar

## 💡 Notas Importantes

1. Los contactos se cargan en el **Departamento 2 (Entrepôt)** por defecto
2. El sistema usa `contactos_departamentos` como storage key (sin prefijo)
3. Los datos solo se cargan UNA VEZ (flag `datos_ejemplo_inicializados`)
4. Para recargar datos: eliminar el flag y recargar página

## 📞 Soporte

Si después de seguir estos pasos los contactos aún no aparecen:
1. Verificar la consola en busca de errores
2. Ejecutar el script de diagnóstico
3. Verificar que el módulo está en el departamento correcto
4. Revisar el filtro de búsqueda (puede estar filtrando los resultados)

---

**¡Los contactos deberían aparecer ahora! 🎉**