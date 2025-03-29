import API from "../api.js";
import { saveStories } from "../db.js"; // 🔹 Import IndexedDB

const HomePresenter = {
  async loadStories(view) {
    try {
      view.showLoading();
      const response = await API.getStories();

      if (!response.error) {
        await saveStories(response.listStory); // 🔹 Simpan data ke IndexedDB
        view.showStories(response.listStory);
        view.showMap(response.listStory);
      } else {
        view.showEmptyMessage();
      }
    } catch (error) {
      console.log("Gagal mengambil data dari API:", error);
      view.showEmptyMessage();
    }
  },
};

export default HomePresenter;
