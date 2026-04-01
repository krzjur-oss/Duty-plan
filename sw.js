// Najprostszy Service Worker do PWA
self.addEventListener('install', e => {
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  // Możesz dodać cache logic jeśli chcesz!
});