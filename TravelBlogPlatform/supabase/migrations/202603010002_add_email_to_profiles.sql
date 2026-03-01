alter table if exists public.profiles
add column if not exists email text;
