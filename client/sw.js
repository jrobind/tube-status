const VERSION = "v1-tube-status";
const CONTENT_TO_CACHE = [
  "/index.html",
  "/offline.html",
  "/src/styles/app.css",
  "/src/scripts/index.js",
  "/src/scripts/push-setup.js",
  "/images/train-large.png",
  "/images/train-medium.png",
  "/images/train-small.png",
  "/images/train-splash-screen.png",
];

/**
 * Handles service worker push event.
 */
self.addEventListener("push", (e) => {
  console.log(e);
  const channel = new BroadcastChannel("sw-messages");
  const {line, status} = e.data.json();
  const options = {
    body: status,
    requireInteraction: true,
  };

  self.registration.showNotification(`${line} line`, options);
  channel.postMessage({title: "push received"});
});

/**
 * Handles service worker install event.
 */
self.addEventListener("install", (e) => {
  console.log('from install sw')
  e.waitUntil(async function() {
    const cacheOpen = await caches.open(VERSION);
    return await cacheOpen.addAll(CONTENT_TO_CACHE);
  }());
});

/**
 * Handles service worker activation event.
 */
self.addEventListener("activate", (e) => {
  console.log('from activate sw')
  e.waitUntil(async function() {
    const keys = await caches.keys();
    // clear out old cache resources
    return await Promise.all(keys.map((key) => {
      if (VERSION.indexOf(key) === -1) return caches.delete(key);
    }));
  }());
});

/**
 * Handles service worker fetch event.
 * Intercept request, and serve cached content if we have it.
 */
self.addEventListener("fetch", (e) => {
  console.log('from fetch sw')
  e.respondWith(async function() {
    const cachedResponse = await caches.match(e.request);

    if (cachedResponse) return cachedResponse;
    // If fetch throws an exception then render custom offline page
    return fetch(e.request).catch(() => caches.match("./offline.html"));
  }());
});
