/**
 * Hook personalizado para registro de auditoría
 * 
 * Facilita el uso del sistema de auditoría desde componentes React
 */

import { useCallback } from 'react';
import { 
  registrarAccion, 
  registrarError,
  type TipoAccion,
  type SeveridadLog,
  AuditHelper
} from '../utils/auditStorage';
import { obtenerUsuarioSesion } from '../utils/sesionStorage';

export function useAuditLog() {
  const usuario = obtenerUsuarioSesion();
  const nombreUsuario = usuario?.nombre || usuario?.username || 'Sistema';
  
  /**
   * Registrar una acción exitosa
   */
  const logAccion = useCallback((
    accion: TipoAccion,
    detalles?: any,
    options?: {
      datosAntes?: any;
      datosDespues?: any;
      duracion?: number;
    }
  ) => {
    return registrarAccion(accion, nombreUsuario, detalles, {
      exito: true,
      severidad: 'info',
      ...options
    });
  }, [nombreUsuario]);
  
  /**
   * Registrar un error
   */
  const logError = useCallback((
    modulo: string,
    accion: string,
    error: Error | string,
    detalles?: any
  ) => {
    return registrarError(modulo, accion, error, nombreUsuario, detalles);
  }, [nombreUsuario]);
  
  /**
   * Registrar una acción con medición de tiempo
   */
  const logAccionConTiempo = useCallback(async <T,>(
    accion: TipoAccion,
    funcion: () => Promise<T>,
    detalles?: any
  ): Promise<T> => {
    const inicio = Date.now();
    
    try {
      const resultado = await funcion();
      const duracion = Date.now() - inicio;
      
      registrarAccion(accion, nombreUsuario, detalles, {
        exito: true,
        duracion
      });
      
      return resultado;
    } catch (error) {
      const duracion = Date.now() - inicio;
      
      registrarAccion(accion, nombreUsuario, { 
        ...detalles, 
        error: error instanceof Error ? error.message : String(error)
      }, {
        exito: false,
        severidad: 'error',
        duracion
      });
      
      throw error;
    }
  }, [nombreUsuario]);
  
  /**
   * Registrar cambio de datos (antes/después)
   */
  const logCambio = useCallback((
    accion: TipoAccion,
    datosAntes: any,
    datosDespues: any,
    detalles?: any
  ) => {
    return registrarAccion(accion, nombreUsuario, detalles, {
      exito: true,
      datosAntes,
      datosDespues
    });
  }, [nombreUsuario]);
  
  /**
   * Registrar advertencia
   */
  const logAdvertencia = useCallback((
    accion: TipoAccion,
    mensaje: string,
    detalles?: any
  ) => {
    return registrarAccion(accion, nombreUsuario, { 
      mensaje, 
      ...detalles 
    }, {
      exito: true,
      severidad: 'warning'
    });
  }, [nombreUsuario]);
  
  // Helpers específicos por módulo
  const inventario = {
    productoCreado: useCallback((producto: any) => 
      AuditHelper.productoCreado(nombreUsuario, producto),
    [nombreUsuario]),
    
    productoEditado: useCallback((producto: any, cambios: any) =>
      AuditHelper.productoEditado(nombreUsuario, producto, cambios),
    [nombreUsuario]),
    
    entradaRegistrada: useCallback((entrada: any) =>
      AuditHelper.entradaRegistrada(nombreUsuario, entrada),
    [nombreUsuario]),
    
    salidaRegistrada: useCallback((salida: any) =>
      logAccion('inventario.salida.registrar', { 
        productoId: salida.productoId, 
        cantidad: salida.cantidad 
      }),
    [logAccion]),
    
    ajusteRealizado: useCallback((ajuste: any) =>
      logAccion('inventario.ajuste.realizar', { 
        productoId: ajuste.productoId, 
        cantidadAnterior: ajuste.cantidadAnterior,
        cantidadNueva: ajuste.cantidadNueva,
        motivo: ajuste.motivo
      }),
    [logAccion]),
    
    transformacionRealizada: useCallback((transformacion: any) =>
      logAccion('inventario.transformacion.realizar', {
        productoOrigenId: transformacion.productoOrigenId,
        productosDestino: transformacion.productosDestino,
        merma: transformacion.merma
      }),
    [logAccion]),
    
    conversionRealizada: useCallback((conversion: any) =>
      logAccion('inventario.conversion.realizar', {
        productoOrigenId: conversion.productoOrigenId,
        productosDestino: conversion.productosDestino
      }),
    [logAccion])
  };
  
  const comandas = {
    creada: useCallback((comanda: any) =>
      AuditHelper.comandaCreada(nombreUsuario, comanda),
    [nombreUsuario]),
    
    editada: useCallback((comanda: any, cambios: any) =>
      logCambio('comandas.editar', cambios.antes, cambios.despues, { 
        comandaId: comanda.id 
      }),
    [logCambio]),
    
    eliminada: useCallback((comandaId: string) =>
      logAccion('comandas.eliminar', { comandaId }),
    [logAccion]),
    
    estadoCambiado: useCallback((comanda: any, estadoAnterior: string, estadoNuevo: string) =>
      logCambio('comandas.cambiar_estado', 
        { estado: estadoAnterior },
        { estado: estadoNuevo },
        { comandaId: comanda.id, numero: comanda.numero }
      ),
    [logCambio]),
    
    aceptada: useCallback((comanda: any) =>
      logAccion('comandas.aceptar', { comandaId: comanda.id, numero: comanda.numero }),
    [logAccion]),
    
    rechazada: useCallback((comanda: any, motivo: string) =>
      logAccion('comandas.rechazar', { 
        comandaId: comanda.id, 
        numero: comanda.numero, 
        motivo 
      }),
    [logAccion]),
    
    entregada: useCallback((comanda: any) =>
      AuditHelper.comandaEntregada(nombreUsuario, comanda),
    [nombreUsuario]),
    
    cancelada: useCallback((comanda: any, motivo: string) =>
      logAccion('comandas.cancelar', { 
        comandaId: comanda.id, 
        numero: comanda.numero,
        motivo 
      }),
    [logAccion]),
    
    impresa: useCallback((comanda: any, tipoImpresion: string) =>
      logAccion('comandas.imprimir', { 
        comandaId: comanda.id, 
        numero: comanda.numero,
        tipo: tipoImpresion
      }),
    [logAccion])
  };
  
  const organismos = {
    creado: useCallback((organismo: any) =>
      logAccion('organismos.crear', { 
        organismoId: organismo.id, 
        nombre: organismo.nombre 
      }),
    [logAccion]),
    
    editado: useCallback((organismo: any, cambios: any) =>
      logCambio('organismos.editar', cambios.antes, cambios.despues, { 
        organismoId: organismo.id 
      }),
    [logCambio]),
    
    eliminado: useCallback((organismoId: string, nombre: string) =>
      logAccion('organismos.eliminar', { organismoId, nombre }),
    [logAccion]),
    
    activado: useCallback((organismoId: string, nombre: string) =>
      logAccion('organismos.activar', { organismoId, nombre }),
    [logAccion]),
    
    desactivado: useCallback((organismoId: string, nombre: string) =>
      logAccion('organismos.desactivar', { organismoId, nombre }),
    [logAccion])
  };
  
  const transporte = {
    rutaCreada: useCallback((ruta: any) =>
      logAccion('transporte.ruta.crear', { 
        rutaId: ruta.id, 
        numero: ruta.numero,
        destino: ruta.destino
      }),
    [logAccion]),
    
    rutaEditada: useCallback((ruta: any, cambios: any) =>
      logCambio('transporte.ruta.editar', cambios.antes, cambios.despues, { 
        rutaId: ruta.id 
      }),
    [logCambio]),
    
    rutaIniciada: useCallback((ruta: any) =>
      logAccion('transporte.ruta.iniciar', { 
        rutaId: ruta.id, 
        numero: ruta.numero 
      }),
    [logAccion]),
    
    rutaCompletada: useCallback((ruta: any) =>
      logAccion('transporte.ruta.completar', { 
        rutaId: ruta.id, 
        numero: ruta.numero 
      }),
    [logAccion]),
    
    rutaCancelada: useCallback((ruta: any, motivo: string) =>
      logAccion('transporte.ruta.cancelar', { 
        rutaId: ruta.id, 
        numero: ruta.numero,
        motivo
      }),
    [logAccion])
  };
  
  const contactos = {
    creado: useCallback((contacto: any) =>
      logAccion('contactos.crear', { 
        contactoId: contacto.id, 
        nombre: `${contacto.prenom} ${contacto.nom}`,
        categoria: contacto.categorie
      }),
    [logAccion]),
    
    editado: useCallback((contacto: any, cambios: any) =>
      logCambio('contactos.editar', cambios.antes, cambios.despues, { 
        contactoId: contacto.id 
      }),
    [logCambio]),
    
    eliminado: useCallback((contactoId: string, nombre: string) =>
      logAccion('contactos.eliminar', { contactoId, nombre }),
    [logAccion])
  };
  
  const benevoles = {
    creado: useCallback((benevole: any) =>
      logAccion('benevoles.crear', { 
        benevoleId: benevole.id, 
        nombre: `${benevole.prenom} ${benevole.nom}`
      }),
    [logAccion]),
    
    editado: useCallback((benevole: any, cambios: any) =>
      logCambio('benevoles.editar', cambios.antes, cambios.despues, { 
        benevoleId: benevole.id 
      }),
    [logCambio]),
    
    estadoCambiado: useCallback((benevole: any, estadoAnterior: string, estadoNuevo: string) =>
      logCambio('benevoles.cambiar_estado',
        { estado: estadoAnterior },
        { estado: estadoNuevo },
        { benevoleId: benevole.id, nombre: `${benevole.prenom} ${benevole.nom}` }
      ),
    [logCambio]),
    
    documentoAgregado: useCallback((benevole: any, documento: any) =>
      logAccion('benevoles.documento.agregar', {
        benevoleId: benevole.id,
        documentoNombre: documento.nom,
        documentoTipo: documento.type
      }),
    [logAccion])
  };
  
  const cuisine = {
    recetaCreada: useCallback((receta: any) =>
      logAccion('cuisine.receta.crear', { 
        recetaId: receta.id, 
        nombre: receta.nombre 
      }),
    [logAccion]),
    
    transformacionCreada: useCallback((transformacion: any) =>
      logAccion('cuisine.transformacion.crear', {
        transformacionId: transformacion.id,
        tipo: transformacion.tipo
      }),
    [logAccion]),
    
    ofertaAceptada: useCallback((oferta: any) =>
      logAccion('cuisine.oferta.aceptar', { 
        ofertaId: oferta.id, 
        numero: oferta.numero 
      }),
    [logAccion]),
    
    ofertaRechazada: useCallback((oferta: any, motivo: string) =>
      logAccion('cuisine.oferta.rechazar', { 
        ofertaId: oferta.id, 
        numero: oferta.numero,
        motivo
      }),
    [logAccion])
  };
  
  const usuarios = {
    loginExitoso: useCallback(() =>
      AuditHelper.loginExitoso(nombreUsuario),
    [nombreUsuario]),
    
    loginFallido: useCallback((razon: string) =>
      AuditHelper.loginFallido(nombreUsuario, razon),
    [nombreUsuario]),
    
    logout: useCallback(() =>
      logAccion('usuarios.logout', { timestamp: new Date().toISOString() }),
    [logAccion]),
    
    passwordCambiado: useCallback(() =>
      logAccion('usuarios.cambiar_password', { 
        timestamp: new Date().toISOString() 
      }),
    [logAccion]),
    
    permisosCambiados: useCallback((usuario: any, permisosAnteriores: string[], permisosNuevos: string[]) =>
      logCambio('usuarios.cambiar_permisos',
        { permisos: permisosAnteriores },
        { permisos: permisosNuevos },
        { usuarioId: usuario.id, nombre: usuario.nombre }
      ),
    [logCambio])
  };
  
  const sistema = {
    datosExportados: useCallback((tipo: string) =>
      AuditHelper.datosExportados(nombreUsuario, tipo),
    [nombreUsuario]),
    
    datosImportados: useCallback((tipo: string, cantidad: number) =>
      logAccion('sistema.importar_datos', { 
        tipo, 
        cantidad,
        timestamp: new Date().toISOString()
      }),
    [logAccion]),
    
    backupRealizado: useCallback(() =>
      logAccion('sistema.backup', { 
        timestamp: new Date().toISOString()
      }),
    [logAccion]),
    
    configuracionCambiada: useCallback((modulo: string, cambios: any) =>
      logCambio('sistema.configuracion.cambiar',
        cambios.antes,
        cambios.despues,
        { modulo }
      ),
    [logCambio])
  };
  
  return {
    logAccion,
    logError,
    logAccionConTiempo,
    logCambio,
    logAdvertencia,
    // Helpers por módulo
    inventario,
    comandas,
    organismos,
    transporte,
    contactos,
    benevoles,
    cuisine,
    usuarios,
    sistema
  };
}
