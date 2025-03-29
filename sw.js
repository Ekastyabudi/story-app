importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js"
);

const CACHE_NAME = "berbagi-cerita-v2";

if (workbox) {
  console.log("✅ Workbox berhasil dimuat");

  // 🔹 Precache Aset Statis
  workbox.precaching.precacheAndRoute([
    "/",
    "/index.html",
    "/manifest.json",
    "/src/styles/style.css",
    "/src/main.js",
    "/src/router.js",
    "/src/views/home.js",
    "/src/views/login.js",
    "/src/views/register.js",
    "/src/views/addStory.js",
    "/src/views/notFound.js",
    "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css",
  ]);

  // 🔹 Strategi Cache untuk Aset Statis (HTML, CSS, JS)
  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === "document" ||
      request.destination === "script" ||
      request.destination === "style",
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: "static-assets",
    })
  );

  // 🔹 Strategi Cache untuk Gambar
  workbox.routing.registerRoute(
    ({ request }) => request.destination === "image",
    new workbox.strategies.CacheFirst({
      cacheName: "image-cache",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // Simpan 7 hari
        }),
      ],
    })
  );

  // 🔹 Strategi Cache untuk API
  workbox.routing.registerRoute(
    ({ url }) => url.origin === "https://story-api.dicoding.dev/v1/stories", // Ganti dengan API-mu
    new workbox.strategies.NetworkFirst({
      cacheName: "api-cache",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 5 * 60, // Simpan selama 5 menit
        }),
      ],
    })
  );

  // 🔹 Push Notification
  self.addEventListener("push", (event) => {
    const data = event.data.json();
    self.registration.showNotification(data.title, data.options);
  });

  // 🔹 Handle Click Notifikasi
  self.addEventListener("notificationclick", (event) => {
    event.notification.close();
  });
} else {
  console.log("❌ Workbox gagal dimuat");
}
