/**
 * Cloudflare Pages Functions handler for /api/* routes
 * Provides permanent R2 storage when deployed via Cloudflare Pages
 */

interface PagesContext {
  request: Request;
  env: {
    PHOTOS_BUCKET?: any;
    [key: string]: any;
  };
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

function parseBase64DataUrl(dataUrl: string): { contentType: string; buffer: Uint8Array } {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid base64 data URL format');
  }
  const contentType = match[1];
  const base64Data = match[2];
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return { contentType, buffer: bytes };
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const { pathname } = url;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (pathname === '/api/health') {
    return jsonResponse({
      status: 'ok',
      cloudflarePages: true,
      r2Connected: Boolean(env.PHOTOS_BUCKET),
      timestamp: new Date().toISOString(),
    });
  }

  // Serve image from R2
  if (pathname.startsWith('/api/photos/')) {
    const key = decodeURIComponent(pathname.replace(/^\/api\/photos\//, ''));
    if (!key) return jsonResponse({ error: 'Missing key' }, 400);

    if (!env.PHOTOS_BUCKET) {
      return jsonResponse({ error: 'R2 bucket PHOTOS_BUCKET is not bound' }, 503);
    }

    try {
      const object = await env.PHOTOS_BUCKET.get(key);
      if (!object) return jsonResponse({ error: 'Not found' }, 404);

      const headers = new Headers();
      object.writeHttpMetadata ? object.writeHttpMetadata(headers) : null;
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      if (!headers.get('Content-Type')) {
        headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
      }
      return new Response(object.body, { headers });
    } catch (err: any) {
      return jsonResponse({ error: err?.message }, 500);
    }
  }

  // Upload image to R2
  if (pathname === '/api/upload' && request.method === 'POST') {
    if (!env.PHOTOS_BUCKET) {
      return jsonResponse({ error: 'R2 bucket PHOTOS_BUCKET is not bound' }, 503);
    }

    try {
      const body = await request.json() as { dataUrl?: string; filename?: string; category?: string };
      if (!body.dataUrl) return jsonResponse({ error: 'Missing dataUrl' }, 400);

      const { contentType, buffer } = parseBase64DataUrl(body.dataUrl);
      const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
      const safeCategory = (body.category || 'general').replace(/[^a-zA-Z0-9_-]/g, '');
      const filename = `${safeCategory}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      await env.PHOTOS_BUCKET.put(filename, buffer, {
        httpMetadata: { contentType, cacheControl: 'public, max-age=31536000, immutable' },
      });

      const permanentUrl = `/api/photos/${filename}`;
      return jsonResponse({
        success: true,
        key: filename,
        url: permanentUrl,
        fullUrl: `${url.origin}${permanentUrl}`,
      });
    } catch (err: any) {
      return jsonResponse({ error: err?.message }, 500);
    }
  }

  // Committee photos manifest
  if (pathname === '/api/committee/photos' && request.method === 'GET') {
    if (!env.PHOTOS_BUCKET) return jsonResponse({ success: true, photos: {} });

    try {
      const manifestObj = await env.PHOTOS_BUCKET.get('manifests/committee.json');
      if (!manifestObj) return jsonResponse({ success: true, photos: {} });
      const photos = JSON.parse(await manifestObj.text());
      return jsonResponse({ success: true, photos });
    } catch (err: any) {
      return jsonResponse({ success: false, error: err?.message }, 500);
    }
  }

  // Save committee photo
  if (pathname === '/api/committee/save-photo' && request.method === 'POST') {
    if (!env.PHOTOS_BUCKET) return jsonResponse({ error: 'R2 bucket not bound' }, 503);

    try {
      const body = await request.json() as { memberId?: string; dataUrl?: string };
      const { memberId, dataUrl } = body;
      if (!memberId || !dataUrl) return jsonResponse({ error: 'Missing memberId or dataUrl' }, 400);

      const { contentType, buffer } = parseBase64DataUrl(dataUrl);
      const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
      const photoKey = `committee/${memberId}-${Date.now()}.${ext}`;

      await env.PHOTOS_BUCKET.put(photoKey, buffer, {
        httpMetadata: { contentType, cacheControl: 'public, max-age=31536000, immutable' },
      });

      const publicUrl = `/api/photos/${photoKey}`;
      let currentManifest: Record<string, string> = {};
      try {
        const manifestObj = await env.PHOTOS_BUCKET.get('manifests/committee.json');
        if (manifestObj) currentManifest = JSON.parse(await manifestObj.text());
      } catch {
        // ignore
      }

      currentManifest[memberId] = publicUrl;
      await env.PHOTOS_BUCKET.put('manifests/committee.json', JSON.stringify(currentManifest), {
        httpMetadata: { contentType: 'application/json' },
      });

      return jsonResponse({
        success: true,
        memberId,
        url: publicUrl,
        fullUrl: `${url.origin}${publicUrl}`,
      });
    } catch (err: any) {
      return jsonResponse({ error: err?.message }, 500);
    }
  }

  // Remove committee photo
  if (pathname === '/api/committee/remove-photo' && request.method === 'POST') {
    if (!env.PHOTOS_BUCKET) return jsonResponse({ success: true });

    try {
      const { memberId } = await request.json() as { memberId?: string };
      if (memberId) {
        const manifestObj = await env.PHOTOS_BUCKET.get('manifests/committee.json');
        if (manifestObj) {
          const currentManifest = JSON.parse(await manifestObj.text());
          delete currentManifest[memberId];
          await env.PHOTOS_BUCKET.put('manifests/committee.json', JSON.stringify(currentManifest), {
            httpMetadata: { contentType: 'application/json' },
          });
        }
      }
      return jsonResponse({ success: true });
    } catch (err: any) {
      return jsonResponse({ error: err?.message }, 500);
    }
  }

  return jsonResponse({ error: 'Endpoint not found' }, 404);
}
