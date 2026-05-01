# Pruebas manuales del modulo Transporte

## Alcance

Estas pruebas cubren la logica corregida del modulo Transporte actual:
- persistencia local de vehiculos
- persistencia local de rutas
- persistencia local de choferes
- actualizacion de KPIs en la cabecera principal de Transporte

## Prueba 1. Alta de vehiculo

Objetivo: comprobar que un vehiculo nuevo se agrega al listado y actualiza el KPI superior.

Pasos:
1. Abrir Transporte.
2. Ir a la pestana Vehiculos.
3. Crear un vehiculo con estos datos:
   - Tipo: camion
   - Placa: TR-901
   - Marca: Ford
   - Modelo: Transit
   - Capacidad Kg: 2500
   - Capacidad m3: 14
   - Estado: disponible
4. Guardar.
5. Volver a la cabecera principal del modulo.
6. Recargar la pagina.

Resultado esperado:
- El vehiculo aparece en la grilla.
- El KPI Total Vehicles aumenta en 1.
- Despues de recargar, el vehiculo sigue presente.

## Prueba 2. Edicion de vehiculo

Objetivo: verificar que una modificacion no se pierde al cerrar el dialogo.

Pasos:
1. En Vehiculos, editar el vehiculo creado en la prueba 1.
2. Cambiar:
   - Estado: mantenimiento
   - Proximo mantenimiento: una fecha dentro de 7 dias
   - Notas: Revision preventiva
3. Guardar.
4. Cerrar y volver a abrir el dialogo de edicion.

Resultado esperado:
- El badge de estado cambia a mantenimiento.
- Se muestra la alerta visual de mantenimiento cercano.
- Los cambios siguen presentes al reabrir el dialogo.

## Prueba 3. Alta de chofer

Objetivo: validar que el alta de chofer se persiste.

Pasos:
1. Ir a la pestana Choferes.
2. Crear un chofer con estos datos:
   - Nombre: Laura
   - Apellido: Medina
   - Cedula: MEDL0101
   - Licencia: QC-55443322
   - Tipo de licencia: Clase 3
   - Estado: activo
3. Guardar.
4. Buscar por Laura en el filtro.
5. Recargar la pagina.

Resultado esperado:
- El chofer aparece en la tabla.
- El filtro lo encuentra por nombre.
- Tras recargar, el chofer sigue existiendo.

## Prueba 4. Alta de ruta

Objetivo: confirmar que una ruta valida se guarda y alimenta los KPIs.

Pasos:
1. Ir a la pestana Rutas.
2. Crear una ruta con estos datos:
   - Nombre: Ruta Laval AM
   - Fecha: hoy
   - Vehiculo: cualquier vehiculo disponible
   - Conductor: cualquier conductor disponible en el selector
3. Agregar dos paradas:
   - Parada 1: organismo valido, hora 08:30, descarga 20
   - Parada 2: organismo valido, hora 09:15, descarga 15
4. Guardar.
5. Volver al inicio del modulo Transporte.
6. Recargar la pagina.

Resultado esperado:
- La ruta aparece en la lista.
- El KPI Pending aumenta en 1.
- Despues de recargar, la ruta sigue presente.
- La ruta muestra 2 paradas y tiempo estimado de 35 min.

## Prueba 5. Validacion de parada incompleta

Objetivo: evitar rutas inconsistentes.

Pasos:
1. Crear una ruta nueva.
2. Agregar una parada sin organismo o sin hora estimada.
3. Intentar guardar.

Resultado esperado:
- La ruta no se guarda.
- Se muestra mensaje de error por campos incompletos.
- El listado de rutas no cambia.

## Prueba 6. Eliminacion de ruta

Objetivo: confirmar que la eliminacion impacta el listado y los KPIs.

Pasos:
1. Eliminar la ruta creada en la prueba 4.
2. Confirmar la accion.
3. Volver a la cabecera del modulo.

Resultado esperado:
- La ruta desaparece del listado.
- El KPI Pending disminuye en 1.
- La eliminacion persiste tras recargar.

## Prueba 7. Eliminacion de chofer

Objetivo: validar que la baja de chofer se persiste.

Pasos:
1. Buscar el chofer creado en la prueba 3.
2. Eliminarlo.
3. Confirmar.
4. Recargar.

Resultado esperado:
- El chofer desaparece de la tabla.
- No reaparece despues de recargar.

## Prueba 8. Verificacion vehicular

Objetivo: comprobar que el submodulo de verificacion sigue guardando historial.

Pasos:
1. Ir a Verificacion.
2. Crear una verificacion pre viaje con un vehiculo y un conductor.
3. Marcar al menos un item como reparar.
4. Guardar.

Resultado esperado:
- La verificacion se guarda en historial.
- El estado general queda como apto_con_observaciones.
- El detalle muestra las acciones requeridas.

## Riesgo residual conocido

La UI actual de Transporte sigue usando un esquema propio distinto de src/app/utils/transporteLogic.ts. La persistencia corregida cubre el modulo visible, pero todavia no unifica completamente esa UI con la logica compartida antigua del workspace.
