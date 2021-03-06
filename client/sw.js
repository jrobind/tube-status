const VERSION = "v1-tube-status";
const CONTENT_TO_CACHE = [
  "/index.html",
  "/offline.html",
  "/build/bundle.js",
  "/build/app.css",
  "/images/train-large.png",
  "/images/train-medium.png",
  "/images/train-small.png",
  "/images/train-splash-screen.png",
  "/images/unsubscribe.svg",
  "/images/subscribe.svg",
  "/images/account_circle.svg",
  "/images/subscriptions.svg",
  "/images/subscriptions-filled.svg",
];

/**
 * Handles service worker push event.
 */
self.addEventListener("push", (e) => {
  const {line, status} = e.data.json();
  const options = {
    body: status,
    requireInteraction: true,
  };

  self.registration.showNotification(`${line} line`, options);
});

/**
 * Handles pushsubscription change event.
 */
self.addEventListener("pushsubscriptionchange", (e) => {
  e.waitUntil(self.registration.pushManager.subscribe(e.oldSubscription.options)
    .then((subscription) => {
      return fetch("/api/pushsubscriptionchange", {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({
          newEndpoint: subscription.endpoint,
          oldEndpoint: e.oldSubscription.endpoint,
        }),
      });
    }).catch((e) => console.log(e)),
  );
}, false);

/**
 * Handles service worker install event.
 */
self.addEventListener("install", (e) => {
  e.waitUntil(async function() {
    const cacheOpen = await caches.open(VERSION);
    return await cacheOpen.addAll(CONTENT_TO_CACHE);
  }());
});

/**
 * Handles service worker activation event.
 */
self.addEventListener("activate", (e) => {
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
  e.respondWith(async function() {
    const cachedResponse = await caches.match(e.request);

    if (cachedResponse) return cachedResponse;
    // If fetch throws an exception then render custom offline page
    return fetch(e.request).catch(() => caches.match("./offline.html"));
  }());
});
