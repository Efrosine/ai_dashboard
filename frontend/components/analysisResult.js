// Analysis Result component for displaying social media analysis results
class AnalysisResult {
  constructor() {
    this.results = [];
    this.container = null;
    this.init();
  }

  init() {
    console.log("📊 Initializing Analysis Result component...");
    this.setupContainer();
    this.loadResults();
  }

  setupContainer() {
    // Create results container if it doesn't exist
    const socialSection = document.getElementById("social-media");
    if (
      socialSection &&
      !document.getElementById("analysis-results-container")
    ) {
      const resultsHTML = `
                <div class="mt-6">
                    <h3 class="text-xl font-bold mb-4">📊 Analysis Results</h3>
                    <div id="analysis-results-container" class="space-y-4">
                        <!-- Results will be loaded here -->
                    </div>
                </div>
            `;
      socialSection.insertAdjacentHTML("beforeend", resultsHTML);
    }
    this.container = document.getElementById("analysis-results-container");
  }

  async loadResults() {
    try {
      // For Phase 1, create mock analysis results for testing
      const mockResults = [
        {
          id: 1,
          account: "@test_account_1",
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          analysis: {
            violence_detected: true,
            confidence: 0.85,
            content_type: "image",
            flags: ["weapon_detected", "aggressive_behavior"],
            summary: "Potential violent content detected in social media post",
          },
          source_url: "https://example.com/post/1",
        },
        {
          id: 2,
          account: "@test_account_2",
          timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          analysis: {
            violence_detected: false,
            confidence: 0.12,
            content_type: "text",
            flags: [],
            summary: "No concerning content detected",
          },
          source_url: "https://example.com/post/2",
        },
        {
          id: 3,
          account: "@suspicious_user",
          timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
          analysis: {
            violence_detected: true,
            confidence: 0.92,
            content_type: "video",
            flags: ["violence", "threat", "harassment"],
            summary:
              "High-confidence detection of violent threats and harassment",
          },
          source_url: "https://example.com/post/3",
        },
      ];

      this.results = mockResults;
      this.renderResults();
    } catch (error) {
      console.error("Error loading analysis results:", error);
      Helper.showNotification("Failed to load analysis results", "error");
    }
  }

  renderResults() {
    if (!this.container) return;

    if (this.results.length === 0) {
      this.container.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-6xl mb-4">📊</div>
                    <div class="text-base-content/50">No analysis results available</div>
                </div>
            `;
      return;
    }

    const resultsHTML = this.results
      .map((result) => this.createResultCard(result))
      .join("");
    this.container.innerHTML = resultsHTML;
  }

  createResultCard(result) {
    const isViolent = result.analysis.violence_detected;
    const alertClass = isViolent ? "alert-warning" : "alert-success";
    const alertIcon = isViolent ? "⚠️" : "✅";
    const statusText = isViolent ? "Flagged Content" : "Safe Content";
    const confidenceColor =
      result.analysis.confidence > 0.7
        ? "text-error"
        : result.analysis.confidence > 0.4
        ? "text-warning"
        : "text-success";

    return `
            <div class="card bg-base-200 shadow-md">
                <div class="card-body">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <h4 class="card-title text-sm">${Helper.escapeHtml(
                              result.account
                            )}</h4>
                            <p class="text-xs text-base-content/70">${Helper.formatTimestamp(
                              result.timestamp
                            )}</p>
                        </div>
                        <div class="badge ${
                          isViolent ? "badge-warning" : "badge-success"
                        }">${statusText}</div>
                    </div>

                    <div class="alert ${alertClass} mb-3">
                        <div class="flex items-start">
                            <span class="text-lg mr-2">${alertIcon}</span>
                            <div class="flex-1">
                                <div class="font-medium text-sm">${Helper.escapeHtml(
                                  result.analysis.summary
                                )}</div>
                                <div class="text-xs mt-1">
                                    Confidence: <span class="${confidenceColor} font-medium">${(
      result.analysis.confidence * 100
    ).toFixed(1)}%</span>
                                    | Type: ${result.analysis.content_type}
                                </div>
                            </div>
                        </div>
                    </div>

                    ${
                      result.analysis.flags.length > 0
                        ? `
                        <div class="mb-3">
                            <div class="text-xs font-medium mb-1">Detected Issues:</div>
                            <div class="flex flex-wrap gap-1">
                                ${result.analysis.flags
                                  .map(
                                    (flag) =>
                                      `<span class="badge badge-outline badge-xs">${Helper.escapeHtml(
                                        flag
                                      )}</span>`
                                  )
                                  .join("")}
                            </div>
                        </div>
                    `
                        : ""
                    }

                    <div class="card-actions justify-between items-center">
                        <button class="btn btn-xs btn-outline" onclick="AnalysisResult.viewDetails(${
                          result.id
                        })">
                            View Details
                        </button>
                        <div class="flex gap-2">
                            ${
                              result.source_url
                                ? `
                                <button class="btn btn-xs btn-primary" onclick="AnalysisResult.viewSource('${result.source_url}')">
                                    Source
                                </button>
                            `
                                : ""
                            }
                            <button class="btn btn-xs btn-ghost" onclick="AnalysisResult.copyResult(${
                              result.id
                            })">
                                Copy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  updateResults(data) {
    // Handle real-time analysis result updates
    const newResult = data.data;
    if (newResult) {
      this.results.unshift(newResult);

      // Keep only last 50 results
      if (this.results.length > 50) {
        this.results.splice(50);
      }

      this.renderResults();

      // Show notification for new results
      if (newResult.analysis?.violence_detected) {
        Helper.showNotification(
          `⚠️ Violent content detected from ${newResult.account}`,
          "warning",
          5000
        );
      }
    }
  }

  static viewDetails(resultId) {
    const result = window.AnalysisResult?.results.find(
      (r) => r.id === resultId
    );
    if (!result) return;

    const modal = document.createElement("dialog");
    modal.className = "modal";
    modal.innerHTML = `
            <div class="modal-box max-w-2xl">
                <h3 class="font-bold text-lg mb-4">Analysis Details - ${Helper.escapeHtml(
                  result.account
                )}</h3>
                
                <div class="space-y-4">
                    <div class="stat bg-base-200">
                        <div class="stat-title">Detection Status</div>
                        <div class="stat-value ${
                          result.analysis.violence_detected
                            ? "text-error"
                            : "text-success"
                        }">
                            ${
                              result.analysis.violence_detected
                                ? "Flagged"
                                : "Safe"
                            }
                        </div>
                        <div class="stat-desc">Confidence: ${(
                          result.analysis.confidence * 100
                        ).toFixed(1)}%</div>
                    </div>

                    <div>
                        <h4 class="font-medium mb-2">Analysis Summary</h4>
                        <div class="p-3 bg-base-200 rounded">${Helper.escapeHtml(
                          result.analysis.summary
                        )}</div>
                    </div>

                    <div>
                        <h4 class="font-medium mb-2">Content Details</h4>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="font-medium">Type:</span> ${
                                  result.analysis.content_type
                                }
                            </div>
                            <div>
                                <span class="font-medium">Timestamp:</span> ${Helper.formatTimestamp(
                                  result.timestamp
                                )}
                            </div>
                        </div>
                    </div>

                    ${
                      result.analysis.flags.length > 0
                        ? `
                        <div>
                            <h4 class="font-medium mb-2">Detected Issues</h4>
                            <div class="flex flex-wrap gap-2">
                                ${result.analysis.flags
                                  .map(
                                    (flag) =>
                                      `<span class="badge badge-warning">${Helper.escapeHtml(
                                        flag
                                      )}</span>`
                                  )
                                  .join("")}
                            </div>
                        </div>
                    `
                        : ""
                    }

                    <div>
                        <h4 class="font-medium mb-2">Raw Analysis Data</h4>
                        <div class="mockup-code">
                            <pre><code>${JSON.stringify(
                              result.analysis,
                              null,
                              2
                            )}</code></pre>
                        </div>
                    </div>
                </div>

                <div class="modal-action">
                    <button class="btn btn-primary" onclick="AnalysisResult.copyResult(${
                      result.id
                    })">
                        Copy Data
                    </button>
                    <button class="btn" onclick="this.closest('dialog').close()">Close</button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>close</button>
            </form>
        `;

    document.body.appendChild(modal);
    modal.showModal();

    modal.addEventListener("close", () => {
      modal.remove();
    });
  }

  static viewSource(url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  static copyResult(resultId) {
    const result = window.AnalysisResult?.results.find(
      (r) => r.id === resultId
    );
    if (!result) return;

    const dataText = JSON.stringify(result, null, 2);
    Helper.copyToClipboard(dataText);
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.AnalysisResult = new AnalysisResult();
});
