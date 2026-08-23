const CACHE_NAME = 'archisync-uk-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('googleapis.com') || e.request.url.includes('translate')) {
    return;
  }
});