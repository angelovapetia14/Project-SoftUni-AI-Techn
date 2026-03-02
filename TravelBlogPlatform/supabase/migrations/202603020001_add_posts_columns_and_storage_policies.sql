alter table public.posts
add column if not exists travel_date date,
add column if not exists image_url text;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'posts'
      and policyname = 'Posts are viewable by everyone'
  ) then
    create policy "Posts are viewable by everyone"
    on public.posts
    for select
    to public
    using (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'posts'
      and policyname = 'Authenticated users can create own posts'
  ) then
    create policy "Authenticated users can create own posts"
    on public.posts
    for insert
    to authenticated
    with check (auth.uid() = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'posts'
      and policyname = 'Authenticated users can update own posts'
  ) then
    create policy "Authenticated users can update own posts"
    on public.posts
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can view post images'
  ) then
    create policy "Public can view post images"
    on storage.objects
    for select
    to public
    using (bucket_id = 'post-images');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Authenticated users can upload post images'
  ) then
    create policy "Authenticated users can upload post images"
    on storage.objects
    for insert
    to authenticated
    with check (
      bucket_id = 'post-images'
      and (storage.foldername(name))[1] = 'posts'
    );
  end if;
end
$$;
