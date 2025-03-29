import API from "../api.js";

const StoryModel = {
  async fetchStories() {
    try {
      const response = await API.getStories();
      return response.listStory || [];
    } catch (error) {
      console.error("Gagal mengambil cerita:", error);
      return [];
    }
  },
};

export default StoryModel;
