const DB_NAME = "BerbagiCeritaDB";
const STORE_NAME = "stories";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

async function saveStories(stories) {
  if (!Array.isArray(stories) || stories.length === 0) {
    console.warn("Tidak ada data yang disimpan ke IndexedDB.");
    return;
  }

  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  for (const story of stories) {
    if (!story.id) {
      console.warn("Cerita tanpa ID ditemukan, tidak disimpan:", story);
      continue; // Skip data tanpa ID
    }
    store.put(story);
  }

  console.log("✅ Data berhasil disimpan ke IndexedDB:", stories);
  return tx.complete;
}

async function getStories() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      console.log("📂 Data yang diambil dari IndexedDB:", request.result);
      resolve(request.result);
    };

    request.onerror = () => {
      console.error("❌ Gagal mengambil data dari IndexedDB");
      reject("Error: Gagal mengambil data dari IndexedDB");
    };
  });
}

async function deleteStory(id) {
  console.log("🗑 Menghapus ID:", id);

  if (!id) {
    console.error("❌ ID tidak valid, tidak bisa menghapus.");
    return;
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log(`✅ Cerita dengan ID ${id} telah dihapus dari IndexedDB.`);
      resolve();
    };

    request.onerror = () => {
      console.error("❌ Gagal menghapus cerita dari IndexedDB.");
      reject("Error: Gagal menghapus cerita.");
    };
  });
}

export { saveStories, getStories, deleteStory };
