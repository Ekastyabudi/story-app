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


async function subscribeToPush(registration) {
  const publicKey =
    "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    const token = localStorage.getItem("token");
    await fetch("https://story-api.dicoding.dev/v1/notifications/subscribe", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });

    console.log("Berhasil subscribe ke push notification");
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
