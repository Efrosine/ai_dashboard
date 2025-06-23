// Model for suspected_accounts table
module.exports = {
  name: "suspected_accounts",
  schema: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    data VARCHAR(255) NOT NULL
  `,
  seed: [
    { data: "suspicious_account_1" },
    { data: "flagged_user_xyz" },
    { data: "potential_threat_account" },
    { data: "monitored_activist_group" },
  ],
};
