import { entries, del } from "./js/idb-keyval.js";

const CACHE_NAME = 'sw-cache';
const toCache = [
    '/',
    '/index.html',
    '/js/status.js',
    '/js/pwa.js',
    '/js/pwa.webmanifest',
    '/images/splash-screen.png',
    '/js/snap.js',
    '/js/notification.js',
    '/js/idb-keyval.js',
    '/js/db.js'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                return cache.addAll(toCache)
            })
            .then(self.skipWaiting())
    )
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        fetch(event.request)
            .catch(async () => {
                const cache = await caches.open(CACHE_NAME);
                return cache.match(event.request)
                    .then(res => {
                        if (res) {
                            return res
                        } else {
                            return new Response("Not in cache", { "status": 200, "headers": { "Content-Type": "text/plain" }, "statusText": "This is unavailable when offline." });
                        }
                    });
            })
    )
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys()
            .then((keyList) => {
                return Promise.all(keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key)
                    }
                }))
            })
            .then(() => self.clients.claim())
    )
});

self.addEventListener("sync", function (event) {
    if (event.tag === "sync") {
        event.waitUntil(startSync());
    }
});

let startSync = async function () {
    entries().then((entries) => {
        entries.forEach((entry) => {
            let snap = entry[1];
            let formData = new FormData();
            formData.append("id", snap.id);
            formData.append("title", "selfie0" + snap.title);
            formData.append("image", snap.image, "selfie4" + snap.id + ".png");
            fetch("/addPicture", {
                method: "POST",
                body: formData,
                file: snap.image
            })
                .then(function (res) {
                    if (res.ok) {
                        res.json().then(function (data) {
                            del(data.id);
                        });
                    }
                })
        });
    });
};

self.addEventListener("notificationclick", function (event) {
    let notification = event.notification;
    event.waitUntil(
        clients.matchAll().then(function (cl) {
            cl.forEach((client) => {
                client.navigate(notification.data.redirectUrl);
                client.focus();
            });
            notification.close();
        })
    );
});

self.addEventListener("push", function (event) {
    var data;
    if (event.data) {
        data = JSON.parse(event.data.text());
    } else {
        data = { title: "notification", body: "body", redirectUrl: "/" };
    }

    var options = {
        body: data.body,
        data: {
            redirectUrl: data.redirectUrl,
        },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
});