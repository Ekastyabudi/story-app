const API_ENDPOINT = "https://story-api.dicoding.dev/v1";

const API = {
  register: async (userData) => {
    const response = await fetch(`${API_ENDPOINT}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${API_ENDPOINT}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  getStories: async () => {
    const token = localStorage.getItem("token"); // Ambil token dari localStorage

    if (!token) {
      throw new Error("Token tidak ditemukan! Silakan login terlebih dahulu.");
    }

    const response = await fetch(`${API_ENDPOINT}/stories`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Kirim token agar tidak 401
      },
    });

    return response.json();
  },

  addStory: async (storyData, token) => {
    const formData = new FormData();
    formData.append("description", storyData.description);
    formData.append("photo", storyData.photo);
    if (storyData.lat && storyData.lon) {
      formData.append("lat", storyData.lat);
      formData.append("lon", storyData.lon);
    }

    const response = await fetch(`${API_ENDPOINT}/stories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Token harus diberikan
      },
      body: formData,
    });

    return response.json();
  },
};

export default API;
