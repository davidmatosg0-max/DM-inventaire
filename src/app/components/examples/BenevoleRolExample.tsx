// Ejemplo visual de cómo se ve el botón integrado en Bénévoles
// Este archivo es solo para referencia, no es necesario ejecutarlo

import React from 'react';
import { Shield, User, Clock, Link, Edit, Mail } from 'lucide-react';
import { Button } from '../ui/button';

// Ejemplo de una fila de la tabla con el nuevo botón
function ExampleTableRow() {
  const benevole = {
    id: 1,
    prenom: 'Sophie',
    nom: 'Tremblay',
    email: 'sophie.tremblay@email.com',
    telephone: '514-555-0123',
    departement: 'Entrepôt',
    heuresTotal: 245,
    heuresMois: 32,
    statut: 'actif',
    poste: 'Bénévole'
  };

  return (
    <tr className="hover:bg-[#F9F9F9] transition-colors">
      <td className="px-6 py-4">
        <div>
          <p className="font-semibold text-[#333333]">{benevole.prenom} {benevole.nom}</p>
          <p className="text-sm text-[#666666]">{benevole.email}</p>
        </div>
      </td>
      <td className="px-6 py-4 text-[#666666]">{benevole.departement}</td>
      <td className="px-6 py-4 text-right">
        <span className="font-bold text-[#1E73BE]">{benevole.heuresTotal}h</span>
      </td>
      <td className="px-6 py-4 text-right">
        <span className="font-semibold text-[#4CAF50]">{benevole.heuresMois}h</span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Actif
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          {/* Botón Ver perfil */}
          <Button
            variant="outline"
            size="sm"
            className="border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white"
            title="Voir le profil"
          >
            <User className="w-4 h-4" />
          </Button>

          {/* Botón Ver historial */}
          <Button 
            variant="outline" 
            size="sm" 
            className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
            title="Voir l'historique"
          >
            <Clock className="w-4 h-4" />
          </Button>

          {/* Botón Asignar departamentos */}
          <Button 
            variant="outline" 
            size="sm" 
            className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
            title="Assigner aux départements"
          >
            <Link className="w-4 h-4" />
          </Button>

          {/* 🆕 NUEVO BOTÓN: Créer un accès au système */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              console.log('Créer accès pour:', benevole.prenom, benevole.nom);
              // Aquí se abre el diálogo AsignarRolContacto
            }}
            className="border-[#9C27B0] text-[#9C27B0] hover:bg-[#9C27B0] hover:text-white"
            title="Créer un accès au système"
          >
            <Shield className="w-4 h-4" />
          </Button>

          {/* Botón Modifier */}
          <Button 
            variant="outline" 
            size="sm" 
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </Button>

          {/* Botón Email */}
          <Button 
            variant="outline" 
            size="sm" 
            title="Envoyer un email"
          >
            <Mail className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// Visualización del estado del componente
const componentState = {
  // Estados agregados
  dialogAsignarRolOpen: false,
  benevoleParaRol: null,
  
  // Roles disponibles
  rolesDisponibles: [
    {
      id: 'admin',
      nombre: 'Administrateur',
      descripcion: 'Accès complet à toutes les fonctionnalités du système',
      color: '#DC3545'
    },
    {
      id: 'coordinador',
      nombre: 'Coordinateur',
      descripcion: 'Gestion de l\'inventaire, des commandes et des organismes',
      color: '#1E73BE'
    },
    {
      id: 'almacenista',
      nombre: 'Magasinier',
      descripcion: 'Gestion de l\'inventaire et mouvements de produits',
      color: '#4CAF50'
    },
    {
      id: 'transportista',
      nombre: 'Transporteur',
      descripcion: 'Gestion des routes et des livraisons',
      color: '#FFC107'
    },
    {
      id: 'visualizador',
      nombre: 'Visualiseur',
      descripcion: 'Lecture seule des informations du système',
      color: '#9E9E9E'
    },
    {
      id: 'liaison',
      nombre: 'Liaison Organisme',
      descripcion: 'Gestion des organismes et communication',
      color: '#9C27B0'
    }
  ]
};

// Ejemplo de cómo se ve el objeto contacto que se pasa al diálogo
const ejemploContacto = {
  id: '1',
  nombre: 'Sophie',
  apellido: 'Tremblay',
  nombreCompleto: 'Sophie Tremblay',
  email: 'sophie.tremblay@email.com',
  telefono: '514-555-0123',
  cargo: 'Bénévole',
  modulo: 'benevole' // Identifica que viene del módulo de bénévoles
};

// Función handler de ejemplo
function handleCrearAcceso(benevole: any) {
  // 1. Preparar datos del contacto
  const contacto = {
    id: benevole.id.toString(),
    nombre: benevole.prenom,
    apellido: benevole.nom,
    nombreCompleto: `${benevole.prenom} ${benevole.nom}`,
    email: benevole.email,
    telefono: benevole.telephone,
    cargo: benevole.poste || 'Bénévole',
    modulo: 'benevole'
  };

  // 2. Actualizar estado
  // setBenevoleParaRol(contacto);
  // setDialogAsignarRolOpen(true);

  console.log('📋 Contacto preparado:', contacto);
}

// Ejemplo de callback onGuardar
function handleGuardarAcceso(datosAcceso: any) {
  console.log('✅ Datos del acceso creado:', datosAcceso);
  console.log('   - Rol ID:', datosAcceso.rolId);
  console.log('   - Username:', datosAcceso.username);
  console.log('   - Password:', datosAcceso.password ? '***' : 'No proporcionado');
  console.log('   - Activo:', datosAcceso.activo);
  
  // Mostrar toast
  // toast.success(`🔐 Accès au système créé pour ${benevoleParaRol.nombreCompleto}!`);
  
  // Limpiar estado
  // setBenevoleParaRol(null);
}

export {
  ExampleTableRow,
  componentState,
  ejemploContacto,
  handleCrearAcceso,
  handleGuardarAcceso
};
