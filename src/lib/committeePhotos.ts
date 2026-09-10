import defaultBundledPhotos from '../data/committeePhotosCustom.json';

// In-memory runtime cache for rapid UI rendering (stores only lightweight URLs, never base64 data)
let inMemoryPhotoUrls: Record<string, string> = {
  ...(defaultBundledPhotos as Record<string, string>),
};

/**
 * Validation result interface
 */
export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  file?: File;
}

/**
 * Validates an image file before upload.
 * Enforces size limits and MIME types.
 */
export function validateImageFile(file: File, maxSizeBytes: number = 10 * 1024 * 1024): ImageValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported file format (${file.type || 'unknown'}). Please upload a JPEG, PNG, or WebP image.`,
    };
  }

  if (file.size > maxSizeBytes) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const maxInMB = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File is too large (${sizeInMB} MB). Maximum allowed size is ${maxInMB} MB.`,
    };
  }

  return { valid: true, file };
}

/**
 * Downsamples/optimizes an image file to a base64 Data URL if needed
 */
export function fileToOptimizedDataUrl(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 1000,
  quality: number = 0.88
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image data'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mime, quality);
        resolve(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Retrieves custom photo URL for a committee member.
 * Returns permanent Cloudflare R2 HTTPS URL or bundled fallback.
 */
export function getCustomPhoto(memberId: string): string | null {
  if (inMemoryPhotoUrls[memberId]) {
    return inMemoryPhotoUrls[memberId];
  }
  const bundled = defaultBundledPhotos as Record<string, string>;
  return bundled[memberId] || null;
}

/**
 * Returns all currently loaded photo URLs
 */
export function getAllCustomPhotos(): Record<string, string> {
  return { ...inMemoryPhotoUrls };
}

/**
 * Uploads an image file directly to Cloudflare R2 bucket.
 * Tracks upload progress (0 to 100%) via XMLHttpRequest.
 * Returns the permanent HTTPS URL.
 */
export function uploadPublicPhoto(
  file: File,
  category: string = 'general',
  onProgress?: (progressPercent: number) => void
): Promise<{ success: boolean; url?: string; fullUrl?: string; key?: string; error?: string }> {
  return new Promise((resolve) => {
    // 1. Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      resolve({ success: false, error: validation.error });
      return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    // 2. Track upload progress
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
    }

    xhr.open('POST', '/api/upload', true);

    xhr.onload = () => {
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          if (data.success && data.url) {
            if (onProgress) onProgress(100);
            resolve({
              success: true,
              url: data.url,
              fullUrl: data.fullUrl || `${window.location.origin}${data.url}`,
              key: data.key,
            });
            return;
          }
          resolve({ success: false, error: data.error || 'Server rejected photo upload' });
        } else {
          let errMessage = `Upload failed (Status ${xhr.status})`;
          try {
            const errData = JSON.parse(xhr.responseText);
            if (errData.error) errMessage = errData.error;
          } catch {
            // ignore
          }
          resolve({ success: false, error: errMessage });
        }
      } catch (err: any) {
        resolve({ success: false, error: err?.message || 'Failed to parse upload response' });
      }
    };

    xhr.onerror = () => {
      resolve({ success: false, error: 'Network connection failed while uploading image to Cloudflare R2.' });
    };

    xhr.ontimeout = () => {
      resolve({ success: false, error: 'Upload request timed out.' });
    };

    xhr.send(formData);
  });
}

/**
 * Uploads an image with progress tracking to Cloudflare R2 storage.
 */
export const uploadImageToR2WithProgress = uploadPublicPhoto;

/**
 * Saves a committee member photo to Cloudflare R2 and persists the URL in Cloudflare D1/KV.
 * Accepts a File or an existing URL.
 * Only the URL is stored in the database!
 */
export async function saveCustomPhoto(
  memberId: string,
  fileOrUrl: File | string,
  onProgress?: (progressPercent: number) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    let finalUrl = '';

    if (typeof fileOrUrl !== 'string') {
      // It's a File: Upload to Cloudflare R2
      const uploadRes = await uploadPublicPhoto(fileOrUrl, 'committee', onProgress);
      if (!uploadRes.success || !uploadRes.url) {
        return { success: false, error: uploadRes.error || 'Failed to upload photo to Cloudflare R2' };
      }
      finalUrl = uploadRes.url;
    } else {
      finalUrl = fileOrUrl;
      if (onProgress) onProgress(100);
    }

    // Update in-memory state immediately
    inMemoryPhotoUrls[memberId] = finalUrl;
    window.dispatchEvent(
      new CustomEvent('committee-photo-updated', {
        detail: { memberId, url: finalUrl },
      })
    );

    // Persist only the permanent HTTPS URL in Cloudflare database (D1/KV/manifest)
    const saveRes = await fetch('/api/committee/save-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, imageUrl: finalUrl }),
    });

    if (saveRes.ok) {
      const data = await saveRes.json();
      return { success: true, url: data.url || finalUrl };
    } else {
      const err = await saveRes.json().catch(() => ({}));
      return { success: true, url: finalUrl, error: err.error };
    }
  } catch (err: any) {
    console.error('Failed to save committee photo to Cloudflare:', err);
    return { success: false, error: err?.message || 'Error communicating with Cloudflare API' };
  }
}

/**
 * Removes a committee member photo from Cloudflare D1/KV/manifest
 */
export async function removeCustomPhoto(memberId: string): Promise<void> {
  try {
    delete inMemoryPhotoUrls[memberId];
    window.dispatchEvent(
      new CustomEvent('committee-photo-updated', {
        detail: { memberId, removed: true },
      })
    );

    await fetch('/api/committee/remove-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId }),
    });
  } catch (err) {
    console.error('Failed to remove committee photo from Cloudflare:', err);
  }
}

/**
 * Fetches all saved committee photo URLs from Cloudflare database (D1/KV/R2)
 * and populates the in-memory cache so all users across any browser see them.
 */
export async function fetchAndMergeServerPhotos(): Promise<Record<string, string>> {
  try {
    const res = await fetch('/api/committee/photos');
    if (res.ok) {
      const data = await res.json();
      if (data.photos && typeof data.photos === 'object') {
        inMemoryPhotoUrls = {
          ...(defaultBundledPhotos as Record<string, string>),
          ...data.photos,
        };
        window.dispatchEvent(new CustomEvent('committee-photo-updated', { detail: { all: true } }));
        return inMemoryPhotoUrls;
      }
    }
  } catch (err) {
    console.warn('Unable to fetch committee photos from Cloudflare API:', err);
  }
  return inMemoryPhotoUrls;
}

/**
 * Syncs multiple member photos into Cloudflare D1/KV
 */
export async function syncAllToProjectDisk(): Promise<{ success: boolean; count: number }> {
  try {
    if (Object.keys(inMemoryPhotoUrls).length === 0) return { success: true, count: 0 };

    const res = await fetch('/api/committee/photos');
    if (res.ok) {
      const data = await res.json();
      return { success: true, count: Object.keys(data.photos || inMemoryPhotoUrls).length };
    }
  } catch (e) {
    console.warn('Cloudflare photos sync check failed:', e);
  }
  return { success: false, count: 0 };
}
