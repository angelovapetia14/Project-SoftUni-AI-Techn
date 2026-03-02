import { assertSupabaseClient } from './supabaseClient.js';

async function requireCurrentUser() {
  const supabase = assertSupabaseClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message || 'Трябва да сте логнати');
  }

  if (!user) {
    throw new Error('Трябва да сте логнати');
  }

  return user;
}

export async function getCommentsByPostId(postId) {
  if (!postId) {
    throw new Error('Липсва ID на публикация');
  }

  const supabase = assertSupabaseClient();

  const { data, error } = await supabase
    .from('comments')
    .select('id, content, created_at, user_id, profiles(email, username)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message || 'Неуспешно зареждане на коментарите.');
  }

  return data ?? [];
}

export async function addComment(postId, content) {
  if (!postId) {
    throw new Error('Липсва ID на публикация');
  }

  if (!content?.trim()) {
    throw new Error('Коментарът не може да е празен');
  }

  const supabase = assertSupabaseClient();
  const user = await requireCurrentUser();

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      content: content.trim()
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message || 'Неуспешно добавяне на коментар.');
  }

  return data;
}

export async function updateComment(commentId, content) {
  if (!commentId) {
    throw new Error('Липсва ID на коментар');
  }

  if (!content?.trim()) {
    throw new Error('Коментарът не може да е празен');
  }

  const supabase = assertSupabaseClient();
  const user = await requireCurrentUser();

  const { data: existingComment, error: fetchError } = await supabase
    .from('comments')
    .select('id, user_id')
    .eq('id', commentId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message || 'Неуспешно зареждане на коментара.');
  }

  if (!existingComment) {
    throw new Error('Коментарът не е намерен');
  }

  if (existingComment.user_id !== user.id) {
    throw new Error('Нямате право да редактирате този коментар');
  }

  const { data, error: updateError } = await supabase
    .from('comments')
    .update({ content: content.trim() })
    .eq('id', commentId)
    .select('*')
    .single();

  if (updateError) {
    throw new Error(updateError.message || 'Неуспешно обновяване на коментара.');
  }

  return data;
}

export async function deleteComment(commentId) {
  if (!commentId) {
    throw new Error('Липсва ID на коментар');
  }

  const supabase = assertSupabaseClient();
  const user = await requireCurrentUser();

  const { data: existingComment, error: fetchError } = await supabase
    .from('comments')
    .select('id, user_id')
    .eq('id', commentId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message || 'Неуспешно зареждане на коментара.');
  }

  if (!existingComment) {
    throw new Error('Коментарът не е намерен');
  }

  if (existingComment.user_id !== user.id) {
    throw new Error('Нямате право да изтриете този коментар');
  }

  const { error: deleteError } = await supabase.from('comments').delete().eq('id', commentId);

  if (deleteError) {
    throw new Error(deleteError.message || 'Неуспешно изтриване на коментара.');
  }

  return true;
}
