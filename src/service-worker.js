// the cache version gets updated every time there is a new deployment
const CACHE_VERSION = 10;
const CURRENT_CACHE = `Lernprog-Cache-${CACHE_VERSION}`;

const filesToCache = [
    "Data/quizdata.json",
    "index.css",
    "index.html",
    "mvp.js",
    "manifest.webmanifest",
    
    "Images/birne.png"
];

const notesCache = [
  "Data/a3.mp3",
  "Data/bb3.mp3",
  "Data/b3.mp3",
  "Data/c4.mp3",
  "Data/db4.mp3",
  "Data/d4.mp3",
  "Data/eb4.mp3",
  "Data/e4.mp3",
  "Data/f4.mp3",
  "Data/gb4.mp3",
  "Data/g4.mp3",
  "Data/ab4.mp3",
  "Data/a4.mp3",
  "Data/bb4.mp3",
  "Data/b4.mp3",
  "Data/c5.mp3",
  "Data/db5.mp3",
  "Data/d5.mp3",
  "Data/eb5.mp3",
  "Data/e5.mp3",
  "Data/f5.mp3",
  "Data/gb5.mp3",
  "Data/g5.mp3",
  "Data/ab5.mp3",
  "Data/a5.mp3",
  "Data/bb5.mp3"
    
];



// on activation we clean up the previously registered service workers
self.addEventListener('activate', evt =>
  evt.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CURRENT_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  )
);

// on install we download the routes we want to cache for offline 
self.addEventListener('install', evt =>         //Service-Worker hängt bei Installing fest -> Problem mit "FilesToCache"-Array (zB falscher Pfad)
  evt.waitUntil(
    caches.open(CURRENT_CACHE).then(cache => {
      cache.addAll(notesCache);
      return cache.addAll(filesToCache);
    })
  )
);

// fetch the resource from the network
const fromNetwork = (request, timeout) =>
  new Promise((fulfill, reject) => {
    const timeoutId = setTimeout(reject, timeout);
    fetch(request).then(response => {
      clearTimeout(timeoutId);
      fulfill(response);
      update(request);
    }, reject);
  });

// fetch the resource from the browser cache
const fromCache = request =>
  caches
    .open(CURRENT_CACHE)
    .then(cache =>
      cache
        .match(request)
        .then(matching => matching || cache.match('/offline/'))
    );

// cache the current page to make it available for offline
const update = request =>
  caches
    .open(CURRENT_CACHE)
    .then(cache =>
      fetch(request).then(response => cache.put(request, response))
    );

// general strategy when making a request (eg if online try to fetch it
// from the network with a timeout, if something fails serve from cache)
self.addEventListener('fetch', evt => {
  evt.respondWith(
    fromNetwork(evt.request, 5000).catch(() => fromCache(evt.request))
  );
  evt.waitUntil(update(evt.request));
});