import type { Usuario } from './usuarios';
import { getSupabaseClient, isSupabaseAuthEnabled } from './supabaseClient';

const AUTH_PAYLOAD_VIEW = 'auth_user_payload';

type AuthPayloadRow = {
  user_id: string;
  username: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  permisos: string[] | null;
  foto?: string | null;
  descripcion?: string | null;
  activo: boolean;
  telefono?: string | null;
  departamento_id?: string | null;
};

export type RemoteAuthResult =
  | { status: 'success'; usuario: Usuario }
  | { status: 'disabled' | 'not-found' | 'invalid-credentials' | 'error'; message?: string };

function normalizarUsuarioRemoto(payload: AuthPayloadRow): Usuario {
  return {
    id: payload.user_id,
    username: payload.username,
    password: '',
    nombre: payload.nombre,
    apellido: payload.apellido || '',
    email: payload.email,
    rol: payload.rol,
    permisos: Array.isArray(payload.permisos) ? payload.permisos : [],
    foto: payload.foto || undefined,
    descripcion: payload.descripcion || undefined,
    activo: payload.activo,
    departamentoId: payload.departamento_id || undefined,
    telefono: payload.telefono || undefined,
  };
}

async function resolverEmailLogin(identifier: string): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const login = identifier.trim();
  if (!login) {
    return null;
  }

  if (login.includes('@')) {
    return login.toLowerCase();
  }

  const { data, error } = await client.rpc('resolve_auth_login', {
    login_input: login,
  });

  if (error) {
    console.warn('No se pudo resolver el usuario remoto:', error.message);
    return null;
  }

  if (Array.isArray(data) && data[0]?.email) {
    return String(data[0].email).toLowerCase();
  }

  return null;
}

async function obtenerPayloadUsuario(userId: string): Promise<AuthPayloadRow | null> {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from(AUTH_PAYLOAD_VIEW)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<AuthPayloadRow>();

  if (error) {
    console.warn('No se pudo cargar el perfil remoto del usuario:', error.message);
    return null;
  }

  return data;
}

export async function loginWithRemoteAuth(identifier: string, password: string): Promise<RemoteAuthResult> {
  if (!isSupabaseAuthEnabled()) {
    return { status: 'disabled' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { status: 'disabled' };
  }

  try {
    const email = await resolverEmailLogin(identifier);
    if (!email) {
      return { status: 'not-found' };
    }

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return {
        status: 'invalid-credentials',
        message: error?.message,
      };
    }

    const payload = await obtenerPayloadUsuario(data.user.id);
    if (!payload || !payload.activo) {
      await client.auth.signOut();
      return {
        status: 'invalid-credentials',
        message: 'Perfil remoto inactivo o incompleto',
      };
    }

    return {
      status: 'success',
      usuario: normalizarUsuarioRemoto(payload),
    };
  } catch (error) {
    console.error('Error en autenticación remota:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function logoutFromRemoteAuth(): Promise<void> {
  if (!isSupabaseAuthEnabled()) {
    return;
  }

  const client = getSupabaseClient();
  if (!client) {
    return;
  }

  try {
    await client.auth.signOut();
  } catch (error) {
    console.warn('No se pudo cerrar la sesión remota:', error);
  }
}