-- ================================================================
-- UTEQ SMART PARKING — AMPLIACIÓN CRUD
-- Ejecutar DESPUÉS de supabase_parqueadero_uteq.sql
--
-- La práctica anterior dejó la tabla `vehiculos` en modo solo lectura
-- (unicamente SELECT para anon/authenticated). Esta práctica agrega
-- Agregar / Editar / Eliminar desde el panel administrativo, por lo
-- que se amplían los permisos y las políticas de RLS.
--
-- IMPORTANTE (alcance académico):
-- Esta práctica no incluye autenticación, así que el panel se
-- administra con la clave publishable (anon). Por eso las políticas
-- de escritura usan `using (true)` / `with check (true)`: cualquiera
-- que tenga la publishable key puede administrar el CRUD. En un
-- entorno real esto se restringiría a un rol autenticado (auth.uid())
-- o se movería a funciones RPC con `security definer`.
-- ================================================================

begin;

-- ----------------------------------------------------------------
-- 1. LECTURA AMPLIADA PARA EL PANEL ADMINISTRATIVO
-- El formulario de "Editar" necesita la cédula completa y el correo
-- de Microsoft para no sobrescribirlos con valores vacíos al guardar.
-- (cedula_enmascarada sigue siendo la única columna de cédula visible
-- para cualquier consumidor de solo lectura del listado público).
-- ----------------------------------------------------------------
grant select (
  cedula_propietario,
  correo_microsoft,
  created_at
) on public.vehiculos to anon, authenticated;

-- ----------------------------------------------------------------
-- 2. INSERTAR VEHICULO + PROPIETARIO
-- ----------------------------------------------------------------
grant insert (
  placa,
  marca,
  modelo,
  anio,
  color,
  tipo,
  foto_url,
  foto_fuente_url,
  foto_propietario_url,
  cedula_propietario,
  propietario_nombre,
  correo_institucional,
  correo_microsoft,
  autorizado
) on public.vehiculos to anon, authenticated;

drop policy if exists "Insertar vehiculos desde el panel administrativo"
  on public.vehiculos;

create policy "Insertar vehiculos desde el panel administrativo"
on public.vehiculos
for insert
to anon, authenticated
with check (true);

-- ----------------------------------------------------------------
-- 3. EDITAR VEHICULO + PROPIETARIO
-- ----------------------------------------------------------------
grant update (
  placa,
  marca,
  modelo,
  anio,
  color,
  tipo,
  foto_url,
  foto_fuente_url,
  foto_propietario_url,
  cedula_propietario,
  propietario_nombre,
  correo_institucional,
  correo_microsoft,
  autorizado
) on public.vehiculos to anon, authenticated;

drop policy if exists "Actualizar vehiculos desde el panel administrativo"
  on public.vehiculos;

create policy "Actualizar vehiculos desde el panel administrativo"
on public.vehiculos
for update
to anon, authenticated
using (true)
with check (true);

-- ----------------------------------------------------------------
-- 4. ELIMINAR VEHICULO + PROPIETARIO
-- ----------------------------------------------------------------
grant delete on public.vehiculos to anon, authenticated;

drop policy if exists "Eliminar vehiculos desde el panel administrativo"
  on public.vehiculos;

create policy "Eliminar vehiculos desde el panel administrativo"
on public.vehiculos
for delete
to anon, authenticated
using (true);

commit;

-- ----------------------------------------------------------------
-- 5. VERIFICACIÓN
-- ----------------------------------------------------------------
select grantee, privilege_type, column_name
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'vehiculos'
  and grantee in ('anon', 'authenticated')
order by grantee, privilege_type, column_name;

select policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename = 'vehiculos';
