import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GestionContactosDepartamento } from '../departamentos/GestionContactosDepartamento';
import { Card } from '../ui/card';
import { 
  obtenerTiposContacto, 
  guardarTipoPersonalizado, 
  type TipoContactoPersonalizado 
} from '../../utils/tiposContactoStorage';
import { obtenerIdDepartamentoEntrepot } from '../../utils/contactosDepartamentoStorage';
import { toast } from 'sonner';

/**
 * 🏢 CONTACTOS DE ALMACÉN
 * 
 * Módulo de gestión de contactos específico para el departamento de Almacén.
 * Incluye tipos de contacto independientes:
 * - Donateurs (Donadores)
 * - Fournisseurs (Proveedores)
 * - PRS (Programa de Récupération en Supermarchés)
 * - Transportistas
 * - Otros contactos relacionados con almacén
 */

export function ContactosAlmacen() {
  const { t } = useTranslation();
  const [tiposInicializados, setTiposInicializados] = useState(false);
  const departamentoEntrepotId = obtenerIdDepartamentoEntrepot();

  /**
   * Inicializar tipos de contacto específicos de Almacén
   */
  useEffect(() => {
    inicializarTiposContactoAlmacen();
  }, []);

  const inicializarTiposContactoAlmacen = () => {
    try {
      console.log('🏢 Initialisation des types de contact pour l’Entrepôt...');
      
      const tiposExistentes = obtenerTiposContacto('almacen');
      
      // Si ya existen tipos, no sobrescribir
      if (tiposExistentes.length > 0) {
        console.log(`✅ ${tiposExistentes.length} types de contact existent déjà pour l’Entrepôt`);
        setTiposInicializados(true);
        return;
      }

      // Definir tipos de contacto específicos de Almacén
      const tiposAlmacen = [
        {
          code: 'donateur',
          label: 'Donateur',
          icon: 'Gift',
          color: '#2d9561',
          bgColor: '#D1FAE5'
        },
        {
          code: 'fournisseur',
          label: 'Fournisseur',
          icon: 'ShoppingCart',
          color: '#1a4d7a',
          bgColor: '#DBEAFE'
        },
        {
          code: 'prs',
          label: 'PRS',
          icon: 'Store',
          color: '#8b5cf6',
          bgColor: '#EDE9FE'
        },
        {
          code: 'transporteur',
          label: 'Transporteur',
          icon: 'Truck',
          color: '#f59e0b',
          bgColor: '#FEF3C7'
        },
        {
          code: 'emballage',
          label: 'Fournisseur d\'Emballage',
          icon: 'Package',
          color: '#06b6d4',
          bgColor: '#CCFBF1'
        },
        {
          code: 'autre',
          label: 'Autre Contact',
          icon: 'Users',
          color: '#6b7280',
          bgColor: '#F3F4F6'
        }
      ];

      // Guardar cada tipo de contacto
      let guardados = 0;
      tiposAlmacen.forEach(tipo => {
        const resultado = guardarTipoPersonalizado(tipo, 'almacen');
        if (resultado) {
          guardados++;
        }
      });

      console.log(`✅ ${guardados} types de contact créés pour l’Entrepôt`);
      setTiposInicializados(true);
      
      // Notificar al usuario
      toast.success(`Types de contact initialisés (${guardados})`);
      
    } catch (error) {
      console.error('❌ Erreur lors de l’initialisation des types de contact :', error);
      toast.error('Erreur lors de l\'initialisation des types de contact');
    }
  };

  return (
    <div>
      {/* Componente de gestión de contactos */}
      {tiposInicializados && (
        <GestionContactosDepartamento 
          departamentoId={departamentoEntrepotId}
          departamentoNombre="Entrepôt"
        />
      )}

      {!tiposInicializados && (
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#1a4d7a] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Initialisation des types de contact...</p>
          </div>
        </Card>
      )}
    </div>
  );
}