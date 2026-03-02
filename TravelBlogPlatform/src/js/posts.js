import { assertSupabaseClient } from './supabaseClient.js';
import { showError, showInfo, showSuccess } from './toast.js';
import { getProfileRole } from './auth.js';

const POST_IMAGES_BUCKET = 'post-images';
const POSTS_FOLDER = 'posts';
const MAX_IMAGE_WIDTH = 1600;
const MAX_IMAGE_HEIGHT = 1200;
const IMAGE_QUALITY = 0.85;

function getScaledDimensions(width, height, maxWidth, maxHeight) {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const ratio = Math.min(widthRatio, heightRatio);

  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio)
  };
}

async function loadImageFromFile(file) {
  return await new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image.'));
    };

    image.src = objectUrl;
  });
}

function getFileExtensionFromMime(mimeType) {
  if (mimeType === 'image/jpeg') {
    return 'jpg';
  }

  if (mimeType === 'image/png') {
    return 'png';
  }

  if (mimeType === 'image/webp') {
    return 'webp';
  }

  return 'jpg';
}

async function resizeAndScaleImage(file) {
  if (!file?.type?.startsWith('image/')) {
    return file;
  }

  const image = await loadImageFromFile(file);
  const scaled = getScaledDimensions(image.width, image.height, MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT);

  if (scaled.width === image.width && scaled.height === image.height) {
    return file;
  }

  const canvas = document.createElement('canvas');
  canvas.width = scaled.width;
  canvas.height = scaled.height;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to resize image.');
  }

  context.drawImage(image, 0, 0, scaled.width, scaled.height);

  const outputType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    ? file.type
    : 'image/jpeg';

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (value) => {
        if (!value) {
          reject(new Error('Failed to generate image blob.'));
          return;
        }

        resolve(value);
      },
      outputType,
      IMAGE_QUALITY
    );
  });

  const extension = getFileExtensionFromMime(outputType);
  const originalNameWithoutExtension = (file.name || 'image').replace(/\.[^/.]+$/, '');

  return new File([blob], `${originalNameWithoutExtension}.${extension}`, {
    type: outputType,
    lastModified: Date.now()
  });
}

export async function uploadImage(file) {
  if (!file) {
    return null;
  }

  const supabase = assertSupabaseClient();
  const processedFile = await resizeAndScaleImage(file);

  const originalName = processedFile.name || file.name || 'image';
  const uniqueFileName = `${Date.now()}-${originalName}`;
  const filePath = `${POSTS_FOLDER}/${uniqueFileName}`;

  const { error: uploadError } = await supabase.storage
    .from(POST_IMAGES_BUCKET)
    .upload(filePath, processedFile);

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
    throw new Error('Title, destination and description are required.');
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
    throw new Error('You must be logged in');
  }

  const { data: existingProfile, error: profileFetchError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileFetchError) {
    throw profileFetchError;
  }

  if (!existingProfile) {
    const username = user.email?.split('@')[0] ?? `user-${user.id.slice(0, 6)}`;

    const { error: profileError } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      username,
      role: 'user'
    });

    if (profileError) {
      throw profileError;
    }
  }

  return user.id;
}

async function getCurrentUserContext() {
  const currentUserId = await getCurrentUserId();
  const role = await getProfileRole(currentUserId);

  return {
    userId: currentUserId,
    role
  };
}

async function insertPhotoRecord(postId, imageUrl, uploadedBy) {
  if (!postId || !imageUrl || !uploadedBy) {
    return;
  }

  const supabase = assertSupabaseClient();

  const { error } = await supabase.from('photos').insert({
    post_id: postId,
    image_url: imageUrl,
    uploaded_by: uploadedBy
  });

  if (error) {
    throw error;
  }
}

export async function getPostById(postId) {
  if (!postId) {
    throw new Error('Missing post ID');
  }

  const supabase = assertSupabaseClient();

  try {
    const { data, error } = await supabase.from('posts').select('*').eq('id', postId).single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    const message = normalizeMessage(error, 'Failed to load post.');
    showError(message);
    throw buildHandledError(message);
  }
}

export async function getAllPosts() {
  const supabase = assertSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, destination, description, image_url, created_at, travel_date, user_id')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data ?? [];
  } catch (error) {
    const message = normalizeMessage(error, 'Failed to load posts.');
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

    let insertedPostId = null;

    let { data: insertedPost, error } = await supabase.from('posts').insert(payload).select('id').single();

    insertedPostId = insertedPost?.id ?? null;

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

      ({ data: insertedPost, error } = await supabase.from('posts').insert(fallbackPayload).select('id').single());
      insertedPostId = insertedPost?.id ?? null;
    }

    if (error) {
      throw error;
    }

    if (imageUrl && insertedPostId) {
      await insertPhotoRecord(insertedPostId, imageUrl, currentUserId);
    }

    showSuccess('Post created successfully');
    window.location.href = '/index.html';
  } catch (error) {
    const message = normalizeMessage(error, 'Failed to create post.');
    showError(message);
    throw buildHandledError(message);
  }
}

export async function updatePost(postId, title, destination, description, imageFile, travelDate) {
  try {
    if (!postId) {
      throw new Error('Missing post ID');
    }

    validatePostFields(title, destination, description);

    const supabase = assertSupabaseClient();
    const { userId: currentUserId, role } = await getCurrentUserContext();
    const existingPost = await getPostById(postId);

    if (existingPost.user_id !== currentUserId && role !== 'admin') {
      throw new Error('You are not allowed to edit this post');
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

    if (imageFile && imageUrl) {
      await insertPhotoRecord(postId, imageUrl, currentUserId);
    }

    showSuccess('Post updated successfully');
    window.location.href = `/post-details.html?id=${postId}`;
  } catch (error) {
    const message = normalizeMessage(error, 'Failed to update post.');
    if (!error?.toastShown) {
      showError(message);
    }
    throw buildHandledError(message);
  }
}

export async function deletePost(postId) {
  if (!postId) {
    throw new Error('Missing post ID');
  }

  const supabase = assertSupabaseClient();

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(authError.message || 'You must be logged in');
  }

  if (!user) {
    throw new Error('You must be logged in');
  }

  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('id, user_id')
    .eq('id', postId)
    .maybeSingle();

  if (postError) {
    throw new Error(postError.message || 'Failed to load post.');
  }

  if (!post) {
    throw new Error('Post not found');
  }

  if (post.user_id !== user.id) {
    throw new Error('You are not allowed to delete this post');
  }

  const { error: deleteError } = await supabase.from('posts').delete().eq('id', postId);

  if (deleteError) {
    throw new Error(deleteError.message || 'Failed to delete post.');
  }

  showInfo('Post deleted successfully');
  window.location.href = '/index.html';
}
