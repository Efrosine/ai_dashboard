// Model for dummy_accounts table
module.exports = {
  name: "dummy_accounts",
  schema: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    platform ENUM('instagram', 'twitter', 'facebook', 'tiktok', 'linkedin') NOT NULL
  `,
  seed: [
    {
      username: "dummy_ig_user_1",
      password: "encrypted_password_1",
      platform: "instagram",
    },
    {
      username: "dummy_twitter_bot",
      password: "encrypted_password_2",
      platform: "twitter",
    },
    {
      username: "dummy_fb_account",
      password: "encrypted_password_3",
      platform: "facebook",
    },
    {
      username: "dummy_tiktok_user",
      password: "encrypted_password_4",
      platform: "tiktok",
    },
  ],
};
