// API utility functions for frontend
class API {
  constructor() {
    this.baseURL = "/api";
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Health check
  async health() {
    return this.request("/health");
  }

  // Channels
  async getChannels() {
    return this.request("/channels");
  }

  // Scraped Results
  async getScrapedResults() {
    return this.request("/scraped-results");
  }

  async getScrapedResult(id) {
    return this.request(`/scraped-results/${id}`);
  }

  async saveScrapedResult(data) {
    return this.request("/scraped-results", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Messages (WebSocket bridge)
  async sendMessage(type, message, data = null) {
    return this.request("/messages", {
      method: "POST",
      body: JSON.stringify({ type, message, data }),
    });
  }

  // Test methods for Phase 1
  async testConnection() {
    try {
      const health = await this.health();
      const channels = await this.getChannels();
      const results = await this.getScrapedResults();

      return {
        success: true,
        tests: {
          health: health.status === "OK",
          channels: Array.isArray(channels.channels),
          results: Array.isArray(results.data),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Export for global use
window.API = new API();
