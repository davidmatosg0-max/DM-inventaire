import { getSupabaseAnonKey, getSupabaseClient, getSupabaseFunctionUrl, isSupabaseAuthEnabled } from './supabaseClient';
import type { Usuario } from './usuarios';

type RemoteAdminUser = {
  user_id: string;
  username: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  permisos: string[] | null;
  activo: boolean;
  foto?: string | null;
  descripcion?: string | null;
  telefono?: string | null;
  departamento_id?: string | null;
};

type RemoteAdminPayload = {
  userId?: string;
  email: string;
  password?: string;
  username: string;
  nombre: string;
  apellido?: string;
  roleId: string;
  descripcion?: string;
  telefono?: string;
  departamentoId?: string;
  activo?: boolean;
};

function normalizarUsuarioRemoto(usuario: RemoteAdminUser): Usuario {
  return {
    id: usuario.user_id,
    username: usuario.username,
    password: '',
    nombre: usuario.nombre,
    apellido: usuario.apellido || '',
    email: usuario.email,
    rol: usuario.rol,
    permisos: Array.isArray(usuario.permisos) ? usuario.permisos : [],
    foto: usuario.foto || undefined,
    descripcion: usuario.descripcion || undefined,
    activo: usuario.activo,
    telefono: usuario.telefono || undefined,
    departamentoId: usuario.departamento_id || undefined,
  };
}

async function invokeAdminUsers<T>(method: 'GET' | 'POST' | 'DELETE', body?: unknown): Promise<T | null> {
  if (!isSupabaseAuthEnabled()) {
    return null;
  }

  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const {
    data: { session },
  } = await client.auth.getSession();

  if (!session?.access_token) {
    return null;
  }

  const response = await fetch(getSupabaseFunctionUrl('admin-users'), {
    method,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: getSupabaseAnonKey(),
      'Content-Type': 'application/json',
    },
    body: typeof body === 'undefined' ? undefined : JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error((data as { error?: string } | null)?.error || `Error ${response.status}`);
  }

  return data as T;
}

export async function listarUsuariosRemotosAdmin(): Promise<Usuario[] | null> {
  const data = await invokeAdminUsers<{ users: RemoteAdminUser[] }>('GET');
  if (!data) {
    return null;
  }

  return Array.isArray(data.users)
    ? data.users.map(normalizarUsuarioRemoto)
    : [];
}

export async function guardarUsuarioRemotoAdmin(payload: RemoteAdminPayload): Promise<{ userId: string } | null> {
  const data = await invokeAdminUsers<{ ok: boolean; userId: string }>('POST', payload);
  if (!data?.ok || !data.userId) {
    return null;
  }

  return { userId: data.userId };
}

export async function desactivarUsuarioRemotoAdmin(userId: string): Promise<boolean> {
  const data = await invokeAdminUsers<{ ok: boolean }>('DELETE', { userId });
  return Boolean(data?.ok);
}