// use async/await once implemented
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((reg) => {
                console.log('Service worker registered.', reg);
            })
    });
}

const version = 'v1::';

const offlineFundamentals = [
    './',
    './src/scripts/index.js',
    './offline.html'
];

self.addEventListener("install", (event) => {
    console.log('WORKER: install event in progress.');

    caches.open(version + 'fundamentals')   
        .then((cache) => cache.addAll(offlineFundamentals))
        .then(() => console.log('WORKER: install completed'))
});

self.addEventListener("fetch", (event) => {
    console.log('WORKER: fetch event in progress.');
    // only cache a GET request
    if (event.request.method !== 'GET') return;
});

