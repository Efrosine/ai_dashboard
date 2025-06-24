// Model for suspected_accounts table
module.exports = {
  name: "suspected_accounts",
  schema: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    data VARCHAR(255) NOT NULL,
    platform ENUM('instagram', 'x', 'tiktok') DEFAULT 'instagram',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_data (data),
    INDEX idx_platform (platform)
  `,
  seed: [
    { data: "@suspicious_user_01", platform: "x" },
    { data: "@potential_threat_ig", platform: "instagram" },
    { data: "@watch_this_account", platform: "tiktok" },
    { data: "@monitored_activist", platform: "x" },
    { data: "@flagged_user_tiktok", platform: "tiktok" },
  ],
};
