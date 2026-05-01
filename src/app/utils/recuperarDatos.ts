/**
 * 🆘 UTILIDAD DE RECUPERACIÓN DE DATOS
 * Herramienta para diagnosticar y recuperar voluntarios perdidos
 */

export interface ResultadoBusqueda {
  encontrado: boolean;
  ubicaciones: string[];
  datos?: any;
  sugerencias: string[];
}

/**
 * Buscar un voluntario por nombre en TODOS los lugares posibles
 */
export const buscarVoluntarioPorNombre = (nombre: string): ResultadoBusqueda => {
  const resultado: ResultadoBusqueda = {
    encontrado: false,
    ubicaciones: [],
    sugerencias: []
  };

  const nombreBusqueda = nombre.toLowerCase().trim();
  console.log('🔍 ==========================================');
  console.log('🔍 INICIANDO BÚSQUEDA DE VOLUNTARIO');
  console.log('🔍 Nombre buscado:', nombreBusqueda);
  console.log('🔍 ==========================================');

  try {
    // 1️⃣ Buscar en módulo Bénévoles principal
    const benevolesData = localStorage.getItem('banqueAlimentaire_benevoles');
    if (benevolesData) {
      const benevoles = JSON.parse(benevolesData);
      const encontradoEnBenevoles = benevoles.find((b: any) => 
        (b.nom && b.nom.toLowerCase().includes(nombreBusqueda)) ||
        (b.prenom && b.prenom.toLowerCase().includes(nombreBusqueda)) ||
        (b.email && b.email.toLowerCase().includes(nombreBusqueda))
      );

      if (encontradoEnBenevoles) {
        resultado.encontrado = true;
        resultado.ubicaciones.push('Módulo Bénévoles Principal');
        resultado.datos = { ...resultado.datos, moduloPrincipal: encontradoEnBenevoles };
        console.log('✅ Encontrado en Módulo Bénévoles:', encontradoEnBenevoles);
      } else {
        console.log('❌ No encontrado en Módulo Bénévoles');
      }
    }

    // 2️⃣ Buscar en contactos de departamento
    const contactosData = localStorage.getItem('banqueAlimentaire_contactosDepartamento');
    if (contactosData) {
      const contactos = JSON.parse(contactosData);
      const encontradosEnContactos = contactos.filter((c: any) => 
        (c.nombre && c.nombre.toLowerCase().includes(nombreBusqueda)) ||
        (c.apellido && c.apellido.toLowerCase().includes(nombreBusqueda)) ||
        (c.nombreCompleto && c.nombreCompleto.toLowerCase().includes(nombreBusqueda)) ||
        (c.email && c.email.toLowerCase().includes(nombreBusqueda))
      );

      if (encontradosEnContactos.length > 0) {
        resultado.encontrado = true;
        resultado.ubicaciones.push(`Contactos Departamento (${encontradosEnContactos.length} registro(s))`);
        resultado.datos = { ...resultado.datos, contactosDepartamento: encontradosEnContactos };
        console.log('✅ Encontrado en Contactos Departamento:', encontradosEnContactos);
      } else {
        console.log('❌ No encontrado en Contactos Departamento');
      }
    }

    // 3️⃣ Buscar en usuarios del sistema
    const usuariosData = localStorage.getItem('banqueAlimentaire_usuarios');
    if (usuariosData) {
      const usuarios = JSON.parse(usuariosData);
      const encontradoEnUsuarios = usuarios.find((u: any) => 
        (u.nombre && u.nombre.toLowerCase().includes(nombreBusqueda)) ||
        (u.usuario && u.usuario.toLowerCase().includes(nombreBusqueda)) ||
        (u.email && u.email.toLowerCase().includes(nombreBusqueda))
      );

      if (encontradoEnUsuarios) {
        resultado.encontrado = true;
        resultado.ubicaciones.push('Usuarios del Sistema');
        resultado.datos = { ...resultado.datos, usuario: encontradoEnUsuarios };
        console.log('✅ Encontrado en Usuarios:', encontradoEnUsuarios);
      }
    }

    // 4️⃣ Buscar en backups (si existen)
    const backupKeys = Object.keys(localStorage).filter(k => k.includes('backup') || k.includes('_bak'));
    backupKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            const encontrado = parsed.find((item: any) => 
              JSON.stringify(item).toLowerCase().includes(nombreBusqueda)
            );
            if (encontrado) {
              resultado.ubicaciones.push(`Backup: ${key}`);
              console.log(`✅ Encontrado en backup ${key}:`, encontrado);
            }
          }
        }
      } catch (e) {
        // Ignorar errores de parsing
      }
    });

    // 5️⃣ Generar sugerencias
    if (!resultado.encontrado) {
      resultado.sugerencias.push('El voluntario no existe en ningún lugar del sistema');
      resultado.sugerencias.push('Posibles causas: eliminado, nunca fue creado, o error en el nombre');
      resultado.sugerencias.push('Intenta buscar con otro nombre o email');
    } else if (resultado.ubicaciones.length === 0) {
      resultado.sugerencias.push('Datos encontrados pero no están activos o visibles');
      resultado.sugerencias.push('Verifica el campo "activo" o "statut"');
    }

    console.log('🔍 ==========================================');
    console.log('🔍 RESULTADO DE BÚSQUEDA:');
    console.log('🔍 Encontrado:', resultado.encontrado);
    console.log('🔍 Ubicaciones:', resultado.ubicaciones);
    console.log('🔍 ==========================================');

  } catch (error) {
    console.error('❌ Error en búsqueda:', error);
    resultado.sugerencias.push('Error durante la búsqueda: ' + error);
  }

  return resultado;
};

/**
 * Crear backup de seguridad antes de operaciones peligrosas
 */
export const crearBackupSeguridad = (tipo: 'benevoles' | 'contactos' | 'todos') => {
  const timestamp = new Date().toISOString();
  const backupKey = `backup_${tipo}_${timestamp}`;

  try {
    if (tipo === 'benevoles' || tipo === 'todos') {
      const data = localStorage.getItem('banqueAlimentaire_benevoles');
      if (data) {
        localStorage.setItem(`${backupKey}_benevoles`, data);
        console.log('✅ Backup creado:', `${backupKey}_benevoles`);
      }
    }

    if (tipo === 'contactos' || tipo === 'todos') {
      const data = localStorage.getItem('banqueAlimentaire_contactosDepartamento');
      if (data) {
        localStorage.setItem(`${backupKey}_contactos`, data);
        console.log('✅ Backup creado:', `${backupKey}_contactos`);
      }
    }

    return backupKey;
  } catch (error) {
    console.error('❌ Error creando backup:', error);
    return null;
  }
};

/**
 * Restaurar desde backup
 */
export const restaurarBackup = (backupKey: string, tipo: 'benevoles' | 'contactos') => {
  try {
    const data = localStorage.getItem(`${backupKey}_${tipo}`);
    if (data) {
      const targetKey = tipo === 'benevoles' 
        ? 'banqueAlimentaire_benevoles' 
        : 'banqueAlimentaire_contactosDepartamento';
      
      localStorage.setItem(targetKey, data);
      console.log(`✅ Datos restaurados desde ${backupKey}_${tipo}`);
      return true;
    } else {
      console.error('❌ Backup no encontrado');
      return false;
    }
  } catch (error) {
    console.error('❌ Error restaurando backup:', error);
    return false;
  }
};

/**
 * Listar todos los backups disponibles
 */
export const listarBackups = (): string[] => {
  const backupKeys = Object.keys(localStorage).filter(k => k.startsWith('backup_'));
  console.log('📦 Backups disponibles:', backupKeys);
  return backupKeys;
};

/**
 * Auditoría: Verificar integridad de datos
 */
export const auditarIntegridad = () => {
  console.log('🔍 ==========================================');
  console.log('🔍 AUDITORÍA DE INTEGRIDAD DE DATOS');
  console.log('🔍 ==========================================');

  const reporte = {
    benevoles: 0,
    contactosDepartamento: 0,
    usuarios: 0,
    duplicados: 0,
    inconsistencias: [] as string[]
  };

  try {
    // Contar bénévoles
    const benevolesData = localStorage.getItem('banqueAlimentaire_benevoles');
    if (benevolesData) {
      const benevoles = JSON.parse(benevolesData);
      reporte.benevoles = benevoles.length;
      console.log(`📊 Bénévoles en módulo principal: ${benevoles.length}`);
    }

    // Contar contactos
    const contactosData = localStorage.getItem('banqueAlimentaire_contactosDepartamento');
    if (contactosData) {
      const contactos = JSON.parse(contactosData);
      reporte.contactosDepartamento = contactos.length;
      console.log(`📊 Contactos en departamentos: ${contactos.length}`);

      // Detectar duplicados por email
      const emails = contactos.map((c: any) => c.email?.toLowerCase()).filter(Boolean);
      const emailsUnicos = new Set(emails);
      reporte.duplicados = emails.length - emailsUnicos.size;
      
      if (reporte.duplicados > 0) {
        console.warn(`⚠️ ${reporte.duplicados} posibles duplicados encontrados`);
      }
    }

    // Contar usuarios
    const usuariosData = localStorage.getItem('banqueAlimentaire_usuarios');
    if (usuariosData) {
      const usuarios = JSON.parse(usuariosData);
      reporte.usuarios = usuarios.length;
      console.log(`📊 Usuarios del sistema: ${usuarios.length}`);
    }

  } catch (error) {
    console.error('❌ Error en auditoría:', error);
    reporte.inconsistencias.push('Error durante la auditoría: ' + error);
  }

  console.log('🔍 ==========================================');
  console.log('🔍 REPORTE FINAL:');
  console.log('🔍', reporte);
  console.log('🔍 ==========================================');

  return reporte;
};

/**
 * Exportar todos los datos a JSON para respaldo externo
 */
export const exportarDatosCompletos = () => {
  const timestamp = new Date().toISOString().split('T')[0];
  const exportData = {
    fecha: timestamp,
    benevoles: null as any,
    contactos: null as any,
    usuarios: null as any
  };

  try {
    const benevolesData = localStorage.getItem('banqueAlimentaire_benevoles');
    if (benevolesData) exportData.benevoles = JSON.parse(benevolesData);

    const contactosData = localStorage.getItem('banqueAlimentaire_contactosDepartamento');
    if (contactosData) exportData.contactos = JSON.parse(contactosData);

    const usuariosData = localStorage.getItem('banqueAlimentaire_usuarios');
    if (usuariosData) exportData.usuarios = JSON.parse(usuariosData);

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_banque_alimentaire_${timestamp}.json`;
    link.click();
    
    console.log('✅ Datos exportados exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error exportando datos:', error);
    return false;
  }
};
