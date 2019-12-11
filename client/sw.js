const version = "v1-tube-status";
const contentToCache = [
  "./index.html",
  "./offline.html",
  "./src/styles/app.css",
  "./src/scripts/index.js",
  "./push-setup.js",
  "./images/train-large.png",
  "./images/train-medium.png",
  "./images/train-small.png",
  "./images/train-splash-screen.png",
];

self.addEventListener("push", (e) => {
  const {line, status} = e.data.json();
  const options = {
    body: status,
    requireInteraction: true,
  };

  self.registration.showNotification(`${line} line`, options);
});

self.addEventListener("install", (e) => {
  e.waitUntil(async function() {
    const cacheOpen = await caches.open(version);
    return await cacheOpen.addAll(contentToCache);
  }());
});

self.addEventListener("activate", (e) => {
  e.waitUntil(async function() {
    const keys = await caches.keys();
    // clear out old cache resources
    return await Promise.all(keys.map((key) => {
      if (version.indexOf(key) === -1) return caches.delete(key);
    }));
  }());
});

self.addEventListener("fetch", (e) => {
  e.respondWith(async function() {
    const cachedResponse = await caches.match(e.request);

    if (cachedResponse) return cachedResponse;
    // If fetch throws an exception then render custom offline page
    return fetch(e.request).catch(() => caches.match("./offline.html"));
  }());
});
