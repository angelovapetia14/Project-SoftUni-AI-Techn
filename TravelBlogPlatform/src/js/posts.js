import { assertSupabaseClient } from './supabaseClient.js';
import { showError, showSuccess } from './toast.js';

const POST_IMAGES_BUCKET = 'post-images';
const POSTS_FOLDER = 'posts';

export async function uploadImage(file) {
  if (!file) {
    return null;
  }

  const supabase = assertSupabaseClient();

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

function normalizeMessage(error, fallback) {
  return error?.message || fallback;
}

function isMissingColumnError(error, columnName) {
  const message = error?.message?.toLowerCase() ?? '';
  const normalizedColumn = columnName.toLowerCase();

  return (
    (message.includes(`column "${normalizedColumn}"`) && message.includes('does not exist')) ||
    (message.includes(normalizedColumn) && message.includes('schema cache')) ||
    (message.includes(normalizedColumn) && message.includes('could not find the'))
  );
}

function buildHandledError(message) {
  const handledError = new Error(message);
  handledError.toastShown = true;
  return handledError;
}

function validatePostFields(title, destination, description) {
  if (!title?.trim() || !destination?.trim() || !description?.trim()) {
    throw new Error('Title, destination и description са задължителни.');
  }
}

async function getCurrentUserId() {
  const supabase = assertSupabaseClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error('Трябва да сте логнати');
  }

  const username = user.email?.split('@')[0] ?? `user-${user.id.slice(0, 6)}`;

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    username,
    role: 'user'
  });

  if (profileError) {
    throw profileError;
  }

  return user.id;
}

export async function getPostById(postId) {
  if (!postId) {
    throw new Error('Липсва ID на публикация');
  }

  const supabase = assertSupabaseClient();

  try {
    const { data, error } = await supabase.from('posts').select('*').eq('id', postId).single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    const message = normalizeMessage(error, 'Неуспешно зареждане на публикацията.');
    showError(message);
    throw buildHandledError(message);
  }
}

export async function createPost(title, destination, description, imageFile, travelDate) {
  try {
    validatePostFields(title, destination, description);

    const supabase = assertSupabaseClient();
    const currentUserId = await getCurrentUserId();
    const imageUrl = imageFile ? await uploadImage(imageFile) : null;

    const payload = {
      title: title.trim(),
      destination: destination.trim(),
      description: description.trim(),
      travel_date: travelDate || null,
      image_url: imageUrl,
      user_id: currentUserId
    };

    let { error } = await supabase.from('posts').insert(payload);

    if (
      error &&
      (isMissingColumnError(error, 'travel_date') || isMissingColumnError(error, 'image_url'))
    ) {
      const fallbackPayload = {
        title: payload.title,
        destination: payload.destination,
        description: payload.description,
        user_id: payload.user_id
      };

      ({ error } = await supabase.from('posts').insert(fallbackPayload));
    }

    if (error) {
      throw error;
    }

    showSuccess('Публикацията е създадена');
    window.location.href = '/index.html';
  } catch (error) {
    const message = normalizeMessage(error, 'Неуспешно създаване на публикацията.');
    showError(message);
    throw buildHandledError(message);
  }
}

export async function updatePost(postId, title, destination, description, imageFile, travelDate) {
  try {
    if (!postId) {
      throw new Error('Липсва ID на публикация');
    }

    validatePostFields(title, destination, description);

    const supabase = assertSupabaseClient();
    const currentUserId = await getCurrentUserId();
    const existingPost = await getPostById(postId);

    if (existingPost.user_id !== currentUserId) {
      throw new Error('Нямате право да редактирате този пост');
    }

    let imageUrl = existingPost.image_url ?? null;

    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const payload = {
      title: title.trim(),
      destination: destination.trim(),
      description: description.trim(),
      travel_date: travelDate || null,
      image_url: imageUrl
    };

    let { error } = await supabase.from('posts').update(payload).eq('id', postId);

    if (
      error &&
      (isMissingColumnError(error, 'travel_date') || isMissingColumnError(error, 'image_url'))
    ) {
      const fallbackPayload = {
        title: payload.title,
        destination: payload.destination,
        description: payload.description
      };

      ({ error } = await supabase.from('posts').update(fallbackPayload).eq('id', postId));
    }

    if (error) {
      throw error;
    }

    showSuccess('Публикацията е обновена');
    window.location.href = `/post-details.html?id=${postId}`;
  } catch (error) {
    const message = normalizeMessage(error, 'Неуспешно обновяване на публикацията.');
    if (!error?.toastShown) {
      showError(message);
    }
    throw buildHandledError(message);
  }
}
