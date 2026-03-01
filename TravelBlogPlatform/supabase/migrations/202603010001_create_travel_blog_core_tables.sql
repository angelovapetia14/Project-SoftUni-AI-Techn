create table if not exists public.profiles (
  id uuid primary key references auth.users(id),
  username text not null,
  avatar_url text,
  role text default 'user',
  created_at timestamp default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  destination text,
  description text,
  user_id uuid references public.profiles(id),
  created_at timestamp default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  post_id uuid references public.posts(id),
  uploaded_by uuid references public.profiles(id),
  created_at timestamp default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  post_id uuid references public.posts(id),
  user_id uuid references public.profiles(id),
  created_at timestamp default now()
);
