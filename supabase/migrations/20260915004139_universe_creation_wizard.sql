-- Reuse universes and posts.category. Ordered section names are saved atomically
-- with the Universe; no second community or board model is introduced.
alter table public.universes
  add column icon text not null default '',
  add column visibility text not null default 'public' check (visibility in ('public', 'private')),
  add column allow_member_posts boolean not null default true,
  add column allow_comments boolean not null default true,
  add column rules text not null default '' check (char_length(rules) <= 2000),
  add column sections text[] not null default array['정보','창작','질문','공지','기타'];

create unique index universes_slug_lower_unique on public.universes (lower(slug));

-- Restrictive policies compose with existing ownership policies. Private v1
-- Universes are owner-only; subscriptions are not access-granting memberships.
create policy universe_visibility on public.universes as restrictive for select
  to anon, authenticated using (visibility = 'public' or owner_id = (select auth.uid()));
create policy universe_post_visibility on public.posts as restrictive for select
  to anon, authenticated using (universe_slug is null or exists (
    select 1 from public.universes u where u.slug = universe_slug));
create policy universe_post_creation on public.posts as restrictive for insert
  to authenticated with check (universe_slug is null or exists (
    select 1 from public.universes u where u.slug = universe_slug
    and (u.allow_member_posts or u.owner_id = (select auth.uid()))));
create policy universe_post_update on public.posts as restrictive for update
  to authenticated using (universe_slug is null or exists (
    select 1 from public.universes u where u.slug = universe_slug))
  with check (universe_slug is null or exists (
    select 1 from public.universes u where u.slug = universe_slug
    and (u.allow_member_posts or u.owner_id = (select auth.uid()))));
create policy universe_comment_visibility on public.comments as restrictive for select
  to anon, authenticated using (exists (select 1 from public.posts p where p.id = post_id));
create policy universe_comment_creation on public.comments as restrictive for insert
  to authenticated with check (exists (select 1 from public.posts p where p.id = post_id
    and (p.universe_slug is null or exists (select 1 from public.universes u
      where u.slug = p.universe_slug and u.allow_comments))));
create policy universe_comment_update on public.comments as restrictive for update
  to authenticated using (exists (select 1 from public.posts p where p.id = post_id))
  with check (exists (select 1 from public.posts p where p.id = post_id
    and (p.universe_slug is null or exists (select 1 from public.universes u
      where u.slug = p.universe_slug and u.allow_comments))));
create policy universe_subscription_access on public.universe_subscriptions as restrictive for insert
  to authenticated with check (exists (select 1 from public.universes u where u.slug = universe_slug));

-- Only a boolean escapes this private lookup, including collisions with private
-- Universes. The exposed wrapper is an invoker, not a privileged public endpoint.
create schema if not exists private;
create function private.universe_slug_available(requested_slug text)
returns boolean language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  return requested_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    and char_length(requested_slug) <= 64
    and requested_slug not in ('create','new','edit','settings')
    and not exists (select 1 from public.universes where lower(slug) = lower(requested_slug));
end;
$$;
revoke all on function private.universe_slug_available(text) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.universe_slug_available(text) to authenticated;
create function public.universe_slug_available(requested_slug text)
returns boolean language sql stable security invoker set search_path = '' as $$
  select private.universe_slug_available(requested_slug);
$$;
revoke all on function public.universe_slug_available(text) from public, anon;
grant execute on function public.universe_slug_available(text) to authenticated;

-- Validate direct Data API writes as well as the wizard API.
create function private.validate_universe_creation()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or char_length(new.slug) > 64
    or new.slug in ('create','new','edit','settings')
    or char_length(btrim(new.name)) not between 1 and 60
    or char_length(coalesce(new.description,'')) > 280
    or char_length(new.icon) > 16
    or cardinality(new.sections) not between 1 and 8
    or array_ndims(new.sections) <> 1
    or exists (select 1 from unnest(new.sections) s where s is null or char_length(btrim(s)) not between 1 and 30)
    or (select count(distinct lower(btrim(s))) from unnest(new.sections) s) <> cardinality(new.sections)
  then raise exception 'Invalid Universe fields' using errcode = '23514'; end if;
  return new;
end;
$$;
create trigger validate_universe_creation before insert on public.universes
  for each row execute function private.validate_universe_creation();
