// Dummy Account Form component for managing social media dummy accounts
class DummyAccountForm {
  constructor() {
    this.accounts = [];
    this.form = null;
    this.container = null;
    this.init();
  }

  init() {
    console.log("🔑 Initializing Dummy Account Form component...");
    this.setupContainer();
    this.createForm();
    this.loadAccounts();
  }

  setupContainer() {
    // Create container in admin section if it doesn't exist
    const adminSection = document.getElementById("admin");
    if (adminSection && !document.getElementById("dummy-accounts-section")) {
      const sectionHTML = `
                <div id="dummy-accounts-section" class="mt-6">
                    <h3 class="text-xl font-bold mb-4">🔑 Dummy Accounts Management</h3>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div id="dummy-account-form-container">
                            <!-- Form will be inserted here -->
                        </div>
                        <div id="dummy-accounts-list-container">
                            <!-- Accounts list will be inserted here -->
                        </div>
                    </div>
                </div>
            `;
      adminSection.insertAdjacentHTML("beforeend", sectionHTML);
    }
    this.container = document.getElementById("dummy-account-form-container");
  }

  createForm() {
    if (!this.container) return;

    const formHTML = `
            <div class="card bg-base-200">
                <div class="card-body">
                    <h4 class="card-title text-lg">Add Dummy Account</h4>
                    <form id="dummy-account-form">
                        <div class="form-control mb-4">
                            <label class="label">
                                <span class="label-text">Platform</span>
                            </label>
                            <select class="select select-bordered" name="platform" required>
                                <option value="">Select Platform</option>
                                <option value="twitter">Twitter</option>
                                <option value="instagram">Instagram</option>
                                <option value="facebook">Facebook</option>
                                <option value="tiktok">TikTok</option>
                                <option value="linkedin">LinkedIn</option>
                            </select>
                        </div>

                        <div class="form-control mb-4">
                            <label class="label">
                                <span class="label-text">Username</span>
                            </label>
                            <input type="text" class="input input-bordered" name="username" 
                                   placeholder="Enter username" required />
                        </div>

                        <div class="form-control mb-4">
                            <label class="label">
                                <span class="label-text">Password</span>
                            </label>
                            <input type="password" class="input input-bordered" name="password" 
                                   placeholder="Enter password" required />
                        </div>

                        <div class="form-control mb-4">
                            <label class="label">
                                <span class="label-text">Notes (Optional)</span>
                            </label>
                            <textarea class="textarea textarea-bordered" name="notes" 
                                      placeholder="Additional notes about this account"></textarea>
                        </div>

                        <div class="card-actions justify-end">
                            <button type="button" class="btn btn-ghost" id="clear-form-btn">Clear</button>
                            <button type="submit" class="btn btn-primary">Add Account</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

    this.container.innerHTML = formHTML;
    this.form = document.getElementById("dummy-account-form");
    this.setupFormEventListeners();
  }

  setupFormEventListeners() {
    if (!this.form) return;

    // Form submission
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Clear form button
    const clearBtn = document.getElementById("clear-form-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.form.reset();
      });
    }
  }

  handleSubmit() {
    const formData = new FormData(this.form);
    const accountData = {
      id: Helper.generateId(),
      platform: formData.get("platform"),
      username: formData.get("username"),
      password: formData.get("password"),
      notes: formData.get("notes") || "",
      created_at: new Date().toISOString(),
      status: "active",
    };

    // Validate data
    if (
      !accountData.platform ||
      !accountData.username ||
      !accountData.password
    ) {
      Helper.showNotification("Please fill in all required fields", "error");
      return;
    }

    // Check for duplicate username on same platform
    const duplicate = this.accounts.find(
      (acc) =>
        acc.platform === accountData.platform &&
        acc.username === accountData.username
    );

    if (duplicate) {
      Helper.showNotification(
        "Account with this username already exists on this platform",
        "error"
      );
      return;
    }

    // Add account
    this.addAccount(accountData);

    // Clear form
    this.form.reset();

    Helper.showNotification("Dummy account added successfully", "success");
  }

  addAccount(accountData) {
    this.accounts.push(accountData);
    this.updateAccountsList();

    // In a real app, this would make an API call to save the account
    console.log("Added dummy account:", { ...accountData, password: "***" });
  }

  loadAccounts() {
    // For Phase 1, create some mock accounts for testing
    const mockAccounts = [
      {
        id: "acc1",
        platform: "twitter",
        username: "scraper_bot_01",
        password: "***",
        notes: "Primary scraping account for Twitter",
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        status: "active",
      },
      {
        id: "acc2",
        platform: "instagram",
        username: "monitor_ig_02",
        password: "***",
        notes: "Instagram monitoring account",
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        status: "active",
      },
      {
        id: "acc3",
        platform: "facebook",
        username: "fb_observer_03",
        password: "***",
        notes: "Facebook content observer",
        created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        status: "inactive",
      },
    ];

    this.accounts = mockAccounts;
    this.updateAccountsList();
  }

  updateAccountsList() {
    const listContainer = document.getElementById(
      "dummy-accounts-list-container"
    );
    if (!listContainer) return;

    if (this.accounts.length === 0) {
      listContainer.innerHTML = `
                <div class="card bg-base-200">
                    <div class="card-body text-center">
                        <div class="text-4xl mb-2">🔑</div>
                        <div class="text-base-content/50">No dummy accounts configured</div>
                    </div>
                </div>
            `;
      return;
    }

    const accountsHTML = `
            <div class="card bg-base-200">
                <div class="card-body">
                    <h4 class="card-title text-lg mb-4">Configured Accounts (${
                      this.accounts.length
                    })</h4>
                    <div class="space-y-3 max-h-96 overflow-y-auto">
                        ${this.accounts
                          .map((account) => this.createAccountCard(account))
                          .join("")}
                    </div>
                </div>
            </div>
        `;

    listContainer.innerHTML = accountsHTML;
  }

  createAccountCard(account) {
    const platformColors = {
      twitter: "badge-info",
      instagram: "badge-secondary",
      facebook: "badge-primary",
      tiktok: "badge-accent",
      linkedin: "badge-neutral",
    };

    const statusColors = {
      active: "badge-success",
      inactive: "badge-error",
      pending: "badge-warning",
    };

    return `
            <div class="card bg-base-300 p-3">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="badge ${
                              platformColors[account.platform] ||
                              "badge-outline"
                            } badge-sm">
                                ${account.platform}
                            </span>
                            <span class="badge ${
                              statusColors[account.status] || "badge-outline"
                            } badge-sm">
                                ${account.status}
                            </span>
                        </div>
                        <div class="font-medium">${Helper.escapeHtml(
                          account.username
                        )}</div>
                        <div class="text-xs text-base-content/70">
                            Added ${Helper.timeAgo(account.created_at)}
                        </div>
                        ${
                          account.notes
                            ? `
                            <div class="text-xs mt-1 text-base-content/80">
                                ${Helper.escapeHtml(account.notes)}
                            </div>
                        `
                            : ""
                        }
                    </div>
                    <div class="dropdown dropdown-end">
                        <div tabindex="0" role="button" class="btn btn-ghost btn-xs">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01"></path>
                            </svg>
                        </div>
                        <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32">
                            <li><a onclick="DummyAccountForm.editAccount('${
                              account.id
                            }')">Edit</a></li>
                            <li><a onclick="DummyAccountForm.toggleStatus('${
                              account.id
                            }')">
                                ${
                                  account.status === "active"
                                    ? "Deactivate"
                                    : "Activate"
                                }
                            </a></li>
                            <li><a onclick="DummyAccountForm.deleteAccount('${
                              account.id
                            }')" class="text-error">Delete</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
  }

  static editAccount(accountId) {
    const account = window.DummyAccountForm?.accounts.find(
      (acc) => acc.id === accountId
    );
    if (!account) return;

    // Fill form with account data for editing
    const form = document.getElementById("dummy-account-form");
    if (form) {
      form.platform.value = account.platform;
      form.username.value = account.username;
      form.password.value = ""; // Don't populate password for security
      form.notes.value = account.notes || "";

      // Change submit button text
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = "Update Account";
        submitBtn.dataset.editId = accountId;
      }
    }

    Helper.showNotification("Account loaded for editing", "info");
  }

  static toggleStatus(accountId) {
    const accountForm = window.DummyAccountForm;
    if (!accountForm) return;

    const account = accountForm.accounts.find((acc) => acc.id === accountId);
    if (!account) return;

    account.status = account.status === "active" ? "inactive" : "active";
    accountForm.updateAccountsList();

    Helper.showNotification(
      `Account ${account.status === "active" ? "activated" : "deactivated"}`,
      "success"
    );
  }

  static deleteAccount(accountId) {
    const accountForm = window.DummyAccountForm;
    if (!accountForm) return;

    const accountIndex = accountForm.accounts.findIndex(
      (acc) => acc.id === accountId
    );
    if (accountIndex === -1) return;

    // Confirm deletion
    if (confirm("Are you sure you want to delete this dummy account?")) {
      accountForm.accounts.splice(accountIndex, 1);
      accountForm.updateAccountsList();
      Helper.showNotification("Account deleted successfully", "success");
    }
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.DummyAccountForm = new DummyAccountForm();
});
