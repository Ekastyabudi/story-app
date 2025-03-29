import HomePresenter from "../presenters/HomePresenter.js";
import { getStories } from "../db.js"; // 🔹 Import fungsi IndexedDB

const Home = {
  render: () => `
        <h2>Daftar Cerita</h2>
        <div id="story-list">Memuat cerita...</div>
        <div id="map" style="height: 400px; margin-top: 20px;"></div>
    `,

  afterRender: async () => {
    if (navigator.onLine) {
      console.log("Online: Mengambil data dari API...");
      HomePresenter.loadStories(Home);
    } else {
      console.log("Offline: Mengambil data dari IndexedDB...");
      const stories = await getStories();
      if (stories.length > 0) {
        Home.showStories(stories);
        Home.showMap(stories);
      } else {
        Home.showEmptyMessage();
      }
    }
  },

  showLoading: () => {
    document.getElementById("story-list").innerHTML = "<p>Memuat cerita...</p>";
  },

  showStories: (stories) => {
    const storyList = document.getElementById("story-list");
    storyList.innerHTML = "";

    stories.forEach((story) => {
      const storyElement = document.createElement("div");
      storyElement.classList.add("story-card");
      storyElement.innerHTML = `
                <img src="${story.photoUrl}" alt="Gambar cerita: ${
        story.description
      }" class="story-image">
                <div class="story-info">
                    <h3>${story.description}</h3>
                    <p>${story.name}</p>
                    <small>📅 ${new Date(
                      story.createdAt
                    ).toLocaleString()}</small>
                </div>
            `;
      storyList.appendChild(storyElement);
    });
  },

  showEmptyMessage: () => {
    document.getElementById("story-list").innerHTML =
      "<p>Tidak ada cerita yang bisa ditampilkan.</p>";
  },

  showMap: (stories) => {
    const mapContainer = document.getElementById("map");

    if (!mapContainer) return;

    // Inisialisasi peta
    const map = L.map(mapContainer).setView([-2.5489, 118.0149], 4);

    // Definisikan dua layer peta
    const openStreetMap = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { attribution: "© OpenStreetMap contributors" }
    );

    const mapTiler = L.tileLayer(
      "https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=rL1vuy53mcprCTLZKvJU",
      { attribution: "© MapTiler © OpenStreetMap contributors" }
    );

    // Tambahkan kontrol layer
    const baseLayers = {
      OpenStreetMap: openStreetMap,
      "MapTiler Streets": mapTiler,
    };

    L.control.layers(baseLayers).addTo(map);

    // Set layer default
    openStreetMap.addTo(map);

    // Tambahkan marker untuk setiap cerita yang memiliki koordinat
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(map);
        marker.bindPopup(`<b>${story.description}</b><br>${story.name}`);
      }
    });
  },
};

export default Home;
