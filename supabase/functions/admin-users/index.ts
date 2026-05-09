import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
};

type AdminUserPayload = {
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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function assertEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function buildClients(req: Request) {
  const supabaseUrl = assertEnv('SUPABASE_URL');
  const serviceRoleKey = assertEnv('SUPABASE_SERVICE_ROLE_KEY');
  const authHeader = req.headers.get('Authorization') || '';

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const requesterClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  return { adminClient, requesterClient };
}

async function assertAdminAccess(req: Request) {
  const { adminClient, requesterClient } = buildClients(req);

  const {
    data: { user },
    error: authError,
  } = await requesterClient.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const { data: requesterProfile, error: profileError } = await adminClient
    .from('auth_user_payload')
    .select('rol, permisos, activo')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profileError || !requesterProfile?.activo) {
    throw new Error('Forbidden');
  }

  const role = String(requesterProfile.rol || '').toLowerCase();
  const permisos = Array.isArray(requesterProfile.permisos) ? requesterProfile.permisos : [];
  const canManageUsers = role === 'desarrollador'
    || role === 'administrador'
    || permisos.includes('usuarios.crear')
    || permisos.includes('usuarios.editar')
    || permisos.includes('usuarios.roles');

  if (!canManageUsers) {
    throw new Error('Forbidden');
  }

  return { adminClient, requesterId: user.id };
}

async function upsertUser(req: Request) {
  const { adminClient } = await assertAdminAccess(req);
  const payload = (await req.json()) as AdminUserPayload;

  if (!payload.email || !payload.username || !payload.nombre || !payload.roleId) {
    return jsonResponse({ error: 'Missing required fields' }, 400);
  }

  const metadata = {
    username: payload.username,
    nombre: payload.nombre,
    apellido: payload.apellido || '',
    role_id: payload.roleId,
    descripcion: payload.descripcion || '',
    telefono: payload.telefono || '',
    departamento_id: payload.departamentoId || '',
  };

  let userId = payload.userId;

  if (userId) {
    const { error: updateAuthError } = await adminClient.auth.admin.updateUserById(userId, {
      email: payload.email,
      password: payload.password || undefined,
      user_metadata: metadata,
    });

    if (updateAuthError) {
      return jsonResponse({ error: updateAuthError.message }, 400);
    }
  } else {
    if (!payload.password) {
      return jsonResponse({ error: 'Password is required for new users' }, 400);
    }

    const { data: createdUser, error: createAuthError } = await adminClient.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (createAuthError || !createdUser.user) {
      return jsonResponse({ error: createAuthError?.message || 'Unable to create user' }, 400);
    }

    userId = createdUser.user.id;
  }

  const { error: profileError } = await adminClient
    .from('user_profiles')
    .upsert({
      user_id: userId,
      username: payload.username,
      email: payload.email,
      nombre: payload.nombre,
      apellido: payload.apellido || '',
      role_id: payload.roleId,
      descripcion: payload.descripcion || '',
      telefono: payload.telefono || null,
      departamento_id: payload.departamentoId || null,
      activo: payload.activo !== false,
    });

  if (profileError) {
    return jsonResponse({ error: profileError.message }, 400);
  }

  return jsonResponse({ ok: true, userId });
}

async function listUsers(req: Request) {
  const { adminClient } = await assertAdminAccess(req);

  const { data, error } = await adminClient
    .from('auth_user_payload')
    .select('user_id, username, email, nombre, apellido, rol, permisos, activo, foto, descripcion, telefono, departamento_id')
    .order('nombre', { ascending: true })
    .order('apellido', { ascending: true });

  if (error) {
    return jsonResponse({ error: error.message }, 400);
  }

  return jsonResponse({ users: data || [] });
}

async function deactivateUser(req: Request) {
  const { adminClient } = await assertAdminAccess(req);
  const payload = (await req.json()) as Pick<AdminUserPayload, 'userId'>;

  if (!payload.userId) {
    return jsonResponse({ error: 'userId is required' }, 400);
  }

  const { error } = await adminClient
    .from('user_profiles')
    .update({ activo: false })
    .eq('user_id', payload.userId);

  if (error) {
    return jsonResponse({ error: error.message }, 400);
  }

  return jsonResponse({ ok: true, userId: payload.userId });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method === 'GET') {
      return await listUsers(req);
    }

    if (req.method === 'POST') {
      return await upsertUser(req);
    }

    if (req.method === 'DELETE') {
      return await deactivateUser(req);
    }

    return jsonResponse({ error: 'Method not allowed' }, 405);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return jsonResponse({ error: message }, status);
  }
});