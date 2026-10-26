-- Operator co-ownership without replacing the original creator (owner_id).
-- Grant operator privileges explicitly to a trusted auth.users.id after deployment.
create schema if not exists private;

create table if not exists private.universe_operators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now()
);
alter table private.universe_operators enable row level security;
revoke all on table private.universe_operators from public, anon, authenticated;

create or replace function private.is_dverse_operator()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from private.universe_operators
    where user_id = (select auth.uid())
  );
$$;
revoke all on function private.is_dverse_operator() from public, anon, authenticated;
grant usage on schema private to anon, authenticated;
grant execute on function private.is_dverse_operator() to anon, authenticated;

-- This is a self-only boolean lookup, never a client-controlled profile flag.
create or replace function public.is_dverse_operator()
returns boolean language sql stable security invoker set search_path = '' as $$
  select private.is_dverse_operator();
$$;
revoke all on function public.is_dverse_operator() from public, anon, authenticated;
grant execute on function public.is_dverse_operator() to anon, authenticated;

alter table public.universes
  add column moderation_status text not null default 'active'
    check (moderation_status in ('active', 'hidden', 'removed')),
  add column moderation_reason text,
  add column moderated_at timestamptz,
  add column moderated_by uuid references auth.users(id) on delete set null;
alter table public.universes
  add constraint universe_moderation_reason_length
    check (moderation_reason is null or char_length(moderation_reason) <= 500);
create index universes_moderation_status_idx on public.universes(moderation_status);

-- Check parent moderation state without a recursive universes RLS subquery.
create or replace function private.is_parent_universe_active(requested_parent text)
returns boolean language sql stable security definer set search_path = '' as $$
  select requested_parent is null or exists (
    select 1 from public.universes
    where slug = requested_parent and moderation_status = 'active'
  );
$$;
revoke all on function private.is_parent_universe_active(text) from public, anon, authenticated;
grant execute on function private.is_parent_universe_active(text) to anon, authenticated;

drop policy if exists universe_visibility on public.universes;
create policy universe_visibility on public.universes as restrictive for select
to anon, authenticated using (
  (select private.is_dverse_operator())
  or (
    moderation_status = 'active'
    and private.is_parent_universe_active(parent_slug)
    and (visibility = 'public' or owner_id = (select auth.uid()))
  )
);

-- Keep the author's ownership policy; add a second policy for the operator.
create policy universe_operator_update on public.universes for update
to authenticated using ((select private.is_dverse_operator()))
with check ((select private.is_dverse_operator()));

-- Never physically DELETE through the public Data API: retain data for recovery.
drop policy if exists "owners can delete universes" on public.universes;
revoke delete on public.universes from anon, authenticated;

create table private.universe_moderation_log (
  id bigint generated always as identity primary key,
  universe_slug text not null,
  actor_id uuid not null,
  actor_role text not null check (actor_role in ('operator', 'creator')),
  previous_status text not null,
  new_status text not null,
  reason text,
  created_at timestamptz not null default now()
);
alter table private.universe_moderation_log enable row level security;
revoke all on table private.universe_moderation_log from public, anon, authenticated;

-- Immutable creator and guarded, auditable moderation for API and direct writes.
create or replace function private.guard_universe_ownership_and_moderation()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  is_operator boolean := private.is_dverse_operator();
begin
  if tg_op = 'INSERT' then
    new.moderation_status := 'active';
    new.moderation_reason := null;
    new.moderated_at := null;
    new.moderated_by := null;
    return new;
  end if;

  if new.owner_id is distinct from old.owner_id then
    raise exception 'Universe creator cannot be reassigned' using errcode = '42501';
  end if;

  if new.moderation_status is distinct from old.moderation_status then
    if actor is null or not (
      is_operator or (
        actor = old.owner_id
        and old.moderation_status = 'active'
        and new.moderation_status = 'removed'
      )
    ) then
      raise exception 'Not allowed to moderate this Universe' using errcode = '42501';
    end if;
    if new.moderation_status = 'active' then
      new.moderation_reason := null;
    end if;
    new.moderated_at := now();
    new.moderated_by := actor;
    insert into private.universe_moderation_log
      (universe_slug, actor_id, actor_role, previous_status, new_status, reason)
    values (
      old.slug, actor, case when is_operator then 'operator' else 'creator' end,
      old.moderation_status, new.moderation_status, new.moderation_reason
    );
  elsif new.moderation_reason is distinct from old.moderation_reason
     or new.moderated_at is distinct from old.moderated_at
     or new.moderated_by is distinct from old.moderated_by then
    raise exception 'Moderation records cannot be edited' using errcode = '42501';
  end if;

  return new;
end;
$$;
revoke all on function private.guard_universe_ownership_and_moderation() from public, anon, authenticated;
create trigger guard_universe_ownership_and_moderation
before insert or update on public.universes
for each row execute function private.guard_universe_ownership_and_moderation();

-- Manual one-time operator grant (do NOT grant the first future signup automatically):
-- insert into private.universe_operators(user_id) values ('<verified-auth-user-uuid>');
