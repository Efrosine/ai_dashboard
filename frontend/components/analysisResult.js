// Analysis Result component for displaying social media analysis results - Phase 3 Enhanced
class AnalysisResult {
  constructor() {
    this.results = [];
    this.filteredResults = [];
    this.container = null;
    this.currentFilter = 'all';
    this.autoRefresh = true;
    this.refreshInterval = null;
    this.init();
  }

  init() {
    console.log("📊 Initializing Analysis Result component Phase 3...");
    this.setupContainer();
    this.setupEventListeners();
    this.loadResults();
    this.startAutoRefresh();
    this.addMessage("info", "Social media analysis component initialized", "SOCIAL");
  }

  setupEventListeners() {
    // Filter controls
    const filterSelect = document.getElementById('threat-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.currentFilter = e.target.value;
        this.filterResults();
      });
    }

    // Search functionality
    const searchInput = document.getElementById('search-accounts');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchResults(e.target.value);
      });
    }
  }

  startAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    if (this.autoRefresh) {
      this.refreshInterval = setInterval(() => {
        this.refreshResults();
      }, 45000); // Refresh every 45 seconds
    }
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  refreshResults() {
    this.addMessage("info", "Auto-refreshing social media analysis...", "SOCIAL");
    this.loadResults();
  }

  setupContainer() {
    // Create enhanced results container if it doesn't exist
    const socialSection = document.getElementById("social-media");
    if (socialSection && !document.getElementById("analysis-results-container")) {
      const resultsHTML = `
        <div class="mt-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 class="text-xl font-bold">📊 Analysis Results</h3>
            
            <!-- Controls -->
            <div class="flex flex-wrap gap-2">
              <select id="threat-filter" class="select select-sm select-bordered">
                <option value="all">All Threats</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
                <option value="weapons">Weapons</option>
                <option value="violence">Violence</option>
              </select>
              
              <input id="search-accounts" type="text" placeholder="Search accounts..." class="input input-sm input-bordered" />
              
              <button class="btn btn-sm btn-outline" onclick="window.AnalysisResult.exportResults()">
                📄 Export
              </button>
              
              <button class="btn btn-sm btn-primary" onclick="window.AnalysisResult.refreshResults()">
                🔄 Refresh
              </button>
            </div>
          </div>
          
          <!-- Statistics -->
          <div class="stats stats-horizontal shadow mb-6 w-full">
            <div class="stat">
              <div class="stat-title">Total Analyzed</div>
              <div class="stat-value text-2xl" id="total-analyzed">0</div>
              <div class="stat-desc">Social media posts</div>
            </div>
            <div class="stat">
              <div class="stat-title">Threats Detected</div>
              <div class="stat-value text-2xl text-error" id="threats-detected">0</div>
              <div class="stat-desc">High priority alerts</div>
            </div>
            <div class="stat">
              <div class="stat-title">Risk Level</div>
              <div class="stat-value text-lg" id="current-risk-level">Low</div>
              <div class="stat-desc">Current assessment</div>
            </div>
          </div>
          
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
      this.addMessage("info", "Loading social media analysis results...", "SOCIAL");
      
      // Phase 3: Enhanced mock analysis results with more variety
      const mockResults = [
        {
          id: 1,
          account: "@suspicious_user_1",
          platform: "twitter",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          analysis: {
            violence_detected: true,
            confidence: 0.92,
            content_type: "image",
            flags: ["weapon_detected", "aggressive_behavior", "threat_language"],
            summary: "High-confidence weapon detection in social media post with threatening language",
            risk_level: "high",
            content_preview: "Posted image showing weapon with threatening caption"
          },
          source_url: "https://twitter.com/suspicious_user_1/status/123456",
          location: "Downtown Area",
          engagement: { likes: 15, shares: 3, comments: 8 }
        },
        {
          id: 2,
          account: "@watch_account_2",
          platform: "instagram",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          analysis: {
            violence_detected: true,
            confidence: 0.76,
            content_type: "video",
            flags: ["aggressive_behavior", "group_activity"],
            summary: "Potential violent group activity detected in video content",
            risk_level: "medium",
            content_preview: "Video showing group gathering with concerning behavior"
          },
          source_url: "https://instagram.com/watch_account_2/post/789012",
          location: "City Center",
          engagement: { likes: 42, shares: 12, comments: 23 }
        },
        {
          id: 3,
          account: "@flagged_user_3",
          platform: "facebook",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          analysis: {
            violence_detected: false,
            confidence: 0.34,
            content_type: "text",
            flags: ["suspicious_language"],
            summary: "Suspicious language patterns detected but below threat threshold",
            risk_level: "low",
            content_preview: "Text post with concerning language patterns"
          },
          source_url: "https://facebook.com/flagged_user_3/posts/345678",
          location: "Suburb Area",
          engagement: { likes: 7, shares: 1, comments: 4 }
        }
      ];

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      this.results = mockResults;
      this.filteredResults = [...mockResults];
      this.renderResults();
      this.updateStatistics();
      
      const successMsg = "Loaded " + mockResults.length + " analysis results";
      this.addMessage("success", successMsg, "SOCIAL");
    } catch (error) {
      console.error("Error loading analysis results:", error);
      this.addMessage("error", "Failed to load analysis results: " + error.message, "SOCIAL");
      Helper.showNotification("Failed to load analysis results", "error");
    }
  }

  updateStatistics() {
    const totalAnalyzed = document.getElementById("total-analyzed");
    const threatsDetected = document.getElementById("threats-detected");
    const currentRiskLevel = document.getElementById("current-risk-level");

    if (totalAnalyzed) {
      totalAnalyzed.textContent = this.results.length;
    }

    const highRiskCount = this.results.filter(r => r.analysis.risk_level === 'high').length;
    if (threatsDetected) {
      threatsDetected.textContent = highRiskCount;
    }

    // Calculate overall risk level
    const riskLevel = highRiskCount > 2 ? 'High' : highRiskCount > 0 ? 'Medium' : 'Low';
    if (currentRiskLevel) {
      currentRiskLevel.textContent = riskLevel;
      const colorClass = riskLevel === 'High' ? 'text-error' : riskLevel === 'Medium' ? 'text-warning' : 'text-success';
      currentRiskLevel.className = "stat-value text-lg " + colorClass;
    }

    // Update system health
    if (window.dashboard) {
      window.dashboard.systemHealth.analyses = this.results.length;
      window.dashboard.systemHealth.threatLevel = riskLevel;
      window.dashboard.updateSystemStats();
    }
  }

  renderResults() {
    if (!this.container) return;

    if (this.filteredResults.length === 0) {
      this.container.innerHTML = `
        <div class="text-center py-12">
          <div class="text-6xl mb-4">🔍</div>
          <h3 class="text-lg font-semibold mb-2">No Results Found</h3>
          <p class="text-base-content/70">No analysis results match your current filters</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = "";

    this.filteredResults.forEach((result) => {
      const resultElement = this.createResultElement(result);
      this.container.appendChild(resultElement);
    });
  }

  createResultElement(result) {
    const riskColorClass = 
      result.analysis.risk_level === 'high' ? 'badge-error' :
      result.analysis.risk_level === 'medium' ? 'badge-warning' : 'badge-success';

    const platformIcon = this.getPlatformIcon(result.platform);
    const flagsHtml = result.analysis.flags.map(flag => 
      '<span class="badge badge-outline badge-xs">' + flag.replace('_', ' ') + '</span>'
    ).join(' ');

    const resultHTML = `
      <div class="card bg-base-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <div class="card-body p-4">
          <div class="flex justify-between items-start mb-3">
            <div class="flex items-center gap-2">
              <span class="text-2xl">${platformIcon}</span>
              <div>
                <h4 class="font-bold text-sm">${Helper.escapeHtml(result.account)}</h4>
                <p class="text-xs text-base-content/70">${result.platform} • ${Helper.timeAgo(result.timestamp)}</p>
              </div>
            </div>
            <div class="badge ${riskColorClass} badge-sm">${result.analysis.risk_level.toUpperCase()}</div>
          </div>

          <div class="mb-3">
            <p class="text-sm mb-2">${Helper.escapeHtml(result.analysis.summary)}</p>
            <p class="text-xs text-base-content/60">${Helper.escapeHtml(result.analysis.content_preview)}</p>
          </div>

          <div class="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div class="stat bg-base-100 rounded p-2">
              <div class="stat-title text-xs">Confidence</div>
              <div class="stat-value text-sm">${Math.round(result.analysis.confidence * 100)}%</div>
            </div>
            <div class="stat bg-base-100 rounded p-2">
              <div class="stat-title text-xs">Location</div>
              <div class="stat-value text-xs">${result.location}</div>
            </div>
          </div>

          <div class="mb-3">
            <div class="text-xs font-medium mb-1">Flags:</div>
            <div class="flex flex-wrap gap-1">${flagsHtml}</div>
          </div>

          <div class="flex justify-between items-center">
            <div class="text-xs text-base-content/70">
              ${result.engagement.likes} likes • ${result.engagement.shares} shares
            </div>
            <div class="flex gap-1">
              <button class="btn btn-xs btn-primary" onclick="window.AnalysisResult.viewDetails(${result.id})">
                👁️ Details
              </button>
              <button class="btn btn-xs btn-outline" onclick="window.AnalysisResult.exportSingle(${result.id})">
                📄 Export
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const resultElement = document.createElement("div");
    resultElement.innerHTML = resultHTML;
    return resultElement.firstElementChild;
  }

  getPlatformIcon(platform) {
    const icons = {
      'twitter': '🐦',
      'instagram': '📷',
      'facebook': '👥',
      'telegram': '✈️',
      'tiktok': '🎵',
      'youtube': '📺',
      'linkedin': '💼'
    };
    return icons[platform] || '📱';
  }

  filterResults() {
    if (this.currentFilter === 'all') {
      this.filteredResults = [...this.results];
    } else if (['high', 'medium', 'low'].includes(this.currentFilter)) {
      this.filteredResults = this.results.filter(r => r.analysis.risk_level === this.currentFilter);
    } else if (this.currentFilter === 'weapons') {
      this.filteredResults = this.results.filter(r => 
        r.analysis.flags.some(flag => flag.includes('weapon'))
      );
    } else if (this.currentFilter === 'violence') {
      this.filteredResults = this.results.filter(r => r.analysis.violence_detected);
    }
    
    this.renderResults();
    this.addMessage("info", "Filtered to " + this.filteredResults.length + " results", "SOCIAL");
  }

  searchResults(query) {
    if (!query.trim()) {
      this.filteredResults = [...this.results];
    } else {
      const searchTerm = query.toLowerCase();
      this.filteredResults = this.results.filter(result => 
        result.account.toLowerCase().includes(searchTerm) ||
        result.analysis.summary.toLowerCase().includes(searchTerm) ||
        result.location.toLowerCase().includes(searchTerm) ||
        result.analysis.flags.some(flag => flag.toLowerCase().includes(searchTerm))
      );
    }
    
    this.renderResults();
  }

  updateResults(data) {
    const newResult = data.data;
    if (newResult) {
      this.results.unshift(newResult);
      this.filterResults();
      
      // Show notification for new results
      if (newResult.analysis.risk_level === 'high') {
        Helper.showNotification("High-risk content detected from " + newResult.account, "error", 8000);
      }
      
      this.addMessage("warning", "New analysis result: " + newResult.account + " - " + newResult.analysis.risk_level + " risk", "SOCIAL");
    }
  }

  viewDetails(resultId) {
    const result = this.results.find(r => r.id === resultId);
    if (!result) return;

    const modal = document.createElement('dialog');
    modal.className = 'modal modal-open';
    const riskColorClass = result.analysis.risk_level === 'high' ? 'text-error' : result.analysis.risk_level === 'medium' ? 'text-warning' : 'text-success';
    
    modal.innerHTML = `
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-lg mb-4">📊 Analysis Details - ${Helper.escapeHtml(result.account)}</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title">Platform</div>
            <div class="stat-value text-lg">${result.platform}</div>
            <div class="stat-desc">${this.getPlatformIcon(result.platform)} Social media platform</div>
          </div>
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title">Risk Level</div>
            <div class="stat-value text-lg ${riskColorClass}">${result.analysis.risk_level.toUpperCase()}</div>
            <div class="stat-desc">${Math.round(result.analysis.confidence * 100)}% confidence</div>
          </div>
        </div>

        <div class="mb-4">
          <h4 class="font-semibold mb-2">Analysis Summary</h4>
          <p class="text-sm bg-base-200 p-3 rounded">${Helper.escapeHtml(result.analysis.summary)}</p>
        </div>

        <div class="mb-4">
          <h4 class="font-semibold mb-2">Content Preview</h4>
          <p class="text-sm bg-base-200 p-3 rounded">${Helper.escapeHtml(result.analysis.content_preview)}</p>
        </div>

        <div class="modal-action">
          <button class="btn btn-outline" onclick="window.AnalysisResult.exportSingle(${result.id})">📄 Export Details</button>
          <a href="${result.source_url}" target="_blank" class="btn btn-primary">🔗 View Source</a>
          <form method="dialog">
            <button class="btn">Close</button>
          </form>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    `;
    
    document.body.appendChild(modal);
    modal.showModal();
    modal.addEventListener('close', () => modal.remove());
  }

  exportResults() {
    const csv = [
      'ID,Account,Platform,Timestamp,Risk Level,Confidence,Summary,Location,Flags,Likes,Shares,Comments',
      ...this.filteredResults.map(r => 
        r.id + ',"' + r.account + '","' + r.platform + '","' + r.timestamp + '","' + r.analysis.risk_level + '",' + r.analysis.confidence + ',"' + r.analysis.summary + '","' + r.location + '","' + r.analysis.flags.join('; ') + '",' + r.engagement.likes + ',' + r.engagement.shares + ',' + r.engagement.comments
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'social-media-analysis-' + new Date().toISOString().split('T')[0] + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.addMessage("success", "Exported " + this.filteredResults.length + " analysis results", "SOCIAL");
  }

  exportSingle(resultId) {
    const result = this.results.find(r => r.id === resultId);
    if (!result) return;
    
    const data = {
      analysis_details: result,
      export_timestamp: new Date().toISOString(),
      export_type: 'single_result'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis-' + result.account.replace('@', '') + '-' + result.id + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.addMessage("success", "Exported analysis details for " + result.account, "SOCIAL");
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
  window.AnalysisResult = new AnalysisResult();
});
