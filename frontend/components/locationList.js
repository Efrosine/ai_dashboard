// Location List component for managing target locations and suspected accounts
class LocationList {
  constructor() {
    this.locations = [];
    this.suspectedAccounts = [];
    this.container = null;
    this.init();
  }

  init() {
    console.log("📍 Initializing Location List component...");
    this.setupContainer();
    this.loadData();
    this.createInterface();
  }

  setupContainer() {
    // Create container in admin section if it doesn't exist
    const adminSection = document.getElementById("admin");
    if (
      adminSection &&
      !document.getElementById("location-management-section")
    ) {
      const sectionHTML = `
                <div id="location-management-section" class="mt-6">
                    <h3 class="text-xl font-bold mb-4">📍 Target Management</h3>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div id="locations-container">
                            <!-- Locations management will be inserted here -->
                        </div>
                        <div id="suspected-accounts-container">
                            <!-- Suspected accounts management will be inserted here -->
                        </div>
                    </div>
                </div>
            `;
      adminSection.insertAdjacentHTML("beforeend", sectionHTML);
    }
  }

  createInterface() {
    this.createLocationsInterface();
    this.createSuspectedAccountsInterface();
  }

  createLocationsInterface() {
    const container = document.getElementById("locations-container");
    if (!container) return;

    const locationsHTML = `
            <div class="card bg-base-200">
                <div class="card-body">
                    <h4 class="card-title text-lg">Target Locations</h4>
                    
                    <!-- Add Location Form -->
                    <form id="add-location-form" class="mb-4">
                        <div class="join w-full">
                            <input type="text" class="input input-bordered join-item flex-1" 
                                   name="location" placeholder="Enter location (e.g., New York, Central Park)" required />
                            <button type="submit" class="btn btn-primary join-item">Add Location</button>
                        </div>
                    </form>

                    <!-- Locations List -->
                    <div id="locations-list" class="space-y-2 max-h-64 overflow-y-auto">
                        <!-- Locations will be rendered here -->
                    </div>

                    <div class="divider">Quick Actions</div>
                    
                    <div class="flex gap-2">
                        <button class="btn btn-outline btn-sm" onclick="LocationList.bulkImportLocations()">
                            Bulk Import
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="LocationList.exportLocations()">
                            Export List
                        </button>
                    </div>
                </div>
            </div>
        `;

    container.innerHTML = locationsHTML;
    this.setupLocationEventListeners();
    this.renderLocations();
  }

  createSuspectedAccountsInterface() {
    const container = document.getElementById("suspected-accounts-container");
    if (!container) return;

    const accountsHTML = `
            <div class="card bg-base-200">
                <div class="card-body">
                    <h4 class="card-title text-lg">Suspected Accounts</h4>
                    
                    <!-- Add Account Form -->
                    <form id="add-suspected-account-form" class="mb-4">
                        <div class="form-control mb-3">
                            <select class="select select-bordered select-sm" name="platform" required>
                                <option value="">Platform</option>
                                <option value="twitter">Twitter</option>
                                <option value="instagram">Instagram</option>
                                <option value="facebook">Facebook</option>
                                <option value="tiktok">TikTok</option>
                            </select>
                        </div>
                        <div class="join w-full">
                            <input type="text" class="input input-bordered join-item flex-1" 
                                   name="account" placeholder="@username or profile URL" required />
                            <button type="submit" class="btn btn-warning join-item">Add Account</button>
                        </div>
                    </form>

                    <!-- Suspected Accounts List -->
                    <div id="suspected-accounts-list" class="space-y-2 max-h-64 overflow-y-auto">
                        <!-- Suspected accounts will be rendered here -->
                    </div>

                    <div class="divider">Management</div>
                    
                    <div class="flex gap-2">
                        <button class="btn btn-outline btn-sm" onclick="LocationList.bulkImportAccounts()">
                            Bulk Import
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="LocationList.exportAccounts()">
                            Export List
                        </button>
                    </div>
                </div>
            </div>
        `;

    container.innerHTML = accountsHTML;
    this.setupAccountEventListeners();
    this.renderSuspectedAccounts();
  }

  setupLocationEventListeners() {
    const form = document.getElementById("add-location-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.addLocation(new FormData(form).get("location"));
        form.reset();
      });
    }
  }

  setupAccountEventListeners() {
    const form = document.getElementById("add-suspected-account-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        this.addSuspectedAccount(
          formData.get("account"),
          formData.get("platform")
        );
        form.reset();
      });
    }
  }

  loadData() {
    // Load mock data for Phase 1
    this.locations = [
      {
        id: "loc1",
        data: "New York City, Times Square",
        added_at: new Date(Date.now() - 86400000).toISOString(),
        status: "active",
      },
      {
        id: "loc2",
        data: "Los Angeles, Hollywood Boulevard",
        added_at: new Date(Date.now() - 172800000).toISOString(),
        status: "active",
      },
      {
        id: "loc3",
        data: "Chicago, Millennium Park",
        added_at: new Date(Date.now() - 259200000).toISOString(),
        status: "monitoring",
      },
    ];

    this.suspectedAccounts = [
      {
        id: "sus1",
        data: "@suspicious_user_01",
        platform: "twitter",
        added_at: new Date(Date.now() - 43200000).toISOString(),
        status: "monitoring",
        risk_level: "high",
      },
      {
        id: "sus2",
        data: "@potential_threat_ig",
        platform: "instagram",
        added_at: new Date(Date.now() - 86400000).toISOString(),
        status: "flagged",
        risk_level: "medium",
      },
      {
        id: "sus3",
        data: "@watch_this_account",
        platform: "facebook",
        added_at: new Date(Date.now() - 129600000).toISOString(),
        status: "investigating",
        risk_level: "low",
      },
    ];
  }

  addLocation(locationData) {
    if (!locationData?.trim()) {
      Helper.showNotification("Please enter a valid location", "error");
      return;
    }

    // Check for duplicates
    if (
      this.locations.find(
        (loc) => loc.data.toLowerCase() === locationData.toLowerCase()
      )
    ) {
      Helper.showNotification(
        "This location is already in the list",
        "warning"
      );
      return;
    }

    const newLocation = {
      id: Helper.generateId(),
      data: locationData.trim(),
      added_at: new Date().toISOString(),
      status: "active",
    };

    this.locations.unshift(newLocation);
    this.renderLocations();
    Helper.showNotification("Location added successfully", "success");
  }

  addSuspectedAccount(accountData, platform) {
    if (!accountData?.trim() || !platform) {
      Helper.showNotification(
        "Please enter account and select platform",
        "error"
      );
      return;
    }

    // Check for duplicates
    if (
      this.suspectedAccounts.find(
        (acc) =>
          acc.data.toLowerCase() === accountData.toLowerCase() &&
          acc.platform === platform
      )
    ) {
      Helper.showNotification("This account is already in the list", "warning");
      return;
    }

    const newAccount = {
      id: Helper.generateId(),
      data: accountData.trim(),
      platform: platform,
      added_at: new Date().toISOString(),
      status: "monitoring",
      risk_level: "medium",
    };

    this.suspectedAccounts.unshift(newAccount);
    this.renderSuspectedAccounts();
    Helper.showNotification("Suspected account added successfully", "success");
  }

  renderLocations() {
    const container = document.getElementById("locations-list");
    if (!container) return;

    if (this.locations.length === 0) {
      container.innerHTML = `
                <div class="text-center py-4 text-base-content/50">
                    No locations configured
                </div>
            `;
      return;
    }

    const locationsHTML = this.locations
      .map(
        (location) => `
            <div class="flex items-center justify-between p-3 bg-base-300 rounded">
                <div class="flex-1">
                    <div class="font-medium">${Helper.escapeHtml(
                      location.data
                    )}</div>
                    <div class="text-xs text-base-content/70">
                        Added ${Helper.timeAgo(location.added_at)} • 
                        <span class="badge badge-${
                          location.status === "active" ? "success" : "warning"
                        } badge-xs">
                            ${location.status}
                        </span>
                    </div>
                </div>
                <div class="dropdown dropdown-end">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-xs">⋮</div>
                    <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32">
                        <li><a onclick="LocationList.editLocation('${
                          location.id
                        }')">Edit</a></li>
                        <li><a onclick="LocationList.deleteLocation('${
                          location.id
                        }')" class="text-error">Delete</a></li>
                    </ul>
                </div>
            </div>
        `
      )
      .join("");

    container.innerHTML = locationsHTML;
  }

  renderSuspectedAccounts() {
    const container = document.getElementById("suspected-accounts-list");
    if (!container) return;

    if (this.suspectedAccounts.length === 0) {
      container.innerHTML = `
                <div class="text-center py-4 text-base-content/50">
                    No suspected accounts configured
                </div>
            `;
      return;
    }

    const accountsHTML = this.suspectedAccounts
      .map((account) => {
        const riskColors = {
          high: "badge-error",
          medium: "badge-warning",
          low: "badge-success",
        };

        const statusColors = {
          monitoring: "badge-info",
          flagged: "badge-error",
          investigating: "badge-warning",
          cleared: "badge-success",
        };

        return `
                <div class="flex items-center justify-between p-3 bg-base-300 rounded">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="font-medium">${Helper.escapeHtml(
                              account.data
                            )}</span>
                            <span class="badge badge-outline badge-xs">${
                              account.platform
                            }</span>
                        </div>
                        <div class="flex items-center gap-2 text-xs">
                            <span class="text-base-content/70">Added ${Helper.timeAgo(
                              account.added_at
                            )}</span>
                            <span class="badge ${
                              statusColors[account.status]
                            } badge-xs">${account.status}</span>
                            <span class="badge ${
                              riskColors[account.risk_level]
                            } badge-xs">${account.risk_level} risk</span>
                        </div>
                    </div>
                    <div class="dropdown dropdown-end">
                        <div tabindex="0" role="button" class="btn btn-ghost btn-xs">⋮</div>
                        <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                            <li><a onclick="LocationList.viewAccountDetails('${
                              account.id
                            }')">View Details</a></li>
                            <li><a onclick="LocationList.updateRiskLevel('${
                              account.id
                            }')">Update Risk</a></li>
                            <li><a onclick="LocationList.deleteAccount('${
                              account.id
                            }')" class="text-error">Remove</a></li>
                        </ul>
                    </div>
                </div>
            `;
      })
      .join("");

    container.innerHTML = accountsHTML;
  }

  // Static methods for UI interactions
  static editLocation(locationId) {
    const locationList = window.LocationList;
    const location = locationList?.locations.find(
      (loc) => loc.id === locationId
    );
    if (!location) return;

    const newData = prompt("Edit location:", location.data);
    if (newData && newData.trim() !== location.data) {
      location.data = newData.trim();
      locationList.renderLocations();
      Helper.showNotification("Location updated successfully", "success");
    }
  }

  static deleteLocation(locationId) {
    const locationList = window.LocationList;
    if (!locationList) return;

    if (confirm("Are you sure you want to delete this location?")) {
      const index = locationList.locations.findIndex(
        (loc) => loc.id === locationId
      );
      if (index !== -1) {
        locationList.locations.splice(index, 1);
        locationList.renderLocations();
        Helper.showNotification("Location deleted successfully", "success");
      }
    }
  }

  static deleteAccount(accountId) {
    const locationList = window.LocationList;
    if (!locationList) return;

    if (confirm("Are you sure you want to remove this suspected account?")) {
      const index = locationList.suspectedAccounts.findIndex(
        (acc) => acc.id === accountId
      );
      if (index !== -1) {
        locationList.suspectedAccounts.splice(index, 1);
        locationList.renderSuspectedAccounts();
        Helper.showNotification("Account removed successfully", "success");
      }
    }
  }

  static viewAccountDetails(accountId) {
    const account = window.LocationList?.suspectedAccounts.find(
      (acc) => acc.id === accountId
    );
    if (!account) return;

    const modal = document.createElement("dialog");
    modal.className = "modal";
    modal.innerHTML = `
            <div class="modal-box">
                <h3 class="font-bold text-lg mb-4">Account Details</h3>
                <div class="space-y-3">
                    <div><strong>Account:</strong> ${Helper.escapeHtml(
                      account.data
                    )}</div>
                    <div><strong>Platform:</strong> ${account.platform}</div>
                    <div><strong>Status:</strong> ${account.status}</div>
                    <div><strong>Risk Level:</strong> ${
                      account.risk_level
                    }</div>
                    <div><strong>Added:</strong> ${Helper.formatTimestamp(
                      account.added_at
                    )}</div>
                </div>
                <div class="modal-action">
                    <button class="btn" onclick="this.closest('dialog').close()">Close</button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop"><button>close</button></form>
        `;

    document.body.appendChild(modal);
    modal.showModal();
    modal.addEventListener("close", () => modal.remove());
  }

  static updateRiskLevel(accountId) {
    const locationList = window.LocationList;
    const account = locationList?.suspectedAccounts.find(
      (acc) => acc.id === accountId
    );
    if (!account) return;

    const newLevel = prompt(
      "Enter new risk level (low/medium/high):",
      account.risk_level
    );
    if (
      newLevel &&
      ["low", "medium", "high"].includes(newLevel.toLowerCase())
    ) {
      account.risk_level = newLevel.toLowerCase();
      locationList.renderSuspectedAccounts();
      Helper.showNotification("Risk level updated successfully", "success");
    }
  }

  static bulkImportLocations() {
    Helper.showNotification(
      "Bulk import feature will be available in Phase 2",
      "info"
    );
  }

  static exportLocations() {
    const locationList = window.LocationList;
    if (!locationList?.locations.length) {
      Helper.showNotification("No locations to export", "warning");
      return;
    }

    const data = locationList.locations.map((loc) => loc.data).join("\n");
    Helper.copyToClipboard(data);
  }

  static bulkImportAccounts() {
    Helper.showNotification(
      "Bulk import feature will be available in Phase 2",
      "info"
    );
  }

  static exportAccounts() {
    const locationList = window.LocationList;
    if (!locationList?.suspectedAccounts.length) {
      Helper.showNotification("No accounts to export", "warning");
      return;
    }

    const data = locationList.suspectedAccounts
      .map((acc) => `${acc.platform}:${acc.data}`)
      .join("\n");
    Helper.copyToClipboard(data);
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.LocationList = new LocationList();
});
