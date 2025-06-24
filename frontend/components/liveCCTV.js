// Live CCTV component for displaying camera feeds and detection results - Phase 3 Enhanced
class LiveCCTV {
  constructor() {
    this.cctvFeeds = new Map();
    this.detectionResults = new Map();
    this.container = document.getElementById("cctv-container");
    this.isFullscreen = false;
    this.autoRefresh = true;
    this.refreshInterval = null;
    this.init();
  }

  init() {
    console.log("📹 Initializing Live CCTV component Phase 3...");
    this.setupEventListeners();
    this.loadCCTVFeeds();
    this.startAutoRefresh();
    this.addMessage("info", "CCTV component initialized", "CCTV");
  }

  setupEventListeners() {
    // Listen for WebSocket updates
    if (window.dashboard) {
      // Dashboard will call updateDetection method directly
    }

    // Fullscreen change events
    document.addEventListener("fullscreenchange", () => {
      this.isFullscreen = !!document.fullscreenElement;
      this.updateFullscreenUI();
    });

    // Auto-refresh controls
    const autoRefreshToggle = document.getElementById("auto-refresh-cctv");
    if (autoRefreshToggle) {
      autoRefreshToggle.addEventListener("change", (e) => {
        this.autoRefresh = e.target.checked;
        if (this.autoRefresh) {
          this.startAutoRefresh();
        } else {
          this.stopAutoRefresh();
        }
      });
    }
  }

  startAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    if (this.autoRefresh) {
      this.refreshInterval = setInterval(() => {
        this.refreshFeeds();
      }, 30000); // Refresh every 30 seconds
    }
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  refreshFeeds() {
    this.addMessage("info", "Auto-refreshing CCTV feeds...", "CCTV");
    this.loadCCTVFeeds();
  }

  async loadCCTVFeeds() {
    try {
      this.addMessage("info", "Loading CCTV feeds...", "CCTV");

      // Phase 3: Enhanced mock feeds with more realistic data
      const mockFeeds = [
        {
          id: 1,
          name: "Front Entrance",
          location: "Building A - Main Door",
          stream_url: "https://picsum.photos/640/360?random=1",
          status: "online",
          resolution: "1920x1080",
          fps: 30,
          lastDetection: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
          detectionCount: 15,
        },
        {
          id: 2,
          name: "Parking Area",
          location: "Building A - Parking Lot",
          stream_url: "https://picsum.photos/640/360?random=2",
          status: "online",
          resolution: "1280x720",
          fps: 25,
          lastDetection: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          detectionCount: 8,
        },
        {
          id: 3,
          name: "Reception Area",
          location: "Building B - Reception",
          stream_url: "https://picsum.photos/640/360?random=3",
          status: "online",
          resolution: "1920x1080",
          fps: 30,
          lastDetection: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
          detectionCount: 22,
        },
        {
          id: 4,
          name: "Server Room",
          location: "Building C - IT Department",
          stream_url: "https://picsum.photos/640/360?random=4",
          status: "offline",
          resolution: "1280x720",
          fps: 0,
          lastDetection: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          detectionCount: 3,
        },
      ];

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      this.renderCCTVFeeds(mockFeeds);

      // Update statistics
      const onlineFeeds = mockFeeds.filter(
        (feed) => feed.status === "online"
      ).length;
      this.updateStats(onlineFeeds, mockFeeds.length);

      this.addMessage(
        "success",
        `Loaded ${mockFeeds.length} CCTV feeds (${onlineFeeds} online)`,
        "CCTV"
      );
    } catch (error) {
      console.error("Error loading CCTV feeds:", error);
      this.addMessage(
        "error",
        "Failed to load CCTV feeds: " + error.message,
        "CCTV"
      );
      Helper.showNotification("Failed to load CCTV feeds", "error");
    }
  }

  updateStats(onlineFeeds, totalFeeds) {
    // Update active feeds count in header stats
    const activeFeedsElement = document.getElementById("active-cameras");
    if (activeFeedsElement) {
      activeFeedsElement.textContent = onlineFeeds;
    }

    // Update system health based on camera status
    if (window.dashboard) {
      window.dashboard.systemHealth.cameras = onlineFeeds;
      window.dashboard.updateSystemStats();
    }
  }

  renderCCTVFeeds(feeds) {
    if (!this.container) return;

    this.container.innerHTML = "";

    feeds.forEach((feed) => {
      const feedElement = this.createFeedElement(feed);
      this.container.appendChild(feedElement);
      this.cctvFeeds.set(feed.id, feed);
    });
  }

  createFeedElement(feed) {
    const isOnline = feed.status === "online";
    const statusClass = isOnline ? "badge-success" : "badge-error";
    const statusText = isOnline ? "Online" : "Offline";
    const lastDetectionTime = feed.lastDetection
      ? new Date(feed.lastDetection).toLocaleTimeString()
      : "Never";

    const feedHTML = `
      <div class="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 cctv-card" data-feed-id="${
        feed.id
      }">
        <figure class="cctv-feed relative">
          ${
            isOnline
              ? `<img src="${feed.stream_url}" alt="${feed.name}" class="w-full h-48 object-cover" />
               <div class="absolute top-2 left-2 flex gap-2">
                 <div class="badge badge-success badge-sm">🔴 LIVE</div>
                 <div class="badge badge-neutral badge-sm">${feed.fps} FPS</div>
               </div>
               <div class="absolute top-2 right-2">
                 <div class="badge badge-neutral badge-sm">${feed.resolution}</div>
               </div>`
              : `<div class="flex items-center justify-center h-48 bg-base-300 text-base-content">
                 <div class="text-center">
                   <div class="text-4xl mb-2">📹</div>
                   <div>Camera Offline</div>
                 </div>
               </div>`
          }
          ${
            isOnline
              ? '<div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>'
              : ""
          }
        </figure>
        
        <div class="card-body p-4">
          <h3 class="card-title text-sm flex items-center justify-between">
            <span>${Helper.escapeHtml(feed.name)}</span>
            <div class="badge ${statusClass} badge-sm">${statusText}</div>
          </h3>
          
          <p class="text-xs text-base-content/70 mb-2">📍 ${Helper.escapeHtml(
            feed.location
          )}</p>
          
          <!-- Feed Stats -->
          <div class="grid grid-cols-2 gap-2 text-xs mb-3">
            <div class="stat bg-base-100 rounded-lg p-2">
              <div class="stat-title text-xs">Detections</div>
              <div class="stat-value text-sm ${
                feed.detectionCount > 15
                  ? "text-warning"
                  : feed.detectionCount > 5
                  ? "text-info"
                  : "text-success"
              }">${feed.detectionCount}</div>
            </div>
            <div class="stat bg-base-100 rounded-lg p-2">
              <div class="stat-title text-xs">Last Activity</div>
              <div class="stat-value text-xs">${lastDetectionTime}</div>
            </div>
          </div>

          <!-- Detection History -->
          <div class="mb-3">
            <div class="text-xs font-medium mb-1">Recent Detections:</div>
            <div id="detection-history-${
              feed.id
            }" class="max-h-20 overflow-y-auto text-xs bg-base-100 rounded p-2">
              <div class="text-base-content/50">Loading recent detections...</div>
            </div>
          </div>

          <div class="card-actions justify-between">
            <div class="flex gap-1">
              <button class="btn btn-xs btn-primary" onclick="window.LiveCCTV.viewFullscreen(${
                feed.id
              })">
                🔍 View
              </button>
              <button class="btn btn-xs btn-outline" onclick="window.LiveCCTV.showHistory(${
                feed.id
              })">
                📊 History
              </button>
            </div>
            ${
              isOnline
                ? `<button class="btn btn-xs btn-success btn-outline" onclick="window.LiveCCTV.recordClip(${feed.id})">
                   🎥 Record
                 </button>`
                : `<button class="btn btn-xs btn-error btn-outline" onclick="window.LiveCCTV.reconnectFeed(${feed.id})">
                   🔄 Reconnect
                 </button>`
            }
          </div>
        </div>
      </div>
    `;

    const feedElement = document.createElement("div");
    feedElement.innerHTML = feedHTML;
    return feedElement.firstElementChild;
  }

  updateDetection(data) {
    const { cctv_id, detection_data, timestamp, snapshot_url } =
      data.data || {};

    if (!cctv_id) return;

    // Store detection result
    if (!this.detectionResults.has(cctv_id)) {
      this.detectionResults.set(cctv_id, []);
    }

    const detections = this.detectionResults.get(cctv_id);
    detections.unshift({
      timestamp,
      data: detection_data,
      snapshot_url,
    });

    // Keep only last 10 detections
    if (detections.length > 10) {
      detections.splice(10);
    }

    // Update UI
    this.updateDetectionHistory(cctv_id);
    this.addDetectionAlert(cctv_id, detection_data);

    // Update system stats
    if (window.dashboard) {
      window.dashboard.systemHealth.analyses++;
      window.dashboard.updateSystemStats();
    }

    // Log the detection
    this.addMessage(
      "warning",
      `Detection on ${
        this.cctvFeeds.get(cctv_id)?.name || `Camera ${cctv_id}`
      }: ${detection_data}`,
      "CCTV"
    );

    // Show notification
    Helper.showNotification(
      `⚠️ Detection alert from ${
        this.cctvFeeds.get(cctv_id)?.name || "Camera"
      }`,
      "warning",
      5000
    );
  }

  addDetectionAlert(cctvId, detectionData) {
    // Add visual alert to the camera card
    const card = document.querySelector(`[data-feed-id="${cctvId}"]`);
    if (card) {
      card.classList.add("animate-pulse", "ring-2", "ring-warning");
      setTimeout(() => {
        card.classList.remove("animate-pulse", "ring-2", "ring-warning");
      }, 3000);
    }
  }

  updateDetectionHistory(cctvId) {
    const historyElement = document.getElementById(
      `detection-history-${cctvId}`
    );
    if (!historyElement) return;

    const detections = this.detectionResults.get(cctvId) || [];

    if (detections.length === 0) {
      historyElement.innerHTML =
        '<div class="text-base-content/50">No recent detections</div>';
      return;
    }

    const historyHTML = detections
      .map(
        (detection, index) => `
        <div class="flex justify-between items-center py-1 px-2 ${
          index % 2 === 0 ? "bg-base-200" : ""
        } rounded text-xs">
          <span class="text-warning flex items-center gap-1">
            ⚠️ ${detection.data || "Motion detected"}
          </span>
          <span class="text-base-content/70">${Helper.timeAgo(
            detection.timestamp
          )}</span>
        </div>
      `
      )
      .join("");

    historyElement.innerHTML = historyHTML;
  }

  // Enhanced UI methods
  viewFullscreen(feedId) {
    const feed = this.cctvFeeds.get(feedId);
    if (!feed || feed.status !== "online") {
      this.addMessage(
        "warning",
        "Cannot view offline camera in fullscreen",
        "CCTV"
      );
      return;
    }

    const modal = document.createElement("dialog");
    modal.className = "modal modal-open";
    modal.innerHTML = `
      <div class="modal-box w-11/12 max-w-5xl h-5/6">
        <h3 class="font-bold text-lg mb-4">📹 ${Helper.escapeHtml(
          feed.name
        )}</h3>
        <div class="relative">
          <img src="${feed.stream_url}" alt="${
      feed.name
    }" class="w-full h-96 object-cover rounded-lg" />
          <div class="absolute top-2 left-2 flex gap-2">
            <div class="badge badge-success">🔴 LIVE</div>
            <div class="badge badge-neutral">${feed.resolution}</div>
            <div class="badge badge-neutral">${feed.fps} FPS</div>
          </div>
        </div>
        <div class="mt-4">
          <p class="text-sm text-base-content/70">📍 ${Helper.escapeHtml(
            feed.location
          )}</p>
          <div class="mt-2 grid grid-cols-3 gap-4 text-sm">
            <div class="stat bg-base-200 rounded-lg p-3">
              <div class="stat-title">Detections Today</div>
              <div class="stat-value text-lg">${feed.detectionCount}</div>
            </div>
            <div class="stat bg-base-200 rounded-lg p-3">
              <div class="stat-title">Resolution</div>
              <div class="stat-value text-lg">${feed.resolution}</div>
            </div>
            <div class="stat bg-base-200 rounded-lg p-3">
              <div class="stat-title">Frame Rate</div>
              <div class="stat-value text-lg">${feed.fps} FPS</div>
            </div>
          </div>
        </div>
        <div class="modal-action">
          <button class="btn btn-outline" onclick="window.LiveCCTV.recordClip(${feedId})">🎥 Start Recording</button>
          <form method="dialog">
            <button class="btn">Close</button>
          </form>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    `;

    document.body.appendChild(modal);
    modal.showModal();
    modal.addEventListener("close", () => modal.remove());

    this.addMessage("info", `Opened fullscreen view for ${feed.name}`, "CCTV");
  }

  showHistory(feedId) {
    const feed = this.cctvFeeds.get(feedId);
    const detections = this.detectionResults.get(feedId) || [];

    const modal = document.createElement("dialog");
    modal.className = "modal modal-open";
    modal.innerHTML = `
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">📊 Detection History - ${Helper.escapeHtml(
          feed?.name || "Camera"
        )}</h3>
        
        <div class="mb-4">
          <div class="stats stats-horizontal shadow w-full">
            <div class="stat">
              <div class="stat-title">Total Detections</div>
              <div class="stat-value text-2xl">${detections.length}</div>
            </div>
            <div class="stat">
              <div class="stat-title">Last Detection</div>
              <div class="stat-value text-sm">${
                detections.length > 0
                  ? Helper.timeAgo(detections[0].timestamp)
                  : "None"
              }</div>
            </div>
          </div>
        </div>
        
        <div class="max-h-64 overflow-y-auto">
          ${
            detections.length > 0
              ? detections
                  .map(
                    (detection) => `
                <div class="card bg-base-200 mb-2">
                  <div class="card-body p-3">
                    <div class="flex justify-between items-center">
                      <span class="text-warning">⚠️ ${
                        detection.data || "Motion detected"
                      }</span>
                      <span class="text-xs text-base-content/70">${new Date(
                        detection.timestamp
                      ).toLocaleString()}</span>
                    </div>
                    ${
                      detection.snapshot_url
                        ? `<img src="${detection.snapshot_url}" class="w-full h-24 object-cover rounded mt-2" />`
                        : ""
                    }
                  </div>
                </div>
              `
                  )
                  .join("")
              : '<div class="text-center text-base-content/50 py-8">No detections recorded</div>'
          }
        </div>
        
        <div class="modal-action">
          <button class="btn btn-outline" onclick="window.LiveCCTV.exportHistory(${feedId})">📄 Export</button>
          <form method="dialog">
            <button class="btn">Close</button>
          </form>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    `;

    document.body.appendChild(modal);
    modal.showModal();
    modal.addEventListener("close", () => modal.remove());
  }

  recordClip(feedId) {
    const feed = this.cctvFeeds.get(feedId);
    if (!feed || feed.status !== "online") {
      this.addMessage("error", "Cannot record from offline camera", "CCTV");
      return;
    }

    this.addMessage("info", `Started recording from ${feed.name}`, "CCTV");
    Helper.showNotification(
      `🎥 Recording started for ${feed.name}`,
      "info",
      3000
    );

    // Simulate recording for 10 seconds
    setTimeout(() => {
      this.addMessage(
        "success",
        `Recording completed for ${feed.name}`,
        "CCTV"
      );
      Helper.showNotification(
        `✅ Recording saved for ${feed.name}`,
        "success",
        3000
      );
    }, 10000);
  }

  reconnectFeed(feedId) {
    const feed = this.cctvFeeds.get(feedId);
    if (!feed) return;

    this.addMessage("info", `Attempting to reconnect ${feed.name}...`, "CCTV");

    // Simulate reconnection process
    setTimeout(() => {
      feed.status = "online";
      this.addMessage(
        "success",
        `Successfully reconnected ${feed.name}`,
        "CCTV"
      );
      this.loadCCTVFeeds(); // Refresh the display
    }, 3000);
  }

  exportHistory(feedId) {
    const feed = this.cctvFeeds.get(feedId);
    const detections = this.detectionResults.get(feedId) || [];

    const csv = [
      "Timestamp,Detection Type,Camera Name,Location",
      ...detections.map(
        (d) =>
          `${d.timestamp},"${d.data || "Motion detected"}","${
            feed?.name || "Unknown"
          }","${feed?.location || "Unknown"}"`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `cctv-detections-${feedId}-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.addMessage(
      "success",
      `Exported detection history for ${feed?.name || "Camera"}`,
      "CCTV"
    );
  }

  updateFullscreenUI() {
    const fullscreenBtn = document.getElementById("fullscreen-mode-btn");
    if (fullscreenBtn) {
      fullscreenBtn.textContent = this.isFullscreen
        ? "🗗 Exit Fullscreen"
        : "🗖 Fullscreen";
    }
  }

  // Utility method to add messages to dashboard
  addMessage(level, message, category) {
    if (window.dashboard && window.dashboard.addMessage) {
      window.dashboard.addMessage(level, message, category);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.LiveCCTV = new LiveCCTV();
});
