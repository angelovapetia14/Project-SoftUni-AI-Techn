import { supabase } from './supabaseClient.js';

const POST_IMAGES_BUCKET = 'post-images';
const POSTS_FOLDER = 'posts';

export async function uploadImage(file) {
  if (!file) {
    return null;
  }

  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }

  const originalName = file.name || 'image';
  const uniqueFileName = `${Date.now()}-${originalName}`;
  const filePath = `${POSTS_FOLDER}/${uniqueFileName}`;

  const { error: uploadError } = await supabase.storage
    .from(POST_IMAGES_BUCKET)
    .upload(filePath, file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from(POST_IMAGES_BUCKET)
    .getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error('Failed to get public URL for uploaded image.');
  }

  return data.publicUrl;
}
