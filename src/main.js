import Router from "./router.js";
import { saveStories, getStories } from "./db.js";

document.addEventListener("DOMContentLoaded", () => {
  Router.init();
  Router.updateNav();
  fetchAndStoreStories();
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(reg => {
            console.log("Service Worker berhasil didaftarkan!", reg);
            return reg;
        })
        .then(() => subscribeToPush()) // Panggil subscribe setelah SW siap
        .catch(err => console.error("Service Worker gagal didaftarkan:", err));
}


async function subscribeToPush() {
    if (!('serviceWorker' in navigator)) {
        console.error("Service Worker tidak didukung di browser ini.");
        return;
    }

    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
        console.error("Service Worker belum siap.");
        return;
    }

    try {
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: '<PUBLIC_VAPID_KEY>'
        });

        console.log("Berhasil subscribe ke Push Notification:", subscription);
        // Kirim subscription ke server backend kamu
    } catch (error) {
        console.error("Gagal subscribe ke push notification:", error);
    }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function fetchAndStoreStories() {
  const token = localStorage.getItem("token"); // Ambil token dari localStorage

  if (!token) {
    console.error("❌ Token tidak ditemukan! Silakan login ulang.");
    return;
  }

  try {
    const response = await fetch("https://story-api.dicoding.dev/v1/stories", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.error) {
      await saveStories(data.listStory);
      console.log("✅ Data cerita berhasil disimpan ke IndexedDB");
    }
  } catch (error) {
    console.log(
      "❌ Gagal mengambil data dari API, menggunakan data offline..."
    );
  }
}
