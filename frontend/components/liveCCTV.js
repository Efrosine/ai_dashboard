// Live CCTV component for displaying camera feeds and detection results
class LiveCCTV {
  constructor() {
    this.cctvFeeds = new Map();
    this.detectionResults = new Map();
    this.container = document.getElementById("cctv-container");
    this.init();
  }

  init() {
    console.log("📹 Initializing Live CCTV component...");
    this.loadCCTVFeeds();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for CCTV detection updates via WebSocket
    if (window.dashboard) {
      // Will be connected via WebSocket messages
    }
  }

  async loadCCTVFeeds() {
    try {
      // For Phase 1, create mock CCTV feeds for testing
      const mockFeeds = [
        {
          id: 1,
          name: "Front Entrance",
          location: "Building A - Main Door",
          stream_url: "https://picsum.photos/640/360?random=1",
          status: "online",
        },
        {
          id: 2,
          name: "Parking Area",
          location: "Building A - Parking Lot",
          stream_url: "https://picsum.photos/640/360?random=2",
          status: "online",
        },
        {
          id: 3,
          name: "Reception Area",
          location: "Building B - Reception",
          stream_url: "https://picsum.photos/640/360?random=3",
          status: "offline",
        },
      ];

      this.renderCCTVFeeds(mockFeeds);

      // Update active feeds count
      const onlineFeeds = mockFeeds.filter(
        (feed) => feed.status === "online"
      ).length;
      const activeFeedsElement = document.getElementById("active-feeds");
      if (activeFeedsElement) {
        activeFeedsElement.textContent = onlineFeeds;
      }
    } catch (error) {
      console.error("Error loading CCTV feeds:", error);
      Helper.showNotification("Failed to load CCTV feeds", "error");
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

    const feedHTML = `
            <div class="card bg-base-200 shadow-xl">
                <figure class="cctv-feed">
                    ${
                      isOnline
                        ? `<img src="${feed.stream_url}" alt="${feed.name}" class="w-full h-full object-cover" />`
                        : `<div class="flex items-center justify-center h-full bg-base-300 text-base-content">
                            <div class="text-center">
                                <div class="text-4xl mb-2">📹</div>
                                <div>Camera Offline</div>
                            </div>
                        </div>`
                    }
                </figure>
                <div class="card-body p-4">
                    <h3 class="card-title text-sm">
                        ${Helper.escapeHtml(feed.name)}
                        <div class="badge ${statusClass}">${statusText}</div>
                    </h3>
                    <p class="text-xs text-base-content/70">${Helper.escapeHtml(
                      feed.location
                    )}</p>
                    
                    <!-- Detection History -->
                    <div class="mt-2">
                        <div class="text-xs font-medium mb-1">Recent Detections:</div>
                        <div id="detection-history-${
                          feed.id
                        }" class="max-h-24 overflow-y-auto text-xs">
                            <div class="text-base-content/50">No recent detections</div>
                        </div>
                    </div>

                    <div class="card-actions justify-end mt-2">
                        <button class="btn btn-xs btn-primary" onclick="LiveCCTV.viewFullscreen(${
                          feed.id
                        })">
                            View
                        </button>
                        <button class="btn btn-xs btn-outline" onclick="LiveCCTV.showHistory(${
                          feed.id
                        })">
                            History
                        </button>
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

    // Show notification
    Helper.showNotification(
      `Detection alert from ${this.cctvFeeds.get(cctv_id)?.name || "Camera"}`,
      "warning",
      5000
    );
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
        (detection) => `
            <div class="flex justify-between items-center py-1 border-b border-base-300 last:border-b-0">
                <span class="text-warning">⚠️ Detection</span>
                <span class="text-base-content/70">${Helper.timeAgo(
                  detection.timestamp
                )}</span>
            </div>
        `
      )
      .join("");

    historyElement.innerHTML = historyHTML;
  }

  static viewFullscreen(cctvId) {
    const feed = window.LiveCCTV.cctvFeeds.get(cctvId);
    if (!feed) return;

    // Create modal for fullscreen view
    const modal = document.createElement("dialog");
    modal.className = "modal";
    modal.innerHTML = `
            <div class="modal-box w-11/12 max-w-5xl">
                <h3 class="font-bold text-lg mb-4">${Helper.escapeHtml(
                  feed.name
                )}</h3>
                <div class="aspect-video bg-black rounded">
                    ${
                      feed.status === "online"
                        ? `<img src="${feed.stream_url}" alt="${feed.name}" class="w-full h-full object-cover rounded" />`
                        : `<div class="flex items-center justify-center h-full text-white">
                            <div class="text-center">
                                <div class="text-6xl mb-4">📹</div>
                                <div>Camera Offline</div>
                            </div>
                        </div>`
                    }
                </div>
                <div class="modal-action">
                    <button class="btn" onclick="this.closest('dialog').close()">Close</button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>close</button>
            </form>
        `;

    document.body.appendChild(modal);
    modal.showModal();

    // Remove modal when closed
    modal.addEventListener("close", () => {
      modal.remove();
    });
  }

  static showHistory(cctvId) {
    const detections = window.LiveCCTV.detectionResults.get(cctvId) || [];
    const feed = window.LiveCCTV.cctvFeeds.get(cctvId);

    // Create modal for detection history
    const modal = document.createElement("dialog");
    modal.className = "modal";
    modal.innerHTML = `
            <div class="modal-box">
                <h3 class="font-bold text-lg mb-4">Detection History - ${Helper.escapeHtml(
                  feed?.name || "Camera"
                )}</h3>
                <div class="max-h-96 overflow-y-auto">
                    ${
                      detections.length === 0
                        ? '<div class="text-center text-base-content/50 py-8">No detection history available</div>'
                        : detections
                            .map(
                              (detection) => `
                            <div class="card bg-base-200 mb-2">
                                <div class="card-body p-3">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <div class="font-medium">Detection Event</div>
                                            <div class="text-sm text-base-content/70">${Helper.formatTimestamp(
                                              detection.timestamp
                                            )}</div>
                                        </div>
                                        <div class="badge badge-warning">Alert</div>
                                    </div>
                                    ${
                                      detection.data
                                        ? `<div class="text-sm mt-2">${Helper.escapeHtml(
                                            JSON.stringify(detection.data)
                                          )}</div>`
                                        : ""
                                    }
                                </div>
                            </div>
                        `
                            )
                            .join("")
                    }
                </div>
                <div class="modal-action">
                    <button class="btn" onclick="this.closest('dialog').close()">Close</button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>close</button>
            </form>
        `;

    document.body.appendChild(modal);
    modal.showModal();

    // Remove modal when closed
    modal.addEventListener("close", () => {
      modal.remove();
    });
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.LiveCCTV = new LiveCCTV();
});
