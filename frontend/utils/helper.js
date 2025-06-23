// Helper utility functions
class Helper {
  // Format timestamp to readable string
  static formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  // Format time ago (e.g., "2 minutes ago")
  static timeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diff = now - past;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
  }

  // Generate unique ID
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Validate URL
  static isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Escape HTML to prevent XSS
  static escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Show notification toast
  static showNotification(message, type = "info", duration = 3000) {
    const toast = document.createElement("div");
    toast.className = `alert alert-${type} fixed top-4 right-4 w-auto max-w-sm z-50 shadow-lg`;
    toast.innerHTML = `
            <div class="flex items-center">
                <span>${this.escapeHtml(message)}</span>
                <button class="btn btn-sm btn-ghost ml-2" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;

    document.body.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, duration);

    return toast;
  }

  // Loading state management
  static showLoading(element, text = "Loading...") {
    if (!element) return;

    element.dataset.originalContent = element.innerHTML;
    element.innerHTML = `
            <span class="loading loading-spinner loading-sm"></span>
            ${text}
        `;
    element.disabled = true;
  }

  static hideLoading(element) {
    if (!element) return;

    element.innerHTML = element.dataset.originalContent || element.innerHTML;
    element.disabled = false;
    delete element.dataset.originalContent;
  }

  // Debounce function
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Copy text to clipboard
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showNotification("Copied to clipboard!", "success");
      return true;
    } catch (error) {
      console.error("Failed to copy:", error);
      this.showNotification("Failed to copy to clipboard", "error");
      return false;
    }
  }

  // Format file size
  static formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Color generator for charts/avatars
  static generateColor(seed) {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E9",
    ];

    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }

  // Environment detection
  static getEnvironment() {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "development";
    }
    return "production";
  }

  // Browser detection
  static getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = "Unknown";

    if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari")) browser = "Safari";
    else if (ua.includes("Edge")) browser = "Edge";

    return {
      browser,
      userAgent: ua,
      language: navigator.language,
      platform: navigator.platform,
    };
  }
}

// Export for global use
window.Helper = Helper;
