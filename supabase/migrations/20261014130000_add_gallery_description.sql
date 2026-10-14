alter table public.gallery
  add column if not exists description text not null default ''
  check (char_length(description) <= 2000);
