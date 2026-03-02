import { assertSupabaseClient } from './supabaseClient.js';

async function requireCurrentUser() {
  const supabase = assertSupabaseClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message || 'You must be logged in');
  }

  if (!user) {
    throw new Error('You must be logged in');
  }

  return user;
}

export async function getCommentsByPostId(postId) {
  if (!postId) {
    throw new Error('Missing post ID');
  }

  const supabase = assertSupabaseClient();

  const { data, error } = await supabase
    .from('comments')
    .select('id, content, created_at, user_id, profiles(email, username)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message || 'Failed to load comments.');
  }

  return data ?? [];
}

export async function addComment(postId, content) {
  if (!postId) {
    throw new Error('Missing post ID');
  }

  if (!content?.trim()) {
    throw new Error('Comment cannot be empty');
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
    throw new Error(error.message || 'Failed to add comment.');
  }

  return data;
}

export async function updateComment(commentId, content) {
  if (!commentId) {
    throw new Error('Missing comment ID');
  }

  if (!content?.trim()) {
    throw new Error('Comment cannot be empty');
  }

  const supabase = assertSupabaseClient();
  const user = await requireCurrentUser();

  const { data: existingComment, error: fetchError } = await supabase
    .from('comments')
    .select('id, user_id')
    .eq('id', commentId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message || 'Failed to load comment.');
  }

  if (!existingComment) {
    throw new Error('Comment not found');
  }

  if (existingComment.user_id !== user.id) {
    throw new Error('You are not allowed to edit this comment');
  }

  const { data, error: updateError } = await supabase
    .from('comments')
    .update({ content: content.trim() })
    .eq('id', commentId)
    .select('*')
    .single();

  if (updateError) {
    throw new Error(updateError.message || 'Failed to update comment.');
  }

  return data;
}

export async function deleteComment(commentId) {
  if (!commentId) {
    throw new Error('Missing comment ID');
  }

  const supabase = assertSupabaseClient();
  const user = await requireCurrentUser();

  const { data: existingComment, error: fetchError } = await supabase
    .from('comments')
    .select('id, user_id')
    .eq('id', commentId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message || 'Failed to load comment.');
  }

  if (!existingComment) {
    throw new Error('Comment not found');
  }

  if (existingComment.user_id !== user.id) {
    throw new Error('You are not allowed to delete this comment');
  }

  const { error: deleteError } = await supabase.from('comments').delete().eq('id', commentId);

  if (deleteError) {
    throw new Error(deleteError.message || 'Failed to delete comment.');
  }

  return true;
}
