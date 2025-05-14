const CACHE_NAME = "AufgabenCache"
const filesToCache = [
    "index.css",
    "index.html",
    "mvp.js",
    "manifest.webmanifest",
    "Data/quizdata.json",
    "Images/birne.png",
    /*
    i"mages/back.jpg",
    "images/backfull.jpg",
    "images/general.png",
    "images/math.png",
    "images/mc.png",
    "images/web.png",
    "images/icon.png",
    "images/icon_pwa_192.png",
    "images/icon_pwa_512.png",*/
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
    "scripts/katex/fonts/KaTeX_Typewriter-Regular.woff2"
    ];

self.addEventListener('install', event => 
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => 
            cache.addAll(filesToCache))
    )
);
    
self.addEventListener('fetch', event => event.respondWith(
    caches.open(CACHE_NAME)
        .then(cache => cache.match(event.request))
        .then(response => response || fetch(event.request))
));
    