/**
 * SISTEMA DE VALIDACIÓN Y ESTABILIZACIÓN
 * Banque Alimentaire - Sistema Integral
 * 
 * Este archivo contiene todas las funciones de validación, verificación
 * y estabilización del sistema para garantizar integridad de datos.
 */

import { logger } from './logger';

// ============================================================================
// CONSTANTES DE VALIDACIÓN
// ============================================================================

export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
  postalCodeCA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
  codigoProducto: /^[A-Z0-9-]{3,20}$/,
  numeroComanda: /^CMD-\d{2}-\d{6}$/,
} as const;

export const SYSTEM_LIMITS = {
  maxProductosInventario: 10000,
  maxComandas: 5000,
  maxOrganismos: 500,
  maxContactos: 1000,
  maxBenevoles: 500,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxImageWidth: 2048,
  maxImageHeight: 2048,
} as const;

// ============================================================================
// VALIDACIÓN DE DATOS BÁSICOS
// ============================================================================

/**
 * Valida un email
 */
export function validarEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return VALIDATION_RULES.email.test(email.trim());
}

/**
 * Valida un teléfono (formato canadiense/norteamericano)
 */
export function validarTelefono(telefono: string): boolean {
  if (!telefono || typeof telefono !== 'string') return false;
  return VALIDATION_RULES.phone.test(telefono.trim());
}

/**
 * Valida un código postal canadiense
 */
export function validarCodigoPostal(codigoPostal: string): boolean {
  if (!codigoPostal || typeof codigoPostal !== 'string') return false;
  return VALIDATION_RULES.postalCodeCA.test(codigoPostal.trim());
}

/**
 * Valida que un campo requerido no esté vacío
 */
export function validarCampoRequerido(valor: any, nombreCampo: string): boolean {
  if (valor === null || valor === undefined) {
    logger.warn(`Campo requerido vacío: ${nombreCampo}`);
    return false;
  }
  
  if (typeof valor === 'string' && valor.trim() === '') {
    logger.warn(`Campo requerido vacío: ${nombreCampo}`);
    return false;
  }
  
  return true;
}

/**
 * Valida una fecha en formato ISO o YYYY-MM-DD
 */
export function validarFecha(fecha: string): boolean {
  if (!fecha || typeof fecha !== 'string') return false;
  const date = new Date(fecha);
  return !isNaN(date.getTime());
}

/**
 * Valida que una fecha no sea futura
 */
export function validarFechaNoFutura(fecha: string): boolean {
  if (!validarFecha(fecha)) return false;
  const date = new Date(fecha);
  const hoy = new Date();
  return date <= hoy;
}

/**
 * Valida un número positivo
 */
export function validarNumeroPositivo(numero: number): boolean {
  return typeof numero === 'number' && !isNaN(numero) && numero >= 0;
}

/**
 * Valida un código de producto
 */
export function validarCodigoProducto(codigo: string): boolean {
  if (!codigo || typeof codigo !== 'string') return false;
  return VALIDATION_RULES.codigoProducto.test(codigo.trim());
}

// ============================================================================
// VALIDACIÓN DE ENTIDADES
// ============================================================================

/**
 * Valida un producto completo
 */
export function validarProducto(producto: any): { valido: boolean; errores: string[] } {
  const errores: string[] = [];
  
  if (!validarCampoRequerido(producto.nombre, 'nombre')) {
    errores.push('El nombre del producto es requerido');
  }
  
  if (!validarCampoRequerido(producto.categoria, 'categoría')) {
    errores.push('La categoría es requerida');
  }
  
  if (!validarCampoRequerido(producto.unidad, 'unidad')) {
    errores.push('La unidad de medida es requerida');
  }
  
  if (producto.stock !== undefined && !validarNumeroPositivo(producto.stock)) {
    errores.push('El stock debe ser un número positivo');
  }
  
  if (producto.precio !== undefined && !validarNumeroPositivo(producto.precio)) {
    errores.push('El precio debe ser un número positivo');
  }
  
  if (producto.codigoBarras && producto.codigoBarras.length > 0) {
    if (producto.codigoBarras.length < 8 || producto.codigoBarras.length > 14) {
      errores.push('El código de barras debe tener entre 8 y 14 dígitos');
    }
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
}

/**
 * Valida una comanda completa
 */
export function validarComanda(comanda: any): { valido: boolean; errores: string[] } {
  const errores: string[] = [];
  
  if (!validarCampoRequerido(comanda.organismoId, 'organismoId')) {
    errores.push('El organismo es requerido');
  }
  
  if (!validarCampoRequerido(comanda.nombreOrganismo, 'nombreOrganismo')) {
    errores.push('El nombre del organismo es requerido');
  }
  
  if (!comanda.items || !Array.isArray(comanda.items) || comanda.items.length === 0) {
    errores.push('La comanda debe tener al menos un producto');
  }
  
  if (comanda.items && Array.isArray(comanda.items)) {
    comanda.items.forEach((item: any, index: number) => {
      if (!validarCampoRequerido(item.productoId, `item[${index}].productoId`)) {
        errores.push(`El producto en la posición ${index + 1} no tiene ID`);
      }
      if (!validarNumeroPositivo(item.cantidad)) {
        errores.push(`La cantidad en la posición ${index + 1} debe ser positiva`);
      }
    });
  }
  
  if (comanda.fecha && !validarFecha(comanda.fecha)) {
    errores.push('La fecha de la comanda no es válida');
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
}

/**
 * Valida un organismo completo
 */
export function validarOrganismo(organismo: any): { valido: boolean; errores: string[] } {
  const errores: string[] = [];
  
  if (!validarCampoRequerido(organismo.nombre, 'nombre')) {
    errores.push('El nombre del organismo es requerido');
  }
  
  if (!validarCampoRequerido(organismo.tipo, 'tipo')) {
    errores.push('El tipo de organismo es requerido');
  }
  
  if (!validarCampoRequerido(organismo.responsable, 'responsable')) {
    errores.push('El nombre del responsable es requerido');
  }
  
  if (organismo.email && !validarEmail(organismo.email)) {
    errores.push('El email no es válido');
  }
  
  if (organismo.telefono && !validarTelefono(organismo.telefono)) {
    errores.push('El teléfono no es válido');
  }
  
  if (organismo.codigoPostal && !validarCodigoPostal(organismo.codigoPostal)) {
    errores.push('El código postal no es válido (formato canadiense requerido)');
  }
  
  if (organismo.beneficiarios !== undefined && !validarNumeroPositivo(organismo.beneficiarios)) {
    errores.push('El número de beneficiarios debe ser positivo');
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
}

/**
 * Valida un contacto completo
 */
export function validarContacto(contacto: any): { valido: boolean; errores: string[] } {
  const errores: string[] = [];
  
  if (!validarCampoRequerido(contacto.nom, 'nom')) {
    errores.push('El apellido es requerido');
  }
  
  if (!validarCampoRequerido(contacto.prenom, 'prenom')) {
    errores.push('El nombre es requerido');
  }
  
  if (contacto.email && !validarEmail(contacto.email)) {
    errores.push('El email no es válido');
  }
  
  if (contacto.telephone && !validarTelefono(contacto.telephone)) {
    errores.push('El teléfono no es válido');
  }
  
  if (!validarCampoRequerido(contacto.departement, 'departement')) {
    errores.push('El departamento es requerido');
  }
  
  if (!validarCampoRequerido(contacto.categorie, 'categorie')) {
    errores.push('La categoría es requerida');
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
}

/**
 * Valida un bénévole completo
 */
export function validarBenevole(benevole: any): { valido: boolean; errores: string[] } {
  const errores: string[] = [];
  
  if (!validarCampoRequerido(benevole.nom, 'nom')) {
    errores.push('El apellido es requerido');
  }
  
  if (!validarCampoRequerido(benevole.prenom, 'prenom')) {
    errores.push('El nombre es requerido');
  }
  
  if (benevole.email && !validarEmail(benevole.email)) {
    errores.push('El email no es válido');
  }
  
  if (benevole.telephone && !validarTelefono(benevole.telephone)) {
    errores.push('El teléfono no es válido');
  }
  
  if (benevole.dateNaissance && !validarFecha(benevole.dateNaissance)) {
    errores.push('La fecha de nacimiento no es válida');
  }
  
  if (benevole.dateNaissance && !validarFechaNoFutura(benevole.dateNaissance)) {
    errores.push('La fecha de nacimiento no puede ser futura');
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
}

// ============================================================================
// SANITIZACIÓN DE DATOS
// ============================================================================

/**
 * Sanitiza un string eliminando caracteres peligrosos
 */
export function sanitizarTexto(texto: string): string {
  if (!texto || typeof texto !== 'string') return '';
  
  return texto
    .trim()
    .replace(/[<>]/g, '') // Eliminar < y > para prevenir XSS
    .replace(/\s+/g, ' '); // Normalizar espacios
}

/**
 * Sanitiza un email
 */
export function sanitizarEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Sanitiza un teléfono (solo números y algunos caracteres permitidos)
 */
export function sanitizarTelefono(telefono: string): string {
  if (!telefono || typeof telefono !== 'string') return '';
  return telefono.replace(/[^0-9+\-\s()]/g, '').trim();
}

/**
 * Sanitiza un código postal canadiense
 */
export function sanitizarCodigoPostal(codigoPostal: string): string {
  if (!codigoPostal || typeof codigoPostal !== 'string') return '';
  return codigoPostal.toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
}

// ============================================================================
// VERIFICACIÓN DE INTEGRIDAD DEL SISTEMA
// ============================================================================

/**
 * Verifica la integridad de los datos en localStorage
 */
export function verificarIntegridadSistema(): {
  ok: boolean;
  errores: string[];
  advertencias: string[];
} {
  const errores: string[] = [];
  const advertencias: string[] = [];
  
  try {
    // Verificar que localStorage esté disponible
    if (typeof localStorage === 'undefined') {
      errores.push('localStorage no está disponible');
      return { ok: false, errores, advertencias };
    }
    
    // Verificar departamentos
    const departamentos = localStorage.getItem('departamentos_banco_alimentos');
    if (!departamentos) {
      advertencias.push('No hay departamentos inicializados');
    } else {
      try {
        const depsParsed = JSON.parse(departamentos);
        if (!Array.isArray(depsParsed)) {
          errores.push('Los departamentos no son un array válido');
        }
      } catch (e) {
        errores.push('Error al parsear departamentos');
      }
    }
    
    // Verificar productos
    const productos = localStorage.getItem('productos_banco_alimentos');
    if (productos) {
      try {
        const prodsParsed = JSON.parse(productos);
        if (!Array.isArray(prodsParsed)) {
          errores.push('Los productos no son un array válido');
        } else if (prodsParsed.length > SYSTEM_LIMITS.maxProductosInventario) {
          advertencias.push(`Hay ${prodsParsed.length} productos, se recomienda no superar ${SYSTEM_LIMITS.maxProductosInventario}`);
        }
      } catch (e) {
        errores.push('Error al parsear productos');
      }
    }
    
    // Verificar comandas
    const comandas = localStorage.getItem('comandas_banco_alimentos');
    if (comandas) {
      try {
        const cmdsParsed = JSON.parse(comandas);
        if (!Array.isArray(cmdsParsed)) {
          errores.push('Las comandas no son un array válido');
        } else if (cmdsParsed.length > SYSTEM_LIMITS.maxComandas) {
          advertencias.push(`Hay ${cmdsParsed.length} comandas, se recomienda archivar las antiguas`);
        }
      } catch (e) {
        errores.push('Error al parsear comandas');
      }
    }
    
    // Verificar organismos
    const organismos = localStorage.getItem('organismos_banco_alimentos');
    if (organismos) {
      try {
        const orgsParsed = JSON.parse(organismos);
        if (!Array.isArray(orgsParsed)) {
          errores.push('Los organismos no son un array válido');
        }
      } catch (e) {
        errores.push('Error al parsear organismos');
      }
    }
    
    // Verificar unidades
    const unidades = localStorage.getItem('unidades_banco_alimentos');
    if (!unidades) {
      advertencias.push('No hay unidades de medida inicializadas');
    } else {
      try {
        const unidadesParsed = JSON.parse(unidades);
        if (!Array.isArray(unidadesParsed)) {
          errores.push('Las unidades no son un array válido');
        }
      } catch (e) {
        errores.push('Error al parsear unidades');
      }
    }
    
  } catch (e: any) {
    errores.push(`Error general en verificación: ${e.message}`);
  }
  
  return {
    ok: errores.length === 0,
    errores,
    advertencias
  };
}

/**
 * Repara datos corruptos en localStorage
 */
export function repararDatosCorruptos(): {
  reparado: boolean;
  acciones: string[];
} {
  const acciones: string[] = [];
  
  try {
    // Verificar y reparar cada tipo de dato
    const claves = [
      'productos_banco_alimentos',
      'comandas_banco_alimentos',
      'organismos_banco_alimentos',
      'departamentos_banco_alimentos',
      'unidades_banco_alimentos',
      'contactos_banco_alimentos'
    ];
    
    claves.forEach(clave => {
      const datos = localStorage.getItem(clave);
      if (datos) {
        try {
          JSON.parse(datos);
        } catch (e) {
          // Si falla el parseo, eliminar y reinicializar
          localStorage.removeItem(clave);
          acciones.push(`Eliminado ${clave} corrupto`);
        }
      }
    });
    
    return {
      reparado: true,
      acciones
    };
  } catch (e) {
    return {
      reparado: false,
      acciones: ['Error al intentar reparar datos']
    };
  }
}

/**
 * Genera un reporte de salud del sistema
 */
export function generarReporteSalud(): string {
  const { ok, errores, advertencias } = verificarIntegridadSistema();
  
  let reporte = '═══════════════════════════════════════════════\n';
  reporte += '   REPORTE DE SALUD DEL SISTEMA\n';
  reporte += '   Banque Alimentaire - Sistema Integral\n';
  reporte += '═══════════════════════════════════════════════\n\n';
  
  reporte += `Estado General: ${ok ? '✅ SALUDABLE' : '⚠️ REQUIERE ATENCIÓN'}\n\n`;
  
  if (errores.length > 0) {
    reporte += '🔴 ERRORES CRÍTICOS:\n';
    errores.forEach(error => {
      reporte += `   • ${error}\n`;
    });
    reporte += '\n';
  }
  
  if (advertencias.length > 0) {
    reporte += '⚠️ ADVERTENCIAS:\n';
    advertencias.forEach(adv => {
      reporte += `   • ${adv}\n`;
    });
    reporte += '\n';
  }
  
  if (ok && advertencias.length === 0) {
    reporte += '✅ No se detectaron problemas\n\n';
  }
  
  // Estadísticas de almacenamiento
  reporte += 'ESTADÍSTICAS DE ALMACENAMIENTO:\n';
  try {
    const productos = JSON.parse(localStorage.getItem('productos_banco_alimentos') || '[]');
    const comandas = JSON.parse(localStorage.getItem('comandas_banco_alimentos') || '[]');
    const organismos = JSON.parse(localStorage.getItem('organismos_banco_alimentos') || '[]');
    const contactos = JSON.parse(localStorage.getItem('banque_alimentaire_contactos_departamento') || '[]');
    
    reporte += `   • Productos: ${productos.length}\n`;
    reporte += `   • Comandas: ${comandas.length}\n`;
    reporte += `   • Organismos: ${organismos.length}\n`;
    reporte += `   • Contactos: ${contactos.length}\n`;
  } catch (e) {
    reporte += '   • Error al obtener estadísticas\n';
  }
  
  reporte += '\n═══════════════════════════════════════════════\n';
  
  return reporte;
}

// ============================================================================
// LIMPIEZA Y MANTENIMIENTO
// ============================================================================

/**
 * Limpia datos antiguos o innecesarios
 */
export function limpiarDatosAntiguos(diasRetencion: number = 90): {
  eliminados: number;
  detalles: string[];
} {
  const detalles: string[] = [];
  let eliminados = 0;
  
  try {
    // Limpiar comandas antiguas canceladas
    const comandas = JSON.parse(localStorage.getItem('comandas_banco_alimentos') || '[]');
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasRetencion);
    
    const comandasFiltradas = comandas.filter((c: any) => {
      if (c.estado === 'cancelada' && new Date(c.fecha) < fechaLimite) {
        eliminados++;
        return false;
      }
      return true;
    });
    
    if (comandasFiltradas.length < comandas.length) {
      localStorage.setItem('comandas_banco_alimentos', JSON.stringify(comandasFiltradas));
      detalles.push(`Eliminadas ${comandas.length - comandasFiltradas.length} comandas canceladas antiguas`);
    }
    
  } catch (e) {
    detalles.push('Error al limpiar datos antiguos');
  }
  
  return { eliminados, detalles };
}

/**
 * Exporta todos los datos del sistema para backup
 */
export function exportarDatosCompletos(): string {
  try {
    const datos: Record<string, any> = {};
    
    const claves = [
      'productos_banco_alimentos',
      'comandas_banco_alimentos',
      'organismos_banco_alimentos',
      'departamentos_banco_alimentos',
      'unidades_banco_alimentos',
      'banque_alimentaire_contactos_departamento',
      'benevoles',
      'recetas_banco_alimentos',
      'ofertas_sistema'
    ];
    
    claves.forEach(clave => {
      const valor = localStorage.getItem(clave);
      if (valor) {
        try {
          datos[clave] = JSON.parse(valor);
        } catch (e) {
          datos[clave] = valor; // Guardar como string si no se puede parsear
        }
      }
    });
    
    datos.fecha_exportacion = new Date().toISOString();
    datos.version_sistema = '2.1';
    
    return JSON.stringify(datos, null, 2);
  } catch (e) {
    logger.error('Error al exportar datos completos', e);
    return '{}';
  }
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export default {
  // Validación
  validarEmail,
  validarTelefono,
  validarCodigoPostal,
  validarCampoRequerido,
  validarFecha,
  validarFechaNoFutura,
  validarNumeroPositivo,
  validarCodigoProducto,
  
  // Validación de entidades
  validarProducto,
  validarComanda,
  validarOrganismo,
  validarContacto,
  validarBenevole,
  
  // Sanitización
  sanitizarTexto,
  sanitizarEmail,
  sanitizarTelefono,
  sanitizarCodigoPostal,
  
  // Integridad
  verificarIntegridadSistema,
  repararDatosCorruptos,
  generarReporteSalud,
  
  // Mantenimiento
  limpiarDatosAntiguos,
  exportarDatosCompletos,
};
