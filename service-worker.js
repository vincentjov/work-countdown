const CACHE_NAME = "work-countdown-v1";

const LOCAL_FILES = [
    "./",
    "./index.html",
    "./history.html",
    "./tomorrow.html",
    "./manifest.json",
    "./icons/apple-touch-icon.png",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];


// ---------------------------------------
// INSTALL
// ---------------------------------------

self.addEventListener(
    "install",
    event => {

        self.skipWaiting();

        event.waitUntil(
            caches
                .open(CACHE_NAME)
                .then(cache => {
                    return cache.addAll(
                        LOCAL_FILES
                    );
                })
        );

    }
);


// ---------------------------------------
// ACTIVATE
// ---------------------------------------

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()
                .then(keys => {

                    return Promise.all(

                        keys.map(key => {

                            if (
                                key !==
                                CACHE_NAME
                            ) {

                                return caches.delete(
                                    key
                                );

                            }

                        })

                    );

                })
                .then(() => {
                    return self.clients.claim();
                })

        );

    }
);


// ---------------------------------------
// FETCH
// ---------------------------------------

self.addEventListener(
    "fetch",
    event => {

        if (
            event.request.method !==
            "GET"
        ) {

            return;

        }


        const url =
            new URL(
                event.request.url
            );


        /*
            Only cache files belonging
            to our own GitHub Pages app.

            Firebase, Transitous,
            Open-Meteo etc. continue
            using the internet normally.
        */

        if (
            url.origin !==
            self.location.origin
        ) {

            return;

        }


        event.respondWith(

            fetch(
                event.request
            )

                .then(response => {

                    const copy =
                        response.clone();


                    caches
                        .open(
                            CACHE_NAME
                        )
                        .then(cache => {

                            cache.put(
                                event.request,
                                copy
                            );

                        });


                    return response;

                })

                .catch(() => {

                    return caches
                        .match(
                            event.request
                        )
                        .then(cached => {

                            if (cached) {
                                return cached;
                            }


                            /*
                                If navigation fails,
                                at least open the app.
                            */

                            if (
                                event.request.mode ===
                                "navigate"
                            ) {

                                return caches.match(
                                    "./index.html"
                                );

                            }

                        });

                })

        );

    }
);
