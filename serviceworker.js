// Change this to your repository name
const GHPATH = '/DragonBMS-Interface-Web';

// Choose a different app prefix name
const APP_PREFIX = 'dbms_interface-';

// The version of the cache. Every time you change any of the files
// you need to change this version (version_01, version_02…).
// If you don't change the version, the service worker will give your
// users the old files!
const VERSION = '0.5.36';

// The files to make available for offline use. make sure to add
// others to this list
const URLS = [
    `${GHPATH}/`,
    `${GHPATH}/index.html`,
    `${GHPATH}/css/*`,
    `${GHPATH}/js/*`,
    `${GHPATH}/img/*`
];


self.addEventListener("fetch", (event) => {
    console.log(`Handling fetch event for ${event.request.url}`);

    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                console.log("Found response in cache:", response);
                return response;
            }
            console.log("No response found in cache. About to fetch from network…");

            return fetch(event.request)
                .then((response) => {
                    console.log("Response from network is:", response);

                    return response;
                })
                .catch((error) => {
                    console.error(`Fetching failed: ${error}`);
                    throw error;
                });
        })
    );
});