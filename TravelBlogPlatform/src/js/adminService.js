import { assertSupabaseClient } from './supabaseClient.js';

function getDisplayAuthor(profile) {
  if (profile?.username) {
    return profile.username;
  }

  if (profile?.email) {
    return profile.email;
  }

  return 'Unknown user';
}

export async function getPostsForAdmin() {
  const supabase = assertSupabaseClient();

  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, title, destination, created_at, travel_date, user_id')
    .order('created_at', { ascending: false });

  if (postsError) {
    throw postsError;
  }

  const userIds = [...new Set((posts ?? []).map((post) => post.user_id).filter(Boolean))];

  let profilesById = new Map();

  if (userIds.length) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, username')
      .in('id', userIds);

    if (profilesError) {
      throw profilesError;
    }

    profilesById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  }

  return (posts ?? []).map((post) => {
    const profile = profilesById.get(post.user_id);

    return {
      ...post,
      authorDisplay: getDisplayAuthor(profile),
      authorEmail: profile?.email ?? ''
    };
  });
}

export async function deletePostAdmin(postId) {
  const supabase = assertSupabaseClient();
  const { error } = await supabase.from('posts').delete().eq('id', postId);

  if (error) {
    throw error;
  }
}

export async function getCommentsForAdmin() {
  const supabase = assertSupabaseClient();

  const { data, error } = await supabase
    .from('comments')
    .select('id, content, created_at, post_id, user_id, profiles(email, username), posts(title)')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function updateCommentAdmin(commentId, content) {
  const supabase = assertSupabaseClient();

  const { error } = await supabase
    .from('comments')
    .update({ content })
    .eq('id', commentId);

  if (error) {
    throw error;
  }
}

export async function deleteCommentAdmin(commentId) {
  const supabase = assertSupabaseClient();
  const { error } = await supabase.from('comments').delete().eq('id', commentId);

  if (error) {
    throw error;
  }
}

export async function getUsersForAdmin() {
  const supabase = assertSupabaseClient();

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, username, role, created_at')
    .order('created_at', { ascending: false });

  if (profilesError) {
    throw profilesError;
  }

  return profiles ?? [];
}

export async function updateUserRoleAdmin(userId, role) {
  const supabase = assertSupabaseClient();

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}

export async function deleteUserAdmin(userId, currentUserId) {
  if (!userId) {
    throw new Error('Missing user ID.');
  }

  if (userId === currentUserId) {
    throw new Error('Не може да изтриеш собствения си админ профил.');
  }

  const supabase = assertSupabaseClient();

  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id')
    .eq('user_id', userId);

  if (postsError) {
    throw postsError;
  }

  const postIds = (posts ?? []).map((post) => post.id).filter(Boolean);

  if (postIds.length) {
    const { error: commentsByPostError } = await supabase.from('comments').delete().in('post_id', postIds);
    if (commentsByPostError) {
      throw commentsByPostError;
    }

    const { error: photosByPostError } = await supabase.from('photos').delete().in('post_id', postIds);
    if (photosByPostError) {
      throw photosByPostError;
    }
  }

  const { error: userCommentsError } = await supabase.from('comments').delete().eq('user_id', userId);
  if (userCommentsError) {
    throw userCommentsError;
  }

  const { error: userPhotosError } = await supabase.from('photos').delete().eq('uploaded_by', userId);
  if (userPhotosError) {
    throw userPhotosError;
  }

  const { error: postsDeleteError } = await supabase.from('posts').delete().eq('user_id', userId);
  if (postsDeleteError) {
    throw postsDeleteError;
  }

  const { error: profileDeleteError } = await supabase.from('profiles').delete().eq('id', userId);
  if (profileDeleteError) {
    throw profileDeleteError;
  }
}
