// use async/await once implemented
const version = 'v1::';

const offlineFundamentals = [
    './',
    './src/scripts/index.js',
    './images'
];

self.addEventListener('push', e => {
    const data =  e.data.json();
    console.log('push recieved', data)
    self.registration.showNotification(data.title, {
        body: "Notified by Traversy Media!",
        icon: "http://image.ibb.co/frYOFd/tmlogo.png"
    });
});

self.addEventListener("install", (event) => {
    // console.log('WORKER: install event in progress.');

    event.waitUntil(
        caches
            .open(version + 'fundamentals')   
            .then((cache) => cache.addAll(offlineFundamentals))
            // .then(() => console.log('WORKER: install completed'))
    );
});

self.addEventListener("fetch", (event) => {
    // console.log('WORKER: fetch event in progress.');
    // only cache a GET request
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches
            .match(event.request)
            .then((cached) => {
                const networked = fetch(event.request)
                    .then(fetchedFromNetwork)
                    // .catch(() => console.log('WORKER: fetch request failed in both cache and network.'));
                // return the cached response immediately if there is one, othwerwise wait on network 
                return cached || networked;

                function fetchedFromNetwork(response) {
                    const cacheCopy = response.clone();
                    // console.log('WORKER: fetch response from network.', event.request.url);

                    caches
                        .open(version + 'pages')
                        .then((cache) => {
                            return cache.put(event.request, cacheCopy);
                        })
                        // .then(() => console.log('WORKER: fetch response stored in cache.', event.request.url));
                        
                    return response;
                }
            })
    );
});

self.addEventListener("activate", (event) => {
    // console.log('WORKER: activate event in progress.');

    event.waitUntil(
        caches
            .keys()
            .then((keys) => {
                return Promise.all(
                    keys.filter((key) => !key.startsWith(version)).map((key) => caches.delete(key))
                );    
            })
            // .then(() => console.log('WORKER: activate completed.'))
    )
});

