# Ejemplos Funcionales Para Probar La App

Este workspace ahora permite gestionar los ejemplos funcionales desde la UI:

1. Inicia sesion con un usuario desarrollador.
2. Ve a Configuration.
3. Abre la pestaña QA.
4. Usa Charger les exemples, Actualiser le resume o Nettoyer les exemples.

Tambien siguen disponibles tres comandos en la consola del navegador de la app:

1. sembrarEjemplosFuncionalesPrueba()
2. verEjemplosFuncionalesPrueba()
3. limpiarEjemplosFuncionalesPrueba()

## Uso rapido

1. Inicia la app.
2. Inicia sesion.
3. Opcion A: ve a Configuration > QA y pulsa Charger les exemples.
4. Opcion B: abre las herramientas del navegador y ejecuta sembrarEjemplosFuncionalesPrueba().
5. Revisa los modulos indicados abajo.

## Datos que se crean

### Benevole

- Camila Rojas
- Email: camila.rojas@demo.qa.local
- Departamentos: Cuisine y Entrepot
- Rol sugerido para probar: tri, preparation y apoyo de inventario

Pruebas sugeridas:

1. Departamentos o Benevoles: validar ficha, filtros y disponibilidad.
2. Verificar idiomas, certificaciones y departamentos multiples.

### Donateur

- Boulangerie Solidaire Laval
- Contacto: Sophie Boulanger
- Email: sophie.boulanger@demo.qa.local
- Productos sugeridos: boulangerie y frescos

Pruebas sugeridas:

1. Entrepot > Donateurs & Fournisseurs: validar listado y filtros.
2. Inventario > Nueva Entrada: seleccionar programa DON y comprobar que aparece como donateur.

### Fournisseur

- Marche Nord Distribution
- Contacto: Jean Mercier
- Email: jean.mercier@demo.qa.local
- Productos sugeridos: epicerie seche y laitiers

Pruebas sugeridas:

1. Entrepot > Donateurs & Fournisseurs: validar listado.
2. Inventario > Nueva Entrada: seleccionar programa ACH y comprobar que aparece como fournisseur.

### Chauffeurs

- Marc Tremblay
- Sara Nguyen

Pruebas sugeridas:

1. Transporte > Choferes: validar CRUD y asignacion.
2. Confirmar que cada chofer ya queda ligado a un vehiculo de ejemplo.

### Camiones

- QA-DEMO-CAM-001: camion seco
- QA-DEMO-REF-002: camion refrigerado

Pruebas sugeridas:

1. Transporte > Vehiculos: validar capacidad, estado y mantenimiento.
2. Planificacion de rutas: usar el camion seco para rutas regulares y el refrigerado para cadena de frio.

### Organismes

- Maison des Familles Horizon
- Centre Jeunesse Soleil PRS

Pruebas sugeridas:

1. Organismos o Liaison: validar ficha, contacto y estado.
2. Transporte > Rutas: comprobar que salen como destinos.
3. Verificar un caso regular y un caso PRS.

## Limpieza

Cuando termines, ejecuta limpiarEjemplosFuncionalesPrueba() para quitar solo estos ejemplos demo.