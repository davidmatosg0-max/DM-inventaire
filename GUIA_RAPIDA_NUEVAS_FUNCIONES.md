# ⚡ GUÍA RÁPIDA: Nuevas Funciones - Feuilles de Temps

**Módulo**: Bénévoles → Feuilles de Temps  
**Versión**: 1.0 - 5 mars 2026

---

## 🎯 CÓMO USAR LAS NUEVAS FUNCIONES

### 1️⃣ Registrar solo la ENTRADA (NUEVO)

**Cuándo usar**: Cuando un bénévole llega pero aún no sabes cuándo se irá

```
1. Ir a: Bénévoles → Feuilles de Temps
2. Seleccionar bénévole en "Nom" 
   → ✅ El departamento se llena automáticamente
3. Clic en ⏰ al lado de "ARRIVÉE" para capturar hora actual
4. Clic en botón verde "Entrée"
5. ✅ Listo! La sesión aparece en "Sessions en cours"
```

**Resultado**: Puedes volver más tarde para registrar la salida

---

### 2️⃣ Registrar la SALIDA después

**Cuándo usar**: Cuando un bénévole se va (y ya registraste su entrada)

```
1. Ir a la sección "Sessions en cours"
2. Buscar el bénévole
3. Ver el tiempo transcurrido (ej: "2h 30min écoulé")
4. Clic en botón rojo "Enregistrer Sortie"
5. ✅ Listo! Se calcula automáticamente la duración
```

**Resultado**: La sesión se mueve a "Entrées récentes" con el tiempo total

---

### 3️⃣ Registrar ENTRADA + SALIDA completa

**Cuándo usar**: Cuando registras retroactivamente o tienes ambas horas

```
1. Seleccionar bénévole
2. Ingresar hora de ARRIVÉE (ej: 09:00)
3. Ingresar hora de DÉPART (ej: 16:00)
4. Clic en botón azul "Complet"
5. ✅ Listo! Va directo a "Entrées récentes" con 7h calculadas
```

**Resultado**: Registro completo en un solo paso

---

## 🎨 IDENTIFICAR LOS BOTONES

| Botón | Color | Cuándo usar |
|-------|-------|-------------|
| **🟢 Entrée** | Verde | Solo llegada, salida después |
| **🔵 Complet** | Azul | Entrada + Salida juntas |
| **🔴 Enregistrer Sortie** | Rojo | Completar sesión en curso |

---

## 📋 EJEMPLO PRÁCTICO

**Escenario**: Marie Dupont trabaja hoy

**09:00 AM - Marie llega**
```
✓ Seleccionar: "Marie Dupont"
✓ Departamento: "Distribution" ← Se llenó solo
✓ Clic en ⏰ → Captura 09:00
✓ Clic en "Entrée" 🟢
```

**Durante el día**
```
En "Sessions en cours":
[MD] Marie Dupont
Distribution • 05/03/2026
🟢 09:00  ⏱️ 2h 30min écoulé
[🔴 Enregistrer Sortie]
```

**16:00 PM - Marie se va**
```
✓ Clic en "Enregistrer Sortie" 🔴
✓ Se registra automáticamente 16:00
✓ Calcula: 7h de trabajo
✓ Se mueve a "Entrées récentes"
```

**Resultado final**
```
En "Entrées récentes":
Marie Dupont  Distribution  09:00  16:00  7h
```

---

## ✨ VENTAJAS

### Antes
```
❌ Registrar todo al final del día
❌ Seleccionar departamento manualmente
❌ Calcular duración a mano
❌ No ver quién está trabajando ahora
```

### Después
```
✅ Registrar al llegar y al salir
✅ Departamento se llena automáticamente
✅ Duración calculada automáticamente
✅ Ver sesiones en curso en tiempo real
```

---

## 🔧 TIPS RÁPIDOS

### Tip 1: Captura rápida de hora
```
En lugar de escribir la hora manualmente:
→ Clic en el botón ⏰ al lado del campo
→ Captura automáticamente la hora actual
```

### Tip 2: Cambiar departamento si es necesario
```
Aunque se auto-completó el departamento:
→ Puedes cambiarlo manualmente
→ Solo selecciona otro en el dropdown
```

### Tip 3: Ver quién está trabajando
```
Mira la sección "Sessions en cours"
→ Verás todos los bénévoles actualmente en el lugar
→ Con el tiempo que llevan trabajando
```

### Tip 4: Notas opcionales
```
Puedes agregar notas en cualquier momento:
→ Campo "Notes (optionnel)"
→ Ej: "Tri des dons", "Formation nouveau bénévole"
```

---

## ❓ PREGUNTAS FRECUENTES

**P: ¿Qué pasa si olvido registrar la salida?**  
R: La sesión quedará en "Sessions en cours". Puedes registrar la salida en cualquier momento, incluso al día siguiente.

**P: ¿Puedo cambiar el departamento después del auto-completado?**  
R: Sí, simplemente selecciona otro departamento en el dropdown.

**P: ¿Se guardan las sesiones si recargo la página?**  
R: Sí, todo se guarda en localStorage. Las sesiones en curso se mantienen.

**P: ¿Puedo editar una entrada ya registrada?**  
R: Sí, si tienes permisos de administrador, verás un ícono de edición en cada entrada.

**P: ¿Cuál es la diferencia entre "Entrée" y "Complet"?**  
R: "Entrée" solo registra la llegada (para completar después). "Complet" registra entrada y salida de una vez.

---

## 🎯 CASOS DE USO RÁPIDOS

### Caso 1: Mañana ocupada
```
09:00 → 5 bénévoles llegan
09:05 → Registras las 5 entradas rápidamente
       Clic "Entrée" para cada uno
16:00 → Van saliendo de a poco
       Clic "Enregistrer Sortie" para cada uno
```

### Caso 2: Registro al final del día
```
17:00 → Revisar quiénes trabajaron hoy
       Registrar todo junto
       Usar botón "Complet" para cada uno
```

### Caso 3: Turno corto
```
10:00 → Voluntario llega para turno corto
        Registras entrada
13:00 → Se va después de 3h
        Registras salida
        Sistema calcula: 3h automáticamente
```

---

## 📚 MÁS INFORMACIÓN

- **Documentación completa**: `/FUNCIONALIDAD_ENTRADA_SALIDA_HOJAS_TIEMPO.md`
- **Resumen ejecutivo**: `/RESUMEN_ENTRADA_SALIDA.md`
- **Auto-completado**: `/MEJORA_AUTO_DEPARTAMENTO.md`
- **Resumen de sesión**: `/RESUMEN_SESION_HOJAS_TIEMPO.md`

---

## ✅ CHECKLIST PRIMER USO

- [ ] Abrir Bénévoles → Feuilles de Temps
- [ ] Probar registrar una entrada (botón verde)
- [ ] Ver la sesión en "Sessions en cours"
- [ ] Esperar unos segundos (ver tiempo incrementar)
- [ ] Registrar la salida (botón rojo)
- [ ] Verificar en "Entrées récentes"
- [ ] Probar el auto-completado de departamento
- [ ] Probar registro completo (botón azul)

---

**¡Listo para usar! 🚀**

Si tienes dudas, consulta la documentación completa o prueba con un bénévole de ejemplo.
