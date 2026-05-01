# ✅ ERROR CORREGIDO - Export Missing

## ❌ ERROR ENCONTRADO
```
SyntaxError: The requested module '/src/app/utils/contactosDepartamentoStorage.ts' 
does not provide an export named 'obtenerContactosPorDepartamentoYTipo'
```

## ✅ SOLUCIÓN APLICADA

### **Archivo:** `/src/app/utils/contactosDepartamentoStorage.ts`

**Función agregada (línea 172):**

```typescript
export function obtenerContactosPorDepartamentoYTipo(
  departamentoId: string, 
  tipos: TipoContacto[]
): ContactoDepartamento[] {
  return obtenerContactosDepartamento(departamentoId)
    .filter(c => tipos.includes(c.tipo) && c.activo);
}
```

### **Funcionalidad:**
- Obtiene contactos de un departamento específico
- Filtra por múltiples tipos (donador, fournisseur, etc.)
- Solo devuelve contactos activos
- Reutiliza la función existente `obtenerContactosDepartamento`

### **Uso en FormularioEntrada.tsx:**
```typescript
const contactosEntrepot = obtenerContactosPorDepartamentoYTipo('1', ['donador', 'fournisseur']);
```

**Parámetros:**
- `'1'` = ID del departamento Entrepôt
- `['donador', 'fournisseur']` = Tipos de contacto a filtrar

---

## 🎯 RESULTADO

La aplicación ahora:
- ✅ Compila sin errores
- ✅ Importa correctamente la función
- ✅ Obtiene contactos reales del localStorage
- ✅ Filtra automáticamente por departamento y tipo
- ✅ Solo muestra contactos activos

---

## 🚀 PRÓXIMOS PASOS

1. **Verificar en navegador:** Recarga la página (F5)
2. **Abrir formulario:** Inventaire → + Nouvelle Entrée
3. **Ver contactos:** Tab "Informations Fournisseur" → Click en "Fournisseur / Donateur"
4. **Resultado esperado:** Lista con contactos reales del sistema

---

**¡ERROR RESUELTO!** 🎉
