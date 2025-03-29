import Home from "./views/home.js";
import Login from "./views/login.js";
import Register from "./views/register.js";
import AddStory from "./views/addStory.js";
import { getStories, deleteStory } from "./db.js";
import NotFound from "./views/notFound.js";

const routes = {
  "/": Home,
  "/login": Login,
  "/register": Register,
  "/add": AddStory,
};

const Router = {
  init: function () {
    window.addEventListener("hashchange", this.loadPage.bind(this)); 
    this.loadPage();
  },

  async loadPage() {
    const token = localStorage.getItem("token");
    const path = window.location.hash.slice(1) || "/";

    if (!token && path !== "/login" && path !== "/register") {
      window.location.hash = "#/login";
      return;
    }

    const content = document.getElementById("content");
    content.innerHTML = `<p>Memuat halaman...</p>`;

    if (navigator.onLine) {
      const page = routes[path] || NotFound;
      content.innerHTML = page.render();
      page.afterRender();
    } else {
      console.log("Offline: Mengambil data dari IndexedDB...");
      const stories = await getStories();

      content.innerHTML = `
        <h2 style="margin-bottom: 20px;">Data Offline</h2>
        <div id="stories-container" style="display: flex; flex-direction: column; gap: 15px;"></div>
        <div id="map" style="height: 400px; margin-bottom: 20px;"></div>

      `;

      const storiesContainer = document.getElementById("stories-container");
      storiesContainer.innerHTML = stories
        .map(
          (story) => `
    <div class="story-card">
      ${
        story.photoUrl
          ? `<img class="story-image" src="${story.photoUrl}" alt="Foto cerita">`
          : `<div class="story-placeholder">❌</div>`
      }
      <div class="story-info">
        <h3>${story.name || "Tanpa Nama"}</h3>
        <p>${story.description || "Tidak ada deskripsi"}</p>
        <small>📅 ${new Date(story.createdAt).toLocaleString()}</small>
      </div>
      <button class="delete-story" data-id="${story.id}">🗑</button>
    </div>
    `
        )
        .join("");

      // Tambahkan event listener untuk tombol hapus
      document.querySelectorAll(".delete-story").forEach((button) => {
        button.addEventListener("click", async (event) => {
          const storyId = event.target.dataset.id;
          console.log(`Menghapus cerita dengan ID: ${storyId}`);

          if (!storyId) {
            console.error("❌ ID cerita tidak ditemukan.");
            return;
          }

          try {
            await deleteStory(storyId);
            alert("✅ Cerita berhasil dihapus.");
            location.reload();
          } catch (error) {
            console.error("❌ Gagal menghapus cerita:", error);
          }
        });
      });

      // Menampilkan peta dengan titik lokasi cerita
      const map = L.map("map").setView([-2.5489, 118.0149], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      stories.forEach((story) => {
        if (story.lat && story.lon) {
          L.marker([story.lat, story.lon])
            .addTo(map)
            .bindPopup(`<b>${story.name}</b><br>${story.description}`);
        }
      });
    }

    this.updateNav();
  },

  updateNav: function () {
    const token = localStorage.getItem("token");
    const loginLink = document.getElementById("login-link");
    const registerLink = document.getElementById("register-link");
    const nav = document.querySelector("nav");

    if (token) {
      if (!document.getElementById("logout-link")) {
        const logoutLink = document.createElement("a");
        logoutLink.href = "#";
        logoutLink.id = "logout-link";
        logoutLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        nav.appendChild(logoutLink);

        logoutLink.addEventListener("click", async () => {
          const subscription = await navigator.serviceWorker.ready.then(
            (registration) => registration.pushManager.getSubscription()
          );

          if (subscription) {
            await fetch(
              "https://story-api.dicoding.dev/v1/notifications/subscribe",
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ endpoint: subscription.endpoint }),
              }
            );

            await subscription.unsubscribe();
            console.log("Berhasil unsubscribe dari push notification");
          }

          localStorage.removeItem("token");
          window.location.hash = "#/login";
          this.updateNav();
        });
      }
      loginLink.style.display = "none";
      registerLink.style.display = "none";
    } else {
      loginLink.style.display = "inline";
      registerLink.style.display = "inline";
      const logoutLink = document.getElementById("logout-link");
      if (logoutLink) logoutLink.remove();
    }
  },
};

export default Router;
