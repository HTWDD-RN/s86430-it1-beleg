// the cache version gets updated every time there is a new deployment
const CACHE_VERSION = 10;
const CURRENT_CACHE = `Lernprog-Cache-${CACHE_VERSION}`;

const filesToCache = [
    "Data/",
    "Data/quizdata.json",
    "index.css",
    "index.html",
    "mvp.js",
    "manifest.webmanifest",
    
    "Images/",
    "Images/birne.png",
    
    "scripts/",
    "scripts/katex/katex.min.js",
    "scripts/katex/katex.min.css",
    "scripts/katex/contrib/auto-render.min.js",
    // KaTeX fonts (nur .woff2 für Kompaktheit)
    "scripts/katex/fonts/KaTeX_AMS-Regular.woff2",
    "scripts/katex/fonts/KaTeX_Caligraphic-Bold.woff2",
    "scripts/katex/fonts/KaTeX_Caligraphic-Regular.woff2",
    "scripts/katex/fonts/KaTeX_Fraktur-Bold.woff2",
    "scripts/katex/fonts/KaTeX_Fraktur-Regular.woff2",
    "scripts/katex/fonts/KaTeX_Main-Bold.woff2",
    "scripts/katex/fonts/KaTeX_Main-BoldItalic.woff2",
    "scripts/katex/fonts/KaTeX_Main-Italic.woff2",
    "scripts/katex/fonts/KaTeX_Main-Regular.woff2",
    "scripts/katex/fonts/KaTeX_Math-BoldItalic.woff2",
    "scripts/katex/fonts/KaTeX_Math-Italic.woff2",
    "scripts/katex/fonts/KaTeX_SansSerif-Bold.woff2",
    "scripts/katex/fonts/KaTeX_SansSerif-Italic.woff2",
    "scripts/katex/fonts/KaTeX_SansSerif-Regular.woff2",
    "scripts/katex/fonts/KaTeX_Script-Regular.woff2",
    "scripts/katex/fonts/KaTeX_Size1-Regular.woff2",
    "scripts/katex/fonts/KaTeX_Size2-Regular.woff2",
    "scripts/katex/fonts/KaTeX_Size3-Regular.woff2",
    "scripts/katex/fonts/KaTeX_Size4-Regular.woff2",
    "scripts/katex/fonts/KaTeX_Typewriter-Regular.woff2",
    "scripts/vexflow/vexflow-min.js",
    "scripts/vexflow/vexflow-min.css",
    "scripts/vexflow/auto-render.min.js"
    
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
self.addEventListener('install', evt =>
  evt.waitUntil(
    caches.open(CURRENT_CACHE).then(cache => {
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