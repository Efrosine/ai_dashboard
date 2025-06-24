// Model for dummy_accounts table
module.exports = {
  name: "dummy_accounts",
  schema: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    platform ENUM('instagram', 'x', 'tiktok') NOT NULL,
    notes TEXT,
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_account (username, platform),
    INDEX idx_platform (platform),
    INDEX idx_status (status)
  `,
  seed: [
    {
      username: "dummy_scraper_01",
      password: "encrypted_password_x_01",
      platform: "x",
      notes: "Primary scraping account for X monitoring",
      status: "active",
    },
    {
      username: "dummy_ig_monitor",
      password: "encrypted_password_ig_01",
      platform: "instagram",
      notes: "Instagram monitoring account for location-based scraping",
      status: "active",
    },
    {
      username: "backup_x_bot",
      password: "encrypted_password_x_02",
      platform: "x",
      notes: "Backup account in case primary gets flagged",
      status: "inactive",
    },
    {
      username: "tiktok_observer_01",
      password: "encrypted_password_tiktok_01",
      platform: "tiktok",
      notes: "TikTok monitoring for trending content analysis",
      status: "active",
    },
    {
      username: "tiktok_backup_02",
      password: "encrypted_password_tiktok_02",
      platform: "tiktok",
      notes: "Secondary TikTok account for content monitoring",
      status: "banned",
    },
  ],
};
