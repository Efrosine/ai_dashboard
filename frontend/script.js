// Main application script
class AIDashboard {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;

    this.init();
  }

  init() {
    console.log("🚀 Initializing AI Dashboard...");
    this.setupEventListeners();
    this.connectWebSocket();
    this.loadInitialData();
    this.updateSystemStats();
  }

  setupEventListeners() {
    // Test connection button
    const testBtn = document.getElementById("test-connection-btn");
    if (testBtn) {
      testBtn.addEventListener("click", () => this.testConnection());
    }

    // Navigation smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute("href"));
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  }

  connectWebSocket() {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      console.log("Connecting to WebSocket:", wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("✅ WebSocket connected");
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.updateConnectionStatus(true);
        this.logMessage("WebSocket connected successfully", "success");
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📨 WebSocket message received:", data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("🔌 WebSocket disconnected");
        this.isConnected = false;
        this.updateConnectionStatus(false);
        this.logMessage("WebSocket disconnected", "warning");
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        this.logMessage("WebSocket connection error", "error");
      };
    } catch (error) {
      console.error("Failed to initialize WebSocket:", error);
      this.logMessage("Failed to initialize WebSocket connection", "error");
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connectWebSocket();
      }, this.reconnectDelay);
    } else {
      console.log("❌ Max reconnection attempts reached");
      this.logMessage(
        "Connection failed after maximum retry attempts",
        "error"
      );
    }
  }

  handleWebSocketMessage(data) {
    // Update last update time
    this.updateLastUpdate();

    // Handle different message types
    switch (data.type) {
      case "connection":
        this.logMessage(data.message, "info");
        break;
      case "cctv_detection":
        this.handleCCTVDetection(data);
        break;
      case "social_analysis":
        this.handleSocialAnalysis(data);
        break;
      case "system_status":
        this.handleSystemStatus(data);
        break;
      case "echo":
        this.logMessage(
          `Echo: ${JSON.stringify(data.originalMessage)}`,
          "info"
        );
        break;
      default:
        this.logMessage(
          `Received: ${data.message || "Unknown message"}`,
          "info"
        );
    }
  }

  handleCCTVDetection(data) {
    this.logMessage(`CCTV Detection: ${data.message}`, "warning");
    // Update CCTV component
    if (window.LiveCCTV) {
      window.LiveCCTV.updateDetection(data);
    }
  }

  handleSocialAnalysis(data) {
    this.logMessage(`Social Analysis: ${data.message}`, "info");
    // Update analysis results component
    if (window.AnalysisResult) {
      window.AnalysisResult.updateResults(data);
    }
  }

  handleSystemStatus(data) {
    this.logMessage(`System: ${data.message}`, "success");
    this.updateSystemStats(data.data);
  }

  updateConnectionStatus(connected) {
    const indicator = document.getElementById("connection-indicator");
    const wsStatus = document.getElementById("ws-status");

    if (indicator) {
      if (connected) {
        indicator.textContent = "Online";
        indicator.className = "indicator-item badge badge-success";
      } else {
        indicator.textContent = "Offline";
        indicator.className = "indicator-item badge badge-error pulse";
      }
    }

    if (wsStatus) {
      if (connected) {
        wsStatus.textContent = "Connected";
        wsStatus.className = "stat-value text-success";
      } else {
        wsStatus.textContent = "Disconnected";
        wsStatus.className = "stat-value text-error";
      }
    }
  }

  updateLastUpdate() {
    const lastUpdate = document.getElementById("last-update");
    if (lastUpdate) {
      lastUpdate.textContent = new Date().toLocaleTimeString();
    }
  }

  updateSystemStats(data = {}) {
    const activeFeeds = document.getElementById("active-feeds");
    if (activeFeeds) {
      activeFeeds.textContent = data.activeFeeds || "0";
    }
  }

  logMessage(message, type = "info") {
    const messageLog = document.getElementById("message-log");
    if (!messageLog) return;

    const timestamp = new Date().toLocaleTimeString();
    const prefix =
      type === "error"
        ? "❌"
        : type === "warning"
        ? "⚠️"
        : type === "success"
        ? "✅"
        : "📨";

    const colorClass =
      type === "error"
        ? "text-error"
        : type === "warning"
        ? "text-warning"
        : type === "success"
        ? "text-success"
        : "text-info";

    const logEntry = document.createElement("pre");
    logEntry.setAttribute("data-prefix", prefix);
    logEntry.innerHTML = `<code class="${colorClass}">[${timestamp}] ${message}</code>`;

    messageLog.appendChild(logEntry);
    messageLog.scrollTop = messageLog.scrollHeight;

    // Keep only last 50 messages
    while (messageLog.children.length > 50) {
      messageLog.removeChild(messageLog.firstChild);
    }
  }

  async testConnection() {
    const btn = document.getElementById("test-connection-btn");
    if (btn) {
      btn.classList.add("loading");
      btn.disabled = true;
    }

    try {
      // Test API endpoint
      const response = await fetch("/api/health");
      const data = await response.json();

      if (response.ok) {
        this.logMessage("API health check successful", "success");

        // Test WebSocket by sending a message
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(
            JSON.stringify({
              type: "test",
              message: "Connection test from dashboard",
              timestamp: new Date().toISOString(),
            })
          );
          this.logMessage("WebSocket test message sent", "success");
        } else {
          this.logMessage("WebSocket not connected", "warning");
        }
      } else {
        this.logMessage("API health check failed", "error");
      }
    } catch (error) {
      console.error("Connection test failed:", error);
      this.logMessage("Connection test failed: " + error.message, "error");
    } finally {
      if (btn) {
        btn.classList.remove("loading");
        btn.disabled = false;
      }
    }
  }

  async loadInitialData() {
    this.logMessage("Loading initial dashboard data...", "info");

    try {
      // Load channels information
      const channelsResponse = await fetch("/api/channels");
      if (channelsResponse.ok) {
        const channelsData = await channelsResponse.json();
        console.log("Channels loaded:", channelsData);
        this.logMessage(
          `Loaded ${channelsData.channels?.length || 0} channels`,
          "success"
        );
      }

      // Load scraped results
      const resultsResponse = await fetch("/api/scraped-results");
      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        console.log("Scraped results loaded:", resultsData);
        this.logMessage(
          `Loaded ${resultsData.data?.length || 0} scraped results`,
          "success"
        );
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      this.logMessage("Error loading initial data: " + error.message, "error");
    }
  }

  // Public method to send WebSocket message
  sendMessage(type, message, data = null) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type,
          message,
          data,
          timestamp: new Date().toISOString(),
        })
      );
      return true;
    }
    return false;
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.dashboard = new AIDashboard();
});

// Export for use in other modules
window.AIDashboard = AIDashboard;
