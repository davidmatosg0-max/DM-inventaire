create table if not exists public.app_storage (
  storage_key text primary key,
  payload jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.touch_app_storage_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_touch_app_storage_updated_at on public.app_storage;
create trigger trg_touch_app_storage_updated_at
before update on public.app_storage
for each row
execute function public.touch_app_storage_updated_at();

alter table public.app_storage enable row level security;

drop policy if exists "Authenticated users can read app storage" on public.app_storage;
drop policy if exists "Authenticated users can write app storage" on public.app_storage;
drop policy if exists "Public users can read operational app storage" on public.app_storage;
drop policy if exists "Public users can write operational app storage" on public.app_storage;

create policy "Public users can read operational app storage"
on public.app_storage
for select
to anon, authenticated
using (
  storage_key = any (
    array[
      'organismos_banco_alimentos',
      'banco_alimentos_productos',
      'banco_alimentos_entradas_inventario',
      'banco_alimentos_movimientos',
      'banco_alimentos_comandas'
    ]
  )
);

create policy "Public users can write operational app storage"
on public.app_storage
for all
to anon, authenticated
using (
  storage_key = any (
    array[
      'organismos_banco_alimentos',
      'banco_alimentos_productos',
      'banco_alimentos_entradas_inventario',
      'banco_alimentos_movimientos',
      'banco_alimentos_comandas'
    ]
  )
)
with check (
  storage_key = any (
    array[
      'organismos_banco_alimentos',
      'banco_alimentos_productos',
      'banco_alimentos_entradas_inventario',
      'banco_alimentos_movimientos',
      'banco_alimentos_comandas'
    ]
  )
);