/**
 * Hook personalizado para validación del sistema
 * Proporciona acceso fácil a todas las funciones de validación
 */

import { useCallback, useState, useEffect } from 'react';
import {
  validarEmail,
  validarTelefono,
  validarCodigoPostal,
  validarCampoRequerido,
  validarFecha,
  validarProducto,
  validarComanda,
  validarOrganismo,
  validarContacto,
  validarBenevole,
  verificarIntegridadSistema,
  generarReporteSalud,
  limpiarDatosAntiguos,
} from '../app/utils/systemValidation';
import { logger } from '../app/utils/logger';

export interface ValidationResult {
  valido: boolean;
  errores: string[];
}

export function useSystemValidation() {
  const [saludSistema, setSaludSistema] = useState<{
    ok: boolean;
    errores: string[];
    advertencias: string[];
  } | null>(null);

  // Verificar salud del sistema al montar el componente
  useEffect(() => {
    const resultado = verificarIntegridadSistema();
    setSaludSistema(resultado);
    
    if (!resultado.ok) {
      logger.warn('Sistema con problemas detectados', resultado);
    }
  }, []);

  // Validar email con callback
  const validateEmail = useCallback((email: string): boolean => {
    return validarEmail(email);
  }, []);

  // Validar teléfono con callback
  const validatePhone = useCallback((phone: string): boolean => {
    return validarTelefono(phone);
  }, []);

  // Validar código postal con callback
  const validatePostalCode = useCallback((postalCode: string): boolean => {
    return validarCodigoPostal(postalCode);
  }, []);

  // Validar campo requerido con callback
  const validateRequired = useCallback((value: any, fieldName: string): boolean => {
    return validarCampoRequerido(value, fieldName);
  }, []);

  // Validar fecha con callback
  const validateDate = useCallback((date: string): boolean => {
    return validarFecha(date);
  }, []);

  // Validar producto completo
  const validateProduct = useCallback((product: any): ValidationResult => {
    return validarProducto(product);
  }, []);

  // Validar comanda completa
  const validateComanda = useCallback((comanda: any): ValidationResult => {
    return validarComanda(comanda);
  }, []);

  // Validar organismo completo
  const validateOrganismo = useCallback((organismo: any): ValidationResult => {
    return validarOrganismo(organismo);
  }, []);

  // Validar contacto completo
  const validateContacto = useCallback((contacto: any): ValidationResult => {
    return validarContacto(contacto);
  }, []);

  // Validar bénévole completo
  const validateBenevole = useCallback((benevole: any): ValidationResult => {
    return validarBenevole(benevole);
  }, []);

  // Generar reporte de salud
  const getHealthReport = useCallback((): string => {
    return generarReporteSalud();
  }, []);

  // Limpiar datos antiguos
  const cleanOldData = useCallback((daysRetention: number = 90) => {
    return limpiarDatosAntiguos(daysRetention);
  }, []);

  // Re-verificar salud del sistema
  const recheckSystemHealth = useCallback(() => {
    const resultado = verificarIntegridadSistema();
    setSaludSistema(resultado);
    return resultado;
  }, []);

  return {
    // Estado
    saludSistema,
    
    // Validaciones básicas
    validateEmail,
    validatePhone,
    validatePostalCode,
    validateRequired,
    validateDate,
    
    // Validaciones de entidades
    validateProduct,
    validateComanda,
    validateOrganismo,
    validateContacto,
    validateBenevole,
    
    // Utilidades
    getHealthReport,
    cleanOldData,
    recheckSystemHealth,
  };
}

export default useSystemValidation;
