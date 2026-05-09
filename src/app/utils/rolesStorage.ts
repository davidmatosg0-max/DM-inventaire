import { rolesPredeterminados, type Rol } from '../data/rolesPermisos';
import { actualizarUsuarioSesion, obtenerUsuarioSesion } from './sesionStorage';
import { guardarUsuarios, obtenerUsuarios } from './usuarios';
import { queueStorageSync } from './cloudPersistence';

const STORAGE_KEY = 'banque_alimentaire_roles_personnalises';
export const ROLES_UPDATED_EVENT = 'roles-updated';

function normalizarTextoId(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function emitirActualizacionRoles(): void {
  window.dispatchEvent(new CustomEvent(ROLES_UPDATED_EVENT));
}

function leerRolesPersonalizados(): Rol[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as Rol[];
    return Array.isArray(parsed)
      ? parsed.filter((rol) => !rol.predeterminado)
      : [];
  } catch (error) {
    console.error('Error al leer roles personalizados:', error);
    return [];
  }
}

function guardarRolesPersonalizados(roles: Rol[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roles.filter((rol) => !rol.predeterminado)));
    queueStorageSync(STORAGE_KEY);
    emitirActualizacionRoles();
  } catch (error) {
    console.error('Error al guardar roles personalizados:', error);
  }
}

function contarUsuariosAsignados(rolId: string): number {
  return obtenerUsuarios().filter((usuario) => usuario.rol === rolId).length;
}

function hidratarRoles(roles: Rol[]): Rol[] {
  return roles.map((rol) => ({
    ...rol,
    usuariosAsignados: contarUsuariosAsignados(rol.id),
  }));
}

function sincronizarPermisosUsuariosConRol(rolId: string, permisos: string[]): void {
  const permisosNormalizados = [...new Set(permisos)];
  const usuarios = obtenerUsuarios();
  let huboCambios = false;

  const usuariosActualizados = usuarios.map((usuario) => {
    if (usuario.rol !== rolId) {
      return usuario;
    }

    const permisosActuales = [...new Set(usuario.permisos || [])];
    const mismosPermisos = permisosActuales.length === permisosNormalizados.length
      && permisosActuales.every((permiso) => permisosNormalizados.includes(permiso));

    if (mismosPermisos) {
      return usuario;
    }

    huboCambios = true;
    return {
      ...usuario,
      permisos: permisosNormalizados,
    };
  });

  if (huboCambios) {
    guardarUsuarios(usuariosActualizados);
  }

  const usuarioSesion = obtenerUsuarioSesion();
  if (usuarioSesion?.rol === rolId) {
    actualizarUsuarioSesion({ permisos: permisosNormalizados as any });
  }
}

export function obtenerRoles(): Rol[] {
  const rolesPredeterminadosMap = new Map(
    rolesPredeterminados.map((rol) => [rol.id, { ...rol }])
  );

  for (const rolPersonalizado of leerRolesPersonalizados()) {
    const rolBase = rolesPredeterminadosMap.get(rolPersonalizado.id);

    if (rolBase) {
      rolesPredeterminadosMap.set(rolPersonalizado.id, {
        ...rolBase,
        ...rolPersonalizado,
        predeterminado: true,
      });
      continue;
    }

    rolesPredeterminadosMap.set(rolPersonalizado.id, rolPersonalizado);
  }

  return hidratarRoles(Array.from(rolesPredeterminadosMap.values()));
}

export function guardarRolPersonalizado(
  datosRol: Omit<Rol, 'id' | 'usuariosAsignados' | 'predeterminado'>,
  rolExistenteId?: string
): Rol {
  const rolesPersonalizados = leerRolesPersonalizados();
  const idsOcupados = new Set(obtenerRoles().map((rol) => rol.id));

  let rolId = rolExistenteId || normalizarTextoId(datosRol.nombre) || `rol_${Date.now()}`;
  if (!rolExistenteId) {
    let suffix = 1;
    const baseId = rolId;
    while (idsOcupados.has(rolId)) {
      rolId = `${baseId}_${suffix}`;
      suffix += 1;
    }
  }

  const rolGuardado: Rol = {
    id: rolId,
    nombre: datosRol.nombre,
    descripcion: datosRol.descripcion,
    color: datosRol.color,
    icono: datosRol.icono,
    permisos: [...datosRol.permisos],
    activo: datosRol.activo,
    usuariosAsignados: contarUsuariosAsignados(rolId),
    predeterminado: false,
  };

  const index = rolesPersonalizados.findIndex((rol) => rol.id === rolId);
  if (index >= 0) {
    rolesPersonalizados[index] = rolGuardado;
  } else {
    rolesPersonalizados.push(rolGuardado);
  }

  guardarRolesPersonalizados(rolesPersonalizados);
  sincronizarPermisosUsuariosConRol(rolId, rolGuardado.permisos);
  return rolGuardado;
}

export function eliminarRolPersonalizado(rolId: string): boolean {
  const rolesPersonalizados = leerRolesPersonalizados();
  const actualizados = rolesPersonalizados.filter((rol) => rol.id !== rolId);

  if (actualizados.length === rolesPersonalizados.length) {
    return false;
  }

  guardarRolesPersonalizados(actualizados);
  return true;
}