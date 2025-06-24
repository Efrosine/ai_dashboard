// Main application script - Phase 3 Enhanced
class AIDashboard {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.messagesPaused = false;
    this.autoScroll = true;
    this.messageCount = 0;
    this.systemHealth = {
      cameras: 0,
      analyses: 0,
      threatLevel: "Low",
    };

    this.init();
  }

  init() {
    console.log("🚀 Initializing AI Dashboard Phase 3...");
    this.hideLoadingOverlay();
    this.setupEventListeners();
    this.setupTimestamps();
    this.connectWebSocket();
    this.loadInitialData();
    this.updateSystemStats();
    this.initializeComponents();
  }

  hideLoadingOverlay() {
    const overlay = document.getElementById("loading-overlay");
    if (overlay) {
      setTimeout(() => {
        overlay.classList.add("hidden");
        setTimeout(() => overlay.remove(), 500);
      }, 1500);
    }
  }

  setupTimestamps() {
    const now = new Date().toLocaleTimeString();
    const initTimestamp = document.getElementById("init-timestamp");
    const wsTimestamp = document.getElementById("ws-timestamp");
    if (initTimestamp) initTimestamp.textContent = now;
    if (wsTimestamp) wsTimestamp.textContent = now;
  }

  setupEventListeners() {
    // Test connection button
    const testBtn = document.getElementById("test-connection-btn");
    if (testBtn) {
      testBtn.addEventListener("click", () => this.testConnection());
    }

    // Connection status button
    const connectionBtn = document.getElementById("connection-status-btn");
    if (connectionBtn) {
      connectionBtn.addEventListener("click", () =>
        this.showConnectionDetails()
      );
    }

    // Message controls
    this.setupMessageControls();

    // Admin panel buttons
    this.setupAdminControls();

    // CCTV controls
    this.setupCCTVControls();

    // Social media controls
    this.setupSocialMediaControls();

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

    // Theme controller
    const themeController = document.querySelector(".theme-controller");
    if (themeController) {
      themeController.addEventListener("change", (e) => {
        this.handleThemeChange(e.target.checked);
      });
    }
  }

  setupMessageControls() {
    const clearBtn = document.getElementById("clear-messages-btn");
    const exportBtn = document.getElementById("export-logs-btn");
    const pauseBtn = document.getElementById("pause-messages-btn");
    const autoScrollToggle = document.getElementById("auto-scroll-toggle");

    if (clearBtn) {
      clearBtn.addEventListener("click", () => this.clearMessages());
    }

    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportLogs());
    }

    if (pauseBtn) {
      pauseBtn.addEventListener("click", () => this.toggleMessagesPause());
    }

    if (autoScrollToggle) {
      autoScrollToggle.addEventListener("change", (e) => {
        this.autoScroll = e.target.checked;
      });
    }
  }

  setupAdminControls() {
    const manageAccountsBtn = document.getElementById("manage-accounts-btn");
    const configureCamerasBtn = document.getElementById(
      "configure-cameras-btn"
    );
    const manageTargetsBtn = document.getElementById("manage-targets-btn");

    if (manageAccountsBtn) {
      manageAccountsBtn.addEventListener("click", () =>
        this.scrollToSection("admin")
      );
    }

    if (configureCamerasBtn) {
      configureCamerasBtn.addEventListener("click", () =>
        this.scrollToSection("cctv")
      );
    }

    if (manageTargetsBtn) {
      manageTargetsBtn.addEventListener("click", () =>
        this.scrollToSection("admin")
      );
    }
  }

  setupCCTVControls() {
    const addCameraBtn = document.getElementById("add-camera-btn");
    const refreshFeedsBtn = document.getElementById("refresh-feeds-btn");
    const fullscreenBtn = document.getElementById("fullscreen-mode-btn");

    if (addCameraBtn) {
      addCameraBtn.addEventListener("click", () => this.showAddCameraModal());
    }

    if (refreshFeedsBtn) {
      refreshFeedsBtn.addEventListener("click", () => this.refreshCCTVFeeds());
    }

    if (fullscreenBtn) {
      fullscreenBtn.addEventListener("click", () =>
        this.toggleFullscreenMode()
      );
    }
  }

  setupSocialMediaControls() {
    const configureBtn = document.getElementById("configure-scraping-btn");
    const viewResultsBtn = document.getElementById("view-results-btn");
    const threatAnalysisBtn = document.getElementById("threat-analysis-btn");

    if (configureBtn) {
      configureBtn.addEventListener("click", () =>
        this.scrollToSection("admin")
      );
    }

    if (viewResultsBtn) {
      viewResultsBtn.addEventListener("click", () =>
        this.scrollToSection("social-media")
      );
    }

    if (threatAnalysisBtn) {
      threatAnalysisBtn.addEventListener("click", () =>
        this.runThreatAnalysis()
      );
    }
  }

  connectWebSocket() {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      console.log("Connecting to WebSocket:", wsUrl);
      this.updateConnectionStatus("pending", "Connecting...");
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

  updateConnectionStatus(status, message) {
    const indicator = document.getElementById("connection-indicator");
    const wsStatus = document.getElementById("ws-status");
    const connectionIcon = document.getElementById("connection-icon");
    const wsAvatar = document.getElementById("ws-status-avatar");

    if (indicator && wsStatus && connectionIcon) {
      switch (status) {
        case "online":
          indicator.textContent = "Online";
          indicator.className = "indicator-item badge badge-success";
          wsStatus.textContent = message || "Connected";
          wsStatus.className = "stat-value text-success";
          connectionIcon.className = "w-2 h-2 rounded-full bg-success";
          if (wsAvatar) wsAvatar.textContent = "🟢";
          break;
        case "pending":
          indicator.textContent = "Connecting";
          indicator.className = "indicator-item badge badge-warning";
          wsStatus.textContent = message || "Connecting...";
          wsStatus.className = "stat-value text-warning";
          connectionIcon.className =
            "w-2 h-2 rounded-full bg-warning pulse-glow";
          if (wsAvatar) wsAvatar.textContent = "🟡";
          break;
        default:
          indicator.textContent = "Offline";
          indicator.className = "indicator-item badge badge-error";
          wsStatus.textContent = message || "Disconnected";
          wsStatus.className = "stat-value text-error";
          connectionIcon.className = "w-2 h-2 rounded-full bg-error";
          if (wsAvatar) wsAvatar.textContent = "🔴";
      }
    }
  }

  updateLastUpdate() {
    const lastUpdate = document.getElementById("last-update");
    if (lastUpdate) {
      lastUpdate.textContent = new Date().toLocaleTimeString();
    }
  }

  updateSystemStats() {
    const totalAnalyses = document.getElementById("total-analyses");
    const activeCameras = document.getElementById("active-cameras");
    const threatLevel = document.getElementById("threat-level");
    const systemHealth = document.getElementById("system-health");

    if (totalAnalyses) {
      totalAnalyses.textContent = this.systemHealth.analyses;
    }

    if (activeCameras) {
      activeCameras.textContent = this.systemHealth.cameras;
    }

    if (threatLevel) {
      threatLevel.textContent = this.systemHealth.threatLevel;
      threatLevel.className = `stat-value ${
        this.systemHealth.threatLevel === "High"
          ? "text-error"
          : this.systemHealth.threatLevel === "Medium"
          ? "text-warning"
          : "text-success"
      }`;
    }

    if (systemHealth) {
      const health = this.isConnected ? "Good" : "Degraded";
      systemHealth.textContent = health;
      systemHealth.className = `stat-value ${
        this.isConnected ? "text-success" : "text-warning"
      }`;
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

  // Enhanced message handling methods
  addMessage(level, message, category = "SYS") {
    if (this.messagesPaused) return;

    const messageLog = document.getElementById("message-log");
    if (!messageLog) return;

    const timestamp = new Date().toLocaleTimeString();
    const levelColors = {
      info: "text-info",
      success: "text-success",
      warning: "text-warning",
      error: "text-error",
    };

    const messageElement = document.createElement("div");
    messageElement.className = `flex items-center gap-2 ${
      levelColors[level] || "text-base-content"
    }`;
    messageElement.innerHTML = `
      <span class="${level}-content bg-${level} px-2 py-1 rounded text-xs font-mono">${category}</span>
      <span class="text-sm">${message}</span>
      <span class="text-xs text-base-content/50 ml-auto">${timestamp}</span>
    `;

    messageLog.appendChild(messageElement);
    this.messageCount++;

    // Update message count
    const messageCountEl = document.getElementById("message-count");
    if (messageCountEl) {
      messageCountEl.textContent = this.messageCount;
    }

    // Auto-scroll if enabled
    if (this.autoScroll) {
      messageLog.scrollTop = messageLog.scrollHeight;
    }

    // Keep only last 100 messages
    while (messageLog.children.length > 100) {
      messageLog.removeChild(messageLog.firstChild);
      this.messageCount--;
    }
  }

  clearMessages() {
    const messageLog = document.getElementById("message-log");
    if (messageLog) {
      messageLog.innerHTML = "";
      this.messageCount = 0;
      const messageCountEl = document.getElementById("message-count");
      if (messageCountEl) {
        messageCountEl.textContent = "0";
      }
    }
    this.addMessage("info", "Message log cleared", "SYS");
  }

  exportLogs() {
    const messageLog = document.getElementById("message-log");
    if (!messageLog) return;

    const messages = Array.from(messageLog.children)
      .map((el) => el.textContent)
      .join("\n");
    const blob = new Blob([messages], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-dashboard-logs-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.addMessage("success", "Logs exported successfully", "SYS");
  }

  toggleMessagesPause() {
    this.messagesPaused = !this.messagesPaused;
    const pauseBtn = document.getElementById("pause-messages-btn");
    if (pauseBtn) {
      if (this.messagesPaused) {
        pauseBtn.innerHTML = `
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-4-4h0m4 0h0M9 16h1m4 0h1m-6-6h1m4 0h1"></path>
          </svg>
          Resume
        `;
        pauseBtn.classList.add("btn-warning");
      } else {
        pauseBtn.innerHTML = `
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Pause
        `;
        pauseBtn.classList.remove("btn-warning");
      }
    }
  }

  // Navigation and UI methods
  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  }

  showConnectionDetails() {
    const modal = document.createElement("dialog");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Connection Details</h3>
        <div class="space-y-3">
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title">WebSocket Status</div>
            <div class="stat-value ${
              this.isConnected ? "text-success" : "text-error"
            }">
              ${this.isConnected ? "Connected" : "Disconnected"}
            </div>
            <div class="stat-desc">Real-time connection status</div>
          </div>
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title">Reconnect Attempts</div>
            <div class="stat-value">${this.reconnectAttempts}</div>
            <div class="stat-desc">Out of ${
              this.maxReconnectAttempts
            } maximum</div>
          </div>
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title">Connection URL</div>
            <div class="stat-value text-sm">${
              window.location.protocol === "https:" ? "wss:" : "ws:"
            }//${window.location.host}/ws</div>
            <div class="stat-desc">WebSocket endpoint</div>
          </div>
        </div>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn">Close</button>
          </form>
          ${
            !this.isConnected
              ? '<button class="btn btn-primary" onclick="window.dashboard.connectWebSocket()">Reconnect</button>'
              : ""
          }
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    `;

    document.body.appendChild(modal);
    modal.showModal();
    modal.addEventListener("close", () => modal.remove());
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
  sendMessage(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
        })
      );
      return true;
    }
    return false;
  }

  scheduleReconnect() {
    this.reconnectAttempts++;
    this.addMessage(
      "warning",
      `Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`,
      "CONN"
    );

    setTimeout(() => {
      this.connectWebSocket();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  // CCTV Control Methods
  showAddCameraModal() {
    this.showNotification(
      "Add Camera feature will be available in Phase 4",
      "info"
    );
  }

  refreshCCTVFeeds() {
    if (window.LiveCCTV && window.LiveCCTV.loadCCTVFeeds) {
      window.LiveCCTV.loadCCTVFeeds();
      this.addMessage("info", "Refreshing CCTV feeds...", "CCTV");
    }
  }

  toggleFullscreenMode() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }

  runThreatAnalysis() {
    this.addMessage("info", "Initiating threat analysis...", "AI");
    this.showNotification("Threat analysis started", "info", 3000);

    // Simulate analysis process
    setTimeout(() => {
      this.addMessage(
        "success",
        "Threat analysis completed - No immediate threats detected",
        "AI"
      );
      this.showNotification(
        "Analysis complete: Environment secure",
        "success",
        5000
      );
    }, 3000);
  }

  showNotification(message, type = "info", duration = 5000) {
    const toast = document.createElement("div");
    toast.className = `alert alert-${type} slide-in-up`;
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <span>${message}</span>
        <button class="btn btn-ghost btn-sm" onclick="this.parentElement.parentElement.remove()">✕</button>
      </div>
    `;

    const container =
      document.getElementById("toast-container") || document.body;
    container.appendChild(toast);

    // Auto-remove after duration
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add("removing");
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }

  handleThemeChange(isDark) {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light"
    );
    this.addMessage(
      "info",
      `Theme changed to ${isDark ? "dark" : "light"} mode`,
      "UI"
    );
  }

  initializeComponents() {
    this.addMessage("info", "Initializing dashboard components...", "SYS");

    // Initialize component modules if they exist
    if (window.LiveCCTV) {
      window.LiveCCTV.init();
    }

    if (window.AnalysisResult) {
      window.AnalysisResult.init();
    }

    if (window.DummyAccountForm) {
      window.DummyAccountForm.init();
    }

    if (window.LocationList) {
      window.LocationList.init();
    }
  }
}

// Export for use in other modules
window.AIDashboard = AIDashboard;

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.dashboard = new AIDashboard();
});
