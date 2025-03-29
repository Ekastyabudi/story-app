import API from "../api.js";

const AddStory = {
  render: () => `
        <h2>Tambah Cerita</h2>
        <form id="story-form">
    
             <label for="description">Deskripsi:</label>
             <textarea id="description" name="description" placeholder="Deskripsi" required></textarea>
    
             <label for="photo">Unggah Gambar:</label>
             <input type="file" id="photo" name="photo" accept="image/*">
    
             <label for="camera">Ambil Gambar:</label>
             <video id="camera" autoplay style="width: 100%; max-height: 300px;"></video>
             <button type="button" id="capture">Ambil Foto</button>
             <canvas id="canvas" style="display: none;"></canvas>
             <img id="preview" style="display: none; max-width: 100%; margin-top: 10px;" alt="Hasil Foto">
    
             <label for="latitude">Latitude:</label>
             <input type="hidden" id="latitude" name="latitude">
    
             <label for="longitude">Longitude:</label>
             <input type="hidden" id="longitude" name="longitude">
    
             <div id="map" style="height: 300px;"></div>
             <button type="submit">Kirim</button>
        </form>
    `,
  afterRender: () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Silakan login terlebih dahulu.");
      window.location.hash = "#/login";
      return;
    }

    let map = L.map("map").setView([-6.2, 106.8], 5);

    // Tambahkan Tile Layers (OpenStreetMap dan MapTiler)
    const openStreetMap = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "© OpenStreetMap contributors",
      }
    );

    const mapTiler = L.tileLayer(
      "https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=rL1vuy53mcprCTLZKvJU",
      {
        attribution: "© MapTiler © OpenStreetMap contributors",
      }
    );

    // Tambahkan Layer Control
    const baseLayers = {
      OpenStreetMap: openStreetMap,
      "MapTiler Streets": mapTiler,
    };

    L.control.layers(baseLayers).addTo(map);

    // Set default layer
    openStreetMap.addTo(map);

    let marker;
    map.on("click", (e) => {
      if (marker) {
        marker.setLatLng(e.latlng);
      } else {
        marker = L.marker(e.latlng).addTo(map);
      }
      document.getElementById("latitude").value = e.latlng.lat;
      document.getElementById("longitude").value = e.latlng.lng;
    });

    // Setup Kamera
    const video = document.getElementById("camera");
    const canvas = document.getElementById("canvas");
    const captureButton = document.getElementById("capture");
    const preview = document.getElementById("preview");
    let stream;

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((mediaStream) => {
        stream = mediaStream;
        video.srcObject = mediaStream;
      })
      .catch((error) => console.error("Error akses kamera:", error));

    captureButton.addEventListener("click", () => {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to image and display
      const imageDataUrl = canvas.toDataURL("image/jpeg");
      preview.src = imageDataUrl;
      preview.style.display = "block"; // Tampilkan gambar

      // Simpan file ke input hidden
      canvas.toBlob((blob) => {
        document.getElementById("photo").file = new File(
          [blob],
          "captured-image.jpg",
          { type: "image/jpeg" }
        );
      }, "image/jpeg");
    });

    // Matikan kamera setelah keluar halaman
    window.addEventListener("hashchange", () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    });

    document
      .getElementById("story-form")
      .addEventListener("submit", async (event) => {
        event.preventDefault();

        const description = document.getElementById("description").value;
        const photoInput = document.getElementById("photo");
        const photo =
          photoInput.files[0] || document.getElementById("photo").file;
        const lat = document.getElementById("latitude").value;
        const lon = document.getElementById("longitude").value;

        if (!photo) {
          alert("Harap unggah atau ambil foto!");
          return;
        }

        const storyData = { description, photo, lat, lon };

        try {
          const response = await API.addStory(storyData, token);

          if (response.error) {
            alert("Gagal menambahkan cerita: " + response.message);
          } else {
            alert("Cerita berhasil ditambahkan!");
            sendPushNotification(description); // ✅ Kirim notifikasi
            window.location.hash = "#/home";
          }
        } catch (error) {
          console.error("Error:", error);
          alert("Terjadi kesalahan, coba lagi nanti.");
        }
      });
  },
};

async function sendPushNotification(description) {
  const notificationData = {
    title: "Story berhasil dibuat",
    options: {
      body: `Anda telah membuat story baru dengan deskripsi: ${description}`,
    },
  };

  if (!("serviceWorker" in navigator)) {
    console.error("Service Worker tidak didukung di browser ini.");
    return;
  }

  navigator.serviceWorker.ready.then((registration) => {
    registration.showNotification(
      notificationData.title,
      notificationData.options
    );
  });
}

export default AddStory;
