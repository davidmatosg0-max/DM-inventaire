create table if not exists public.app_roles (
  id text primary key,
  nombre text not null,
  descripcion text not null default '',
  color text not null default '#1E73BE',
  icono text not null default '👤',
  activo boolean not null default true,
  predeterminado boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.app_role_permissions (
  role_id text not null references public.app_roles(id) on delete cascade,
  permission_id text not null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (role_id, permission_id)
);

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  email text not null unique,
  nombre text not null,
  apellido text not null default '',
  role_id text not null references public.app_roles(id),
  activo boolean not null default true,
  foto text,
  descripcion text,
  telefono text,
  departamento_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.touch_updated_at_generic()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_touch_app_roles_updated_at on public.app_roles;
create trigger trg_touch_app_roles_updated_at
before update on public.app_roles
for each row
execute function public.touch_updated_at_generic();

drop trigger if exists trg_touch_user_profiles_updated_at on public.user_profiles;
create trigger trg_touch_user_profiles_updated_at
before update on public.user_profiles
for each row
execute function public.touch_updated_at_generic();

insert into public.app_roles (id, nombre, descripcion, color, icono, activo, predeterminado)
values
  ('desarrollador', 'Développeur', 'Accès complet au système', '#000000', '💻', true, true),
  ('administrador', 'Administrateur', 'Gestion complète du système', '#DC3545', '👑', true, true),
  ('coordinador', 'Coordinateur', 'Coordination des opérations', '#1E73BE', '📋', true, true),
  ('responsable_entrepot', 'Responsable Entrepôt', 'Gestion de l''inventaire et du stock', '#4CAF50', '📦', true, true),
  ('responsable_comptoir', 'Responsable Comptoir', 'Gestion du comptoir et des commandes', '#FF9800', '🛒', true, true),
  ('responsable_transport', 'Responsable Transport', 'Gestion des routes et livraisons', '#FFC107', '🚚', true, true),
  ('liaison_organisme', 'Liaison Organisme', 'Gestion des organismes partenaires', '#9C27B0', '🏛️', true, true),
  ('benevole_comptoir', 'Bénévole Comptoir', 'Accès lecture comptoir', '#03A9F4', '🤝', true, true),
  ('benevole_entrepot', 'Bénévole Entrepôt', 'Accès lecture entrepôt', '#009688', '🧺', true, true),
  ('employe', 'Employé', 'Accès opérationnel standard', '#607D8B', '🧑‍💼', true, true),
  ('visualizador', 'Visualisateur', 'Accès lecture limité', '#607D8B', '👁️', true, true)
on conflict (id) do update
set
  nombre = excluded.nombre,
  descripcion = excluded.descripcion,
  color = excluded.color,
  icono = excluded.icono,
  activo = excluded.activo,
  predeterminado = excluded.predeterminado;

delete from public.app_role_permissions;

with role_permissions(role_id, permissions) as (
  values
    ('desarrollador', array[
      'dashboard.ver','inventario.ver','inventario.crear','inventario.editar','inventario.eliminar','inventario.movimientos','inventario.ajustes',
      'comandas.ver','comandas.crear','comandas.editar','comandas.eliminar','comandas.aprobar','comandas.completar',
      'prs.ver','prs.registrar','prs.editar','prs.eliminar','prs.categorias',
      'organismos.ver','organismos.crear','organismos.editar','organismos.eliminar','organismos.perfil','organismos.documentos',
      'transporte.ver','transporte.crear','transporte.editar','transporte.eliminar','transporte.entregar','transporte.vehiculos',
      'reportes.ver','reportes.generar','reportes.exportar','reportes.avanzados',
      'achat.ver','achat.crear','achat.autorizar',
      'usuarios.ver','usuarios.crear','usuarios.editar','usuarios.eliminar','usuarios.roles','usuarios.permisos',
      'iddigital.ver','iddigital.crear','iddigital.editar','iddigital.eliminar','iddigital.imprimir',
      'configuracion.ver','configuracion.editar','configuracion.marca','configuracion.idioma'
    ]::text[]),
    ('administrador', array[
      'dashboard.ver','inventario.ver','inventario.crear','inventario.editar','inventario.eliminar','inventario.movimientos','inventario.ajustes',
      'comandas.ver','comandas.crear','comandas.editar','comandas.eliminar','comandas.aprobar','comandas.completar',
      'prs.ver','prs.registrar','prs.editar','prs.eliminar','prs.categorias',
      'organismos.ver','organismos.crear','organismos.editar','organismos.eliminar','organismos.perfil','organismos.documentos',
      'transporte.ver','transporte.crear','transporte.editar','transporte.eliminar','transporte.entregar','transporte.vehiculos',
      'reportes.ver','reportes.generar','reportes.exportar','reportes.avanzados',
      'achat.ver','achat.crear','achat.autorizar',
      'usuarios.ver','usuarios.crear','usuarios.editar','usuarios.eliminar','usuarios.roles','usuarios.permisos',
      'iddigital.ver','iddigital.crear','iddigital.editar','iddigital.eliminar','iddigital.imprimir',
      'configuracion.ver','configuracion.editar','configuracion.marca','configuracion.idioma'
    ]::text[]),
    ('coordinador', array['dashboard.ver','inventario.ver','inventario.editar','inventario.movimientos','comandas.ver','comandas.crear','comandas.editar','comandas.aprobar','prs.ver','prs.registrar','organismos.ver','organismos.crear','organismos.editar','organismos.perfil','transporte.ver','reportes.ver','reportes.generar','reportes.exportar','reportes.avanzados','achat.ver','achat.crear']::text[]),
    ('responsable_entrepot', array['dashboard.ver','inventario.ver','inventario.crear','inventario.editar','inventario.movimientos','inventario.ajustes','comandas.ver','comandas.completar','prs.ver','prs.registrar','prs.editar','organismos.ver','reportes.ver','achat.ver']::text[]),
    ('responsable_comptoir', array['dashboard.ver','comandas.ver','comandas.crear','comandas.editar','organismos.ver','reportes.ver','achat.ver']::text[]),
    ('responsable_transport', array['dashboard.ver','comandas.ver','organismos.ver','transporte.ver','transporte.crear','transporte.editar','transporte.entregar','transporte.vehiculos','reportes.ver']::text[]),
    ('liaison_organisme', array['dashboard.ver','organismos.ver','organismos.crear','organismos.editar','organismos.eliminar','organismos.perfil','organismos.documentos','comandas.ver','comandas.crear','comandas.editar','comandas.aprobar','reportes.ver','achat.ver','achat.crear']::text[]),
    ('benevole_comptoir', array['dashboard.ver','comandas.ver','organismos.ver']::text[]),
    ('benevole_entrepot', array['dashboard.ver','inventario.ver','prs.ver']::text[]),
    ('employe', array['dashboard.ver','inventario.ver','comandas.ver','organismos.ver','reportes.ver']::text[]),
    ('visualizador', array['dashboard.ver','reportes.ver']::text[])
)
insert into public.app_role_permissions (role_id, permission_id)
select role_id, unnest(permissions)
from role_permissions;

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_role text;
begin
  default_role := coalesce(new.raw_user_meta_data->>'role_id', 'visualizador');

  insert into public.user_profiles (
    user_id,
    username,
    email,
    nombre,
    apellido,
    role_id,
    activo,
    descripcion,
    telefono,
    departamento_id
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'apellido', ''),
    case when exists (select 1 from public.app_roles where id = default_role) then default_role else 'visualizador' end,
    true,
    coalesce(new.raw_user_meta_data->>'descripcion', ''),
    new.raw_user_meta_data->>'telefono',
    new.raw_user_meta_data->>'departamento_id'
  )
  on conflict (user_id) do update
  set
    username = excluded.username,
    email = excluded.email,
    nombre = excluded.nombre,
    apellido = excluded.apellido,
    role_id = excluded.role_id,
    descripcion = excluded.descripcion,
    telefono = excluded.telefono,
    departamento_id = excluded.departamento_id,
    activo = true;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_auth_user_created();

create or replace function public.resolve_auth_login(login_input text)
returns table(email text)
language sql
security definer
set search_path = public
as $$
  select up.email
  from public.user_profiles up
  where up.activo = true
    and (
      lower(up.username) = lower(trim(login_input))
      or lower(up.email) = lower(trim(login_input))
    )
  limit 1;
$$;

create or replace view public.auth_user_payload as
select
  up.user_id,
  up.username,
  up.email,
  up.nombre,
  up.apellido,
  up.role_id as rol,
  up.activo,
  up.foto,
  up.descripcion,
  up.telefono,
  up.departamento_id,
  coalesce(array_agg(distinct arp.permission_id) filter (where arp.permission_id is not null), '{}'::text[]) as permisos
from public.user_profiles up
left join public.app_role_permissions arp on arp.role_id = up.role_id
group by
  up.user_id,
  up.username,
  up.email,
  up.nombre,
  up.apellido,
  up.role_id,
  up.activo,
  up.foto,
  up.descripcion,
  up.telefono,
  up.departamento_id;

alter table public.app_roles enable row level security;
alter table public.app_role_permissions enable row level security;
alter table public.user_profiles enable row level security;

drop policy if exists "Read roles catalog" on public.app_roles;
create policy "Read roles catalog"
on public.app_roles
for select
to anon, authenticated
using (true);

drop policy if exists "Read role permissions catalog" on public.app_role_permissions;
create policy "Read role permissions catalog"
on public.app_role_permissions
for select
to anon, authenticated
using (true);

drop policy if exists "Users can read own profile" on public.user_profiles;
create policy "Users can read own profile"
on public.user_profiles
for select
to authenticated
using (auth.uid() = user_id);

grant execute on function public.resolve_auth_login(text) to anon, authenticated;
grant select on public.app_roles to anon, authenticated;
grant select on public.app_role_permissions to anon, authenticated;
grant select on public.auth_user_payload to authenticated;
