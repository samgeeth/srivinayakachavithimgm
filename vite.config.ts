import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

// LINT.IfChange(aistudio_media_plugin)
function aistudioMediaPlugin(): Plugin {
  return {
    name: 'vite-plugin-aistudio-media',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/assets/aistudio/')) {
          const rawPath = req.url.split('?')[0].split('#')[0];
          try {
            const decodedPath = decodeURIComponent(rawPath);
            const relativePath = decodedPath.replace(/^\//, '');
            const aistudioDir = path.resolve(
              __dirname,
              'public',
              'assets',
              'aistudio',
            );
            const filePath = path.resolve(__dirname, 'public', relativePath);
            if (
              filePath.startsWith(aistudioDir + path.sep) &&
              fs.existsSync(filePath) &&
              fs.statSync(filePath).isFile()
            ) {
              const ext = path.extname(filePath).toLowerCase();
              const mimeMap: Record<string, string> = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
                '.bmp': 'image/bmp',
                '.ico': 'image/x-icon',
                '.mp4': 'video/mp4',
                '.webm': 'video/webm',
                '.ogv': 'video/ogg',
                '.mp3': 'audio/mpeg',
                '.wav': 'audio/wav',
                '.ogg': 'audio/ogg',
                '.pdf': 'application/pdf',
              };
              res.setHeader(
                'Content-Type',
                mimeMap[ext] || 'application/octet-stream',
              );
              res.setHeader('Cache-Control', 'no-cache');
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          } catch {
            // Fall through if URI decoding or file access fails
          }
        }
        next();
      });
    },
  };
}
// LINT.ThenChange(//depot/google3/java/com/google/alkali/boq/makersuite/applet_dev_service/templates/initializers/react_theme/vite.config.ts:aistudio_media_plugin)

function liveBackendPlugin(): Plugin {
  return {
    name: 'vite-plugin-live-backend',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        const parsedUrl = req.url.split('?')[0];
        const photosDir = path.resolve(__dirname, 'public', 'committee-photos');
        const liveStoragePath = path.resolve(__dirname, 'src', 'data', 'liveStorage.json');
        const customPhotosPath = path.resolve(__dirname, 'src', 'data', 'committeePhotosCustom.json');

        if (!fs.existsSync(photosDir)) {
          fs.mkdirSync(photosDir, { recursive: true });
        }

        const readLiveStorage = (): any => {
          try {
            if (fs.existsSync(liveStoragePath)) {
              return JSON.parse(fs.readFileSync(liveStoragePath, 'utf8'));
            }
          } catch (e) {
            console.error('Failed to read liveStorage.json:', e);
          }
          return { settings: {}, committee: [], volunteers: [], gallery: [], sponsors: [], events: [], workUpdates: [], posts: [], donations: [] };
        };

        const writeLiveStorage = (data: any) => {
          try {
            fs.writeFileSync(liveStoragePath, JSON.stringify(data, null, 2), 'utf8');
          } catch (e) {
            console.error('Failed to write liveStorage.json:', e);
          }
        };

        // 1. Health check
        if (parsedUrl === '/api/health') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'ok', localDev: true, r2Connected: true, d1Connected: true }));
          return;
        }

        // 2. Direct photo serving (/api/photos/*)
        if (req.method === 'GET' && parsedUrl.startsWith('/api/photos/')) {
          const subKey = decodeURIComponent(parsedUrl.replace(/^\/api\/photos\//, ''));
          const possiblePaths = [
            path.join(photosDir, path.basename(subKey)),
            path.resolve(__dirname, 'public', 'committee-photos', path.basename(subKey)),
            path.resolve(__dirname, 'public', subKey),
            path.resolve(__dirname, 'public', path.basename(subKey)),
          ];
          for (const p of possiblePaths) {
            if (fs.existsSync(p) && fs.statSync(p).isFile()) {
              const ext = path.extname(p).toLowerCase();
              const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : ext === '.gif' ? 'image/gif' : 'image/jpeg';
              res.setHeader('Content-Type', mime);
              res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
              fs.createReadStream(p).pipe(res);
              return;
            }
          }
          // fallback placeholder image if not found
          const fallback = path.resolve(__dirname, 'public', 'ganesha_poster.jpg');
          if (fs.existsSync(fallback)) {
            res.setHeader('Content-Type', 'image/jpeg');
            fs.createReadStream(fallback).pipe(res);
            return;
          }
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Image not found' }));
          return;
        }

        // 3. GET /api/content
        if (req.method === 'GET' && parsedUrl === '/api/content') {
          const store = readLiveStorage();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, ...store }));
          return;
        }

        // 4. GET /api/settings
        if (req.method === 'GET' && parsedUrl === '/api/settings') {
          const store = readLiveStorage();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, settings: store.settings || {} }));
          return;
        }

        // 5. GET /api/committee/photos
        if (req.method === 'GET' && parsedUrl === '/api/committee/photos') {
          let photos: Record<string, string> = {};
          try {
            if (fs.existsSync(customPhotosPath)) {
              photos = JSON.parse(fs.readFileSync(customPhotosPath, 'utf8'));
            }
          } catch {}
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, photos }));
          return;
        }

        // 6. GET /api/posts
        if (req.method === 'GET' && parsedUrl === '/api/posts') {
          const store = readLiveStorage();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, posts: store.posts || [] }));
          return;
        }

        // 7. GET /api/donations
        if (req.method === 'GET' && parsedUrl === '/api/donations') {
          const store = readLiveStorage();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, donations: store.donations || [] }));
          return;
        }

        // 8. GET /api/gallery
        if (req.method === 'GET' && parsedUrl === '/api/gallery') {
          const store = readLiveStorage();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, gallery: store.gallery || [] }));
          return;
        }

        // 9. GET /api/committee
        if (req.method === 'GET' && parsedUrl === '/api/committee') {
          const store = readLiveStorage();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, committee: store.committee || [] }));
          return;
        }

        // 10. GET /api/sponsors
        if (req.method === 'GET' && parsedUrl === '/api/sponsors') {
          const store = readLiveStorage();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, sponsors: store.sponsors || [] }));
          return;
        }

        // 11. GET /api/events
        if (req.method === 'GET' && parsedUrl === '/api/events') {
          const store = readLiveStorage();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, events: store.events || [] }));
          return;
        }

        // 12. GET /api/work-updates
        if (req.method === 'GET' && parsedUrl === '/api/work-updates') {
          const store = readLiveStorage();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, workUpdates: store.workUpdates || [] }));
          return;
        }

        // Handle DELETE requests
        if (req.method === 'DELETE') {
          const store = readLiveStorage();

          if (parsedUrl.startsWith('/api/committee/')) {
            const id = parsedUrl.replace('/api/committee/', '');
            store.committee = (store.committee || []).filter((c: any) => c.id !== id);
            writeLiveStorage(store);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'Committee member removed' }));
            return;
          }

          if (parsedUrl.startsWith('/api/gallery/')) {
            const id = parsedUrl.replace('/api/gallery/', '');
            store.gallery = (store.gallery || []).filter((g: any) => g.id !== id);
            writeLiveStorage(store);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'Gallery item removed' }));
            return;
          }

          if (parsedUrl.startsWith('/api/sponsors/')) {
            const id = parsedUrl.replace('/api/sponsors/', '');
            store.sponsors = (store.sponsors || []).filter((s: any) => s.id !== id);
            writeLiveStorage(store);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'Sponsor removed' }));
            return;
          }

          if (parsedUrl.startsWith('/api/events/')) {
            const id = parsedUrl.replace('/api/events/', '');
            store.events = (store.events || []).filter((e: any) => e.id !== id);
            writeLiveStorage(store);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'Event removed' }));
            return;
          }

          if (parsedUrl.startsWith('/api/work-updates/')) {
            const id = parsedUrl.replace('/api/work-updates/', '');
            store.workUpdates = (store.workUpdates || []).filter((w: any) => w.id !== id);
            writeLiveStorage(store);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'Work update removed' }));
            return;
          }

          if (parsedUrl.startsWith('/api/posts/')) {
            const id = parsedUrl.replace('/api/posts/', '');
            store.posts = (store.posts || []).filter((p: any) => p.id !== id);
            writeLiveStorage(store);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'Post removed' }));
            return;
          }
        }

        // Handle POST and PUT requests
        if (req.method === 'POST' || req.method === 'PUT') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk) => {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
          });

          req.on('end', () => {
            try {
              const totalBuffer = Buffer.concat(chunks);
              const contentType = req.headers['content-type'] || '';

              // Image upload endpoint (/api/upload)
              if (parsedUrl === '/api/upload') {
                let fileBuffer: Buffer | null = null;
                let ext = '.jpg';

                if (contentType.includes('multipart/form-data')) {
                  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
                  const boundary = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2]) : null;

                  if (boundary) {
                    const boundaryBuffer = Buffer.from(`--${boundary}`);
                    const headerSep = Buffer.from('\r\n\r\n');
                    const idx1 = totalBuffer.indexOf(boundaryBuffer);
                    if (idx1 !== -1) {
                      const headerIdx = totalBuffer.indexOf(headerSep, idx1);
                      if (headerIdx !== -1) {
                        const headerStr = totalBuffer.slice(idx1, headerIdx).toString();
                        if (headerStr.includes('image/png')) ext = '.png';
                        else if (headerStr.includes('image/webp')) ext = '.webp';
                        else if (headerStr.includes('image/gif')) ext = '.gif';

                        const fileStart = headerIdx + 4;
                        const nextBoundaryIdx = totalBuffer.indexOf(boundaryBuffer, fileStart);
                        const fileEnd = nextBoundaryIdx !== -1 ? nextBoundaryIdx - 2 : totalBuffer.length;
                        fileBuffer = totalBuffer.slice(fileStart, fileEnd);
                      }
                    }
                  }
                  if (!fileBuffer) {
                    fileBuffer = totalBuffer;
                  }
                } else {
                  const payload = JSON.parse(totalBuffer.toString('utf8') || '{}');
                  if (payload.dataUrl) {
                    const matches = payload.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                    if (matches && matches[2]) {
                      ext = matches[1].includes('png') ? '.png' : matches[1].includes('webp') ? '.webp' : '.jpg';
                      fileBuffer = Buffer.from(matches[2], 'base64');
                    }
                  }
                }

                if (!fileBuffer || fileBuffer.length === 0) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ success: false, error: 'Empty file payload' }));
                  return;
                }

                const fileBase = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
                const filePath = path.join(photosDir, fileBase);
                fs.writeFileSync(filePath, fileBuffer);

                const publicUrl = `/api/photos/${fileBase}`;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  key: fileBase,
                  url: publicUrl,
                  fullUrl: `http://localhost:3000${publicUrl}`,
                  size: fileBuffer.length,
                }));
                return;
              }

              // Parse JSON body
              const payload = JSON.parse(totalBuffer.toString('utf8') || '{}');
              const store = readLiveStorage();

              // Admin login
              if (parsedUrl === '/api/admin/login') {
                const { username, password } = payload;
                const isValid = username === 'admin' && (password === 'MaraigudemYouth@2026' || password === 'admin' || password === 'admin123');
                if (isValid) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: true,
                    token: `mvy_session_${Date.now()}_local_admin`,
                    user: { username: 'admin', role: 'superadmin' },
                  }));
                } else {
                  res.statusCode = 401;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, error: 'Invalid admin username or password' }));
                }
                return;
              }

              // Admin logout
              if (parsedUrl === '/api/admin/logout') {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
                return;
              }

              // Save settings (PUT /api/settings)
              if (parsedUrl === '/api/settings') {
                store.settings = { ...store.settings, ...payload };
                writeLiveStorage(store);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, settings: store.settings }));
                return;
              }

              // Save gallery item
              if (parsedUrl === '/api/gallery') {
                const id = payload.id || `photo-${Date.now()}`;
                const item = { ...payload, id };
                store.gallery = store.gallery || [];
                const idx = store.gallery.findIndex((g: any) => g.id === id);
                if (idx >= 0) store.gallery[idx] = item;
                else store.gallery.push(item);
                writeLiveStorage(store);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, item }));
                return;
              }

              // Save committee member
              if (parsedUrl === '/api/committee') {
                const id = payload.id || `member-${Date.now()}`;
                const member = { ...payload, id };
                store.committee = store.committee || [];
                const idx = store.committee.findIndex((c: any) => c.id === id);
                if (idx >= 0) store.committee[idx] = member;
                else store.committee.push(member);
                writeLiveStorage(store);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, member }));
                return;
              }

              // Save volunteer
              if (parsedUrl === '/api/volunteers') {
                const id = payload.id || `vol-${Date.now()}`;
                const volunteer = { ...payload, id };
                store.volunteers = store.volunteers || [];
                const idx = store.volunteers.findIndex((v: any) => v.id === id);
                if (idx >= 0) store.volunteers[idx] = volunteer;
                else store.volunteers.push(volunteer);
                writeLiveStorage(store);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, volunteer }));
                return;
              }

              // Save sponsor
              if (parsedUrl === '/api/sponsors') {
                const id = payload.id || `sponsor-${Date.now()}`;
                const sponsor = { ...payload, id };
                store.sponsors = store.sponsors || [];
                const idx = store.sponsors.findIndex((s: any) => s.id === id);
                if (idx >= 0) store.sponsors[idx] = sponsor;
                else store.sponsors.push(sponsor);
                writeLiveStorage(store);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, sponsor }));
                return;
              }

              // Save event
              if (parsedUrl === '/api/events') {
                const id = payload.id || `event-${Date.now()}`;
                const event = { ...payload, id };
                store.events = store.events || [];
                const idx = store.events.findIndex((e: any) => e.id === id);
                if (idx >= 0) store.events[idx] = event;
                else store.events.push(event);
                writeLiveStorage(store);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, event }));
                return;
              }

              // Save work update
              if (parsedUrl === '/api/work-updates') {
                const id = payload.id || `work-${Date.now()}`;
                const workUpdate = { ...payload, id };
                store.workUpdates = store.workUpdates || [];
                const idx = store.workUpdates.findIndex((w: any) => w.id === id);
                if (idx >= 0) store.workUpdates[idx] = workUpdate;
                else store.workUpdates.push(workUpdate);
                writeLiveStorage(store);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, workUpdate }));
                return;
              }

              // Save post
              if (parsedUrl === '/api/posts') {
                const id = payload.id || `post-${Date.now()}`;
                const post = { ...payload, id };
                store.posts = store.posts || [];
                const idx = store.posts.findIndex((p: any) => p.id === id);
                if (idx >= 0) store.posts[idx] = post;
                else store.posts.unshift(post);
                writeLiveStorage(store);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, post }));
                return;
              }

              // Save donation
              if (parsedUrl === '/api/donations') {
                const id = payload.id || `don-${Date.now()}`;
                const donation = { ...payload, id };
                store.donations = store.donations || [];
                store.donations.unshift(donation);
                writeLiveStorage(store);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, donation }));
                return;
              }

              // Legacy save committee photo
              if (parsedUrl === '/api/committee/save-photo') {
                const { memberId, imageUrl } = payload;
                let photos: Record<string, string> = {};
                try {
                  if (fs.existsSync(customPhotosPath)) photos = JSON.parse(fs.readFileSync(customPhotosPath, 'utf8'));
                } catch {}
                photos[memberId] = imageUrl;
                fs.writeFileSync(customPhotosPath, JSON.stringify(photos, null, 2), 'utf8');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, memberId, url: imageUrl }));
                return;
              }

              res.statusCode = 404;
              res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err?.message || 'Server error' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), aistudioMediaPlugin(), liveBackendPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
